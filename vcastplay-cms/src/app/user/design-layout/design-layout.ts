import { ApprovedInfo } from "../../shared/interfaces/general";
import { Assets } from "../assets/assets";
import { Screen } from "../screens/screen";

export interface DesignLayout {
    id: number;
    name: string;
    description: string;
    type: string;
    canvas: any;
    thumbnail: string | null;
    htmlLayers?: any;
    duration: number;
    color: string;
    status: string;
    approvedInfo?: ApprovedInfo;
    isActive: boolean;
    hasPlaylist: boolean;
    screen?: Screen;
    contentId?: any;
    files?: any[];
    createdOn: Date;
    updatedOn: Date;
}

export interface HtmlLayer {
    id: string;
    left: number;
    top: number;
    width: number;
    height: number;
    content: any;
    style?: any;
    type: any;
    rotation: number;
    fabricObject: any;
}

export interface Design {
    id: number;
    name: string;
    description: string;
    type: string;
    layers: LayerItem[];
    thumbnail: string | null;
    duration: number;
    color: string;
    status: string;
    approvedInfo?: ApprovedInfo;
    isActive: boolean;
    screen?: Screen;
    contentId?: any;
    createdOn: Date;
    updatedOn: Date;
}

export interface Artboard {
    backgroundColor: string;
    width: number;
    height: number;
    layers: LayerItem[];
    scale: number;
    translateX: number;
    translateY: number;
    lastX: number;
    lastY: number;
    defaultScale: number;
    defaultX: number;
    defaultY: number;    
}

export interface LayerItem {
    id: string;
    type: 'shape' | 'text' | 'image' | 'audio' | 'video' | 'web' | 'clipart' | 'playlist';
    content: Assets | DesignLayout | any;
    x: number;
    y: number;
    w: number;
    h: number;
    a: number;
    selected: boolean;
    locked: boolean;
    hidden: boolean;
    zIndex: number;
}

export interface SelectionBox {
    x: number;
    y: number;
    w: number;
    h: number;
    a: number;
    cx: number;
    cy: number;
}