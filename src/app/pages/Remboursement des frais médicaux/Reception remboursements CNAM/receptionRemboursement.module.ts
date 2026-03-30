import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTypeaheadModule, NgbTooltipModule, NgbDropdownModule, NgbAccordionModule, NgbToastModule, NgbCollapseModule, NgbNavModule, NgbPopoverModule, NgbProgressbarModule, NgbModalModule, NgbCarouselModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

import { FlatpickrModule } from 'angularx-flatpickr';

import { NgSelectModule } from '@ng-select/ng-select';

import { defineElement } from 'lord-icon-element';
import lottie from 'lottie-web';

import { DatePipe } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExtraspagesModule } from '../../extrapages/extraspages.module';
import { MontantMaskDirective } from './montant-mask.directive';
import { NgxMasonryModule } from 'ngx-masonry';
import { SimplebarAngularModule } from 'simplebar-angular';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { ChargBordArriverCNAMComponent } from './charg-bord-arriver-cnam/charg-bord-arriver-cnam.component';
import { ReceptionRemboursementRoutingModule } from './ReceptionRemboursement-routing.module';
import { ControlBordCnamComponent } from './control-bord-cnam/control-bord-cnam.component';
import { SaisieManuBordCnamComponent } from './saisie-manu-bord-cnam/saisie-manu-bord-cnam.component';
import { SaisieAutoBordCnamComponent } from './saisie-auto-bord-cnam/saisie-auto-bord-cnam.component';
import { SaisManDcptLibrCnamComponent } from './sais-man-dcpt-libr-cnam/sais-man-dcpt-libr-cnam.component';
import { CalculComplementRembComponent } from './calcul-complement-remb/calcul-complement-remb.component';
import { SaisieLibreCnamComponent } from './saisie-libre-cnam/saisie-libre-cnam.component';
import { CalCompteLibreCnamComponent } from './cal-compte-libre-cnam/cal-compte-libre-cnam.component';
import { SaisieTxtBordCnamComponent } from './saisie-txt-bord-cnam/saisie-txt-bord-cnam.component';
import { SaisieBordArriverComponent } from './saisie-bord-arriver/saisie-bord-arriver.component';
import { SaisieEnvoiBordCnamComponent } from './saisie-envoi-bord-cnam/saisie-envoi-bord-cnam.component';



// PrimeNG
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
@NgModule({
  declarations: [


    MontantMaskDirective,

    ChargBordArriverCNAMComponent,
    ControlBordCnamComponent,
    SaisieManuBordCnamComponent,
    SaisieAutoBordCnamComponent,
    SaisManDcptLibrCnamComponent,
    CalculComplementRembComponent,
    SaisieLibreCnamComponent,
    CalCompteLibreCnamComponent,
    SaisieTxtBordCnamComponent,
    SaisieBordArriverComponent,
    SaisieEnvoiBordCnamComponent
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
    ReceptionRemboursementRoutingModule,
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


    // PrimeNG
    TableModule,
    InputTextModule,
    ButtonModule,
    RippleModule,
    TooltipModule,

  ],

  providers: [
    DatePipe, provideNgxMask()
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ReceptionRemboursementModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
