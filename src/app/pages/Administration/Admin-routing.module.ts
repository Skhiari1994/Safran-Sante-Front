import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateProfileComponent } from './create-profile/create-profile.component';
import { GestionProfileComponent } from './gestion-profile/gestion-profile.component';
import { GestionMenuComponent } from './gestion-menu/gestion-menu.component'; 
import { ParametrageRapportsComponent } from './parametrage-rapports/parametrage-rapports.component';
import { GestionUtlisateurComponent } from './gestion-utlisateur/gestion-utlisateur.component';
import { MajValideurComponent } from './maj-valideur/maj-valideur.component';
  

// Component pages
 
 
const routes: Routes = [
  {
    path: "AddProfile",
    component: CreateProfileComponent,
   
    
  },
  {
    path: "GestionUtilisateur",
    component: GestionUtlisateurComponent,
    
    
    
  },
  {
    path: "gestionProfil",
    component: GestionProfileComponent,
    

  },
  {
    path: "gestionMenu",
    component: GestionMenuComponent,
    
  },
  {
    path: "PersValideur",
    component: MajValideurComponent,
    
  },
  {
    path: "ParametrageRapport",
    component: ParametrageRapportsComponent
  },
   
  // {
  //   path: "leads",
  //   component: LeadsComponent
  // },  

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class adminRoutingModule {}
