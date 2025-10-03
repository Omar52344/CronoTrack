import { Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivityService, Activity } from '../../services/activity.service';
import { ProjectService, Project } from '../../services/project.service';
import { AlertController } from '@ionic/angular';
import { calendar } from 'ionicons/icons';

interface ProjectReport {
  project: Project;
  hours: number;
  activities: number;
  revenue: number; // Ingresos totales del proyecto
}

@Component({
  selector: 'app-reports',
  template: `
    <ion-content class="ion-padding">
      <div style="margin-top: 60px; padding: 10px;">
        <!-- Selector de timeframe -->
        <ion-segment [(ngModel)]="timeframe" (ionChange)="onTimeframeChange()">
          <ion-segment-button value="week">
            <ion-label>Semana</ion-label>
          </ion-segment-button>
          <ion-segment-button value="month">
            <ion-label>Mes</ion-label>
          </ion-segment-button>
          <ion-segment-button value="year">
            <ion-label>Año</ion-label>
          </ion-segment-button>
          <ion-segment-button value="custom">
            <ion-label>Personalizado</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- Botón para rango personalizado -->
        <div *ngIf="timeframe === 'custom'" style="margin-top: 10px; text-align: center;">
          <ion-button (click)="selectCustomRange()">
            <ion-icon [icon]="calendarIcon" slot="start"></ion-icon>
            {{ customRangeLabel }}
          </ion-button>
        </div>

        <!-- Período actual -->
        <div class="period-label">
          <h3>{{ periodLabel }}</h3>
        </div>

        <!-- Resumen total -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Resumen Total</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="summary-stats">
              <div class="stat-item">
                <div class="stat-value">{{ totalHours.toFixed(1) }}</div>
                <div class="stat-label">Horas Totales</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ totalActivities }}</div>
                <div class="stat-label">Actividades</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ activeProjects }}</div>
                <div class="stat-label">Proyectos Activos</div>
              </div>
              <div class="stat-item">
                <div class="stat-value stat-revenue">\${{ totalRevenue.toFixed(2) }}</div>
                <div class="stat-label">Ingresos Totales</div>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Gráfica de barras -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Horas por Proyecto</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="chart-container">
              <canvas baseChart
                [data]="barChartData"
                [options]="barChartOptions"
                [type]="barChartType">
              </canvas>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Gráfica de ingresos -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Ingresos por Proyecto</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="chart-container">
              <canvas baseChart
                [data]="revenueChartData"
                [options]="revenueChartOptions"
                [type]="revenueChartType">
              </canvas>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Gráfica de pastel -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Distribución de Tiempo</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="chart-container">
              <canvas baseChart
                [data]="pieChartData"
                [options]="pieChartOptions"
                [type]="pieChartType">
              </canvas>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Lista detallada por proyecto -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Detalle por Proyecto</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="project-list">
              <div *ngFor="let report of projectReports" class="project-item">
                <div class="project-color" [style.background-color]="report.project.color"></div>
                <div class="project-info">
                  <div class="project-name">{{ report.project.name }}</div>
                  <div class="project-stats">
                    {{ report.hours.toFixed(1) }} horas • {{ report.activities }} actividades
                    <span *ngIf="report.revenue > 0" class="revenue-badge">\${{ report.revenue.toFixed(2) }}</span>
                  </div>
                </div>
                <div class="project-percentage">
                  {{ getPercentage(report.hours) }}%
                </div>
              </div>
              <div *ngIf="projectReports.length === 0" class="no-data">
                No hay datos para el período seleccionado
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .period-label {
      text-align: center;
      margin: 20px 0;
    }

    .period-label h3 {
      margin: 0;
      color: var(--ion-color-primary);
    }

    .summary-stats {
      display: flex;
      justify-content: space-around;
      gap: 10px;
    }

    .stat-item {
      text-align: center;
      flex: 1;
    }

    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: var(--ion-color-primary);
    }

    .stat-value.stat-revenue {
      color: #10b981;
    }

    .stat-label {
      font-size: 12px;
      color: var(--ion-color-medium);
      margin-top: 5px;
    }

    .chart-container {
      position: relative;
      height: 300px;
      margin: 10px 0;
    }

    .project-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .project-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--ion-color-light);
      border-radius: 8px;
    }

    .project-color {
      width: 4px;
      height: 40px;
      border-radius: 2px;
    }

    .project-info {
      flex: 1;
    }

    .project-name {
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 4px;
    }

    .project-stats {
      font-size: 13px;
      color: var(--ion-color-medium);
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .revenue-badge {
      background: #10b981;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }

    .project-percentage {
      font-size: 18px;
      font-weight: bold;
      color: var(--ion-color-primary);
    }

    .no-data {
      text-align: center;
      padding: 20px;
      color: var(--ion-color-medium);
    }

    ion-segment {
      margin-bottom: 10px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BaseChartDirective,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon
  ]
})
export class ReportsPage implements OnInit {
  timeframe: 'week' | 'month' | 'year' | 'custom' = 'week';
  customStartDate: Date | null = null;
  customEndDate: Date | null = null;
  customRangeLabel = 'Seleccionar Rango';
  
  activities: Activity[] = [];
  projects: Project[] = [];
  projectReports: ProjectReport[] = [];
  
  totalHours = 0;
  totalActivities = 0;
  activeProjects = 0;
  totalRevenue = 0;
  periodLabel = '';

  protected readonly calendarIcon = calendar;

  // Chart configurations
  barChartType: ChartType = 'bar';
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Horas',
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1
    }]
  };
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + 'h';
          }
        }
      }
    }
  };

  revenueChartType: ChartType = 'bar';
  revenueChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Ingresos ($)',
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1
    }]
  };
  revenueChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
  };

  pieChartType: ChartType = 'pie';
  pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };
  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  constructor(
    private activityService: ActivityService,
    private projectService: ProjectService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    await this.loadProjects();
    await this.loadActivities();
    this.calculateReports();
    this.updateCharts();
    this.updatePeriodLabel();
  }

  async loadProjects() {
    const { data } = await this.projectService.getProjects();
    if (data) {
      this.projects = data;
    }
  }

  async loadActivities() {
    const { startDate, endDate } = this.getDateRange();
    const { data } = await this.activityService.getActivities();
    
    if (data) {
      // Filter activities by date range
      this.activities = data.filter(activity => {
        const activityDate = new Date(activity.start_time);
        return activityDate >= startDate && activityDate <= endDate;
      });
    }
  }

  getDateRange(): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    switch (this.timeframe) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'custom':
        if (this.customStartDate && this.customEndDate) {
          startDate = new Date(this.customStartDate);
          endDate = new Date(this.customEndDate);
          endDate.setHours(23, 59, 59, 999);
        } else {
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
        }
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
    }

    return { startDate, endDate };
  }

  calculateReports() {
    const projectMap = new Map<string, ProjectReport>();

    // Initialize all projects
    this.projects.forEach(project => {
      projectMap.set(project.id, {
        project,
        hours: 0,
        activities: 0,
        revenue: 0
      });
    });

    // Calculate hours, activities and revenue per project
    this.activities.forEach(activity => {
      if (activity.project_id && projectMap.has(activity.project_id)) {
        const report = projectMap.get(activity.project_id)!;
        report.activities++;
        
        if (activity.start_time && activity.end_time) {
          const start = new Date(activity.start_time);
          const end = new Date(activity.end_time);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          report.hours += hours;
        }
        
        if (activity.cost) {
          report.revenue += activity.cost;
        }
      }
    });

    // Convert to array and filter out projects with no activity
    this.projectReports = Array.from(projectMap.values())
      .filter(report => report.hours > 0)
      .sort((a, b) => b.hours - a.hours);

    // Calculate totals
    this.totalHours = this.projectReports.reduce((sum, report) => sum + report.hours, 0);
    this.totalActivities = this.activities.length;
    this.activeProjects = this.projectReports.length;
    this.totalRevenue = this.projectReports.reduce((sum, report) => sum + report.revenue, 0);
  }

  updateCharts() {
    const labels = this.projectReports.map(r => r.project.name);
    const hoursData = this.projectReports.map(r => parseFloat(r.hours.toFixed(2)));
    const revenueData = this.projectReports.map(r => parseFloat(r.revenue.toFixed(2)));
    const projectColors = this.projectReports.map(r => r.project.color || '#4f46e5');
    
    // Generate varied colors for bar chart
    const barColors = this.generateVariedColors(this.projectReports.length);

    // Update hours bar chart with varied colors
    this.barChartData = {
      labels,
      datasets: [{
        data: hoursData,
        label: 'Horas',
        backgroundColor: barColors,
        borderColor: barColors.map(c => this.darkenColor(c, 20)),
        borderWidth: 1
      }]
    };

    // Update revenue bar chart with project colors
    const revenueColors = projectColors.map(c => c || '#10b981');
    this.revenueChartData = {
      labels,
      datasets: [{
        data: revenueData,
        label: 'Ingresos ($)',
        backgroundColor: revenueColors,
        borderColor: revenueColors.map(c => this.darkenColor(c, 20)),
        borderWidth: 1
      }]
    };

    // Update pie chart with project colors
    this.pieChartData = {
      labels,
      datasets: [{
        data: hoursData,
        backgroundColor: projectColors,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }

  private generateVariedColors(count: number): string[] {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384',
      '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
    ];
    
    // If we need more colors than available, generate random ones
    if (count > colors.length) {
      for (let i = colors.length; i < count; i++) {
        colors.push(this.generateRandomColor());
      }
    }
    
    return colors.slice(0, count);
  }

  private generateRandomColor(): string {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 65 + Math.floor(Math.random() * 20); // 65-85%
    const lightness = 55 + Math.floor(Math.random() * 15); // 55-70%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  private darkenColor(color: string, percent: number): string {
    // Simple darkening by reducing lightness
    if (color.startsWith('#')) {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = Math.max(0, (num >> 16) - amt);
      const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
      const B = Math.max(0, (num & 0x0000FF) - amt);
      return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }
    return color;
  }

  updatePeriodLabel() {
    const { startDate, endDate } = this.getDateRange();
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    
    switch (this.timeframe) {
      case 'week':
        this.periodLabel = `Semana: ${startDate.toLocaleDateString('es-ES', options)} - ${endDate.toLocaleDateString('es-ES', options)}`;
        break;
      case 'month':
        this.periodLabel = `Mes: ${startDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
        break;
      case 'year':
        this.periodLabel = `Año: ${startDate.getFullYear()}`;
        break;
      case 'custom':
        if (this.customStartDate && this.customEndDate) {
          this.periodLabel = `${startDate.toLocaleDateString('es-ES', options)} - ${endDate.toLocaleDateString('es-ES', options)}`;
        } else {
          this.periodLabel = 'Seleccione un rango personalizado';
        }
        break;
    }
  }

  getPercentage(hours: number): string {
    if (this.totalHours === 0) return '0';
    return ((hours / this.totalHours) * 100).toFixed(1);
  }

  onTimeframeChange() {
    this.loadData();
  }

  async selectCustomRange() {
    const alert = await this.alertController.create({
      header: 'Seleccionar Rango',
      inputs: [
        {
          name: 'startDate',
          type: 'date',
          value: this.customStartDate ? this.toDateInputValue(this.customStartDate) : this.toDateInputValue(new Date())
        },
        {
          name: 'endDate',
          type: 'date',
          value: this.customEndDate ? this.toDateInputValue(this.customEndDate) : this.toDateInputValue(new Date())
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aplicar',
          handler: (data) => {
            if (data.startDate && data.endDate) {
              this.customStartDate = new Date(data.startDate);
              this.customEndDate = new Date(data.endDate);
              
              const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
              this.customRangeLabel = `${this.customStartDate.toLocaleDateString('es-ES', options)} - ${this.customEndDate.toLocaleDateString('es-ES', options)}`;
              
              this.loadData();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}