import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTypeaheadModule, NgbTooltipModule, NgbDropdownModule, NgbAccordionModule, NgbNavModule, NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';

// Flat Picker
import { FlatpickrModule } from 'angularx-flatpickr';

// Ng Select
import { NgSelectModule } from '@ng-select/ng-select';

// Load Icons
import { defineElement } from 'lord-icon-element';
import lottie from 'lottie-web';

// Component pages
 import { SharedModule } from '../../shared/shared.module';
 
import { DatePipe } from '@angular/common'; 
import { NgxPaginationModule } from 'ngx-pagination'; 
import { TranslateModule } from '@ngx-translate/core'; 
import { ExtraspagesModule } from '../extrapages/extraspages.module';
 
import { NgxSliderModule } from 'ngx-slider-v2';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask'; 
import { CreditsRoutingModule } from './Credits-routing.module';
    
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
    CreditsRoutingModule,
   SharedModule,
   NgxPaginationModule,
   ExtraspagesModule,
   NgbPaginationModule,
   NgbTypeaheadModule,
   NgbDropdownModule,
   NgbNavModule,
   NgbAccordionModule,
   NgbRatingModule,
   NgbTooltipModule,
   NgxSliderModule,
   NgxMaskDirective, 
   NgxMaskPipe,
 
  ],

  providers: [
    DatePipe,provideNgxMask(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreditsModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
