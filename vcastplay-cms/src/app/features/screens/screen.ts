import { Assets } from "../assets/assets";
import { DesignLayout } from "../design-layout/design-layout";
import { Playlist } from "../playlist/playlist";
import { Schedule } from "../schedules/schedules";

export interface Screen {
    id: number;
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
    group?: string;
    subGroup?: string;
    orientation: string;
    dimensions: string;
    allDay?: boolean; // Always On
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
    others?: any;   
    screenshotOn?: Date;
    onlineOn?: Date;
    registeredOn?: Date;
    config?: ScreenConfiguration;
    createdOn: Date;
    updatedOn: Date;
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
    isDisplayed: boolean;
    displayedOn: Date;
    createdOn: Date;
    updatedOn: Date;
}

export interface ScreenConfiguration {
    display: boolean;
    audio: boolean;
    alwaysTop: boolean;
    fullscreen: boolean;
    syncTime: boolean;
    playbackLogging: boolean;
}