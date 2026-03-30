import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; 
import { PreparCommissionPretComponent } from './prepar-commission-pret/prepar-commission-pret.component';
import { PreparValCommissionPretComponent } from './prepar-val-commission-pret/prepar-val-commission-pret.component';
  
// Component pages
 
 
const routes: Routes = [

  {
    path: "PreparCommission",
    component: PreparCommissionPretComponent
  } ,
  {
    path: "ValideCommission",
    component: PreparValCommissionPretComponent
  } , 
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CommissionRoutingModule {}
