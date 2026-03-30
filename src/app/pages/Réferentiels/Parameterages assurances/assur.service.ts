import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
const API_URL = environment.urlServer;
@Injectable({
  providedIn: 'root'
})
export class AssurService {
  post(arg0: string, formData: FormData) {
    throw new Error('Method not implemented.');
  }

  constructor(private http: HttpClient) { }

  GetAllAssurance() {
    return this.http.get(API_URL+ "referentiel/Parametrage/Assurance");
  }

  AddAssurance(assurance: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/Parametrage/Assurance", assurance);
  }

  GetAllFiliere() {
    return this.http.get(API_URL+ "referentiel/Parametrage/Filiere");
  }
  getRefVisit = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/ParametrageD/getAllRef");
  };
  getActe = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/ParametrageD/getAllActe");
  };

  AddRefVisite(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/ParametrageD/addRef", data);
  }

  deleteRefVisite(ref: any) {
    return this.http.delete<any>(API_URL+ "referentiel/ParametrageD/deteRef/" + ref);

  }

  getRefMed = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/ParametrageD/getRefMed");
  };

  AddRefMed(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/ParametrageD/addRefMed", data);
  }

  deleteRefMed(ref: any) {
    return this.http.delete<any>(API_URL+ "referentiel/ParametrageD/deteRefMed/" + ref);

  }

  getRefAct = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/ParametrageD/getRefAct");
  };

  AddRefAct(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/ParametrageD/addRefAct", data);
  }

  deleteRefAct(ref: any) {
    return this.http.delete<any>(API_URL+ "referentiel/ParametrageD/deteRefaAct/" + ref);

  }

  getRefAppareil = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/ParametrageD/getRefAppareil");
  };

  AddRefAppareil(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/ParametrageD/addRefAppareil", data);
  }

  deleteRefAppareil(ref: any) {
    return this.http.delete<any>(API_URL+ "referentiel/ParametrageD/deteRefAppareil/" + ref);

  }

  getMaladie = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/ParametrageD/getMaladie");
  };

  AddMaladie(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/ParametrageD/addMaladie", data);
  }

  deleteMaladie(ref: any) {
    return this.http.delete<any>(API_URL+ "referentiel/ParametrageD/deleteMaladie/" + ref);

  }

  getRefEtablis = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/ParametrageD/getRefEtablis");
  };
  getPersPhysique = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/ParametrageD/getPersPhysique");
  };
  getPersPhysiqueParamMutuelle = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/Parametrage/getPersPhysiqueParamMutuelle");
  };
  getEtablissParamMutuelle = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/Parametrage/getEtablissParamMutuelle");
  };
  AddRefEtablis(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/ParametrageD/addRefEtablis", data);
  }

  getActiviteEtablis = (cod_activ:any): Observable<any> => {
    return this.http.get<any>(API_URL+ "referentiel/ParametrageD/getActiviteEtablis/"+cod_activ);
  };
  getAllActiviteEtablis = (): Observable<any> => {
    return this.http.get<any>(API_URL+ "referentiel/ParametrageD/getAllActiviteEtablis");
  };
  getGouv = (cod_gouv:any): Observable<any> => {
    return this.http.get<any>(API_URL+ "referentiel/ParametrageD/getGouv/"+cod_gouv);
  };
  getPoste = (cod_gouv:any,cod_Post:any): Observable<any> => {
    return this.http.get<any>(API_URL+ "referentiel/ParametrageD/getPoste/"+cod_gouv+"/"+cod_Post);
  };


  getRegimeRemb = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/ParametrageD/getRegimeRemb");
  };

  addRegimeRemb(data: any): Observable<any> {
    return this.http.post<any>(API_URL+ "referentiel/ParametrageD/addRegimeRemb", data);
  }

  deleteRegimeRemb(ref: any) {
    return this.http.delete<any>(API_URL+ "referentiel/ParametrageD/deleteRegimeRemb/" + ref);

  }

  getRefFilliere = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "referentiel/ParametrageD/getRefFiliere");
  };

  addRefFilliere(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "referentiel/ParametrageD/addRefFiliere", data);
  }

  deleteRefFilliere(ref: any) {
    return this.http.delete<any>(API_URL + "referentiel/ParametrageD/deleteRefFiliere/" + ref);

  }

  getRefFillAct = (codFil:any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "referentiel/ParametrageD/getRefFillAct/"+codFil);
  };

  

  GetFiliereByAssurance = (cod_assur:any): Observable<any> => {
    return this.http.get<any>(API_URL + "referentiel/Parametrage/AssurFilMutuelle/"+cod_assur);
  };

  GetActivMutuelle = (cod_assur:any): Observable<any> => {
    return this.http.get<any>(API_URL + "referentiel/Parametrage/AssurActivMutuelle/"+cod_assur);
  };

  addFiliere(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "referentiel/Parametrage/AssurFil",data);
  }
  addAssurActive(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "referentiel/Parametrage/AssureActive",data);
  }
  GetAllActiviteFamille() {
    return this.http.get(API_URL + "referentiel/Parametrage/ActiviteFamille");
  }

  deleteFilliere(codAssur: any,codFil: any) {
    return this.http.delete<any>(API_URL + "referentiel/Parametrage/AssurFil/"+ codAssur+"/"+codFil);
  }
  deleteActiviteFameille(codActivite: any,codAssur: any) {
    return this.http.delete<any>(API_URL + "referentiel/Parametrage/AssureActive/"+ codActivite+"/"+codAssur);
  }

  getTypeActe = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "referentiel/Parametrage/TypesActes");
  };

  AddTypeActe(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "referentiel/Parametrage/TypesActes", data);
  }

  deleteTypeActe(typeActe: any) {
    return this.http.delete<any>(API_URL + "referentiel/Parametrage/TypesActes/" + typeActe);
  }

  getAllActe = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "referentiel/Parametrage/Acte");
  };
  
  AddActe(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "referentiel/Parametrage/Acte", data);
  }

  deleteActe(abrvAct: any) {
    return this.http.delete<any>(API_URL + "referentiel/Parametrage/Acte/" + abrvAct);
  }
  getAllBaremeRemb = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "referentiel/Parametrage/bareme-remb-projection");
  };

  AddBaremeRemb(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "referentiel/Parametrage/bareme-remb", data);
  }

  deleteBaremeRemboursement(cod_fil: any,abrv_act:any,cod_assur:any) {
    return this.http.delete<any>(API_URL + "referentiel/Parametrage/bareme-remb/" + cod_fil +"/"+abrv_act+"/"+cod_assur);
  }

  getAllActiviteEtabliss = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "referentiel/Parametrage/ActiviteEtabliss");
  };

  createOrUpdateActiviteEtabliss(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "referentiel/Parametrage/ActiviteEtabliss", data);
  }
  deleteActiviteEtablis(codActiv: any) {
    return this.http.delete<any>(API_URL + "referentiel/Parametrage/ActiviteEtabliss/" + codActiv);
  }
  getAllGouv = (): Observable<any> => {
    return this.http.get<any>(API_URL + "referentiel/ParametrageD/getAllGouv");
  };
  getAllPoste = (): Observable<any> => {
    return this.http.get<any>(API_URL + "referentiel/ParametrageD/getAllPoste");
  };
  getPosteByGouv = (cod_gouv: any): Observable<any> => {
    return this.http.get<any>(API_URL + "referentiel/ParametrageD/getPoste/"+cod_gouv);
  };

  ajoutPersConv(data:any){
    return this.http.post<any>(API_URL + "referentiel/ParametrageD/getRefEtablis",data)
  }


  addRefFillAct(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "referentiel/ParametrageD/addRefFillAct", data);
  }

  deleteRefFillAct(ref: any) {
    return this.http.post<any>(API_URL + "referentiel/ParametrageD/deleteRefFillAct" , ref, { headers: { 'Content-Type': 'application/json' } });

  }

 

 

  uploadFileRef(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
  
    return this.http.post(API_URL + "referentiel/ParametrageD/uploadFile", formData, {
      responseType: 'text'
    }).pipe(
      catchError(this.handleError)
    );
  }

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(API_URL + "referentiel/ParametrageD/uploadFile", formData, {
      responseType: 'text'
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    const message = error.error instanceof ErrorEvent
      ? `Client error: ${error.error.message}`
      : `Server error: ${error.status}, ${error.message}`;
    return throwError(() => new Error(message));
  }
}
