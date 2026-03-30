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
 import { LovComponent } from 'src/app/extraspages/lov/lov.component';
 import { ParamAdherentRoutingModule } from './ParamAdherent-routing.module';
import { ExtraspagesModule } from '../../extrapages/extraspages.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PrmNationaliteComponent } from './prm-nationalite/prm-nationalite.component';
import { PrmPosteComponent } from './prm-poste/prm-poste.component';
import { PrmBanqueComponent } from './prm-banque/prm-banque.component';
import { PrmSocieteComponent } from './prm-societe/prm-societe.component';
import { PrmDepartementComponent } from './prm-departement/prm-departement.component';
import { PrmAffectationComponent } from './prm-affectation/prm-affectation.component';
import { PrmTypDepartComponent } from './prm-typ-depart/prm-typ-depart.component';
import { PrmActiviteEnfComponent } from './prm-activite-enf/prm-activite-enf.component';
import { MisAjCnamComponent } from '../Parameterages assurances/mis-aj-cnam/mis-aj-cnam.component';
import { TableModule } from 'primeng/table';
   
@NgModule({
  declarations: [ 
    
    PrmNationaliteComponent, PrmPosteComponent, PrmBanqueComponent, PrmSocieteComponent, PrmDepartementComponent, PrmAffectationComponent, PrmTypDepartComponent, PrmActiviteEnfComponent, MisAjCnamComponent
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
    ParamAdherentRoutingModule,
   SharedModule,
   NgxPaginationModule,
   ExtraspagesModule,
   TableModule

  ],
  

  providers: [
    DatePipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ParamAdherentModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
