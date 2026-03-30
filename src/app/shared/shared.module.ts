import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbNavModule, NgbAccordionModule, NgbDropdownModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

// Swiper Slider
import { SlickCarouselModule } from 'ngx-slick-carousel';

// Counter
import { CountUpModule } from 'ngx-countup';

import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { ClientLogoComponent } from './landing/index/client-logo/client-logo.component';
import { ServicesComponent } from './landing/index/services/services.component';
import { CollectionComponent } from './landing/index/collection/collection.component';
import { CtaComponent } from './landing/index/cta/cta.component';
import { DesignedComponent } from './landing/index/designed/designed.component';
import { PlanComponent } from './landing/index/plan/plan.component';
import { FaqsComponent } from './landing/index/faqs/faqs.component';
import { ReviewComponent } from './landing/index/review/review.component';
import { CounterComponent } from './landing/index/counter/counter.component';
import { WorkProcessComponent } from './landing/index/work-process/work-process.component';
import { TeamComponent } from './landing/index/team/team.component';
import { ContactComponent } from './landing/index/contact/contact.component';
import { FooterComponent } from './landing/index/footer/footer.component';
import { ScrollspyDirective } from './scrollspy.directive';

// NFT Landing 
import { MarketPlaceComponent } from './landing/nft/market-place/market-place.component';
import { WalletComponent } from './landing/nft/wallet/wallet.component';
import { FeaturesComponent } from './landing/nft/features/features.component';
import { CategoriesComponent } from './landing/nft/categories/categories.component';
import { DiscoverComponent } from './landing/nft/discover/discover.component';
import { TopCreatorComponent } from './landing/nft/top-creator/top-creator.component';

// Job Landing 
import { BlogComponent } from './landing/job/blog/blog.component';
import { CandidateComponent } from './landing/job/candidate/candidate.component';
import { FindjobsComponent } from './landing/job/findjobs/findjobs.component';
import { JobFooterComponent } from './landing/job/job-footer/job-footer.component';
import { JobcategoriesComponent } from './landing/job/jobcategories/jobcategories.component';
import { ProcessComponent } from './landing/job/process/process.component';
import { LandingScrollspyDirective } from './landingscrollspy.directive';
import { LovComponent } from './Composants/lov/lov.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableauComponent } from './Composants/tableau/tableau.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { SearchLovComponent } from './Composants/search-lov/search-lov.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { PretSearchComponent } from './Composants/pret-search/pret-search.component';
import { MatriculeLovComponent } from './Composants/matricule-lov/matricule-lov.component';
import { ConsBultMutLovComponent } from './Composants/cons-bult-mut-lov/cons-bult-mut-lov.component';
import { ConsBultCnamLovComponent } from './Composants/cons-bult-cnam-lov/cons-bult-cnam-lov.component';
 

@NgModule({
  declarations: [
    BreadcrumbsComponent,
    ClientLogoComponent,
    ServicesComponent,
    CollectionComponent,
    CtaComponent,
    DesignedComponent,
    PlanComponent,
    FaqsComponent,
    ReviewComponent,
    CounterComponent,
    WorkProcessComponent,
    TeamComponent,
    ContactComponent,
    FooterComponent,
    ScrollspyDirective,
    LandingScrollspyDirective,
    MarketPlaceComponent,
    WalletComponent,
    FeaturesComponent,
    CategoriesComponent,
    DiscoverComponent,
    TopCreatorComponent,
    BlogComponent,
    CandidateComponent,
    FindjobsComponent,
    JobFooterComponent,
    JobcategoriesComponent,
    ProcessComponent,
    LovComponent,
    TableauComponent,
    SearchLovComponent,
    PretSearchComponent,
    MatriculeLovComponent,
    ConsBultMutLovComponent,
    ConsBultCnamLovComponent,
 
   ],
  imports: [
    CommonModule,
    NgbNavModule,
    NgbAccordionModule,
    NgbDropdownModule,
    SlickCarouselModule,
    CountUpModule,
    FormsModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgxMaskDirective, 
    NgxMaskPipe,
    NgxPaginationModule
  ],
  exports: [
    BreadcrumbsComponent,
    ClientLogoComponent,
    ServicesComponent,
    CollectionComponent,
    CtaComponent,
    DesignedComponent,
    PlanComponent,
    FaqsComponent,
    ReviewComponent,
    CounterComponent,
    WorkProcessComponent,
    TeamComponent,
    ContactComponent,
    FooterComponent,
    ScrollspyDirective,
    LandingScrollspyDirective,
    WalletComponent,
    MarketPlaceComponent,
    FeaturesComponent,
    CategoriesComponent,
    DiscoverComponent,
    TopCreatorComponent,
    ProcessComponent,
    FindjobsComponent,
    CandidateComponent,
    BlogComponent,
    JobcategoriesComponent,
    JobFooterComponent,   
    LovComponent,
    TableauComponent,
    SearchLovComponent,
    PretSearchComponent,
    MatriculeLovComponent,
    ConsBultMutLovComponent,
    ConsBultCnamLovComponent
  ],
  providers: [
     provideNgxMask(),
  ],
  
})

export class SharedModule { }
