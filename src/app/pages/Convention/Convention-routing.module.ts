import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; 
import { SaisDemConvComponent } from './sais-dem-conv/sais-dem-conv.component'; 
import { SuspDemConvComponent } from './susp-dem-conv/susp-dem-conv.component';
import { ValConvMutComponent } from './val-conv-mut/val-conv-mut.component';
import { RegAutoConvComponent } from './reg-auto-conv/reg-auto-conv.component';
import { ValidDemConvComponent } from './valid-dem-conv/valid-dem-conv.component'; 
import { EditionSuspMoisComponent } from './edition/edition-susp-mois/edition-susp-mois.component';
import { EditionListConvComponent } from './edition/edition-list-conv/edition-list-conv.component';
import { EditionListOffParConvComponent } from './edition/edition-list-off-par-conv/edition-list-off-par-conv.component';
import { EditionEtatConvMoisComponent } from './edition/edition-etat-conv-mois/edition-etat-conv-mois.component';
import { EditionEtatRegEspeceComponent } from './edition/edition-etat-reg-espece/edition-etat-reg-espece.component';
import { OrgChartComponent } from './org-chart/org-chart.component';
  



// Component pages
 
 
const routes: Routes = [

  
    {
      path: "SaisDemConv",
      component: SaisDemConvComponent
      
    },
    { 
      path: "SuspConv",
      component: SuspDemConvComponent
      
    }, 
      {
      path: "ValidDemConv",
      component: ValidDemConvComponent
      
    },
    
    {
      path: "RegConv",
      component: ValConvMutComponent
      
    },
    {
      path: "RegAutoConv",
      component: RegAutoConvComponent
      
    }, 
    {
      path: "EditionSuspMois",
      component: EditionSuspMoisComponent
      
    }, 
    {
      path: "EditionListConv",
      component: EditionListConvComponent
      
    }, 
    {
      path: "EditionListConvGlb",
      component: EditionListOffParConvComponent
      
    }, 
    {
      path: "EditionEtatConvMois",
      component: EditionEtatConvMoisComponent
      
    }, 
    {
      path: "EditionEtatRegEspece",
      component: EditionEtatRegEspeceComponent
      
    }, 
    {
      path: "OgrSante",
      component: OrgChartComponent
      
    }, 
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ConventionRoutingModule {}
