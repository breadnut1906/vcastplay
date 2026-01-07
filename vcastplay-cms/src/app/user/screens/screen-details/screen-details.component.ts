import { ChangeDetectorRef, Component, computed, inject, signal, ViewChild } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ScreenService } from '../screen.service';
import { UtilityService } from '../../../core/services/utility.service';
import { ConfirmationService, LazyLoadEvent, MenuItem, MessageService, ScrollerOptions } from 'primeng/api';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { GroupService } from '../../settings/groups/group.service';
import { Clipboard } from '@angular/cdk/clipboard';

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
  grouService = inject(GroupService);
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
  groupOptions: ScrollerOptions = {
    delay: 250,
    showLoader: true,
    lazy: true,
    onLazyLoad: this.onLazyLoadGroups.bind(this)
  }
  subGroupOptions: ScrollerOptions = {
    delay: 250,
    showLoader: true,
    lazy: true,
    onLazyLoad: this.onLazyLoadSubGroups.bind(this)
  }

  ngOnInit() {
    const screen: any = this.selectedScreen();     
    if (screen) {
      // format hours date objects
      const hours = screen.hours?.map((hour: any) => ({ 
        ...hour,
        start: new Date(hour.start),
        end: new Date(hour.end),
        oldEnd: hour.end
      })) || [];
      this.screenForm.patchValue({ ...screen, hours });
      const { latitude, longitude } = screen;
      this.onGetLocation({ latitude, longitude });
    } else {
      this.router.navigate([ '/screens/screen-registration' ]);
    }
    this.onLoadGroups();
  }

  ngAfterViewInit() { }


  ngOnDestroy() {
    this.selectedScreen.set(null);
    this.screenForm.reset();
    this.isEditMode.set(false);
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
          next: (res: any) => {
            this.message.add({ severity:'success', summary: 'Success', detail: 'Screen saved successfully!' });
            this.router.navigate([ '/screens/screen-registration' ]);
          },
          error: (err: any) => {
            this.message.add({ severity:'error', summary: 'Error', detail: err.error.message || 'Failed to save screen!' });
          },
          complete: () => {
            this.isEditMode.set(false);
            this.screenForm.reset();
          }
        });
      },
    })
  }

  onClickCancel() {
    this.selectedScreen.set(null);
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
        const { address, lat, lon, display_name } = result;
        this.screenForm.patchValue({ 
          ...address, 
          fullAddress: display_name,
          latitude: parseFloat(lat), 
          longitude: parseFloat(lon), 
          zipCode: address.postcode 
        });
      },
      error: (err: any) => this.message.add({ severity:'error', summary: 'Error', detail: 'Failed to get address from location!' }),
      complete: () => this.loadingAddressSignal.set(false)
    });
  }
  
  onLoadGroups() {
    this.grouService.onLoadGroups(1, 10).then((result: any) => {
      this.loadedGroups.add(1);
      this.groups.set(result);
      const { groupId } = this.screenForm.value;
      if (groupId) this.onLoadSubGroupsById(groupId);
      this.cdr.detectChanges();
    });
  }

  onLoadSubGroupsById(groupId: number) {
    this.grouService.onLoadSubGroupsById(groupId, 1, 10).then((result: any) => {
      this.loadedSubGroups.add(1);
      this.subGroups.set(result);
      this.cdr.detectChanges();
    });
  }

  onLazyLoadGroups(event: LazyLoadEvent | any) {    
    const { itemsPerPage } = this.grouService.paginatedGroups();
    const threshold = 5;
    const loaded = this.groups().length;
    const visibleEnd = (event.first ?? 0) + itemsPerPage;

    // user scrolled near the end of loaded data
    if (visibleEnd < loaded - threshold) return;

    const page = Math.floor(loaded / itemsPerPage) + 1;    
    
    if (this.loadedGroups.has(page)) return;
    this.loadedGroups.add(page);
    this.grouService.onLoadGroups(page, itemsPerPage).then((result: any) => {
      this.groups.update(current => [ ...current, ...result ]);      
      this.cdr.detectChanges();
    });
  }

  onLazyLoadSubGroups(event: LazyLoadEvent | any) {
    const { itemsPerPage } = this.grouService.paginatedSubGroups();

    const threshold = 5;
    const loaded = this.subGroups().length;
    const visibleEnd = (event.first ?? 0) + itemsPerPage;

    // user scrolled near the end of loaded data
    if (visibleEnd < loaded - threshold) return;
    const page = Math.floor(loaded / itemsPerPage) + 1;
    
    if (this.loadedSubGroups.has(page)) this.loadedSubGroups.delete(page);
    this.loadedSubGroups.add(page);

    const groupId = this.formControl('groupId').value;
    this.grouService.onLoadSubGroupsById(groupId, page, itemsPerPage).then((result: any) => {
      this.subGroups.set(result);    
    });  
      this.cdr.detectChanges();
  }

  onSaveGroup(type: string) {
    const groupId = this.formControl('groupId').value;
    if (type == 'group') {
      this.grouService.onSaveGroups(groupId, this.groupForm.value).subscribe({
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
      this.grouService.onSaveSubGroups(groupId, 0, this.groupForm.value).subscribe({
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

  get orientations() { return this.utils.orientations; }
  get resolutions() { return this.utils.resolutions; }

  get locations () { return this.screenService.locations; }
  get landmarks () { return this.screenService.landmarks; }
  get selectedScreen() { return this.screenService.selectedScreen; }
  get screenForm() { return this.screenService.screenForm; }
  get isEditMode() { return this.screenService.isEditMode; }
  get types() { return this.screenService.types; }
  get tagControl() { return this.screenService.tagControl; }
  get loadingAddressSignal() { return this.screenService.loadingAddressSignal; }
  
}
