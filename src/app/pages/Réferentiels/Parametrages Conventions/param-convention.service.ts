import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const API_URL = environment.urlServer;
@Injectable({
  providedIn: 'root'
})
export class ParamConventionService {
 constructor(private http: HttpClient) { }
  addConvention(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "Convention/conv/addConvention", data);
  }

  getConvention = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Convention/conv/getConvention");
  };

  addOffConvention(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "Convention/conv/addOffConvention", data);
  }

  getOffConvention = (cod_conv:any): Observable<any[]> => {
    const params=new HttpParams().set('conv',cod_conv)
    return this.http.get<any[]>(API_URL + "Convention/conv/getOffConvention",{params});
  };
  deleteConvention(codConv: any) {
    return this.http.delete<any>(API_URL + "Convention/conv/deleteConv/" + codConv);

  }

  deleteOffConv(codeOffre: string, codeConvention: string): Observable<void> {
    const offConv: any = {
      cod_conv: codeOffre,
      cod_off: codeConvention
    };

    return this.http.delete<any>(API_URL + "Convention/conv/deleteOffConv", {
      body: offConv
    });
  }

  getMotifSusp = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Convention/conv/findAllMotif");
  };
  deleteMotif(motif: any) {
    return this.http.delete<any>(API_URL + "Convention/conv/deleteMotifSusp/" + motif);

  }

  addMotifSusp(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "Convention/conv/addMotifSusp", data);
  }
}
