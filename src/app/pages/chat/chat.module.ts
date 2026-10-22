import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { ChatComponent } from './chat.component';
import { chatAccessGuard } from './chat-access.guard';

const routes: Routes = [
  { path: '', component: ChatComponent, canActivate: [chatAccessGuard] }
];

@NgModule({
  imports: [
    HttpClientModule,
    ChatComponent,
    RouterModule.forChild(routes)
  ]
})
export class ChatModule { }
