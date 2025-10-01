import { Component } from '@angular/core';
import { IonModal, IonHeader, IonTitle, IonToolbar, IonContent, IonButton, IonButtons, IonInput, IonSelect, IonSelectOption, IonLabel, IonItem } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular';
import { ProjectService, Project } from '../../services/project.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-activity-modal',
  template: `
    <ion-modal (willDismiss)="dismiss()">
      <ion-header>
        <ion-toolbar>
          <ion-title>Add Manual Activity</ion-title>
          <ion-buttons slot="end">
            <ion-button (click)="dismiss()">Cancel</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <p>Modal is working</p>
        <ion-item>
          <ion-label position="floating">Description</ion-label>
          <ion-input [(ngModel)]="description"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Start Date & Time</ion-label>
          <ion-input type="datetime-local" [(ngModel)]="startDateTime"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">End Date & Time (optional)</ion-label>
          <ion-input type="datetime-local" [(ngModel)]="endDateTime"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label>Project</ion-label>
          <ion-select [(ngModel)]="selectedProject">
            <ion-select-option value="">No project</ion-select-option>
            <ion-select-option *ngFor="let project of projects" [value]="project?.id">{{ project?.name }}</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-button expand="block" (click)="save()">Add Activity</ion-button>
      </ion-content>
    </ion-modal>
  `,
  standalone: true,
  imports: [CommonModule, FormsModule, IonModal, IonHeader, IonTitle, IonToolbar, IonContent, IonButton, IonButtons, IonInput, IonSelect, IonSelectOption, IonLabel, IonItem]
})
export class AddActivityModalComponent {
  description = '';
  startDateTime = new Date().toISOString();
  endDateTime = '';
  selectedProject = '';
  projects: Project[] = [];

  constructor(private modalController: ModalController, private projectService: ProjectService) {
    this.loadProjects();
  }

  async loadProjects() {
    const { data } = await this.projectService.getProjects();
    if (data) {
      this.projects = data;
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  save() {
    if (this.description && this.startDateTime) {
      const activity = {
        description: this.description,
        start_time: this.startDateTime,
        end_time: this.endDateTime || undefined,
        project_id: this.selectedProject || undefined
      };
      this.modalController.dismiss(activity);
    }
  }
}