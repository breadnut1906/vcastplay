import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

interface CacheEntry {
  url: string;
  response: HttpResponse<any>;
  entryTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class CachingService {

  private cache = new Map<string, CacheEntry>();
  private readonly maxAge = 300000; // cache duration in milliseconds (5 minutes)

  constructor() { }

  get(url: string): HttpResponse<any> | null {
    const entry = this.cache.get(url);
    if (!entry) return null;

    const isExpired = (Date.now() - entry.entryTime) > this.maxAge;
    return isExpired ? null : entry.response;
  }

  put(url: string, response: HttpResponse<any>): void {
    const entry: CacheEntry = { url, response, entryTime: Date.now() };
    this.cache.set(url, entry)
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  clearCacheForUrl(url: string): void {
    this.cache.delete(url);
  }
}
