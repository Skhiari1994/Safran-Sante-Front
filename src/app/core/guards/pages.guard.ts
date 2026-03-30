import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { TokenStorage } from "src/app/account/token-storage.service";
import { SidebarService } from "src/app/layouts/sidebar/sidebar.service";
import { PermissionService } from "../services/permission.service";

@Injectable({ providedIn: 'root' })
export class PagesGuard {
   
  constructor(private route:Router, private token: TokenStorage,private permissionService :PermissionService) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
   
    const requiredAction = route.data['action'] as string;
    console.log("route,route",requiredAction)
    if (this.permissionService.isActionAllowed(requiredAction)) {
      return true;
    } else {
      this.route.navigate(['/']);
      return false;
    }
  }
  }
  