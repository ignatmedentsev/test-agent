import type { IDicomAttributeJsonModel } from '~common/interfaces';

export interface IDataset {
  AccessionNumber: string;
  AdditionalPatientHistory: string;
  BitsAllocated: number;
  BitsStored: number;
  Columns: number;
  ContentDate: string;
  ContentTime: string;
  ConversionType: string;
  DeviceSerialNumber: string;
  HighBit: number;
  ImplementationClassUID: string;
  InstanceNumber: number;
  InstitutionName: string;
  LossyImageCompression: string;
  Modality: string;
  PatientBirthDate: string;
  PatientID: string;
  PatientName: string;
  PatientOrientation: string;
  PatientSex: string;
  PhotometricInterpretation: string;
  PixelData?: Object;
  PixelRepresentation: number;
  PlanarConfiguration: number;
  ProtocolName: string;
  ReasonForVisit: string;
  ReferringPhysicianIdentificationSequence: IReferringPhysicianIdentificationSequence;
  ReferringPhysicianName: string;
  Rows: number;
  SOPClassUID: string;
  SOPInstanceUID: string;
  SamplesPerPixel: number;
  SeriesDate: string;
  SeriesDescription: string;
  SeriesInstanceUID: string;
  SeriesNumber: number;
  SeriesTime: string;
  StationName: string;
  StudyDate: string;
  StudyDescription: string;
  StudyID: string;
  StudyInstanceUID: string;
  StudyTime: string;
  TransferSyntaxUID: string;
  _meta: IMeta;
  _vrMap: IVRMap;
}

interface IReferringPhysicianIdentificationSequence {
  InstitutionName: string;
  PersonTelephoneNumbers: string;
  PersonTelecomInformation: string;
}

interface IMeta {
  FileMetaInformationVersion: IDicomAttributeJsonModel;
  ImplementationClassUID: IDicomAttributeJsonModel;
  ImplementationVersionName: IDicomAttributeJsonModel;
  MediaStorageSOPClassUID: IDicomAttributeJsonModel;
  MediaStorageSOPInstanceUID: IDicomAttributeJsonModel;
  TransferSyntaxUID: IDicomAttributeJsonModel;
}

interface IVRMap {
  PixelData: string;
}
