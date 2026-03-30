import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditionTabAmmortisComponent } from './edition-tab-ammortis/edition-tab-ammortis.component';
import { EditionEtatRetenuPretComponent } from './edition-etat-retenu-pret/edition-etat-retenu-pret.component';
import { EditionBalancePretComponent } from './edition-balance-pret/edition-balance-pret.component';
import { EditionPretDeblcComponent } from './edition-pret-deblc/edition-pret-deblc.component';
import { EditionFichePretMoisComponent } from './edition-fiche-pret-mois/edition-fiche-pret-mois.component';
import { EditionAnticipMoisComponent } from './edition-anticip-mois/edition-anticip-mois.component';
import { EditionBalanceComponent } from './edition-balance/edition-balance.component';
import { EditionCommPretComponent } from './edition-comm-pret/edition-comm-pret.component';
import { EditionRetenuesMensuellesComponent } from './edition-retenues-mensuelles/edition-retenues-mensuelles.component';

// Component pages


const routes: Routes = [
  {
    path: "EditionTabAmmort",
    component: EditionTabAmmortisComponent
  },
  {
    path: "EditionEtatRetenuPret",
    component: EditionEtatRetenuPretComponent
  },
  {
    path: "EditionBalancePret",
    component: EditionBalancePretComponent
  },
  {
    path: "EditionPretDeblc",
    component: EditionPretDeblcComponent
  },
  {
    path: "FichePretMois",
    component: EditionFichePretMoisComponent
  },
  {
    path: "EditionPRetAnticip",
    component: EditionAnticipMoisComponent
  },
  {
    path: "EditionBalance",
    component: EditionBalanceComponent
  },

  {
    path: "EditionCommPret",
    component: EditionCommPretComponent
  },
  {
    path: "EditionRetenuesMensuelles",
    component: EditionRetenuesMensuellesComponent
  },

  // {
  //   path: "ValidPret",
  //   component: ValidPretComponent
  // } ,
  // {
  //   path: "DeblPret",
  //   component: DebPretComponent
  // } ,
  // {
  //   path: "ConsultPret",
  //   component: ConsultPretComponent
  // } ,
  // {
  //   path: "ReglementManuelle",
  //   component: RegManuelCreditComponent
  // } ,
  // {
  //   path: "ReglementAutomatique",
  //   component: ReglementAutomatiqueCreditComponent
  // } ,
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EditionCreditRoutingModule { }
