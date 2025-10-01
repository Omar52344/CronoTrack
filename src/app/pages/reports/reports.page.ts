import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-reports',
  template: `
    <ion-content class="ion-padding">
      <div style="margin-top: 80px;">
        <canvas baseChart [data]="barChartData" [options]="barChartOptions" [type]="barChartType"></canvas>
      </div>
    </ion-content>
  `,
  standalone: true,
  imports: [BaseChartDirective, IonContent, IonHeader, IonTitle, IonToolbar]
})
export class ReportsPage {
  barChartType: ChartType = 'bar';
  barChartData: ChartData<'bar'> = {
    labels: ['Project 1', 'Project 2', 'Project 3'],
    datasets: [
      { data: [65, 59, 80], label: 'Time (hours)' }
    ]
  };
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      }
    }
  };
}