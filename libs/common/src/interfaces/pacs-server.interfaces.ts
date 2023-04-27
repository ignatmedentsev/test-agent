export interface IPacsServer {
  name?: string;
  host: string;
  port: number;
  destinationAet: string;
  sourceAet?: string;
}
