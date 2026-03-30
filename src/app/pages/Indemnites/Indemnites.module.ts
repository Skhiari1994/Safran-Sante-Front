// ========== indemnites.module.ts ==========
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgbPaginationModule,
  NgbTypeaheadModule,
  NgbTooltipModule,
  NgbDropdownModule,
  NgbAccordionModule,
  NgbNavModule,
  NgbRatingModule
} from '@ng-bootstrap/ng-bootstrap';

// Flat Picker
import { FlatpickrModule } from 'angularx-flatpickr';

// Ng Select
import { NgSelectModule } from '@ng-select/ng-select';

// Load Icons
import { defineElement } from 'lord-icon-element';
import lottie from 'lottie-web';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';

import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule as PrimeTooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MessageService } from 'primeng/api';

// Shared Modules
import { SharedModule } from '../../shared/shared.module';
import { ExtraspagesModule } from '../extrapages/extraspages.module';

// Utilities
import { DatePipe } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSliderModule } from 'ngx-slider-v2';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

// Component pages
import { SaisieIndemniteComponent } from './saisie-indemnite/saisie-indemnite.component';
import { IndemnitesRoutingModule } from './Indemnites-routing.module';
import { ValidationIndemniteComponent } from './validation-indemnite/validation-indemnite.component';
import { DeblocageIndemniteComponent } from './deblocage-indemnite/deblocage-indemnite.component';
import { VirementIndemniteComponent } from './virement-indemnite/virement-indemnite.component';
import { ClotureIndemniteScolaireComponent } from './cloture-indemnite-scolaire/cloture-indemnite-scolaire.component';
import { SaisieIndScolComponent } from './saisie-ind-scol/saisie-ind-scol.component';
import { EditionIndemniteComponent } from './edition-indemnite/edition-indemnite.component';
import { EditionIndemniteAdherentComponent } from './edition-indemnite-adherent/edition-indemnite-adherent.component';
import { EditionListIndemComponent } from './edition-list-indem/edition-list-indem.component';
import { EditionListIndemDeblComponent } from './edition-list-indem-debl/edition-list-indem-debl.component';
import { ImportIndemniteExcelComponent } from './import-indemnite-excel/import-indemnite-excel.component';


@NgModule({
  declarations: [
    SaisieIndemniteComponent,
    ValidationIndemniteComponent,
    DeblocageIndemniteComponent,
    VirementIndemniteComponent,
    ClotureIndemniteScolaireComponent,
    SaisieIndScolComponent,
    EditionIndemniteComponent,
    EditionIndemniteAdherentComponent,
    EditionListIndemComponent,
    EditionListIndemDeblComponent,
    ImportIndemniteExcelComponent
  ],

  imports: [
    // Angular Core
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    // Translation
    TranslateModule,

    // NG-Bootstrap Modules
    NgbPaginationModule,
    NgbTypeaheadModule,
    NgbTooltipModule,
    NgbDropdownModule,
    NgbAccordionModule,
    NgbNavModule,
    NgbRatingModule,

    // Third Party Libraries
    FlatpickrModule,
    NgSelectModule,
    NgxPaginationModule,
    NgxSliderModule,
    NgxMaskDirective,
    NgxMaskPipe,

    // Routing
    IndemnitesRoutingModule,

    // Shared Modules (contains app-lov, app-breadcrumbs, pagination-controls, etc.)
    SharedModule,
    ExtraspagesModule,

    // PrimeNG Modules
    TableModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    DropdownModule,
    NgbDropdownModule,
    CheckboxModule,
    PrimeTooltipModule,
    RippleModule,
    BreadcrumbModule
  ],
  providers: [
    DatePipe,
    provideNgxMask(),
    MessageService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class IndemnitesModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}