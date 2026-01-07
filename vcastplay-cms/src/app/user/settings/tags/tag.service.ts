import { inject, Injectable, signal } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { environment } from '../../../../environments/environment.development';
import { StorageService } from '../../../core/services/storage.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Pagination } from '../../../shared/interfaces/general';

@Injectable({
  providedIn: 'root',
})
export class TagService {

  api: string = environment.api;
  storage = inject(StorageService);
  http = inject(HttpClient);

  tags = signal<any[]>([]);
  paginatedTags = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });
  tagLoading = signal<boolean>(false);

  tagValues = signal<any[]>([]);
  paginatedTagValues = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });
  tagValueLoading = signal<boolean>(false);

  constructor() { }

  onGetHTTPHeaders() {
    const tenantId = this.storage.get('id');
    const accessToken = `bearer ${this.storage.get('accessToken')}`;
    const headers = new HttpHeaders({ 'x-tenant-id': tenantId, 'Authorization': accessToken });
    return headers;
  }  

  onLoadTags(page: number = 1, limit: number = 10) {
    this.tagValues.set([]);
    this.tagLoading.set(true);
    
    this.http.get(`${this.api}tenants/tags?page=${page}&limit=${limit}`, { headers: this.onGetHTTPHeaders() }).subscribe({
      next: (response: any) => {
        this.tags.set(response.items);
        this.paginatedTags.set(response.meta);
      },
      error: (error: any) => {
        console.log(error);
      },
      complete: () => {
        this.tagLoading.set(false);
      }
    })
  }

  onLoadTagValuesById(id: number, page: number = 1, limit: number = 10) {
    this.tagValueLoading.set(true);

    this.http.get(`${this.api}tenants/tags/${id}/values?page=${page}&limit=${limit}`, { headers: this.onGetHTTPHeaders() }).subscribe({
      next: (response: any) => {
        this.tagValues.set(response.items);
        this.paginatedTagValues.set(response.meta);
      },
      error: (error: any) => {
        console.log(error);
      },
      complete: () => {
        this.tagValueLoading.set(false);
      }
    })
  }
  
  onSaveTags(tagId: number,item: any, mode: string = 'create') {
    if (mode == 'create') {
      return this.http.post(`${this.api}tenants/tags`, item, { headers: this.onGetHTTPHeaders() });
    } else {
      return this.http.patch(`${this.api}tenants/tags/${tagId}`, item, { headers: this.onGetHTTPHeaders() });
    }
  }

  onSaveTagValues(tagId: number, tagValueId: number, item: any, mode: string = 'create') {
    if (mode == 'create') {
      return this.http.post(`${this.api}tenants/tags/${tagId}/values`, item, { headers: this.onGetHTTPHeaders() });
    } else {
      return this.http.patch(`${this.api}tenants/tags/${tagId}/values/${tagValueId}`, item, { headers: this.onGetHTTPHeaders() });
    }
  }

  onDeleteTags(id: number) {
    return this.http.delete(`${this.api}tenants/tags/${id}`, { headers: this.onGetHTTPHeaders() });
  }
  
  onDeleteTagValues(tagId: number, tagValueId: number) {
    return this.http.delete(`${this.api}tenants/tags/${tagId}/values/${tagValueId}`, { headers: this.onGetHTTPHeaders() });
  }
}
