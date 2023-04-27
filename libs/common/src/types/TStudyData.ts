import type { TSeriesData } from './TSeriesData';

export type TStudyData = {
  patientName: string,
  patientId: string,
  patientDob: string,
  patientAge: string,
  patientSex: string,
  institutionName: string,
  studyDate: string,
  studyTime: string,
  studyDescription: string,
  protocolName: string,
  referringPhysicianName: string,
  referringPhysicianMail: string,
  referringPhysicianPhone: string,
  additionalPatientHistory: string,
  reasonForVisit: string,
  series: TSeriesData[],
}
