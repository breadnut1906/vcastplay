import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PrimengUiModule } from '../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../core/modules/components/components.module';

@Component({
  selector: 'app-pricing',
  imports: [ PrimengUiModule, RouterLink, ComponentsModule ],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss'
})
export class PricingComponent {

}
