import type { OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Subscription } from 'rxjs';
import { BehaviorSubject, interval } from 'rxjs';
import type { ManagerOptions, Socket as ClientSocket, SocketOptions } from 'socket.io-client';
import { io } from 'socket.io-client';

import type { EPresenceStatus } from '~common/enums';
import { EPlatformSocketEventType } from '~common/enums';
import type { TPlatformSocketEventPayload } from '~common/types';
import { LogService } from '~core/log';
import { CoreConfigService } from '~core/services';

type TListenerList = Map<EPlatformSocketEventType, Array<(...args: any[]) => void>>;

const PRESENCE_STATUS_ONLINE_TIME = 1000 * 60 * 9;

@Injectable()
export class SocketClientService implements OnModuleInit {
  public readonly isConnected = new BehaviorSubject(false);

  private client: ClientSocket;

  private readonly activeListeners: TListenerList = new Map();
  private agentPresenceIntervalSubscription: Subscription;

  constructor(
    private readonly logger: LogService,
    private readonly configService: CoreConfigService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  public onModuleInit() {
    this.connect();
  }

  public onApplicationShutdown() {
    this.clearInterval();
  }

  public disconnect() {
    this.client.disconnect();
    this.clearInterval();
  }

  public connect() {
    const agentkey = this.configService.getKey();
    const apiUrl = this.configService.getPlatformApiUrl();
    const ioConfig: Partial<ManagerOptions & SocketOptions> = { autoConnect: false, transports: ['websocket'] };

    if (agentkey) {
      ioConfig.query = { agentkey };
    }

    this.client = io(apiUrl, ioConfig);

    this.subscribeClientEvents();

    this.client.connect();

    this.subscribeEvents();
  }

  public subscribePlatformEvent<T extends EPlatformSocketEventType>(eventName: T, listener: (payload: Omit<TPlatformSocketEventPayload<T>, '_ts'>) => void) {
    if (!this.activeListeners.has(eventName)) {
      this.activeListeners.set(eventName, []);

      if (this.client) {
        this.client.on(eventName as string, (payload) => {
          this.processEvent(eventName, payload);
        });
      }
    }

    this.activeListeners.get(eventName)!.push(listener);

    this.logger.debug(`subscribe to ${eventName}`);

    return listener;
  }

  public unsubscribePlatformEvent<T extends EPlatformSocketEventType>(eventName: T, listener: (payload: Omit<TPlatformSocketEventPayload<T>, '_ts'>) => void) {
    const activeEvent = this.activeListeners.get(eventName);

    if (!activeEvent) {
      return;
    } else {
      const index = activeEvent.indexOf(listener);
      if (index !== -1) {
        activeEvent.splice(index, 1);

        this.logger.debug(`unsubscribe from ${eventName}`);
      }

      if (activeEvent.length === 0) {
        this.client.off(eventName);

        this.activeListeners.delete(eventName);
      }
    }
  }

  public emitPresenceStatus(status: EPresenceStatus) {
    this.client.emit('AGENT_PRESENCE_STATUS', status);
  }

  private processEvent<
    SocketType extends EPlatformSocketEventType,
    Payload extends TPlatformSocketEventPayload<SocketType>,
  >(eventName: SocketType, payload: Payload) {
    // eslint-disable-next-line no-underscore-dangle
    if (payload?._ts) {
      // eslint-disable-next-line no-underscore-dangle
      this.client.emit(EPlatformSocketEventType.CONFIRM, { timestamp: payload._ts, type: eventName });
    }

    this.logger.debug(`Socket ${eventName}: ${this.logger.prepareData(payload)}`);

    for (const listener of this.activeListeners.get(eventName) ?? []) {
      listener(payload);
    }
  }

  private subscribeEvents() {
    for (const eventName of Array.from(this.activeListeners.keys())) {
      this.client.on(eventName, (payload) => {
        this.processEvent(eventName, payload);
      });

      this.logger.debug(`resubscribe to ${eventName}`);
    }
  }

  private subscribeClientEvents() {
    this.client.on('connect', () => {
      this.isConnected.next(true);
      this.logger.debug('Agent connected');

      this.agentPresenceIntervalSubscription = interval(PRESENCE_STATUS_ONLINE_TIME).subscribe(() => {
        this.client.emit('AGENT_PRESENCE_STATUS', 'ONLINE');
      });
    });
    this.client.on('disconnect', (reason, details) => {
      this.isConnected.next(false);
      this.client.offAny();

      this.logger.debug(`Agent disconnected: ${reason}${details ? ', ' + this.logger.prepareData(details) : ''}`);
    });
    this.client.on('connect_error', (error: Error) => this.logger.error(`Agent connect error: ${error.message}`));
    this.client.on('error', (error: Error) => this.logger.error(`Agent error: ${error.message}`));
  }

  private clearInterval() {
    if (this.agentPresenceIntervalSubscription) {
      this.agentPresenceIntervalSubscription.unsubscribe();
    }
  }
}
