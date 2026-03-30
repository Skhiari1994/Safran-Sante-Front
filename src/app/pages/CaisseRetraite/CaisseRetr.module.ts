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
// PrimeNG
import { TableModule } from 'primeng/table';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { NgStepperModule } from 'angular-ng-stepper'; 
import { CaisseRetrRoutingModule } from './CaisseRetr-routing.module';
import { SaisieCotisComponent } from './saisie-cotis/saisie-cotis.component';
import { MontantMaskDirective } from './montant-mask.directive';
import { ValidCotisComponent } from './valid-cotis/valid-cotis.component';
import { ValidCotisPrimeMutComponent } from './valid-cotis-prime-mut/valid-cotis-prime-mut.component';
import { ValidAutoPrimeMutComponent } from './valid-auto-prime-mut/valid-auto-prime-mut.component';
import { PrimeRetraiteComponent } from './prime-retraite/prime-retraite.component';
import { ValPrimeRetraiteComponent } from './val-prime-retraite/val-prime-retraite.component';
import { EditionEtatPrimeMoisComponent } from './edition-etat-prime-mois/edition-etat-prime-mois.component';
      
@NgModule({
  declarations: [
 SaisieCotisComponent,
 MontantMaskDirective,
 ValidCotisComponent,
 ValidCotisPrimeMutComponent,
 ValidAutoPrimeMutComponent,
 PrimeRetraiteComponent,
 ValPrimeRetraiteComponent,
 EditionEtatPrimeMoisComponent
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
    CaisseRetrRoutingModule,
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
   NgxSliderModule,
    CdkStepperModule,
    NgStepperModule,
  ],
  // exports: [
  //   DateFormatterDirective, // Exportez-la si vous voulez l'utiliser dans d'autres modules
  // ],
  providers: [
    DatePipe,provideNgxMask(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CaisseRetrModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
