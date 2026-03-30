import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; 
import { PrmNationaliteComponent } from './prm-nationalite/prm-nationalite.component';
import { PrmPosteComponent } from './prm-poste/prm-poste.component';
import { PrmBanqueComponent } from './prm-banque/prm-banque.component';
import { PrmSocieteComponent } from './prm-societe/prm-societe.component';
import { PrmDepartementComponent } from './prm-departement/prm-departement.component';
import { PrmAffectationComponent } from './prm-affectation/prm-affectation.component';
import { PrmTypDepartComponent } from './prm-typ-depart/prm-typ-depart.component';
import { PrmActiviteEnfComponent } from './prm-activite-enf/prm-activite-enf.component';
import { MisAjCnamComponent } from '../Parameterages assurances/mis-aj-cnam/mis-aj-cnam.component';

// Component pages
 
 
const routes: Routes = [
  {
    path: "Nationalite",
    component: PrmNationaliteComponent
  },
  {
    path: "Poste",
    component: PrmPosteComponent
  },
  {
    path: "Agence",
    component: PrmBanqueComponent
  },
  {
    path: "Societe",
    component: PrmSocieteComponent
  },
  {
    path: "Departement",
    component: PrmDepartementComponent
  },
  {
    path: "Affectation",
    component: PrmAffectationComponent
  },
  {
    path: "typeDepart",
    component: PrmTypDepartComponent
  },
  {
    path: "activiteEnf",
    component: PrmActiviteEnfComponent
  },
 
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
export class ParamAdherentRoutingModule {}
