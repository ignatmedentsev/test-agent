import type { association, requests, Dataset } from 'dcmjs-dimse';
import { Scp, responses, constants } from 'dcmjs-dimse';
import type { Socket } from 'net';
import util from 'util';

import type { FileService } from '~ai-agent/modules/file';
import type { AiAgentConfigService } from '~ai-agent/services';
import { EQueueType } from '~common/enums';
import type { IDicomItem, IPacsOptions, IUids } from '~common/interfaces';
import type { NonTxDbService } from '~core/db';
import type { LogService } from '~core/log';
import type { QueueService } from '~core/queue';

export interface IScpOptions {
  logger: LogService;
  fileService: FileService;
  configService: AiAgentConfigService;
  queueService: QueueService;
  db: NonTxDbService;
}

const { CStoreResponse, CEchoResponse } = responses;
const {
  Status,
  RejectResult,
  RejectSource,
  RejectReason,
  PresentationContextResult,
} = constants;

export class DimseScp extends Scp {
  private readonly logger: LogService;
  private readonly fileService: FileService;
  private readonly pacsOptions: IPacsOptions;
  private association: association.Association | undefined;
  private readonly queueService: QueueService;
  private readonly db: NonTxDbService;

  constructor(socket: Socket, opts: IScpOptions) {
    super(socket, opts as any);
    this.pacsOptions = opts.configService.getPacsOptions();
    this.logger = opts.logger;
    this.fileService = opts.fileService;
    this.queueService = opts.queueService;
    this.db = opts.db;
    this.association = undefined;
  }

  public override associationRequested(association: association.Association) {
    this.association = association;

    if (this.association.getCalledAeTitle() !== this.pacsOptions.aet) {
      this.sendAssociationReject(
        RejectResult.Permanent,
        RejectSource.ServiceUser,
        RejectReason.CallingAeNotRecognized,
      );

      return;
    }

    const contexts = association.getPresentationContexts();
    contexts.forEach((c) => {
      const context = association.getPresentationContext(c.id);
      const transferSyntaxes = context.getTransferSyntaxUids();
      transferSyntaxes.forEach((transferSyntax) => {
        context.setResult(PresentationContextResult.Accept, transferSyntax);
      });
    });
    this.sendAssociationAccept();
  }

  public override cEchoRequest(request: requests.CEchoRequest, callback: (response: responses.CEchoResponse) => void) {
    const response = CEchoResponse.fromRequest(request);
    response.setStatus(Status.Success);

    callback(response);
  }

  public override async cStoreRequest(request: requests.CStoreRequest, callback: (response: responses.CStoreResponse) => void) {
    const dataset = request.getDataset();
    let callingAet = 'UNKNOWN';
    if (this.association) {
      callingAet = this.association.getCallingAeTitle();
    }
    const uids = {
      seriesInstanceUID: dataset.elements.SeriesInstanceUID,
      sopInstanceUID: dataset.elements.SOPInstanceUID,
      studyInstanceUID: dataset.elements.StudyInstanceUID,
    } as IUids;
    const dicomFilePath = await this.fileService.prepareFilePathForCStoreRequest(uids);
    this.logger.info(`Get C-STORE request with sopInstanceUID: "${uids.sopInstanceUID}"`);

    const response = CStoreResponse.fromRequest(request);
    try {
      await this.datasetToFile(dataset, dicomFilePath);
      const dicomItem = { dicomFilePath, uids, callingAet } as IDicomItem;
      await this.queueService.addToQueue(this.db, EQueueType.DICOM_PROCESSOR, 'common', JSON.stringify(dicomItem));
      this.logger.info(`Item with sopInstanceUID: "${dataset.elements.SOPInstanceUID}" was sent to queue`);

      response.setStatus(Status.Success);
    } catch (error) {
      this.logger.error(util.inspect(error));
      response.setStatus(Status.ProcessingFailure);
    } finally {
      callback(response);
    }
  }

  public override associationReleaseRequested() {
    this.sendAssociationReleaseResponse();
  }

  private async datasetToFile(dataset: Dataset, filePath: string) {
    return new Promise<void>((resolve, reject) => {
      dataset.toFile(filePath, (error: Error | undefined) => {
        if (error) {
          return reject(error);
        }

        resolve();
      }, { fragmentMultiframe: false });
    });
  }
}
