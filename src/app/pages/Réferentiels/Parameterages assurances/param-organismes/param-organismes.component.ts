import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';
import { PaginationService } from 'src/app/core/services/pagination.service';
import {
  notifSucces, notifErreur, confirmerSuppression, echapperHtml, MSG_AJOUT, MSG_MODIF, MSG_SUPPR, MSG_SUPPR_IMPOSSIBLE
} from '../../Parametrages Adherent/notif';
import { AssurService } from '../assur.service';

/** Longueurs des colonnes de PARAM_ORGANISMES. */
const LONGUEURS = {
  abrvOrg: 20,
  libOrg: 100,
  adrOrg: 100,
  natOrg: 10,
  faxOrg: 20,
  telOrg: 40,
  emailOrg: 40,
  identFsc: 20,
  gsm: 20,
};

const MOTIF_TELEPHONE = /^[0-9 +()./,-]+$/;
const MOTIF_EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MOTIF_IDENT_FISCALE = /^[A-Za-z0-9/ .-]+$/;

/** Colonnes de la liste, dans l'ordre d'affichage (le tri et le filtre se font sur la clé). */
const COLONNES = [
  { cle: 'codOrg', titre: 'Code' },
  { cle: 'abrvOrg', titre: 'Abréviation' },
  { cle: 'libOrg', titre: 'Libellé' },
  { cle: 'natOrg', titre: 'Nature' },
  { cle: 'adrOrg', titre: 'Adresse' },
  { cle: 'telOrg', titre: 'Téléphone' },
  { cle: 'faxOrg', titre: 'Fax' },
  { cle: 'gsm', titre: 'GSM' },
  { cle: 'emailOrg', titre: 'Email' },
  { cle: 'identFsc', titre: 'Identifiant fiscal' },
];
/** Natures possibles d'un organisme (valeur enregistrée dans NAT_ORG + description affichée). */
const NATURES = [
  { code: 'ASSUREUR', libelle: 'Organisme assureur' },
  { code: 'PRETEUR', libelle: 'Organisme prêteur' },
  { code: 'FORMATEUR', libelle: 'Organisme d\'enseignement' },
];
const COLONNES_FILTRABLES = COLONNES.map(c => c.cle);

