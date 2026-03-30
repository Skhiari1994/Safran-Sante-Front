import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const API_URL = environment.urlServer;

@Injectable({
  providedIn: 'root'
})
export class CaisseRetrService {

  constructor(private http: HttpClient) { }

  AddParamCaisse(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "referentiel/ParamCaisse/addParamCaisse", data);
  }

  getParamCaisse = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "referentiel/ParamCaisse/getAllParamCaisse");
  };

  deleteParamCaisse(codParam: any) {
    const params = new HttpParams().set("codParam", codParam)
    return this.http.delete<any>(API_URL + "referentiel/ParamCaisse/deleteParamCaisse", { params });

  }

  addMotifRembour(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "referentiel/ParamCaisse/addMotifRembour", data);
  }

  getAllMotifRembour = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "referentiel/ParamCaisse/getAllMotifRembour");
  };

  deleteMotifRembour(codRemb: any) {
    const params = new HttpParams().set("codRemb", codRemb)
    return this.http.delete<any>(API_URL + "referentiel/ParamCaisse/deleteMotifRembour", { params });

  }
}
