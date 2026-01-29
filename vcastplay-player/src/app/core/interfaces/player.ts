import { Subscription } from "rxjs";

export interface Location {
    country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
}

export interface UploadItem {
    id: string;
    content: any;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error' | 'cancel';
    error?: any;
    sub?: Subscription;
}