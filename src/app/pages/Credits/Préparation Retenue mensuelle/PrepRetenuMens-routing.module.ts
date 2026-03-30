import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';    
import { ChargeRetenuMensComponent } from './charge-retenu-mens/charge-retenu-mens.component';
import { ValidRetenuMensComponent } from './valid-retenu-mens/valid-retenu-mens.component';
import { FichierRetenueMensComponent } from './fichier-retenue-mens/fichier-retenue-mens.component';
 
// Component pages
 
 
const routes: Routes = [
  {
    path: "ChargeRetMens",
    component: ChargeRetenuMensComponent
  } ,
  {
    path: "ValidRetMens",
    component: ValidRetenuMensComponent
  } ,
  {
    path: "FichRetenueMens",
    component: FichierRetenueMensComponent
  } ,
 
 
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PrepRetenuMensRoutingModule {}
