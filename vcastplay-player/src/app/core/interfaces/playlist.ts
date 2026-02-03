import { signal } from "@angular/core";

export interface Playlists {
    id: number;
    name: string;
    link: string;
    type: 'image' | 'audio' | 'text' | 'video' | 'web';
    duration: number;
}


export interface Playlist {
    id?: number;
    name: string;
    description: string;
    isAuto: boolean;
    isBlackGap: boolean;
    isLoop: boolean;
    transition: string;
    transitionSpeed: number;
    entries: any[];
    approvalStatus?: string;
    approvedInfo?: any;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ContentState {
    index: number;
    currentContent: ReturnType<typeof signal<any>>;
    isPlaying: ReturnType<typeof signal<boolean>>;
    progress: ReturnType<typeof signal<number>>;
    fadeIn: ReturnType<typeof signal<boolean>>;
    currentTransition: ReturnType<typeof signal<any>>;
    timeoutId?: any;
    intervalId?: any;
    gapTimeout?: any;
}