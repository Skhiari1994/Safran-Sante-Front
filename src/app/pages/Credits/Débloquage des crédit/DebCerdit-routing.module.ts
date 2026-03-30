import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ValidPretComponent } from './valid-pret/valid-pret.component';
import { SaisiePretComponent } from './saisie-pret/saisie-pret.component';
import { DebPretComponent } from './deb-pret/deb-pret.component';
import { ConsultPretComponent } from './consult-pret/consult-pret.component';
import { RegManuelCreditComponent } from './reg-manuel-credit/reg-manuel-credit.component';
import { ReglementAutomatiqueCreditComponent } from './reglement-automatique-credit/reglement-automatique-credit.component';
import { PrepareDisquetteComponent } from './prepare-disquette/prepare-disquette.component';
import { ClotureCommissionComponent } from './cloture-commission/cloture-commission.component';
import { CorrNumCommComponent } from './corr-num-comm/corr-num-comm.component';
import { SuppressionPretComponent } from './suppression-pret/suppression-pret.component';

// Component pages


const routes: Routes = [

  {
    path: "debCreditSansDemande",
    component: SaisiePretComponent
  },
  {
    path: "ValidPret",
    component: ValidPretComponent
  },
  {
    path: "DeblPret",
    component: DebPretComponent
  },
  {
    path: "ConsultPret",
    component: ConsultPretComponent
  },
  {
    path: "ReglementManuelle",
    component: RegManuelCreditComponent
  },
  {
    path: "ReglementAutomatique",
    component: ReglementAutomatiqueCreditComponent
  },
  {
    path: "PrepareDisquette",
    component: PrepareDisquetteComponent
  },
  {
    path: "ClotureCommission",
    component: ClotureCommissionComponent
  },
  {
    path: "CorrNumComm",
    component: CorrNumCommComponent
  },
  {
    path: "SuppressionPret",
    component: SuppressionPretComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DebCerditRoutingModule { }
