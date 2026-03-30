import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InitPlafondComponent } from './init-plafond/init-plafond.component';
import { MajAffiliationComponent } from './maj-affiliation/maj-affiliation.component';
import { MajDossMldComponent } from './maj-doss-mld/maj-doss-mld.component';
import { ConsPlafondComponent } from './cons-plafond/cons-plafond.component';
import { MajPlafondComponent } from './maj-plafond/maj-plafond.component';
import { MajPecComponent } from './maj-pec/maj-pec.component';
import { RecapRembAdherentComponent } from './recap-remb-adherent/recap-remb-adherent.component';
import { RecapGenRegAnnComponent } from './recap-gen-reg-ann/recap-gen-reg-ann.component';

// Component pages


const routes: Routes = [

  {
    path: "InitPlafond",
    component: InitPlafondComponent
  },
  {
    path: "MajAffiliation",
    component: MajAffiliationComponent
  },

  {
    path: "MajDossMld",
    component: MajDossMldComponent
  },
  {
    path: "ConsPlafond",
    component: ConsPlafondComponent
  },
  {
    path: "RecapRembAdherent",
    component: RecapRembAdherentComponent
  },
  {
    path: "MajPlafond",
    component: MajPlafondComponent
  },
  {
    path: "MajPecMaladie",
    component: MajPecComponent
  },
  {
    path: "RecapGenRegAnn",
    component: RecapGenRegAnnComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdherentRoutingModule { }
