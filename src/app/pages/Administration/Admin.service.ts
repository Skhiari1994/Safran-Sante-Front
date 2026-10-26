import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const API_URL = environment.urlServer;

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  GetUser = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "api/auth/getUser");
  };
  UpdateRole(data:any):Observable<any>{
    return this.http.put<any>(API_URL+"api/auth/setRole",data);
  }
  UpdatePss(data:any):Observable<any>{
    return this.http.put<any>(API_URL+"api/auth/updatePass",data);
  }
  UpdatePers(data:any):Observable<any>{
    return this.http.put<any>(API_URL+"admin/PERS_VALIDEUR/updatePersValid",data);
  }
  AddPers(data:any):Observable<any>{
    return this.http.post<any>(API_URL+"admin/PERS_VALIDEUR/addPersValid",data);
  }
  GetPersValid = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL+ "admin/PERS_VALIDEUR/getPersValid");
  };
  getUtilisateursConsultation(): Observable<any[]> {
    return this.http.get<any[]>(API_URL + "admin/Utilisateur/consultation");
  }
  modifierUtilisateur(id: number, data: any): Observable<any> {
    return this.http.put<any>(API_URL + "admin/Utilisateur/" + id, data);
  }
  supprimerUtilisateur(id: number): Observable<any> {
    return this.http.delete<any>(API_URL + "admin/Utilisateur/" + id);
  }
  getRole(){
    return this.http.get(API_URL+"admin/Menu/role")
  }

  AddRole(data:any):Observable<any>{
    return this.http.post<any>(API_URL+"admin/PERS_VALIDEUR/AddRole",data);
  }

  DeleteRole(roleId:number):Observable<any>{
    return this.http.delete<any>(API_URL+"admin/PERS_VALIDEUR/DeleteRole/"+roleId);
  }
  deletePersValideur = (cod_soc: string, mat_pers: string, mat_resp: string): Observable<any> => {
    // let params = new HttpParams()
    //   .set('cod_soc', cod_soc)
    //   .set('mat_pers', mat_pers)
    //   .set('mat_resp', mat_resp);
  
    return this.http.delete<any>(API_URL+"admin/PERS_VALIDEUR/DeletePersValide/"+cod_soc+"/"+mat_pers+"/"+mat_resp);
  };
  
  getNextEvtId(from: number): Observable<any> {
    return this.http.get<any>(API_URL + "admin/Menu/nextEvtId/" + from);
  }
  public getAdmSubModule() {
    return this.http.get<any>(API_URL+"admin/Menu/suModule");
  }
  public getAdmEvntType(sum_id :any) {
    return this.http.get<any>(API_URL+"admin/Menu/evtTypeNiv/"+sum_id);
  }
  public getAdmEvntType1(evt :any) {
    return this.http.get<any>(API_URL+"admin/Menu/evtTypeNiv1/"+evt);
  }
  public getAdmEvntType2(evt :any) {
    return this.http.get<any>(API_URL+"admin/Menu/evtTypeNiv2/"+evt);
  }

  getRoleModules(roleId: number): Observable<any[]> {
    return this.http.get<any[]>(API_URL+`admin/Menu/roles/${roleId}`);
  }
  getAllRolesModules(roleId: number): Observable<any[]> {
    return this.http.get<any[]>(API_URL+`admin/Menu/roles/${roleId}/modules`);
  }
  getMenu(): Observable<any[]> {
    return this.http.get<any[]>(API_URL+`admin/Menu/menu`);
  }
  getPersonnels(): Observable<any[]> {
    return this.http.get<any[]>(API_URL+`adherent/Personnel/getPersonnels`);
  }
  creerModule(module: any): Observable<any> {
    return this.http.post<any>(API_URL + "admin/Menu/module", module);
  }
  saveSubModule(subModule:any[]){
    return this.http.post(API_URL+"admin/Menu/addSubModule",subModule)
  }

  saveAdmeventtype(evtType:any[]){
    return this.http.post(API_URL+"admin/Menu/addEvntType1",evtType)
  }
  saveAutorisation(auto:any[]){
    return this.http.post(API_URL+"admin/Menu/saveAuto",auto)
  }
  getAllEvt(): Observable<any[]> {
    return this.http.get<any[]>(API_URL + "admin/Menu/evtAll");
  }
  getAutorisationsMenu(): Observable<any[]> {
    return this.http.get<any[]>(API_URL + "admin/Menu/autorisations");
  }
  setAutorisationsNoeud(sumId: number, evtId: number | null, roleIds: number[]): Observable<any> {
    return this.http.put<any>(API_URL + "admin/Menu/autorisations", { sumId, evtId, roleIds });
  }
  setRangs(rangs: { kind: string, id: number, rank: number }[]): Observable<any> {
    return this.http.put<any>(API_URL + "admin/Menu/ranks", rangs);
  }
  deleteModule(id: number): Observable<any> {
    return this.http.delete<any>(API_URL + "admin/Menu/module/" + id);
  }
  deleteNoeud(id: number): Observable<any> {
    return this.http.delete<any>(API_URL + "admin/Menu/noeud/" + id);
  }
  DeleteSubModule(id:any){
    return this.http.delete(API_URL+"admin/Menu/module/"+id)
  }
  DeleteEvt(id:any){
    return this.http.delete(API_URL+"admin/Menu/noeud/"+id)
  }

  deleteAdmAutorisation(sumId: number, roleId: number, evtId: number | null): Observable<any> {
    const params = new HttpParams()
      .set('sum_id', sumId.toString())
      .set('role', roleId.toString())
      .set('evt', evtId ? evtId.toString() : '');
    return this.http.delete(API_URL+"admin/Menu/Autorisation",{params});
}
getPersonllesdiffmymat = (soc: any, mat :any): Observable<any[]> => {
  return this.http.get<any[]>(API_URL+"adherent/Personnel/getPersonnelles/"+ soc + "/" + mat);
};

getAllRapport(): Observable<any[]> {
  return this.http.get<any[]>(API_URL+"Print/RapportRubController/findAll");
}

deleteRapport(cod_rap:any): Observable<void> {
  return this.http.delete<void>(API_URL+"Print/RapportRubController/"+cod_rap);
}


getAllParametreByIdRapport(cod_rap:any): Observable<any[]> {
  return this.http.get<any[]>(API_URL+"Print/ParamRubController/GetParametreById/"+cod_rap);
}

deleteParametreById(cod_rap:any): Observable<void> {
  return this.http.delete<void>(API_URL+"Print/ParamRubController/"+cod_rap);
}

createRapport(rapport: any): Observable<any> {
  return this.http.post(API_URL + 'Print/RapportRubController', rapport);
}

createParametre(parametre: any): Observable<any> {
  return this.http.post(API_URL + 'Print/ParamRubController', parametre);
}

}
