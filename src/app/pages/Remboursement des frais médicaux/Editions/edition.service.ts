import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const API_URL = environment.urlServer;
@Injectable({
  providedIn: 'root'
})
export class EditionService {

  constructor(private http: HttpClient) { }

  getPersonnelByMatPers(soc: string, annee: string): Observable<any[]> {
    const params = new HttpParams()
      .set('soc', soc)
      .set('annee', annee);
    return this.http.get<any[]>(API_URL + "Print/personnel/getPersRecap", { params });
  }

  getPersCArteSoinDeb(soc: string, annee: string): Observable<any[]> {
    const params = new HttpParams()
      .set('soc', soc)
      .set('mat_fin', annee);
    return this.http.get<any[]>(API_URL + "Print/personnel/getPersCArteSoinDeb", { params });
  }

  getPersCArteSoinFin(soc: string, annee: string): Observable<any[]> {
    const params = new HttpParams()
      .set('soc', soc)
      .set('mat_deb', annee);
    return this.http.get<any[]>(API_URL + "Print/personnel/getPersCArteSoinFin", { params });
  }

  getPersBultCnamDeb(soc: string, annee: string): Observable<any[]> {
    const params = new HttpParams()
      .set('soc', soc)
      .set('mat_fin', annee);
    return this.http.get<any[]>(API_URL + "Print/personnel/getPersBultCnamDeb", { params });
  }

  getPersBultCnamFin(soc: string, annee: string): Observable<any[]> {
    const params = new HttpParams()
      .set('soc', soc)
      .set('mat_deb', annee);
    return this.http.get<any[]>(API_URL + "Print/personnel/getPersBultCnamFin", { params });
  }
  editionListRembadh(numRap: any, soc: any, mat: any, annee: any) {
    const body = {
      cod_soc: soc,
      mat_deb: mat,
      annee: annee,
    }
    const params = new HttpParams().set('numRap', numRap);

    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
  }

  editionListBS(numRap: any, soc: any, matDeb: any, matFin: any, datDeb: any, datFin: any) {
    const body = {
      cod_soc: soc,
      mat_deb: matDeb,
      mat_fin: matFin,
      dat_deb: datDeb,
      dat_fin: datFin,
    }
    const params = new HttpParams().set('numRap', numRap);

    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
  }
}
