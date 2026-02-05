import { Subscription } from "rxjs";

export interface Assets {
    id?: any;
    name: string;
    type: string;
    link: string;
    category?: any;
    subCategory?: any;
    thumbnail?: string
    duration: any;
    sizeKb?: number;
    orientation?: string;
    dimension?: string;

    // Availability
    availability?: boolean;
    start?: any;
    end?: any;
    allDay?: boolean;
    allWeekdays?: boolean;
    weekdays?: string[];
    hours?: string[];

    // Audience Tagging
    audienceTags?: any;

    // sequence id for playlist
    sequence?: any;
    createdAt?: any;
    updatedAt?: any;
}

export interface UploadItem {
    id: string;
    file: File | any;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error' | 'cancel';
    error?: any;
    sub?: Subscription;
    body?: any;
}