import { Component, Input } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-color-picker-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Seleccionar Color</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Cancelar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="color-picker-container">
        <div class="color-preview" [style.background-color]="selectedColor">
          <span>{{ selectedColor }}</span>
        </div>
        
        <input 
          type="color" 
          [(ngModel)]="selectedColor" 
          class="color-input"
          (change)="onColorChange()"
        />
        
        <div class="preset-colors">
          <h3>Colores Predefinidos</h3>
          <div class="color-grid">
            <div 
              *ngFor="let color of presetColors"
              class="color-swatch"
              [style.background-color]="color"
              [class.selected]="selectedColor === color"
              (click)="selectColor(color)">
            </div>
          </div>
        </div>
        
        <ion-button expand="block" (click)="confirm()">
          Confirmar
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .color-picker-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 20px 0;
    }

    .color-preview {
      width: 100%;
      height: 100px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--ion-color-medium);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .color-preview span {
      background: rgba(255,255,255,0.9);
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 600;
      font-family: monospace;
    }

    .color-input {
      width: 100%;
      height: 60px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }

    .preset-colors h3 {
      margin: 0 0 15px 0;
      font-size: 16px;
      color: var(--ion-color-medium);
    }

    .color-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 10px;
    }

    .color-swatch {
      aspect-ratio: 1;
      border-radius: 8px;
      cursor: pointer;
      border: 3px solid transparent;
      transition: all 0.2s;
    }

    .color-swatch:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .color-swatch.selected {
      border-color: var(--ion-color-primary);
      box-shadow: 0 0 0 2px white, 0 0 0 4px var(--ion-color-primary);
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons
  ]
})
export class ColorPickerModalComponent {
  @Input() initialColor: string = '#4f46e5';
  selectedColor: string = '#4f46e5';

  presetColors = [
    '#4f46e5', '#10b981', '#ef4444', '#f59e0b',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
    '#6366f1', '#84cc16', '#06b6d4', '#d946ef',
    '#3b82f6', '#22c55e', '#dc2626', '#eab308',
    '#a855f7', '#f43f5e', '#0ea5e9', '#f59e0b',
    '#6366f1', '#a3e635', '#06b6d4', '#e879f9'
  ];

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.selectedColor = this.initialColor;
  }

  selectColor(color: string) {
    this.selectedColor = color;
  }

  onColorChange() {
    // Color already updated via ngModel
  }

  dismiss() {
    this.modalController.dismiss();
  }

  confirm() {
    this.modalController.dismiss(this.selectedColor);
  }
}