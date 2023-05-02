export interface IVetAiConfig {
  vetAi: IVetAiOptions;
}

export interface IVetAiOptions {
  hostUrl: string;
  authKey: string;
  subscriptionId: string;
  deviceId: string;
  aiServiceId: string;
}
