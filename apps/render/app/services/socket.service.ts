import { Inject, Injectable } from '@angular/core';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

import { MAIN_HTTP_URL } from '~render/main-url.token';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  private connected = false;

  constructor(@Inject(MAIN_HTTP_URL) private readonly mainWsUlr: string) {
    this.connect();
  }

  public on(eventName: string, listener: (...args: any) => void) {
    this.socket.on(eventName, listener);
    console.log(`subscribe to ${eventName}`);
  }

  public off(eventName: string) {
    this.socket.off(eventName);
  }

  public emit(event: string, args: any[] = []) {
    this.socket.emit(event, ...args);
  }

  public updateConnection() {
    this.disconnect();
    this.connect();
  }

  public isConnected() {
    return this.connected;
  }

  public connect() {
    console.log('SocketService: connect');

    this.socket = io(this.mainWsUlr, {
      autoConnect: false,
      transports: ['websocket'],
    });

    this.socket.on('connect', this.onConnected.bind(this));
    this.socket.on('disconnect', this.onDisconnected.bind(this));
    this.socket.on('connect_error', (error: Error) => console.log(error));

    this.socket.connect();

    this.connected = true;
  }

  public disconnect() {
    console.log('SocketService: disconnect');

    this.socket.offAny();

    this.socket.disconnect();

    this.connected = false;
  }

  private onConnected() {
    console.log('Websockets connected');
  }

  private onDisconnected() {
    console.log('Websockets disconnected');
  }
}
