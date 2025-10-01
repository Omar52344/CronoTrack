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
    const projectOptions = this.projects.map(p => ({
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

    const alert = await this.alertController.create({
      header: 'Assign Project',
      inputs: projectOptions,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: async (data) => {
            const selectedProject = data.project || '';
            const updates: Partial<Activity> = {};
            if (selectedProject !== (activity.project_id || '')) {
              updates.project_id = selectedProject || undefined;
            }
            if (Object.keys(updates).length > 0) {
              await this.activityService.updateActivity(activity.id, updates);
            }
            this.loadActivities(); // Always refresh list
          }
        }
      ]
    });

    await alert.present();
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
    const alert = await this.alertController.create({
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
        },
        {
          name: 'project',
          type: 'text',
          placeholder: 'Project name (optional)'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: async (data) => {
            if (data.description && data.startDateTime) {
              const startTime = new Date(data.startDateTime).toISOString();
              const endTime = data.endDateTime ? new Date(data.endDateTime).toISOString() : undefined;
              const project = this.projects.find(p => p.name === data.project);
              const project_id = project ? project.id : undefined;

              const activity = {
                description: data.description,
                start_time: startTime,
                end_time: endTime,
                project_id
              };

              await this.activityService.createActivity(activity);
              this.loadActivities(); // Refresh list
            }
          }
        }
      ]
    });

    await alert.present();
  }

  trackByFn(index: number, item: Activity) {
    return item.id;
  }
}