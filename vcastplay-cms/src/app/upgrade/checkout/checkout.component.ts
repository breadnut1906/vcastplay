import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PrimengUiModule } from '../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../core/modules/components/components.module';

@Component({
  selector: 'app-checkout',
  imports: [ PrimengUiModule, RouterLink, ComponentsModule ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent {

}
