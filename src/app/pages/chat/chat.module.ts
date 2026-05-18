import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgbNavModule, NgbDropdownModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { SimplebarAngularModule } from 'simplebar-angular';

import { ChatComponent } from './chat.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: ChatComponent }
];

@NgModule({
  declarations: [ChatComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    PickerModule,
    SimplebarAngularModule,
    SharedModule,
    NgbNavModule,
    NgbDropdownModule,
    NgbModalModule,
    RouterModule.forChild(routes)
  ]
})
export class ChatModule { }
