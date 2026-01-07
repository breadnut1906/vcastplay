import { Component, inject, Input } from '@angular/core';
import { PrimengUiModule } from '../../../../core/modules/primeng-ui/primeng-ui.module';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-user-approval',
  imports: [ PrimengUiModule ],
  templateUrl: './user-approval.component.html',
  styleUrl: './user-approval.component.scss'
})
export class UserApprovalComponent {
  
  @Input() approvedForm!: FormGroup
}
