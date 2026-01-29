import { Subscription } from "rxjs";
import { Assets } from "../assets/assets";
import { DesignLayout } from "../design-layout/design-layout";
import { Playlist } from "../playlist/playlist";
import { Schedule } from "../schedules/schedules";

export interface Screen {
    id: any;
    code: string;
    name: string;
    type: 'desktop' | 'android' | 'web';
    country: string;
    region: string;
    city: string;
    fullAddress: string;
    latitude: number;
    longitude: number;
    zipCode: string;
    groupId?: string;
    subGroupId?: string;
    orientation: string;
    resolution: string;
    isAllDay?: boolean; // Always On
    weekdays?: string[];
    hours?: string[];
    location: string;
    landmark: string;
    tags?: string[];
    status: 'active' | 'inactive';
    screenStatus?: 'playing' | 'standby' | 'disconnected';
    displayStatus?: 'on' | 'off';
    assignedContent?: Assets | Playlist | Schedule | DesignLayout;
    messages?: ScreenMessage[]; 
    response?: string;
    info?: any;
    screenshotOn?: Date;
    onlineOn?: Date;
    registeredAt?: Date;
    settings?: ScreenSettings;
    createdAt: Date;
    updatedAt: Date;
}

export interface ScreenMessage {
    id: number;
    icon: string;
    name: string;
    category: string;
    title: string;
    description: string;
    message: string;
    duration: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ScreenSettings {
    display: boolean,
    audio: boolean,
    alwaysOnTop: boolean,
    fullscreen: boolean,
    syncTime: boolean,
    playbackLogging: boolean,
    mainDisplay: any,
    width: number,
    height: number,
    left: number
    top: number;
}

export interface ScreenItems {
    id: any;
    content: any;
    progress: number;
    status: 'pending' | 'sending' | 'success' | 'error' | 'cancel';
    error?: any;
    sub?: Subscription;
    body?: any;
}