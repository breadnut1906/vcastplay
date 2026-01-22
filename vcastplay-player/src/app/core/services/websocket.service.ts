import { inject, Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { MessageService } from 'primeng/api';
import { PlayerService } from './player.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  player = inject(PlayerService);
  storage = inject(StorageService);
  message = inject(MessageService);

  socketClient!: Socket | any;
  socketUrl: string = environment.socketUrl;
  screenKey: string = environment.screenKey;

  isOnline = signal<boolean>(false);

  constructor() { }

  onInitSocket(path: string, auth: any) {
    this.socketClient = io(`${this.socketUrl}/${path}`, {
      transports: ['websocket'],
      reconnection: true,
      forceNew: true,
      auth
    });    

    this.socketClient.on('connect', () => {
      console.log(`connected to server: ${path}`);
      this.isOnline.set(true);
    });

    this.socketClient.on('disconnect', () => {
      console.log('disconnected from server');
      this.isOnline.set(false);
    });

    this.socketClient.on('errors', (error: any) => {
      console.log('Cannot connect to server', error);
    });

    this.socketClient.on('reconnect', () => {
      console.log('reconnected to server');
      this.isOnline.set(true);
    });

    this.socketClient.on('registered', this.onRegister.bind(this));
    this.socketClient.on('apply', this.onApply.bind(this));
    this.socketClient.on('open', this.onReceiveCommand.bind(this, 'open'));
    this.socketClient.on('close', this.onReceiveCommand.bind(this, 'close'));
    this.socketClient.on('restart', this.onReceiveCommand.bind(this, 'restart'));
    this.socketClient.on('shutdown', this.onReceiveCommand.bind(this, 'shutdown'));
  }

  onRegister(data: any, tenantId: any) {
    this.storage.set('tenantId', tenantId);
    this.storage.set('deviceId', data.id);

    this.onChangeSocket(`tenant/screens`, {
      'x-api-key': this.screenKey,
      'x-tenant-id': tenantId,
      'deviceId': data.id
    });

    this.message.add({ severity:'success', summary: 'Success', detail: 'Device registered successfully!' });
  }

  onApply(data: any) {
    this.player.onSetContent(data);
  }

  onReceiveCommand(data: any) {
    const platform = this.storage.get('platform');
    switch (platform) {
      case 'web':
        console.log('For Web');
        break;
      case 'desktop':
        this.player.send(data);
        break;
    }
  }

  onChangeSocket(path: string, auth: any) {
    this.onDisconnect();    
    this.onInitSocket(path, auth);
  }

  onDisconnect() {
    if (!this.socketClient) return;
    this.socketClient.io.opts.reconnection = false;
    this.socketClient.removeAllListeners();
    this.socketClient.disconnect();
    this.socketClient = null;
  }
}
