import { inject, Injectable, signal } from '@angular/core';
import { StorageService } from '../../../core/services/storage.service';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Pagination } from '../../../shared/interfaces/general';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  api: string = environment.api;
  storage = inject(StorageService);
  http = inject(HttpClient);

  groups = signal<any[]>([]);
  paginatedGroups = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });
  groupLoading = signal<boolean>(false);

  subGroups = signal<any[]>([]);
  paginatedSubGroups = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });
  subGroupLoading = signal<boolean>(false);

  constructor() { }

  onGetHTTPHeaders() {
    const tenantId = this.storage.get('id');
    const accessToken = `bearer ${this.storage.get('accessToken')}`;
    const headers = new HttpHeaders({ 'x-tenant-id': tenantId, 'Authorization': accessToken });
    return headers;
  }

  onLoadGroup(page: number = 1, limit: number = 10) {
    return this.http.get(`${this.api}tenants/groups?page=${page}&limit=${limit}`, { headers: this.onGetHTTPHeaders() });
  }

  onLoadSubGroupById(id: number, page: number = 1, limit: number = 10) {
    return this.http.get(`${this.api}tenants/groups/${id}/sub-groups?page=${page}&limit=${limit}`, { headers: this.onGetHTTPHeaders() });
  }

  onLoadGroups(page: number = 1, limit: number = 10) {
    return new Promise<void>((resolve, reject) => {
      this.groups.set([]);
      this.subGroups.set([]);
      this.groupLoading.set(true);

      this.http.get(`${this.api}tenants/groups?page=${page}&limit=${limit}`, { headers: this.onGetHTTPHeaders() }).subscribe({
        next: (response: any) => {
          this.groups.set(response.items);
          this.paginatedGroups.set(response.meta);
          resolve(response.items);
        },
        error: (error: any) => {
          console.log(error);
          reject(error);
        },
        complete: () => {
          this.groupLoading.set(false);
        }
      })
    });
  }

  onLoadSubGroupsById(id: number, page: number = 1, limit: number = 10) {
    return new Promise<void>((resolve, reject) => {
      this.subGroupLoading.set(true);

      this.http.get(`${this.api}tenants/groups/${id}/sub-groups?page=${page}&limit=${limit}`, { headers: this.onGetHTTPHeaders() }).subscribe({
        next: (response: any) => {
          this.subGroups.set(response.items);
          this.paginatedSubGroups.set(response.meta);
          resolve(response.items);
        },
        error: (error: any) => {
          console.log(error);
          reject(error);
        },
        complete: () => {
          this.subGroupLoading.set(false);
        }
      })
    });
  }
  
  onSaveGroups(groupId: number,item: any, mode: string = 'create') {
    if (mode == 'create') {
      return this.http.post(`${this.api}tenants/groups`, item, { headers: this.onGetHTTPHeaders() });
    } else {
      return this.http.patch(`${this.api}tenants/groups/${groupId}`, item, { headers: this.onGetHTTPHeaders() });
    }
  }

  onSaveSubGroups(groupId: number, subGroupId: number, item: any, mode: string = 'create') {
    if (mode == 'create') {
      return this.http.post(`${this.api}tenants/groups/${groupId}/sub-groups`, item, { headers: this.onGetHTTPHeaders() });
    } else {
      return this.http.patch(`${this.api}tenants/groups/${groupId}/sub-groups/${subGroupId}`, item, { headers: this.onGetHTTPHeaders() });
    }
  }

  onDeleteGroups(id: number) {
    return this.http.delete(`${this.api}tenants/groups/${id}`, { headers: this.onGetHTTPHeaders() });
  }
  
  onDeleteSubGroups(groupId: number, subGroupId: number) {
    return this.http.delete(`${this.api}tenants/groups/${groupId}/sub-groups/${subGroupId}`, { headers: this.onGetHTTPHeaders() });
  }
}

