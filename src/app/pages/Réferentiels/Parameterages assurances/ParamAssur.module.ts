import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTypeaheadModule, NgbTooltipModule, NgbDropdownModule, NgbAccordionModule, NgbRatingModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

// Flat Picker
import { FlatpickrModule } from "angularx-flatpickr";

// Ng Select
import { NgSelectModule } from "@ng-select/ng-select";

// Load Icons
import { defineElement } from "lord-icon-element";
import lottie from "lottie-web";

// Component pages

import { DatePipe } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { TranslateModule } from '@ngx-translate/core';
import { LovComponent } from 'src/app/extraspages/lov/lov.component';
import { ExtraspagesModule } from '../../extrapages/extraspages.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ParamAssurRoutingModule } from './ParamAssur-routing.module';
import { ParamIdentificationMutComponent } from './param-identification-mut/param-identification-mut.component';
import { RefVisiteComponent } from './ref-visite/ref-visite.component';
import { ParamRefMedComponent } from './param-ref-med/param-ref-med.component';
import { MontantMaskDirective } from './montant-mask.directive';
import { ParamRefActComponent } from './param-ref-act/param-ref-act.component';
import { ParamRefAppareilComponent } from './param-ref-appareil/param-ref-appareil.component';
import { ParamMaladieComponent } from './param-maladie/param-maladie.component';
import { ParamRefEtablisComponent } from './param-ref-etablis/param-ref-etablis.component';
import { ParamPersPhysiqueComponent } from './param-pers-physique/param-pers-physique.component';
import { ParamRegimeRembComponent } from './param-regime-remb/param-regime-remb.component';
import { ParamRefFilliereComponent } from './param-ref-filliere/param-ref-filliere.component';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { NgxSliderModule } from 'ngx-slider-v2';
import { ParamNatureActeComponent } from './param-nature-acte/param-nature-acte.component';
import { ParamActeMedicauxComponent } from './param-acte-medicaux/param-acte-medicaux.component';
import { PriseChargeBaremRembComponent } from './prise-charge-barem-remb/prise-charge-barem-remb.component';
import { ParamActiviteEtablisComponent } from './param-activite-etablis/param-activite-etablis.component';
import { ParamPersonneConventionneesComponent } from './param-personne-conventionnees/param-personne-conventionnees.component';
import { ParamEtablissConventionneesComponent } from './param-etabliss-conventionnees/param-etabliss-conventionnees.component';
import { TableModule } from 'primeng/table';

@NgModule({
  declarations: [



    ParamIdentificationMutComponent, RefVisiteComponent, ParamRefMedComponent, MontantMaskDirective, 
    ParamRefActComponent, ParamRefAppareilComponent, ParamMaladieComponent, ParamRefEtablisComponent, 
    ParamPersPhysiqueComponent, ParamRegimeRembComponent, ParamRefFilliereComponent,    ParamIdentificationMutComponent,
    RefVisiteComponent,
    ParamRefMedComponent,
    MontantMaskDirective,
    ParamRefActComponent,
    ParamRefAppareilComponent,
    ParamMaladieComponent,
    ParamRefEtablisComponent,
    ParamPersPhysiqueComponent,
    ParamRegimeRembComponent,
    ParamNatureActeComponent,
    ParamActeMedicauxComponent,
    PriseChargeBaremRembComponent,
    ParamActiviteEtablisComponent,
    ParamPersonneConventionneesComponent,
    ParamEtablissConventionneesComponent],

 
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgbTypeaheadModule,
    NgbTooltipModule,
    ParamAssurRoutingModule,

    NgxMaskDirective,
    NgxMaskPipe,
    CommonModule,
    TranslateModule,
    FlatpickrModule,
    NgSelectModule,
    SharedModule,
    NgxPaginationModule,
    ExtraspagesModule,
    NgbPaginationModule,
    NgbDropdownModule,
    NgbNavModule,
    NgbAccordionModule,
    NgbRatingModule,
    NgxSliderModule,
    NgxMaskDirective,
    NgxMaskPipe,
    TableModule,
  ],

  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ParamAssurModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
