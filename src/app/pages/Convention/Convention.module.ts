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
import { LovComponent } from 'src/app/extraspages/lov/lov.component';

import { NgxSliderModule } from 'ngx-slider-v2';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { ConventionRoutingModule } from './Convention-routing.module';
// PrimeNG
import { TableModule } from 'primeng/table';
import { SaisDemConvComponent } from './sais-dem-conv/sais-dem-conv.component'; 
import { SuspDemConvComponent } from './susp-dem-conv/susp-dem-conv.component';
import { ValConvMutComponent } from './val-conv-mut/val-conv-mut.component';
import { FormatMonthYearDirective } from './format-month-year.directive';
import { RegAutoConvComponent } from './reg-auto-conv/reg-auto-conv.component'; 
import { ValidDemConvComponent } from './valid-dem-conv/valid-dem-conv.component';
import { EditionSuspMoisComponent } from './edition/edition-susp-mois/edition-susp-mois.component';
import { EditionListConvComponent } from './edition/edition-list-conv/edition-list-conv.component';
import { EditionListOffParConvComponent } from './edition/edition-list-off-par-conv/edition-list-off-par-conv.component';
import { EditionEtatConvMoisComponent } from './edition/edition-etat-conv-mois/edition-etat-conv-mois.component';
import { EditionEtatRegEspeceComponent } from './edition/edition-etat-reg-espece/edition-etat-reg-espece.component';
import { OrgChartComponent } from './org-chart/org-chart.component';
 

    
@NgModule({
  declarations: [

      SaisDemConvComponent,
      ValidDemConvComponent,
      SuspDemConvComponent,
      ValConvMutComponent,
      FormatMonthYearDirective,
      RegAutoConvComponent,
      EditionSuspMoisComponent,
      EditionListConvComponent,
      EditionListOffParConvComponent,
      EditionEtatConvMoisComponent,
      EditionEtatRegEspeceComponent,
      OrgChartComponent,
      
     ],
  imports: [FormsModule,
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
    ConventionRoutingModule,
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
   TableModule,
  ],
  exports: [SaisDemConvComponent] ,// 👈 export it,
  providers: [
    DatePipe,provideNgxMask(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ConventionModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
