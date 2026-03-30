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
  
import { DatePipe } from '@angular/common'; 
import { NgxPaginationModule } from 'ngx-pagination'; 
import { TranslateModule } from '@ngx-translate/core'; 
  
import { NgxSliderModule } from 'ngx-slider-v2';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask'; 
 import { SharedModule } from 'src/app/shared/shared.module';
import { ExtraspagesModule } from '../../extrapages/extraspages.module';  
import { PrepRetenuMensRoutingModule } from './PrepRetenuMens-routing.module';
import { ChargeRetenuMensComponent } from './charge-retenu-mens/charge-retenu-mens.component';
import { ValidRetenuMensComponent } from './valid-retenu-mens/valid-retenu-mens.component';
import { FichierRetenueMensComponent } from './fichier-retenue-mens/fichier-retenue-mens.component';
// PrimeNG
import { TableModule } from 'primeng/table';
    
@NgModule({
  declarations: [ 
  

   
    ChargeRetenuMensComponent, ValidRetenuMensComponent, FichierRetenueMensComponent
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
    PrepRetenuMensRoutingModule,
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

  providers: [
    DatePipe,provideNgxMask(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PrepRetenuMensModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
