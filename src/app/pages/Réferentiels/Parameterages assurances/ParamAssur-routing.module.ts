import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';  
import { ParamIdentificationMutComponent } from './param-identification-mut/param-identification-mut.component';
import { RefVisiteComponent } from './ref-visite/ref-visite.component';
import { ParamRefMedComponent } from './param-ref-med/param-ref-med.component';
import { ParamRefActComponent } from './param-ref-act/param-ref-act.component';
import { ParamRefAppareilComponent } from './param-ref-appareil/param-ref-appareil.component';
import { ParamMaladieComponent } from './param-maladie/param-maladie.component';
import { ParamRefEtablisComponent } from './param-ref-etablis/param-ref-etablis.component';
import { ParamPersPhysiqueComponent } from './param-pers-physique/param-pers-physique.component';
import { ParamRegimeRembComponent } from './param-regime-remb/param-regime-remb.component';
import { ParamRefFilliereComponent } from './param-ref-filliere/param-ref-filliere.component';
import { ParamNatureActeComponent } from './param-nature-acte/param-nature-acte.component';
import { ParamActeMedicauxComponent } from './param-acte-medicaux/param-acte-medicaux.component';
import { PriseChargeBaremRembComponent } from './prise-charge-barem-remb/prise-charge-barem-remb.component';
import { ParamActiviteEtablisComponent } from './param-activite-etablis/param-activite-etablis.component';
import { ParamPersonneConventionneesComponent } from './param-personne-conventionnees/param-personne-conventionnees.component';
import { ParamEtablissConventionneesComponent } from './param-etabliss-conventionnees/param-etabliss-conventionnees.component';
import { MisAjCnamComponent } from './mis-aj-cnam/mis-aj-cnam.component';

// Component pages
 
 
const routes: Routes = [
  {
    path: "IdentificationMut",
    component: ParamIdentificationMutComponent
  },
  {
    path: "RefVisite",
    component: RefVisiteComponent
  },
  {
    path: "RefMed",
    component: ParamRefMedComponent
  },
  {
    path: "RefAct",
    component: ParamRefActComponent
  },
  {
    path: "RefApp",
    component: ParamRefAppareilComponent
  },
  {
    path: "Maladie",
    component: ParamMaladieComponent
  },
  {
    path: "RefEtablis",
    component: ParamRefEtablisComponent
  },
  {
    path: "PersPhysique",
    component: ParamPersPhysiqueComponent
  },
  {
    path: "RegimeRemb",
    component: ParamRegimeRembComponent
  },
  {
    path: "ParamNatureActe",
    component: ParamNatureActeComponent
  },
   
  {
    path: "ParamActeMedicaux",
    component: ParamActeMedicauxComponent
  },
  {
    path: "PriseChargeBaremeRemb",
    component: PriseChargeBaremRembComponent
  },
  {
    path: "ParamActiviteEtablis",
    component: ParamActiviteEtablisComponent
  },
  {
    path: "ParamEtablissementCoventionnee",
    component: ParamEtablissConventionneesComponent
  },
  {
    path: "ParamPersonneConventionnee",
    component: ParamPersonneConventionneesComponent
  },
   

  
  // {
  //   path: "Affectation",
  //   component: PrmAffectationComponent
  // },
  {
    path: "RefFilliere",
    component: ParamRefFilliereComponent
  },

  {
    path: "misAjourRef",
    component: MisAjCnamComponent
  },
  // {
  //   path: "typeDepart",
  //   component: PrmTypDepartComponent
  // },
  // {
  //   path: "activiteEnf",
  //   component: PrmActiviteEnfComponent
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
export class ParamAssurRoutingModule {}
