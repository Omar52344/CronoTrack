import { Component, OnInit } from '@angular/core';
import { IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { add, create, trash } from 'ionicons/icons';
import { ProjectService, Project } from '../../services/project.service';
import { CommonModule } from '@angular/common';
import { AlertController, ModalController } from '@ionic/angular';
import { ColorPickerModalComponent } from './color-picker-modal.component';

@Component({
  selector: 'app-projects',
  template: `
    <ion-content>
      <ion-list style="margin-top: 80px;">
        <ion-item *ngFor="let project of projects; trackBy: trackByFn">
          <div class="project-color-indicator" [style.background-color]="project.color"></div>
          <ion-label>{{ project.name }}</ion-label>
          <ion-button fill="clear" slot="end" (click)="editProject(project)">
            <ion-icon [icon]="editIcon"></ion-icon>
          </ion-button>
          <ion-button fill="clear" slot="end" color="danger" (click)="deleteProject(project)">
            <ion-icon [icon]="trashIcon"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="addProject()">
          <ion-icon [icon]="addIcon"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    .project-color-indicator {
      width: 4px;
      height: 40px;
      border-radius: 2px;
      margin-right: 12px;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton]
})
export class ProjectsPage implements OnInit {
  projects: Project[] = [];
  protected readonly addIcon = add;
  protected readonly editIcon = create;
  protected readonly trashIcon = trash;


  constructor(
    private projectService: ProjectService,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  async loadProjects() {
    const { data } = await this.projectService.getProjects();
    if (data) {
      this.projects = data;
    }
  }

  async addProject() {
    await this.showProjectDialog();
  }

  async editProject(project: Project) {
    await this.showProjectDialog(project);
  }

  private async showProjectDialog(project?: Project) {
    const isEdit = !!project;
    const selectedColor = project?.color || '#4f46e5';

    // First, get the project name
    const nameAlert = await this.alertController.create({
      header: isEdit ? 'Editar Proyecto' : 'Nuevo Proyecto',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre del proyecto',
          value: project?.name || ''
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Siguiente',
          handler: async (data) => {
            if (data.name.trim()) {
              // Show color picker modal
              const color = await this.showColorPickerModal(selectedColor);
              if (color) {
                if (project) {
                  // Update existing project
                  const { error } = await this.projectService.updateProject(project.id, {
                    name: data.name.trim(),
                    color: color
                  });
                  if (!error) {
                    this.loadProjects();
                  }
                } else {
                  // Create new project
                  const { error } = await this.projectService.createProject({
                    name: data.name.trim(),
                    color: color
                  });
                  if (!error) {
                    this.loadProjects();
                  }
                }
              }
            }
            return false;
          }
        }
      ]
    });

    await nameAlert.present();
  }

  private async showColorPickerModal(initialColor: string): Promise<string | null> {
    const modal = await this.modalController.create({
      component: ColorPickerModalComponent,
      componentProps: {
        initialColor: initialColor
      }
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    return data || null;
  }

  async deleteProject(project: Project) {
    const alert = await this.alertController.create({
      header: 'Eliminar Proyecto',
      message: `¿Estás seguro de que quieres eliminar "${project.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const { error } = await this.projectService.deleteProject(project.id);
            if (!error) {
              this.loadProjects();
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