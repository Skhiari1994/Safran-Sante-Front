import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; 

// Component pages
 
 
const routes: Routes = [

  {
    path: 'Adherent', loadChildren: () => import('./Parametrages Adherent/ParamAdherent.module').then(m => m.ParamAdherentModule)
  },
  {
    path: 'Credit', loadChildren: () => import('./Parametrages credits/ParamCredit.module').then(m => m.ParamCreditModule)
  },

  {
    path: 'Assurance', loadChildren: () => import('./Parameterages assurances/ParamAssur.module').then(m => m.ParamAssurModule)
 
  },
  
  {
    path: 'Indemnite', loadChildren: () => import('./param-type-indemnite/ParamIndemnite.module').then(m => m.ParamIndemniteModule)
  },
  
  
  {
    path: 'Convention', loadChildren: () => import('./Parametrages Conventions/ParamConvention.module').then(m => m.ParamConventionModule)
  },
  {
    path: 'CaisseRetr', loadChildren: () => import('./param_caisse_retraite/ParamCaisseRetraite.module').then(m => m.ParamCaisseRetraiteModule)
  },


  
  // {
  //   path: "AddProfile",
  //   component: CreateProfileComponent
  // },
  // {
  //   path: "GestionUtilisateur",
  //   component: GestionUtlisateurComponent
  // },
  // {
  //   path: "gestionProfil",
  //   component: GestionProfileComponent
  // },
  // {
  //   path: "gestionMenu",
  //   component: GestionMenuComponent
  // },
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
export class ReferentielRoutingModule {}
