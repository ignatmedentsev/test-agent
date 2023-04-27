import { Global, Module } from '@nestjs/common';

import { SocketClientService } from './socket-client.service';
import { SocketService } from './socket.service';

@Global()
@Module({
  providers: [SocketService, SocketClientService],
  exports: [SocketService, SocketClientService],
})
export class SocketModule {}
