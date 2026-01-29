import { Component, inject, Input, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { FormBuilder, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { AssetsService } from '../assets.service';
import { environment } from '../../../../environments/environment.development';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-asset-ai-generate',
  imports: [ PrimengUiModule ],
  templateUrl: './asset-ai-generate.component.html',
  styleUrl: './asset-ai-generate.component.scss'
})
export class AssetAiGenerateComponent {

  @Input() showPrompt = signal<boolean>(false);

  assetService = inject(AssetsService);
  storage = inject(StorageService);
  message = inject(MessageService);

  isGenerating = signal<boolean>(false);
  assetData = signal<any>({})

  size: MenuItem[] = [
    { label: 'Landscape', value: '1536x1024' },
    { label: 'Portrait', value: '1024x1536' },
    { label: 'Auto', value: '1024x1024' },
  ]

  quality: MenuItem[] = [
    // { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
  ]

  step: number = 1;
  publicApi: string = environment.public;
  url = signal<string>('');
  formBuilder = inject(FormBuilder);
  generateForm = this.formBuilder.group({
    prompt: ['Create an advertisement material Milk for Adult to help them become stronger and bone growth', [ Validators.required ]],
    size: ['1024x1024'],
    quality: ['medium'],
    asset: this.formBuilder.group({
      name: [''],
      type: [''],
      orientation: [''],
      dimension: [''],
      duration: [10],
      sizeKb: [0]
    })
  });

  onStepChanges(data: any) {
    if (data == 2) {
      this.isGenerating.set(true);
      const { asset, ...data } = this.generateForm.value
      this.assetService.onGenerateImage(data).subscribe({
        next: (res: any) => {
          this.url.set(`${this.publicApi}assets/${this.tenantId}/${res.name}`),
          this.generateForm.patchValue({ asset: res });
        },
        error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
        complete: () => this.isGenerating.set(false)
      });
    }
  }

  onUploadAssets() {
    const { asset, ...data } = this.generateForm.value
    this.assetService.onSaveAssets(asset).subscribe({
      next: (res: any) => this.message.add({ severity:'success', summary: 'Success', detail: 'Asset saved successfully!' }),
      error: (err: any) => this.message.add({ severity:'error', summary: 'Error', detail: err.error.message || 'Failed to save asset!' }),
      complete: () => {
        this.generateForm.reset();
        this.showPrompt.set(false)
      }
    });
  }

  get tenantId() {
    return this.storage.get('id');
  }
}
