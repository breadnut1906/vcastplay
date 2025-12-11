import { Component, computed, inject } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ScreenService } from '../../../core/services/screen.service';
import { UtilityService } from '../../../core/services/utility.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { TagService } from '../../settings/tags/tag.service';

@Component({
  selector: 'app-screen-details',
  imports: [ PrimengUiModule, ComponentsModule,  ],
  templateUrl: './screen-details.component.html',
  styleUrl: './screen-details.component.scss',

})
export class ScreenDetailsComponent {

  pageInfo: MenuItem = [ {label: 'Screens'}, {label: 'Registration', routerLink: '/screens/screen-registration'}, {label: 'Details'} ];

  screenService = inject(ScreenService);
  tagService = inject(TagService);
  utils = inject(UtilityService);
  confirmation = inject(ConfirmationService);
  message = inject(MessageService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  markers = computed(() => {
    return [ this.address?.value ]
  })

  tagsFilter = computed(() => {
    return null //this.tagsLists().find(tag => tag.id.includes('tags')).data();
  })

  filterGroups = computed(() => {
    return null //this.tagsLists().find(tag => tag.id.includes('groups')).data();
  })

  filterSubGroups = computed(() => {
    return null //this.tagsLists().find(tag => tag.id.includes('subGroups')).data();
  })

  ngOnInit() { }

  ngOnDestroy() {
    this.selectedScreen.set(null);
    this.screenForm.reset();
    this.isEditMode.set(false);
  }

  onClickAddTag() {
    const tags = this.tags?.value || [];
    const tag = this.tagControl.value;
    if (tags?.includes(tag)) {
      this.message.add({ severity: 'error', summary: 'Error', detail: 'Tag already added' });
      return;
    }
    if (tag) {
      this.tags?.setValue([...tags, tag]);
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
        console.log(this.screenForm.value);
          
        this.message.add({ severity:'success', summary: 'Success', detail: 'Screen registered successfully!' });
        this.screenService.onSaveScreen(this.screenForm.value);
        this.router.navigate([ '/screens/screen-registration' ]);
        this.screenForm.reset();
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

  onGetLocation(event: any) {
    this.loadingAddressSignal.set(true);
    this.utils.getReverseGeolocation(event.latitude, event.longitude).subscribe((result: any) => {
      const { address, lat, lon, display_name } = result;
      this.screenForm.patchValue({ address: { 
        ...address, 
        fullAddress: display_name,
        latitude: parseFloat(lat), 
        longitude: parseFloat(lon), 
        zipCode: address.postcode 
      }});  
      this.loadingAddressSignal.set(false);    
    })
  }

  formControl(fieldName: string) {
    return this.utils.getFormControl(this.screenForm, fieldName);
  }
  
  formControlGeographic(fieldName: string) {
    return this.formControl('geograhic').get(fieldName) as FormControl;
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
  
  get address() { return this.screenForm.get('address'); }
  get tags() { return this.screenForm.get('tags'); }

  get tagsLists() { return null }//this.tagService.tagsLists; }
}
