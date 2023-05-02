import { Injectable } from '@nestjs/common';
import { BehaviorSubject } from 'rxjs';

import { EPlatformSocketEventType, ERenderSocketEventType } from '~common/enums';
import { CoreConfigService } from '~core/services';
import { SocketClientService, SocketService } from '~core/socket';

@Injectable()
export class AuthService {
  public readonly isAuth = new BehaviorSubject(false);

  constructor(
    private readonly configService: CoreConfigService,
    private readonly socketService: SocketService,
    private readonly socketClientService: SocketClientService,
  ) {}

  public onModuleInit() {
    this.socketClientService.subscribePlatformEvent(EPlatformSocketEventType.REFRESH_AGENT_KEY, async () => {
      await this.logout();
    });
  }

  public async logout() {
    await this.configService.setKey('');
    this.socketService.server.in('default').emit(ERenderSocketEventType.REFRESH_AGENT_KEY);
    this.socketClientService.disconnect();
    this.isAuth.next(false);
  }

  public async login(key: string) {
    await this.configService.setKey(key);

    this.isAuth.next(true);
  }
}
