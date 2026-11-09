import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

// Auth Services
import { AuthenticationService } from '../services/auth.service';
import { AuthfakeauthenticationService } from '../services/authfake.service';
import { environment } from '../../../environments/environment';
import { TokenStorage } from 'src/app/account/token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
   
  constructor(private route:Router,     private token: TokenStorage
  ) { }
canActivate(){
  const jwt = this.token.getToken();
  if(jwt && !this.isExpired(jwt)){

  return true;
  }else{
  // un token expiré fait échouer toutes les requêtes backend : on repart d'une session propre
  this.token.signOut();
  this.route.navigate(['/auth/login']);
  return false;
  }
  }

  private isExpired(jwt: string): boolean {
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return !!payload.exp && payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
  }
  