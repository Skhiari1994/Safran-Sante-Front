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
 import { SharedModule } from '../../../shared/shared.module';
 
import { DatePipe } from '@angular/common';
  import { NgxPaginationModule } from 'ngx-pagination';
 import { TranslateModule } from '@ngx-translate/core'; 
import { ExtraspagesModule } from '../../extrapages/extraspages.module';
 import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { NgxSliderModule } from 'ngx-slider-v2';
import { PrepBordCnamRoutingModule } from './PrepBordCnam-routing.module';
import { TableModule } from 'primeng/table';
import { PreparationBordCnamComponent } from './preparation-bord-cnam/preparation-bord-cnam.component';
import { PreparationBordMutComponent } from './preparation-bord-mut/preparation-bord-mut.component';
import { PreparationBordCnamSuppComponent } from './preparation-bord-cnam-supp/preparation-bord-cnam-supp.component';
import { ConsultationBordCnamComponent } from './consultation-bord-cnam/consultation-bord-cnam.component';
   
@NgModule({
  declarations: [ 
    
    PreparationBordCnamComponent, PreparationBordMutComponent, PreparationBordCnamSuppComponent, ConsultationBordCnamComponent
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
    PrepBordCnamRoutingModule,
   SharedModule,
   NgxPaginationModule,
   ExtraspagesModule,
     NgbNavModule,
    NgbRatingModule,
    NgxSliderModule,
   NgxMaskDirective, 
  NgxMaskPipe,
   TableModule,
 ],

  providers: [
    DatePipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PrepBordCnamModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
