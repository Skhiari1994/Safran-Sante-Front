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
import { CotisationRoutingModule } from './Cotisation-routing.module';
import { TableModule } from 'primeng/table';
import { CotisMutPersComponent } from './CotisationMutPers/cotis-mut-pers/cotis-mut-pers.component';
import { ValCotisationActifComponent } from './val-cotisation-actif/val-cotisation-actif.component';
import { ValCotisNonActifComponent } from './val-cotis-non-actif/val-cotis-non-actif.component';
import { ValCotActifAutoComponent } from './val-cot-actif-auto/val-cot-actif-auto.component';
import { CotisationService } from './cotisation.service';
import { EditionEtatCotisationComponent } from './edition-etat-cotisation/edition-etat-cotisation.component';

import { MontantMaskDirective } from './montant-mask.directive';

@NgModule({
  declarations: [

    CotisMutPersComponent,
    ValCotisationActifComponent,
    ValCotisNonActifComponent,
    ValCotActifAutoComponent,
    EditionEtatCotisationComponent,
    MontantMaskDirective
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
    CotisationRoutingModule,
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
    DatePipe, provideNgxMask(), CotisationService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CotisationModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
