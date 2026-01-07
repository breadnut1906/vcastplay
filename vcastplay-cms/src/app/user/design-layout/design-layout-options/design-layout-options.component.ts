import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ScreenSelectionComponent } from '../screen-selection/screen-selection.component';
import { UtilityService } from '../../../core/services/utility.service';
import { DesignLayoutService } from '../design-layout.service';

@Component({
  selector: 'app-design-layout-options',
  imports: [ PrimengUiModule, ScreenSelectionComponent ],
  templateUrl: './design-layout-options.component.html',
  styleUrl: './design-layout-options.component.scss'
})
export class DesignLayoutOptionsComponent {

  @Input() showCanvasSize = signal<boolean>(false);

  @Output() canvasSizeChange = new EventEmitter<any>();

  designlayoutService = inject(DesignLayoutService);
  utils = inject(UtilityService);

  onSelectionChange(event: any) {
    if (!event) return;
    this.designForm.patchValue({ screen: event });
  }

  onClickCreateCanvas() {
    this.canvasSizeChange.emit(this.designForm.value);
    this.showCanvasSize.set(false);
  }
  
  get colors() {
    return this.utils.colors
  }

  get designForm() {
    return this.designlayoutService.designForm
  }
}
