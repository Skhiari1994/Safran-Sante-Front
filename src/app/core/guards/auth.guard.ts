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
  if(this.token.getToken()){
    
  return true;
  }else{
  this.route.navigate(['/auth/login']);
  return false;
  }
  }
  }
  