import type { EVetAiAnalysisStatus } from './vet-ai-enums';

export interface IAnalysisRequestBody {
  deviceId: string;
  aiServiceId: string;
  subsId: string;
  additionalData: IAdditionalData;
}

export interface IAnalysisRequestResult {
  rsltCd: string;
  rsltMsg: string;
  rsltData: IRsltData;
}

export interface IAnalysisResultBody {
  deviceId: string;
  aiServiceId: string;
  subsId: string;
  reqId: string;
}

export interface IGetAnalysisResult {
  rsltCd: string;
  rsltMsg: string;
  rsltData: IAnalysisResultData;
}

export interface IAdditionalData {
  animalOnwer: string;
  animalId: string;
  animalNm: string;
}

export interface IRsltData {
  reqId: string;
}

export interface IAnalysisResultData {
  analysisId: string;
  analysisStts: EVetAiAnalysisStatus;
  imgUrl: string;
  analysisRslt: IAnalysisResult[];
}

export interface IAnalysisResult {
  model_title: string;
  model_version: string;
  model_device: string;
  time_start: number;
  time_finish: number;
  classes: string[];
  result_type: string;
  results: IResult[];
}

export interface IResult {
  scores: number[];
  labels: number[];
  boxes: number[][];
  result_image: string;
  result_json: string;
}

