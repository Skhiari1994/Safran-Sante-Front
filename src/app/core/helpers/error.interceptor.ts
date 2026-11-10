import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(private authenticationService: AuthenticationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            // Échec de connexion : on ne recharge pas la page (le message d'erreur serait perdu) et on laisse
            // l'écran de connexion lire le statut HTTP pour afficher le bon message.
            if (request.url.includes('api/auth/authenticate')) {
                return throwError(err);
            }
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                this.authenticationService.logout();
                location.reload();
            }
            const error = err.error?.message || err.statusText;
            return throwError(error);
        }))
    }
}
