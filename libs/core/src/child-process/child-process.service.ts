import { Injectable } from '@nestjs/common';
import type { ChildProcess } from 'child_process';
import { spawn } from 'child_process';
import debounce from 'lodash/debounce';

import { LogService } from '~core/log';

const KILLER_TIMEOUT = 180000;

class TimeoutKiller {
  public static timeout: number = KILLER_TIMEOUT;

  private childProcess: ChildProcess;
  private cb: Function;

  private debounceTimeout = debounce(() => {
    if (!this.childProcess.killed) {
      this.childProcess.kill();
      this.cb(new Error(`Child process pid=${this.childProcess.pid} was killed by timeout`));
    }
  }, TimeoutKiller.timeout);

  constructor(childProcess: ChildProcess, cb: Function) {
    this.childProcess = childProcess;
    this.cb = cb;
    this.debounceTimeout();
  }

  public update() {
    this.debounceTimeout();
  }

  public delete() {
    this.debounceTimeout.cancel();
  }
}

export class ErrorSpawnHandler {
  private stdoutCallback: Function | undefined;
  private stderrCallback: Function | undefined;

  private rejectFn: Function;

  constructor(stdoutCallback?: Function, stderrCallback?: Function) {
    this.stdoutCallback = stdoutCallback;
    this.stderrCallback = stderrCallback;
  }

  public setPromiseReject(rejectFn: Function) {
    this.rejectFn = rejectFn;
  }

  public stdoutHandler(stdout: any) {
    if (!this.stdoutCallback) {
      return true;
    }
    const error = this.stdoutCallback(stdout);
    if (error && this.rejectFn) {
      this.rejectFn(new Error(error));

      return false;
    }

    return true;
  }

  public stderrHandler(stderr: any) {
    const isError = !this.stderrCallback || this.stderrCallback(stderr);
    if (isError && this.rejectFn) {
      this.rejectFn(new Error(stderr));

      return true;
    }

    return false;
  }
}

@Injectable()
export class ChildProcessService {
  constructor(
    private readonly logger: LogService,
  ) {}

  public async runSpawn(
    command: string,
    args: string[],
    errorHandler: ErrorSpawnHandler = new ErrorSpawnHandler(),
    timeout: number = KILLER_TIMEOUT,
  ) {
    return new Promise((resolve, reject) => {
      let isError = false;
      const responseArr: Buffer[] = [];
      const childProcess = spawn(command, args);

      TimeoutKiller.timeout = timeout;
      const timeoutKiller = new TimeoutKiller(childProcess, (payload: Error) => reject(payload));

      errorHandler.setPromiseReject(reject);

      childProcess.stdout.on('data', (stdout) => {
        if (!errorHandler.stdoutHandler(stdout)) {
          timeoutKiller.delete();

          return;
        }
        responseArr.push(stdout);
        timeoutKiller.update();
      });

      childProcess.stderr.on('data', (stderr) => {
        const errMsg = `stderr from '${command}': ${stderr}`;
        if (errorHandler.stderrHandler(stderr)) {
          isError = true;
          timeoutKiller.delete();
          this.logger.error(errMsg);
        } else {
          this.logger.debug(errMsg);
        }
      });

      childProcess.on('error', (error) => {
        isError = true;
        this.logger.error(`'${command}': ${error.message}`);
        timeoutKiller.delete();
        reject(new Error(error.message));
      });

      childProcess.on('close', (code) => {
        if (code !== 0) {
          if (!isError) {
            const msg = `'${command}' is closed with error code ${code}`;

            this.logger.error(msg);
            timeoutKiller.delete();
            reject(new Error(msg));
          }

          return;
        }
        timeoutKiller.delete();

        resolve(Buffer.concat(responseArr).toString());
      });
    });
  }
}
