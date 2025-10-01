import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonText, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Login - CronoTrack</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
            <ion-item>
              <ion-label position="floating">Email</ion-label>
              <ion-input formControlName="email" type="email"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="floating">Password</ion-label>
              <ion-input formControlName="password" type="password"></ion-input>
            </ion-item>
            <ion-button expand="block" type="submit" [disabled]="loginForm.invalid">Login</ion-button>
          </form>
          <ion-button expand="block" fill="outline" (click)="onGoogleLogin()">Login with Google</ion-button>
          <ion-text color="primary" class="ion-text-center">
            <p>Don't have an account? <a routerLink="/auth/register">Register</a></p>
          </ion-text>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonText, IonCard, IonCardContent]
})
export class LoginPage {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      const { error } = await this.authService.signIn(email, password);
      if (error) {
        console.error('Login error:', error);
      }
    }
  }

  async onGoogleLogin() {
    const { error } = await this.authService.signInWithGoogle();
    if (error) {
      console.error('Google login error:', error);
    }
  }
}