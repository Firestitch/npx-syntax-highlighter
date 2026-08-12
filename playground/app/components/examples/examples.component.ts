import { Component } from '@angular/core';

import { FsExampleModule } from '@firestitch/example';

import { ExampleIframeComponent } from '../example-iframe/example-iframe.component';
import { ExampleComponent } from '../example/example.component';
import { environment } from '../../../environments/environment';


@Component({
  templateUrl: 'examples.component.html',
  standalone: true,
  imports: [
    FsExampleModule,
    ExampleComponent,
    ExampleIframeComponent,
  ],
})
export class ExamplesComponent {
  public config = environment;
}
