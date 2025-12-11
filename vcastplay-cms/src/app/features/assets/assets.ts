export interface Assets {
    id: number;
    code: string;
    name: string;
    type: string;
    url: string;
    category?: string;
    subCategory?: string;
    thumbnail?: string
    duration: number;
    size?: number;
    orientation?: string;
    dimensions?: string;

    // Availability
    availability: boolean;
    start: Date | null;
    end: Date | null;
    allDay: boolean;
    allWeekdays: boolean;
    weekdays?: string[];
    hours?: string[];

    // Audience Tagging
    audienceTag: any;

    // content id for playlist
    contentId?: any;

    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

export interface UploadResults {
    name: string;
    status: 'success' | 'error';
    message?: string;
}