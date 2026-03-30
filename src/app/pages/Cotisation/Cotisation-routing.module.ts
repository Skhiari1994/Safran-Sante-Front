import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CotisMutPersComponent } from './CotisationMutPers/cotis-mut-pers/cotis-mut-pers.component';
import { ValCotisationActifComponent } from './val-cotisation-actif/val-cotisation-actif.component';
import { ValCotisNonActifComponent } from './val-cotis-non-actif/val-cotis-non-actif.component';
import { ValCotActifAutoComponent } from './val-cot-actif-auto/val-cot-actif-auto.component';
import { EditionEtatCotisationComponent } from './edition-etat-cotisation/edition-etat-cotisation.component';

// Component pages


const routes: Routes = [


  {
    path: "CotisationMut",
    component: CotisMutPersComponent
  },
  {
    path: "ValCotNonActif",
    component: ValCotisNonActifComponent
  }
  ,
  {
    path: "ValCotActifAuto",
    component: ValCotActifAutoComponent
  },

  {
    path: "ValCotActif",
    component: ValCotisationActifComponent
  },
  {
    path: "EditionCotis",
    component: EditionEtatCotisationComponent

  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CotisationRoutingModule { }
