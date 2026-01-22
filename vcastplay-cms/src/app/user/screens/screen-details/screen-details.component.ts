import { ChangeDetectorRef, Component, computed, inject, signal, ViewChild } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ScreenService } from '../screen.service';
import { UtilityService } from '../../../core/services/utility.service';
import { ConfirmationService, LazyLoadEvent, MenuItem, MessageService, ScrollerOptions } from 'primeng/api';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GroupService } from '../../settings/groups/group.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { Group } from '../../settings/groups/group';
import { Pagination } from '../../../shared/interfaces/general';

@Component({
  selector: 'app-screen-details',
  imports: [ PrimengUiModule, ComponentsModule,  ],
  templateUrl: './screen-details.component.html',
  styleUrl: './screen-details.component.scss',

})
export class ScreenDetailsComponent {

  pageInfo: MenuItem = [ {label: 'Screens'}, {label: 'Registration', routerLink: '/screens/screen-registration'}, {label: 'Details'} ];

  screenService = inject(ScreenService);
  utils = inject(UtilityService);
  confirmation = inject(ConfirmationService);
  message = inject(MessageService);
  groupService = inject(GroupService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  clipboard = inject(Clipboard);
  cdr = inject(ChangeDetectorRef);

  groups = signal<any[]>([]);
  subGroups = signal<any[]>([]);
  loadedGroups = new Set<number>();
  loadedSubGroups = new Set<number>();
  isShowGroupForm = signal<boolean>(false);
  isShowSubGroupForm = signal<boolean>(false);
  groupForm: FormGroup = new FormGroup({
    name: new FormControl(null),
    description: new FormControl(null)
  })
  
  showScheduler = signal<boolean>(false);  

  groupOptions = {
    items: signal<Group[]>([]),
    loader: false,
    meta: signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 }),
    loadedPage: new Set<number>()
  }
  
  subGroupOptions = {
    groupId: 0,
    items: signal<Group[]>([]),
    loader: false,
    meta: signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 }),
    loadedPage: new Set<number>()
  }

  isShowInfo = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  formBuilder = inject(FormBuilder);
  screenForm = this.formBuilder.group({
    id: [null],
    code: [null],
    uniqueId: [null],
    name: [null, Validators.required],
    type: [null, Validators.required],
    country: ['Philippines', Validators.required],
    region: [null],
    city: [null],
    fullAddress: [null, Validators.required],
    latitude: [0],
    longitude: [0],
    zipCode: [null],
    groupId: [null, Validators.required],
    subGroupId: [null, Validators.required],
    orientation: [null],
    resolution: [null],
    isAllDay: [true],
    isAllWeekdays: [false],
    weekdays: [[]],
    hours: [[]],
    location: [null],
    landmark: [null],
    tags: [[]],
    info: [null],
    adminScreenId:[0],
  })

  ngOnInit() {
    this.onLoadGroups();
    this.route.queryParams.subscribe(params => {
      const { id } = params;
      if (this.selectedScreen()) {
        // from verify screen
        this.screenForm.patchValue(this.selectedScreen());
        this.onGetLocation({ latitude: 14.6090, longitude: 121.0223 });
      } else {
        if (id) {
          this.isEditMode.set(true);
          this.onLoadScreenById(id);
        } else {
          this.router.navigate([ '/screens/screen-registration' ]);
        }
      }
    })
  }

  ngAfterViewInit() { }

  ngOnDestroy() {
    this.selectedScreen.set(null);
    this.screenForm.reset();
    this.isEditMode.set(false);
  }

  onLoadScreenById(id: number) {
    this.isLoading.set(true);
    this.screenService.onGetScreenById(id).subscribe({
      next: (res: any) => {
        if (!res) this.router.navigate([ '/screens/screen-registration' ]);
        this.selectedScreen.set(res);
        const { latitude, longitude, hours, groupId }: any = res || {};
        const hour = hours?.map((hour: any) => ({ ...hour, start: new Date(hour.start), end: new Date(hour.end), oldEnd: hour.end })) || [];
        this.screenForm.patchValue({ ...res, hours: hour });
        if (groupId) this.onLoadSubGroups(groupId);
        if (latitude && longitude) this.onGetLocation({ latitude, longitude });
      },
      error: (err: any) => this.message.add({ severity: 'error', summary: 'Error', detail: err.error.message || 'Failed to load screen!' }),
      complete: () => this.isLoading.set(false)
    });
  }

  onClickAddTag() {
    const tags = this.formControl('tags').value || [];
    const tag = this.tagControl.value;
    if (tags?.includes(tag)) {
      this.message.add({ severity: 'error', summary: 'Error', detail: 'Tag already added' });
      return;
    }
    if (tag) {
      this.formControl('tags').setValue([...tags, tag]);
      this.tagControl.reset();
    }
  }

  onClickSave(event: Event) {
    if (this.screenForm.invalid) {
      this.screenForm.markAllAsTouched();
      this.message.add({ severity: 'error', summary: 'Error', detail: 'Please input required fields (*)' });
      return;
    }

    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to save changes?',
      closable: true,
      closeOnEscape: true,
      header: 'Confirm Save',
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Save',
      },
      accept: () => {
        const mode = this.isEditMode() ? 'edit' : 'create';
        const { id, uniqueId, ...info } = this.screenForm.value;
        this.screenService.onSaveScreen(id, info, mode).subscribe({
          next: (res: any) => this.message.add({ severity:'success', summary: 'Success', detail: 'Screen saved successfully!' }),
          error: (err: any) => this.message.add({ severity:'error', summary: 'Error', detail: err.error.message || 'Failed to save screen!' }),
          complete: () => {
            this.router.navigate([ '/screens/screen-registration' ]);
            this.isEditMode.set(false);
            this.screenForm.reset();
          }
        });
      },
    })
  }

  onClickCancel() {
    // this.selectedScreen.set(null);
    this.screenForm.reset();
    this.router.navigate([ '/screens/screen-registration' ]);
  }

  onClickRemoveTag(event: Event, tag: string) {
    this.screenService.onRemoveTag(tag)
  }

  onGetCurrentLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      this.onGetLocation({ latitude, longitude });
    });
  }

  onGetLocation(event: any) {
    this.loadingAddressSignal.set(true);
    this.utils.getReverseGeolocation(event.latitude, event.longitude).subscribe({
      next: (result: any) => {
        const { address, display_name } = result;
        this.screenForm.patchValue({ 
          ...address, 
          fullAddress: display_name,
          latitude: event.latitude.toFixed(6), 
          longitude: event.longitude.toFixed(6), 
          zipCode: address.postcode 
        });
      },
      error: (err: any) => this.message.add({ severity:'error', summary: 'Error', detail: 'Failed to get address from location!' }),
      complete: () => this.loadingAddressSignal.set(false)
    });
  }
  
  onLoadGroups(page: number = 1, limit: number = 10) {
    this.groupOptions.loader = true;
    this.groupService.onLoadGroup(page, limit).subscribe({
      next: (res: any) =>  {
        this.groupOptions.meta.set(res.meta);
        this.groupOptions.items.set(this.utils.onMergeVirtualPage(
          this.groupOptions.items(),
          page,
          limit,
          res.meta.itemCount,
          res.items
        ));
      },
      error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
      complete: () => this.groupOptions.loader = false
    })
  }

  onLazyLoadGroups(event: LazyLoadEvent | any) {
    this.subGroupOptions.loadedPage.clear();
    this.subGroupOptions.items.set([]);

    const total = this.groupOptions.meta()?.itemsPerPage;
    const page = event.first + 1;    
    
    if (this.groupOptions.loadedPage.has(page)) return;
    this.groupOptions.loadedPage.add(page);
    this.onLoadGroups(page, total);
  }

  onLoadSubGroups(groupId: number, page: number = 1, limit: number = 10) {
    this.subGroupOptions.loader = true;
    this.subGroupOptions.groupId = groupId;    
    // this.screenForm.get('subGroupId')?.reset();
    this.groupService.onLoadSubGroupById(groupId, page, limit).subscribe({
      next: (res: any) =>  {
        this.subGroupOptions.meta.set(res.meta);
        this.subGroupOptions.items.set(this.utils.onMergeVirtualPage(
          this.subGroupOptions.items(),
          page,
          limit,
          res.meta.itemCount,
          res.items
        ));
      },
      error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
      complete: () => this.subGroupOptions.loader = false
    })
  }
  
  onLazyLoadSubGroups(event: any) {
    const { groupId, meta } = this.subGroupOptions;
    const total = meta()?.itemsPerPage;
    const page = event.first + 1;    
    
    if (this.subGroupOptions.loadedPage.has(page)) return;
    this.subGroupOptions.loadedPage.add(page);
    this.onLoadSubGroups(groupId, page, total);
  }

  onSaveGroup(type: string) {
    const groupId = this.formControl('groupId').value;
    if (type == 'group') {
      this.groupService.onSaveGroups(groupId, this.groupForm.value).subscribe({
        next: (res: any) => {
          this.message.add({ severity:'success', summary: 'Success', detail: 'Group updated successfully!' }),
          this.groups().push(res);
        },
        error: () => this.message.add({severity:'error', summary: 'Error', detail: 'Failed to update group!' }),
        complete: () => {
          this.isShowGroupForm.set(false);
          this.groupForm.reset();
        }
      });
    } else {
      this.groupService.onSaveSubGroups(groupId, 0, this.groupForm.value).subscribe({
        next: (res: any) => {
          this.message.add({severity:'success', summary: 'Success', detail: 'Sub Group updated successfully!' }),
          this.subGroups().push(res);
        },
        error: () => this.message.add({severity:'error', summary: 'Error', detail: 'Failed to update sub group!' }),
        complete: () => {
          this.isShowSubGroupForm.set(false);
          this.groupForm.reset();
        }
      });
    }
  }

  onCopyToClipboard(fieldName: string) {
    const value = this.formControl(fieldName).value;
    this.clipboard.copy(value);
    this.message.add({ severity:'success', summary: 'Success', detail: `${fieldName} copied to clipboard!` });
  }

  formControl(fieldName: string) {
    return this.utils.getFormControl(this.screenForm, fieldName);
  }


  get isEditMode() { return this.screenService.isEditMode; }
  get types() { return this.screenService.types; }
  get tagControl() { return this.screenService.tagControl; }
  get loadingAddressSignal() { return this.screenService.loadingAddressSignal; }
  
  get screen() { return this.screenForm.value as Screen | any }
  get selectedScreen() { return this.screenService.selectedScreen; }
}
