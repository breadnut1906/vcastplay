import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal, TemplateRef } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { AssetsService } from '../assets.service';
import { UtilityService } from '../../../core/services/utility.service';
import { environment } from '../../../../environments/environment.development';
import { AssetPreviewComponent } from '../asset-preview/asset-preview.component';
import { Assets } from '../assets';

@Component({
  selector: 'app-asset-list-item',
  imports: [ PrimengUiModule, CommonModule, AssetPreviewComponent ],
  templateUrl: './asset-list-item.component.html',
  styleUrl: './asset-list-item.component.scss'
})
export class AssetListItemComponent {

  @Input() tenantId: any;
  @Input() asset: Assets | any;
  @Input() customCSS: string = 'h-full';
  @Input() showDetails: boolean = false;
  @Input() disableDrag: boolean = false;
  @Input() showOptions: boolean = false;
  @Input() isSelected: boolean = false;
  @Input() actionBtn!: TemplateRef<any>;

  @Output() onPropertiesChange = new EventEmitter<any>();

  assetService = inject(AssetsService);
  utils = inject(UtilityService);

  showDrawer = signal<boolean>(false);
  publicApi: string = environment.public;
  iconPath: string = environment.iconPath;

  onClickToggleDetails() {
    if (this.showDetails) this.showDrawer.set(true);
    else {
      this.onPropertiesChange.emit(this.asset);
    }
  }

  get assetViewModeSignal() {
    return this.assetService.assetViewModeSignal;
  }
}
