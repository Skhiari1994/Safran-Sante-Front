import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; 
 
// Component pages
 
 
const routes: Routes = [

  {
    path: 'Commission', loadChildren: () => import('./Commission/Commission.module').then(m => m.CommissionModule)
  },
  {
    path: 'DebCredit', loadChildren: () => import('./Débloquage des crédit/DebCerdit.module').then(m => m.DebCerditModule)
  },
  {
    path: 'ModifCredit', loadChildren: () => import('./Modification des credits/ModifCrefit.module').then(m => m.ModifCrefitModule)
  },
  {
    path: 'Edition', loadChildren: () => import('./Edition/EditionCredit.module').then(m => m.EditionCreditModule)
  },
    {
    path: 'PrepRetenu', loadChildren: () => import('./Préparation Retenue mensuelle/PrepRetenuMens.module').then(m => m.PrepRetenuMensModule)
  },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CreditsRoutingModule {}
