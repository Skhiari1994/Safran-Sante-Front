import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; 

// Component pages
 
 
const routes: Routes = [
{
    path: 'Adherent', loadChildren: () => import('./Adherent/Adherent.module').then(m => m.AdherentModule) 
 
  },
  {
    path: 'BuletinSoin', loadChildren: () => import('../Remboursement des frais médicaux/Bulletin de soins/BultinSoin.module').then(m => m.BultinSoinModule) 
 
  },
  {
    path: 'Envoi', loadChildren: () => import('./Envoi/PrepBordCnam.module').then(m => m.PrepBordCnamModule) 
 
  },
  {
    path: 'ReceptionRemboursement', loadChildren: () => import('./Reception remboursements CNAM/receptionRemboursement.module').then(m => m.ReceptionRemboursementModule) 
 
  },
  {
    path: 'Reglement', loadChildren: () => import('./Reglement/Reglement.module').then(m => m.ReglementModule) 
 
  }, 
  {
    path: 'Edition', loadChildren: () => import('./Editions/EditionRemb.module').then(m => m.EditionRembModule) 
 
  }, 
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RembFraisMedicauxRoutingModule {}
