import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; 
import { BuletinMutuelleComponent } from './buletin-mutuelle/buletin-mutuelle.component';
import { BuletinCNAMComponent } from './buletin-cnam/buletin-cnam.component';
import { ConsBuletinMutuelleComponent } from './cons-buletin-mutuelle/cons-buletin-mutuelle.component';
import { ConsBultCnamComponent } from './cons-bult-cnam/cons-bult-cnam.component';

// Component pages
 
 
const routes: Routes = [

{
    path: "BultMutuelle",
    component: BuletinMutuelleComponent
  },
  {
    path: "ConsBultMutuelle",
    component: ConsBuletinMutuelleComponent
  },

  {
    path: "BultCnam",
    component: BuletinCNAMComponent
  },
    {
    path: "ConsBultCnam",
    component: ConsBultCnamComponent
  },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BultinSoinRoutingModule {}
