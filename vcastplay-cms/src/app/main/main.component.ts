import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ComponentModule } from '../core/modules/component/component.module';

@Component({
  selector: 'app-main',
  imports: [ RouterOutlet, RouterModule, ComponentModule ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {

}
