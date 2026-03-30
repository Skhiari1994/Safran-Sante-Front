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
import { AdherentRoutingModule } from './Adherent-routing.module';
import { MajAdherentComponent } from './maj-adherent/maj-adherent.component';
import { NgxSliderModule } from 'ngx-slider-v2';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { NgStepperModule } from 'angular-ng-stepper';
import { DateFormatterDirective } from './date-formatter.directive';
import { TableModule } from 'primeng/table';
import { MajAdhrerentMouadhComponent } from './maj-adhrerent-mouadh/maj-adhrerent-mouadh.component';
import { MajAdherentTestComponent } from './maj-adherent-test/maj-adherent-test.component';
import { ValidAdherentComponent } from './valid-adherent/valid-adherent.component';
import { MajCertifFamComponent } from './maj-certif-fam/maj-certif-fam.component';
import { SuspAdhesionMutComponent } from './susp-adhesion-mut/susp-adhesion-mut.component';
import { RenouvellementAdhesionComponent } from './renouvellement-adhesion/renouvellement-adhesion.component';
import { ValidationSuspEtValidAdherentComponent } from './validation-susp-et-valid-adherent/validation-susp-et-valid-adherent.component';
import { MajDepartPersComponent } from './maj-depart-pers/maj-depart-pers.component';
import { ListeAdherentComponent } from './edition/liste-adherent/liste-adherent.component';
import { ListeAdherentEnfantComponent } from './edition/liste-adherent-enfant/liste-adherent-enfant.component';
import { MembreFamilleAdherentComponent } from './edition/membre-famille-adherent/membre-famille-adherent.component';
import { ListCarteAdherentComponent } from './edition/list-carte-adherent/list-carte-adherent.component';
import { ListCarteComponent } from './edition/list-carte/list-carte.component';
import { FichePersComponent } from './edition/fiche-pers/fiche-pers.component';
import { ListAdhesionSuspenduComponent } from './edition/list-adhesion-suspendu/list-adhesion-suspendu.component';
import { ListeDepartPersComponent } from './edition/liste-depart-pers/liste-depart-pers.component';
import { MajReintegrationPersComponent } from './maj-reintegration-pers/maj-reintegration-pers.component';
import { ValDepartReintegrationPersComponent } from './val-depart-reintegration-pers/val-depart-reintegration-pers.component';
import { EditionAdhesionMutuelleComponent } from './edition/edition-adhesion-mutuelle/edition-adhesion-mutuelle.component';
import { TransCreditMutComponent } from './trans-credit-mut/trans-credit-mut.component';
import { DFlPersScgComponent } from './dfl-pers-scg/dfl-pers-scg.component';
      
@NgModule({
  declarations: [
 
    MajAdherentComponent,
       DateFormatterDirective,MajAdhrerentMouadhComponent ,
     MajAdhrerentMouadhComponent,
     MajAdherentTestComponent,
     ValidAdherentComponent,
     MajCertifFamComponent,
     SuspAdhesionMutComponent,
     RenouvellementAdhesionComponent,
     ValidationSuspEtValidAdherentComponent,
     MajDepartPersComponent,
     MajReintegrationPersComponent,
     ValDepartReintegrationPersComponent,
     EditionAdhesionMutuelleComponent,
     TransCreditMutComponent,
     DFlPersScgComponent, 
       ListeAdherentComponent,
     ListeAdherentEnfantComponent,
     MembreFamilleAdherentComponent,
     ListCarteAdherentComponent,
     ListCarteComponent,
     FichePersComponent,
     ListAdhesionSuspenduComponent,
     ListeDepartPersComponent
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
   NgxSliderModule,
    CdkStepperModule,
   NgStepperModule,
   TableModule,
  ],
  // exports: [
  //   DateFormatterDirective, // Exportez-la si vous voulez l'utiliser dans d'autres modules
  // ],
  providers: [
    DatePipe,provideNgxMask(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdherentModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
