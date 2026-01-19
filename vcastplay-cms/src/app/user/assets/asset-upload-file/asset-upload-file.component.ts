import { Component, ElementRef, EventEmitter, inject, Input, Output, signal, ViewChild } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { Assets, UploadItem } from '../assets';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { AssetsService } from '../assets.service';
import { environment } from '../../../../environments/environment.development';
import { MessageService } from 'primeng/api';
import { StorageService } from '../../../core/services/storage.service';
import { UtilityService } from '../../../core/services/utility.service';
import { HttpEventType } from '@angular/common/http';
import { v7 as uuidv7 } from 'uuid';
import { AssetPreviewComponent } from '../asset-preview/asset-preview.component';

@Component({
  selector: 'app-asset-upload-file',
  imports: [ PrimengUiModule, AssetPreviewComponent ],
  templateUrl: './asset-upload-file.component.html',
  styleUrl: './asset-upload-file.component.scss'
})
export class AssetUploadFileComponent {

  @Input() asset: Assets | any;
  @Input() dialog = signal<boolean>(false);
  @Input() isEdit = signal<boolean>(false);

  @Output() isShowDialogChange = new EventEmitter<boolean>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  assetService = inject(AssetsService);
  storage = inject(StorageService);
  utils = inject(UtilityService);
  message = inject(MessageService);

  fileTypeCtrl: FormControl = new FormControl('file', { nonNullable: true });

  formBuilder = inject(FormBuilder);
  assetLinkForm = this.formBuilder.group({
    name: ['', Validators.required],
    link: ['', Validators.required],
    duration: [''],
    orientation: [''],
    dimension: [''],
    type: [''],
    sizeKb: [0]
  })

  publicApi: string = environment.public;
  isUploading = signal<boolean>(false);
  uploadItems = signal<UploadItem[]>([]);

  onChangeType(event: any) {
    this.assetLinkForm.reset();
    this.assetLinkForm.patchValue({ type: event.value, link: null, });
  }

  onPropertiesChange(event: any) {
    this.assetLinkForm.patchValue(event);
    const asset = this.assetLinkForm.value;
    this.assetService.onSaveAssets(asset).subscribe({
      next: (res: any) => this.message.add({ severity:'success', summary: 'Success', detail: 'Asset updated successfully!' }),
      error: (err: any) => this.message.add({ severity:'error', summary: 'Error', detail: err.error.message || 'Failed to update asset!' }),
      complete: () => { }
    });
  }

  onHideDialog() {
    this.isShowDialogChange.emit(false);
    this.dialog.set(false);
    this.uploadItems.set([]);
    this.assetLinkForm.reset();
  }

  async onFileSelectedOrDropped(event: Event | DragEvent) {
    try {
      this.isUploading.set(true);
      const files = (event instanceof DragEvent) ? Array.from(event.dataTransfer?.files || []) : (event.target as HTMLInputElement).files as FileList;
      
      const newFiles: any = Array.from(files).map((file: any) => ({ id: uuidv7(), file, progress: 0, status: 'pending' }));
      this.uploadItems.set(newFiles);

      this.uploadItems().forEach((item) => this.onFileUpload(item));
    } catch (error: any) {
      this.message.add({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to process file' });
    }
  }

  onFileUpload(item: UploadItem) {
    item.status = 'uploading';
    item.sub = this.assetService.onUploadAssets(item.file).subscribe({
      next: async (event: any) => {
        if (event.type == HttpEventType.UploadProgress && event.total) {
          item.progress = Math.round((event.loaded / event.total) * 100);
        }

        if (event.type == HttpEventType.Response) {
          item.status = 'success';
          item.progress = 100;
          const result = await this.assetService.processFile(item.file);
          this.assetService.onSaveAssets(result).subscribe({
            next: (res: any) => {
              item.body = res;
            },
            error: (err: any) => {
              item.status = 'error';
              item.progress = 0;
              item.error = err;
              console.error(`Upload failed: ${item.file.name}`, err);
              this.onCheckAllDone()
            }
          });
        }
      },
      error: (error: any) => {
        item.status = 'error';
        item.progress = 0;
        item.error = error;
        console.error(`Upload failed: ${item.file.name}`, error);
        this.onCheckAllDone()
      },
      complete: () => this.onCheckAllDone()
    })
  }

  onCheckAllDone() {
    const finished = this.uploadItems().every(i => i.status === 'success' || i.status === 'error' || i.status === 'cancel');
    if (finished) this.isUploading.set(false);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
  }

  onClickRetryFile(item: UploadItem) {
    this.isUploading.set(true);
    this.onFileUpload(item);
    this.onCheckAllDone();
  }

  onClickRemoveFile(item: UploadItem) {
    if (item.sub && !item.sub.closed) {
      item.sub.unsubscribe();
      item.status = 'cancel';
    }

    // Remove from UI list
    this.uploadItems.set(this.uploadItems().filter(i => i.id !== item.id))

    this.onCheckAllDone();

    if (item.status === 'success' && item.body) {
      
      this.assetService.onDeleteAssets(item.body).subscribe({
        next: (res: any) => this.message.add({ severity:'success', summary: 'Success', detail: 'File deleted successfully!' }),
        error: (err: any) => this.message.add({ severity:'error', summary: 'Error', detail: err.error.message || 'Failed to delete file!' }),
      });
    }
  }

  get tenantId() {
    return this.storage.get('id');
  }

  get hasLink() {
    return this.assetLinkForm.get('link')?.value;
  }
}
