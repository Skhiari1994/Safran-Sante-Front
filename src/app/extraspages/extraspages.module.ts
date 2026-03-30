import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component pages
import { ExtrapagesRoutingModule } from './extraspages-routing.module';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { LovComponent } from './lov/lov.component';
 import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ParentlovComponent } from './parentlov/parentlov.component';

@NgModule({
  declarations: [
    MaintenanceComponent,
    ComingSoonComponent,
    LovComponent,
    ParentlovComponent
  ],
  imports: [
    CommonModule,
    ExtrapagesRoutingModule,
    FormsModule,
    ReactiveFormsModule,  ],
    exports: [
      LovComponent
    ],
})
export class ExtraspagesModule { }
