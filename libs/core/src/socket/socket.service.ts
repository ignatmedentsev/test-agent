import { Injectable } from '@nestjs/common';
import type { OnGatewayInit, OnGatewayConnection } from '@nestjs/websockets';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { Server } from 'socket.io';

import { LogService } from '~core/log';

@Injectable()
@WebSocketGateway()
export class SocketService implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  public readonly server: Server;

  constructor(
    private readonly logger: LogService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  public afterInit() {
    this.logger.debug('SocketService initialized');
  }

  public handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
    void client.join('default');
  }
}
