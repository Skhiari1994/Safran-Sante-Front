import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';  
import { ParamTypeIndemniteComponent } from './param-type-indemnite/param-type-indemnite.component';

// Component pages
 
 
const routes: Routes = [
 
  {
    path: "ParamTypInd",
    component: ParamTypeIndemniteComponent
  }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ParamIndemniteRoutingModule {}
