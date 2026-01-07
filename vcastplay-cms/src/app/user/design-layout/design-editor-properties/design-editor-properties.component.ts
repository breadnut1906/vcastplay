import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';

@Component({
  selector: 'app-design-editor-properties',
  imports: [ PrimengUiModule ],
  templateUrl: './design-editor-properties.component.html',
  styleUrl: './design-editor-properties.component.scss'
})
export class DesignEditorPropertiesComponent {

  @Input() selectedObject!: FormGroup;

}
