import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import stream from 'stream';
import util from 'util';

import { AiAgentApiClientService } from '~ai-agent/modules/ai-agent-api-client';
import { AiAgentConfigService, AiAgentPathService } from '~ai-agent/services';
import type { IDicomItem, IUids } from '~common/interfaces';
import type { TSendPlatformDicomPayload } from '~common/types';
import { LogService } from '~core/log';

const pipeline = util.promisify(stream.pipeline);

@Injectable()
export class FileService {
  private readonly storagePath: string;

  constructor(
    private readonly aiAgentApiClientService: AiAgentApiClientService,
    private readonly aiAgentPathService: AiAgentPathService,
    private readonly configService: AiAgentConfigService,
    private readonly logger: LogService,
  ) {
    logger.setContext(this.constructor.name);
    const pacsOptions = this.configService.getPacsOptions();

    if (!pacsOptions) {
      throw new Error('Missing config for DICOM PACS server');
    }

    if (!pacsOptions.storagePath) {
      throw new Error('StoragePath is not specified for DICOM in config');
    }

    this.storagePath = pacsOptions.storagePath;
  }

  public async downloadDicomFromPlatform(taskId: string, payload: TSendPlatformDicomPayload) {
    const {
      examId,
      filePath,
      pacsFileId,
      aiDispatchId,
      aiReportId,
      scanId,
    } = payload;

    this.logger.debug([
      `Download DICOM form platform: exam #${examId}`,
      pacsFileId ? `, PACS file #${pacsFileId}` : '',
      aiDispatchId ? `, AI dispatch #${aiDispatchId}` : '',
      aiReportId ? `, AI report #${aiReportId}` : '',
      scanId ? `, scan #${scanId}` : '',
      ` sending: '${filePath}'`,
    ].join(''));

    const tempPath = this.aiAgentPathService.getPathToTemp();
    const receivedFilePath = path.join(tempPath, `${taskId}.dcm`);

    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath);
    }

    const datasetStream = await this.aiAgentApiClientService.getAgentFileStream(taskId);
    const writeStream = fs.createWriteStream(receivedFilePath);
    await pipeline(datasetStream, writeStream);

    this.logger.debug(`Dataset saved to ${receivedFilePath}`);

    return receivedFilePath;
  }

  public async prepareFilePathForCStoreRequest(uids: IUids) {
    const filePath = this.getFilePath('dcm', uids.studyInstanceUID, uids.sopInstanceUID);
    const directory = path.dirname(filePath);

    if (!fs.existsSync(directory)) {
      await fs.promises.mkdir(directory);
    }

    return filePath;
  }

  public async createJsonFile(item: IDicomItem) {
    const filepath = this.getFilePath('json', item.uids.studyInstanceUID, item.uids.sopInstanceUID);
    const fileContent = JSON.stringify(item);

    await this.createFile(filepath, fileContent);
  }

  public async getLocalStuckItems() {
    const items: IDicomItem[] = [];
    const files = await this.getJsonFilesRecursively(this.storagePath);

    for (const file of files) {
      const rawData = await fs.promises.readFile(file, 'utf8');
      let item: IDicomItem;
      try {
        item = JSON.parse(rawData) as IDicomItem;
      } catch (error) {
        this.logger.error(`Error occurred while parsing JSON file: ${file}, ${error}, raw data: ${rawData}`);
        continue;
      }
      items.push(item);
      await this.deleteFileByPath(file);
    }

    return items;
  }

  public async getLocalStuckItemsCount() {
    const stuckFiles = await this.getJsonFilesRecursively(this.storagePath);

    return stuckFiles.length;
  }

  public async deleteFileByPath(filePath: string) {
    return fs.promises.rm(filePath, { force: true });
  }

  public async getBufferFromFile(filePath: string) {
    return fs.promises.readFile(filePath);
  }

  public isLocalDicomFileExists(studyInstanceUid: string, sopInstanceUid: string) {
    const localFilePath = this.getFilePath('dcm', studyInstanceUid, sopInstanceUid);

    return fs.existsSync(localFilePath);
  }

  public getFilePath(extension: string, studyInstanceUid: string, sopInstanceUid: string) {
    return path.resolve(`${this.storagePath}/${studyInstanceUid}-${sopInstanceUid}.${extension}`);
  }

  private async getJsonFilesRecursively(directory: string): Promise<string[]> {
    let files: string[] = [];
    const filesInDirectory = await fs.promises.readdir(directory);
    for (const file of filesInDirectory) {
      const fullPath = path.join(directory, file);
      if (fs.statSync(fullPath).isDirectory()) {
        const filesInDirectoryRec = await this.getJsonFilesRecursively(fullPath);
        files = files.concat(filesInDirectoryRec);
      } else {
        if (path.extname(fullPath) === '.json') {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  private async createFile(filePath: string, fileContent: Buffer | string) {
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }

    await fs.promises.writeFile(filePath, fileContent);
  }
}
