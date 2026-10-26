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
 import { SharedModule } from '../../shared/shared.module';
 
import { DatePipe } from '@angular/common';
import { adminRoutingModule } from './Admin-routing.module';
import { CreateProfileComponent } from './create-profile/create-profile.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { GestionProfileComponent } from './gestion-profile/gestion-profile.component';
import { TranslateModule } from '@ngx-translate/core';
import { GestionMenuComponent } from './gestion-menu/gestion-menu.component';
import { ConsultationUtilisateurComponent } from './consultation-utilisateur/consultation-utilisateur.component';
import { TableModule } from 'primeng/table';
import { MajValideurComponent } from './maj-valideur/maj-valideur.component';
import { GestionUtlisateurComponent } from './gestion-utlisateur/gestion-utlisateur.component';
import { ExtraspagesModule } from '../extrapages/extraspages.module';
import { LovComponent } from 'src/app/extraspages/lov/lov.component';
 
import { ParametrageRapportsComponent } from './parametrage-rapports/parametrage-rapports.component';
import { NgxMaskPipe } from 'ngx-mask';
   
@NgModule({
  declarations: [
CreateProfileComponent,
GestionProfileComponent,
GestionMenuComponent,
MajValideurComponent,
GestionUtlisateurComponent,
ConsultationUtilisateurComponent,
 
ParametrageRapportsComponent
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
    adminRoutingModule,
   SharedModule,
   NgxPaginationModule,
   ExtraspagesModule,
NgxMaskPipe,
    TableModule,
  ],

  providers: [
    DatePipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
