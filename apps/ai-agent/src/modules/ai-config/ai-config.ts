import fs from 'fs';
import merge from 'lodash/merge';
import util from 'util';

import { platformUrls } from '~common/constants';
import { EAiSendType } from '~common/enums';
import { EPacsFileUploaderType } from '~common/enums';
import type { IConfig } from '~common/interfaces';
import { LogService } from '~core/log';

import { AiPathService } from '../ai-path';

interface IAgentConfig extends IConfig {
  aiSendType: EAiSendType;
  ghostScriptPath: string;
  vetAi?: IVetAiOptions;
}

interface IVetAiOptions {
  hostUrl: string;
  authKey: string;
  subscriptionId: string;
  deviceId: string;
  aiServiceId: string;
}

const pathService = new AiPathService();

const defaultAiAgentConfig: IAgentConfig = {
  apiUrl: process.env.NODE_ENV === 'dev'
    ? platformUrls.localhost
    : platformUrls.prod,
  pacs: {
    aet: 'NANOX',
    port: 9999,
    storagePath: pathService.getDefaultPathToStorage(),
    dicomProcessorItemDelay: 300,
    scp: {
      connectTimeout: 60000,
      associationTimeout: 30000,
      pduTimeout: 30000,
    },
  },
  storescu: {
    connectTimeout: 60000,
    associationTimeout: 30000,
    pduTimeout: 30000,
    fragmentMultiframe: false,
  },
  httpRequestTimeout: 180000,
  httpsEnforced: true,
  pacsFileUploadProtocol: EPacsFileUploaderType.HTTP,
  allowInsecureDimsePacsFileUpload: false,
  checkTlsTimeout: 10000,
  httpRetryOptions: {
    retries: 3,
    retryDelay: 2000,
  },
  ghostScriptPath: '/usr/bin/gs',
  aiSendType: EAiSendType.PUSH,
};

export function loadConfiguration() {
  const configPath = pathService.getPathToConfig();

  if (!fs.existsSync(configPath)) {
    throw new Error(`Config not file found: ${configPath}`);
  }
  const config = loadUserConfig(configPath);
  LogService.debug(`Config file: ${configPath}, config: ${LogService.prepareData(config)}`);
  if (!config.key) {
    throw new Error('No api key found in config');
  }

  return config;
}

function loadUserConfig(configPath: string) {
  return merge(defaultAiAgentConfig, loadConfig(configPath));
}

function loadConfig(configPath: string) {
  try {
    const data = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as unknown;

    if (isConfig(data)) {
      return data;
    } else {
      LogService.log(`Config file is malformed: ${LogService.prepareData(data as object)}.`
       + ` Using default: ${LogService.prepareData(defaultAiAgentConfig)}`);

      return defaultAiAgentConfig;
    }
  } catch (error) {
    LogService.log(`Error while reading user config file: ${util.inspect(error)}`);

    return defaultAiAgentConfig;
  }
}

function isConfig(config: unknown): config is IConfig {
  return !Array.isArray(config) && typeof config === 'object';
}
