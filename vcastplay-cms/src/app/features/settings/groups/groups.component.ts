import { Component, effect, inject, Input, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { Group, SubGroup } from './group';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GroupService } from './group.service';
import { MenuItem, MessageService } from 'primeng/api';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { Pagination } from '../../../core/interfaces/general';

@Component({
  selector: 'app-groups',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss'
})
export class GroupsComponent {

  pageInfo: MenuItem = [ {label: 'Settings'}, {label: 'Groups'} ];

  groupService = inject(GroupService);
  message = inject(MessageService);

  isEditGroup = signal<boolean>(false);
  isEditSubGroup = signal<boolean>(false);

  showGroupForm = signal<boolean>(false);
  showSubGroupForm = signal<boolean>(false);

  selectedGroup!: Group | null;
  selectedSubGroup!: SubGroup | null;

  groupData: FormGroup = new FormGroup({
    id: new FormControl(0),
    name: new FormControl(null, [ Validators.required ]),
    description: new FormControl(null, [ Validators.required ]),
  });

  subGroupData: FormGroup = new FormGroup({
    id: new FormControl(0),
    name: new FormControl(null, [ Validators.required ]),
    description: new FormControl(null, [ Validators.required ]),
  });

  constructor() { }

  ngOnInit(): void {
    this.onLoadGroups();
  }

  ngOnDestroy(): void {
    this.subGroups.set([]);
  }

  onLoadGroups() {
    this.groupService.onLoadGroups(1, 10);
  }

  onLoadSubGroupsById(id: number) {
    this.subGroups.set([]);
    this.groupService.onLoadSubGroupsById(id, 1, 10);
  }

  onSelectionChange(item: any, type: string) {
    if (!item) return;
    if (type === 'groups') {
      this.selectedGroup = item;
      this.onLoadSubGroupsById(item.id);
    }
  }

  onClearAll() {
    this.groupData.reset();
    this.subGroupData.reset();
    this.isEditGroup.set(false);
    this.isEditSubGroup.set(false);
  }

  onClickSave(type: string) {
    if (type === 'groups') {
      const { id: groupId, name, description } = this.groupData.value;
      if (this.groupData.invalid) {
        this.message.add({severity:'error', summary: 'Error', detail: 'All fields are required!' });
        return;
      };
      if (this.isEditGroup()) {
        this.groupService.onSaveGroups(groupId, { name, description }, 'update').subscribe({next: (res: any) => {
          const index = this.groups().findIndex((item: any) => item.id === groupId);
          if (index !== -1) this.groups()[index] = res;
          this.message.add({severity:'success', summary: 'Success', detail: 'Group updated successfully!' });
          this.onClickCancel('groups');
        }});
      } else {
        this.groupService.onSaveGroups(groupId, { name, description }, 'create').subscribe({next: (res: any) => {
          this.groups.set([...this.groups(), res]);
          this.message.add({severity:'success', summary: 'Success', detail: 'Group created successfully!' });
          this.onClickCancel('groups');
        }});
      }
    } else {
      if (this.subGroupData.invalid) {
        this.message.add({severity:'error', summary: 'Error', detail: 'All fields are required!' });
        return;
      };
      const groupData: any = this.selectedGroup;
      const { id, name, description } = this.subGroupData.value;
      
      if (this.isEditSubGroup()) {
        this.groupService.onSaveSubGroups(groupData.id, id, { name, description }, 'update').subscribe({next: (res: any) => {
          const index = this.subGroups().findIndex((item: any) => item.id === id && item.groupId === groupData.id);
          if (index !== -1) this.subGroups()[index] = res;
          this.message.add({severity:'success', summary: 'Success', detail: 'Sub Group updated successfully!' });
          this.onClickCancel('sub-groups');
        }});
      } else {
        this.groupService.onSaveSubGroups(groupData.id, id, { name, description }, 'create').subscribe({next: (res: any) => {
          this.subGroups.set([...this.subGroups(), res]);
          this.message.add({severity:'success', summary: 'Success', detail: 'Sub Group created successfully!' });
          this.onClickCancel('sub-groups');
        }});
      }
    }
  }

  onClickEditGroup(item: any, type: string) {
    if (type === 'groups') {
      this.isEditGroup.set(true);
      this.showGroupForm.set(true);
      this.groupData.patchValue(item);
    } else {
      this.isEditSubGroup.set(true);
      this.showSubGroupForm.set(true);
      this.subGroupData.patchValue(item);
    }
  }

  onClickRemoveGroup(item: any, type: string) {
    if (type === 'groups') {
      this.groupService.onDeleteGroups(item.id).subscribe({next: (res: any) => {
        const index = this.groups().findIndex((group: any) => group.id === item.id);
        if (index !== -1) this.groups().splice(index, 1);
        this.message.add({severity:'success', summary: 'Success', detail: 'Group deleted successfully!' });
      }});
    } else {
      this.groupService.onDeleteSubGroups(item.groupId, item.id).subscribe({next: (res: any) => {
        const index = this.subGroups().findIndex((subGroup: any) => subGroup.id === item.id && subGroup.groupId === item.groupId);
        if (index !== -1) this.subGroups().splice(index, 1);
        this.message.add({severity:'success', summary: 'Success', detail: 'Sub Group deleted successfully!' });
      }});
    }
  }

  onClickCancel(type: string) {
    if (type === 'groups') {
      this.isEditGroup.set(false);
      this.showGroupForm.set(false);
      this.groupData.reset();
    } else {
      this.isEditSubGroup.set(false);
      this.showSubGroupForm.set(false);
      this.subGroupData.reset();
    }
  }

  onPageChange(event: any, type: string) {
    const pageNumber = event.first / event.rows + 1;
    if (type === 'groups') {
      this.paginatedGroup.currentPage = pageNumber;
      this.paginatedGroup.itemsPerPage = event.rows;
      this.groupService.onLoadGroups(pageNumber, event.rows);
    } else {
      const groupId = this.selectedGroup ? this.selectedGroup.id : 0;
      this.paginatedSubGroup.currentPage = pageNumber;
      this.paginatedSubGroup.itemsPerPage = event.rows;
      this.groupService.onLoadSubGroupsById(groupId, pageNumber, event.rows);
    }
  }

  get groups() {
    return this.groupService.groups;
  }

  get paginatedGroup() {
    return this.groupService.paginatedGroups();
  }

  get groupLoading() {
    return this.groupService.groupLoading;
  }

  get subGroups() {
    return this.groupService.subGroups;
  }

  get paginatedSubGroup() {
    return this.groupService.paginatedSubGroups();
  }

  get subGroupLoading() {
    return this.groupService.subGroupLoading;
  }
}
