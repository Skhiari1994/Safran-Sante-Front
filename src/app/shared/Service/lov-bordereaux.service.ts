import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PageLov, SourceLovServeur } from '../lov-serveur';

/**
 * Critères de la liste des bordereaux arrivés, identiques à ceux de la liste complète qu'utilisait chaque écran :
 * - societe : seulement les bordereaux de la société de l'utilisateur connecté ;
 * - valid, valid_bord, clot_bord : 'O' ou 'N' (une valeur absente en base compte comme 'N') ;
 * - typ_bord : type de bordereau (ex. 'L').
 */
export interface CriteresBordArriver {
  societe?: boolean;
  valid?: 'O' | 'N';
  valid_bord?: 'O' | 'N';
  clot_bord?: 'O' | 'N';
  typ_bord?: string;
}

/** Sources « page par page » des fenêtres de recherche de bordereaux. */
@Injectable({ providedIn: 'root' })
export class LovBordereauxService {
  constructor(private http: HttpClient, private tokenStorage: TokenStorage) { }

  /** Bordereaux arrivés (BORD_ARRIVER), filtrés et paginés par le serveur. */
  bordArriver(criteres: CriteresBordArriver = {}): SourceLovServeur {
    const appeler = (extra: Record<string, unknown>): Observable<PageLov> => {
      const { societe, ...autres } = criteres;
      // société lue à chaque appel : elle est connue une fois l'utilisateur connecté
      const valeurs: Record<string, unknown> = { ...autres, ...extra, cod_soc: societe ? this.tokenStorage.getSociete() : null };
      let params = new HttpParams();
      for (const [cle, valeur] of Object.entries(valeurs)) {
        if (valeur !== null && valeur !== undefined && String(valeur).trim() !== '') {
          params = params.set(cle, String(valeur).trim());
        }
      }
      return this.http
        .get<PageLov>(environment.urlServer + 'Remb/Remboursement/lovBordArriver', { params })
        .pipe(map(r => ({ content: r?.content ?? [], total: Number(r?.total ?? 0) })));
    };
    return {
      page: (filtres, page, taille) =>
        appeler({ cod_bord: filtres['cod_bord'], dat_bord: filtres['dat_bord'], page, taille }),
      parCode: code => appeler({ code, page: 0, taille: 1 }).pipe(map(r => r.content[0] ?? null)),
    };
  }
}
