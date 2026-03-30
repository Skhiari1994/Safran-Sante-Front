import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const API_URL = environment.urlServer;
@Injectable({
  providedIn: 'root'
})
export class ParamAdherentService {

  constructor(private http: HttpClient) { }
  AddNationalite(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramAdherent/addNationalite", data);
  }

  getNationalite = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/paramAdherent/getNationalite");
  };

  deleteNationalite(codnatp: any) {
    return this.http.delete<any>(API_URL+ "referentiel/paramAdherent/" + codnatp);

  }

  AddGouvernerat(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramAdherent/addGouv", data);
  }

  getGouv = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/paramAdherent/getGouvernorat");
  };

  AddPoste(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramAdherent/addPoste", data);
  }

  getPoste = (gouv:any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/paramAdherent/getPoste/"+gouv);
  };
 

  AddBanque(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramAdherent/addBanq", data);
  }
  AddAgence(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramAdherent/addAgence", data);
  }
  getBanque = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/paramAdherent/getBanque");
  };
  getAgence = (agc:any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/paramAdherent/getAgence/"+agc);
  };

  AddSociete(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramAdherent/addSociete", data);
  }
  getSociete = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/paramAdherent/getSociete");
  };

  AddDepartement(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramAdherent/addDepartement", data);
  }
  getDepartement = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/paramAdherent/getDepartement");
  };

  AddAffectation(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramAdherent/addAffectation", data);
  }
  getAffectation = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/paramAdherent/getAffectation");
  };

  AddTypeDepart(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramAdherent/addTypDepart", data);
  }
  getTypeDepart = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/paramAdherent/getTypDepart");
  };

  addActiviteEnf(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramAdherent/addActiviteEnf", data);
  }
  getActiviteEnf = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/paramAdherent/getActiviteEnf");
  };

  deletePoste (data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramAdherent/deletePoste", data);
  }
  deleteAgence (data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramAdherent/deleteAgence", data);
  }

  deleteDep(depData: any): Observable<any> {
    return this.http.post(API_URL+ "referentiel/paramAdherent/deleteDep", depData, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  delAffectation(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramAdherent/delAffectation", data);
  }
  deleTypeDepart(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramAdherent/deleTypeDepart", data);
  }
  deletActiviteEnf(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramAdherent/deletActiviteEnf", data);
  }
}



