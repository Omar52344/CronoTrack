import { Component, OnInit } from '@angular/core';
import { IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { add } from 'ionicons/icons';
import { ProjectService, Project } from '../../services/project.service';
import { CommonModule } from '@angular/common';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-projects',
  template: `
    <ion-content>
      <ion-list style="margin-top: 80px;">
        <ion-item *ngFor="let project of projects; trackBy: trackByFn">
          <ion-label>{{ project.name }}</ion-label>
        </ion-item>
      </ion-list>
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="addProject()">
          <ion-icon [icon]="addIcon"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  standalone: true,
  imports: [CommonModule, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton]
})
export class ProjectsPage implements OnInit {
  projects: Project[] = [];
  protected readonly addIcon = add;

  constructor(private projectService: ProjectService, private alertController: AlertController) {}

  ngOnInit() {
    this.loadProjects();
  }

  async loadProjects() {
    const { data } = await this.projectService.getProjects();
    if (data) {
      console.log(data,'data');
      this.projects = data;
    }
  }

  async addProject() {
    const alert = await this.alertController.create({
      header: 'New Project',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Project name'
        },
        {
          name: 'color',
          type: 'text',
          placeholder: 'Color (e.g. #4f46e5)',
          value: '#4f46e5'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Create',
          handler: async (data) => {
            if (data.name.trim()) {
              const { error } = await this.projectService.createProject({
                name: data.name.trim(),
                color: data.color || '#4f46e5'
              });
              if (!error) {
                this.loadProjects(); // Refresh list
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  trackByFn(index: number, item: Project) {
    return item.id;
  }
}