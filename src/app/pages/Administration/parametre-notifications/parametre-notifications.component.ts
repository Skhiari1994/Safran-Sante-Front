import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize, forkJoin } from 'rxjs';
import { PaginationService } from 'src/app/core/services/pagination.service';
import {
  notifSucces, notifErreur, confirmerSuppression, echapperHtml, MSG_AJOUT, MSG_MODIF, MSG_SUPPR
} from 'src/app/pages/Réferentiels/Parametrages Adherent/notif';
import { AdminService } from '../Admin.service';

const LONGUEUR_TEXTE = 500;
const LONGUEUR_PARAM = 30;
const LONGUEUR_TYPE = 20;
const NOMBRE_PARAMS = 5;
const NATURES = ['MAIL', 'SMS'];

@Component({
  selector: 'app-parametre-notifications',
  templateUrl: './parametre-notifications.component.html',
  styleUrl: './parametre-notifications.component.scss'
})
export class ParametreNotificationsComponent implements OnInit {
  formNotif!: FormGroup;

  readonly natures = NATURES;
  readonly longueurTexte = LONGUEUR_TEXTE;
  readonly longueurParam = LONGUEUR_PARAM;
  readonly longueurType = LONGUEUR_TYPE;
  readonly indicesParams = [1, 2, 3, 4, 5];

  listNotif: any[] = [];
  private listNotifComplete: any[] = [];
  listCorps: any[] = [];
  listSocietes: any[] = [];

  chargementEnCours = true;
  erreurChargement = false;
  enregistrementEnCours = false;

  /** true : la fenêtre sert à ajouter une notification ; false : à en modifier une. */
  modeAjout = true;
  idModifie: number | null = null;

