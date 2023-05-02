import { Injectable } from '@nestjs/common';
import archiver from 'archiver';
import * as fs from 'fs';
import path from 'path';
import util from 'util';

import { CorePathService } from '~core/services';

import { LogService } from './log.service';

const oneDayInMilliseconds = 1 * 24 * 60 * 60 * 1000;

@Injectable()
export class LogRotateService {
  private isProcess = false;
  private readonly pathToLogs;

  constructor(
    private readonly corePathService: CorePathService,
    private readonly logger: LogService,
  ) {
    this.logger.setContext(this.constructor.name);
    this.pathToLogs = this.corePathService.getPathToLogs();
  }

  public async rotateLogs() {
    this.logger.debug('Log rotation check started');

    if (this.isProcess) {
      return;
    }

    try {
      this.isProcess = true;

      this.recreateLogs();
      await this.archiveLogs();
    } catch (error) {
      this.logger.error(`Rotate logs error: ${util.inspect(error)}`);
    } finally {
      this.isProcess = false;
    }
    this.logger.debug('Log rotation finished');
  }

  private recreateLogs() {
    /*
      TODO: Add sysVar for check age of logs every day
      http://web.archive.org/web/20091224090526/http://support.microsoft.com/kb/172190
    */
    LogService.close();

    const files = fs.readdirSync(this.pathToLogs, { withFileTypes: true });

    for (const logFile of files) {
      const pathToLog = path.resolve(this.pathToLogs, logFile.name);
      const fileInfo = fs.statSync(pathToLog);
      const { name, ext } = path.parse(pathToLog);

      if (ext === '.log' && new Date().valueOf() - fileInfo.birthtime.valueOf() > oneDayInMilliseconds) {
        fs.renameSync(path.resolve(this.pathToLogs, logFile.name), path.resolve(this.pathToLogs, `${name}-copy.log`));
      }
    }

    LogService.createTransport();
  }

  private async archiveLogs() {
    const files = fs.readdirSync(this.pathToLogs, { withFileTypes: true });

    for (const logFile of files) {
      if (!logFile.name.includes('copy')) {
        continue;
      }

      const archiveLogPath = path.resolve(this.pathToLogs, `${logFile.name.split('-')[0]}-${new Date().toISOString().replace(/\:/g, '_')}.zip`);
      const output = fs.createWriteStream(archiveLogPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.on('error', (err) => {
        this.logger.error(`Archive error event: ${util.inspect(err)}`);
      });
      output.on('error', (err) => {
        this.logger.error(`Output error event: ${util.inspect(err)}`);
      });

      archive.pipe(output);
      archive.file(path.resolve(this.pathToLogs, logFile.name), { name: logFile.name.replace('-copy', '') });

      await archive.finalize();

      fs.rmSync(path.resolve(this.pathToLogs, logFile.name));
    }
  }
}
