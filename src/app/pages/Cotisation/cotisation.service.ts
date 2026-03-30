import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { CotisMutPers } from './val-cotisation-actif/val-cotisation-actif.component';
import { environment } from 'src/environments/environment';
const API_URL = environment.urlServer;

@Injectable({
  providedIn: 'root'
})
export class CotisationService {

  constructor(private http: HttpClient) { }

    getPersCotis = (soc:any): Observable<any[]> => {
      return this.http.get<any[]>(API_URL+"Cotis/Cotisation/PersCotis/"+soc);
    };

    
    
    getPersCotisSearch = (soc:any): Observable<any[]> => {
      return this.http.get<any[]>(API_URL+"Cotis/Cotisation/PersCotisSearch/"+soc);
    };
  
    AddCotis(cotisation: any): Observable<any> {
    return this.http.post(API_URL+"Cotis/Cotisation/add", cotisation);  
  }
  updateCotis(cotisation: any): Observable<any> {
    return this.http.post(API_URL+"Cotis/Cotisation/updateCotis", cotisation);  
  }
  getLigCotis(lig: any): Observable<any> {
    return this.http.post(API_URL+"Cotis/Cotisation/LigCotisPersMut", lig); 
  }
  AddLigCotis(lig: any): Observable<any> {
    return this.http.post(API_URL+"Cotis/Cotisation/addLigCotisMutPers", lig);  
  }

  getLigCotisDatRage(codSoc: string, matPers: string, datDeb: string, datFin: string): Observable<any> {
    const params = new HttpParams()
      .set('codSoc', codSoc)
      .set('matPers', matPers)
      .set('datDeb', datDeb)
      .set('datFin', datFin);

    return this.http.get(API_URL+"Cotis/Cotisation/getLig", { params });
  }
    deleteLig(codSoc: string, matPers: string, datDeb: string, datFin: string): Observable<any> {
    const params = new HttpParams()
      .set('codSoc', codSoc)
      .set('matPers', matPers)
      .set('datDeb', datDeb)
      .set('datFin', datFin);

    return this.http.post(API_URL+"Cotis/Cotisation/deleteLig", { params });
  }
  
  checkCotisation(checkProc:any) : Observable<any>{
  
    return this.http.post(API_URL+"Cotis/Cotisation/checkLigCotis", checkProc);/* .pipe(
      catchError((error) => {
        if (error.status === 400) {
          console.error('Bad Request:', error.error);
        } else if (error.status === 500) {
          console.error('Internal Server Error:', error.error);
        } else {
          console.error('Unknown Error:', error);
        }
        throw new Error('Cotisation check failed');
      })
    ); */
  }

  PersCotisActif = (soc:any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+"Cotis/Cotisation/PersCotisActif/"+soc);
  };


  getPersCotisActifCorps(data: { cod_soc: string; corps: string; dat_deb: any }): Observable<any> {
    return this.http.post(API_URL+"Cotis/Cotisation/PersCotisActifCorps", data);
  }
 getCorps = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+"adherent/Personnel/getCorps");
  };

  chargActInxService(data: { soc: string; mois: string; mat: string }): Observable<any> {
    return this.http.post(API_URL+"Cotis/Cotisation/chargActInx", data);
  }

  updateEtatAndModPay(cotisation: any): Observable<any> {
    return this.http.put(API_URL+"Cotis/Cotisation/updateEtatAndModPay", cotisation);  
  }
 
  saveUpdatedRows(cotisation : CotisMutPers []): Observable<any> {
    return this.http.put(API_URL+"Cotis/Cotisation/saveUpdatedRows", cotisation);  
  }
  
  saveUpdatedCotis(cotisation : any): Observable<any> {
    return this.http.post(API_URL+"Cotis/Cotisation/saveUpdatedCotis", cotisation);  
  }
  getCotisationData(request: any): Observable<any> {
    return this.http.post(API_URL+"Cotis/Cotisation/getCotisationMatDate", request);
  }
 
  getCotisationMat(codSoc: string, matPers: string): Observable<any> {
    const params = new HttpParams()
      .set('codSoc', codSoc)
      .set('matPers', matPers)
    return this.http.get(API_URL+"Cotis/Cotisation/getCotisationMat", { params });
  }

  getDiskPreft(request: any): Observable<any> {
    return this.http.post(API_URL+"Cotis/diskPret/getDiskPret", request);
  }


  getDiskPret(corps: string, mois: string): Observable<any> {
    const params = new HttpParams()
      .set('corps', corps)
      .set('mois', mois);

    return this.http.get(API_URL+"Cotis/diskPret/getDiskPret", { params });
  }

  updateCotisation(data: any): Observable<any> {
    console.log("Données envoyées à l'API :", JSON.stringify(data, null, 2)); 
    return this.http.post(API_URL+"Cotis/diskPret/maj-cotisation", data);
  }


  editionEtatCotis(numRap: any, soc: any, matDeb: any, matFin: any,datDeb:any,datFin:any,etatCot:any,corps:any) {
    const body = {
      cod_soc: soc,
      mat_deb: matDeb,
      mat_fin: matFin,
      date_debut:datDeb,
      date_fin:datFin,
      etat_cot:etatCot,
      corps:corps,  
    };

    const params = new HttpParams().set('numRap', numRap);

    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
  }

}
