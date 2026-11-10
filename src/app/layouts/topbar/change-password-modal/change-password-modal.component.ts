import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

/** Règle de complexité du nouveau mot de passe (la même est contrôlée par le serveur). */
interface RegleMotDePasse {
  texte: string;
  respectee: (valeur: string) => boolean;
}

const REGLES: RegleMotDePasse[] = [
  { texte: 'Au moins 8 caractères', respectee: v => v.length >= 8 },
  { texte: 'Une lettre majuscule', respectee: v => /[A-Z]/.test(v) },
  { texte: 'Un chiffre', respectee: v => /\d/.test(v) },
  { texte: 'Un symbole (ex. ! @ # $ % *)', respectee: v => /[^A-Za-z0-9]/.test(v) },
];

/** Valide le nouveau mot de passe : toutes les règles doivent être respectées. */
function motDePasseFort(control: AbstractControl): ValidationErrors | null {
  const valeur: string = control.value || '';
  return valeur && !REGLES.every(r => r.respectee(valeur)) ? { faible: true } : null;
}

/** La confirmation doit être identique au nouveau mot de passe. */
function confirmationIdentique(group: AbstractControl): ValidationErrors | null {
  const nouveau = group.get('newPassword')?.value;
  const confirmation = group.get('confirmationPassword')?.value;
  return confirmation && nouveau !== confirmation ? { different: true } : null;
}

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.scss']
})
export class ChangePasswordModalComponent {

  readonly regles = REGLES;
  form: FormGroup;
  visible = { currentPassword: false, newPassword: false, confirmationPassword: false };
  enCours = false;
  erreur = '';

  constructor(public modal: NgbActiveModal, private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, motDePasseFort]],
      confirmationPassword: ['', Validators.required],
    }, { validators: confirmationIdentique });
  }

  get nouveau(): string {
    return this.form.get('newPassword')?.value || '';
  }

  basculer(champ: 'currentPassword' | 'newPassword' | 'confirmationPassword'): void {
    this.visible[champ] = !this.visible[champ];
  }

  /** Un champ est signalé en erreur seulement après que l'utilisateur l'a touché. */
  invalide(champ: string): boolean {
    const c = this.form.get(champ);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  confirmationDifferente(): boolean {
    const c = this.form.get('confirmationPassword');
    return !!c && (c.dirty || c.touched) && this.form.hasError('different');
  }

  enregistrer(): void {
    this.erreur = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enCours = true;
    this.http.put<{ message: string }>(environment.urlServer + 'api/auth/change-password', this.form.value).subscribe({
      next: () => {
        this.enCours = false;
        this.modal.close('modifie');
        Swal.fire({
          icon: 'success',
          title: 'Mot de passe modifié',
          text: 'Utilisez-le à votre prochaine connexion.',
          timer: 2500,
          showConfirmButton: false
        });
      },
      error: (err: any) => {
        this.enCours = false;
        // 400 : ancien mot de passe incorrect, règle non respectée… (le message vient du serveur)
        this.erreur = err?.error?.message || 'Modification impossible pour le moment. Réessayez plus tard.';
      }
    });
  }
}
