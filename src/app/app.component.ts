import { Component } from '@angular/core';
import { initGlobalDatePicker } from './shared/global-datepicker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Arabsoft';

  constructor() {
    initGlobalDatePicker();
  }
}
