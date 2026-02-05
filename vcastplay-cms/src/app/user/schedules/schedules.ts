import { ApprovedInfo } from "../../shared/interfaces/general";
import { Assets } from "../assets/assets";
import { DesignLayout } from "../design-layout/design-layout";
import { Playlist } from "../playlist/playlist";


export interface Schedule {
    id: number;
    name: string;
    description: string;
    type: string;
    contents: ScheduleContentItems[];
    startDate: string;
    endDate: string;
    approvalStatus: string;
    approvedInfo?: ApprovedInfo;
    createdAt: Date;
    updatedAt: Date;
}

export interface ContentItems {
    content: any;
    type: string;
    start: Date;
    end: Date;
    weekdays: string[];
    hours: string[];
    isAllWeekdays: boolean;
    isAllDay: boolean;
    color: string;
}

export interface CalendarEventItem {
    id: number;
    title: string;
    extendedProps: any;
    start: string;
    end: string;
    backgroundColor: string;
    borderColor: string;
    allDay: boolean;
    editable: boolean;
}

export interface ScheduleContentItems {
    id: string;
    title: string;
    extendedProps: Assets | Playlist | DesignLayout | any;
    start: string;
    end: string;
    backgroundColor: string;
    borderColor: string;
    allDay: boolean;
    isFiller: boolean;
}