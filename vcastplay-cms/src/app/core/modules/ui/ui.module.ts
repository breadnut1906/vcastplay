import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toolbar } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';

const PRIMENG_MODULES = [
  Toolbar, 
  ButtonModule, 
]

@NgModule({
  declarations: [],
  imports: [ CommonModule, ...PRIMENG_MODULES ],
  exports: [ CommonModule, ...PRIMENG_MODULES ],
})
export class UiModule { }
