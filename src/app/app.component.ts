import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StockChartComponent } from './stock-chart/stock-chart.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, StockChartComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'amundi2';
}
