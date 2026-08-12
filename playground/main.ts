import { enableProdMode, importProvidersFrom } from '@angular/core';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Routes, provideRouter } from '@angular/router';

import { FsExampleModule } from '@firestitch/example';
import { FsMessageModule } from '@firestitch/message';

import { AppComponent } from './app/app.component';
import { ExamplesComponent } from './app/components';
import { environment } from './environments/environment';

const routes: Routes = [
  { path: '', component: ExamplesComponent },
];


if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, FsExampleModule.forRoot(), FsMessageModule.forRoot()),
    provideAnimations(),
    provideRouter(routes),
  ],
})
  .catch((err) => console.error(err));
