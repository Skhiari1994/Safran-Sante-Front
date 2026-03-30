import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SaisieIndemniteComponent } from './saisie-indemnite/saisie-indemnite.component';
import { ValidationIndemniteComponent } from './validation-indemnite/validation-indemnite.component';
import { DeblocageIndemniteComponent } from './deblocage-indemnite/deblocage-indemnite.component';
import { VirementIndemniteComponent } from './virement-indemnite/virement-indemnite.component';
import { ClotureIndemniteScolaireComponent } from './cloture-indemnite-scolaire/cloture-indemnite-scolaire.component';
import { SaisieIndScolComponent } from './saisie-ind-scol/saisie-ind-scol.component';
import { EditionIndemniteComponent } from './edition-indemnite/edition-indemnite.component';
import { EditionIndemniteAdherentComponent } from './edition-indemnite-adherent/edition-indemnite-adherent.component';
import { EditionListIndemComponent } from './edition-list-indem/edition-list-indem.component';
import { EditionListIndemDeblComponent } from './edition-list-indem-debl/edition-list-indem-debl.component';
import { ImportIndemniteExcelComponent } from './import-indemnite-excel/import-indemnite-excel.component';


// Component pages


const routes: Routes = [


  {
    path: "SaisieIndemnite",
    component: SaisieIndemniteComponent

  },
  {
    path: "ValIndemnite",
    component: ValidationIndemniteComponent
  }
  ,
  {
    path: "DeblocageInd",
    component: DeblocageIndemniteComponent
  },
  {
    path: "VirementIndScol",
    component: VirementIndemniteComponent
  },
  {
    path: "CloturIndScol",
    component: ClotureIndemniteScolaireComponent
  },
  {
    path: "SaisieIndScol",
    component: SaisieIndScolComponent
  },
  {
    path: "EditionIndemnite",
    component: EditionIndemniteComponent
  },
  {
    path: "EditionIndemniteAdhe",
    component: EditionIndemniteAdherentComponent
  },
  {
    path: "EditionListIndemn",
    component: EditionListIndemComponent
  },
  {
    path: "EditionListIndemnDeblc",
    component: EditionListIndemDeblComponent
  },
  {
    path: "ImportIndemniteExcel",
    component: ImportIndemniteExcelComponent
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IndemnitesRoutingModule { }
