import { Component, signal } from '@angular/core';
import { UiModule } from '../../core/modules/ui/ui.module';
@Component({
  selector: 'app-toolbar',
  imports: [ UiModule ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {

}
