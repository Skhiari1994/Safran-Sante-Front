import { Injectable } from '@angular/core';
import { getFirebaseBackend } from '../../authUtils';
import { User } from 'src/app/store/Authentication/auth.models';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { GlobalComponent } from "../../global-component";
import { Store } from '@ngrx/store';
import { RegisterSuccess, loginFailure, loginSuccess, logout, logoutSuccess } from 'src/app/store/Authentication/authentication.actions';
import { environment } from 'src/environments/environment';
import { Societe } from 'src/app/pages/Adherent/adherent.service';
import { SocieteLogin } from 'src/app/pages/Adherent/adherent.service';

//;

/* Interface pour lire les délais d'inactivité et d'avertissement */
export interface DelaisSession {
    delaiInactiviteMs: number;
    delaiAvertissementMs: number;
}

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

const API_URL = environment.urlServer;

@Injectable({ providedIn: 'root' })

/**
 * Auth-service Component
 */
export class AuthenticationService {

    user!: User;
    currentUserValue: any;

    private currentUserSubject: BehaviorSubject<User>;
    // public currentUser: Observable<User>;

    constructor(private http: HttpClient, private store: Store) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('currentUser')!));
        // this.currentUser = this.currentUserSubject.asObservable();
    }

    /**
     * Performs the register
     * @param email email
     * @param password password
     */
    register(user: any) {
        // return getFirebaseBackend()!.registerUser(email, password).then((response: any) => {
        //     const user = response;
        //     return user;
        // });

        // Register Api
        return this.http.post(API_URL + 'api/auth/register', user, httpOptions).pipe(
            map((response: any) => {
                const user = response;
                return user;
            }),
            catchError((error: any) => {
                const errorMessage = 'Login failed'; // Customize the error message as needed
                this.store.dispatch(loginFailure({ error: errorMessage }));
                return throwError(errorMessage);
            })
        );
    }

    getSocietesByCin(cin: string): Observable<SocieteLogin[]> {
        return this.http.get<SocieteLogin[]>(
            `${API_URL}api/auth/getSocieteByCin/${cin}`
        );
    }

    getSocietesByLogin(matPers: string, cin: string): Observable<SocieteLogin[]> {
        return this.http.get<SocieteLogin[]>(
            `${API_URL}api/auth/getSocieteByLogin/${matPers}/${cin}`
        );
    }

    login(AuthenticationRequest: any) {
        return this.http.post(API_URL + 'api/auth/authenticate', AuthenticationRequest, httpOptions).pipe(
            map((response: any) => {
                const user = response;
                return user;
            }),
            catchError((error: any) => {
                const errorMessage = 'Login failed'; // Customize the error message as needed
                return throwError(error);
            })
        );
    }

    /**
     * Renouvelle le jeton (court, 7 min côté serveur) d'un utilisateur actif. Le nouveau jeton remplace l'ancien
     * dans le stockage ; un jeton déjà expiré donne un 401 (le ErrorInterceptor déconnecte alors l'utilisateur).
     */
    renouvelerJeton(): Observable<{ token: string }> {
        return this.http.post<{ token: string }>(API_URL + 'api/auth/refresh', {}).pipe(
            tap(reponse => {
                if (reponse?.token) {
                    const ancien = localStorage.getItem('token');
                    localStorage.setItem('token', reponse.token);
                    // l'alerte « carte CNAM » est mémorisée par jeton (une fois par connexion) : on suit le renouvellement
                    try {
                        if (ancien && sessionStorage.getItem('carteCnamAlerte') === ancien) {
                            sessionStorage.setItem('carteCnamAlerte', reponse.token);
                        }
                    } catch { /* stockage indisponible */ }
                }
            })
        );
    }

    /**
     * Returns the current user
     */
    public currentUser(): any {
        return getFirebaseBackend()!.getAuthenticatedUser();
    }

    /**
     * Logout the user
     */
    logout() {
        this.store.dispatch(logout());
        // logout the user
        // return getFirebaseBackend()!.logout();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        this.currentUserSubject.next(null!);

        return of(undefined).pipe(

        );

    }

    /**
     * Reset password
     * @param email email
     */
    resetPassword(email: string) {
        return getFirebaseBackend()!.forgetPassword(email).then((response: any) => {
            const message = response.data;
            return message;
        });
    }

    confirmeCompte(token: string) {
        let params = new HttpParams()
            .set('token', token);
        return this.http.get(API_URL + 'api/auth/activate-account', { params })
    }

    newPassword(user: any) {

        return this.http.put(API_URL + 'api/auth/updatePass', user)
    }

    /** Lit les délais d'inactivité et d'avertissement dans PARAM_GRH.
     * Renvoie null en cas d'échec : l'appelant applique alors ses valeurs par défaut.
     */
    getDelaisSession(): Observable<DelaisSession | null> {
        return this.http.get<DelaisSession>(API_URL + 'api/auth/delais-session').pipe(
            catchError(err => {
                console.warn('Échec du chargement des délais de session', err?.status, err?.url);
                return of(null);
            })
        );
    }

}

