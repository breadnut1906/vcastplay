import { Component, HostListener, inject, signal } from '@angular/core';
import { PrimengUiModule } from '../../core/modules/primeng-ui/primeng-ui.module';
import { DrawerMenu } from '../../core/interfaces/drawer-menu';
import { Router, RouterModule } from '@angular/router';
import { UtilityService } from '../../core/services/utility.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-drawer',
  imports: [ PrimengUiModule, RouterModule ],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
  providers: [ MessageService, AuthService, ConfirmationService ]
})
export class DrawerComponent {

  router = inject(Router);
  utils = inject(UtilityService);
  auth = inject(AuthService);
  confirmation = inject(ConfirmationService);
  
  ngOnInit() { }

  onToggleMenu(menuItem: DrawerMenu, event: Event) {
    event.stopPropagation();
    const updatedItems = this.utils.modules().map(data => ({ ...data, expanded: data.label === menuItem.label ? !data.expanded : false }));
    this.utils.modules.set(updatedItems);
    
    if (menuItem.routerLink && !menuItem.items) this.onClickGotoPage(menuItem)
  }

  onClickLogout(event: Event | { originalEvent: Event }) {
    this.utils.drawerVisible.set(false);
    const actualEvent = (event as any).originalEvent || event;
    this.confirmation.confirm({
      target: actualEvent.currentTarget as EventTarget,
      message: 'Are you sure you want to log out?',
      closable: true,
      closeOnEscape: true,
      header: 'Logout Confirmation',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      accept: () => {
        this.auth.onLogout();
      },
    })
  }

  onClickGotoPage(subMenu: any) {
    const router = Array.isArray(subMenu.routerLink) ? subMenu.routerLink : [ subMenu.routerLink ] //isArray(subMenu.routerLink)
    this.router.navigate(router);    
    if (this.utils.drawerVisible()) this.utils.drawerVisible.set(!this.utils.drawerVisible());
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    // Close all expanded menus when clicking outside the drawer
    const updatedItems = this.utils.modules().map(data => ({
      ...data,
      expanded: false
    }));
    this.utils.modules.set(updatedItems);
  }

  get menuItems() {
    return this.utils.modules();
  }
}
