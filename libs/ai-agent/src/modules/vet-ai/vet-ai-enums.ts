export enum EVetAiApiUrl {
  GET_WHOLE_RESULTS = '/dx/visionAi/devices/theWholeAnalysisResultSearch',
  ANALYSIS_REQUEST_V2 = '/dx/visionAi/devices/v2/analysisRequest',
  GET_RESULTS_V2 = '/dx/visionAi/devices/v2/results',
}

export enum EVetAiAnalysisStatus {
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export enum EVetAiAnalysisModel {
  MUSCULOSKELETAL = 'vet_msk',
  THORAX = 'vet_thorax',
  VHS = 'vet_vhs',
}

