import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; 
import { PreparationBordCnamComponent } from './preparation-bord-cnam/preparation-bord-cnam.component';
import { PreparationBordMutComponent } from './preparation-bord-mut/preparation-bord-mut.component';
import { PreparationBordCnamSuppComponent } from './preparation-bord-cnam-supp/preparation-bord-cnam-supp.component';
import { ConsultationBordCnamComponent } from './consultation-bord-cnam/consultation-bord-cnam.component';

// Component pages
 
 
 
const routes: Routes = [

  {
      path: "PrepBordCNAM",
      component: PreparationBordCnamComponent
    },
    {
      path: "PrepBordMut",
      component: PreparationBordMutComponent
    },
    {
      path: "PrepBordCnamSupp",
      component: PreparationBordCnamSuppComponent
    },
    {
      path: "ConsBordCnam",
      component: ConsultationBordCnamComponent
    },
    
  ];
  
  @NgModule({
      imports: [RouterModule.forChild(routes)],
      exports: [RouterModule]
  })
  export class   PrepBordCnamRoutingModule {}
  