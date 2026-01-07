import { Component, EventEmitter, inject, Output } from '@angular/core';
import { UtilityService } from '../../../core/services/utility.service';
import { environment } from '../../../../environments/environment.development';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';

@Component({
  selector: 'app-design-editor-tools',
  imports: [ PrimengUiModule ],
  templateUrl: './design-editor-tools.component.html',
  styleUrl: './design-editor-tools.component.scss'
})
export class DesignEditorToolsComponent {

  @Output() toolbarChange = new EventEmitter<any>();

  utils = inject(UtilityService);

  iconPath: string = environment.iconPath;
  
  toolbarItems: any[] = [
    { label: 'Move', value: false },
    { label: 'Select', value: false },
    { label: 'Text', value: false },
    { label: 'Shapes', value: false },
    { label: 'Content', value: false },
    { label: 'Line', value: false },
    { label: 'Hand', value: false },
    { label: 'Zoom', value: false },
  ]

  onClickToolbarItem(item: any) {
    this.toolbarItems.forEach((toolbar: any) => {
      toolbar.value = false
      if (toolbar.label.toLowerCase() === item) {
        toolbar.value = true;
        this.toolbarChange.emit(toolbar)
      }
    })
  }
  
  getIconPath(name: string): string {
    return `${this.iconPath}${this.isDarkTheme ? `${name}-white.png` : `${name}.png`}`
  }

  get isDarkTheme() {
    return this.utils.isDarkTheme()
  }
}
