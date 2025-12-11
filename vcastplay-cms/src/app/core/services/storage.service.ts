import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }
  
  set(key: string, value: string, remember: boolean = false) {
    try {
      if (remember) localStorage.setItem(key, value);
      else sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  }

  get(key: string) {
    try {
      const item = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (item === null) return null;

      return JSON.parse(item);
    } catch (error) {
      return localStorage.getItem(key) || sessionStorage.getItem(key);
    }
  }

  remove(key: string) {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }

  hasKey(key: string, remember: boolean = false) {
    try {
      if (remember) return localStorage.getItem(key) !== null;
      else return sessionStorage.getItem(key) !== null;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
