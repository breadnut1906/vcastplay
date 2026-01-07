import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PrimengUiModule } from '../../core/modules/primeng-ui/primeng-ui.module';
import { AuthService } from '../auth.service';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-login',
  imports: [ PrimengUiModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [ AuthService ]
})
export class LoginComponent {

  auth = inject(AuthService);
  storage = inject(StorageService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  message = inject(MessageService);
  
  token = signal<any>(null);
  loginForm: FormGroup = new FormGroup({
    email: new FormControl('tenant2@gmail.com', [ Validators.required ]),
    password: new FormControl('password', [ Validators.required ]),
    remember: new FormControl(false)
  });

  constructor() {
    if (this.auth.isAuthenticated()) this.router.navigate(['/dashboard']);
    else {
      const tenatId = this.storage.get('id');
      if (tenatId) {
        this.token.set(tenatId);
        this.router.navigate([], { queryParams: { id: tenatId } });
      }
    }
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = params['id'] ?? null;
      if (id) {
        this.token.set(id);
        this.storage.set('id', this.token(), true);
      }
    });
  }

  slides: any[] = [
    {
      image: 'https://nyxsys.ph/assets/images/business%20solutions/b2bindustries/digital%20media%20owners.png',
      text: 'Engage Instantly. Inform Clearly.',
    },
    {
      image: 'https://nyxsys.ph/assets/images/business%20solutions/b2bindustries/healthcare.jpg',
      text: 'Smart Displays for Smarter Communication.',
    },
    {
      image: 'https://nyxsys.ph/assets/images/business%20solutions/b2bindustries/hospitality.jpg',
      text: 'Your Message, Everywhere, Anytime.',
    },
    {
      image: 'https://nyxsys.ph/assets/images/business%20solutions/b2bindustries/education.jpg',
      text: 'Dynamic Content. Real-Time Impact.',
    },
    {
      image: 'https://nyxsys.ph/assets/images/business%20solutions/b2bindustries/retail.jpg',
      text: 'Visual Solutions That Speak Louder.',
    },
  ]

  ngOnDestroy() {
    this.loginForm.reset();
  }

  onClickLogin() {
    if (this.loginForm.invalid) {
      this.message.add({ summary: 'Login Error', detail: 'Please input required fields (*)', icon: 'pi pi-info-circle', severity: 'error' });
      return;
    }

    if (!this.token()) {
      this.message.add({ severity: 'info', summary: 'Info', detail: 'This login is for administrator only' });
    }

    const path = this.isAdmin ? '/admin/summary' : '/dashboard';
    const { email, password, remember } = this.loginForm.value;

    this.auth.onLogin({ email, password }, this.token()).subscribe({
        next: (res: any) => {
          this.storage.set('accessToken', res.accessToken, remember);
          this.storage.set('refreshToken', res.refreshToken, remember);
          this.storage.set('admin', JSON.stringify(this.isAdmin), remember);
          this.router.navigate([ path ]);
        },
        error: (err: any) => {
          this.message.add({ severity: 'error', summary: 'Error', detail: err.message });
        }
      });
  }

  get isAdmin() {
    return this.token() ? false : true;
  }
}
