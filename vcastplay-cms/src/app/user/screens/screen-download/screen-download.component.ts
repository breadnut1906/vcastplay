import { Component, inject, Input, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { environment } from '../../../../environments/environment.development';
import { FormControl } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-screen-download',
  imports: [ PrimengUiModule ],
  templateUrl: './screen-download.component.html',
  styleUrl: './screen-download.component.scss'
})
export class ScreenDownloadComponent {

  @Input() showDownload = signal<boolean>(false);

  clipboard = inject(Clipboard);
  message = inject(MessageService);

  showLink = signal<boolean>(false);

  playerLink: string = environment.playerLink;
  link: FormControl = new FormControl(this.playerLink);

  onClickDownload(device: string) {
    this.showLink.set(false);
    if (device == 'web') {
      this.showLink.set(true);
    }
    if (device == 'android') {
      window.open('https://play.google.com/store/apps/details?id=com.google.android.googlequicksearchbox&pcampaignid=web_share', '_blank');
    }

    if (device == 'desktop') {
      window.open('desktop.app.text');
    }
  }

  onCopyToClipboard() {
    this.clipboard.copy(this.link.value);
    this.message.add({ severity:'success', summary: 'Success', detail: 'Link copied to clipboard!' });
  }

  onClickOpenLink() {
    window.open(this.link.value, '_blank');
  }
}
