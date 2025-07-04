import { computed, Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Screen } from '../interfaces/screen';
import { SelectOption } from '../interfaces/general';

@Injectable({
  providedIn: 'root'
})
export class ScreenService {

  isEditMode = signal<boolean>(false);

  private screenSignal = signal<Screen[]>([]);
  screens = computed(() => this.screenSignal());

  loadingSignal = signal<boolean>(false);

  selectedScreen = signal<Screen | null>(null);
  
  rows = signal<number>(8);
  totalRecords = signal<number>(0);

  screenForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    code: new FormControl(''),
    name: new FormControl('', [ Validators.required ]),
    type: new FormControl(null, [ Validators.required ]),
    group: new FormControl(null, [ Validators.required ]),
    subGroup: new FormControl(null, [ Validators.required ]),
    displaySettings: new FormGroup({
      orientation: new FormControl(null, [ Validators.required ]),
      resolution: new FormControl(null, [ Validators.required ]),
    }),
    geolocation: new FormGroup({
      latitude: new FormControl(0),
      longitude: new FormControl(0),
    }),
    schedule: new FormGroup({
      operation: new FormControl(null, [ Validators.required ]),
      hours: new FormControl(null, [ Validators.required ]),
    }),
    geographicalLocation: new FormGroup({
      location: new FormControl(null, [ Validators.required ]),
      landmark: new FormControl(null, [ Validators.required ]),
    }),
    status: new FormControl(''),
  });

  groupData: any[] = [
    { label: 'Group 1', value: 'Group 1', subGroup: [{ label: 'Sub-Group 1', value: 'Sub-Group 1' }] },
    { label: 'Group 2', value: 'Group 2', subGroup: [{ label: 'Sub-Group 2', value: 'Sub-Group 2' }] },
  ]

  location = signal<SelectOption[]>([
    { label: 'Local', value: 'local' },
    { label: 'Global', value: 'global' },
    { label: 'National', value: 'national' },
    { label: 'International', value: 'iInternational' },
    { label: 'Regional', value: 'regional' },
  ]);

  landmarks = signal<SelectOption[]>([
    { label: 'Mountains', value: 'mountains' },
    { label: 'Rivers', value: 'rivers' },
    { label: 'Ancient Ruins', value: 'ancient Ruins' },
    { label: 'Castles', value: 'castles' },
    { label: 'Skyscrapers', value: 'skyscrapers' },
  ]);

  orientations = signal<SelectOption[]>([
    { label: 'Landscape', value: 'landscape' },
    { label: 'Portrait', value: 'portrait' },
  ]);
  resolution = signal<SelectOption[]>([
    { label: '1920x1080', value: '1920x1080' },
    { label: '1366x768', value: '1366x768' },
    { label: '1600x900', value: '1600x900' },
    { label: '2560x1440', value: '2560x1440' },
    { label: '3840x2160', value: '3840x2160' },
    { label: '1920x1200', value: '1920x1200' },
    { label: '1440x900', value: '1440x900' },
    { label: '1280x800', value: '1280x800' },
    { label: '1024x768', value: '1024x768' },
    { label: '800x600', value: '800x600' },
  ]);

  operationSchedule = signal<SelectOption[]>([
    { label: 'Always On', value: 'always' },
    { label: 'Week Days with Hours', value: 'weekdays' },
  ]);

  filterGroup = computed(() => this.groupData.map(group => ({ label: group.label, value: group.value })));
  filterSubGroup = computed(() => this.groupData.map(group => group.subGroup).flat().map(subGroup => ({ label: subGroup.label, value: subGroup.value })));

  constructor() { }

  onLoadScreens() {
    /**Call GET roles API */
    this.screenSignal.set([
      { 
        id: 1,
        code: 'NYX001',
        name: 'PLAYER-NYX001',
        type: 'desktop',
        address: {
          country: 'Philippines',
          region: 'Manila',
          city: 'Quezon City',
          latitude: 14.6091,
          longitude: 121.0223,
          zipCode: '1100'
        },
        displaySettings: {
          orientation: 'landscape',
          resolution: '1920x1080'
        },
        status: 'inactive',
        createdOn: new Date('2024-01-01'),
        updatedOn: new Date('2024-02-01'),
      },
    ]);
    this.totalRecords.set(this.screens().length);
  }

  onGetScreens() {
    if (this.screens().length === 0) this.onLoadScreens();
    return this.screens();
  }

  onGetScreenByCode(code: string) {
    /**Call GET screen by code or id API */
    return new Promise((resolve, reject) => {
      const screen = this.screens().find(s => s.code === code);
      if (screen) resolve(screen);
    })
  }

  onRefreshScreens() {
    this.screenSignal.set([]);
    this.onLoadScreens();
  }

  onSaveScreen(screen: Screen) {
    /**Call POST/PATCH role API */
    const tempScreens = this.screens();
    const { id, code, status, ...info } = screen;
    const index = tempScreens.findIndex(s => s.id === id);
    if (index !== -1) tempScreens[index] = { ...tempScreens[index], ...info };
    else tempScreens.push({ id: tempScreens.length + 1, code: `NYX00${tempScreens.length + 1}`, status: 'inactive', ...info, createdOn: new Date(), updatedOn: new Date() });

    this.screenSignal.set([...tempScreens]);
  }

  onDeleteScreen(screen: Screen) {
    /**Call DELETE role API */
    const tempScreens = this.screens().filter(s => s.id !== screen.id);
    this.screenSignal.set([...tempScreens]);
  }
}
