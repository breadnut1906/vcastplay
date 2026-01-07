import { Component } from '@angular/core';
import { PrimengUiModule } from '../../../../core/modules/primeng-ui/primeng-ui.module';

@Component({
  selector: 'app-subscription-plan',
  imports: [ PrimengUiModule ],
  templateUrl: './subscription-plan.component.html',
  styleUrl: './subscription-plan.component.scss'
})
export class SubscriptionPlanComponent {
    value: number = 100; // always 100%

    meterValues = [
      { label: 'Storage used', value: 25, color: '#4BC0C0' }
    ];
}
