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
import { EditionTabAmmortisComponent } from './edition-tab-ammortis/edition-tab-ammortis.component';
import { EditionCreditRoutingModule } from './EditionCredit-routing.module';
import { EditionEtatRetenuPretComponent } from './edition-etat-retenu-pret/edition-etat-retenu-pret.component';
import { EditionBalancePretComponent } from './edition-balance-pret/edition-balance-pret.component';
import { EditionPretDeblcComponent } from './edition-pret-deblc/edition-pret-deblc.component';
import { EditionFichePretMoisComponent } from './edition-fiche-pret-mois/edition-fiche-pret-mois.component';
import { EditionAnticipMoisComponent } from './edition-anticip-mois/edition-anticip-mois.component';
import { EditionBalanceComponent } from './edition-balance/edition-balance.component';
import { EditionCommPretComponent } from './edition-comm-pret/edition-comm-pret.component';
import { EditionRetenuesMensuellesComponent } from './edition-retenues-mensuelles/edition-retenues-mensuelles.component';

@NgModule({
  declarations: [


    EditionTabAmmortisComponent, EditionEtatRetenuPretComponent, EditionBalancePretComponent, EditionPretDeblcComponent, EditionFichePretMoisComponent, EditionAnticipMoisComponent, EditionBalanceComponent, EditionCommPretComponent, EditionRetenuesMensuellesComponent
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
    SharedModule,
    EditionCreditRoutingModule,
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
    DatePipe, provideNgxMask(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditionCreditModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
