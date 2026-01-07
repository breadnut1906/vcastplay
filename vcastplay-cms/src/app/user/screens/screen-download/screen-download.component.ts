import { Component, Input, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';

@Component({
  selector: 'app-screen-download',
  imports: [ PrimengUiModule ],
  templateUrl: './screen-download.component.html',
  styleUrl: './screen-download.component.scss'
})
export class ScreenDownloadComponent {
  @Input() showDownload = signal<boolean>(false);

  onClickDownload(device: string) {
    this.showDownload.set(false);
  }
}
