import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTypeaheadModule, NgbTooltipModule, NgbDropdownModule, NgbAccordionModule, NgbToastModule, NgbCollapseModule, NgbNavModule, NgbPopoverModule, NgbProgressbarModule, NgbModalModule, NgbCarouselModule, NgbAlertModule, NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';

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
import { SharedModule } from 'src/app/shared/shared.module';
import { ExtraspagesModule } from '../../extrapages/extraspages.module';
import { NgxMasonryModule } from 'ngx-masonry';
import { SimplebarAngularModule } from 'simplebar-angular';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { NgxSliderModule } from 'ngx-slider-v2';
import { TableModule } from 'primeng/table';
import { InitPlafondComponent } from './init-plafond/init-plafond.component';
import { AdherentRoutingModule } from './Adherent-routing.module';
import { MajAffiliationComponent } from './maj-affiliation/maj-affiliation.component';
import { MajDossMldComponent } from './maj-doss-mld/maj-doss-mld.component';
import { ConsPlafondComponent } from './cons-plafond/cons-plafond.component';
import { MajPecComponent } from './maj-pec/maj-pec.component';
import { MajPlafondComponent } from './maj-plafond/maj-plafond.component';
import { MontantMaskDirective } from './montant-mask.directive';
import { RecapRembAdherentComponent } from './recap-remb-adherent/recap-remb-adherent.component';
import { RecapGenRegAnnComponent } from './recap-gen-reg-ann/recap-gen-reg-ann.component';

@NgModule({
  declarations: [

    InitPlafondComponent, MajAffiliationComponent, MajDossMldComponent, ConsPlafondComponent, MajPecComponent, MajPlafondComponent,
    MontantMaskDirective, RecapRembAdherentComponent, RecapGenRegAnnComponent
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
    AdherentRoutingModule,
    SharedModule,
    NgxPaginationModule,
    ExtraspagesModule,
    NgbAlertModule,
    NgbCarouselModule,
    NgbModalModule,
    NgbProgressbarModule,
    NgbPopoverModule,
    NgbNavModule,
    NgbCollapseModule,
    NgbToastModule,
    SimplebarAngularModule,
    NgxMasonryModule,

    NgxMaskDirective,
    NgxMaskPipe,
    NgbRatingModule,
    NgxSliderModule,
    TableModule,


  ],

  providers: [
    DatePipe, provideNgxMask()
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdherentModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
