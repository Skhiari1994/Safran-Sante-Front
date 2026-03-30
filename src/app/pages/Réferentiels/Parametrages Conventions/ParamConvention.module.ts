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
 import { LovComponent } from 'src/app/extraspages/lov/lov.component';
 import { ExtraspagesModule } from '../../extrapages/extraspages.module';
import { SharedModule } from 'src/app/shared/shared.module'; 
import { ParamConventionRoutingModule } from './ParamConvention-routing.module';
import { ParamConventionComponent } from './param-convention/param-convention.component';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { ParamMotifSuspComponent } from './param-motif-susp/param-motif-susp.component';
import { TableModule } from 'primeng/table';
   
@NgModule({
  declarations: [ 
    
    
  
    ParamConventionComponent, ParamMotifSuspComponent
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
    ParamConventionRoutingModule,
   SharedModule,
   NgxPaginationModule,
   ExtraspagesModule,
   
   NgxMaskDirective, 
   NgxMaskPipe,
    TableModule,

  ],

  providers: [
    DatePipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ParamConventionModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
