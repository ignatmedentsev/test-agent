import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import * as fs from 'fs';
import mapValues from 'lodash/mapValues';
import type { TransformableInfo } from 'logform';
import path from 'path';
import type winston from 'winston';
import { createLogger, format, transports } from 'winston';

import { PathService } from '~agent/services';

const DEFAULT_CONTEXT = 'Agent';

const FORBIDDEN_TO_LOG = [
  'agentKey',
  'ca',
  'cert',
  'key',
  'newPassword',
  'password',
  'refreshToken',
  'secretKey',
  'sshKey',
  'token',
  'publicPacsServerPublicKey',
];

function formatLogMessage(info: TransformableInfo) {
  const { level, timestamp } = info;
  let message = info.message;

  if (message === undefined) {
    message = 'undefined';
  }
  if (typeof message !== 'string') {
    message = JSON.stringify(message);
  }
  message = message.replace(/[\r\n]+/g, ' >> ');

  return `${timestamp} <${level}> ${message}`;
}

@Injectable({ scope: Scope.TRANSIENT })
export class LogService extends ConsoleLogger {
  private static logger: winston.Logger;
  private static pathLogs = '';
  private static readonly formats = [
    format.align(),
    format.timestamp(),
    format.printf(formatLogMessage),
  ];

  constructor(
    private readonly pathService: PathService,
    context = DEFAULT_CONTEXT,
  ) {
    super(context ?? '');

    if (!LogService.logger) {
      LogService.pathLogs = this.pathService.getPathToLogs();
      LogService.createLogger();
    }
  }

  public info(message: string) {
    LogService.logger.info(`[${this.context}] ${message}`);
  }

  public override log(message: string) {
    LogService.logger.info(`[${this.context}] ${message}`);
  }

  public override debug(message: string) {
    LogService.logger.debug(`[${this.context}] ${message}`);
  }

  public override warn(message: string) {
    LogService.logger.warn(`[${this.context}] ${message}`);
  }

  public override error(message: string, trace?: string) {
    LogService.logger.error(`[${this.context}] ${message} ${trace ? ': ' + trace : ''}`);
  }

  public static log(message: string, context = DEFAULT_CONTEXT) {
    LogService.logger.info(`[${context}] ${message}`);
  }

  public static debug(message: any, context = DEFAULT_CONTEXT) {
    LogService.logger.debug(`[${context || '?'}] ${message}`);
  }

  public static error(message: any, trace?: string, context = DEFAULT_CONTEXT) {
    LogService.logger.error(`[${context || '?'}] ${message}: ${trace ? ': ' + trace : ''}`);
  }

  public static close() {
    LogService.logger.close();
  }

  public static prepareData(data: object | string) {
    if (typeof data === 'string') {
      const json = this.tryParseJSONObject(data);

      if (!json) {
        return data;
      }

      data = json;
    }

    return JSON.stringify(LogService.replaceForbiddenFields(data));
  }

  public prepareData(data: object | string) {
    return LogService.prepareData(data);
  }

  private static createLogger() {
    LogService.logger = createLogger({ format: format.combine(...this.formats) });

    this.createTransport();

    return LogService.logger;
  }

  public static createTransport() {
    let paths = new Array<fs.Dirent>();

    if (fs.existsSync(LogService.pathLogs)) {
      paths = fs.readdirSync(LogService.pathLogs, { withFileTypes: true }).filter(
        path => !path.name.includes('copy') && !path.name.includes('zip'),
      );
    }

    LogService.logger.add(new (transports.File)({
      filename: path.join(LogService.pathLogs, this.getNameForLogPath(paths, 'info')),
      level: 'info',
      handleExceptions: true,
    }));
    LogService.logger.add(new (transports.File)({
      filename: path.join(LogService.pathLogs, this.getNameForLogPath(paths, 'debug')),
      level: 'debug',
      handleExceptions: true,
    }));
    LogService.logger.add(new (transports.File)({
      filename: path.join(LogService.pathLogs, this.getNameForLogPath(paths, 'error')),
      level: 'error',
      handleExceptions: true,
    }));

    LogService.logger.add(new (transports.Console)({
      level: 'debug',
      handleExceptions: true,
      format: format.combine(format.colorize({ message: true, level: true }), ...this.formats),
    }));
  }

  private static getNameForLogPath(paths: fs.Dirent[], name: 'info' | 'debug' | 'error') {
    return paths.find(path => path.name.includes(name))?.name || `${name}-${new Date().toISOString().replace(/\:/g, '_')}.log`;
  }

  private static replaceForbiddenFields(object: any): any {
    return mapValues(object, (value, key) => {
      if (value !== null && typeof value === 'object') {
        return this.replaceForbiddenFields(value);
      } else {
        return !FORBIDDEN_TO_LOG.includes(key) ? value : '***';
      }
    });
  }

  private static tryParseJSONObject(jsonString: string) {
    try {
      const o = JSON.parse(jsonString);

      if (o && typeof o === 'object') {
        return o;
      }
    } catch (e) { }

    return;
  }
}
