import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTypeaheadModule, NgbTooltipModule, NgbDropdownModule, NgbAccordionModule, NgbToastModule, NgbCollapseModule, NgbNavModule, NgbPopoverModule, NgbProgressbarModule, NgbModalModule, NgbCarouselModule, NgbAlertModule, NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';

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
 import { SharedModule } from 'src/app/shared/shared.module';
import { ExtraspagesModule } from '../../extrapages/extraspages.module'; 
import { NgxMasonryModule } from 'ngx-masonry';
import { SimplebarAngularModule } from 'simplebar-angular';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { NgxSliderModule } from 'ngx-slider-v2'; 
import { EditionRembRoutingModule } from './EditionRemb-routing.module';
import { EditionRecapRembAdhComponent } from './edition-recap-remb-adh/edition-recap-remb-adh.component';
import { EditionJournMutComponent } from './edition-journ-mut/edition-journ-mut.component';
import { EditionJournCNAMComponent } from './edition-journ-cnam/edition-journ-cnam.component';

@NgModule({
  declarations: [
 
  
    EditionRecapRembAdhComponent,
          EditionJournMutComponent,
          EditionJournCNAMComponent
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
    EditionRembRoutingModule,
    SharedModule,
    NgxPaginationModule,
    ExtraspagesModule,
    NgbAlertModule,
    NgbCarouselModule,
    NgbModalModule,
    NgbProgressbarModule,
    NgbPopoverModule,
    NgbNavModule,
    NgbCollapseModule,
    NgbToastModule,
    SimplebarAngularModule,
    NgxMasonryModule,
    
    NgxMaskDirective,
    NgxMaskPipe,
    NgbRatingModule,
    NgxSliderModule, 
 
     
  ],

  providers: [
    DatePipe,provideNgxMask()
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditionRembModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
