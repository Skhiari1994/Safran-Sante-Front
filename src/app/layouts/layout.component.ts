import { Component, OnDestroy, OnInit } from '@angular/core';

// Store
import { RootReducerState } from '../store';
import { Store } from '@ngrx/store';
import { ChatNotificationService } from '../pages/chat/chat-notification.service';
import { TokenStorage } from '../account/token-storage.service';
import { CarteCnamAlertService } from '../pages/Adherent/carte-cnam-alert.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})

/**
 * Layout Component
 */
export class LayoutComponent implements OnInit, OnDestroy {

  layoutType!: string;

  constructor(private store: Store<RootReducerState>, private chatNotifications: ChatNotificationService,
    private tokenStorage: TokenStorage, private carteCnamAlert: CarteCnamAlertService) { }

  ngOnInit(): void {
    this.alerterCarteCnamApresConnexion();
    this.store.select('layout').subscribe((data) => {
      this.layoutType = data.LAYOUT;
      document.documentElement.setAttribute('data-layout', data.LAYOUT);
      document.documentElement.setAttribute('data-bs-theme', data.LAYOUT_MODE);
      document.documentElement.setAttribute('data-layout-width', data.LAYOUT_WIDTH);
      document.documentElement.setAttribute('data-layout-position', data.LAYOUT_POSITION);
      document.documentElement.setAttribute('data-topbar', data.TOPBAR);
      data.LAYOUT == "vertical" || data.LAYOUT == "twocolumn" ? document.documentElement.setAttribute('data-sidebar', data.SIDEBAR_COLOR) : '';
      data.LAYOUT == "vertical" || data.LAYOUT == "twocolumn" ? document.documentElement.setAttribute('data-sidebar-size', data.SIDEBAR_SIZE) : '';
      data.LAYOUT == "vertical" || data.LAYOUT == "twocolumn" ? document.documentElement.setAttribute('data-sidebar-image', data.SIDEBAR_IMAGE) : '';
      data.LAYOUT == "vertical" || data.LAYOUT == "twocolumn" ? document.documentElement.setAttribute('data-layout-style', data.SIDEBAR_VIEW) : '';
      document.documentElement.setAttribute('data-preloader', data.DATA_PRELOADER)
      document.documentElement.setAttribute('data-sidebar-visibility', data.SIDEBAR_VISIBILITY);
    })

  }


  /** Alerte d'expiration de la carte CNAM de l'utilisateur connecté, une seule fois par connexion (clé : le token). */
  private alerterCarteCnamApresConnexion(): void {
    const token = this.tokenStorage.getToken();
    const user = this.tokenStorage.getUser();
    if (!token || !(user?.matPers || user?.useLogin)) return;
    try {
      if (sessionStorage.getItem('carteCnamAlerte') === token) return;
      sessionStorage.setItem('carteCnamAlerte', token);
    } catch { /* stockage indisponible : on alerte quand même */ }
    this.carteCnamAlert.verifierPourUtilisateur(user);
  }

  ngOnDestroy(): void {
    this.chatNotifications.reset();
  }

  /**
  * Check if the vertical layout is requested
  */
  isVerticalLayoutRequested() {
    return this.layoutType === 'vertical';
  }

  /**
   * Check if the semibox layout is requested
   */
  isSemiboxLayoutRequested() {
    return this.layoutType === 'semibox';
  }

  /**
   * Check if the horizontal layout is requested
   */
  isHorizontalLayoutRequested() {
    return this.layoutType === 'horizontal';
  }

  /**
   * Check if the horizontal layout is requested
   */
  isTwoColumnLayoutRequested() {
    return this.layoutType === 'twocolumn';
  }

}
