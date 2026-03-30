import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TokenStorage } from 'src/app/account/token-storage.service';

import { environment } from 'src/environments/environment';
const API_URL = environment.urlServer;
@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private allowedActions: Set<string> = new Set();
   constructor(private http: HttpClient,private token:TokenStorage) {
     
  }

  loadPermissions(): Promise<void> {
    const user = this.token.getUser();
  
    // Make sure to adapt this depending on your real structure
    const profilId = user.roles?.id || user.roles?.[0]?.id;
  
    if (!profilId) {
      console.error('Profile ID not found in token');
      return Promise.resolve(); // or reject if it's critical
    }
  
    return this.http
      .get<any[]>(API_URL+"admin/Menu/getActionProfil/"+profilId)
      .toPromise()
      .then((data: any) => {
        this.allowedActions = new Set(data.map((item:any) => item.evt_action));
      })
      .catch(error => {
        console.error('Error loading permissions:', error);
      });
  }

  isActionAllowed(action: string): boolean {
   
    return this.allowedActions.has(action);
  }
}
