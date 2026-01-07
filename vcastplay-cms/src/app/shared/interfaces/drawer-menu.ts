import { MenuItem } from "primeng/api";

export interface DrawerMenu {
    label: string;
    icon: string;
    routerLink?: string;
    expanded?: boolean;
    items?: MenuItem[];
}
