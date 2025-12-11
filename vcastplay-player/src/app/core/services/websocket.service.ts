import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  socketClient!: Socket;
  socketUrl: string = environment.socketUrl

  constructor() {
    this.initSocket();
  }

  private initSocket() {
    this.socketClient = io(this.socketUrl, {
      transports: ['websocket']
    });

    this.socketClient.on('connect', () => {
      console.log('connected');
    });

    this.socketClient.on('disconnect', () => {
      console.log('disconnected');
    });

    this.socketClient.on('error', (error: any) => {
      console.log('Cannot connect', error);
    });
  }

  onEmit(event: string, data: any) {
    this.socketClient.emit(event, data);
  }

  onListen(event: string) {
    return new Promise((resolve, reject) => {
      this.socketClient.on(event, (data: any) => {
        resolve(data);
      });
    })
  }
}
