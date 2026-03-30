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
import { ModifCrefitRoutingModule } from './ModifCrefit-routing.module';
import { AnticipationCreditComponent } from './anticipation-credit/anticipation-credit.component';
import { SaisieMntAnticipComponent } from './saisie-mnt-anticip/saisie-mnt-anticip.component';
import { MontantMaskDirective } from './montant-mask.directive';
import { ValidMntAnticipComponent } from './valid-mnt-anticip/valid-mnt-anticip.component';
import { ReportPretComponent } from './report-pret/report-pret.component';
import { ReechelonnementPretComponent } from './reechelonnement-pret/reechelonnement-pret.component';
import { SuspenssionCreditComponent } from './suspenssion-credit/suspenssion-credit.component';
import { ImputationMntAnticipComponent } from './imputation-mnt-anticip/imputation-mnt-anticip.component';

@NgModule({
  declarations: [ 
  
    AnticipationCreditComponent, SaisieMntAnticipComponent,MontantMaskDirective, ValidMntAnticipComponent, ReportPretComponent, ReechelonnementPretComponent, SuspenssionCreditComponent, ImputationMntAnticipComponent
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
    ModifCrefitRoutingModule,
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
export class ModifCrefitModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
