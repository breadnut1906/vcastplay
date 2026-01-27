import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { PrimengUiModule } from '../../modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../modules/components/components.module';
import { UtilityService } from '../../services/utility.service';
import { WebsocketService } from '../../services/websocket.service';
import { StorageService } from '../../services/storage.service';
import { environment } from '../../../../environments/environment.development';
import { UserService } from '../../../user/settings/users/user.service';

@Component({
  selector: 'app-main',
  imports: [ RouterLink, RouterOutlet, PrimengUiModule, ComponentsModule ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

  userService = inject(UserService);
  webSocket = inject(WebsocketService);
  storage = inject(StorageService);
  utils = inject(UtilityService);

  apiKey: string = environment.apiKey;
  socketUrl: string = environment.server;
  showUpgrade = signal<boolean>(true);

  ngOnInit() {
    const tenantId = this.storage.get('id');
    const userId = this.storage.get('userId');

    if (userId) this.webSocket.initSocket(`${this.socketUrl}tenant?userId=${userId}`, { 'x-api-key': this.apiKey, 'x-tenant-id': tenantId });
    else {
      this.userService.onCurrentUser().subscribe({
        next: (user: any) => {
          const { id } = user;
          this.storage.set('userId', id);       
          this.webSocket.initSocket(`${this.socketUrl}tenant?userId=${id}`, { 'x-api-key': this.apiKey, 'x-tenant-id': tenantId });
        }
      });
    }
  }

  get menuItems() {
    return this.utils.modules();
  }
}
