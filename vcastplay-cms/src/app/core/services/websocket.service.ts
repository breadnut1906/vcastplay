import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from "socket.io-client";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  socketClient!: Socket;

  constructor() { }

  initSocket(socketURL: string, auth?: any) {
    this.socketClient = io(socketURL, {
      transports: ['websocket'],
      reconnection: true,
      forceNew: true,
      auth
    });

    this.socketClient.on('connect', () => {
      console.log('connected to server');
    });

    this.socketClient.on('disconnect', () => {
      console.log('disconnected from server');
    });

    this.socketClient.on('error', (error: any) => {
      console.log('Cannot connect to server', error);
    });
  }

  onEmit(event: string, data: any) {
    this.socketClient.emit(event, data);
  }

  onListen(event: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socketClient.on(event, (data: any) => subscriber.next(data));

      // cleanup
      return () => {
        this.socketClient.off(event);
      };
    });
  }
}
