import { Component, inject, Input, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { FormBuilder, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { AssetsService } from '../assets.service';

@Component({
  selector: 'app-asset-ai-generate',
  imports: [ PrimengUiModule ],
  templateUrl: './asset-ai-generate.component.html',
  styleUrl: './asset-ai-generate.component.scss'
})
export class AssetAiGenerateComponent {

  @Input() showPrompt = signal<boolean>(false);

  assetService = inject(AssetsService);
  message = inject(MessageService);

  isGenerating = signal<boolean>(false);
  assetData = signal<any>({})

  size: MenuItem[] = [
    { label: 'Landscape', value: '1536x1024' },
    { label: 'Portrait', value: '1024x1536' },
    { label: 'Auto', value: '1024x1024' },
  ]

  quality: MenuItem[] = [
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
  ]

  formBuilder = inject(FormBuilder);
  generateForm = this.formBuilder.group({
    prompt: ['Create an advertisement material Milk for Adult to help them become stronger and bone growth', [ Validators.required ]],
    size: ['1024x1024'],
    quality: ['high']
  });

  onStepChanges(data: any) {
    if (data == 2) {
      this.isGenerating.set(true);
      this.assetService.onGenerateImage(this.generateForm.value).subscribe({
        next: (res: any) => {
          console.log(res);
          
        },
        error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
        complete: () => this.isGenerating.set(false)
      });
    }
  }

  onUploadAssets() {
    
  }

  step: number = 1;
}
