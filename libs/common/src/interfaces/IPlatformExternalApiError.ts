// TODO: Extend error interface and consolidate with platform errors
export interface IPlatformExternalApiError {
  success: boolean;
  message: string;
  stack: string;
  code: number;
}
