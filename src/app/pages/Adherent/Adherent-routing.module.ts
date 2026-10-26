import { RenouvellementAdhesionComponent } from './renouvellement-adhesion/renouvellement-adhesion.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; 
import { MajAdherentComponent } from './maj-adherent/maj-adherent.component';
import { MajAdhrerentMouadhComponent } from './maj-adhrerent-mouadh/maj-adhrerent-mouadh.component';
import { MajAdherentTestComponent } from './maj-adherent-test/maj-adherent-test.component';
import { ValidAdherentComponent } from './valid-adherent/valid-adherent.component';
import { MajCertifFamComponent } from './maj-certif-fam/maj-certif-fam.component';
import { SuspAdhesionMutComponent } from './susp-adhesion-mut/susp-adhesion-mut.component';
import { ValidationSuspEtValidAdherentComponent } from './validation-susp-et-valid-adherent/validation-susp-et-valid-adherent.component';
import { MajDepartPersComponent } from './maj-depart-pers/maj-depart-pers.component';
import { MajReintegrationPersComponent } from './maj-reintegration-pers/maj-reintegration-pers.component'; 
import { ListeAdherentComponent } from './edition/liste-adherent/liste-adherent.component';
import { ListeAdherentEnfantComponent } from './edition/liste-adherent-enfant/liste-adherent-enfant.component';
import { MembreFamilleAdherentComponent } from './edition/membre-famille-adherent/membre-famille-adherent.component';
import { ListCarteAdherentComponent } from './edition/list-carte-adherent/list-carte-adherent.component';
import { ListCarteComponent } from './edition/list-carte/list-carte.component';
import { FichePersComponent } from './edition/fiche-pers/fiche-pers.component';
import { ListAdhesionSuspenduComponent } from './edition/list-adhesion-suspendu/list-adhesion-suspendu.component';
import { ListeDepartPersComponent } from './edition/liste-depart-pers/liste-depart-pers.component';
import { PagesGuard } from 'src/app/core/guards/pages.guard';
import { ValDepartReintegrationPersComponent } from './val-depart-reintegration-pers/val-depart-reintegration-pers.component';
 import { EditionAdhesionMutuelleComponent } from './edition/edition-adhesion-mutuelle/edition-adhesion-mutuelle.component';
import { TransCreditMutComponent } from './trans-credit-mut/trans-credit-mut.component';
import { DFlPersScgComponent } from './dfl-pers-scg/dfl-pers-scg.component';

// Component pages
 
 
const routes: Routes = [

  {
    path: "ConsAdherent",
    component: MajAdherentComponent
  } ,
  {
    path: "MajAdherent",
    component: MajAdherentComponent
  } ,
  {
    path: "MajAdherent1",
    component: MajAdherentTestComponent,/* 
    canActivate:[PagesGuard],
    data: { action: 'Adherent/MajAdherent1' } */
  },  
  {
    path: "MajAdherentMouadh",
    component: MajAdhrerentMouadhComponent
  },  
  {
    path: "ValidAdherent",
    component: ValidAdherentComponent
  } ,
  {
    path: "MajCertifFam",
    component: MajCertifFamComponent
  },
  {
    path: "Renouvellement",
    component: RenouvellementAdhesionComponent
  }  ,
  {
    path: "SuspAdhesion",
    component: SuspAdhesionMutComponent
  }  ,
  {
    path: "ValidSuspRenouvAdherent",
    component: ValidationSuspEtValidAdherentComponent
  },
  {
    path: "SaisieDecisionDepart",
    component: MajDepartPersComponent
  } ,
  {
    path: "SaisieDecisionReinteg",
    component: MajReintegrationPersComponent
  } ,
  {
    path: "ValDepartReinteg",
    component: ValDepartReintegrationPersComponent
  }   ,     
  {
    path: "MajAdherentMouadh",
    component: MajAdhrerentMouadhComponent
  },
  {
    path: "Edition",
    component: EditionAdhesionMutuelleComponent
  },   
  {
    path: "TransCreditMut",
    component: TransCreditMutComponent
  },
  {
    path: "PersScg",
    component: DFlPersScgComponent
  },   
  {
    path: "ListeAdherent",
    component: ListeAdherentComponent
  }, 
  {
    path: "ListeAdherentEnfant",
    component: ListeAdherentEnfantComponent
  }, 
  {
    path: "MembreFamilleAdherent",
    component: MembreFamilleAdherentComponent
  }, 
  {
    path: "MembreFamilleAdherent",
    component: MembreFamilleAdherentComponent
  }, 
  {
    path: "ListCarteAdherent",
    component: ListCarteAdherentComponent
  }, 
  {
    path: "ListCarte",
    component: ListCarteComponent
  }, 
  {
    path: "FichePers",
    component: FichePersComponent
  },
  {
    path: "ListAdhesionSuspendu",
    component: ListAdhesionSuspenduComponent
  },
  {
    path: "ListeDepartPers",
    component: ListeDepartPersComponent
  },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdherentRoutingModule {}
