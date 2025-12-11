import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { MenuModule } from 'primeng/menu';
import { ListboxModule } from 'primeng/listbox';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { TableModule } from 'primeng/table';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
import { DrawerModule } from 'primeng/drawer';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MegaMenuModule } from 'primeng/megamenu';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AccordionModule } from 'primeng/accordion';
import { RippleModule } from 'primeng/ripple';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DividerModule } from 'primeng/divider';
import { KnobModule } from 'primeng/knob';
import { ProgressBarModule } from 'primeng/progressbar';
import { MeterGroupModule } from 'primeng/metergroup';
import { PanelModule } from 'primeng/panel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { FileUploadModule } from 'primeng/fileupload';
import { SkeletonModule } from 'primeng/skeleton';
import { CarouselModule } from 'primeng/carousel';
import { PaginatorModule } from 'primeng/paginator';
import { TabsModule } from 'primeng/tabs';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FieldsetModule } from 'primeng/fieldset';
import { DatePickerModule } from 'primeng/datepicker';
import { FluidModule } from 'primeng/fluid';
import { InputOtpModule } from 'primeng/inputotp';
import { ChipModule } from 'primeng/chip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { StyleClassModule } from 'primeng/styleclass';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicDialogModule } from 'primeng/dynamicdialog';

const PRIMENG_MODULES = [
  CommonModule,
  AccordionModule,
  ButtonModule,
  ToolbarModule,
  AvatarModule,
  AvatarGroupModule,
  StyleClassModule,
  MenuModule,
  ListboxModule,
  BadgeModule,
  OverlayBadgeModule,
  TableModule,
  BreadcrumbModule,
  CardModule,
  TagModule,
  InputTextModule,
  ReactiveFormsModule,
  FormsModule,
  InputGroupModule,
  InputGroupAddonModule,
  PopoverModule,
  SelectModule,
  RadioButtonModule,
  TooltipModule,
  DialogModule,
  FloatLabelModule,
  IftaLabelModule,
  ConfirmDialogModule,
  ToastModule,
  TextareaModule,
  DrawerModule,
  PanelMenuModule,
  MegaMenuModule,
  TieredMenuModule,
  RippleModule,
  ConfirmPopupModule,
  PasswordModule,
  CheckboxModule,
  SelectButtonModule,
  DividerModule,
  KnobModule,
  ProgressBarModule,
  MeterGroupModule,
  PanelModule,
  ScrollPanelModule,
  InputNumberModule,
  InputMaskModule,
  FileUploadModule,
  SkeletonModule,
  CarouselModule,
  PaginatorModule,
  TabsModule,
  ToggleSwitchModule,
  FieldsetModule,
  DatePickerModule,
  FluidModule,
  InputOtpModule,
  ChipModule,
  ProgressSpinnerModule,
  DynamicDialogModule,
];

@NgModule({
  declarations: [],
  imports: [ CommonModule ],
  exports: [ ...PRIMENG_MODULES ]
})
export class PrimengModule { }
