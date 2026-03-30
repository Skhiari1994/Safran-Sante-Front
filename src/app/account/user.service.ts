import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
const API_URL = environment.urlServer;

@Injectable({ providedIn: 'root' })
export class UserProfileService {
    constructor(private http: HttpClient) { }

    Authenticate(RegistrationRequest :any) {
        return this.http.post<any[]>(API_URL+"api/auth/authenticate",RegistrationRequest);
    }

    register(user: any) {
        return this.http.post(API_URL+"users/register", user);
    }
    
}
