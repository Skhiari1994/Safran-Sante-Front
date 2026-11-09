import { Injectable } from '@angular/core';
const TOKEN_KEY = 'token';
const USER_KEY = 'currentUser';
@Injectable({
  providedIn: 'root'
})
export class TokenStorage {
 constructor() { }

signOut(): void {
  window.localStorage.clear();
}

public saveToken(token: string): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.setItem(TOKEN_KEY, token);
}

public getToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

/** Contenu (claims) du JWT, ou {} si absent ou illisible. */
public getClaims(): any {
  const jwt = this.getToken();
  if (!jwt) {
    return {};
  }
  try {
    const payload = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payload), c => c.charCodeAt(0))));
  } catch {
    return {};
  }
}

/** Matricule de l'utilisateur connecté (token, sinon réponse du login). */
public getMatricule(): string | null {
  return this.getClaims().matricule ?? this.getUser().matPers ?? this.getUser().useLogin ?? null;
}

/** Code société de l'utilisateur connecté (token, sinon réponse du login). */
public getSociete(): string | null {
  return this.getClaims().codSoc ?? this.getUser().codSoc ?? null;
}

/** Prénom et nom de l'utilisateur connecté (claim fullName du token). */
public getNomComplet(): string {
  return this.getClaims().fullName ?? '';
}

/** Libellé de la société (sans le code), ou « Société 01 » si le token n'a pas de libellé. */
public getLibSociete(): string {
  const libelle = this.getClaims().libSoc;
  if (libelle) {
    return libelle;
  }
  const code = this.getSociete();
  return code ? `Société ${code}` : '';
}

public saveUser(user: any): void {
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

public getUser(): any {
  const user = window.localStorage.getItem(USER_KEY);
  if (user) {
    return JSON.parse(user);
  }

  return {};
}
}
