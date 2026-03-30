import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';


const API_URL = environment.urlServer
@Injectable({
  providedIn: 'root'
})
export class PrepRetenueService {
  private readonly API_URL = environment.urlServer;

  constructor(private http: HttpClient) { }

  getRetMens = (soc: any, dat: any): Observable<any[]> => {
    const params = new HttpParams().set("soc", soc).set("dat", dat)
    return this.http.get<any[]>(this.API_URL + "Credits/PrepRetMens/getRetMens", { params });
  };
  getRetMensVald = (soc: any, dat: any): Observable<any[]> => {
    const params = new HttpParams().set("soc", soc).set("dat", dat)
    return this.http.get<any[]>(this.API_URL + "Credits/PrepRetMens/getRetMensVald", { params });
  };
  getDetRetMens = (soc: any, mat: any, dat: any, abrv: any): Observable<any[]> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("dat", dat).set("abrv", abrv)
    return this.http.get<any[]>(this.API_URL + "Credits/PrepRetMens/getDetRetMens", { params });
  };

  chargeRetMens = (soc: any, dat: any, mat: any): Observable<any[]> => {
    const params = new HttpParams().set("soc", soc).set("dat", dat).set("mat", mat)
    return this.http.get<any[]>(this.API_URL + "Credits/PrepRetMens/chargeRetMens", { params });
  };
  validRetMens = (dat: any): Observable<any[]> => {
    const params = new HttpParams().set("dat", dat)
    return this.http.get<any[]>(this.API_URL + "Credits/PrepRetMens/validRetMens", { params });
  };

  vir_carte_ret = (soc: any, dat: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("dat", dat)
    return this.http.get<any>(this.API_URL + "Credits/PrepRetMens/vir_carte_ret", { params });
  };

  vir_carte_aux = (soc: any, dat: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("dat", dat)
    return this.http.get<any>(this.API_URL + "Credits/PrepRetMens/vir_carte_aux", { params });
  };

  downloadFile(fileName: string) {
    const params = new HttpParams().set('fileName', fileName);
    return this.http.get(this.API_URL + "Credits/PrepRetMens/download-file", {
      params,
      responseType: 'blob' as 'json'
    });
  }
  getRetMensValdO = (soc: any, dat: any): Observable<any[]> => {
    const params = new HttpParams().set("soc", soc).set("dat", dat)
    return this.http.get<any[]>(this.API_URL + "Credits/PrepRetMens/getRetMensValdO", { params });
  };


  generateRetenue(soc: string, datRet: string) {
    return this.http.post(
      API_URL + `Credits/PrepRetMens/generateRetenues`,
      null,
      {
        params: { soc, datRet },
        responseType: 'blob'
      }
    );
  }
}
