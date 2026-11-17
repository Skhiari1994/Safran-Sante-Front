import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import { LoginComponent } from './login.component';
import { consommerMotifDeconnexion, memoriserMotifDeconnexion } from '../../core/helpers/motif-deconnexion';

describe('Écran de connexion : message « Session expirée »', () => {
  let fixture: ComponentFixture<LoginComponent>;

  function ouvrirEcran(): HTMLElement {
    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(() => {
    sessionStorage.removeItem('motifDeconnexion');
    sessionStorage.removeItem('currentUser');
    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: Store, useValue: { dispatch: () => { }, select: () => ({ subscribe: () => { } }) } }],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  afterEach(() => sessionStorage.removeItem('motifDeconnexion'));

  it("arrivée normale : aucun message", () => {
    expect(ouvrirEcran().querySelector('.login-session-expiree')).toBeNull();
  });

  it("déconnexion pour inactivité : message explicite", () => {
    memoriserMotifDeconnexion('inactivite');
    const alerte = ouvrirEcran().querySelector('.login-session-expiree') as HTMLElement;
    expect(alerte).not.toBeNull();
    expect(alerte.textContent).toContain('Session expirée');
    expect(alerte.textContent).toContain("Pour des raisons d'inactivité, votre session a été déconnectée.");
    expect(alerte.textContent).toContain('Veuillez vous reconnecter.');
    expect(alerte.getAttribute('role')).toBe('alert');
  });

  it('jeton expiré (401) : message générique, sans parler d\'inactivité', () => {
    memoriserMotifDeconnexion('expiree');
    const alerte = ouvrirEcran().querySelector('.login-session-expiree') as HTMLElement;
    expect(alerte.textContent).toContain('Votre session a expiré.');
    expect(alerte.textContent).not.toContain('inactivité');
  });

  it("le message ne s'affiche qu'une fois (pas après un rechargement de l'écran)", () => {
    memoriserMotifDeconnexion('inactivite');
    expect(ouvrirEcran().querySelector('.login-session-expiree')).not.toBeNull();
    fixture.destroy();
    expect(ouvrirEcran().querySelector('.login-session-expiree')).toBeNull();
  });

  it('la croix ferme le message', () => {
    memoriserMotifDeconnexion('inactivite');
    const racine = ouvrirEcran();
    (racine.querySelector('.login-session-expiree .btn-close') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(racine.querySelector('.login-session-expiree')).toBeNull();
  });

  it('une valeur inconnue dans le stockage est ignorée', () => {
    sessionStorage.setItem('motifDeconnexion', 'n-importe-quoi');
    expect(consommerMotifDeconnexion()).toBeNull();
    expect(sessionStorage.getItem('motifDeconnexion')).toBeNull();
  });
});
