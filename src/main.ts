import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app/app.routes';
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';

const browserConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' }))
  ]
};

bootstrapApplication(App, mergeApplicationConfig(appConfig, browserConfig))
  .catch((err) => console.error(err));