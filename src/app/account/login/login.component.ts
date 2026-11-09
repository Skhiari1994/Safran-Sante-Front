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
    });

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
    console.log("this.loginForm.value", this.loginForm.value)

    this.authenticationService.login(this.loginForm.value).subscribe((data: any) => {

      if (data) {
        localStorage.setItem('toast', 'true');
        localStorage.setItem('currentUser', JSON.stringify(data));
        localStorage.setItem('token', data.token);
        this.router.navigate(['/']);

      } else {
        this.toastService.show(data.data, { classname: 'bg-danger text-white', delay: 15000 });
      }
    });
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

          console.log('societes :', societes);

          console.log('societes[0] :', societes[0]);

          console.log('societes[0].cod_soc :', societes[0].codSoc);

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
