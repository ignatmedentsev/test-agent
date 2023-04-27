import { Injectable } from '@nestjs/common';
import type { OnGatewayInit, OnGatewayConnection } from '@nestjs/websockets';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import EventEmitter from 'events';
import type { Socket } from 'socket.io';
import { Server } from 'socket.io';

import { LogService } from '~core/log';

@Injectable()
@WebSocketGateway()
export class SocketService extends EventEmitter implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  public readonly server: Server;

  constructor(
    private readonly logger: LogService,
  ) {
    super();
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
