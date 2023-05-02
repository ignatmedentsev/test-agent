import type FormData from 'form-data';

import type { EVetAiApiUrl } from '../vet-ai-enums';
import type { IAnalysisRequestResult, IAnalysisResultBody, IGetAnalysisResult } from '../vet-ai.interface';

export type TVetAiRequestApiPayload = {
  [EVetAiApiUrl.ANALYSIS_REQUEST_V2]: FormData,
  [EVetAiApiUrl.GET_RESULTS_V2]: IAnalysisResultBody,
  [EVetAiApiUrl.GET_WHOLE_RESULTS]: IAnalysisResultBody,
}

export type TVetAiApiResponse = {
  [EVetAiApiUrl.ANALYSIS_REQUEST_V2]: IAnalysisRequestResult,
  [EVetAiApiUrl.GET_RESULTS_V2]: IGetAnalysisResult,
  [EVetAiApiUrl.GET_WHOLE_RESULTS]: NodeJS.ReadableStream,
}
