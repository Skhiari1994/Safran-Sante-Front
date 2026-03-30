import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';  
import { RegBordMutComponent } from './reg-bord-mut/reg-bord-mut.component';
import { PayBordMutComponent } from './pay-bord-mut/pay-bord-mut.component';
import { RegCompMutComponent } from './reg-comp-mut/reg-comp-mut.component';
import { ReclameAdherentComponent } from './reclame-adherent/reclame-adherent.component';
import { ConsultCompMutComponent } from './consult-comp-mut/consult-comp-mut.component';
import { MajModPayMutComponent } from './maj-mod-pay-mut/maj-mod-pay-mut.component';
import { VirBordMutComponent } from './vir-bord-mut/vir-bord-mut.component';
import { MajModPayBordCnamComponent } from './maj-mod-pay-bord-cnam/maj-mod-pay-bord-cnam.component';
import { VirBordCnamComponent } from './vir-bord-cnam/vir-bord-cnam.component';
import { CptVirBordMutComponent } from './cpt-vir-bord-mut/cpt-vir-bord-mut.component';
import { CptCheqBordMutComponent } from './cpt-cheq-bord-mut/cpt-cheq-bord-mut.component';
import { CptVirBordCnamComponent } from './cpt-vir-bord-cnam/cpt-vir-bord-cnam.component';
// Component pages
 
 
const routes: Routes = [

{
    path: "RegBordMutuelle",
    component: RegBordMutComponent
  },
  {
    path: "PayBordMut",
    component: PayBordMutComponent
  },

  {
    path: "RegAdhBordCnam",
    component: RegCompMutComponent
  },
    {
    path: "ReclamAdherent",
    component: ReclameAdherentComponent
  },
  {
    path: "ConsultReg",
    component: ConsultCompMutComponent
  },
  {
    path: "MajModePay",
    component: MajModPayMutComponent
  },
  {
    path: "VirBordMut",
    component: VirBordMutComponent
  },
  
  {
    path: "MajModPBordCnam",
    component: MajModPayBordCnamComponent
  },
  {
    path: "VirBordCnam",
    component: VirBordCnamComponent
  },
  {
    path: "ComptBordMutVir",
    component: CptVirBordMutComponent
  },
  {
    path: "ComptBordMutCheq",
    component: CptCheqBordMutComponent
  },
  {
    path: "ComptVirBordCnam",
    component: CptVirBordCnamComponent
  },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReglementRoutingModule {}
