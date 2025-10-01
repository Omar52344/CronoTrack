import { Component } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonHeader, IonToolbar, IonButtons, IonButton, IonTitle } from '@ionic/angular/standalone';
import { list, folder, barChart, logOut } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>CronoTrack</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()">
            <ion-icon [icon]="logoutIcon"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="activities">
          <ion-icon [icon]="listIcon"></ion-icon>
          <ion-label>Activities</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="projects">
          <ion-icon [icon]="folderIcon"></ion-icon>
          <ion-label>Projects</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="reports">
          <ion-icon [icon]="barChartIcon"></ion-icon>
          <ion-label>Reports</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonHeader, IonToolbar, IonButtons, IonButton, IonTitle]
})
export class DashboardPage {
  protected readonly listIcon = list;
  protected readonly folderIcon = folder;
  protected readonly barChartIcon = barChart;
  protected readonly logoutIcon = logOut;

  constructor(private authService: AuthService) {}

  async logout() {
    await this.authService.signOut();
  }
}