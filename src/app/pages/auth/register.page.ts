import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonText, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Register - CronoTrack</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
            <ion-item>
              <ion-label position="floating">Email</ion-label>
              <ion-input formControlName="email" type="email"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="floating">Password</ion-label>
              <ion-input formControlName="password" type="password"></ion-input>
            </ion-item>
            <ion-button expand="block" type="submit" [disabled]="registerForm.invalid">Register</ion-button>
          </form>
          <ion-text color="primary" class="ion-text-center">
            <p>Already have an account? <a routerLink="/auth/login">Login</a></p>
          </ion-text>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonText, IonCard, IonCardContent]
})
export class RegisterPage {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async onRegister() {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;
      const { error } = await this.authService.signUp(email, password);
      if (error) {
        console.error('Register error:', error);
      }
    }
  }
}