import { Component, OnInit } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonList, IonItem, IonLabel, IonFab, IonFabButton, IonFabList, IonIcon } from '@ionic/angular/standalone';
import { play, square, create, trash, add, menu } from 'ionicons/icons';
import { ActivityService, Activity } from '../../services/activity.service';
import { ProjectService, Project } from '../../services/project.service';
import { CommonModule } from '@angular/common';
import {  AlertController, ModalController } from '@ionic/angular';

import { AddActivityModalComponent } from './add-activity-modal.component';


@Component({
  selector: 'app-activities',
  template: `
    <ion-content>
      <ion-list style="margin-top: 80px;">
        <ion-item *ngFor="let activity of activities; trackBy: trackByFn">
          <ion-label>
            <h2>{{ activity.description || 'No description' }}</h2>
            <p>{{ activity.start_time | date:'short' }} - {{ activity.end_time | date:'short' }}</p>
            <p *ngIf="activity.projects">{{ activity.projects.name }}</p>
          </ion-label>
          <ion-button fill="clear" slot="end" (click)="editActivity(activity)">
            <ion-icon [icon]="editIcon"></ion-icon>
          </ion-button>
          <ion-button fill="clear" slot="end" color="danger" (click)="deleteActivity(activity)">
            <ion-icon [icon]="trashIcon"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="toggleTimer()">
          <ion-icon [icon]="isRunning ? squareIcon : playIcon"></ion-icon>
        </ion-fab-button>
      </ion-fab>
      <ion-fab vertical="bottom" horizontal="start" slot="fixed">
        <ion-fab-button (click)="addManualActivity()">
          <ion-icon [icon]="addIcon"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
 
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonList, IonItem, IonLabel, IonFab, IonFabButton, IonFabList, IonIcon]
})
export class ActivitiesPage implements OnInit {
  activities: Activity[] = [];
  projects: Project[] = [];
  isRunning = false;
  protected readonly playIcon = play;
  protected readonly squareIcon = square;
  protected readonly editIcon = create;
  protected readonly trashIcon = trash;
  protected readonly addIcon = add;
  protected readonly menuIcon = menu;

  constructor(
    private activityService: ActivityService,
    private projectService: ProjectService,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadActivities();
    this.loadProjects();
    this.isRunning = this.activityService.isTimerRunning();
  }

  async loadActivities() {
    const { data } = await this.activityService.getActivities();
    if (data) {
      this.activities = data;
    }
  }

  async loadProjects() {
    const { data } = await this.projectService.getProjects();
    if (data) {
      this.projects = data;
    }
  }

  async toggleTimer() {
    if (this.isRunning) {
      await this.activityService.stopActivity();
      this.loadActivities(); // Refresh list after stopping
    } else {
      this.activityService.startActivity('Test activity');
    }
    this.isRunning = !this.isRunning;
  }

  async editActivity(activity: Activity) {
    // First alert for basic activity info
    const startDateTime = activity.start_time ? new Date(activity.start_time).toISOString().slice(0, 16) : '';
    const endDateTime = activity.end_time ? new Date(activity.end_time).toISOString().slice(0, 16) : '';

    const basicAlert = await this.alertController.create({
      header: 'Edit Activity',
      inputs: [
        {
          name: 'description',
          type: 'text',
          placeholder: 'Description',
          value: activity.description || ''
        },
        {
          name: 'startDateTime',
          type: 'datetime-local',
          value: startDateTime
        },
        {
          name: 'endDateTime',
          type: 'datetime-local',
          value: endDateTime
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Next',
          handler: async (data) => {
            if (data.description && data.startDateTime) {
              // Show project selection alert
              await this.showProjectSelectionForEdit(activity, data);
            }
            return false; // Prevent alert from closing
          }
        }
      ]
    });

    await basicAlert.present();
  }

  private async showProjectSelectionForEdit(activity: Activity, activityData: any) {
    const projectOptions: any[] = this.projects.map(p => ({
      label: p.name,
      type: 'radio' as const,
      value: p.id,
      checked: activity.project_id === p.id
    }));
    projectOptions.unshift({
      label: 'No project',
      type: 'radio' as const,
      value: '',
      checked: !activity.project_id
    });

    const projectAlert = await this.alertController.create({
      header: 'Select Project',
      inputs: projectOptions,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: async (selectedProjectId) => {
            const startTime = new Date(activityData.startDateTime).toISOString();
            const endTime = activityData.endDateTime ? new Date(activityData.endDateTime).toISOString() : undefined;

            const updates: Partial<Activity> = {
              description: activityData.description,
              start_time: startTime,
              end_time: endTime,
              project_id: selectedProjectId || undefined
            };

            await this.activityService.updateActivity(activity.id, updates);
            this.loadActivities(); // Refresh list
          }
        }
      ]
    });

    // Dismiss the first alert
    await this.alertController.dismiss();
    await projectAlert.present();
  }

  async deleteActivity(activity: Activity) {
    const alert = await this.alertController.create({
      header: 'Delete Activity',
      message: 'Are you sure you want to delete this activity?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            await this.activityService.deleteActivity(activity.id);
            this.loadActivities(); // Always refresh list
          }
        }
      ]
    });

    await alert.present();
  }

  async addManualActivity() {
    // First alert for basic activity info
    const basicAlert = await this.alertController.create({
      header: 'Add Manual Activity',
      inputs: [
        {
          name: 'description',
          type: 'text',
          placeholder: 'Description'
        },
        {
          name: 'startDateTime',
          type: 'datetime-local',
          value: new Date().toISOString().slice(0, 16)
        },
        {
          name: 'endDateTime',
          type: 'datetime-local'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Next',
          handler: async (data) => {
            if (data.description && data.startDateTime) {
              // Show project selection alert
              await this.showProjectSelection(data);
            }
            return false; // Prevent alert from closing
          }
        }
      ]
    });

    await basicAlert.present();
  }

  private async showProjectSelection(activityData: any) {
    const projectOptions: any[] = this.projects.map(p => ({
      label: p.name,
      type: 'radio' as const,
      value: p.id
    }));
    projectOptions.unshift({
      label: 'No project',
      type: 'radio' as const,
      value: '',
      checked: true
    });

    const projectAlert = await this.alertController.create({
      header: 'Select Project',
      inputs: projectOptions,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: async (selectedProjectId) => {
            const startTime = new Date(activityData.startDateTime).toISOString();
            const endTime = activityData.endDateTime ? new Date(activityData.endDateTime).toISOString() : undefined;

            const activity = {
              description: activityData.description,
              start_time: startTime,
              end_time: endTime,
              project_id: selectedProjectId || undefined
            };

            await this.activityService.createActivity(activity);
            this.loadActivities(); // Refresh list
          }
        }
      ]
    });

    // Dismiss the first alert
    await this.alertController.dismiss();
    await projectAlert.present();
  }

  trackByFn(index: number, item: Activity) {
    return item.id;
  }
}