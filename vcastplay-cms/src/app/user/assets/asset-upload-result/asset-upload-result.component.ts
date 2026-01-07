import { Component, inject, Input } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { UploadResults } from '../assets';
import { UtilityService } from '../../../core/services/utility.service';

@Component({
  selector: 'app-asset-upload-result',
  imports: [ PrimengUiModule ],
  templateUrl: './asset-upload-result.component.html',
  styleUrl: './asset-upload-result.component.scss'
})
export class AssetUploadResultComponent {

  @Input() isShowUploadResult: boolean = false;
  @Input() uploadResult!: UploadResults[];

  utils = inject(UtilityService);

}
