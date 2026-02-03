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
    status: string;
    approvedInfo?: ApprovedInfo;
    createdOn: Date;
    updatedOn: Date;
}

export interface ContentItems {
    id: string;
    content: Assets | Playlist | DesignLayout;
    start: string;
    end: string;
    weekdays: string[];
    hours: string[];
    allWeekdays: boolean;
    allDay: boolean;
    isFiller: boolean;
    color: string;
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