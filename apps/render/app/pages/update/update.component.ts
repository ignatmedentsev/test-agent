import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Component } from '@angular/core';

import { ERenderSocketEventType } from '~common/enums';
import { SocketService } from '~render/services/socket.service';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateComponent implements OnInit {
  public progress = 0;
  public timer = 0;

  constructor(
    private readonly socketService: SocketService,
    private readonly cd: ChangeDetectorRef,
  ) {}

  public ngOnInit() {
    this.socketService.on(ERenderSocketEventType.UPDATE_PROGRESS, (data) => {
      this.progress = Number(data.percent.toFixed(0));
      this.cd.detectChanges();
    });
  }
}
