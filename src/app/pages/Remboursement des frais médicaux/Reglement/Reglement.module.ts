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
import { LovComponent } from 'src/app/extraspages/lov/lov.component';
 import { SharedModule } from 'src/app/shared/shared.module';
import { ExtraspagesModule } from '../../extrapages/extraspages.module'; 
import { NgxMasonryModule } from 'ngx-masonry';
import { SimplebarAngularModule } from 'simplebar-angular';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { NgxSliderModule } from 'ngx-slider-v2'; 
import { ReglementRoutingModule } from './Reglement-routing.module';
import { RegBordMutComponent } from './reg-bord-mut/reg-bord-mut.component';
import { PayBordMutComponent } from './pay-bord-mut/pay-bord-mut.component';
import { RegCompMutComponent } from './reg-comp-mut/reg-comp-mut.component';
import { ReclameAdherentComponent } from './reclame-adherent/reclame-adherent.component';
import { ConsultCompMutComponent } from './consult-comp-mut/consult-comp-mut.component';
import { MajModPayMutComponent } from './maj-mod-pay-mut/maj-mod-pay-mut.component';
import { VirBordMutComponent } from './vir-bord-mut/vir-bord-mut.component';
import { MajModPayBordCnamComponent } from './maj-mod-pay-bord-cnam/maj-mod-pay-bord-cnam.component';
import { VirBordCnamComponent } from './vir-bord-cnam/vir-bord-cnam.component';
import { CptVirBordMutComponent } from './cpt-vir-bord-mut/cpt-vir-bord-mut.component';
import { CptCheqBordMutComponent } from './cpt-cheq-bord-mut/cpt-cheq-bord-mut.component';
import { CptVirBordCnamComponent } from './cpt-vir-bord-cnam/cpt-vir-bord-cnam.component';

// PrimeNG
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
 
  
    RegBordMutComponent,
          PayBordMutComponent,
          RegCompMutComponent,
          ReclameAdherentComponent,
          ConsultCompMutComponent,
          MajModPayMutComponent,
          VirBordMutComponent,
          MajModPayBordCnamComponent,
          VirBordCnamComponent,
          CptVirBordMutComponent,
          CptCheqBordMutComponent,
          CptVirBordCnamComponent
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
    ReglementRoutingModule,
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
 
     
    // PrimeNG
    TableModule,
    InputTextModule,
    ButtonModule,
    RippleModule,
    TooltipModule,
  ],

  providers: [
    DatePipe,provideNgxMask()
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ReglementModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
