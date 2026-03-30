import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const API_URL = environment.urlServer;


@Injectable({
  providedIn: 'root'
})
export class ParamIndemniteService {
constructor(private http: HttpClient) { }

   
    getgetListNatDon = (): Observable<any[]> => {
      return this.http.get<any[]>(API_URL+ "Indemnite/piece/getListNatDons");
    };

    getCompte = (): Observable<any[]> => {
        return this.http.get<any[]>(API_URL+ "referentiel/CompteIndParam/typind");
      };
      addNatDon(data: any): Observable<any> {
        return this.http.post<any>(API_URL+ "referentiel/CompteIndParam/addNatDon", data);
      }
      
      getNatDon = (): Observable<any[]> => {
        return this.http.get<any[]>(API_URL+ "referentiel/CompteIndParam/getNatDon");
      };
      
      getAffectation = (): Observable<any[]> => {
        return this.http.get<any[]>(API_URL+ "referentiel/CompteIndParam/affectInd");
      };
      addMotifs(data: any): Observable<any> {
        return this.http.post<any>(API_URL+ "referentiel/CompteIndParam/addMotifs", data);
      }

      getNatDonByNat = (nat:any): Observable<any[]> => {
        const params=new HttpParams().set('nat',nat)
        return this.http.get<any[]>(API_URL+ "referentiel/CompteIndParam/getNatDonByNat",{params});
      };

      

    
      deletNat(id: string): Observable<any> {
        return this.http.delete(`${API_URL}referentiel/CompteIndParam/deletNat/${id}`, { responseType: 'text' });
      }
}
