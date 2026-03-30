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
  import { ExtraspagesModule } from '../../extrapages/extraspages.module';
import { SharedModule } from 'src/app/shared/shared.module'; 
import { ParamCreditRoutingModule } from './ParamCredit-routing.module';
import { TypePretComponent } from './type-pret/type-pret.component';
import { PositionPretComponent } from './position-pret/position-pret.component';
import { PiecePretComponent } from './piece-pret/piece-pret.component';
import { PieceParTypPretComponent } from './piece-par-typ-pret/piece-par-typ-pret.component';
import { EtatPretComponent } from './etat-pret/etat-pret.component';
import { OrgPretComponent } from './org-pret/org-pret.component';
import { TableModule } from 'primeng/table';
    
@NgModule({
  declarations: [ 
    
    
  
    TypePretComponent, PositionPretComponent, PiecePretComponent, PieceParTypPretComponent, EtatPretComponent, OrgPretComponent
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
    ParamCreditRoutingModule,
   SharedModule,
   NgxPaginationModule,
   ExtraspagesModule
   ,
   TableModule

  ],

  providers: [
    DatePipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ParamCreditModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
