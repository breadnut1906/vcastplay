import { computed, inject, Injectable, signal } from '@angular/core'
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms'
import { Assets } from './assets'
import { SelectOption } from '../../shared/interfaces/general';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../../core/services/storage.service';
import { UtilityService } from '../../core/services/utility.service';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class AssetsService {

  api: string = environment.api;

  http = inject(HttpClient)
  storage = inject(StorageService)
  utils = inject(UtilityService)

  private assetSignal = signal<Assets[]>([])
  assets = computed(() => this.assetSignal())

  selectedAsset = signal<Assets | any>(null);
  selectedArrAssets = signal<Assets[]>([])

  first = signal<number>(0)
  rows = signal<number>(8)
  totalRecords = signal<number>(0)

  loadingSignal = signal<boolean>(false)
  isEditMode = signal<boolean>(false)
  isLoading = signal<boolean>(false)
  showPrompt = signal<boolean>(false)

  assetType = signal<SelectOption[]>([
    { label: 'File', value: 'file' },
    { label: 'Web Page', value: 'link' },
    // { label: 'Widgets', value: 'widget' },
    // { label: 'Youtube', value: 'youtube' },
    // { label: 'Facebook', value: 'facebook' },
  ])

  assetTypeControl: FormControl = new FormControl('file', { nonNullable: true })

  assetViewModeSignal = signal<string>('Grid')
  assetViewModeCtrl: FormControl = new FormControl('Grid')
  assetViewModes = [
    { icon: 'pi pi-table', label: 'Grid' },
    { icon: 'pi pi-list', label: 'List' },
  ]
  
  assetFilterForm: FormGroup = new FormGroup({
    dateRange: new FormControl(null),
    category: new FormControl(null),
    subCategory: new FormControl(null),
    type: new FormControl(null),
    orientation: new FormControl(null),
    keywords: new FormControl(null),
    audienceTags: new FormControl([]),
  })

  
  MAX_SIZE: number = 300 * 1024 * 1024; // 300MB

  constructor() {}

  dateRangeValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const start = group.get('start')?.value
      const end = group.get('end')?.value
      if (start && end && new Date(start) > new Date(end)) {
        return { startAfterEnd: true }
      }
      return null
    }
  }
  
  durationValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.get('duration')?.value as string;
      
      if (!value) return null;

      const [hh, mm, ss] = value.split(':').map(Number);

      if ([hh, mm, ss].some(v => isNaN(v))) return { invalidTime: true };

      const totalSeconds = (hh * 3600) + (mm * 60) + ss;      

      return totalSeconds > 86400 ? { max24Hours: true } : null;
    };
  }

  onDateTimeConversions(asset: Assets, isReverse: boolean = false): Assets {
    if (isReverse) {
      return {
        ...asset,
        start: asset.start ? moment(asset.start).toISOString() : null,
        end: asset.end ? moment(asset.end).toISOString() : null,
      };
    }

    const hours = asset.hours?.map((hour: any) => ({ ...hour, start: moment(hour.start).toDate(), end: moment(hour.end).toDate() })) || [];
    const start = asset.start ? moment(asset.start).toDate() : null;
    const end = asset.end ? moment(asset.end).toDate() : null;

    return { ...asset, hours, start, end };
  }

  onGetHTTPHeaders() {
    const tenantId = this.storage.get('id');
    const accessToken = `bearer ${this.storage.get('accessToken')}`;
    const headers = new HttpHeaders({ 'x-tenant-id': tenantId, 'Authorization': accessToken });
    return headers;
  }  

  onLoadAssets(page: number = 1, limit: number = 8) {
    return this.http.get(`${this.api}tenants/assets?page=${page}&limit=${limit}`, { headers: this.onGetHTTPHeaders() });
  }

  onGetAssetById(id: number) {
    return this.http.get(`${this.api}tenants/assets/${id}`, { headers: this.onGetHTTPHeaders() });
  }

  onUploadAssets(file: File) {
    const formData = new FormData();
    formData.append("file", file, file.name);

    return this.http.post(`${this.api}tenants/assets/upload`, formData, { headers: this.onGetHTTPHeaders(), reportProgress: true, observe: 'events' });
  }

  onGenerateImage(body: any) {
    return this.http.post(`${this.api}tenants/assets/generate-image`, body, { headers: this.onGetHTTPHeaders() });
  }

  onGetAssets() {
    if (this.assetSignal().length === 0) this.onLoadAssets()
    return this.assetSignal()
  }

  onRefreshRoles() {
    this.assetSignal.set([])
    this.onLoadAssets()
  }

  onPageChange(event: any) {
    this.first.set(event.first)
    this.rows.set(event.rows)
  }

  onSaveAssets(assets: Assets | any) {
    return this.http.post(`${this.api}tenants/assets`, assets, { headers: this.onGetHTTPHeaders() });
  }

  onUpdateAssets(id: any, assets: Assets | any) {
    return this.http.patch(`${this.api}tenants/assets/${id}`, assets, { headers: this.onGetHTTPHeaders(), reportProgress: true, observe: 'events' });
  }

  onDeleteAssets(assets: Assets) {
    return this.http.delete(`${this.api}tenants/assets/${assets.id}`, { headers: this.onGetHTTPHeaders() });
  }

  onDuplicateAssets(assets: Assets) {
    console.log(assets);
    /**CALL POST API */
  }

  onFilterChange(value: any) {
    console.log(value)
  }

  async processFile(file: File): Promise<any | any> {
    if (!file) return null;    
    
    const name = file.name;
    const sizeKb = file.size;
    const type = file.type.split('/')[0];    

    switch (type) {
      case 'image':
        const metaDataImage: any = await this.getImageMetaData(file);
        return { name, sizeKb, type, duration: 10, ...metaDataImage };
      case 'video':
        const metaDataVideo: any = await this.getVideoMetaData(file);
        return { name, sizeKb, type, ...metaDataVideo };
      case 'audio':
        const metaDataAudio: any = await this.getAudioMetaData(file);
        return { name, sizeKb, type, ...metaDataAudio };
      // Get file type if text/html,
      default:
        const fileType = file.type.split('/')[1];
        return { name, sizeKb, type: fileType, duration: 10, orientation: 'square', dimension: '100x100' };
    }
  }

  private async getImageMetaData(file: File): Promise<any> {
    const img = new Image();

    const promise = new Promise<any>((resolve, reject) => {
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const orientation = width > height ? 'landscape' : height > width ? 'portrait' : 'square';

        resolve({ dimension: `${width}x${height}`, orientation });
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      }

      img.src = URL.createObjectURL(file);
    });

    return promise;
  }
  
  private getVideoMetaData(file: File): Promise<any> {
    const video = document.createElement('video');
    const promise = new Promise<any>((resolve, reject) => {
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const duration = Math.floor(video.duration);        
        const dimension = `${video.videoWidth}x${video.videoHeight}`;
        const orientation = video.videoWidth > video.videoHeight ? 'landscape' : video.videoHeight > video.videoWidth ? 'portrait' : 'square';

        resolve({ duration, dimension, orientation });
        URL.revokeObjectURL(video.src);
      }
      video.onerror = () => {
        reject(new Error('Failed to load video'));
      }
      video.src = URL.createObjectURL(file);
    });

    return promise;
  }

  private getAudioMetaData(file: File): Promise<any> {
    const audio = document.createElement('audio');
    const promise = new Promise<any>((resolve, reject) => {
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => {
        const duration = Math.floor(audio.duration);        
        const dimension = `100x100`;
        const orientation = 'square';

        resolve({ duration, dimension, orientation });
        URL.revokeObjectURL(audio.src);
      }
      audio.onerror = () => {
        reject(new Error('Failed to load audio'));
      }
      audio.src = URL.createObjectURL(file);
    });

    return promise;
  }
}
