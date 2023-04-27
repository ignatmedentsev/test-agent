import { Injectable } from '@nestjs/common';
import { constants } from 'dcmjs-dimse';

import type { TStringified } from '~common/types';

import type { TAssociationRejectResult } from './dicom-sender.types';

const {
  Status,
  RejectResult,
  RejectSource,
  RejectReason,
} = constants;

const STATUS_DESCRIPTION_MAP: Record<typeof Status[keyof typeof Status], string> = {
  [Status.SopClassNotSupported]: 'SopClassNotSupported',
  [Status.DataSetSopClassMismatch]: 'DataSetSopClassMismatch',
  [Status.ClassInstanceConflict]: 'ClassInstanceConflict',
  [Status.DuplicateSOPInstance]: 'DuplicateSOPInstance',
  [Status.DuplicateInvocation]: 'DuplicateInvocation',
  [Status.InvalidArgumentValue]: 'InvalidArgumentValue',
  [Status.InvalidAttributeValue]: 'InvalidAttributeValue',
  [Status.InvalidObjectInstance]: 'InvalidObjectInstance',
  [Status.MissingAttribute]: 'MissingAttribute',
  [Status.MissingAttributeValue]: 'MissingAttributeValue',
  [Status.MistypedArgument]: 'MistypedArgument',
  [Status.MoveDestinationUnknown]: 'MoveDestinationUnknown',
  [Status.NoSuchArgument]: 'NoSuchArgument',
  [Status.NoSuchEventType]: 'NoSuchEventType',
  [Status.NoSuchObjectInstance]: 'NoSuchObjectInstance',
  [Status.NoSuchSopClass]: 'NoSuchSopClass',
  [Status.ProcessingFailure]: 'ProcessingFailure',
  [Status.ResourceLimitation]: 'ResourceLimitation',
  [Status.UnrecognizedOperation]: 'UnrecognizedOperation',
  [Status.NoSuchActionType]: 'NoSuchActionType',
  [Status.NotAuthorized]: 'NotAuthorized',
  [Status.OutOfResourcesNumberOfMatches]: 'OutOfResourcesNumberOfMatches',
  [Status.OutOfResourcesSubOperations]: 'OutOfResourcesSubOperations',
};

const RESULT_DESCRIPTION_MAP: Record<typeof RejectResult[keyof typeof RejectResult], string> = {
  [RejectResult.Permanent]: 'Permanent',
  [RejectResult.Transient]: 'Transient',
};

const REJECT_REASON_MAP: Record<typeof RejectReason[keyof typeof RejectReason], string> = {
  [RejectReason.NoReasonGiven]: 'No reason given',
  [RejectReason.ApplicationContextNotSupported]: 'Application context name not supported',
  [RejectReason.CallingAeNotRecognized]: 'Calling AE title not recognized',
  [RejectReason.CalledAeNotRecognized]: 'Called AE title not recognized',
  [RejectReason.ProtocolVersionNotSupported]: 'Protocol version not supported',
  [RejectReason.TemporaryCongestion]: 'Temporary congestion',
  [RejectReason.LocalLimitExceeded]: 'Local limit exceeded',
};

const SOURCE_DESCRIPTION_MAP: Record<typeof RejectSource[keyof typeof RejectSource], string> = {
  [RejectSource.ServiceProviderAcse]: 'Service provider (ACSE related function)',
  [RejectSource.ServiceProviderPresentation]: 'Service provider (Presentation related function)',
  [RejectSource.ServiceUser]: 'Service user',
};

@Injectable()
export class DcmJsResponseFormatter {
  public getStatusDescription(status: number) {
    return STATUS_DESCRIPTION_MAP[status] || status.toString(16);
  }

  public formatRejectResult(rejectDescription: TAssociationRejectResult) {
    const parts: Partial<TStringified<TAssociationRejectResult>> = {};
    if (rejectDescription.result !== undefined) {
      parts.result = this.getResultDescription(rejectDescription.result);
    }
    parts.reason = this.getRejectReason(rejectDescription.reason);
    parts.source = this.getSource(rejectDescription.source);

    return JSON.stringify(parts);
  }

  private getResultDescription(result: number) {
    return RESULT_DESCRIPTION_MAP[result] || result.toString(16);
  }

  private getSource(source: number) {
    return SOURCE_DESCRIPTION_MAP[source] || source.toString(16);
  }

  private getRejectReason(reason: number) {
    return REJECT_REASON_MAP[reason] || reason.toString(16);
  }
}
