import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ActiviteHttpService } from 'src/app/shared/Service/activite-http.service';

/** Compte les lectures (GET) en cours : voir ActiviteHttpService. */
@Injectable()
export class ActiviteHttpInterceptor implements HttpInterceptor {
  constructor(private activite: ActiviteHttpService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.method !== 'GET') return next.handle(req);
    this.activite.debut();
    return next.handle(req).pipe(finalize(() => this.activite.fin()));
  }
}
