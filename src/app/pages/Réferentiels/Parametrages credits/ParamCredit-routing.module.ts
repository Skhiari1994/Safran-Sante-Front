import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';  
import { TypePretComponent } from './type-pret/type-pret.component';
import { PositionPretComponent } from './position-pret/position-pret.component';
import { PiecePretComponent } from './piece-pret/piece-pret.component';
import { PieceParTypPretComponent } from './piece-par-typ-pret/piece-par-typ-pret.component';
import { EtatPretComponent } from './etat-pret/etat-pret.component';
import { OrgPretComponent } from './org-pret/org-pret.component';

// Component pages
 
 
const routes: Routes = [
 
  {
    path: "TypePret",
    component: TypePretComponent
  },
  {
    path: "Position",
    component: PositionPretComponent
  },
  {
    path: "Piece",
    component: PiecePretComponent
  },
  {
    path: "PieceParTypePret",
    component: PieceParTypPretComponent
  },  
  {
    path: "EtatPret",
    component: EtatPretComponent
  },  
  {
    path: "OrgPret",
    component: OrgPretComponent
  },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ParamCreditRoutingModule {}
