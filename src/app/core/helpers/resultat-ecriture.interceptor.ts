import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { MessagesResultatService } from 'src/app/shared/Service/messages-resultat.service';

/**
 * Chaque ajout, modification, suppression ou enregistrement envoyé au serveur se termine par un message
 * (succès ou échec) : voir MessagesResultatService. Déclaré après ErrorInterceptor pour recevoir l'erreur HTTP
 * d'origine (statut, message du serveur).
 */
@Injectable()
export class ResultatEcritureInterceptor implements HttpInterceptor {
  constructor(private messages: MessagesResultatService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const nature = this.messages.natureDe(req);
    if (!nature) return next.handle(req);

    this.messages.debut();
    let fini = false;
    return next.handle(req).pipe(
      tap({
        next: ev => {
          if (ev instanceof HttpResponse && !fini) { fini = true; this.messages.succes(nature); }
        },
        error: err => {
          if (!fini) { fini = true; this.messages.echec(nature, err); }
        },
      }),
      finalize(() => {
        if (!fini) { fini = true; this.messages.annulation(); }
      }),
    );
  }
}
