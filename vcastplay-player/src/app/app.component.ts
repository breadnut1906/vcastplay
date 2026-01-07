import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimengModule } from './core/modules/primeng/primeng.module';
import { PlatformService } from './core/services/platform.service';

@Component({
  selector: 'app-root',
  imports: [ RouterOutlet , PrimengModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  platformService = inject(PlatformService);

  ngOnInit() {
    const duration = this.platformService.platform === 'web' ? 0 : 300;
    const loader = document.getElementById('boot-loader');
    if (loader) {
      loader.style.transition = 'opacity 300ms ease';
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), duration);
    }
  }
}
