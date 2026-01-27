import { Component, inject } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { PrimengUiModule } from './core/modules/primeng-ui/primeng-ui.module'
import { ComponentsModule } from './core/modules/components/components.module'
import { UtilityService } from './core/services/utility.service'
import { StorageService } from './core/services/storage.service'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PrimengUiModule, ComponentsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {

  utils = inject(UtilityService);
  storage = inject(StorageService);

  ngOnInit() {
    const isDarkTheme: boolean = this.storage.get('theme') == 'dark'
    if (isDarkTheme) this.utils.setDarkTheme()
  }
}
