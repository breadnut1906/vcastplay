import { signal } from "@angular/core";
import { ApprovedInfo } from "../../shared/interfaces/general";
import { DesignLayout } from "../design-layout/design-layout";
import { Assets } from "../assets/assets";

export interface Playlist {
    id?: number;
    name: string;
    description: string;
    isAuto: boolean;
    isBlackGap: boolean;
    isLoop: boolean;
    transition: string;
    transitionSpeed: number;
    entries: Assets[] | DesignLayout[] | any[];
    approvalStatus?: string;
    approvedInfo?: ApprovedInfo;
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