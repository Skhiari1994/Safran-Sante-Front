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
import { ValidPretComponent } from './valid-pret/valid-pret.component';
import { SaisiePretSansDemComponent } from './saisie-pret-sans-dem/saisie-pret-sans-dem.component';
import { MontantMaskDirective } from './montant-mask.directive';
import { SaisiePretComponent } from './saisie-pret/saisie-pret.component';
import { DebCerditRoutingModule } from './DebCerdit-routing.module';
import { DebPretComponent } from './deb-pret/deb-pret.component';
import { ConsultPretComponent } from './consult-pret/consult-pret.component';
import { RegManuelCreditComponent } from './reg-manuel-credit/reg-manuel-credit.component';
import { FormatMonthYearDirective } from './format-month-year.directive';
import { ReglementAutomatiqueCreditComponent } from './reglement-automatique-credit/reglement-automatique-credit.component';
import { PrepareDisquetteComponent } from './prepare-disquette/prepare-disquette.component';
import { ClotureCommissionComponent } from './cloture-commission/cloture-commission.component';
import { CorrNumCommComponent } from './corr-num-comm/corr-num-comm.component';
import { SuppressionPretComponent } from './suppression-pret/suppression-pret.component';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TabViewModule } from 'primeng/tabview';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';



@NgModule({
  declarations: [
    SaisiePretSansDemComponent,
    MontantMaskDirective,
    SaisiePretComponent,
    ValidPretComponent,
    DebPretComponent,
    ConsultPretComponent,
    RegManuelCreditComponent,
    FormatMonthYearDirective,
    ReglementAutomatiqueCreditComponent,
    PrepareDisquetteComponent,
    ClotureCommissionComponent,
    CorrNumCommComponent,
    SuppressionPretComponent
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
    DebCerditRoutingModule,
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
    ToastModule,
    TabViewModule,
    DropdownModule,
    ButtonModule,
    RippleModule,
    TooltipModule,
    InputTextModule
  ],

  providers: [
    DatePipe, provideNgxMask(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DebCerditModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
