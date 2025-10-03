import { Component, OnInit } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonList, IonItem, IonLabel, IonFab, IonFabButton, IonFabList, IonIcon, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { play, square, create, trash, add, menu, list, calendar, chevronBack, chevronForward } from 'ionicons/icons';
import { ActivityService, Activity } from '../../services/activity.service';
import { ProjectService, Project } from '../../services/project.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {  AlertController, ModalController } from '@ionic/angular';

import { AddActivityModalComponent } from './add-activity-modal.component';


@Component({
  selector: 'app-activities',
  template: `
    <ion-content>
      <div style="margin-top: 60px; padding: 10px;">
        <ion-segment [(ngModel)]="viewMode" (ionChange)="onViewModeChange()">
          <ion-segment-button value="list">
            <ion-icon [icon]="listIcon"></ion-icon>
            <ion-label>Lista</ion-label>
          </ion-segment-button>
          <ion-segment-button value="calendar">
            <ion-icon [icon]="calendarIcon"></ion-icon>
            <ion-label>Calendario</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <!-- Vista Lista -->
      <ion-list *ngIf="viewMode === 'list'" style="margin-top: 10px;">
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

      <!-- Vista Calendario -->
      <div *ngIf="viewMode === 'calendar'" class="calendar-view">
        <!-- Navegación de fecha -->
        <div class="date-navigation">
          <ion-button fill="clear" (click)="previousDay()">
            <ion-icon [icon]="chevronBackIcon"></ion-icon>
          </ion-button>
          <h3 (click)="selectDate()" style="cursor: pointer; user-select: none;">
            {{ selectedDate | date:'fullDate' }}
          </h3>
          <ion-button fill="clear" (click)="nextDay()">
            <ion-icon [icon]="chevronForwardIcon"></ion-icon>
          </ion-button>
          <ion-button fill="clear" (click)="goToToday()">Hoy</ion-button>
        </div>

        <!-- Grid de horas -->
        <div class="time-grid">
          <div *ngFor="let hour of hours" class="hour-row">
            <div class="hour-label">{{ hour }}:00</div>
            <div class="hour-slots">
              <div
                *ngFor="let slot of [0, 15, 30, 45]"
                class="time-slot"
                [class.selecting]="isSlotSelecting(hour, slot)"
                [class.selected]="isSlotSelected(hour, slot)"
                (mousedown)="startSelection(hour, slot)"
                (mouseenter)="updateSelection(hour, slot)"
                (mouseup)="endSelection()"
                (click)="handleSlotClick(hour, slot)">
                <span class="slot-time">{{ hour }}:{{ slot.toString().padStart(2, '0') }}</span>
                
                <!-- Actividades en este slot -->
                <div *ngFor="let activity of getActivitiesForSlot(hour, slot); let i = index; let count = count"
                     class="activity-block"
                     [style.background-color]="activity.projects?.color || '#4f46e5'"
                     [style.height.px]="getActivityHeight(activity)"
                     [style.top.px]="getActivityTop(activity, hour, slot)"
                     [style.left.px]="getActivityLeft(i, count)"
                     [style.width]="getActivityWidth(count)"
                     (click)="editActivity(activity); $event.stopPropagation()">
                  <div class="activity-content">
                    <strong>{{ activity.description }}</strong>
                    <small>{{ activity.start_time | date:'shortTime' }} - {{ activity.end_time | date:'shortTime' }}</small>
                    <small *ngIf="activity.projects" class="project-name">{{ activity.projects.name }}</small>
                    <small *ngIf="activity.cost" class="activity-cost">\${{ activity.cost | number:'1.2-2' }}</small>
                  </div>
                  
                  <!-- Tooltip mejorado -->
                  <div class="activity-tooltip">
                    <div class="tooltip-header">
                      <strong>{{ activity.description }}</strong>
                    </div>
                    <div class="tooltip-body">
                      <div class="tooltip-row">
                        <span class="tooltip-label">Horario:</span>
                        <span>{{ activity.start_time | date:'shortTime' }} - {{ activity.end_time | date:'shortTime' }}</span>
                      </div>
                      <div class="tooltip-row" *ngIf="activity.projects">
                        <span class="tooltip-label">Proyecto:</span>
                        <span>{{ activity.projects.name }}</span>
                      </div>
                      <div class="tooltip-row" *ngIf="activity.cost">
                        <span class="tooltip-label">Costo:</span>
                        <span class="tooltip-cost">\${{ activity.cost | number:'1.2-2' }}</span>
                      </div>
                      <div class="tooltip-row">
                        <span class="tooltip-label">Duración:</span>
                        <span>{{ getActivityDuration(activity) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
  styles: [`
    .calendar-view {
      padding: 10px;
      padding-bottom: 80px;
    }

    .date-navigation {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 20px;
      padding: 10px;
      background: var(--ion-color-light);
      border-radius: 8px;
    }

    .date-navigation h3 {
      margin: 0;
      flex: 1;
      text-align: center;
    }

    .time-grid {
      border: 1px solid var(--ion-color-light);
      border-radius: 8px;
      overflow: hidden;
    }

    .hour-row {
      display: flex;
      border-bottom: 1px solid var(--ion-color-light);
      min-height: 60px;
    }

    .hour-row:last-child {
      border-bottom: none;
    }

    .hour-label {
      width: 60px;
      padding: 8px;
      background: var(--ion-color-light);
      border-right: 1px solid var(--ion-color-medium);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      font-weight: 500;
      font-size: 12px;
    }

    .hour-slots {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .time-slot {
      flex: 1;
      border-bottom: 1px dashed var(--ion-color-light-shade);
      position: relative;
      cursor: pointer;
      transition: background-color 0.2s;
      min-height: 15px;
    }

    .time-slot:last-child {
      border-bottom: none;
    }

    .time-slot:hover {
      background-color: var(--ion-color-light-tint);
    }

    .time-slot.selecting {
      background-color: rgba(79, 70, 229, 0.2);
    }

    .time-slot.selected {
      background-color: rgba(79, 70, 229, 0.3);
    }

    .slot-time {
      position: absolute;
      left: 4px;
      top: 2px;
      font-size: 9px;
      color: var(--ion-color-medium);
      opacity: 0;
      transition: opacity 0.2s;
    }

    .time-slot:hover .slot-time {
      opacity: 1;
    }

    .activity-block {
      position: absolute;
      border-radius: 4px;
      padding: 4px 6px;
      color: white;
      font-size: 11px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      cursor: pointer;
      z-index: 10;
      transition: all 0.2s ease;
    }

    .activity-block:hover {
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      z-index: 1100;
      overflow: visible;
    }

    .activity-block:hover .activity-tooltip {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .activity-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .activity-content strong {
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .activity-content small {
      font-size: 10px;
      opacity: 0.9;
    }

    .activity-content .project-name {
      font-weight: 600;
      opacity: 1;
      margin-top: 1px;
    }

    .activity-content .activity-cost {
      background: rgba(16, 185, 129, 0.9);
      color: white;
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 700;
      display: inline-block;
      margin-top: 2px;
      align-self: flex-start;
    }

    .activity-tooltip {
      position: fixed;
      left: 50%;
      transform: translateX(-50%) translateY(-10px);
      background: white;
      color: #333;
      padding: 18px 20px;
      border-radius: 10px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.25);
      min-width: 300px;
      max-width: 450px;
      width: max-content;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease;
      z-index: 10000;
      pointer-events: none;
      white-space: nowrap;
    }

    .activity-tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 8px solid transparent;
      border-top-color: white;
      z-index: 1001;
    }

    .tooltip-header {
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e0e0e0;
    }

    .tooltip-header strong {
      font-size: 15px;
      color: #333;
      display: block;
      white-space: normal;
      word-wrap: break-word;
      line-height: 1.3;
    }

    .tooltip-body {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .tooltip-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      font-size: 13px;
      line-height: 1.8;
      white-space: nowrap;
      min-height: 24px;
      padding: 2px 0;
    }

    .tooltip-label {
      font-weight: 600;
      color: #666;
      white-space: nowrap;
      min-width: 80px;
      flex-shrink: 0;
    }

    .tooltip-row > span:last-child {
      flex-shrink: 0;
      text-align: right;
    }

    .tooltip-cost {
      color: #10b981;
      font-weight: 700;
      font-size: 15px;
      white-space: nowrap;
    }

    ion-segment {
      margin-bottom: 10px;
    }
  `],
 
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonList, IonItem, IonLabel, IonFab, IonFabButton, IonFabList, IonIcon, IonSegment, IonSegmentButton]
})
export class ActivitiesPage implements OnInit {
  activities: Activity[] = [];
  projects: Project[] = [];
  isRunning = false;
  viewMode: 'list' | 'calendar' = 'list';
  selectedDate: Date = new Date();
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  
  // Selection state
  isSelecting = false;
  selectionStart: { hour: number; slot: number } | null = null;
  selectionEnd: { hour: number; slot: number } | null = null;

  protected readonly playIcon = play;
  protected readonly squareIcon = square;
  protected readonly editIcon = create;
  protected readonly trashIcon = trash;
  protected readonly addIcon = add;
  protected readonly menuIcon = menu;
  protected readonly listIcon = list;
  protected readonly calendarIcon = calendar;
  protected readonly chevronBackIcon = chevronBack;
  protected readonly chevronForwardIcon = chevronForward;

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
    // Use local time instead of UTC
    const startDateTime = activity.start_time ? this.toLocalDateTimeString(new Date(activity.start_time)) : '';
    const endDateTime = activity.end_time ? this.toLocalDateTimeString(new Date(activity.end_time)) : '';

    const basicAlert = await this.alertController.create({
      header: 'Edit Activity',
      cssClass: 'custom-alert-input',
      inputs: [
        {
          name: 'description',
          type: 'text',
          placeholder: 'Description',
          value: activity.description || ''
        },
        {
          name: 'cost',
          type: 'number',
          placeholder: 'Costo (opcional)',
          value: activity.cost || '',
          attributes: {
            min: '0',
            step: '0.01'
          }
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

  private toLocalDateTimeString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            // Dismiss current alert first
            await this.alertController.dismiss();
            // Show confirmation dialog
            await this.confirmDeleteActivity(activity);
            return false;
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: async (selectedProjectId) => {
            // Use local ISO string to preserve timezone
            const startTime = this.toLocalISOString(new Date(activityData.startDateTime));
            const endTime = activityData.endDateTime ? this.toLocalISOString(new Date(activityData.endDateTime)) : undefined;

            const updates: Partial<Activity> = {
              description: activityData.description,
              start_time: startTime,
              end_time: endTime,
              project_id: selectedProjectId || undefined,
              cost: activityData.cost ? parseFloat(activityData.cost) : undefined
            };

            await this.activityService.updateActivity(activity.id, updates);
            if (this.viewMode === 'calendar') {
              this.loadActivitiesForDate();
            } else {
              this.loadActivities();
            }
          }
        }
      ]
    });

    // Dismiss the first alert
    await this.alertController.dismiss();
    await projectAlert.present();
  }

  async deleteActivity(activity: Activity) {
    await this.confirmDeleteActivity(activity);
  }

  private async confirmDeleteActivity(activity: Activity) {
    const alert = await this.alertController.create({
      header: 'Eliminar Actividad',
      message: '¿Estás seguro de que quieres eliminar esta actividad?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.activityService.deleteActivity(activity.id);
            if (this.viewMode === 'calendar') {
              this.loadActivitiesForDate();
            } else {
              this.loadActivities();
            }
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
      cssClass: 'custom-alert-input',
      inputs: [
        {
          name: 'description',
          type: 'text',
          placeholder: 'Description'
        },
        {
          name: 'cost',
          type: 'number',
          placeholder: 'Costo (opcional)',
          attributes: {
            min: '0',
            step: '0.01'
          }
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
              project_id: selectedProjectId || undefined,
              cost: activityData.cost ? parseFloat(activityData.cost) : undefined
            };

            const result = await this.activityService.createActivity(activity);
            if (result.data) {
              await this.loadActivities(); // Refresh list
            }
          }
        },
        {
          text: 'Agregar y Crear Otra',
          handler: async (selectedProjectId) => {
            const startTime = new Date(activityData.startDateTime).toISOString();
            const endTime = activityData.endDateTime ? new Date(activityData.endDateTime).toISOString() : undefined;

            const activity = {
              description: activityData.description,
              start_time: startTime,
              end_time: endTime,
              project_id: selectedProjectId || undefined,
              cost: activityData.cost ? parseFloat(activityData.cost) : undefined
            };

            const result = await this.activityService.createActivity(activity);
            if (result.data) {
              await this.loadActivities();
            }
            
            // Reabrir el diálogo para crear otra actividad con el mismo horario
            await this.alertController.dismiss();
            setTimeout(() => {
              this.addManualActivityWithTime(activityData.startDateTime, activityData.endDateTime);
            }, 300);
          }
        }
      ]
    });

    // Dismiss the first alert
    await this.alertController.dismiss();
    await projectAlert.present();
  }

  async addManualActivityWithTime(startDateTime?: string, endDateTime?: string) {
    const basicAlert = await this.alertController.create({
      header: 'Add Manual Activity',
      cssClass: 'custom-alert-input',
      inputs: [
        {
          name: 'description',
          type: 'text',
          placeholder: 'Description'
        },
        {
          name: 'cost',
          type: 'number',
          placeholder: 'Costo (opcional)',
          attributes: {
            min: '0',
            step: '0.01'
          }
        },
        {
          name: 'startDateTime',
          type: 'datetime-local',
          value: startDateTime || new Date().toISOString().slice(0, 16)
        },
        {
          name: 'endDateTime',
          type: 'datetime-local',
          value: endDateTime || ''
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
              await this.showProjectSelection(data);
            }
            return false;
          }
        }
      ]
    });

    await basicAlert.present();
  }

  trackByFn(index: number, item: Activity) {
    return item.id;
  }

  // Calendar view methods
  onViewModeChange() {
    if (this.viewMode === 'calendar') {
      this.loadActivitiesForDate();
    }
  }

  async loadActivitiesForDate() {
    const { data } = await this.activityService.getActivities();
    if (data) {
      // Filter activities for selected date
      const startOfDay = new Date(this.selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(this.selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      this.activities = data.filter(activity => {
        const activityDate = new Date(activity.start_time);
        return activityDate >= startOfDay && activityDate <= endOfDay;
      });
    }
  }

  previousDay() {
    this.selectedDate = new Date(this.selectedDate.setDate(this.selectedDate.getDate() - 1));
    this.loadActivitiesForDate();
  }

  nextDay() {
    this.selectedDate = new Date(this.selectedDate.setDate(this.selectedDate.getDate() + 1));
    this.loadActivitiesForDate();
  }

  goToToday() {
    this.selectedDate = new Date();
    this.loadActivitiesForDate();
  }

  async selectDate() {
    const alert = await this.alertController.create({
      header: 'Seleccionar Fecha',
      inputs: [
        {
          name: 'date',
          type: 'date',
          value: this.toDateInputValue(this.selectedDate)
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Ir a Fecha',
          handler: (data) => {
            if (data.date) {
              // Parse date as local time to avoid timezone issues
              const [year, month, day] = data.date.split('-').map(Number);
              this.selectedDate = new Date(year, month - 1, day);
              this.loadActivitiesForDate();
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

  // Time slot selection methods
  startSelection(hour: number, slot: number) {
    console.log('Start selection at', hour, slot);
    this.isSelecting = true;
    this.selectionStart = { hour, slot };
    this.selectionEnd = { hour, slot };
  }

  updateSelection(hour: number, slot: number) {
    if (this.isSelecting) {
      this.selectionEnd = { hour, slot };
    }
  }

  async endSelection() {
    if (this.isSelecting && this.selectionStart && this.selectionEnd) {
      this.isSelecting = false;
      
      // Calculate start and end times
      const startMinutes = this.selectionStart.hour * 60 + this.selectionStart.slot;
      const endMinutes = this.selectionEnd.hour * 60 + this.selectionEnd.slot + 15; // Add 15 minutes to end
      
      const actualStart = Math.min(startMinutes, endMinutes);
      const actualEnd = Math.max(startMinutes, endMinutes);
      
      const startDate = new Date(this.selectedDate);
      startDate.setHours(Math.floor(actualStart / 60), actualStart % 60, 0, 0);
      
      const endDate = new Date(this.selectedDate);
      endDate.setHours(Math.floor(actualEnd / 60), actualEnd % 60, 0, 0);
      
      console.log('Selected range:', startDate, 'to', endDate);
      // Create activity with selected time range
      await this.createActivityFromSelection(startDate, endDate);
      
      this.selectionStart = null;
      this.selectionEnd = null;
    }
  }

  async handleSlotClick(hour: number, slot: number) {
    const startDate = new Date(this.selectedDate);
    startDate.setHours(hour, slot, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(hour + 1, slot, 0, 0);
    
    // Verificar si ya hay actividades en este slot
    const existingActivities = this.getActivitiesForSlot(hour, slot);
    
    if (existingActivities.length > 0) {
      // Si hay actividades, mostrar opciones
      await this.showSlotOptions(startDate, endDate, existingActivities);
    } else {
      // Si no hay actividades, crear una nueva directamente
      this.createActivityFromSelection(startDate, endDate);
    }
  }

  async showSlotOptions(startDate: Date, endDate: Date, existingActivities: Activity[]) {
    const alert = await this.alertController.create({
      header: 'Opciones',
      message: `Ya hay ${existingActivities.length} actividad(es) en este horario.`,
      buttons: [
        {
          text: 'Agregar Nueva Actividad',
          handler: () => {
            this.createActivityFromSelection(startDate, endDate);
          }
        },
        {
          text: 'Ver/Editar Actividades',
          handler: () => {
            // Si solo hay una actividad, editarla directamente
            if (existingActivities.length === 1) {
              this.editActivity(existingActivities[0]);
            } else {
              // Si hay múltiples, mostrar lista para seleccionar
              this.showActivityList(existingActivities);
            }
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  async showActivityList(activities: Activity[]) {
    const inputs = activities.map((activity, index) => ({
      type: 'radio' as const,
      label: `${activity.description} - ${activity.projects?.name || 'Sin proyecto'}`,
      value: index,
      checked: index === 0
    }));

    const alert = await this.alertController.create({
      header: 'Seleccionar Actividad',
      inputs: inputs,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Editar',
          handler: (selectedIndex) => {
            if (selectedIndex !== undefined) {
              this.editActivity(activities[selectedIndex]);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async createActivityFromSelection(startDate: Date, endDate: Date) {
    const basicAlert = await this.alertController.create({
      header: 'Nueva Actividad',
      cssClass: 'custom-alert-input',
      inputs: [
        {
          name: 'description',
          type: 'text',
          placeholder: 'Descripción'
        },
        {
          name: 'cost',
          type: 'number',
          placeholder: 'Costo $ (opcional)',
          attributes: {
            min: '0',
            step: '0.01'
          }
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
            if (data.description) {
              // Convert to ISO string preserving local time
              const startISO = this.toLocalISOString(startDate);
              const endISO = this.toLocalISOString(endDate);
              
              await this.showProjectSelectionForNewActivity({
                description: data.description,
                cost: data.cost,
                startDateTime: startISO,
                endDateTime: endISO
              });
            }
            return false;
          }
        }
      ]
    });

    await basicAlert.present();
  }

  private toLocalISOString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  private async showProjectSelectionForNewActivity(activityData: any) {
    const projectOptions: any[] = this.projects.map(p => ({
      label: p.name,
      type: 'radio' as const,
      value: p.id
    }));
    projectOptions.unshift({
      label: 'Sin proyecto',
      type: 'radio' as const,
      value: '',
      checked: true
    });

    const projectAlert = await this.alertController.create({
      header: 'Seleccionar Proyecto',
      inputs: projectOptions,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Crear',
          handler: async (selectedProjectId) => {
            const activity = {
              description: activityData.description,
              start_time: activityData.startDateTime,
              end_time: activityData.endDateTime,
              project_id: selectedProjectId || undefined,
              cost: activityData.cost ? parseFloat(activityData.cost) : undefined
            };

            const result = await this.activityService.createActivity(activity);
            if (result.data) {
              // Recargar actividades para obtener los datos completos con el proyecto
              await this.loadActivitiesForDate();
            }
          }
        },
        {
          text: 'Crear y Agregar Otra',
          handler: async (selectedProjectId) => {
            const activity = {
              description: activityData.description,
              start_time: activityData.startDateTime,
              end_time: activityData.endDateTime,
              project_id: selectedProjectId || undefined,
              cost: activityData.cost ? parseFloat(activityData.cost) : undefined
            };

            const result = await this.activityService.createActivity(activity);
            if (result.data) {
              // Recargar actividades para obtener los datos completos con el proyecto
              await this.loadActivitiesForDate();
            }
            
            // Reabrir el diálogo para crear otra actividad con el mismo horario
            await this.alertController.dismiss();
            setTimeout(() => {
              const startDate = new Date(activityData.startDateTime);
              const endDate = new Date(activityData.endDateTime);
              this.createActivityFromSelection(startDate, endDate);
            }, 300);
          }
        }
      ]
    });

    await this.alertController.dismiss();
    await projectAlert.present();
  }

  isSlotSelecting(hour: number, slot: number): boolean {
    if (!this.isSelecting || !this.selectionStart || !this.selectionEnd) {
      return false;
    }

    const currentMinutes = hour * 60 + slot;
    const startMinutes = this.selectionStart.hour * 60 + this.selectionStart.slot;
    const endMinutes = this.selectionEnd.hour * 60 + this.selectionEnd.slot;
    
    const minMinutes = Math.min(startMinutes, endMinutes);
    const maxMinutes = Math.max(startMinutes, endMinutes);
    
    return currentMinutes >= minMinutes && currentMinutes <= maxMinutes;
  }

  isSlotSelected(hour: number, slot: number): boolean {
    return false; // Can be used for highlighting selected slots
  }

  getActivitiesForSlot(hour: number, slot: number): Activity[] {
    const slotStart = new Date(this.selectedDate);
    slotStart.setHours(hour, slot, 0, 0);
    
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + 15);

    return this.activities.filter(activity => {
      if (!activity.start_time) return false;
      
      const activityStart = new Date(activity.start_time);
      const activityEnd = activity.end_time ? new Date(activity.end_time) : activityStart;
      
      // Check if activity overlaps with this slot
      return activityStart < slotEnd && activityEnd > slotStart;
    });
  }

  getActivityHeight(activity: Activity): number {
    if (!activity.start_time || !activity.end_time) return 15;
    
    const start = new Date(activity.start_time);
    const end = new Date(activity.end_time);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    // Each 15-minute slot is approximately 15px
    return Math.max(15, durationMinutes);
  }

  getActivityTop(activity: Activity, hour: number, slot: number): number {
    if (!activity.start_time) return 0;
    
    const activityStart = new Date(activity.start_time);
    const slotStart = new Date(this.selectedDate);
    slotStart.setHours(hour, slot, 0, 0);
    
    const diffMinutes = (activityStart.getTime() - slotStart.getTime()) / (1000 * 60);
    
    // If activity starts in this slot, calculate offset
    if (diffMinutes >= 0 && diffMinutes < 15) {
      return diffMinutes; // Pixel offset within the slot
    }
    
    return 0;
  }

  getActivityLeft(index: number, totalCount: number): number {
    if (totalCount === 1) return 2;
    
    // Calcular el ancho de cada actividad
    const availableWidth = 100; // Ancho disponible en porcentaje
    const gap = 2; // Espacio entre actividades
    const widthPerActivity = (availableWidth - (gap * (totalCount - 1))) / totalCount;
    
    // Calcular la posición left en píxeles (aproximado)
    return 2 + (index * (widthPerActivity + gap));
  }

  getActivityWidth(totalCount: number): string {
    if (totalCount === 1) return 'calc(100% - 4px)';
    
    // Calcular el ancho en porcentaje
    const gap = 2; // Espacio entre actividades en px
    const totalGap = gap * (totalCount - 1);
    const widthPercent = (100 - totalGap) / totalCount;
    
    return `calc(${widthPercent}% - ${gap}px)`;
  }

  getActivityDuration(activity: Activity): string {
    if (!activity.start_time || !activity.end_time) return 'N/A';
    
    const start = new Date(activity.start_time);
    const end = new Date(activity.end_time);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = Math.round(durationMinutes % 60);
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  }
}