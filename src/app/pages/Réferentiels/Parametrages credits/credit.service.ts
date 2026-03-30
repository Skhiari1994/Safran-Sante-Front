import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const API_URL = environment.urlServer;

@Injectable({
  providedIn: 'root'
})
export class CreditService {

  constructor(private http: HttpClient) { }

  getGroupePret = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/paramCredit/getGroupPret");
  };
  getTypePret = (grpPret: any): Observable<any[]> => {
    const params = new HttpParams().set("grpPret", grpPret)
    return this.http.get<any[]>(API_URL+ "referentiel/paramCredit/getTypePret", { params });
  };
  getAllTypePret = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/paramCredit/getAllTypePret");
  };
  getPositionPret = (grpPret: any,typ:any): Observable<any[]> => {
    const params = new HttpParams().set("grpPret", grpPret).set("typ",typ)
    return this.http.get<any[]>(API_URL+ "referentiel/paramCredit/getPositionPret", { params });
  };
  getPieces = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/paramCredit/findAllPiece");
  };
  getPiecesPret = (grp: any,typ:any): Observable<any[]> => {
    const params = new HttpParams().set("grp", grp).set("typ",typ)
    return this.http.get<any[]>(API_URL+ "referentiel/paramCredit/getPiecesPret",{params});
  };
  getEtatPret = (): Observable<any[]> => {
     return this.http.get<any[]>(API_URL+ "referentiel/paramCredit/getEtatPret");
  };
  getOrgPret = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/paramCredit/getOrgPret");
 };
  AddGroupe(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramCredit/addGroupe", data);
  }
  AddType(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramCredit/addType", data);
  }
  AddPosition(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramCredit/addPosition", data);
  }
  AddPiece(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramCredit/addPiece", data);
  }
  AddPiecePret(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramCredit/addPiecePret", data);
  }
  AddEtatPret(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramCredit/addEtatPret", data);
  }
  AddOrgPret(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/paramCredit/addOrgPRet", data);
  }
  deleteGroupePret(soc:any,grpPret:any){
    return this.http.delete<any>(API_URL+ "referentiel/paramCredit/deleteGroupe/"+soc+"/"+grpPret);

  }
  deleteTypPret(soc:any,grpPret:any,typPret:any){
    return this.http.delete<any>(API_URL+ "referentiel/paramCredit/deleteType/"+soc+"/"+grpPret+"/"+typPret);

  }
  deletePositionPret(grpPret:any,typPret:any,motif:any){
    return this.http.delete<any>(API_URL+ "referentiel/paramCredit/deletePosition/"+grpPret+"/"+typPret+"/"+motif);

  }
  deletePiece(codPiece:any){
    return this.http.delete<any>(API_URL+ "referentiel/paramCredit/deletePiece/"+codPiece);

  }
  deletePiecePret(grpPret:any,typPret:any,codPiece:any){
    return this.http.delete<any>(API_URL+ "referentiel/paramCredit/deletePiece/"+grpPret+"/"+typPret+"/"+codPiece);

  }
  deleteEtatPret(typPret:any,etat:any){
    return this.http.delete<any>(API_URL+ "referentiel/paramCredit/deleteEtatPret/"+typPret+"/"+etat);

  }
  deleteOrgPret(orgPret:any){
    return this.http.delete<any>(API_URL+ "referentiel/paramCredit/deleteOrgPret/"+orgPret);

  }
}
