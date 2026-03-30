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
import { ParamCaisseRetraiteRoutingModule } from './ParamCaisseRetraite-routing.module';
import { ParamCaisseComponent } from './param-caisse/param-caisse.component';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { MontantMaskDirective } from './montant-mask.directive';
import { MotifRembourComponent } from './motif-rembour/motif-rembour.component';
import { TableModule } from 'primeng/table';

@NgModule({
  declarations: [ 
     
  
    ParamCaisseComponent,
     MontantMaskDirective,
     MotifRembourComponent
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
    ParamCaisseRetraiteRoutingModule,
   SharedModule,
   NgxPaginationModule,
   ExtraspagesModule,
   
    NgxMaskDirective,
    NgxMaskPipe
    ,
    TableModule

  ],

  providers: [
    DatePipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ParamCaisseRetraiteModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
