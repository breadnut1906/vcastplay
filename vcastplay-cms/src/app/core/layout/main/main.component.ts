import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { PrimengUiModule } from '../../modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../modules/components/components.module';
import { UtilityService } from '../../services/utility.service';

@Component({
  selector: 'app-main',
  imports: [ RouterLink, RouterOutlet, PrimengUiModule, ComponentsModule ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

  utils = inject(UtilityService);

  showUpgrade = signal<boolean>(true);

  get menuItems() {
    return this.utils.modules();
  }
}
