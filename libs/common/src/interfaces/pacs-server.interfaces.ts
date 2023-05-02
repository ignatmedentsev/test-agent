export interface IPacsServer {
  agent?: { id: number };
  name?: string;
  host: string;
  port: number;
  destinationAet: string;
  sourceAet?: string;
}
