import { Routes } from "@angular/router";
import { environment } from "../../environments/environment.development";

const appTitle: string = environment.appTitle;

export default [
    {
        path: 'pricing',
        loadComponent: () => import('./pricing/pricing.component').then((m) => m.PricingComponent),
        title: `Pricing • ${appTitle}`,
    },
    {
        path: 'checkout',
        loadComponent: () => import('./checkout/checkout.component').then((m) => m.CheckoutComponent),
        title: `Checkout • ${appTitle}`,
    }
] as Routes