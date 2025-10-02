import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

bootstrapApplication(App, {
  providers: [
    importProvidersFrom(IonicModule.forRoot({})),
    ...appConfig.providers
  ],
})
  .catch((err) => console.error(err));
