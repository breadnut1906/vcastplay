import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { DesignLayoutService } from '../design-layout.service';
import { UtilityService } from '../../../core/services/utility.service';
import { Menu } from 'primeng/menu';
import { Router } from '@angular/router';
import { DesignLayout } from '../design-layout';

@Component({
  selector: 'app-design-layout-list',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './design-layout-list.component.html',
  styleUrl: './design-layout-list.component.scss',
})
export class DesignLayoutListComponent {

  @ViewChild('viewport', { static: true }) viewportElement!: ElementRef<HTMLDivElement>;

  pageInfo: MenuItem = [ { label: 'Designs' }, { label: 'Lists' } ];
  actionItems: MenuItem[] = [
    { 
      label: 'Options',
      items: [
        { label: 'Preview', icon: 'pi pi-eye', command: ($event: any) => { this.onClickPreview(this.selectedRow()); } },
        { label: 'Duplicate', icon: 'pi pi-copy', command: ($event: any) => this.onClickDuplicate(this.selectedRow()) },
        { label: 'Delete', icon: 'pi pi-trash', command: ($event: any) => this.onClickDelete(this.selectedRow(), $event) }  
      ]
    }
  ];

  designLayoutService = inject(DesignLayoutService)
  utils = inject(UtilityService)
  router = inject(Router)
  confirmation = inject(ConfirmationService)
  message = inject(MessageService)

  filteredDesigns = computed(() => {
    const design = this.designLayoutService.designs();
    return design;
  })

  selectedRow = signal<DesignLayout | null>(null);

  ngOnInit() {
    this.designLayoutService.onGetDesigns();
  }

  onClickAddNew() {
    this.isEditMode.set(false);
    this.router.navigate([ '/layout/design-layout-details' ]);
  }

  onClickRefresh() { }

  onClickEdit(design: any) {
    this.isEditMode.set(true);
    this.designForm.patchValue(design);
    this.router.navigate([ '/layout/design-layout-details' ]);
  }

  onClickDelete(design: any, event: Event) {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this design?',
      closable: true,
      closeOnEscape: true,
      header: 'Danger Zone',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },
      accept: () => {
        this.designLayoutService.onDeleteDesign(design);
        this.message.add({ severity:'success', summary: 'Success', detail: 'Design deleted successfully!' });
        this.selectedRow.set(null);
        this.selectedDesign.set(null);
        this.designForm.reset();
      },
      reject: () => { }
    })
  }

  onClickDuplicate(design: any) {
    const { approvedInfo, ...info } = design;
    this.designLayoutService.onDuplicateDesign(info);
    this.message.add({ severity:'success', summary: 'Success', detail: 'Design duplicated successfully!' });
  }
  
  onClickOptions(event: Event, design: DesignLayout, menu: Menu) {
    this.selectedRow.set(design);
    menu.toggle(event);
  }

  onClickConfirmApproved(event: Event, popup: any, type: string) { }

  onClickApproved(event: any, item: any, popup: any, isShow: boolean = true) {
    if (isShow) {
      popup.toggle(event);
      this.designForm.patchValue(item);
    } else {
      this.showApprove.set(false);
      popup.hide();
    }
  }

  onClickPreview(design: any) {
    this.showPreview.set(true);
    setTimeout(() => this.selectedDesign.set(design), 500);
  }

  get rows() { return this.designLayoutService.rows; }
  get isEditMode() { return this.designLayoutService.isEditMode; }
  get designForm() { return this.designLayoutService.designForm; }
  get showPreview() { return this.designLayoutService.showPreview; }
  get showApprove() { return this.designLayoutService.showApprove; }
  get totalRecords() { return this.designLayoutService.totalRecords; }
  get loadingSignal() { return this.designLayoutService.loadingSignal; }
  get designValue() { return this.designLayoutService.designForm.value; }
  get selectedDesign() { return this.designLayoutService.selectedDesign; }

  get status() { return this.designForm.get('status'); }
  get approvedInfo() { return this.designForm.get('approvedInfo'); }
}
