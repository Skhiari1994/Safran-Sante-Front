import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const URL = environment.urlServer
const API_URL = environment.urlServer
@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  constructor(private http:HttpClient) { }


 
  getMenu = (profile:any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "admin/Menu/menu/" + profile);
   };
   getActionProfil = (profile:any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "admin/Menu/getActionProfil/" + profile);
   };
}
