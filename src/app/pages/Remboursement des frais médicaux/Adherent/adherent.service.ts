import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { TokenStorage } from "src/app/account/token-storage.service";

const API_URL = environment.urlServer;

@Injectable({
  providedIn: 'root'
})
export class AdherentService {

  private rapportCodeCache = new Map<string, string>();

  ///// variable globales 
  cod_soc: string | null = null;
  constructor(private http: HttpClient, private tokenStorage: TokenStorage) {
    this.cod_soc = this.tokenStorage.getUser().codSoc
   }


  calPlafondMutuelle(cod_soc: string, annee: string, matDeb: number, matFin: string): Observable<any> {
    const params = new HttpParams()
      .set('wcodSoc', cod_soc)
      .set('annee', annee)
      .set('matDeb', matDeb)
      .set('matFin', matFin);

    return this.http.get<any>(API_URL + "Remb/Personnel/calPlafondMutuelle", { params });
  }


  calPlafondCnam(cod_soc: string, annee: string, matDeb: number, matFin: string): Observable<any> {
    const params = new HttpParams()
      .set('wcodSoc', cod_soc)
      .set('annee', annee)
      .set('matDeb', matDeb)
      .set('matFin', matFin);

    return this.http.get<any>(API_URL + "Remb/Personnel/calPlafondCnam", { params });
  }

  majPecEnf(cod_soc: string, annee: string, matDeb: number, matFin: string): Observable<any> {
    const params = new HttpParams()
      .set('wcodSoc', cod_soc)
      .set('annee', annee)
      .set('matDeb', matDeb)
      .set('matFin', matFin);

    return this.http.get<any>(API_URL + "Remb/Personnel/majPecEnf", { params });
  }
  GetAllPers(): Observable<any[]> {

    return this.http.get<any[]>(API_URL + "Remb/Personnel/GetAllPers");
  }

  getPersAffil(cod_soc: any, mat: any): Observable<any[]> {
    const params = new HttpParams()
      .set('soc', cod_soc)
      .set('mat', mat)
    return this.http.get<any[]>(API_URL + "Remb/Personnel/getPersAffil", { params });
  }

  getRefFilliere(): Observable<any[]> {

    return this.http.get<any[]>(API_URL + "Remb/Personnel/getRefFilliere");
  }

  addPersAffil(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "Remb/Personnel/addPersAffil", data);
  }

  getRefEtablis(): Observable<any[]> {
    return this.http.get<any[]>(API_URL + "Remb/Personnel/getRefEtablis");
  }

  getPersActif(): Observable<any[]> {
    return this.http.get<any[]>(API_URL + "Remb/Personnel/getPersActif");
  }

  getDossierMld(mat: any): Observable<any[]> {
    const params = new HttpParams()
      .set('cod_soc', this.cod_soc ?? '')
      .set('mat', mat)
    return this.http.get<any[]>(API_URL + "Remb/Personnel/getDossierMll", { params });
  }
  getNumDoss(soc: any, mat: any): Observable<any[]> {
    const params = new HttpParams().set('soc', soc).set('mat', mat)
    return this.http.get<any[]>(API_URL + "Remb/Personnel/getNumDoss", { params });
  }

  getListAdherentDossMld = (soc: any, mat: any): Observable<any[]> => {
    const params = new HttpParams().set('soc', soc).set('mat', mat)
    return this.http.get<any[]>(API_URL + "Remb/Personnel/getListAdherentDossMld", { params });
  };
  getMaladie = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Remb/Personnel/getMaladie");
  };
  addDossMld(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "Remb/Personnel/addDossMld", data);
  }

  getPlafondAssur = (mat: any): Observable<any[]> => {
    const params = new HttpParams().set('mat', mat)
    return this.http.get<any[]>(API_URL + "Remb/Personnel/getPlafondAssur", { params });
  };

  getPlafondCnam = (mat: any): Observable<any[]> => {
    const params = new HttpParams().set('mat', mat)
    return this.http.get<any[]>(API_URL + "Remb/Personnel/getPlafondCnam", { params });
  };

  addPlafAssur(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "Remb/Personnel/addPlafAssur", data);
  }

  addPlafCnam(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "Remb/Personnel/addPlafCnam", data);
  }

  getPriseCharge = (soc: any, mat: any): Observable<any[]> => {
    const params = new HttpParams().set('soc', soc).set('mat', mat)
    return this.http.get<any[]>(API_URL + "Remb/Personnel/getPriseCharge", { params });
  };

  addPriseCharge(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "Remb/Personnel/addPriseCharge", data);
  }

  deletePriseCharge(soc: any, mat: any, pec: any): Observable<void> {
    const params = new HttpParams().set('soc', soc).set('mat', mat).set('pec', pec)

    return this.http.delete<any>(API_URL + "Remb/Personnel/deletePriseCharge", { params });
  }

  getPersBultCnamDeb(soc: string): Observable<any[]> {
    const params = new HttpParams()
      .set('soc', soc)
    return this.http.get<any[]>(API_URL + "Remb/Personnel/getPersBultCnamDeb", { params });
  }

  getPersBultCnamFin(soc: string): Observable<any[]> {
    const params = new HttpParams()
      .set('soc', soc)
    return this.http.get<any[]>(API_URL + "Remb/Personnel/getPersBultCnamFin", { params });
  }

  private getNumRap(libRapJsp: string): Observable<string> {
    const cached = this.rapportCodeCache.get(libRapJsp);
    if (cached) return of(cached);
    return this.http.get<any[]>(API_URL + 'Print/RapportRubController/findAll').pipe(
      map((list) => {
        const rap = list.find((r: any) => r.lib_rap_jsp === libRapJsp);
        const code = rap?.cod_rap?.toString();
        if (!code) throw new Error('Code rapport introuvable: ' + libRapJsp);
        this.rapportCodeCache.set(libRapJsp, code);
        return code;
      })
    );
  }

  printRecapRembPers(soc: any, matDeb: any, matFin: any, annee: any) {
    return this.getNumRap('recap_remb_pers_').pipe(
      switchMap((reportCode) => {
        const body = {
          cod_soc: soc,
          mat_pers: matDeb,
          mat_fin: matFin,
          annee: annee,
        }
        const params = new HttpParams().set('numRap', reportCode);

        const httpOptions = {
          params,
          responseType: 'blob' as 'json'
        };

        return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
      })
    );
  }

  printRecapGenRegAnn(soc: any, annee: any) {
    return this.getNumRap('stat_ann_mut').pipe(
      switchMap((reportCode) => {
        const body = {
          annee: annee,
        }
        const params = new HttpParams().set('numRap', reportCode);

        const httpOptions = {
          params,
          responseType: 'blob' as 'json'
        };

        return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
      })
    );
  }
  printRecapGenRegAnnexcel(soc: any, annee: any) {
    return this.getNumRap('stat_ann_mut').pipe(
      switchMap((reportCode) => {
        const body = {
          annee: annee,
        }
        const params = new HttpParams().set('numRap', reportCode);

        const httpOptions = {
          params,
          responseType: 'blob' as 'json'
        };

        return this.http.post<any>(API_URL + "Print/Print/excel", body, httpOptions);
      })
    );
  }
}
