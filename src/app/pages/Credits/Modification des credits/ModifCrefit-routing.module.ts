import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';   
import { AnticipationCreditComponent } from './anticipation-credit/anticipation-credit.component';
import { SaisieMntAnticipComponent } from './saisie-mnt-anticip/saisie-mnt-anticip.component';
import { ValidMntAnticipComponent } from './valid-mnt-anticip/valid-mnt-anticip.component';
import { ReportPretComponent } from './report-pret/report-pret.component';
import { ReechelonnementPretComponent } from './reechelonnement-pret/reechelonnement-pret.component';
import { SuspenssionCreditComponent } from './suspenssion-credit/suspenssion-credit.component';
import { ImputationMntAnticipComponent } from './imputation-mnt-anticip/imputation-mnt-anticip.component';

 
// Component pages
 
 
const routes: Routes = [
  {
    path: "SaisieMntAnticip",
    component: SaisieMntAnticipComponent
  } ,
  {
    path: "ValidMntAnticip",
    component: ValidMntAnticipComponent
  } ,
  {
    path: "AnticipCredit",
    component: AnticipationCreditComponent
  } ,
  {
    path: "reportPret",
    component: ReportPretComponent
  } ,
  {
    path: "reechPret",
    component: ReechelonnementPretComponent
  } ,
  {
    path: "suspCredit",
    component: SuspenssionCreditComponent
  } ,
   {
    path: "ImputationMntAnticip",
    component: ImputationMntAnticipComponent
  }
 
 
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ModifCrefitRoutingModule {}
