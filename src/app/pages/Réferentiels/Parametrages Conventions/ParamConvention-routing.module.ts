import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';  
import { ParamConventionComponent } from './param-convention/param-convention.component';
import { ParamMotifSuspComponent } from './param-motif-susp/param-motif-susp.component';
// Component pages
 
 
const routes: Routes = [
 
  {
    path: "ParamConvention",
    component: ParamConventionComponent
  },
  {
    path: "ParamMotifSusp",
    component: ParamMotifSuspComponent
  },
  // {
  //   path: "PersValideur",
  //   component: MajValideurComponent
  // },
  // {
  //   path: "leads",
  //   component: LeadsComponent
  // },  

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ParamConventionRoutingModule {}
