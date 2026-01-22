import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimengModule } from './core/modules/primeng/primeng.module';
import { PlatformService } from './core/services/platform.service';
import { WebsocketService } from './core/services/websocket.service';
import { StorageService } from './core/services/storage.service';
import { environment } from '../environments/environment.development';

@Component({
  selector: 'app-root',
  imports: [ RouterOutlet , PrimengModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  platformService = inject(PlatformService);
  webSocketService = inject(WebsocketService);
  storage = inject(StorageService);

  screenKey: string = environment.screenKey

  ngOnInit() {
    const deviceId = this.storage.get('deviceId');
    const uniqueId = this.storage.get('uniqueId');
    const tenantId = this.storage.get('tenantId');

    const socketPath = deviceId ? `tenant/screens` : `admin/screens?deviceUniqueId=${uniqueId}`;
    const socketAuth = deviceId ? {
      'x-api-key': this.screenKey,
      'x-tenant-id': tenantId,
      'deviceId': deviceId
    } : { 'x-api-key': this.screenKey };
    
    this.webSocketService.onInitSocket(socketPath, socketAuth);

    const duration = this.platformService.platform === 'web' ? 0 : 300;
    const loader = document.getElementById('boot-loader');
    if (loader) {
      loader.style.transition = 'opacity 300ms ease';
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), duration);
    }
  }
}