@Component({
  selector: 'app-param-organismes',
  templateUrl: './param-organismes.component.html',
  styleUrl: './param-organismes.component.scss'
})
export class ParamOrganismesComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  formOrganisme!: FormGroup;

  readonly longueurs = LONGUEURS;
  readonly colonnes = COLONNES;
  readonly natures = NATURES;

  listOrganismes: any[] = [];
  private listOrganismesComplete: any[] = [];

  chargementEnCours = true;
  erreurChargement = false;
  enregistrementEnCours = false;

  /** true : la fenêtre sert à ajouter un organisme ; false : à en modifier un (le code ne change alors pas). */
  modeAjout = true;
  codeModifie: number | null = null;

  searchz: { [colonne: string]: string } = Object.fromEntries(COLONNES_FILTRABLES.map(c => [c, '']));

  constructor(
    private fb: FormBuilder,
    private serv: AssurService,
    public service: PaginationService,
    private modalService: NgbModal,
  ) {
    const telephone = (max: number) => ['', [Validators.maxLength(max), Validators.pattern(MOTIF_TELEPHONE)]];
    this.formOrganisme = this.fb.group({
      libOrg: ['', [Validators.required, this.nonVide, Validators.maxLength(LONGUEURS.libOrg)]],
      abrvOrg: ['', [Validators.maxLength(LONGUEURS.abrvOrg)]],
      natOrg: ['', [Validators.required]],
      adrOrg: ['', [Validators.maxLength(LONGUEURS.adrOrg)]],
      telOrg: telephone(LONGUEURS.telOrg),
      faxOrg: telephone(LONGUEURS.faxOrg),
      gsm: telephone(LONGUEURS.gsm),
      emailOrg: ['', [Validators.maxLength(LONGUEURS.emailOrg), Validators.pattern(MOTIF_EMAIL)]],
      identFsc: ['', [Validators.maxLength(LONGUEURS.identFsc), Validators.pattern(MOTIF_IDENT_FISCALE)]],
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

  champEnErreur(nom: string): boolean {
    const c = this.formOrganisme.get(nom);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  // ---------- liste ----------

  charger(): void {
    this.serv.getAllOrganismes().subscribe({
      next: (data) => {
        this.listOrganismesComplete = data ?? [];
        this.erreurChargement = false;
        this.chargementEnCours = false;
        this.applyFilter();
      },
      error: (err) => {
        this.chargementEnCours = false;
        this.erreurChargement = true;
        notifErreur('Chargement impossible', err, 'La liste des organismes n’a pas pu être chargée.');
      },
    });
  }

  applyFilter(): void {
    this.listOrganismes = this.listOrganismesComplete.filter((ligne: any) =>
      Object.keys(this.searchz).every((cle) => {
        const recherche = (this.searchz[cle] ?? '').toString().trim().toLowerCase();
        // la nature se filtre aussi sur sa description (« enseignement » retrouve FORMATEUR)
        const brut = cle === 'natOrg' ? `${ligne[cle] ?? ''} ${this.libelleNature(ligne[cle])}` : (ligne[cle] ?? '');
        return brut.toString().toLowerCase().includes(recherche);
      }));
  }

  libelleNature(code: string | null): string {
    return this.natures.find(n => n.code === code)?.libelle ?? code ?? '';
  }

  get filtreActif(): boolean {
    return Object.values(this.searchz).some(v => !!v);
  }

  get totalOrganismes(): number {
    return this.listOrganismesComplete.length;
  }

  reinitialiserFiltres(): void {
    COLONNES_FILTRABLES.forEach(c => (this.searchz[c] = ''));
    this.applyFilter();
  }

  onSort(colonne: string): void {
    this.listOrganismes = this.service.onSort(colonne, this.listOrganismes);
  }

  // ---------- ajout / modification ----------

  ouvrirAjout(content: any): void {
    this.modeAjout = true;
    this.codeModifie = null;
    this.formOrganisme.reset(this.valeursVides());
    this.ouvrirFenetre(content, 'org-libelle');
  }

  ouvrirModification(ligne: any, content: any): void {
    this.modeAjout = false;
    this.codeModifie = ligne.codOrg;
    this.formOrganisme.reset({
      libOrg: ligne.libOrg ?? '',
      abrvOrg: ligne.abrvOrg ?? '',
      natOrg: ligne.natOrg ?? '',
      adrOrg: ligne.adrOrg ?? '',
      telOrg: ligne.telOrg ?? '',
      faxOrg: ligne.faxOrg ?? '',
      gsm: ligne.gsm ?? '',
      emailOrg: ligne.emailOrg ?? '',
      identFsc: ligne.identFsc ?? '',
    });
    this.ouvrirFenetre(content, 'org-libelle');
  }

  private valeursVides(): any {
    return { libOrg: '', abrvOrg: '', natOrg: '', adrOrg: '', telOrg: '', faxOrg: '', gsm: '', emailOrg: '', identFsc: '' };
  }

  private ouvrirFenetre(content: any, idChampFocus: string): void {
    const fenetre = this.modalService.open(content, { size: 'lg', centered: true, backdrop: 'static' });
    fenetre.shown.subscribe(() => document.getElementById(idChampFocus)?.focus());
  }

  enregistrer(modal: any): void {
    if (this.enregistrementEnCours) return;
    if (this.formOrganisme.invalid) {
      this.formOrganisme.markAllAsTouched();
      return;
    }
    const v = this.formOrganisme.getRawValue();
    const texte = (x: unknown) => String(x ?? '').trim() || null;
    const organisme = {
      libOrg: String(v.libOrg).trim(),
      abrvOrg: texte(v.abrvOrg)?.toUpperCase() ?? null,
      natOrg: String(v.natOrg),
      adrOrg: texte(v.adrOrg),
      telOrg: texte(v.telOrg),
      faxOrg: texte(v.faxOrg),
      gsm: texte(v.gsm),
      emailOrg: texte(v.emailOrg),
      identFsc: texte(v.identFsc)?.toUpperCase() ?? null,
    };
    const ajout = this.modeAjout;
    this.enregistrementEnCours = true;
    const appel = ajout
      ? this.serv.addOrganisme(organisme)
      : this.serv.updateOrganisme(this.codeModifie as number, organisme);
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
    const abreviation = ligne.abrvOrg ? ` (${echapperHtml(ligne.abrvOrg)})` : '';
    confirmerSuppression('Supprimer cet organisme ?',
      `Code <b>${echapperHtml(ligne.codOrg)}</b> – ${echapperHtml(ligne.libOrg)}${abreviation}`).then((confirme) => {
      if (!confirme) return;
      this.serv.deleteOrganisme(ligne.codOrg).subscribe({
        next: () => {
          notifSucces(MSG_SUPPR);
          this.charger();
        },
        error: (err) => notifErreur('Suppression impossible', err, MSG_SUPPR_IMPOSSIBLE),
      });
    });
  }
}
