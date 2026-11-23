import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { notifSucces, notifErreur, confirmerSuppression, echapperHtml, MSG_AJOUT, MSG_MODIF, MSG_SUPPR, MSG_SUPPR_IMPOSSIBLE } from '../notif';
import { ParamAdherentService } from '../param-adherent.service';

/** Le code tient sur 1 caractère : c'est la longueur du champ « Corps » d'un adhérent (table PERSONNEL). */
const LONGUEUR_CODE = 1;
const LONGUEUR_LIBELLE = 100;

@Component({
  selector: 'app-prm-corps',
  templateUrl: './prm-corps.component.html',
  styleUrl: './prm-corps.component.scss'
})
export class PrmCorpsComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  formCorps!: FormGroup;

  readonly longueurCode = LONGUEUR_CODE;
  readonly longueurLibelle = LONGUEUR_LIBELLE;

  listCorps: any[] = [];
  private listCorpsComplete: any[] = [];

  chargementEnCours = true;
  erreurChargement = false;
  enregistrementEnCours = false;

  /** true : la fenêtre sert à ajouter un corps ; false : à modifier un corps (le code ne change alors pas). */
  modeAjout = true;

  searchz: { [colonne: string]: string } = { cod_corps: '', lib_corps: '', lib_corps_a: '' };

  constructor(
    private fb: FormBuilder,
    private serv: ParamAdherentService,
    public service: PaginationService,
    private modalService: NgbModal,
  ) {
    this.formCorps = this.fb.group({
      cod_corps: ['', [Validators.required, this.nonVide, Validators.maxLength(LONGUEUR_CODE), this.codeDejaPris]],
      lib_corps: ['', [Validators.required, this.nonVide, Validators.maxLength(LONGUEUR_LIBELLE)]],
      lib_corps_a: ['', [Validators.maxLength(LONGUEUR_LIBELLE)]],
    });
  }

  ngOnInit(): void {
    this.charger();
  }

  // ---------- validation ----------

  private nonVide(control: AbstractControl): ValidationErrors | null {
    return typeof control.value === 'string' && control.value.length > 0 && control.value.trim() === ''
      ? { required: true }
      : null;
  }

  /** À l'ajout, refuse un code déjà présent (sans tenir compte de la casse : « d » et « D » sont le même code). */
  private codeDejaPris = (control: AbstractControl): ValidationErrors | null => {
    if (!this.modeAjout) return null;
    const saisi = String(control.value ?? '').trim().toUpperCase();
    if (!saisi) return null;
    return this.listCorpsComplete.some(c => String(c.cod_corps ?? '').trim().toUpperCase() === saisi)
      ? { existe: true }
      : null;
  };

  champEnErreur(nom: string): boolean {
    const c = this.formCorps.get(nom);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  // ---------- liste ----------

  charger(): void {
    this.serv.getCorps().subscribe({
      next: (data) => {
        this.listCorpsComplete = data ?? [];
        this.erreurChargement = false;
        this.chargementEnCours = false;
        this.formCorps.get('cod_corps')?.updateValueAndValidity();
        this.applyFilter();
      },
      error: (err) => {
        this.chargementEnCours = false;
        this.erreurChargement = true;
        notifErreur('Chargement impossible', err, 'La liste des corps n’a pas pu être chargée.');
      },
    });
  }

  applyFilter(): void {
    this.listCorps = this.listCorpsComplete.filter((ligne: any) =>
      Object.keys(this.searchz).every((cle) => {
        const recherche = (this.searchz[cle] ?? '').toString().toLowerCase();
        const valeur = (ligne[cle] ?? '').toString().toLowerCase();
        return valeur.includes(recherche);
      }));
  }

  get filtreActif(): boolean {
    return Object.values(this.searchz).some(v => !!v);
  }

  get totalCorps(): number {
    return this.listCorpsComplete.length;
  }

  onSort(colonne: string): void {
    this.listCorps = this.service.onSort(colonne, this.listCorps);
  }

  // ---------- ajout / modification ----------

  ouvrirAjout(content: any): void {
    this.modeAjout = true;
    this.formCorps.reset({ cod_corps: '', lib_corps: '', lib_corps_a: '' });
    this.ouvrirFenetre(content, 'corps-code');
  }

  ouvrirModification(ligne: any, content: any): void {
    this.modeAjout = false;
    this.formCorps.reset({
      cod_corps: ligne.cod_corps,
      lib_corps: ligne.lib_corps,
      lib_corps_a: ligne.lib_corps_a ?? '',
    });
    this.ouvrirFenetre(content, 'corps-libelle');
  }

  private ouvrirFenetre(content: any, idChampFocus: string): void {
    const fenetre = this.modalService.open(content, { size: 'lg', centered: true });
    fenetre.shown.subscribe(() => document.getElementById(idChampFocus)?.focus());
  }

  enregistrer(modal: any): void {
    if (this.enregistrementEnCours) return;
    if (this.formCorps.invalid) {
      this.formCorps.markAllAsTouched();
      return;
    }
    const v = this.formCorps.getRawValue();
    const corps = {
      cod_corps: String(v.cod_corps ?? '').trim().toUpperCase(),
      lib_corps: String(v.lib_corps ?? '').trim(),
      lib_corps_a: String(v.lib_corps_a ?? '').trim() || null,
    };
    this.enregistrementEnCours = true;
    const appel = this.modeAjout ? this.serv.addCorps(corps) : this.serv.updateCorps(corps.cod_corps, corps);
    appel.pipe(finalize(() => (this.enregistrementEnCours = false))).subscribe({
      next: () => {
        modal.close('enregistre');
        notifSucces(this.modeAjout ? MSG_AJOUT : MSG_MODIF);
        this.charger();
      },
      error: (err) => notifErreur('Enregistrement impossible', err, 'L’enregistrement a échoué.'),
    });
  }

  // ---------- suppression ----------

  supprimer(ligne: any): void {
    confirmerSuppression('Supprimer ce corps ?',
      `Code <b>${echapperHtml(ligne.cod_corps)}</b> – ${echapperHtml(ligne.lib_corps)}`).then((confirme) => {
      if (!confirme) return;
      this.serv.deleteCorps(ligne.cod_corps).subscribe({
        next: () => {
          notifSucces(MSG_SUPPR);
          this.charger();
        },
        error: (err) => notifErreur('Suppression impossible', err, MSG_SUPPR_IMPOSSIBLE),
      });
    });
  }
}
