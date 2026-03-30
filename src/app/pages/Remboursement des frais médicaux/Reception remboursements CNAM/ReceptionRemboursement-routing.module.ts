import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChargBordArriverCNAMComponent } from './charg-bord-arriver-cnam/charg-bord-arriver-cnam.component';
import { ControlBordCnamComponent } from './control-bord-cnam/control-bord-cnam.component';
import { SaisieManuBordCnamComponent } from './saisie-manu-bord-cnam/saisie-manu-bord-cnam.component';
import { SaisieAutoBordCnamComponent } from './saisie-auto-bord-cnam/saisie-auto-bord-cnam.component';
import { CalculComplementRembComponent } from './calcul-complement-remb/calcul-complement-remb.component';
import { SaisManDcptLibrCnamComponent } from './sais-man-dcpt-libr-cnam/sais-man-dcpt-libr-cnam.component';
import { SaisieLibreCnamComponent } from './saisie-libre-cnam/saisie-libre-cnam.component';
import { CalCompteLibreCnamComponent } from './cal-compte-libre-cnam/cal-compte-libre-cnam.component';
import { SaisieTxtBordCnamComponent } from './saisie-txt-bord-cnam/saisie-txt-bord-cnam.component';
import { SaisieBordArriverComponent } from './saisie-bord-arriver/saisie-bord-arriver.component';
import { SaisieEnvoiBordCnamComponent } from './saisie-envoi-bord-cnam/saisie-envoi-bord-cnam.component';
import { UnsavedChangesGuard } from 'src/app/core/guards/unsaved-changes.guard';





const routes: Routes = [

  {
    path: "ChargementBordArriverCnam",
    component: ChargBordArriverCNAMComponent
  },
  {
    path: "ControlBordCnam",
    component: ControlBordCnamComponent
  },
  {
    path: "SaisieManuBordCnam",
    component: SaisieManuBordCnamComponent
  },
  {
    path: "SaisieAutoBordCnam",
    component: SaisieAutoBordCnamComponent
  },
  {
    path: "CalculComplementRemb",
    component: CalculComplementRembComponent
  },
  {
    path: "SaisManuDecmtLibCnam",
    component: SaisManDcptLibrCnamComponent
  },
  /*   {
     path: "SaisieLibreCnam",
     component: SaisManDcptLibrCnamComponent
   },  */
  {
    path: "SaisieLibreCnam",
    component: SaisieLibreCnamComponent
  },
  {
    path: "CalCompteLibreMut",
    component: CalCompteLibreCnamComponent
  },
  {
    path: "AutoBordCnam",
    component: SaisieTxtBordCnamComponent
  },
  {
    path: "SaisieBordArriver",
    component: SaisieBordArriverComponent
  },
  {
    path: "SaisieEnvoiBordCnam",
    component: SaisieEnvoiBordCnamComponent,
    canDeactivate: [UnsavedChangesGuard]
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReceptionRemboursementRoutingModule { }
