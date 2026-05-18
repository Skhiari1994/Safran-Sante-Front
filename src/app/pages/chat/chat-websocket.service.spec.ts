import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ChatWebSocketService } from './chat-websocket.service';
import { environment } from 'src/environments/environment';

describe('ChatWebSocketService', () => {
  let service: ChatWebSocketService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ChatWebSocketService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request all users with expected URL', () => {
    const expectedUrl = `${environment.gatewayUrl}${environment.chatApiUrl}/users`;

    service.getAllUsers().subscribe((users) => {
      expect(users).toEqual([{ id: 'u1', username: 'sirine' } as any]);
    });

    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 'u1', username: 'sirine' }]);
  });

  it('should get or create room with text response', () => {
    const expectedUrl = `${environment.gatewayUrl}${environment.chatApiUrl}/room/user-1/user-2`;

    service.getOrCreateRoom('user-1', 'user-2').subscribe((roomId) => {
      expect(roomId).toBe('user-1_user-2');
    });

    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('text');
    req.flush('user-1_user-2');
  });
});
