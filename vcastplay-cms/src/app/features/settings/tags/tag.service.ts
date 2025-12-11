import { inject, Injectable, signal } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { environment } from '../../../../environments/environment.development';
import { StorageService } from '../../../core/services/storage.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Pagination } from '../../../core/interfaces/general';

@Injectable({
  providedIn: 'root',
})
export class TagService {

  api: string = environment.api;
  storage = inject(StorageService);
  http = inject(HttpClient);

  private tagCache = new Map<string, any>();
  tags = signal<any[]>([]);
  paginatedTags = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });
  tagLoading = signal<boolean>(false);

  private tagValueCache = new Map<string, any>();
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
    const key = `${page}-${limit}`;

    this.tagValues.set([]);
    this.tagLoading.set(true);

    if (this.tagCache.has(key)) {
      const cached = this.tagCache.get(key);
      this.tags.set(cached.items);
      this.paginatedTags.set(cached.meta);
      return
    }

    this.http.get(`${this.api}tenants/tags?page=${page}&limit=${limit}`, { headers: this.onGetHTTPHeaders() }).subscribe({
      next: (response: any) => {
        this.tagCache.set(key, response);
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
    const key = `${id}-${page}-${limit}`;

    this.tagValueLoading.set(true);

    if (this.tagValueCache.has(key)) {
      const cached = this.tagValueCache.get(key);
      this.tagValues.set(cached.items);
      this.paginatedTagValues.set(cached.meta);
      return
    }

    this.http.get(`${this.api}tenants/tags/${id}/values?page=${page}&limit=${limit}`, { headers: this.onGetHTTPHeaders() }).subscribe({
      next: (response: any) => {
        this.tagValueCache.set(key, response);
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
