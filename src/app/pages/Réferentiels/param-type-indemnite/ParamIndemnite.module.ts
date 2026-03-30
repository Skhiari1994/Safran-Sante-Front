import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTypeaheadModule, NgbTooltipModule, NgbDropdownModule, NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

// Flat Picker
import { FlatpickrModule } from 'angularx-flatpickr';

// Ng Select
import { NgSelectModule } from '@ng-select/ng-select';

// Load Icons
import { defineElement } from 'lord-icon-element';
import lottie from 'lottie-web';

// Component pages
  
import { DatePipe } from '@angular/common';
  import { NgxPaginationModule } from 'ngx-pagination';
 import { TranslateModule } from '@ngx-translate/core'; 
  import { ExtraspagesModule } from '../../extrapages/extraspages.module';
import { SharedModule } from 'src/app/shared/shared.module'; 
import { ParamTypeIndemniteComponent } from './param-type-indemnite/param-type-indemnite.component';
import { ParamIndemniteRoutingModule } from './ParamIndemnite-routing.module';
import { TableModule } from 'primeng/table';

@NgModule({
  declarations: [ 
    
    
ParamTypeIndemniteComponent  
  ],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
     ReactiveFormsModule,
    NgbPaginationModule,
    NgbTypeaheadModule,
    NgbTooltipModule,
    NgbDropdownModule,
    NgbAccordionModule,
    FlatpickrModule,
    NgSelectModule,
    ParamIndemniteRoutingModule,
   SharedModule,
   NgxPaginationModule,
   ExtraspagesModule
   ,
   TableModule

  ],

  providers: [
    DatePipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ParamIndemniteModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
