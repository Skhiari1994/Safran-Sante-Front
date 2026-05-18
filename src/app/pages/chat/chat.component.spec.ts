import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { ChatComponent } from './chat.component';
import { ChatWebSocketService } from './chat-websocket.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;

  const chatWebSocketServiceMock: Partial<ChatWebSocketService> = {
    connect: () => undefined,
    disconnect: () => undefined,
    messages$: of(),
    userStatus$: of(),
    connected$: of(true),
    getAllUsers: () => of([]),
    getRecentConversations: () => of([]),
    getOrCreateRoom: () => of('room-1'),
    getRoomMessages: () => of([]),
    markRoomAsRead: () => of(void 0),
    markAsRead: () => of(void 0),
    sendMessage: () => undefined
  };

  const ngbModalMock = {
    open: () => ({ close: (): void => undefined, dismiss: (): void => undefined })
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ChatComponent],
      imports: [ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        { provide: ChatWebSocketService, useValue: chatWebSocketServiceMock },
        { provide: NgbModal, useValue: ngbModalMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(ChatComponent, {
      set: { template: '' }
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
