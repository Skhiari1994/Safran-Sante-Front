import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, filter, map, take, timeout } from 'rxjs/operators';
import { ChatNotificationService } from './chat-notification.service';

/** La page /Chat n'est accessible qu'aux profils ayant l'autorisation « Chat ». */
export const chatAccessGuard: CanActivateFn = () => {
  const notifications = inject(ChatNotificationService);
  const router = inject(Router);
  return notifications.allowed$.pipe(
    filter(allowed => allowed !== null),
    take(1),
    timeout(8000),
    map(allowed => allowed ? true : router.parseUrl('/')),
    catchError(() => of(router.parseUrl('/')))
  );
};
