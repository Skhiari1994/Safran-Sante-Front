import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { AVEC_SEXES, FILTRE_GLOBAL, FILTRE_SEXE, PageLov, SourceLovServeur } from '../lov-serveur';

/**
 * Fabrique les sources « page par page » des fenêtres de recherche (app-lov, app-search-lov).
 * Chaque endpoint reçoit : les filtres de colonne (clé = nom de la colonne), q (recherche unique), sexe,
 * avecSexes, page et taille, plus ses propres paramètres fixes ; il répond { content, total, sexes? }.
 */
@Injectable({ providedIn: 'root' })
export class LovServeurService {
  constructor(private http: HttpClient, private tokenStorage: TokenStorage) { }

  /** Société de l'utilisateur connecté (lue à chaque appel : elle n'est connue qu'après la connexion). */
  societe(): string {
    return this.tokenStorage.getSociete() ?? this.tokenStorage.getUser()?.codSoc ?? '';
  }

  /**
   * @param chemin endpoint relatif à l'URL du serveur (ex. 'Remb/BultSoin/lovBultCnam')
   * @param fixes paramètres propres à la liste (ex. { soc: '01' }), relus à chaque appel
   * @param champCode colonne comparée exactement au code saisi dans le champ (app-lov) ; sans elle, parCode ne trouve rien
   */
  source(chemin: string, fixes: () => Record<string, unknown> = () => ({}), champCode?: string): SourceLovServeur {
    const appeler = (valeurs: Record<string, unknown>): Observable<PageLov> => {
      let params = new HttpParams();
      for (const [cle, valeur] of Object.entries({ ...fixes(), ...valeurs })) {
        if (valeur !== null && valeur !== undefined && String(valeur).trim() !== '') {
          params = params.set(cle, String(valeur).trim());
        }
      }
      return this.http
        .get<PageLov>(environment.urlServer + chemin, { params })
        .pipe(map(r => ({ content: r?.content ?? [], total: Number(r?.total ?? 0), sexes: r?.sexes })));
    };
    return {
      page: (filtres, page, taille) => {
        const valeurs: Record<string, unknown> = { page, taille };
        for (const [cle, valeur] of Object.entries(filtres)) {
          if (cle === FILTRE_GLOBAL) valeurs['q'] = valeur;
          else if (cle === FILTRE_SEXE) valeurs['sexe'] = valeur;
          else if (cle === AVEC_SEXES) valeurs['avecSexes'] = 'true';
          else valeurs[cle] = valeur;
        }
        return appeler(valeurs);
      },
      // le serveur compare « code » exactement à sa colonne de code (sans colonne de code : rien à vérifier)
      parCode: code =>
        champCode ? appeler({ code, page: 0, taille: 1 }).pipe(map(r => r.content[0] ?? null)) : of(null),
    };
  }
}
