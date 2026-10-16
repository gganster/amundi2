import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StockChartComponent } from '../stock-chart/stock-chart.component';

@Component({
  selector: 'app-stock-page',
  imports: [StockChartComponent],
  template: `
    <h1 class="mb-4 text-2xl font-bold">Tableau de bord — action {{ label }}</h1>
    <app-stock-chart [symbol]="symbol" [label]="label" />
  `,
})
export class StockPageComponent {
  private readonly data = inject(ActivatedRoute).snapshot.data;
  readonly symbol: string = this.data['symbol'];
  readonly label: string = this.data['label'];
}
