import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScreenStatusComponent } from '../../../shared/components/dashboard/screen-status/screen-status.component';
import { ScreenListsComponent } from '../../../shared/components/dashboard/screen-lists/screen-lists.component';
import { ScreenMapComponent } from '../../../shared/components/dashboard/screen-map/screen-map.component';
import { SubscriptionPlanComponent } from '../../../shared/components/dashboard/subscription-plan/subscription-plan.component';
import { StorageUsedComponent } from '../../../shared/components/dashboard/storage-used/storage-used.component';

const DASHBOARD_MODULES = [
  CommonModule,
  ScreenStatusComponent,
  ScreenListsComponent,
  ScreenMapComponent,
  SubscriptionPlanComponent,
  StorageUsedComponent,
];

@NgModule({
  declarations: [],
  imports: [ ...DASHBOARD_MODULES ],
  exports: [ ...DASHBOARD_MODULES ],
})
export class DashboardModule { }
