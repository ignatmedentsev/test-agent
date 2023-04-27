import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';

import { ERenderSocketEventType } from '~common/enums';
import { SocketService } from '~render/services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(
    private readonly router: Router,
    private readonly socketService: SocketService,
    private readonly cdRef: ChangeDetectorRef,
  ) {
    this.socketService.on(ERenderSocketEventType.CANCEL_UPDATE, async (cancelUpdate) => {
      if (cancelUpdate) {
        await this.router.navigate(['']);
        this.cdRef.detectChanges();
      }
    });
    this.socketService.on(ERenderSocketEventType.HAS_NEW_VERSION, async (hasNewVersion: boolean) => {
      if (hasNewVersion) {
        await this.router.navigate(['update']);
        this.cdRef.detectChanges();
      }
    });
  }
}
