import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTypeaheadModule, NgbTooltipModule, NgbDropdownModule, NgbAccordionModule, NgbRatingModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

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
 import { RembFraisMedicauxRoutingModule } from './RembFraisMedicaux-routing.module';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { NgxSliderModule } from 'ngx-slider-v2';
import { ExtraspagesModule } from '../extrapages/extraspages.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
   
@NgModule({
  declarations: [ 
    
    
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
    RembFraisMedicauxRoutingModule,
   SharedModule,
   NgxPaginationModule,
   ExtraspagesModule,
     NgbNavModule,
    NgbRatingModule,
    NgxSliderModule,
   NgxMaskDirective, 
   NgxMaskPipe,
       TableModule,
       InputTextModule,
       ButtonModule,
       RippleModule,
       NgbTooltipModule,



  ],

  providers: [
    DatePipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RembFraisMedicauxModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
