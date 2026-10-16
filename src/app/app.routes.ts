import { Routes } from '@angular/router';
import { StockPageComponent } from './stock-page/stock-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'amundi' },
  { path: 'amundi', component: StockPageComponent, data: { symbol: 'AMUN.PA', label: 'Amundi' } },
  { path: 'totalenergies', component: StockPageComponent, data: { symbol: 'TTE.PA', label: 'TotalEnergies' } },
];
