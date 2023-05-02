import { Phi } from '~agent/entity';
import { AgentApiClientService } from '~agent/modules/agent-api-client';
import type { SubmitExamDto } from '~common/dto';
import { EDicomTag, EQueueType, EScanDeviceType, EScanStatusMapping } from '~common/enums';
import type { IDevice, IPacsFile } from '~common/interfaces';
import { getStringValue, getStringValueFromSequence } from '~common/utils/dicom';
import type { DbService } from '~core/db';
import { LogService } from '~core/log';
import type { QueueInterface } from '~core/queue';
import { Queue } from '~core/queue';

export type TPhiSendPayload = {
  device: IDevice,
  savedPhi: Phi,
}

@Queue(EQueueType.PHI_SENDER, { maxAttempts: 3, transaction: false })
export class PhiSender implements QueueInterface {
  constructor(
    private readonly agentApiClientService: AgentApiClientService,
    private readonly logger: LogService,
  ) {
    logger.setContext(this.constructor.name);
  }

  public async processItem(db: DbService, payload: string) {
    const { savedPhi, device } = JSON.parse(payload) as TPhiSendPayload;

    const procedure = getStringValue(savedPhi.dicomData, EDicomTag.STUDY_DESCRIPTION);
    const accessionNumber = getStringValue(savedPhi.dicomData, EDicomTag.ACCESSION_NUMBER);
    const accessionIssuer = getStringValueFromSequence(
      savedPhi.dicomData,
      EDicomTag.ISSUER_OF_ACCESSION_NUMBER_SEQUENCE,
      0,
      EDicomTag.UNIVERSAL_ENTITY_ID,
    );

    const studyPhis = await db.getRepository(Phi).findBy({ studyInstanceUid: savedPhi.studyInstanceUid });
    const pacsFiles = studyPhis.map((s) => {
      return { sopInstanceUid: s.sopInstanceUid };
    }) as IPacsFile[];

    const exam: SubmitExamDto = {
      studyInstanceUid: savedPhi.studyInstanceUid,
      pacsFiles,
      procedure,
      accessionNumber,
      accessionIssuer,
      isScan: true,
      scan: {
        deviceId: device.arcId,
        deviceType: EScanDeviceType.ARC,
        status: EScanStatusMapping.RIS_UPLOAD_INVOKED,
      },
    };

    const error = await this.agentApiClientService.submitExamWithoutFormThroughAgent(exam);

    if (error) {
      this.logger.error(`Cant create exam on platform for sopInstanceUid "${savedPhi.sopInstanceUid}". Error: ${error.message}`);
    }

    this.logger.debug(`New phi #${savedPhi.id} from device #${device.id} with sopInstanceUid: ${savedPhi.sopInstanceUid} was created`);
  }
}
