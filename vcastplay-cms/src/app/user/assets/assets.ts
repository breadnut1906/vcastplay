import { Subscription } from "rxjs";

export interface Assets {
    id?: any;
    name: string;
    type: string;
    link: string;
    category?: string;
    subCategory?: string;
    thumbnail?: string
    duration: number;
    sizeKb?: number;
    orientation?: string;
    dimension?: string;

    // Availability
    availability?: boolean;
    start?: Date | null;
    end?: Date | null;
    allDay?: boolean;
    allWeekdays?: boolean;
    weekdays?: string[];
    hours?: string[];

    // Audience Tagging
    audienceTag?: any;

    // content id for playlist
    contentId?: any;
}

export interface UploadResults {
    name: string;
    status: 'success' | 'error';
    message?: string;
}

export interface UploadItem {
    id: string;
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error' | 'cancel';
    error?: any;
    sub?: Subscription;
    body?: any;
}