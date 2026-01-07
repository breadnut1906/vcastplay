import { Component, signal } from '@angular/core';
import { PrimengUiModule } from '../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../core/modules/components/components.module';
import { MenuItem } from 'primeng/api';
import { DashboardModule } from '../../core/modules/dashboard/dashboard.module';

@Component({
  selector: 'app-dashboard',
  imports: [ PrimengUiModule, ComponentsModule, DashboardModule ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  value: number = 25;
  showSubscription = signal<boolean>(false);
  pageInfo: MenuItem = [ {label: 'Dashboard'} ];
  meterValues = [
    { label: 'Storage used', value: 25, color: '#4BC0C0' }
  ];
  // widgets: any[] = [
  //   { content: OnlineScreensComponent },
  //   { content: OfflineScreensComponent },
  //   { content: StorageUsageComponent },
  //   { content: SubscriptionPlanComponent },
  // ]
}