  recherche = '';
  filtreNature = '';

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    public service: PaginationService,
    private modalService: NgbModal,
  ) {
    this.formNotif = this.fb.group({
      natNotif: ['', [Validators.required]],
      typeNotif: ['', [Validators.required, this.nonVide, Validators.maxLength(LONGUEUR_TYPE)]],
      codSoc: [''],
      corpsNotif: [''],
      textNotif: ['', [Validators.required, this.nonVide, Validators.maxLength(LONGUEUR_TEXTE)]],
      param1: ['', [Validators.maxLength(LONGUEUR_PARAM)]],
      param2: ['', [Validators.maxLength(LONGUEUR_PARAM)]],
      param3: ['', [Validators.maxLength(LONGUEUR_PARAM)]],
      param4: ['', [Validators.maxLength(LONGUEUR_PARAM)]],
      param5: ['', [Validators.maxLength(LONGUEUR_PARAM)]],
    });
  }

  ngOnInit(): void {
    this.chargerListesDeChoix();
    this.charger();
  }

  // ---------- validation ----------

  private nonVide(control: AbstractControl): ValidationErrors | null {
    return typeof control.value === 'string' && control.value.length > 0 && control.value.trim() === ''
      ? { required: true }
      : null;
  }

  champEnErreur(nom: string): boolean {
    const c = this.formNotif.get(nom);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  /**
   * Repères [[paramN]] du texte qui ne seront pas remplis : le paramètre N est vide, ou N n'est pas entre 1 et 5.
   * Simple avertissement : un repère peut être renseigné ailleurs, l'enregistrement n'est pas bloqué.
   */
  get alertesReperes(): string[] {
    const v = this.formNotif.getRawValue();
    const texte = String(v.textNotif ?? '');
    const alertes: string[] = [];
    const vus = new Set<number>();
    for (const m of texte.matchAll(/\[\[param(\d+)\]\]/gi)) {
      const n = Number(m[1]);
      if (vus.has(n)) continue;
      vus.add(n);
      if (n < 1 || n > NOMBRE_PARAMS) {
        alertes.push(`[[param${n}]] : il n'existe que les paramètres 1 à ${NOMBRE_PARAMS}.`);
      } else if (!String(v['param' + n] ?? '').trim()) {
        alertes.push(`[[param${n}]] est dans le texte mais le paramètre ${n} est vide.`);
      }
    }
    return alertes;
  }

  get longueurTexteSaisi(): number {
    return String(this.formNotif.get('textNotif')?.value ?? '').length;
  }

  // ---------- chargement ----------

  private chargerListesDeChoix(): void {
    forkJoin({ corps: this.adminService.getCorpsNotif(), societes: this.adminService.getSocietesNotif() }).subscribe({
      next: (r) => {
        this.listCorps = r.corps ?? [];
        this.listSocietes = r.societes ?? [];
      },
      error: (err) => notifErreur('Chargement impossible', err, 'Les listes des corps et des sociétés n’ont pas pu être chargées.'),
    });
  }

  charger(): void {
    this.adminService.getAllParamNotif().subscribe({
      next: (data) => {
        this.listNotifComplete = data ?? [];
        this.erreurChargement = false;
        this.chargementEnCours = false;
        this.appliquerFiltres();
      },
      error: (err) => {
        this.chargementEnCours = false;
        this.erreurChargement = true;
        notifErreur('Chargement impossible', err, 'La liste des notifications n’a pas pu être chargée.');
      },
    });
  }

  libelleCorps(code: string | null): string {
    if (!code) return 'Tous les corps';
    return this.listCorps.find(c => c.codCorps === code)?.libCorps ?? code;
  }

  libelleSociete(code: string | null): string {
    if (!code) return 'Toutes les sociétés';
    return this.listSocietes.find(s => s.codSoc === code)?.libSoc ?? code;
  }

  parametresRenseignes(n: any): string[] {
    return this.indicesParams.map(i => n['param' + i]).filter((p: string | null) => !!p);
  }

  // ---------- filtres ----------

  appliquerFiltres(): void {
    const r = this.recherche.trim().toLowerCase();
    this.listNotif = this.listNotifComplete.filter((n: any) => {
      if (this.filtreNature && n.natNotif !== this.filtreNature) return false;
      if (!r) return true;
      const contenu = [
        n.idNotif, n.natNotif, n.typeNotif, n.textNotif, this.libelleCorps(n.corpsNotif),
        this.libelleSociete(n.codSoc), ...this.parametresRenseignes(n)
      ].join(' ').toLowerCase();
      return contenu.includes(r);
    });
  }

  get filtreActif(): boolean {
    return !!this.recherche.trim() || !!this.filtreNature;
  }

  get totalNotif(): number {
    return this.listNotifComplete.length;
  }

  get typesExistants(): string[] {
    return [...new Set(this.listNotifComplete.map((n: any) => n.typeNotif).filter((t: string) => !!t))].sort();
  }

  reinitialiserFiltres(): void {
    this.recherche = '';
    this.filtreNature = '';
    this.appliquerFiltres();
  }

  onSort(colonne: string): void {
    this.listNotif = this.service.onSort(colonne, this.listNotif);
  }

  // ---------- ajout / modification ----------

  ouvrirAjout(content: any): void {
    this.modeAjout = true;
    this.idModifie = null;
    this.formNotif.reset(this.valeursVides());
    this.ouvrirFenetre(content, 'notif-nature');
  }

  ouvrirModification(ligne: any, content: any): void {
    this.modeAjout = false;
    this.idModifie = ligne.idNotif;
    this.formNotif.reset({
      natNotif: ligne.natNotif ?? '',
      typeNotif: ligne.typeNotif ?? '',
      codSoc: ligne.codSoc ?? '',
      corpsNotif: ligne.corpsNotif ?? '',
      textNotif: ligne.textNotif ?? '',
      param1: ligne.param1 ?? '',
      param2: ligne.param2 ?? '',
      param3: ligne.param3 ?? '',
      param4: ligne.param4 ?? '',
      param5: ligne.param5 ?? '',
    });
    this.ouvrirFenetre(content, 'notif-texte');
  }

  private valeursVides(): any {
    return {
      natNotif: '', typeNotif: '', codSoc: '', corpsNotif: '', textNotif: '',
      param1: '', param2: '', param3: '', param4: '', param5: '',
    };
  }

  private ouvrirFenetre(content: any, idChampFocus: string): void {
    const fenetre = this.modalService.open(content, { size: 'lg', centered: true, backdrop: 'static' });
    fenetre.shown.subscribe(() => document.getElementById(idChampFocus)?.focus());
  }

  enregistrer(modal: any): void {
    if (this.enregistrementEnCours) return;
    if (this.formNotif.invalid) {
      this.formNotif.markAllAsTouched();
      return;
    }
    const v = this.formNotif.getRawValue();
    const vide = (x: unknown) => String(x ?? '').trim() || null;
    const notif = {
      natNotif: String(v.natNotif).trim().toUpperCase(),
      typeNotif: String(v.typeNotif).trim().toUpperCase(),
      codSoc: vide(v.codSoc),
      corpsNotif: vide(v.corpsNotif),
      textNotif: String(v.textNotif).trim(),
      param1: vide(v.param1), param2: vide(v.param2), param3: vide(v.param3), param4: vide(v.param4), param5: vide(v.param5),
    };
    const ajout = this.modeAjout;
    this.enregistrementEnCours = true;
    const appel = ajout
      ? this.adminService.addParamNotif(notif)
      : this.adminService.updateParamNotif(this.idModifie as number, notif);
    appel.pipe(finalize(() => (this.enregistrementEnCours = false))).subscribe({
      next: () => {
        modal.close('enregistre');
        notifSucces(ajout ? MSG_AJOUT : MSG_MODIF);
        this.charger();
      },
      error: (err) => notifErreur('Enregistrement impossible', err, 'L’enregistrement a échoué.'),
    });
  }

  // ---------- suppression ----------

  supprimer(ligne: any): void {
    const resume = String(ligne.textNotif ?? '').length > 120 ? String(ligne.textNotif).slice(0, 120) + '…' : ligne.textNotif;
    confirmerSuppression('Supprimer cette notification ?',
      `<b>${echapperHtml(ligne.natNotif)}</b> · ${echapperHtml(ligne.typeNotif)}<br>${echapperHtml(resume)}`).then((confirme) => {
      if (!confirme) return;
      this.adminService.deleteParamNotif(ligne.idNotif).subscribe({
        next: () => {
          notifSucces(MSG_SUPPR);
          this.charger();
        },
        error: (err) => notifErreur('Suppression impossible', err, 'Cette notification n’a pas pu être supprimée.'),
      });
    });
  }
}
