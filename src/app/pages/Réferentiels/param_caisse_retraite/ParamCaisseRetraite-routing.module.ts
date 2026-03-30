import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';  
import { ParamCaisseComponent } from './param-caisse/param-caisse.component';
import { MotifRembourComponent } from './motif-rembour/motif-rembour.component';
 
// Component pages
 
 
const routes: Routes = [
 
  {
    path: "ParamCaisee",
    component: ParamCaisseComponent
  },  
  {
    path: "MotifRembour",
    component: MotifRembourComponent
  }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ParamCaisseRetraiteRoutingModule {}
