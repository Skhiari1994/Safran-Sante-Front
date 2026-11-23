import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateProfileComponent } from './create-profile/create-profile.component';
import { GestionProfileComponent } from './gestion-profile/gestion-profile.component';
import { GestionMenuComponent } from './gestion-menu/gestion-menu.component'; 
import { ParametrageRapportsComponent } from './parametrage-rapports/parametrage-rapports.component';
import { ConsultationUtilisateurComponent } from './consultation-utilisateur/consultation-utilisateur.component';
import { MajValideurComponent } from './maj-valideur/maj-valideur.component';
import { ParametresGenerauxComponent } from './parametres-generaux/parametres-generaux.component';
import { ParametreNotificationsComponent } from './parametre-notifications/parametre-notifications.component';
  

// Component pages
 
 
const routes: Routes = [
  {
    path: "AddProfile",
    component: CreateProfileComponent,
   
    
  },
  {
    path: "GestionUtilisateur",
    // l'ajout d'un utilisateur est une fenêtre de la liste : cette adresse (menu) ouvre la liste avec la fenêtre d'ajout
    component: ConsultationUtilisateurComponent,
    data: { ouvrirAjout: true },
    
    
    
  },
  {
    path: "UtilisateurConsultation",
    component: ConsultationUtilisateurComponent,
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
  {
    path: "ParametresGeneraux",
    component: ParametresGenerauxComponent
  },
  {
    path: "ParametreNotifications",
    component: ParametreNotificationsComponent
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
