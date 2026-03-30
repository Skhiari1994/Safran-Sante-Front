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
import { BultinSoinRoutingModule } from './BultinSoin-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExtraspagesModule } from '../../extrapages/extraspages.module';
import { BuletinMutuelleComponent } from './buletin-mutuelle/buletin-mutuelle.component';
import { MontantMaskDirective } from './montant-mask.directive';
import { NgxMasonryModule } from 'ngx-masonry';
import { SimplebarAngularModule } from 'simplebar-angular';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { NgxSliderModule } from 'ngx-slider-v2';
import { BuletinCNAMComponent } from './buletin-cnam/buletin-cnam.component';
import { ConsBuletinMutuelleComponent } from './cons-buletin-mutuelle/cons-buletin-mutuelle.component';
import { ConsBultCnamComponent } from './cons-bult-cnam/cons-bult-cnam.component';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TabViewModule } from 'primeng/tabview';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';


@NgModule({
  declarations: [

    BuletinMutuelleComponent,
    MontantMaskDirective,
    BuletinCNAMComponent,
    ConsBuletinMutuelleComponent,
    ConsBultCnamComponent
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
    BultinSoinRoutingModule,
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
    
    // PrimeNG modules
    TableModule,
    ToastModule,
    TabViewModule,
    DropdownModule,
    ButtonModule,
    RippleModule,
    TooltipModule,
    InputTextModule
  ],

  providers: [
    DatePipe,
    provideNgxMask(),
    MessageService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BultinSoinModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
