import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { StockPageComponent } from './stock-page/stock-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'amundi' },
  { path: 'amundi', component: StockPageComponent, data: { symbol: 'AMUN.PA', label: 'Amundi' } },
  { path: 'totalenergies', component: StockPageComponent, data: { symbol: 'TTE.PA', label: 'TotalEnergies' } },
  // Lazy: the component reads these routes (ticker -> chart link), a static import would be circular.
  {
    path: 'portefeuille',
    loadComponent: () => import('./portfolio/portfolio.component').then((m) => m.PortfolioComponent),
    canActivate: [authGuard],
    data: { label: 'Portefeuille' },
  },
  { path: 'connexion', component: LoginComponent },
  { path: 'inscription', component: RegisterComponent },
];
