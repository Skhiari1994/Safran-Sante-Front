import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';  
import { EditionRecapRembAdhComponent } from './edition-recap-remb-adh/edition-recap-remb-adh.component';
import { EditionJournMutComponent } from './edition-journ-mut/edition-journ-mut.component';
import { EditionJournCNAMComponent } from './edition-journ-cnam/edition-journ-cnam.component';

// Component pages
 
 
const routes: Routes = [

{
    path: "RecapRembAdh",
    component: EditionRecapRembAdhComponent
  },
  {
    path: "EditionJournMut",
    component: EditionJournMutComponent
  },

  {
    path: "EditionJournCnam",
    component: EditionJournCNAMComponent
  },
//     {
//     path: "ConsBultCnam",
//     component: ConsBultCnamComponent
//   },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EditionRembRoutingModule {}
