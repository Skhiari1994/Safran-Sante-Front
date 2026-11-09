import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Login Auth
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../../core/services/auth.service';
import { Societe } from '../../pages/Adherent/adherent.service';
import { Observable } from 'rxjs';
import { ToastService } from './toast-service';
import { SocieteLogin } from 'src/app/pages/Adherent/adherent.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

/**
 * Login Component
 */
export class LoginComponent implements OnInit {

  // Login Form
  loginForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType!: boolean;
  error = '';
  returnUrl!: string;
  toast!: false;
  // set the current year
  year: number = new Date().getFullYear();

  listSociete: any[] = [];

  constructor(private formBuilder: UntypedFormBuilder, private authenticationService: AuthenticationService, private router: Router,
    private route: ActivatedRoute, public toastService: ToastService) {
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    /**
     * Form Validatyion
     */
    if (sessionStorage.getItem('currentUser')) {
      this.router.navigate(['/']);
    }
    this.loginForm = this.formBuilder.group({
      cin: ['', [Validators.required]],
      useLogin: ['', [Validators.required]],
      password: ['', [Validators.required]],
      cod_soc: ['', [Validators.required]],
      remember: [false],
    });

    // "Se souvenir de moi" : on retrouve le matricule et le CIN (jamais le mot de passe)
    const memorise = this.lireIdentifiantsMemorises();
    if (memorise) {
      this.loginForm.patchValue({ useLogin: memorise.useLogin, cin: memorise.cin, remember: true });
      this.loadSocietes();
    }

    this.loginForm.get('useLogin')?.valueChanges.subscribe(() => {
      this.loadSocietes();
    });

    this.loginForm.get('cin')?.valueChanges.subscribe(() => {
      this.loadSocietes();
    });
  }

  getSocietesByLogin(matPers: string, cin: string): Observable<SocieteLogin[]> {
    return this.authenticationService.getSocietesByLogin(matPers, cin);
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;
    // Login Api
    // "remember" ne concerne que le navigateur : il n'est pas envoyé au serveur (et le mot de passe n'est pas loggé)
    const { remember, ...identifiants } = this.loginForm.value;

    this.authenticationService.login(identifiants).subscribe((data: any) => {

      if (data) {
        this.memoriserIdentifiants();
        localStorage.setItem('toast', 'true');
        localStorage.setItem('currentUser', JSON.stringify(data));
        localStorage.setItem('token', data.token);
        this.router.navigate(['/']);

      } else {
        this.toastService.show(data.data, { classname: 'bg-danger text-white', delay: 15000 });
      }
    });
  }

  private readonly CLE_MEMOIRE = 'rememberedLogin';

  private lireIdentifiantsMemorises(): { useLogin: string, cin: string } | null {
    try {
      const brut = localStorage.getItem(this.CLE_MEMOIRE);
      const v = brut ? JSON.parse(brut) : null;
      return v?.useLogin && v?.cin ? v : null;
    } catch {
      return null;
    }
  }

  /** Case cochée : on retient matricule + CIN ; décochée : on oublie. Le mot de passe n'est jamais stocké. */
  private memoriserIdentifiants(): void {
    try {
      if (this.loginForm.value.remember) {
        localStorage.setItem(this.CLE_MEMOIRE,
          JSON.stringify({ useLogin: this.loginForm.value.useLogin, cin: this.loginForm.value.cin }));
      } else {
        localStorage.removeItem(this.CLE_MEMOIRE);
      }
    } catch {
      // stockage indisponible (navigation privée…) : la connexion continue sans mémorisation
    }
  }

  /**
   * Password Hide/Show
   */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  loadSocietes(): void {

    const useLogin = this.loginForm.get('useLogin')?.value;
    const cin = this.loginForm.get('cin')?.value;

    console.log('useLogin : ' + useLogin)
    console.log('cin : ' + cin)

    // Don't call API until both fields are filled
    if (!useLogin || !cin) {
      this.listSociete = [];
      this.loginForm.patchValue({
        cod_soc: ''
      });
      return;
    }

    this.authenticationService.getSocietesByLogin(useLogin, cin)
      .subscribe({
        next: (societes) => {

          this.listSociete = societes;


          // If only one society, select it automatically
          if (societes.length === 1) {
            this.loginForm.patchValue({
              cod_soc: societes[0].codSoc
            });
          } else {
            // Multiple societies → let user choose
            this.loginForm.patchValue({
              cod_soc: ''
            });
          }
        },
        error: (error) => {
          console.error('Erreur récupération sociétés', error);

          this.listSociete = [];

          this.loginForm.patchValue({
            cod_soc: ''
          });
        }
      });
  }

}
