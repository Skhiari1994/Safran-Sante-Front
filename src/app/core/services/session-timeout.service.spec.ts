import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { of, throwError } from 'rxjs';
import { SessionTimeoutService } from './session-timeout.service';
import { AuthenticationService } from './auth.service';
import { TokenStorage } from 'src/app/account/token-storage.service';

/** Tests en temps réel avec des délais raccourcis (inactivité 300 ms, avertissement 1500 ms, vérification toutes les 50 ms). */
describe('SessionTimeoutService', () => {
  let service: SessionTimeoutService;
  let router: jasmine.SpyObj<Router>;
  let auth: jasmine.SpyObj<AuthenticationService>;
  let token: string | null;

  const attendre = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
  const popupVisible = () => Swal.isVisible() && !!Swal.getPopup()?.classList.contains('popup-inactivite');

  beforeEach(() => {
    token = 'jeton';
    router = jasmine.createSpyObj('Router', ['navigate']);
    auth = jasmine.createSpyObj('AuthenticationService', ['logout', 'renouvelerJeton']);
    auth.logout.and.callFake(() => { token = null; return undefined as any; });
    auth.renouvelerJeton.and.returnValue(of({ token: 'nouveau' }));
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthenticationService, useValue: auth },
        { provide: TokenStorage, useValue: { getToken: () => token } },
      ],
    });
    service = TestBed.inject(SessionTimeoutService);
    service.delaiInactivite = 300;
    service.delaiAvertissement = 1500;
    service.periodeVerification = 50;
    service.intervalleRenouvellement = 400;
  });

  afterEach(() => {
    service.arreter();
    Swal.close();
    localStorage.removeItem('derniereActivite');
  });

  it("n'affiche rien tant que l'utilisateur est actif", async () => {
    service.demarrer();
    for (let i = 0; i < 8; i++) {
      document.dispatchEvent(new Event('mousemove'));
      await attendre(100);
    }
    expect(popupVisible()).toBeFalse();
    expect(auth.logout).not.toHaveBeenCalled();
  });

  it("affiche le message d'inactivité avec compte à rebours après le délai", async () => {
    service.demarrer();
    await attendre(600);
    expect(popupVisible()).toBeTrue();
    expect(Swal.getHtmlContainer()?.textContent).toContain("Pour des raisons d'inactivité, votre session sera déconnectée");
    expect(Swal.getConfirmButton()?.textContent).toBe('OK');
    expect(Swal.getHtmlContainer()?.querySelector('#session-compteur')?.textContent).toMatch(/^\d\d:\d\d$/);
  });

  it('OK : ferme le pop-up et garde la session, sans déconnexion', async () => {
    service.demarrer();
    await attendre(600);
    expect(popupVisible()).toBeTrue();
    Swal.clickConfirm();
    await attendre(10);
    // l'avertissement est levé tout de suite (l'animation de fermeture de SweetAlert peut durer ~200 ms)
    expect((service as any).debutAvertissement).toBeNull();
    await attendre(230);
    expect(popupVisible()).toBeFalse();
    // un nouveau cycle recommence : pas de déconnexion avant l'échéance du nouvel avertissement
    await attendre(1000);
    expect(auth.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('sans OK : déconnexion et redirection vers /auth/login après le délai', async () => {
    service.demarrer();
    await attendre(300 + 1500 + 500);
    expect(auth.logout).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(popupVisible()).toBeFalse();
  });

  it("déconnexion pour inactivité : le motif est mémorisé pour l'écran de connexion", async () => {
    sessionStorage.removeItem('motifDeconnexion');
    service.demarrer();
    await attendre(300 + 1500 + 500);
    expect(sessionStorage.getItem('motifDeconnexion')).toBe('inactivite');
    sessionStorage.removeItem('motifDeconnexion');
  });

  it("déconnexion faite dans un autre onglet : pas de motif d'inactivité", async () => {
    sessionStorage.removeItem('motifDeconnexion');
    service.demarrer();
    token = null;
    await attendre(200);
    expect(sessionStorage.getItem('motifDeconnexion')).toBeNull();
  });

  it("l'activité pendant l'avertissement ne prolonge pas la session", async () => {
    service.demarrer();
    await attendre(600);
    expect(popupVisible()).toBeTrue();
    for (let i = 0; i < 10; i++) {
      document.dispatchEvent(new Event('mousemove'));
      document.dispatchEvent(new Event('keydown'));
      await attendre(150);
    }
    await attendre(500);
    expect(auth.logout).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('ne déconnecte pas avant la fin du délai d\'avertissement', async () => {
    service.demarrer();
    await attendre(300 + 800);
    expect(popupVisible()).toBeTrue();
    expect(auth.logout).not.toHaveBeenCalled();
  });

  describe('renouvellement du jeton (côté serveur, le jeton est court)', () => {
    it('la 1re activité renouvelle le jeton, puis au plus une fois par intervalle', async () => {
      service.delaiInactivite = 5000; // pas de pop-up d'inactivité qui interfère avec ce scénario
      service.demarrer();
      expect(auth.renouvelerJeton).not.toHaveBeenCalled(); // rien tant que l'utilisateur ne fait rien
      document.dispatchEvent(new Event('mousemove'));
      expect(auth.renouvelerJeton).toHaveBeenCalledTimes(1);

      for (let i = 0; i < 3; i++) { // 3 × 100 ms < intervalle de 400 ms
        document.dispatchEvent(new Event('mousemove'));
        await attendre(100);
      }
      expect(auth.renouvelerJeton).toHaveBeenCalledTimes(1);

      await attendre(200); // intervalle écoulé
      document.dispatchEvent(new Event('keydown'));
      expect(auth.renouvelerJeton).toHaveBeenCalledTimes(2);
    });

    it("ne renouvelle pas pendant l'avertissement d'inactivité (la session doit mourir côté serveur aussi)", async () => {
      service.demarrer();
      await attendre(600);
      expect(popupVisible()).toBeTrue();
      auth.renouvelerJeton.calls.reset();
      for (let i = 0; i < 5; i++) {
        document.dispatchEvent(new Event('mousemove'));
        await attendre(120);
      }
      expect(auth.renouvelerJeton).not.toHaveBeenCalled();
    });

    it('OK : renouvelle tout de suite le jeton, même dans l\'intervalle', async () => {
      service.demarrer();
      await attendre(600);
      expect(popupVisible()).toBeTrue();
      auth.renouvelerJeton.calls.reset();
      Swal.clickConfirm();
      await attendre(20);
      expect(auth.renouvelerJeton).toHaveBeenCalledTimes(1);
    });

    it('un échec du renouvellement ne plante pas et ne boucle pas à chaque mouvement de souris', async () => {
      auth.renouvelerJeton.and.returnValue(throwError(() => new Error('réseau')));
      service.demarrer();
      for (let i = 0; i < 5; i++) {
        document.dispatchEvent(new Event('mousemove'));
        await attendre(50);
      }
      expect(auth.renouvelerJeton).toHaveBeenCalledTimes(1);
      expect(auth.logout).not.toHaveBeenCalled();
    });
  });

  it("suit la déconnexion faite dans un autre onglet (jeton supprimé)", async () => {
    service.demarrer();
    token = null;
    await attendre(200);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
