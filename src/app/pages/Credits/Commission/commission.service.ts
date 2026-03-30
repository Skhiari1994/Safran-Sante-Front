import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const API_URL = environment.urlServer;
@Injectable({
  providedIn: 'root'
})
export class CommissionService {

  constructor(private http: HttpClient) { }


  PreparCommission(codSoc: any, datDebComm: any, datFinComm: any, numComm: number): Observable<any[]> {

    const params = new HttpParams().set("codSoc", codSoc).set("datDebComm", datDebComm).set("datFinComm", datFinComm).set("numComm", numComm)
    return this.http.get<any[]>(API_URL+ "Credits/Commission/preparComm", { params });
  }
  getCommission = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "Credits/Commission/getCommission");
  };
  getDetailCommission = (soc: any, num: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "Credits/Commission/getDetailCommission/" + soc + "/" + num);
  };
  AddCommission(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "Credits/Commission/addCommission", data);
  }

  getPrerparedCommission = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "Credits/Commission/getCommissionPrepare/" + soc);
  };

}
