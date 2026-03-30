import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SaisieCotisComponent } from './saisie-cotis/saisie-cotis.component';
import { ValidCotisComponent } from './valid-cotis/valid-cotis.component';
import { ValidCotisPrimeMutComponent } from './valid-cotis-prime-mut/valid-cotis-prime-mut.component';
import { ValidAutoPrimeMutComponent } from './valid-auto-prime-mut/valid-auto-prime-mut.component';
import { PrimeRetraiteComponent } from './prime-retraite/prime-retraite.component';
import { ValPrimeRetraiteComponent } from './val-prime-retraite/val-prime-retraite.component';
import { EditionEtatPrimeMoisComponent } from './edition-etat-prime-mois/edition-etat-prime-mois.component';

// Component pages


const routes: Routes = [

  {
    path: "SaisieCotis",
    component: SaisieCotisComponent
  },
  {
    path: "ValidCotis",
    component: ValidCotisComponent
  },
  {
    path: "ValidCotisPrimeMut",
    component: ValidCotisPrimeMutComponent
  },
  {
    path: "ValidAutoPrimeMut",
    component: ValidAutoPrimeMutComponent
  },
  {
    path: "PrimeRetraite",
    component: PrimeRetraiteComponent
  },
    {
    path: "ValPrimeRetraite",
    component: ValPrimeRetraiteComponent
  },
      {
    path: "EditionPrimeRetraite",
    component: EditionEtatPrimeMoisComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CaisseRetrRoutingModule { }
