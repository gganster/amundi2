import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { StockPageComponent } from './stock-page/stock-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'amundi' },
  { path: 'amundi', component: StockPageComponent, data: { symbol: 'AMUN.PA', label: 'Amundi' } },
  { path: 'totalenergies', component: StockPageComponent, data: { symbol: 'TTE.PA', label: 'TotalEnergies' } },
  { path: 'connexion', component: LoginComponent },
  { path: 'inscription', component: RegisterComponent },
];
