import { Component, Input, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';

@Component({
  selector: 'app-asset-ai-generate',
  imports: [ PrimengUiModule ],
  templateUrl: './asset-ai-generate.component.html',
  styleUrl: './asset-ai-generate.component.scss'
})
export class AssetAiGenerateComponent {

  @Input() showPrompt = signal<boolean>(false);

  step: number = 0;
}
