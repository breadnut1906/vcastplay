import { computed, Injectable, signal } from '@angular/core'
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms'
import { Assets } from './assets'
import heic2any from 'heic2any';
import { SelectOption } from '../../shared/interfaces/general';

@Injectable({
  providedIn: 'root',
})
export class AssetsService {
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
    { label: 'Web Pages', value: 'web' },
    // { label: 'Widgets', value: 'widget' },
    { label: 'Youtube', value: 'youtube' },
    { label: 'Facebook', value: 'facebook' },
  ])

  assetTypeControl: FormControl = new FormControl('file', { nonNullable: true })

  assetViewModeSignal = signal<string>('Grid')
  assetViewModeCtrl: FormControl = new FormControl('Grid')
  assetViewModes = [
    { icon: 'pi pi-table', label: 'Grid' },
    { icon: 'pi pi-list', label: 'List' },
  ]

  assetForm: FormGroup = new FormGroup({
    id: new FormControl(0, { nonNullable: true }),
    code: new FormControl(null),
    name: new FormControl(null, [Validators.required]),
    type: new FormControl(null),
    url: new FormControl(null),
    category: new FormControl(null, [Validators.required]),
    subCategory: new FormControl(null, [Validators.required]),
    thumbnail: new FormControl(null),
    duration: new FormControl(10, { nonNullable: true }),
    size: new FormControl(null),
    orientation: new FormControl(null),
    dimensions: new FormControl(null),
    availability: new FormControl<boolean>(false),
    start: new FormControl(null),
    end: new FormControl(null),
    allDay: new FormControl<boolean>(false, { nonNullable: true }),
    allWeekdays: new FormControl<boolean>(false, { nonNullable: true }),
    weekdays: new FormControl<string[]>([], { nonNullable: true }),
    hours: new FormControl<string[]>([], { nonNullable: true }),
    audienceTag: new FormControl(null),
  }, { validators: [this.dateRangeValidator()] })
  
  assetFilterForm: FormGroup = new FormGroup({
    dateRange: new FormControl(null),
    category: new FormControl(null),
    subCategory: new FormControl(null),
    type: new FormControl(null),
    orientation: new FormControl(null),
    keywords: new FormControl(null),
  })

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

  onLoadAssets() {
    /** Get API */
    // this.loadingSignal.set(true);
    // this.totalRecords.set(this.assets().length)
    // this.loadingSignal.set(false);
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

  onSaveAssets(assets: Assets) {
    console.log(assets);
    /**Call POST/PATCH user API */
  }

  onDeleteAssets(assets: Assets) {
    console.log(assets);
    /**Call DELETE user API */
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
    const size = file.size;
    const fileType = file.type.split('/')[0];

    if (file.type.startsWith('image/')) {
      const metaData: any = await this.getImageMetaData(file);
      return { name, size, type: fileType, duration: 10, ...metaData };
    } else {
      const metaData: any = await this.getVideoMetaData(file);
      return { name, size, type: fileType, ...metaData };
    }
  }

  private async getImageMetaData(file: File): Promise<any> {
    const img = new Image();

    const promise = new Promise<any>((resolve, reject) => {
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const orientation = width > height ? 'landscape' : height > width ? 'portrait' : 'square';

        resolve({ dimensions: `${width}x${height}`, orientation });
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
        const dimensions = `${video.videoWidth}x${video.videoHeight}`;
        const orientation = video.videoWidth > video.videoHeight ? 'landscape' : video.videoHeight > video.videoWidth ? 'portrait' : 'square';

        resolve({ duration, dimensions, orientation });
        URL.revokeObjectURL(video.src);
      }
      video.onerror = () => {
        reject(new Error('Failed to load video'));
      }
      video.src = URL.createObjectURL(file);
    });

    return promise;
  }
}
