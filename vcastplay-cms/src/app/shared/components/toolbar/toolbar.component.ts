import { Component, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { AuthService } from '../../../auth/auth.service';
import { UtilityService } from '../../../core/services/utility.service';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-toolbar',
  imports: [ PrimengUiModule, RouterModule ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  providers: [ AuthService, MessageService ]
})
export class ToolbarComponent {
  
  auth = inject(AuthService);
  utils = inject(UtilityService);
  storage = inject(StorageService);
  router = inject(Router);

  onClickToggleDarkTheme() {
    const isDark: boolean = this.utils.isDarkTheme();

    if (isDark) {
      this.utils.setLightTheme();
      this.storage.set('theme', 'light');
    } else {
      this.utils.setDarkTheme();
      this.storage.set('theme', 'dark');
    }
  }

  onClickLogout() {
    this.auth.onLogout().then(id => {
      this.router.navigate(['/login'], { queryParams: { id } });
    });
  }

  isAdmin() {
    return this.storage.get('id') ? false : true;
  }
}
