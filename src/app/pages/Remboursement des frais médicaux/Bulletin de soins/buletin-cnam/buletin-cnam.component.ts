import { inject } from '@angular/core';
import { LovServeurService } from 'src/app/shared/Service/lov-serveur.service';
import { Component, ViewChild, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { LovComponent } from 'src/app/shared/Composants/lov/lov.component';
import { DatePipe } from '@angular/common';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { BulletinSoinService } from '../bulletin-soin.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SaveService } from 'src/app/shared/Service/save.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaginationService } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { distinctUntilChanged, forkJoin, map, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Table } from 'primeng/table';
import { CarteCnamAlertService } from '../../../Adherent/carte-cnam-alert.service';
import { focusPremiereCase } from '../../../../shared/focus-nouvelle-ligne';

/** Régime de remboursement d'un nouveau bulletin : 01 = Maladie ordinaire (REGIME_REMB). */
const REGIME_PAR_DEFAUT = '01';

@Component({
  selector: 'app-buletin-cnam',
  templateUrl: './buletin-cnam.component.html',
  styleUrl: './buletin-cnam.component.scss'
})
export class BuletinCNAMComponent {
  private readonly lovServeur = inject(LovServeurService);
  /** Personnel de la fenêtre de recherche, lu page par page sur le serveur (même liste que getPersonnelBultSoin). */
  readonly sourcePersonnel = this.lovServeur.source('Remb/Personnel/lovPersonnelBultSoin', () => ({ soc: this.lovServeur.societe(), cols: 'mat_pers,dat_nais,nom,num_retr,lib_fill' }), 'mat_pers');

  @ViewChildren(LovComponent) lovs!: QueryList<LovComponent>;
  @ViewChild('dtActes') tableActes!: Table;
  @ViewChild('dtPhar') tablePhar!: Table;
  @ViewChild('dtVisite') tableVisite!: Table;
  @ViewChild('dtApp') tableApp!: Table;
  formBuletinSoin!: FormGroup
  ligPretForm!: FormGroup
  ligPharForm!: FormGroup
  ligVisiteForm!: FormGroup
  ligAppareilForm!: FormGroup

  listPersonnel: any[] = []
  listAdherent: any[] = []
  breadCrumbItems!: Array<{}>;

  listBultSoin: any[] = []
  listActe: any[] = []
  listMed: any[] = []
  listRegimeRemb: any[] = []
  listPEC: any[] = []
  listRefEtablis: any[] = []
  listRefEtablisVisit: any[] = []
  listRefEtablisMed: any[] = []
  listRefEtablisApp: any[] = []
  listVisite: any[] = []
  listAppareil: any[] = []
  ligBult: any[] = []


  columnsMat: any[] = []
  columnsAdherent: any[] = []
  columnsBultSoin: any[] = []
  columnActe: any[] = []
  columnsMed: any[] = []
  columnsPEC: any[] = []
  columnsRefEtablis: any[] = []
  columnsRefEtablisVisit: any[] = []
  columnsRefEtablisMed: any[] = []
  columnsRefEtablisApp: any[] = []
  columnVisite: any[] = []
  columnsAppareil: any[] = []

  matricule: string = ''
  numFam: string = ''
  numAssur: string = ''
  nomPers: string = ''
  codAssur: string = ''
  libAssur: string = ''
  cod_fil: string = ''
  lib_fill: string = ''
  lib_assur: string = ''
  num_retr: string = ''
  cod_retr: string = ''
  nomAdherent: string = ''
  datNais: string = ''
  ageAn: string = ''
  ageMois: string = ''
  soldPlafond: string = ''
  soldPlafondEstim: string = '0.000'
  sexe: string = ''
  parente: string = ''
  PEC: string = ''
  etabliss: string = ''
  datPec: string = ''
  acte: string[] = []
  /** Acte exact choisi pour chaque ligne (abrv_act n'est pas unique : « BP » = 996 actes). */
  acteChoisi: any[] = []
  visiteCode: string[] = []
  appareilCode: string[] = []
  Med: string[] = []
  /** Liste « Code maladie » : maladies des dossiers maladie du bénéficiaire (pas les médicaments). */
  listMaladie: any[] = []
  columnsMaladie: any[] = [
    { key: "cod_malad", label: "Code maladie" },
    { key: "lib_malad", label: "Libellé" },
    { key: "num_dos_mld", label: "Numéro dossier" },
  ]
  codMalad: string = ''
  libMalad: string = ''
  numDosMld: string = ''
  refEtablisVisit: string[] = []
  refEtablis: string[] = []
  refEtablisPhar: string[] = []
  refEtablisApp: string[] = []
  mntNet: number = 0
  mntNetPhar: string = ''
  deleteId: any;
  isDisabled!: boolean;

  isSearch: boolean = true;
  selectedActes: any[] = []
  selectedPhar: any[] = []
  selectedVisites: any[] = []
  selectedApps: any[] = []


  reponseVerifModRemb: any
  showMsgMalad!: boolean
  showMsgDatAccouch!: boolean
  showMsgPriseCharge!: boolean


  constructor(private token: TokenStorageService, private serv: BulletinSoinService, private fb: FormBuilder, private saveService: SaveService, private modalService: NgbModal,
    public service: PaginationService, private cdr: ChangeDetectorRef, private carteCnamAlert: CarteCnamAlertService, private datePipe: DatePipe) {
    this.formBuletinSoin = this.fb.group({
      cod_soc: [this.token.getUser().codSoc],
      mat_pers: [''],
      num_fam: [''],
      dat_soin: [''],
      cod_bord: [''],
      cod_assur: [{ value: '', disabled: true }],
      num_soin: [''],
      ord_bult: [''],
      tot_honor: [0],
      tot_net: [0],
      tot_remb: [0],
      // régime par défaut d'un nouveau bulletin : Maladie ordinaire (01), modifiable ensuite
      reg_remb: [REGIME_PAR_DEFAUT],
      cod_malad: [''],
      num_pec: [''],
      cod_fil: [{ value: '', disabled: true }],
      num_assur: [{ value: '', disabled: true }],
      dat_prev_accouch: [''],
      nat_bult: [{ value: 'C', disabled: true }],
      mat_pers_conj: [''],
      num_ass_conj: [''],
      dat_saisie: [{ value: '', disabled: true }],
      obs: [''],
      obs_a: [''],
      envoi: [''],
      ann_plaf_imp: [''],
      reg_adh: [''],
      mod_pay: [''],
      dat_vir: [''],

    })


    this.ligPretForm = this.fb.group({
      lignes: this.fb.array([]) // Tableau dynamique des détails
    });
    this.ligPharForm = this.fb.group({
      phar: this.fb.array([]) // Tableau dynamique des détails
    });
    this.ligVisiteForm = this.fb.group({
      visite: this.fb.array([]) // Tableau dynamique des détails
    });
    this.ligAppareilForm = this.fb.group({
      appareil: this.fb.array([]) // Tableau dynamique des détails
    });


  }


  private destroy$ = new Subject<void>()

  ngOnInit() {
    // Initialize all arrays to prevent iteration errors
    this.listActe = [];
    this.listMed = [];
    this.listVisite = [];
    this.listAppareil = [];
    this.listRefEtablis = [];
    this.listRefEtablisVisit = [];
    this.listRefEtablisMed = [];
    this.listRefEtablisApp = [];

    // Continue with existing initialization
    this.getPersonnel();
    this.getRegimeRemb();
    this.getBultSoin();
    this.calculerTotaux();

    this.saveService.registerSaveCallback(() => this.addBultSoin());

    // Contrôle de la date de soin (plafond, âge, durée de vie du bulletin) déclenché dès que la date est complète,
    // quelle que soit la façon de la saisir (clavier ou calendrier) : ne dépend plus de l'événement « change » du champ.
    const datSoinCtrl = this.formBuletinSoin.get('dat_soin');
    datSoinCtrl?.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((v: any) => {
        const digits = String(v ?? '').replace(/\D/g, '');
        if (digits.length !== 8 || digits === this.lastDatSoinControle) {
          if (digits.length !== 8) this.lastDatSoinControle = '';
          return;
        }
        this.lastDatSoinControle = digits;
        const target = {
          // toujours au format jj/mm/aaaa, attendu par le serveur
          get value() { return `${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4, 8)}`; },
          // date refusée par un contrôle : on vide le champ
          set value(x: any) { datSoinCtrl.setValue(x, { emitEvent: false }); },
        };
        this.controleDatSoin({ target });
      });
    // Onglet « Consultation actes Mut » : actes mutuelle du même bénéficiaire à la même date de soin, rechargés dès que
    // le bénéficiaire ou la date change (avant, ils ne l'étaient qu'au contrôle d'une nouvelle date : la liste d'un
    // bulletin précédent restait affichée en passant à un bulletin de même date)
    this.formBuletinSoin.valueChanges
      .pipe(
        map(() => [this.formBuletinSoin.get('cod_soc')?.value, this.formBuletinSoin.get('mat_pers')?.value,
          this.formBuletinSoin.get('num_fam')?.value, this.dateSoinComplete()].map(v => String(v ?? '').trim()).join('|')),
        distinctUntilChanged(),
        debounceTime(300),
        takeUntil(this.destroy$))
      .subscribe(() => this.chargerActesMutuelle());
    // Date de soin saisie : les dates des visites, pharmacies, actes et appareils se remplissent avec la même date.
    // Une date modifiée à la main reste inchangée (seules les lignes vides ou encore égales à l'ancienne date de soin suivent).
    datSoinCtrl?.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((v: any) => {
        const nouvelle = this.dateSoinComplete(v);
        if (!nouvelle || nouvelle === this.datSoinPropagee) return;
        const ancienne = this.datSoinPropagee;
        this.datSoinPropagee = nouvelle;
        for (const tableau of [this.lignes, this.phar, this.visite, this.appareil]) {
          tableau.controls.forEach(ligne => {
            const ctrl = ligne.get('dat_act');
            const actuelle = String(ctrl?.value ?? '').trim();
            if (ctrl && (!actuelle || actuelle === ancienne)) {
              ctrl.setValue(nouvelle);
            }
          });
        }
      });
    this.saveService.isSearch$
      .pipe(takeUntil(this.destroy$))
      .subscribe((canSearch) => {
        this.isSearch = canSearch
      })

    this.saveService.add$.subscribe((reset) => {
      if (reset) {
        this.resetForm();
      }
    });
  }

  // ngOnDestroy
  ngOnDestroy() {
    // Clear the callback to avoid memory leaks

    this.destroy$.next();
    this.destroy$.complete();
    this.saveService.clearSaveCallback();
  }

  /** Vrai pendant qu'un enregistrement est en cours : un second clic sur « Enregistrer » est ignoré. */
  private enregistrementEnCours = false;

  // addBultSoin
  addBultSoin() {
    if (this.enregistrementEnCours) {
      return;
    }

    if (!this.formBuletinSoin.valid) {
      Swal.fire('Formulaire invalide', 'Veuillez remplir le formulaire', 'warning');
      return;
    }

    // ligne d'acte commencée mais incomplète : elle ne serait pas enregistrée, sans que l'utilisateur le sache
    const actesIncompletes = this.lignesActesIncompletes();
    const appareilsIncomplets = this.lignesAppareilsIncompletes();
    const visitesIncompletes = this.lignesIncompletes(this.visite, 'cod_visit', ['mnt_honor', 'prf_cod']);
    const medicamentsIncomplets = this.lignesIncompletes(this.phar, 'cod_med', ['mnt_honor', 'indice', 'prf_cod']);
    if (actesIncompletes.length || appareilsIncomplets.length || visitesIncompletes.length || medicamentsIncomplets.length) {
      const detail = (n: number[], onglet: string, champ: string) => n.length
        ? `<li>${onglet} : ${n.length > 1 ? 'lignes' : 'ligne'} n° <b>${n.join(', ')}</b> (${champ} obligatoires)</li>` : '';
      Swal.fire({
        icon: 'warning',
        title: 'Lignes incomplètes',
        html: 'Complétez ou supprimez :<ul class="text-start mt-2 mb-0">'
          + detail(actesIncompletes, '« Les actes »', 'acte et date d\'acte')
          + detail(appareilsIncomplets, '« Les appareils »', 'appareil et date')
          + detail(visitesIncompletes, '« Les visites »', 'visite et date')
          + detail(medicamentsIncomplets, '« Pharmacies »', 'médicament et date')
          + '</ul>',
        confirmButtonText: 'Compris',
      });
      return;
    }

    const formArrays = [
      this.ligVisiteForm.get('visite') as FormArray,
      this.ligPharForm.get('phar') as FormArray,
      this.ligPretForm.get('lignes') as FormArray,
      this.ligAppareilForm.get('appareil') as FormArray
    ];

    const hasValidData = formArrays.some(arr =>
      arr.controls.some(ctrl => ctrl.valid)
    );



    /* ---------- Helpers ---------- */

    const toNullIfEmpty = (v: any) =>
      v === '' || v === undefined ? null : v;

    const formatDate = (d: any): string | null => {
      if (!d) return null;
      if (typeof d === 'string') {
        if (d.includes('/')) return d;
        if (d.length === 8 && /^\d{8}$/.test(d)) {
          return `${d.substring(0, 2)}/${d.substring(2, 4)}/${d.substring(4, 8)}`;
        }
      }
      const date = new Date(d);
      if (isNaN(date.getTime())) return null;
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };

    /* ---------- Prepare lines ---------- */

    formArrays.forEach(array => {
      array.controls.forEach((fg: AbstractControl) => {
        if (fg instanceof FormGroup) {
          fg.patchValue({
            mat_pers: this.formBuletinSoin.get('mat_pers')?.value,
            num_fam: this.formBuletinSoin.get('num_fam')?.value,
            dat_soin: formatDate(this.formBuletinSoin.get('dat_soin')?.value),
            dat_act: formatDate(fg.get('dat_act')?.value)
          });
        }
      });
    });

    /* ---------- HEADER (IMPORTANT FIX) ---------- */

    const rawHeader = this.formBuletinSoin.getRawValue(); // ✅ FIX

    const header = {
      ...rawHeader,
      cod_soc: this.token.getUser().codSoc,
      nat_bult: 'C',
      envoi: 'N',
      reg_remb: rawHeader.reg_remb,  // ✅ FIX: Use form value instead of hardcoded '01'
      dat_saisie: formatDate(rawHeader.dat_saisie ?? new Date()),
      dat_soin: formatDate(rawHeader.dat_soin),
      dat_vir: formatDate(rawHeader.dat_vir)
    };

    // Convert empty strings → null
    Object.keys(header).forEach(k => header[k] = toNullIfEmpty(header[k]));


    /* ---------- SAVE HEADER ---------- */

    this.enregistrementEnCours = true;
    this.serv.addBultSoin(header).subscribe({

      next: (saved: any) => {
        // number generated by the backend (new bulletin) or the existing one (update)
        const numSoin = saved?.num_soin ?? header.num_soin;

        if (numSoin === null || numSoin === undefined) {
          this.enregistrementEnCours = false;
          Swal.fire('Erreur', 'Le numéro de soin n\'a pas été renvoyé par le serveur', 'error');
          return;
        }

        // keep it in the form so the screen shows it
        this.formBuletinSoin.patchValue({ num_soin: numSoin });

        const clean = (obj: any, remove: string[] = []) => {
          const o = { ...obj };
          remove.forEach(f => delete o[f]);
          Object.keys(o).forEach(k => o[k] = toNullIfEmpty(o[k]));
          o.num_soin = numSoin;      // every line carries the bulletin's num_soin
          return o;
        };

        const ctrlVisites = formArrays[0].controls.filter(c => c.valid);
        const ctrlActs = formArrays[2].controls.filter(c => c.valid);
        const ctrlMeds = formArrays[1].controls.filter(c => c.valid);
        const ctrlApps = formArrays[3].controls.filter(c => c.valid);

        const visites = ctrlVisites.map(c => clean(c.value));
        const acts = ctrlActs.map(c => clean(c.value, ['nbr_piece', 'nbr_vign', 'obs']));
        const meds = ctrlMeds.map(c => clean(c.value, ['nbr_piece', 'nbr_vign', 'obs']));
        const apps = ctrlApps.map(c => clean(c.value));

        // Chaque ligne enregistrée garde le numéro de ligne attribué par le serveur et le numéro de soin :
        // un second enregistrement met alors la même ligne à jour au lieu d'en créer une copie.
        const memoriser = (controles: AbstractControl[], reponse: any) => {
          if (!Array.isArray(reponse)) return;
          controles.forEach((c, i) => {
            const ligne = reponse[i];
            if (ligne) {
              c.patchValue({ num_lig: ligne.num_lig, num_soin: numSoin });
            }
          });
        };

        // lignes d'actes déjà enregistrées dont l'acte ou la date a changé : leur clé en base change. L'ancienne ligne est
        // supprimée avant l'enregistrement (sinon une seconde ligne serait créée et l'ancienne resterait dans les soldes)
        const suppressions = [
          ...this.clesActesModifiees(ctrlActs).map(k => this.serv.deleteLigBultAct(
            k.cod_soc, k.mat_pers, k.num_fam, k.dat_soin, k.abrv_act, k.num_lig, k.dat_act, k.cod_act, k.num_soin)),
          // même chose pour les appareils dont l'appareil ou la date a changé
          ...this.clesAppareilsModifiees(ctrlApps).map(k => this.serv.deleteLigBultApp(
            k.cod_soc, k.mat_pers, k.num_fam, k.dat_soin, k.abrv_act, k.num_lig, k.cod_app, k.num_soin, k.dat_act)),
          // visites et médicaments dont la visite / le médicament ou la date a changé
          ...this.clesLignesModifiees(ctrlVisites, 'cod_visit').map(k => this.serv.deleteLigBultVisit(
            k.cod_soc, k.mat_pers, k.num_fam, k.dat_soin, k.abrv_act, k.num_lig, k.dat_act, k.cod_visit, k.num_soin)),
          ...this.clesLignesModifiees(ctrlMeds, 'cod_med').map(k => this.serv.deleteLigBultMed(
            k.cod_soc, k.mat_pers, k.num_fam, k.dat_soin, k.abrv_act, k.num_lig, k.cod_med, k.num_soin, k.dat_act)),
        ];

        (suppressions.length ? forkJoin(suppressions) : of([])).pipe(
          switchMap(() => this.serv.addAllLigBult(visites, acts, meds, apps))
        ).subscribe({
          next: (res: any) => {
            this.enregistrementEnCours = false;
            memoriser(ctrlVisites, res?.visit);
            if (Array.isArray(res?.visit)) ctrlVisites.forEach((c, i) => { if (res.visit[i]) this.memoriserEnBase(c, 'cod_visit'); });
            memoriser(ctrlActs, res?.act);
            // nouvelle clé en base des lignes d'actes enregistrées
            if (Array.isArray(res?.act)) {
              ctrlActs.forEach((c, i) => {
                if (!res.act[i]) return;
                this.cleOrigineActe.set(c, this.cleActe(c.value));
                this.netEnBaseActe.set(c, Number(c.value.mnt_net) || 0);
              });
            }
            memoriser(ctrlMeds, res?.med);
            if (Array.isArray(res?.med)) ctrlMeds.forEach((c, i) => { if (res.med[i]) this.memoriserEnBase(c, 'cod_med'); });
            memoriser(ctrlApps, res?.app);
            // nouvelle clé en base des appareils enregistrés
            if (Array.isArray(res?.app)) {
              ctrlApps.forEach((c, i) => { if (res.app[i]) this.cleOrigineApp.set(c, this.cleApp(c.value)); });
            }
            const echecs = Object.values(res || {}).filter((r: any) => r?.error).map((r: any) => r.message);
            if (echecs.length) {
              Swal.fire('Enregistrement incomplet', 'Échec de l\'enregistrement : ' + echecs.join(', '), 'error');
              this.getBultSoin();
              return;
            }
            Swal.fire('Succès', 'Bulletin enregistré avec succès', 'success');
            // le formulaire reste rempli : il ne se vide que par « Retour » ou « Nouveau » de la barre d'outils
            this.getBultSoin();
          },
          error: () => {
            this.enregistrementEnCours = false;
            this.showServerError();
          }
        });
      },

      error: () => {
        this.enregistrementEnCours = false;
        this.showServerError();
      }
    });
  }

  resetForm() {
    // vide aussi les champs code des sélecteurs (Matricule, Prestataire, établissements…)
    this.lovs?.forEach(l => l.clear());
    this.ligPretForm.reset();
    this.ligPharForm.reset();
    this.formBuletinSoin.reset({ reg_remb: REGIME_PAR_DEFAUT });
    this.ligAppareilForm.reset();
    this.ligVisiteForm.reset();

    this.matricule = '';
    this.numFam = '';
    this.nomPers = '';
    this.lib_assur = '';
    this.lib_fill = '';
    this.nomAdherent = '';
    this.datNais = '';
    this.ageAn = '';
    this.ageMois = '';
    this.PEC = '';
    this.etabliss = '';
    this.datPec = '';
    this.soldPlafond = '';
    this.soldPlafondEstim = '';
    this.num_retr = '';
    this.cod_retr = '';
    this.refEtablis = [];
    this.refEtablisApp = [];
    this.refEtablisPhar = [];
    this.refEtablisVisit = [];
    this.etab_rsoc_visite = [];
    this.etab_rsoc = [];
    this.etab_rsoc_phar = [];
    this.etab_rsoc_appareil = [];
    this.acte = [];
    this.acteChoisi = [];
    this.libAct = [];
    this.refEtablis = [];
    this.etab_rsoc = [];
    this.Med = [];
    this.datSoinPropagee = '';
    this.listMaladie = [];
    this.codMalad = '';
    this.libMalad = '';
    this.numDosMld = '';
    this.visiteCode = [];
    this.appareilCode = [];
    this.libAppareil = [];
    this.libMed = [];
    this.libVisite = [];
    this.lignes.clear();
    this.phar.clear();
    this.appareil.clear();
    this.visite.clear();

    this.formBuletinSoin.patchValue({
      dat_saisie: new Date().toLocaleDateString().substring(0, 10),
      nat_bult: 'C',
      cod_soc: this.token.getUser().codSoc
    });

    this.addLigne(0);
    this.addLignePhar(0);
    this.addLigneVisite();
    this.addLigneAppareil(0);
  }

  // Fonction pour afficher une erreur en cas d'échec de l'appel API
  private showServerError() {
    Swal.fire({
      icon: 'error',
      title: 'Erreur serveur',
      text: 'Une erreur inattendue est survenue lors de l\'ajout.',
      confirmButtonText: 'OK'
    });
  }

  getBultSoin() {
    this.serv.getBultCnam(this.token.getUser().codSoc).subscribe((data: any) => {
      this.listBultSoin = data
      this.columnsBultSoin = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "num_fam", label: "Num fam" },
        { key: "dat_soin", label: "Date soin" },
      ]
    })
  }

  search(item: any) {
    this.matricule = item.mat_pers
    this.PEC = item.num_pec

    this.nomAdherent = '';
    this.serv.getAdherent(this.token.getUser().codSoc, item.mat_pers).subscribe((data: any) => {
      this.listAdherent = Array.isArray(data) ? data : [];
      this.numFam = item.num_fam;

      // Patch name if num_fam is present
      if (item.num_fam !== null && item.num_fam !== undefined) {
        const adherent = this.listAdherent.find(a => a.num_fam == item.num_fam);
        if (adherent) {
          this.nomAdherent = adherent.nom_pren;

          // Récupérer la date de naissance
          this.datNais = adherent.dat_nais;
        }
      }
    })

    this.formBuletinSoin.patchValue({
      cod_soc: item.cod_soc,
      mat_pers: item.mat_pers,
      num_fam: item.num_fam,
      dat_soin: item.dat_soin,
      cod_bord: item.cod_bord,
      cod_assur: item.cod_assur,
      num_soin: item.num_soin,
      ord_bult: item.ord_bult,
      tot_honor: item.tot_honor,
      tot_net: item.tot_net,
      tot_remb: item.tot_remb,
      reg_remb: item.reg_remb,
      cod_malad: item.cod_malad,
      num_pec: item.num_pec,
      cod_fil: item.cod_fil,
      num_assur: item.num_assur,
      dat_prev_accouch: item.dat_prev_accouch,
      nat_bult: item.nat_bult,
      mat_pers_conj: item.mat_pers_conj,
      num_ass_conj: item.num_ass_conj,
      dat_saisie: item.dat_saisie,
      obs: item.obs,
      obs_a: item.obs_a,
      envoi: item.envoi,
      ann_plaf_imp: item.ann_plaf_imp,
      reg_adh: item.reg_adh,
      mod_pay: item.mod_pay,
      dat_vir: item.dat_vir,
    })

    // les lignes chargées gardent leurs dates : pas de propagation de la date de soin du bulletin ouvert
    this.datSoinPropagee = this.dateSoinComplete();

    // Maladie du bulletin : libellé et numéro de dossier à partir des dossiers maladie du bénéficiaire
    this.codMalad = item.cod_malad ?? '';
    this.chargerMaladies(item.cod_soc, item.mat_pers, item.num_fam);

    // 🔥 FIX: Load medicine list FIRST, then load the table data
    this.serv.getMeds(item.cod_fil, item.cod_assur).subscribe((medData: any) => {
      this.listMed = medData;
      this.columnsMed = [
        { key: "cod_med", label: "Code" },
        { key: "lib_med", label: "Libelle" },
        { key: "med_prix", label: "Mdc Prix" },
      ];

      // Now load the pharmacy data AFTER medicines are loaded
      this.serv.getLigBultMed(item.cod_soc, item.mat_pers, item.num_fam, item.dat_soin, item.num_soin).subscribe((data: any) => {
        this.loadDataIntoTableMed(data);
        this.calculateTotalsPhar();
      });
    });

    // Load actes
    // les actes dépendent du sexe et de la parenté du bénéficiaire de CE bulletin : on les lit avant de demander la liste
    this.serv.getSexe(this.token.getUser().codSoc, item.mat_pers, item.num_fam).subscribe((sx: any) => {
      this.sexe = sx?.sexe || '';
      this.parente = sx?.parente || '';
      this.serv.getActes(this.parente, this.sexe, item.cod_fil, item.num_assur).subscribe((acteList: any) => {
        this.listActe = acteList; // ✅ Store the master list
  
        this.columnActe = [
          { key: "abrv_act", label: "Abrv acte" },
          { key: "cod_act", label: "Code acte" },
          { key: "lib_act", label: "Libelle" },
          { key: "cot_act", label: "Cotisation" },
        ];
  
        // Now load the saved actes from database
        this.serv.getLigBultAct(item.cod_soc, item.mat_pers, item.num_fam, item.dat_soin, item.num_soin).subscribe((data: any) => {
          // DON'T overwrite this.listActe here!
          this.loadDataIntoTable(data);
        });
      });

      // visites : la liste dépend aussi du sexe et de la parenté du bénéficiaire. Elle est chargée AVANT les lignes
      // enregistrées (leurs libellés y sont cherchés) ; avant, elle ne l'était qu'au choix du prestataire, si bien qu'à
      // l'ouverture d'un bulletin la loupe Visite était vide (ou celle du bénéficiaire précédent) et les libellés absents
      this.chargerVisites(item);
    }, () => {
      this.sexe = '';
      this.parente = '';
      this.chargerVisites(item);
    });

    // appareils : même chose, liste chargée avant les lignes enregistrées
    this.serv.getAppareil(item.cod_fil, item.cod_assur).subscribe({
      next: (data: any) => {
        this.listAppareil = Array.isArray(data) ? data : [];
        this.columnsAppareil = [
          { key: "cod_app", label: "Code" },
          { key: "lib_app", label: "Libelle" },
        ];
      },
      error: () => { this.listAppareil = []; },
    }).add(() => {
      this.serv.getLigBultApp(item.cod_soc, item.mat_pers, item.num_fam, item.dat_soin, item.num_soin).subscribe((data: any) => {
        this.loadDataIntoTablApp(data);
        this.calculateTotalsAppareil();
      });
    });

    this.serv.getDatNais(
      this.token.getUser().codSoc,
      item.mat_pers,
      item.num_fam
    ).subscribe((data: any) => {
    
      this.datNais = this.datePipe.transform(data?.dat_nais, 'dd/MM/yyyy') || '';
    
      if (!this.datNais) {
        console.error("Date de naissance introuvable");
        return;
      }
    
      // Maintenant la date existe réellement
      this.serv.get_plafond_cnam(
        this.token.getUser().codSoc,
        item.mat_pers,
        item.dat_soin,
        this.datNais,
        item.cod_assur,
        item.dat_saisie
      ).subscribe((data: any) => {
        this.ageAn = data.ageAn;
        this.ageMois = data.ageMois;
        this.soldPlafond = Number(data.soldPlafond).toFixed(3);
        const val = Number(data.soldPlafondEstim);
        this.soldPlafondEstim = isNaN(val) ? '0.000' : val.toFixed(3);
      });
    });

  }

  /** Liste des visites du bénéficiaire (sexe, parenté, filière, assurance), puis les visites enregistrées du bulletin. */
  private chargerVisites(item: any): void {
    this.serv.getVisite(this.parente, this.sexe, item.cod_fil, item.cod_assur).subscribe({
      next: (data: any) => {
        this.listVisite = Array.isArray(data) ? data : [];
        this.columnVisite = [
          { key: "cod_Visit", label: "Abrv acte" },
          { key: "lib_Visit", label: "Libelle" },
        ];
      },
      error: () => { this.listVisite = []; },
    }).add(() => {
      this.serv.getLigBultVisit(item.cod_soc, item.mat_pers, item.num_fam, item.dat_soin, item.num_soin).subscribe((data: any) => {
        this.loadDataIntoTableVisite(data);
        this.calculateTotalsVisite();
      });
    });
  }

  loadDataIntoTable(data: any[]) {
    // Clear existing arrays first
    this.acte = [];
    this.acteChoisi = [];
    this.libAct = [];
    this.refEtablis = [];
    this.etab_rsoc = [];
    this.mntNetArray = [];

    // If no data, add an empty line
    if (!data || data.length === 0) {
      this.ligPretForm.setControl('lignes', this.fb.array([]));
      this.addLigne(0);
      return;
    }

    const observables = data.map((item: any) =>
      this.serv.getRefPhysique(item.prf_typ).pipe(
        map((refData: any) => ({ item, refData }))
      )
    );

    forkJoin<{ item: any; refData: any; }[]>(observables).subscribe((results) => {
      if (results.length > 0) {
        this.listRefEtablis = results[0].refData || [];
        this.columnsRefEtablis = [
          { key: "prf_cod", label: "Code" },
          { key: "etab_rsoc", label: "Nom & Prénom" },
          { key: "met_etab", label: "Etablis" },
        ];

        // Populate all arrays properly
        results.forEach(({ item, refData }) => {
          // Store the acte code
          this.acte.push(item.abrv_act);

          // Find and store the lib_act from listActe
          // abrv_act n'est pas unique (ex. « BP » : des centaines d'actes) : on cherche d'abord avec le code acte
          const acteExact = this.listActe.find(acte => acte.abrv_act === item.abrv_act && acte.cod_act === item.cod_act);
          const selectedActe = acteExact ?? this.listActe.find(acte => acte.abrv_act === item.abrv_act);
          this.libAct.push((selectedActe?.lib_act || '').trim());
          // acte exact de la ligne, redonné au champ code : il ne doit pas être remplacé par le premier « BP » de la liste
          this.acteChoisi.push(acteExact ?? {
            abrv_act: item.abrv_act, cod_act: item.cod_act, lib_act: selectedActe?.lib_act ?? '',
            let_cod: item.let_cod, cot_act: item.cot_act, act_prix: item.act_prix, taux_act: item.taux_act,
          });

          // Store the etablissement code
          this.refEtablis.push(item.prf_cod);

          // Find and store the etab_rsoc
          const selectedEtab = refData.find((etablis: any) => etablis.prf_cod === item.prf_cod);
          this.etab_rsoc.push(selectedEtab?.etab_rsoc || '');

          // Store the mnt_net
          this.mntNetArray.push(Number(item.mnt_net));
        });
      }

      this.ligPretForm.setControl(
        'lignes',
        this.fb.array(
          results.map(({ item }) => this.fb.group({
            cod_soc: [item.cod_soc],
            mat_pers: [item.mat_pers],
            num_fam: [item.num_fam],
            dat_soin: [item.dat_soin],
            abrv_act: [item.abrv_act],
            cod_act: [item.cod_act],
            num_lig: [item.num_lig],
            let_cod: [item.let_cod],
            cot_act: [item.cot_act],
            act_prix: [item.act_prix],
            mnt_honor: [Number(item.mnt_honor).toFixed(3)],
            mnt_remb: [item.mnt_remb == null ? null : Number(item.mnt_remb).toFixed(3)],   // vide reste vide (et non 0)
            accord_act: [item.accord_act],
            mnt_net: [Number(item.mnt_net).toFixed(3)],
            indice: [item.indice],
            dat_act: [item.dat_act],
            prf_typ: [item.prf_typ],
            prf_cod: [item.prf_cod],
            mut_mnt_net: [item.mut_mnt_net],
            num_pec_act: [item.num_pec_act],
            taux_act: [item.taux_act],
            typ_prf: [item.typ_prf],
            num_soin: [item.num_soin],
          }))
        )
      );
      // clé en base de chaque ligne chargée (pour la retrouver si l'acte ou la date de la ligne change)
      this.lignes.controls.forEach(c => {
        this.cleOrigineActe.set(c, this.cleActe(c.value));
        this.netEnBaseActe.set(c, Number(c.value.mnt_net) || 0);
      });
      this.calculateTotals();
    });
  }

  loadDataIntoTableVisite(data: any) {
    // Clear existing arrays first
    this.visiteCode = [];
    this.libVisite = [];
    this.refEtablisVisit = [];
    this.etab_rsoc_visite = [];
    this.mntNetArrayVisite = [];

    // If no data, add an empty line
    if (!data || data.length === 0) {
      this.ligVisiteForm.setControl('visite', this.fb.array([]));
      this.addLigneVisite();
      return;
    }

    const observables = data.map((item: any) =>
      this.serv.getRefPhysique(item.prf_typ).pipe(
        tap((response: any) => {
          this.listRefEtablisVisit = response;
          this.columnsRefEtablisVisit = [
            { key: "prf_cod", label: "Code" },
            { key: "etab_rsoc", label: "Nom & Prénom" },
            { key: "met_etab", label: "Etablis" },
          ];
          this.visiteCode.push(item.cod_visit);
          this.refEtablisVisit.push(item.prf_cod);
        })
      )
    );

    forkJoin(observables).subscribe(() => {
      // Populate libVisite and etab_rsoc_visite arrays
      data.forEach((item: any) => {
        const selectedVisite = this.listVisite.find(visite => visite.cod_Visit === item.cod_visit);
        this.libVisite.push(selectedVisite?.lib_Visit || '');

        const selectedEtab = this.listRefEtablisVisit.find(etablis => etablis.prf_cod === item.prf_cod);
        this.etab_rsoc_visite.push(selectedEtab?.etab_rsoc || '');

        this.mntNetArrayVisite.push(Number(item.mnt_net));
      });

      this.ligVisiteForm.setControl('visite', this.fb.array(data.map((item: any) => this.fb.group({
        cod_soc: [item.cod_soc],
        mat_pers: [item.mat_pers],
        num_fam: [item.num_fam],
        dat_soin: [item.dat_soin],
        abrv_act: [item.abrv_act],
        cod_visit: [item.cod_visit],
        num_soin: [item.num_soin],
        num_lig: [item.num_lig],
        mnt_honor: [Number(item.mnt_honor).toFixed(3)],
        mnt_remb: [item.mnt_remb == null ? null : Number(item.mnt_remb).toFixed(3)],   // vide reste vide (et non 0)
        mnt_net: [Number(item.mnt_net).toFixed(3)],
        indice: [item.indice],
        dat_act: [item.dat_act],
        prf_typ: [item.prf_typ],
        prf_cod: [item.prf_cod],
        prix_visit: [item.prix_visit],
        taux_remb: [item.taux_remb],
        mut_mnt_net: [item.mut_mnt_net],
      }))));

      // clé et net en base de chaque visite chargée
      this.visite.controls.forEach(c => this.memoriserEnBase(c, 'cod_visit'));
      this.calculateTotalsVisite();
    });
  }

  loadDataIntoTableMed(data: any) {
    // Clear existing arrays first
    this.Med = [];
    this.libMed = [];
    this.refEtablisPhar = [];
    this.etab_rsoc_phar = [];
    this.mntNetArrayPhar = [];

    // If no data, add an empty line (SAME AS ACTES)
    if (!data || data.length === 0) {
      this.ligPharForm.setControl('phar', this.fb.array([]));
      this.addLignePhar(0);
      return;
    }

    const observables = data.map((item: any) =>
      this.serv.getRefPhysique(item.prf_typ).pipe(
        tap((response: any) => {
          this.listRefEtablisMed = response;
          this.columnsRefEtablisMed = [
            { key: "prf_cod", label: "Code" },
            { key: "etab_rsoc", label: "Nom & Prénom" },
            { key: "met_etab", label: "Etablis" },
          ];
          this.refEtablisPhar.push(item.prf_cod);
          this.Med.push(item.cod_med);
        })
      )
    );

    forkJoin(observables).subscribe(() => {
      // Populate libMed array from the listMed
      data.forEach((item: any) => {
        const selectedMed = this.listMed.find(med => med.cod_med === item.cod_med);
        if (selectedMed) {
          this.libMed.push(selectedMed.lib_med);
        } else {
          this.libMed.push('');
        }

        // Populate etab_rsoc_phar here too
        const selectedEtab = this.listRefEtablisMed.find(etablis => etablis.prf_cod === item.prf_cod);
        if (selectedEtab) {
          this.etab_rsoc_phar.push(selectedEtab.etab_rsoc);
        } else {
          this.etab_rsoc_phar.push('');
        }
        this.mntNetArrayPhar.push(Number(item.mnt_net));
      });

      this.ligPharForm.setControl('phar', this.fb.array(data.map((item: any) => this.fb.group({
        cod_soc: [item.cod_soc],
        mat_pers: [item.mat_pers],
        num_fam: [item.num_fam],
        dat_soin: [item.dat_soin],
        abrv_act: [item.abrv_act],
        cod_med: [item.cod_med],
        num_lig: [item.num_lig],
        num_soin: [item.num_soin],
        mnt_honor: [Number(item.mnt_honor).toFixed(3)],
        mnt_remb: [item.mnt_remb == null ? null : Number(item.mnt_remb).toFixed(3)],   // vide reste vide (et non 0)
        mnt_net: [Number(item.mnt_net).toFixed(3)],
        indice: [item.indice],
        dat_act: [item.dat_act],
        prf_typ: [item.prf_typ],
        prf_cod: [item.prf_cod],
        accord_med: [item.accord_med],
        num_pec_med: [item.num_pec_med],
        mdc_prix: [item.mdc_prix],
        med_prix: [item.med_prix],
        prix_remb: [item.prix_remb],
        num_lig_med: [item.num_lig_med],
        mut_mnt_net: [item.mut_mnt_net],
        nbr_j: [item.nbr_j],
      }))));

      // clé et net en base de chaque médicament chargé
      this.phar.controls.forEach(c => this.memoriserEnBase(c, 'cod_med'));
      this.calculateTotalsPhar();
    });
  }

  loadDataIntoTablApp(data: any) {
    // Clear existing arrays first
    this.appareilCode = [];
    this.libAppareil = [];
    this.refEtablisApp = [];
    this.etab_rsoc_appareil = [];
    this.mntNetArrayAppareil = [];

    // If no data, add an empty line
    if (!data || data.length === 0) {
      this.ligAppareilForm.setControl('appareil', this.fb.array([]));
      this.addLigneAppareil(0);
      return;
    }

    const observables = data.map((item: any) =>
      this.serv.getRefPhysique(item.prf_typ).pipe(
        tap((response: any) => {
          this.listRefEtablisApp = response;
          this.columnsRefEtablisApp = [
            { key: "prf_cod", label: "Code" },
            { key: "etab_rsoc", label: "Nom & Prénom" },
            { key: "met_etab", label: "Etablis" },
          ];
          this.refEtablisApp.push(item.prf_cod);
          this.appareilCode.push(item.cod_app);
        })
      )
    );

    forkJoin(observables).subscribe(() => {
      // Populate libAppareil and etab_rsoc_appareil arrays
      data.forEach((item: any) => {
        const selectedAppareil = this.listAppareil.find(app => app.cod_app === item.cod_app);
        this.libAppareil.push(selectedAppareil?.lib_app || '');

        const selectedEtab = this.listRefEtablisApp.find(etablis => etablis.prf_cod === item.prf_cod);
        this.etab_rsoc_appareil.push(selectedEtab?.etab_rsoc || '');

        this.mntNetArrayAppareil.push(Number(item.mnt_net));
      });

      this.ligAppareilForm.setControl('appareil', this.fb.array(data.map((item: any) => this.fb.group({
        cod_soc: [item.cod_soc],
        mat_pers: [item.mat_pers],
        num_fam: [item.num_fam],
        dat_soin: [item.dat_soin],
        abrv_act: [item.abrv_act],
        cod_app: [item.cod_app],
        num_lig: [item.num_lig],
        num_soin: [item.num_soin],
        mnt_honor: [Number(item.mnt_honor).toFixed(3)],
        mnt_remb: [item.mnt_remb == null ? null : Number(item.mnt_remb).toFixed(3)],   // vide reste vide (et non 0)
        mnt_net: [Number(item.mnt_net).toFixed(3)],
        indice: [item.indice],
        dat_act: [item.dat_act],
        prf_typ: [item.prf_typ],
        prf_cod: [item.prf_cod],
        accord_app: [item.accord_app],   // avant : item.accord_med (inexistant) => accord effacé au prochain enregistrement
        num_pec_app: [item.num_pec_app],
        num_lig_app: [item.num_lig_app],
        mut_mnt_net: [item.mut_mnt_net],
      }))));

      // clé en base de chaque appareil chargé (pour le retrouver si l'appareil ou la date de la ligne change)
      this.appareil.controls.forEach(c => this.cleOrigineApp.set(c, this.cleApp(c.value)));
      this.calculateTotalsAppareil();
    });
  }

  getPersonnel() {
    // liste lue page par page sur le serveur (sourcePersonnel) : seules les colonnes sont posées ici
    this.columnsMat = [
      { key: "mat_pers", label: "Matricule" },
      { key: "mat_int", label: "Mat. Administratif" },
      { key: "dat_nais", label: "Date naissance" },
      { key: "nom", label: "Nom & Prénom" },
      { key: "num_retr", label: "Id CNRPS" },
      { key: "lib_fill", label: "Filière" },
    ];
  }


  onSelectedAdherent(item: any) {
    if (!item) {
      console.warn('No adherent selected');
      return;
    }

    this.nomAdherent = item.nom_pren;
    this.formBuletinSoin.patchValue({
      num_fam: item.num_fam
    });

    this.serv.getDatNais(this.token.getUser().codSoc, this.formBuletinSoin.get('mat_pers')?.value, item.num_fam).subscribe(
      (data: any) => {
        //this.datNais = data?.dat_nais || '';
        this.datNais = this.datePipe.transform(data?.dat_nais, 'dd/MM/yyyy') || '';
      },
      error => {
        console.error('Error loading date naissance:', error);
        this.datNais = '';
      }
    );

    this.serv.getSexe(this.token.getUser().codSoc, this.formBuletinSoin.get('mat_pers')?.value, item.num_fam).subscribe(
      (data: any) => {
        this.sexe = data?.sexe || '';
        this.parente = data?.parente || '';

        const codFil = this.formBuletinSoin.get('cod_fil')?.value;
        const codAssur = this.formBuletinSoin.get('cod_assur')?.value;

        this.serv.getActes(this.parente, this.sexe, codFil, codAssur).subscribe(
          (data: any) => {
            this.listActe = Array.isArray(data) ? data : [];

            this.columnActe = [
              { key: "abrv_act", label: "Abrv acte" },
              { key: "cod_act", label: "Code acte" },
              { key: "lib_act", label: "Libelle" },
              { key: "cot_act", label: "Cotisation" },
            ];
          },
          error => {
            console.error('Error loading actes:', error);
            this.listActe = [];
          }
        );

        this.serv.getVisite(this.parente, this.sexe, codFil, codAssur).subscribe(
          (data: any) => {
            this.listVisite = Array.isArray(data) ? data : [];
            this.columnVisite = [
              { key: "cod_Visit", label: "Abrv acte" },
              { key: "lib_Visit", label: "Libelle" },
            ];
          },
          error => {
            console.error('Error loading visites:', error);
            this.listVisite = [];
          }
        );
      },
      error => {
        console.error('Error loading sexe/parente:', error);
        this.sexe = '';
        this.parente = '';
      }
    );
  }

  onSelectedVMat(item: any) {
    if (!item) {
      console.warn('No item selected');
      return;
    }

    this.carteCnamAlert.verifierExpirationMatricule(item.mat_pers, this.token.getUser().codSoc, item.nom);
    this.numAssur = item.numRetr;
    this.nomPers = item.nom;
    this.codAssur = item.codLieuGeog;
    this.libAssur = item.libLieu;
    this.cod_fil = item.datEmb;
    this.lib_fill = item.lib_fill;
    this.lib_assur = item.lib_assur;
    this.num_retr = item.num_retr;
    this.cod_retr = item.cod_retr ?? '';

    this.formBuletinSoin.patchValue({
      mat_pers: item.mat_pers,
      cod_fil: item.cod_fil,
      num_assur: item.num_assur,
      cod_assur: item.cod_assur,
    });

    this.serv.getAdherent(this.token.getUser().codSoc, item.mat_pers).subscribe(
      (data: any) => {
        this.listAdherent = Array.isArray(data) ? data : [];
        this.columnsAdherent = [
          { key: "num_fam", label: "Num fam" },
          { key: "nom_pren", label: "Nom & Prénom" },
        ];

        // If num_fam is provided in item (e.g. from file parsing), patch it and the name
        if (item.num_fam !== null && item.num_fam !== undefined) {
          this.numFam = item.num_fam;
          const adherent = this.listAdherent.find(a => a.num_fam == item.num_fam);
          if (adherent) {
            this.nomAdherent = adherent.nom_pren;
          }
        }
      },
      error => {
        console.error('Error loading adherent:', error);
        this.listAdherent = [];
      }
    );

    this.serv.getMeds(item.cod_fil, item.cod_assur).subscribe(
      (data: any) => {
        this.listMed = Array.isArray(data) ? data : [];
        this.columnsMed = [
          { key: "cod_med", label: "Code" },
          { key: "lib_med", label: "Libelle" },
          { key: "med_prix", label: "Mdc Prix" },
        ];
      },
      error => {
        console.error('Error loading medicines:', error);
        this.listMed = [];
      }
    );

    this.serv.getAppareil(item.cod_fil, item.cod_assur).subscribe(
      (data: any) => {
        this.listAppareil = Array.isArray(data) ? data : [];
        this.columnsAppareil = [
          { key: "cod_app", label: "Code" },
          { key: "lib_app", label: "Libelle" },
        ];
      },
      error => {
        console.error('Error loading appareils:', error);
        this.listAppareil = [];
      }
    );
  }

  onSelectedPEC(item: any) {
    this.etabliss = item.etablis
    this.datPec = item.dat_pec
    this.formBuletinSoin.patchValue({
      num_pec: item.num_pec
    })
  }


  private lastDatSoinControle = '';
  /** Dernière date de soin (jj/mm/aaaa) copiée dans les dates des lignes. */
  private datSoinPropagee = '';

  /** Date de soin complète au format jj/mm/aaaa, ou '' tant que la saisie n'est pas terminée. */
  private dateSoinComplete(valeur: any = this.formBuletinSoin.get('dat_soin')?.value): string {
    const d = String(valeur ?? '').replace(/\D/g, '');
    return d.length === 8 ? `${d.substring(0, 2)}/${d.substring(2, 4)}/${d.substring(4, 8)}` : '';
  }

  controleDatSoin(item: any) {
    // date vide : rien à contrôler (évite le message « Plafond non encore initialisé » à la sélection du matricule)
    if (!item?.target?.value) {
      return;
    }
    this.saveService.setDisabled(true)
    const formatDates = (form: any, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value); // Assuming formatDate returns a string or null
        form.get(field)?.setValue(value);
        formatted.push(value); // Push value into the string[] array
        return formatted;
      }, []);

    const formBuletinSoin = formatDates(this.formBuletinSoin, [
      "dat_soin",
    ]);

    this.serv.get_duree_bulletin(item.target.value, this.formBuletinSoin.get('cod_assur')?.value).subscribe((data: any) => {
      if (data.reponse) {
        Swal.fire({
          title: 'Message',
          text: data.reponse,
          icon: data.reponse.includes('probléme') ? 'error' : 'info',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        });

        item.target.value = '';
      }
    })

    this.serv.get_plafond_cnam(this.token.getUser().codSoc, this.formBuletinSoin.get('mat_pers')?.value, item.target.value, this.datNais,
      this.formBuletinSoin.get('cod_assur')?.value, this.formBuletinSoin.get('dat_saisie')?.value).subscribe((data: any) => {

        if (data.message) {
          Swal.fire({
            title: 'Message',
            text: data.message,
            icon: 'error',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });

          item.target.value = '';
        }
        this.ageAn = data.ageAn;
        this.ageMois = data.ageMois
        this.soldPlafond = Number(data.soldPlafond).toFixed(3)
        this.soldPlafondEstim = Number(data.soldPlafondEstim).toFixed(3)

      })

    this.serv.getListEtablisPec(this.token.getUser().codSoc, this.formBuletinSoin.get('mat_pers')?.value, this.formBuletinSoin.get('num_fam')?.value,
      this.formBuletinSoin.get('dat_soin')?.value).subscribe((data: any) => {
        this.listPEC = data

        this.columnsPEC = [
          { key: "num_pec", label: "Num pec" },
          { key: "etablis", label: "etablissement" },

        ];
      })

  }

  getRegimeRemb() {
    this.serv.getRegimeRemb().subscribe((data: any) => {
      this.listRegimeRemb = data
    })
  }

  formatDate(dateString: any): string {
    if (!dateString) {
      return dateString;
    }

    // Vérifier si la date est au format ddmmyyyy (ex: 25072024)
    if (dateString.length === 8 && /^\d{8}$/.test(dateString)) {
      const day = dateString.substring(0, 2);
      const month = dateString.substring(2, 4);
      const year = dateString.substring(4, 8);
      return `${day}/${month}/${year}`;
    }

    // Vérifier si la date est au format yyyy-mm-dd (ex: 2024-07-25)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    }

    // Retourner tel quel si aucun format reconnu
    return dateString;
  }

  verif_mod_remb(event: any) {
    this.serv.vetif_mod_remb(
      this.token.getUser().codSoc,
      this.formBuletinSoin.get('mat_pers')?.value,
      this.formBuletinSoin.get('num_fam')?.value,
      this.formBuletinSoin.get('dat_soin')?.value,
      event.target.value,
      this.parente,
      this.sexe
    ).subscribe((data: any) => {
      this.reponseVerifModRemb = data;
      // Vérification des valeurs retournées
      this.showMsgMalad = data.msg_malad === "true";
      if (this.showMsgMalad) {
        this.chargerMaladies();
      }
      this.showMsgDatAccouch = data.msg_dat_accouch === "true";
      this.showMsgPriseCharge = data.msg_prise_charge === "true";


      if (data.message) {
        Swal.fire({
          title: 'Message',
          text: data.message,
          icon: 'error',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        });
        event.target.value = '';
      }
    });
  }

  /** Charge les maladies des dossiers maladie du bénéficiaire (adhérent ou membre de famille) choisi. */
  chargerMaladies(soc?: any, mat?: any, numFam?: any): void {
    const codSoc = soc ?? this.token.getUser().codSoc;
    const matPers = mat ?? this.formBuletinSoin.get('mat_pers')?.value;
    const famille = numFam ?? this.formBuletinSoin.get('num_fam')?.value;
    if (!matPers || famille === null || famille === undefined || famille === '') {
      this.listMaladie = [];
      return;
    }
    this.serv.getDossiersMaladie(codSoc, matPers, famille).subscribe({
      next: (data: any) => {
        this.listMaladie = Array.isArray(data) ? data : [];
        this.afficherMaladie(this.codMalad || this.formBuletinSoin.get('cod_malad')?.value);
      },
      error: (err) => {
        console.error('Error loading maladies:', err);
        this.listMaladie = [];
      }
    });
  }

  /** Renseigne libellé et numéro de dossier pour un code maladie de la liste (vide si le code n'y est pas). */
  private afficherMaladie(code: any): void {
    const trouve = code ? this.listMaladie.find(m => m.cod_malad === code) : null;
    this.codMalad = trouve ? trouve.cod_malad : '';
    this.libMalad = trouve?.lib_malad ?? '';
    this.numDosMld = trouve?.num_dos_mld ?? '';
  }

  onSelectedMaladie(selectedValue: any): void {
    this.afficherMaladie(selectedValue?.cod_malad);
    this.formBuletinSoin.patchValue({ cod_malad: this.codMalad });
  }

  get lignes(): FormArray {
    return this.ligPretForm.get('lignes') as FormArray;
  }

  createLigne(): FormGroup {
    return this.fb.group({
      cod_soc: [this.token.getUser().codSoc],
      mat_pers: [''],
      num_fam: [''],
      dat_soin: ['', Validators.required],
      abrv_act: ['', Validators.required],
      cod_act: [''],
      // numéro attribué par le serveur à l'enregistrement (avant : « 1 » ou le prochain numéro libre demandé à l'avance,
      // si bien que deux lignes ajoutées avant d'enregistrer recevaient le même numéro)
      num_lig: [null],
      num_soin: [''],
      let_cod: [''],
      cot_act: [''],
      act_prix: [''],
      mnt_honor: [''],
      mnt_remb: [''],
      accord_act: [''],
      mnt_net: [''],
      indice: [''],
      dat_act: [this.dateSoinComplete()],
      prf_typ: [''],
      prf_cod: [''],
      mut_mnt_net: [''],
      num_pec_act: [''],
      taux_act: [''],
      typ_prf: [''],
      // Add these back if your template uses them:
      nbr_piece: [''],
      nbr_vign: [''],
      obs: ['']
    });
  }

  addLigne(index: any): void {
    const newLigne = this.createLigne();
    this.lignes.push(newLigne);

    this.selectedActes = [newLigne];
    this.calculateTotals();

    setTimeout(() => {
      this.startEditingNewRowActes(newLigne);
    }, 50);
  }

  private startEditingNewRowActes(row: any) {
    // Force change detection to ensure template is updated
    this.cdr.detectChanges();

    try {
      // Start editing the row using PrimeNG Table's initRowEdit
      this.tableActes?.initRowEdit(row);
      // curseur directement dans la première case de la nouvelle ligne
      focusPremiereCase(this.tableActes, this.tableActes?.value?.indexOf(row) ?? -1);

      // One more change detection to ensure edit mode is active
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 50);
    } catch (error) {
      console.error('Error starting edit mode for Actes:', error);
      // Retry once if failed
      setTimeout(() => {
        this.tableActes?.initRowEdit(row);
        this.cdr.detectChanges();
      }, 100);
    }
  }

  selectedIndex: number | null = null;

  confirm(index: any, content: any, id: any) {
    this.selectedIndex = index
    this.modalService.open(content, { centered: true });
  }

  /** Clé en base de chaque ligne d'acte enregistrée, telle qu'au chargement ou au dernier enregistrement. */
  private cleOrigineActe = new WeakMap<AbstractControl, any>();

  private cleActe(v: any): any {
    return {
      cod_soc: v.cod_soc, mat_pers: v.mat_pers, num_fam: v.num_fam, dat_soin: v.dat_soin, abrv_act: v.abrv_act,
      cod_act: v.cod_act, num_lig: v.num_lig, dat_act: v.dat_act, num_soin: v.num_soin,
    };
  }

  /** Même ligne en base : même acte (code abrégé et code), même date d'acte. */
  private memeCleActe(a: any, b: any): boolean {
    const texte = (x: any) => String(x ?? '').trim().toUpperCase();
    // jj/mm/aaaa ou aaaa-mm-jj : comparés sous la même forme (jjmmaaaa)
    const date = (x: any) => {
      const s = String(x ?? '').trim();
      const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      return iso ? iso[3] + iso[2] + iso[1] : s.replace(/\D/g, '');
    };
    return texte(a.abrv_act) === texte(b.abrv_act) && texte(a.cod_act) === texte(b.cod_act) && date(a.dat_act) === date(b.dat_act);
  }

  /** Anciennes clés des lignes enregistrées dont l'acte ou la date a changé depuis. */
  private clesActesModifiees(controles: AbstractControl[]): any[] {
    return controles
      .map(c => ({ avant: this.cleOrigineActe.get(c), maintenant: c.value }))
      .filter(({ avant, maintenant }) => avant && avant.num_soin != null && String(avant.num_soin).trim() !== '' && !this.memeCleActe(avant, maintenant))
      .map(({ avant }) => avant);
  }

  /** Numéros des lignes d'actes commencées (montant, unités, code…) mais sans acte ou sans date d'acte. */
  private lignesActesIncompletes(): number[] {
    const rempli = (x: any) => x !== null && x !== undefined && String(x).trim() !== '';
    const numeros: number[] = [];
    this.lignes.controls.forEach((c, i) => {
      const v = c.value;
      const commencee = [v.abrv_act, v.cod_act, v.mnt_honor, v.indice, v.prf_cod].some(rempli);
      if (commencee && (!rempli(v.abrv_act) || !rempli(v.dat_act))) numeros.push(i + 1);
    });
    return numeros;
  }

  private retirerLigneActe(index: number): void {
    this.lignes.removeAt(index);
    this.acte.splice(index, 1);
    this.acteChoisi.splice(index, 1);
    this.libAct.splice(index, 1);
    this.refEtablis.splice(index, 1);
    this.etab_rsoc.splice(index, 1);
    this.mntNetArray.splice(index, 1);

    this.calculateTotals();

    if (this.lignes.length === 0) {
      this.addLigne(0);
    }
  }

  ConfirmDelete(index: number): void {
    // clé en base de la ligne : si l'acte ou la date a été changé sans enregistrer, c'est l'ancienne ligne qu'il faut supprimer
    const cleEnBase = this.cleOrigineActe.get(this.lignes.at(index));
    const ligne = cleEnBase ? { ...this.lignes.at(index).value, ...cleEnBase } : this.lignes.at(index).value;
    const present = (v: any) => v !== null && v !== undefined && String(v).trim() !== '';

    // acte jamais enregistré (pas de numéro de soin ni de ligne) : rien à supprimer en base
    if (!present(ligne.num_soin) || !present(ligne.num_lig) || !present(ligne.mat_pers) || !present(ligne.num_fam)) {
      this.retirerLigneActe(index);
      return;
    }

    // clé complète de l'acte : inclut le numéro de soin du bulletin (sans lui, la vérification répondait toujours « absent »
    // et la ligne n'était retirée que de l'écran, pas de la base)
    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
      abrv_act: ligne.abrv_act,
      cod_act: ligne.cod_act,
      num_lig: ligne.num_lig,
      dat_act: ligne.dat_act,
      num_soin: ligne.num_soin,
    };

    this.serv.existeLigBultAct(cle).subscribe({
      next: (exists: boolean) => {
        if (!exists) {
          this.retirerLigneActe(index);
          return;
        }
        this.serv.deleteLigBultAct(
          ligne.cod_soc,
          ligne.mat_pers,
          ligne.num_fam,
          ligne.dat_soin,
          ligne.abrv_act,
          ligne.num_lig,
          ligne.dat_act,
          ligne.cod_act,
          ligne.num_soin
        ).subscribe({
          next: () => this.retirerLigneActe(index),
          error: (error) => {
            console.error("Erreur lors de la suppression :", error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors de la suppression de l\'acte',
              confirmButtonText: 'OK'
            });
          }
        });
      },
      error: (error) => {
        // la vérification a échoué : l'acte reste affiché, on ne le retire pas à tort de l'écran
        console.error("Erreur lors de la vérification d'existence :", error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de vérifier l\'acte avant suppression',
          confirmButtonText: 'OK'
        });
      }
    });
  }
  totalHonoraires: number = 0;
  totalNet: number = 0;



  libAct: string[] = []
  selectedAct: any
  onSelectedActe(selectedValue: any, index: number): void {
    if (!selectedValue || !selectedValue.abrv_act) {
      console.warn('Invalid acte selection:', selectedValue);
      return;
    }

    this.selectedAct = selectedValue;
    const selectedActe = this.listActe.find(acte => acte.abrv_act === selectedValue.abrv_act);

    while (this.acte.length <= index) {
      this.acte.push('');
      this.libAct.push('');
    }

    this.acte[index] = selectedValue.abrv_act;
    this.acteChoisi[index] = selectedValue;
    // le libellé est celui de la ligne choisie (le code abrégé, ex. « BP », est partagé par des centaines d'actes)
    this.libAct[index] = (selectedValue.lib_act || selectedActe?.lib_act || '').trim();

    const avant = this.lignes.at(index).value;
    const acteChange = avant.abrv_act !== selectedValue.abrv_act || avant.cod_act !== selectedValue.cod_act;

    this.lignes.at(index).patchValue({
      abrv_act: selectedValue.abrv_act,
      cod_act: selectedValue.cod_act,
      // valeurs de référence de l'acte choisi (REF_ACT) : sans elles, LET_COD, COT_ACT, ACT_PRIX et TAUX_ACT partaient vides en base
      let_cod: selectedValue.let_cod ?? null,
      cot_act: selectedValue.cot_act ?? null,
      act_prix: selectedValue.act_prix ?? null,
      taux_act: selectedValue.taux_act ?? null
    });

    // unités pré-remplies avec la cotation de l'acte choisi, modifiables ensuite à la main. Seulement quand l'acte
    // change : rouvrir une ligne ne remplace pas une valeur saisie. Acte sans cotation (ligne générique) : inchangées.
    const cotation = selectedValue.cot_act;
    if (acteChange && cotation !== null && cotation !== undefined && String(cotation).trim() !== '' && !isNaN(Number(cotation))) {
      this.lignes.at(index).patchValue({ indice: Number(cotation) });
    }

    // autre acte (prix et taux différents) sur une ligne qui a déjà des honoraires : le net n'est plus le bon
    if (acteChange && String(this.lignes.at(index).value.mnt_honor ?? '').trim() !== '') {
      this.recalculerNetActe(index);
    }
  }
  
  libVisite: string[] = []
  selectedVisit: any
  onSelectedVisite(selectedValue: any, index: number): void {
    if (!selectedValue || !selectedValue.cod_Visit) {
      console.warn('Invalid visit selection:', selectedValue);
      return; // ✅ Prevent undefined access
    }

    this.selectedVisit = selectedValue;
    const selectedActe = this.listVisite.find(acte => acte.cod_Visit === selectedValue.cod_Visit);

    while (this.visiteCode.length <= index) {
      this.visiteCode.push('');
      this.libVisite.push('');
    }

    this.visiteCode[index] = selectedValue.cod_Visit;
    this.libVisite[index] = selectedActe?.lib_Visit || '';

    const visiteChange = this.visite.at(index).value.cod_visit !== selectedValue.cod_Visit;
    this.visite.at(index).patchValue({
      cod_visit: selectedValue.cod_Visit,
      abrv_act: selectedValue.abrv_Act,
      // prix et taux de la visite choisie, sur SA ligne (le calcul prenait ceux de la dernière visite choisie, toutes lignes)
      prix_visit: selectedValue.prix_Visit ?? null,
      taux_remb: selectedValue.taux_Remb ?? null,
    });
    if (visiteChange && String(this.visite.at(index).value.mnt_honor ?? '').trim() !== '') {
      this.recalculerNetVisite(index);
    }
  }
  libAppareil: string[] = []
  onSelectedAppareil(selectedValue: any, index: number): void {
    if (!selectedValue || !selectedValue.cod_app) {
      console.warn('Invalid appareil selection:', selectedValue);
      return;
    }
    const selectedActe = this.listAppareil.find(acte => acte.cod_app === selectedValue.cod_app);

    // Ensure arrays are properly sized
    while (this.appareilCode.length <= index) {
      this.appareilCode.push('');
      this.libAppareil.push('');
    }

    this.appareilCode[index] = selectedValue.cod_app; // Store the selected code
    this.libAppareil[index] = selectedActe?.lib_app || '';

    const appareilChange = this.appareil.at(index).value.cod_app !== selectedValue.cod_app;
    this.appareil.at(index).patchValue({
      cod_app: selectedValue.cod_app,
      abrv_act: selectedValue.abrv_act
    });

    // autre appareil (prix et règles différents) sur une ligne qui a déjà des honoraires : nouveau calcul du net
    if (appareilChange && String(this.appareil.at(index).value.mnt_honor ?? '').trim() !== '') {
      this.recalculerNetAppareil(index);
    }
  }
  mntNetArray: number[] = []; // Declare an array to store the amounts for each line

  /** Honoraires modifiés : nouveau calcul du net de la ligne. */
  calcul_mnt_net(_event: any, index: number) {
    this.recalculerNetActe(index);
  }

  /** Net déjà enregistré en base pour chaque ligne d'acte (compté dans le consommé CNAM estimé). */
  private netEnBaseActe = new WeakMap<AbstractControl, number>();
  /** Dernier calcul demandé par ligne : une réponse plus ancienne arrivée après est ignorée. */
  private calculNetActe = new WeakMap<AbstractControl, number>();

  /**
   * Net d'une ligne d'acte, calculé par le serveur : min(prix de l'acte × taux / 100, honoraires), limité au reste du
   * plafond CNAM de l'année. Valeurs envoyées : celles de CETTE ligne (avant : celles du dernier acte choisi, quelle que
   * soit la ligne) ; « sauvNet » = son net déjà enregistré (déjà compté dans le consommé) ; « cumulNet » = ce que les
   * autres lignes pas encore enregistrées ajoutent au consommé.
   */
  recalculerNetActe(index: number): void {
    const ligne = this.lignes.at(index);
    if (!ligne) return;
    const v = ligne.value;
    const nombre = (x: any) => { const n = Number(String(x ?? '').replace(',', '.')); return isNaN(n) ? 0 : n; };
    const rempli = (x: any) => x !== null && x !== undefined && String(x).trim() !== '';

    const appliquer = (net: number) => {
      this.mntNetArray[index] = net;
      ligne.patchValue({ mnt_net: net });
      this.calculateTotals();
    };

    // sans acte ou sans honoraires : pas de remboursement à calculer
    if (!rempli(v.cod_act) || !rempli(v.mnt_honor) || nombre(v.mnt_honor) <= 0) {
      appliquer(0);
      return;
    }

    const sauvNet = this.netEnBaseActe.get(ligne) ?? 0;
    const cumulNet = this.lignes.controls.reduce((total, c, i) =>
      i === index ? total : total + (nombre(c.value.mnt_net) - (this.netEnBaseActe.get(c) ?? 0)), 0);

    const numero = (this.calculNetActe.get(ligne) ?? 0) + 1;
    this.calculNetActe.set(ligne, numero);

    this.serv.calculer_montant_net_act(
      this.formBuletinSoin.get('cod_soc')?.value, this.formBuletinSoin.get('mat_pers')?.value, v.cod_act,
      nombre(v.mnt_honor), this.formBuletinSoin.get('dat_soin')?.value,
      nombre(v.act_prix), nombre(v.taux_act), Number(cumulNet.toFixed(3)), sauvNet,
    ).subscribe({
      next: (data: any) => {
        if (this.calculNetActe.get(ligne) !== numero) return;   // une modification plus récente est en cours
        if (data?.message) {
          Swal.fire({ icon: 'warning', title: 'Net non calculé', text: data.message, confirmButtonText: 'Compris' });
        }
        appliquer(nombre(data?.p_mnt_net));
      },
      error: () => {
        if (this.calculNetActe.get(ligne) !== numero) return;
        Swal.fire({ icon: 'error', title: 'Net non calculé', text: 'Le calcul du net a échoué. Vérifiez les honoraires puis réessayez.', confirmButtonText: 'Compris' });
      },
    });
  }

  OnselectRefTyp(event: any) {
    const value = event && event.value !== undefined ? event.value : (event && event.target ? event.target.value : event);

    if (!value) {
      console.warn('No type selected');
      this.listRefEtablis = [];
      return;
    }

    this.serv.getRefPhysique(value).subscribe(
      (data: any) => {
        this.listRefEtablis = Array.isArray(data) ? data : [];

        this.columnsRefEtablis = [
          { key: "prf_cod", label: "Code" },
          { key: "etab_rsoc", label: "Nom & Prénom" },
          { key: "met_etab", label: "Etablis" },
        ];
      },
      error => {
        console.error('Error fetching etablissements:', error);
        this.listRefEtablis = [];
      }
    );
  }

  OnselectRefTypVisite(event: any) {
    const value = event && event.value !== undefined ? event.value : (event && event.target ? event.target.value : event);

    if (!value) {
      this.listRefEtablisVisit = [];
      return;
    }

    this.serv.getRefPhysique(value).subscribe(
      (data: any) => {
        this.listRefEtablisVisit = Array.isArray(data) ? data : [];

        this.columnsRefEtablisVisit = [
          { key: "prf_cod", label: "Code" },
          { key: "etab_rsoc", label: "Nom & Prénom" },
          { key: "met_etab", label: "Etablis" },
        ];
      },
      error => {
        console.error('Error fetching etablissements visit:', error);
        this.listRefEtablisVisit = [];
      }
    );
  }

  OnselectRefTypMed(event: any) {
    const value = event && event.value !== undefined ? event.value : (event && event.target ? event.target.value : event);

    if (!value) {
      this.listRefEtablisMed = [];
      return;
    }

    this.serv.getRefPhysique(value).subscribe(
      (data: any) => {
        this.listRefEtablisMed = Array.isArray(data) ? data : [];

        this.columnsRefEtablisMed = [
          { key: "prf_cod", label: "Code" },
          { key: "etab_rsoc", label: "Nom & Prénom" },
          { key: "met_etab", label: "Etablis" },
        ];
      },
      error => {
        console.error('Error fetching etablissements med:', error);
        this.listRefEtablisMed = [];
      }
    );
  }

  OnselectRefTypApp(event: any) {
    const value = event && event.value !== undefined ? event.value : (event && event.target ? event.target.value : event);

    if (!value) {
      this.listRefEtablisApp = [];
      return;
    }

    this.serv.getRefPhysique(value).subscribe(
      (data: any) => {
        this.listRefEtablisApp = Array.isArray(data) ? data : [];

        this.columnsRefEtablisApp = [
          { key: "prf_cod", label: "Code" },
          { key: "etab_rsoc", label: "Nom & Prénom" },
          { key: "met_etab", label: "Etablis" },
        ];
      },
      error => {
        console.error('Error fetching etablissements app:', error);
        this.listRefEtablisApp = [];
      }
    );
  }
  etab_rsoc: string[] = []
  onSelectedEtablis(selectedValue: any, index: number): void {
    if (!selectedValue || !selectedValue.prf_cod) {
      console.warn('Invalid etablissement selection:', selectedValue);
      return;
    }

    const selectedActe = this.listRefEtablis.find(etablis => etablis.prf_cod === selectedValue.prf_cod);

    while (this.refEtablis.length <= index) {
      this.refEtablis.push('');
      this.etab_rsoc.push('');
    }

    this.refEtablis[index] = selectedValue.prf_cod;
    this.etab_rsoc[index] = selectedActe?.etab_rsoc || '';

    this.lignes.at(index).patchValue({
      prf_cod: selectedValue.prf_cod
    });
  }
  calculateTotals() {

    this.totalHonoraires = this.lignes.controls.reduce((sum, ligne) => {
      const honor = parseFloat((ligne.get('mnt_honor')?.value || '0')) || 0;
      return sum + honor;
    }, 0);

    this.totalNet = this.lignes.controls.reduce((sum, ligne) => {
      const net = parseFloat((ligne.get('mnt_net')?.value || '0')) || 0;
      return sum + net;
    }, 0);
  }

  // ============ Date Validation Helper Functions ============
  private toComparableDate(str: any): number | null {
    if (!str || typeof str !== 'string') return null;
    // dd/mm/yyyy
    let m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return Number(`${m[3]}${m[2]}${m[1]}`);
    // yyyy-mm-dd
    m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return Number(`${m[1]}${m[2]}${m[3]}`);
    // ddmmyyyy
    m = str.match(/^(\d{2})(\d{2})(\d{4})$/);
    if (m) return Number(`${m[3]}${m[2]}${m[1]}`);
    return null;
  }

  private isAfterDate(a: any, b: any): boolean {
    const na = this.toComparableDate(a);
    const nb = this.toComparableDate(b);
    if (na == null || nb == null) return false;
    return na > nb;
  }
  private isBeforeDate(a: any, b: any): boolean {
    const na = this.toComparableDate(a);
    const nb = this.toComparableDate(b);
    if (na == null || nb == null) return false;
    return na < nb;
  }

  private showMessage(severity: string, detail: string) {
    Swal.fire({
      title: severity === 'warn' ? 'Attention' : 'Information',
      text: detail,
      icon: severity === 'warn' ? 'warning' : 'info',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK',
      timer: 3000
    });
  }

  // ============ Date Validation for Tables ============
  ensureDatActNotAfterSoins(index: number) {
    const fg = this.lignes.at(index) as FormGroup;
    const da = fg.get('dat_act')?.value;
    const ds = this.formBuletinSoin.get('dat_soin')?.value;
    if (this.isBeforeDate(da, ds)) {
      fg.get('dat_act')?.setValue(ds);
      this.showMessage('warn', 'La date acte ne doit pas être inférieure à la date de soin');
    }
  }

  ensureDatActNotAfterSoinsPhar(index: number) {
    const fg = this.phar.at(index) as FormGroup;
    const da = fg.get('dat_act')?.value;
    const ds = this.formBuletinSoin.get('dat_soin')?.value;
    if (this.isBeforeDate(da, ds)) {
      fg.get('dat_act')?.setValue(ds);
      this.showMessage('warn', 'La date médicament ne doit pas être inférieure à la date de soin');
    }
  }

  ensureDatActNotAfterSoinsVisite(index: number) {
    const fg = this.visite.at(index) as FormGroup;
    const da = fg.get('dat_act')?.value;
    const ds = this.formBuletinSoin.get('dat_soin')?.value;
    if (this.isBeforeDate(da, ds)) {
      fg.get('dat_act')?.setValue(ds);
      this.showMessage('warn', 'La date visite ne doit pas être inférieure à la date de soin');
    }
  }

  ensureDatActNotAfterSoinsApp(index: number) {
    const fg = this.appareil.at(index) as FormGroup;
    const da = fg.get('dat_act')?.value;
    const ds = this.formBuletinSoin.get('dat_soin')?.value;
    if (this.isBeforeDate(da, ds)) {
      fg.get('dat_act')?.setValue(ds);
      this.showMessage('warn', 'La date appareil ne doit pas être inférieure à la date de soin');
    }
  }

  // ============ Validation for Pieces and Vignettes ============
  verif_piece(event: any, ri: number) {
    const value = event.target.value;
    if (value && (isNaN(value) || value < 0)) {
      this.showMessage('warn', 'Le nombre de pièces doit être un nombre positif');
      this.lignes.at(ri).patchValue({ nbr_piece: '' });
    }
  }

  verif_vign(event: any, ri: number) {
    const value = event.target.value;
    if (value && (isNaN(value) || value < 0)) {
      this.showMessage('warn', 'Le nombre de vignettes doit être un nombre positif');
      this.lignes.at(ri).patchValue({ nbr_vign: '' });
    }
  }
  // Note: verif_piece_pahr and verif_vign_pahr are implemented below with backend service calls

  /*   Traitement des medicaments*/

  get phar(): FormArray {
    return this.ligPharForm.get('phar') as FormArray;
  }

  createLignePhar(): FormGroup {
    return this.fb.group({
      cod_soc: [this.token.getUser().codSoc],
      mat_pers: [''],
      num_fam: [''],
      dat_soin: ['', Validators.required],
      abrv_act: ['', Validators.required],
      cod_med: [''],
      num_lig: [''],
      num_soin: [''],
      indice: [''],
      mnt_honor: [''],
      mnt_net: [''],
      mnt_remb: [''],
      accord_med: [''],
      dat_act: [this.dateSoinComplete()],
      prf_typ: [''],
      prf_cod: [''],
      num_pec_med: [''],
      mdc_prix: [''],
      med_prix: [''],
      prix_remb: [''],
      num_lig_med: ['1'],
      mut_mnt_net: [''],
      nbr_j: [''],
      nbr_piece: [''],
      nbr_vign: [''],
      obs: ['']
      // ❌ REMOVED: uniqueId, nbr_piece, nbr_vign, obs
    });
  }
  addLignePhar(index: any): void {
    const newLigne = this.createLignePhar();
    this.phar.push(newLigne);

    this.selectedPhar = [newLigne];
    this.calculateTotalsPhar();

    const codSocP = this.formBuletinSoin.get('cod_soc')?.value;
    const matPersP = this.formBuletinSoin.get('mat_pers')?.value;
    const numFamP = this.formBuletinSoin.get('num_fam')?.value;
    const datSoinP = this.formBuletinSoin.get('dat_soin')?.value;
    const abrvAct = this.phar.at(index).get('abrv_act')?.value;

    if (codSocP && matPersP && numFamP && datSoinP && abrvAct) {
      this.serv.getNumLigMed(codSocP, matPersP, numFamP, datSoinP, abrvAct).subscribe(
        (data: any) => {
          this.phar.at(index).patchValue({ num_lig_med: data });
        },
        (error) => {
          console.error('Error fetching num_lig_med:', error);
          this.phar.at(index).patchValue({ num_lig_med: index + 1 });
        }
      );
    } else {
      this.phar.at(index).patchValue({ num_lig_med: index + 1 });
    }

    setTimeout(() => {
      this.startEditingNewRowPhar(newLigne);
    }, 50);
  }

  private startEditingNewRowPhar(row: any) {
    // Force change detection to ensure template is updated
    this.cdr.detectChanges();

    try {
      // Start editing the row using PrimeNG Table's initRowEdit
      this.tablePhar?.initRowEdit(row);
      // curseur directement dans la première case de la nouvelle ligne
      focusPremiereCase(this.tablePhar, this.tablePhar?.value?.indexOf(row) ?? -1);

      // One more change detection to ensure edit mode is active
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 50);
    } catch (error) {
      console.error('Error starting edit mode for Pharmacies:', error);
      // Retry once if failed
      setTimeout(() => {
        this.tablePhar?.initRowEdit(row);
        this.cdr.detectChanges();
      }, 100);
    }
  }

  removeLignePhar(index: number): void {
    const ligne = this.phar.at(index).value;

    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
      abrv_act: ligne.abrv_act,
    }

    this.serv.existeLigBultMed(cle).subscribe((exists: any) => {
      if (exists) {
        // 🔥 FIX: Change ligne.num_lig to ligne.num_lig_med
        this.serv.deleteLigBultMed(
          ligne.cod_soc,
          ligne.mat_pers,
          ligne.num_fam,
          ligne.dat_soin,
          ligne.abrv_act,
          ligne.num_lig_med,  // ✅ Changed from ligne.num_lig
          ligne.cod_med
        ).subscribe(() => {
          this.phar.removeAt(index);
          this.calculateTotalsPhar();
        }, error => {
          console.error("Erreur lors de la suppression :", error);
        });
      }
    }, error => {
      console.error("Erreur lors de la vérification d'existence :", error);
      this.phar.removeAt(index);
      this.calculateTotalsPhar();
    });
  }

  selectedIndexMed: number | null = null;

  confirmMed(index: any, content: any) {
    this.selectedIndexMed = index;
    this.modalService.open(content, { centered: true });
  }

  /** Retire la ligne de l'écran (tableau et listes associées) ; une ligne vide est recréée si c'était la dernière. */
  private retirerLignePhar(index: number): void {
    this.phar.removeAt(index);
    this.libMed.splice(index, 1);
    this.Med.splice(index, 1);
    this.refEtablisPhar.splice(index, 1);
    this.etab_rsoc_phar.splice(index, 1);
    this.mntNetArrayPhar.splice(index, 1);

    this.calculateTotalsPhar();

    if (this.phar.length === 0) {
      this.addLignePhar(0);
    }
  }

  ConfirmDeleteMed(index: number): void {
    // clé en base : si le médicament ou la date a été changé sans enregistrer, c'est l'ancienne ligne qu'il faut supprimer
    const cleEnBase = this.cleOrigineLigne.get(this.phar.at(index));
    const ligne = cleEnBase ? { ...this.phar.at(index).value, ...cleEnBase } : this.phar.at(index).value;
    const present = (v: any) => v !== null && v !== undefined && String(v).trim() !== '';

    // médicament jamais enregistré (pas de numéro de soin ni de ligne) : rien à supprimer en base
    if (!present(ligne.num_soin) || !present(ligne.num_lig) || !present(ligne.mat_pers) || !present(ligne.num_fam)) {
      this.retirerLignePhar(index);
      return;
    }

    // clé complète du médicament (num_lig_med est vide sur les anciennes lignes : il ne peut pas servir de clé)
    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
      abrv_act: ligne.abrv_act,
      dat_act: ligne.dat_act,
      cod_med: ligne.cod_med,
      num_lig: ligne.num_lig,
      num_soin: ligne.num_soin,
    };

    this.serv.existeLigBultMed(cle).subscribe({
      next: (exists: boolean) => {
        if (!exists) {
          this.retirerLignePhar(index);
          return;
        }
        this.serv.deleteLigBultMed(
          ligne.cod_soc,
          ligne.mat_pers,
          ligne.num_fam,
          ligne.dat_soin,
          ligne.abrv_act,
          ligne.num_lig,
          ligne.cod_med,
          ligne.num_soin,
          ligne.dat_act
        ).subscribe({
          next: () => {
            this.retirerLignePhar(index);
            Swal.fire({
              icon: 'success',
              title: 'Suppression réussie',
              text: 'Le médicament a été supprimé avec succès',
              confirmButtonText: 'OK',
              timer: 2000
            });
          },
          error: (error) => {
            // la suppression a échoué : la ligne reste affichée (elle est toujours en base)
            console.error("Erreur lors de la suppression :", error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors de la suppression du médicament',
              confirmButtonText: 'OK'
            });
          }
        });
      },
      error: (error) => {
        // la vérification a échoué : la ligne reste affichée, on ne la retire pas à tort de l'écran
        console.error("Erreur lors de la vérification d'existence :", error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de vérifier le médicament avant suppression',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  verif_indice_phar(item: any, index: any) {
    const ligPhar = this.ligPharForm.get('phar') as FormArray;
    // unités saisies sur la ligne (avant : abrv_act.indice, propriété inexistante : la vraie valeur n'était jamais contrôlée)
    this.serv.verif_indice(ligPhar.value[index].abrv_act, this.formBuletinSoin.get('cod_fil')?.value, this.formBuletinSoin.get('cod_assur')?.value, ligPhar.value[index].indice ?? '').
      subscribe((data: any) => {
        if (data.reponse != null) {
          Swal.fire({
            title: 'Message',
            text: data.reponse,
            icon: 'error',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });

          item.target.value = '';
          this.phar.at(index).patchValue({ indice: '' });
        }
        // les unités entrent dans le calcul du net d'un médicament
        if (this.estRempli(this.phar.at(index).value.mnt_honor)) this.recalculerNetMed(index);
      })
  }

  verif_vign_pahr(event: any, index: any) {
    const value = event.target.value;

    // ✅ Basic validation first
    if (!value || isNaN(value) || value < 0) {
      this.showMessage('warn', 'Le nombre de vignettes doit être un nombre positif');
      this.phar.at(index).patchValue({ nbr_vign: '' });
      return;
    }

    const ligPhar = this.ligPharForm.get('phar') as FormArray;
    const currentLine = ligPhar.at(index).value;

    // ✅ Check if required fields exist
    if (!currentLine.abrv_act || !currentLine.mnt_honor) {
      this.showMessage('warn', 'Veuillez remplir l\'acte et le montant honoraire d\'abord');
      this.phar.at(index).patchValue({ nbr_vign: '' });
      return;
    }

    this.serv.verif_vign(
      currentLine.abrv_act,
      this.formBuletinSoin.get('cod_fil')?.value,
      this.formBuletinSoin.get('cod_assur')?.value,
      currentLine.mnt_honor,
      value  // ✅ Use the input value directly
    ).subscribe({
      next: (data: any) => {

        if (data && data.reponse) {
          Swal.fire({
            title: 'Message',
            text: data.reponse,
            icon: 'error',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });
          this.phar.at(index).patchValue({ nbr_vign: '' });
        }
      },
      error: (error) => {
        console.error("Error verifying vignettes:", error);
        this.showMessage('warn', 'Erreur lors de la vérification des vignettes');
      }
    });
  }

  verif_piece_pahr(event: any, index: any) {
    const value = event.target.value;

    // ✅ Basic validation first
    if (!value || isNaN(value) || value < 0) {
      this.showMessage('warn', 'Le nombre de pièces doit être un nombre positif');
      this.phar.at(index).patchValue({ nbr_piece: '' });
      return;
    }

    const ligPhar = this.ligPharForm.get('phar') as FormArray;
    const currentLine = ligPhar.at(index).value;

    // ✅ Check if required fields exist
    if (!currentLine.abrv_act || !currentLine.mnt_honor) {
      this.showMessage('warn', 'Veuillez remplir l\'acte et le montant honoraire d\'abord');
      this.phar.at(index).patchValue({ nbr_piece: '' });
      return;
    }

    this.serv.verif_piece(
      currentLine.abrv_act,
      this.formBuletinSoin.get('cod_fil')?.value,
      this.formBuletinSoin.get('cod_assur')?.value,
      currentLine.mnt_honor,
      value  // ✅ Use the input value directly
    ).subscribe({
      next: (data: any) => {

        if (data && data.reponse) {
          Swal.fire({
            title: 'Message',
            text: data.reponse,
            icon: 'error',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });
          this.phar.at(index).patchValue({ nbr_piece: '' });
        }
      },
      error: (error) => {
        console.error("Error verifying pieces:", error);
        this.showMessage('warn', 'Erreur lors de la vérification des pièces');
      }
    });

  }

  etab_rsoc_phar: string[] = []

  onSelectedEtablisPhar(selectedValue: any, index: number): void {
    if (!selectedValue || !selectedValue.prf_cod) {
      console.warn('Invalid etablissement selection:', selectedValue);
      return;
    }

    const selectedActe = this.listRefEtablisMed.find(etablis => etablis.prf_cod === selectedValue.prf_cod);

    while (this.refEtablisPhar.length <= index) {
      this.refEtablisPhar.push('');
      this.etab_rsoc_phar.push('');
    }

    this.refEtablisPhar[index] = selectedValue.prf_cod;
    this.etab_rsoc_phar[index] = selectedActe?.etab_rsoc || '';

    this.phar.at(index).patchValue({
      prf_cod: selectedValue.prf_cod
    });
  }

  mntNetArrayPhar: number[] = [];

  /** Honoraires d'un médicament modifiés : nouveau calcul du net de la ligne. */
  calcul_mnt_netPhar(_event: any, index: number) {
    this.recalculerNetMed(index);
  }

  /**
   * Net d'un médicament (serveur) : prix remboursable × unités, limité par les honoraires et le plafond CNAM.
   * Prix et unités de CETTE ligne ; « sauvNet » = son net déjà enregistré ; « cumulNet » = ce que les autres
   * médicaments pas encore enregistrés ajoutent au consommé.
   */
  recalculerNetMed(index: number): void {
    const ligne = this.phar.at(index);
    if (!ligne) return;
    const v = ligne.value;
    const appliquer = (net: number) => {
      this.mntNetArrayPhar[index] = net;
      ligne.patchValue({ mnt_net: net });
      this.calculateTotalsPhar();
    };
    if (!this.estRempli(v.cod_med) || this.enNombre(v.mnt_honor) <= 0) { appliquer(0); return; }
    const cumulNet = this.phar.controls.reduce((total, c, i) =>
      i === index ? total : total + (this.enNombre(c.value.mnt_net) - (this.netEnBaseLigne.get(c) ?? 0)), 0);
    this.appelNetLigne(ligne, this.serv.calculer_montant_net_med(
      this.formBuletinSoin.get('cod_soc')?.value, this.formBuletinSoin.get('mat_pers')?.value, v.cod_med,
      this.enNombre(v.mnt_honor), this.formBuletinSoin.get('dat_soin')?.value,
      this.enNombre(v.prix_remb), Math.trunc(this.enNombre(v.indice)), Number(cumulNet.toFixed(3)), this.netEnBaseLigne.get(ligne) ?? 0,
    ), appliquer, 'Médicament');
  }

  totalHonorairesPhar: number = 0;
  totalNetPhar: number = 0;
  
  calculateTotalsPhar() {
    this.totalHonorairesPhar = this.phar.controls.reduce((sum, ligne) => {
      const honor = parseFloat((ligne.get('mnt_honor')?.value || '0')) || 0;
      return sum + honor;
    }, 0);

    this.totalNetPhar = this.phar.controls.reduce((sum, ligne) => {
      const net = parseFloat((ligne.get('mnt_net')?.value || '0')) || 0;
      return sum + net;
    }, 0);
  }

  libMed: string[] = []
  selectedMed: any
  onSelectedMed(selectedValue: any, index: number): void {
    if (!selectedValue || !selectedValue.cod_med) {
      console.warn('Invalid medicine selection:', selectedValue);
      return; // ✅ Prevent undefined access
    }

    this.selectedMed = selectedValue;
    const selectedMed = this.listMed.find(med => med.cod_med === selectedValue.cod_med);

    while (this.Med.length <= index) {
      this.Med.push('');
      this.libMed.push('');
    }

    this.Med[index] = selectedValue.cod_med;
    this.libMed[index] = selectedMed?.lib_med || '';

    const medicamentChange = this.phar.at(index).value.cod_med !== selectedValue.cod_med;
    this.phar.at(index).patchValue({
      cod_med: selectedValue.cod_med,
      abrv_act: selectedValue.abrv_act,
      mdc_prix: selectedValue.mdc_prix,
      // prix du médicament choisi, sur SA ligne (le calcul prenait le prix du dernier médicament choisi, toutes lignes)
      med_prix: selectedValue.med_prix ?? null,
      prix_remb: selectedValue.prix_remb ?? null,
    });
    if (medicamentChange && String(this.phar.at(index).value.mnt_honor ?? '').trim() !== '') {
      this.recalculerNetMed(index);
    }
  }
  /* Fin Traitement des medicaments*/


  /* Traitement des Visites*/

  get visite(): FormArray {
    return this.ligVisiteForm.get('visite') as FormArray;
  }
  createLigneVisite(): FormGroup {
    return this.fb.group({
      cod_soc: [this.token.getUser().codSoc],
      mat_pers: [''],
      num_fam: [''],
      num_soin: [''],
      dat_soin: ['', Validators.required],
      abrv_act: [''],
      cod_visit: ['', Validators.required],
      num_lig: [''],
      mnt_honor: [''],
      mnt_remb: [''],
      mnt_net: [''],
      indice: [''],
      dat_act: [this.dateSoinComplete()],
      prf_typ: [''],
      prf_cod: [''],
      prix_visit: [''],
      taux_remb: [''],
      mut_mnt_net: ['']
      // ❌ REMOVED: uniqueId
    });
  }

  addLigneVisite(): void {
    const newLigne = this.createLigneVisite();
    this.visite.push(newLigne);

    // Auto-select the newly added row
    this.selectedVisites = [newLigne];

    this.calculateTotalsVisite()

    // Use a small delay to ensure the row is rendered in the DOM
    setTimeout(() => {
      this.startEditingNewRowVisite(newLigne);
    }, 50);
  }

  private startEditingNewRowVisite(row: any) {
    // Force change detection to ensure template is updated
    this.cdr.detectChanges();

    try {
      // Start editing the row using PrimeNG Table's initRowEdit
      this.tableVisite?.initRowEdit(row);
      // curseur directement dans la première case de la nouvelle ligne
      focusPremiereCase(this.tableVisite, this.tableVisite?.value?.indexOf(row) ?? -1);

      // One more change detection to ensure edit mode is active
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 50);
    } catch (error) {
      console.error('Error starting edit mode for Visites:', error);
      // Retry once if failed
      setTimeout(() => {
        this.tableVisite?.initRowEdit(row);
        this.cdr.detectChanges();
      }, 100);
    }
  }

  removeLigneVisite(index: number): void {
    this.visite.removeAt(index);
    this.calculateTotalsVisite()
  }

  selectedIndexVisit: number | null = null;

  confirmVisit(index: any, content: any) {
    this.selectedIndexVisit = index;
    this.modalService.open(content, { centered: true });
  }

  /** Retire la ligne de l'écran (tableau et listes associées) ; une ligne vide est recréée si c'était la dernière. */
  private retirerLigneVisite(index: number): void {
    this.visite.removeAt(index);
    this.visiteCode.splice(index, 1);
    this.libVisite.splice(index, 1);
    this.refEtablisVisit.splice(index, 1);
    this.etab_rsoc_visite.splice(index, 1);
    this.mntNetArrayVisite.splice(index, 1);

    this.calculateTotalsVisite();

    if (this.visite.length === 0) {
      this.addLigneVisite();
    }
  }

  ConfirmDeleteVisit(index: number): void {
    // clé en base : si la visite ou la date a été changée sans enregistrer, c'est l'ancienne ligne qu'il faut supprimer
    const cleEnBase = this.cleOrigineLigne.get(this.visite.at(index));
    const ligne = cleEnBase ? { ...this.visite.at(index).value, ...cleEnBase } : this.visite.at(index).value;
    const present = (v: any) => v !== null && v !== undefined && String(v).trim() !== '';

    // visite jamais enregistrée (pas de numéro de soin ni de ligne) : rien à supprimer en base
    if (!present(ligne.num_soin) || !present(ligne.num_lig) || !present(ligne.mat_pers) || !present(ligne.num_fam)) {
      this.retirerLigneVisite(index);
      return;
    }

    // clé complète de la visite : inclut le numéro de ligne et le numéro de soin du bulletin
    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
      abrv_act: ligne.abrv_act,
      cod_visit: ligne.cod_visit,
      dat_act: ligne.dat_act,
      num_lig: ligne.num_lig,
      num_soin: ligne.num_soin,
    };

    this.serv.existeLigBultVisit(cle).subscribe({
      next: (exists: boolean) => {
        if (!exists) {
          this.retirerLigneVisite(index);
          return;
        }
        this.serv.deleteLigBultVisit(
          ligne.cod_soc,
          ligne.mat_pers,
          ligne.num_fam,
          ligne.dat_soin,
          ligne.abrv_act,
          ligne.num_lig,
          ligne.dat_act,
          ligne.cod_visit,
          ligne.num_soin
        ).subscribe({
          next: () => this.retirerLigneVisite(index),
          error: (error) => {
            console.error("Erreur lors de la suppression :", error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors de la suppression de la visite',
              confirmButtonText: 'OK'
            });
          }
        });
      },
      error: (error) => {
        // la vérification a échoué : la visite reste affichée, on ne la retire pas à tort de l'écran
        console.error("Erreur lors de la vérification d'existence :", error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de vérifier la visite avant suppression',
          confirmButtonText: 'OK'
        });
      }
    });
  }
  etab_rsoc_visite: string[] = []

  onSelectedEtablisVisite(selectedValue: any, index: number): void {
    if (!selectedValue || !selectedValue.prf_cod) {
      console.warn('Invalid etablissement selection:', selectedValue);
      return; // ✅ Prevent undefined access
    }

    const selectedActe = this.listRefEtablisVisit.find(etablis => etablis.prf_cod === selectedValue.prf_cod);

    while (this.refEtablisVisit.length <= index) {
      this.refEtablisVisit.push('');
      this.etab_rsoc_visite.push('');
    }

    this.refEtablisVisit[index] = selectedValue.prf_cod;
    this.etab_rsoc_visite[index] = selectedActe?.etab_rsoc || '';

    this.visite.at(index).patchValue({
      prf_cod: selectedValue.prf_cod
    });
  }
  mntNetArrayVisite: number[] = [];
  /** Honoraires d'une visite modifiés : nouveau calcul du net de la ligne. */
  calcul_mnt_net_visite(_event: any, index: number) {
    this.recalculerNetVisite(index);
  }

  /**
   * Net d'une visite (serveur) : min(honoraires, prix de la visite) × taux / 100, limité au plafond CNAM.
   * Prix et taux de CETTE ligne ; « sauvNet » = son net déjà enregistré (déjà compté dans le consommé).
   */
  recalculerNetVisite(index: number): void {
    const ligne = this.visite.at(index);
    if (!ligne) return;
    const v = ligne.value;
    const appliquer = (net: number) => {
      this.mntNetArrayVisite[index] = net;
      ligne.patchValue({ mnt_net: net });
      this.calculateTotalsVisite();
    };
    if (!this.estRempli(v.cod_visit) || this.enNombre(v.mnt_honor) <= 0) { appliquer(0); return; }
    this.appelNetLigne(ligne, this.serv.calculer_montant_net_visit(
      this.formBuletinSoin.get('cod_soc')?.value, this.formBuletinSoin.get('mat_pers')?.value, v.cod_visit,
      this.enNombre(v.mnt_honor), this.formBuletinSoin.get('dat_soin')?.value,
      this.enNombre(v.prix_visit), this.enNombre(v.taux_remb), this.netEnBaseLigne.get(ligne) ?? 0,
    ), appliquer, 'Visite');
  }

  totalHonorairesVisite: number = 0;
  totalNetVisite: number = 0;
  calculateTotalsVisite() {
    this.totalHonorairesVisite = this.visite.controls.reduce((sum, ligne) => {
      const honor = parseFloat((ligne.get('mnt_honor')?.value || '0')) || 0;
      return sum + honor;
    }, 0);

    this.totalNetVisite = this.visite.controls.reduce((sum, ligne) => {
      const net = parseFloat((ligne.get('mnt_net')?.value || '0')) || 0;
      return sum + net;
    }, 0);
  }

  verif_indice_visite(item: any, index: any) {
    const ligPhar = this.ligVisiteForm.get('visite') as FormArray;
    this.serv.verif_indice(ligPhar.value[index].abrv_act, this.formBuletinSoin.get('cod_fil')?.value, this.formBuletinSoin.get('cod_assur')?.value, ligPhar.value[index].abrv_act.indice).
      subscribe((data: any) => {

        if (data.reponse != null) {
          Swal.fire({
            title: 'Message',
            text: data.reponse,
            icon: 'error',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });

          item.target.value = '';
        }

      })
  }


  /* Fin Traitement des Visites*/


  /*  Traitement des appareils*/

  get appareil(): FormArray {
    return this.ligAppareilForm.get('appareil') as FormArray;
  }

  createLigneAppareil(): FormGroup {
    return this.fb.group({
      cod_soc: [this.token.getUser().codSoc],
      mat_pers: [''],
      num_fam: [''],
      dat_soin: ['', Validators.required],
      abrv_act: [''],
      cod_app: ['', Validators.required],
      num_lig: [''],
      num_soin: [''],
      mnt_honor: [''],
      mnt_net: [''],
      mnt_remb: [''],
      accord_app: [''],
      indice: [''],
      dat_act: [this.dateSoinComplete()],
      prf_typ: [''],
      prf_cod: [''],
      num_pec_app: [''],
      num_lig_app: ['1'],
      mut_mnt_net: ['']
      // ❌ REMOVED: uniqueId
    });
  }
  addLigneAppareil(index: number): void {
    const newLigne = this.createLigneAppareil();
    const ligBult = this.ligAppareilForm.get('appareil') as FormArray;
    this.appareil.push(newLigne);

    // Auto-select the newly added row
    this.selectedApps = [newLigne];

    this.calculateTotalsAppareil()

    const codSocA = this.formBuletinSoin.get('cod_soc')?.value;
    const matPersA = this.formBuletinSoin.get('mat_pers')?.value;
    const numFamA = this.formBuletinSoin.get('num_fam')?.value;
    const datSoinA = this.formBuletinSoin.get('dat_soin')?.value;
    const codApp = ligBult.value[index]?.cod_app;
    if (codSocA && matPersA && numFamA && datSoinA && codApp) {
      this.serv.getNumLigApp(codSocA, matPersA, numFamA, datSoinA, codApp).subscribe((data: any) => {
        this.appareil.at(index).patchValue({ num_lig_app: data })
      })
    } else {
      this.appareil.at(index).patchValue({ num_lig_app: index + 1 })
    }

    // Use a small delay to ensure the row is rendered in the DOM
    setTimeout(() => {
      this.startEditingNewRowApp(newLigne);
    }, 50);
  }

  private startEditingNewRowApp(row: any) {
    // Force change detection to ensure template is updated
    this.cdr.detectChanges();

    try {
      // Start editing the row using PrimeNG Table's initRowEdit
      this.tableApp?.initRowEdit(row);
      // curseur directement dans la première case de la nouvelle ligne
      focusPremiereCase(this.tableApp, this.tableApp?.value?.indexOf(row) ?? -1);

      // One more change detection to ensure edit mode is active
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 50);
    } catch (error) {
      console.error('Error starting edit mode for Appareils:', error);
      // Retry once if failed
      setTimeout(() => {
        this.tableApp?.initRowEdit(row);
        this.cdr.detectChanges();
      }, 100);
    }
  }



  removeLigneAppareil(index: number): void {
    this.appareil.removeAt(index);
    this.calculateTotalsAppareil()
  }
  selectedIndexAct: number | null = null;
  confirmAct(index: any, content: any) {
    this.selectedIndexAct = index;
    this.modalService.open(content, { centered: true });
  }

  selectedIndexApp: number | null = null;

  confirmApp(index: any, content: any) {
    this.selectedIndexApp = index;
    this.modalService.open(content, { centered: true });
  }

  /** Visites et médicaments : clé et net en base de chaque ligne enregistrée (chargement ou dernier enregistrement). */
  private cleOrigineLigne = new WeakMap<AbstractControl, any>();
  private netEnBaseLigne = new WeakMap<AbstractControl, number>();
  /** Dernier calcul de net demandé par ligne : une réponse plus ancienne arrivée après est ignorée. */
  private calculNetLigne = new WeakMap<AbstractControl, number>();

  private estRempli(x: any): boolean {
    return x !== null && x !== undefined && String(x).trim() !== '';
  }

  private enNombre(x: any): number {
    const n = Number(String(x ?? '').replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }

  private memoriserEnBase(c: AbstractControl, champCode: string): void {
    const v = c.value;
    this.cleOrigineLigne.set(c, {
      cod_soc: v.cod_soc, mat_pers: v.mat_pers, num_fam: v.num_fam, dat_soin: v.dat_soin, abrv_act: v.abrv_act,
      [champCode]: v[champCode], num_lig: v.num_lig, dat_act: v.dat_act, num_soin: v.num_soin,
    });
    this.netEnBaseLigne.set(c, this.enNombre(v.mnt_net));
  }

  /** Anciennes clés des lignes enregistrées dont le code (visite, médicament) ou la date a changé depuis. */
  private clesLignesModifiees(controles: AbstractControl[], champCode: string): any[] {
    const texte = (x: any) => String(x ?? '').trim().toUpperCase();
    return controles
      .map(c => ({ avant: this.cleOrigineLigne.get(c), maintenant: c.value }))
      .filter(({ avant, maintenant }) => avant && this.estRempli(avant.num_soin)
        && !(texte(avant[champCode]) === texte(maintenant[champCode])
          && this.memeCleActe({ abrv_act: '', cod_act: '', dat_act: avant.dat_act }, { abrv_act: '', cod_act: '', dat_act: maintenant.dat_act })))
      .map(({ avant }) => avant);
  }

  /** Numéros des lignes commencées (code, montant…) mais sans code ou sans date. */
  private lignesIncompletes(tableau: FormArray, champCode: string, autres: string[]): number[] {
    const numeros: number[] = [];
    tableau.controls.forEach((c, i) => {
      const v = c.value;
      const commencee = [champCode, ...autres].some(k => this.estRempli(v[k]));
      if (commencee && (!this.estRempli(v[champCode]) || !this.estRempli(v.dat_act))) numeros.push(i + 1);
    });
    return numeros;
  }

  /** Appel du calcul de net d'une ligne : seule la dernière réponse compte, messages du serveur affichés. */
  private appelNetLigne(ligne: AbstractControl, appel: any, appliquer: (net: number) => void, titre: string): void {
    const numero = (this.calculNetLigne.get(ligne) ?? 0) + 1;
    this.calculNetLigne.set(ligne, numero);
    appel.subscribe({
      next: (data: any) => {
        if (this.calculNetLigne.get(ligne) !== numero) return;
        if (data?.message) {
          Swal.fire({ icon: 'warning', title: titre, text: data.message, confirmButtonText: 'Compris' });
        }
        appliquer(this.enNombre(data?.p_mnt_net));
      },
      error: () => {
        if (this.calculNetLigne.get(ligne) !== numero) return;
        Swal.fire({ icon: 'error', title: 'Net non calculé', text: 'Le calcul du net a échoué. Vérifiez la saisie puis réessayez.', confirmButtonText: 'Compris' });
      },
    });
  }

  /** Clé en base de chaque appareil enregistré, telle qu'au chargement ou au dernier enregistrement. */
  private cleOrigineApp = new WeakMap<AbstractControl, any>();

  private cleApp(v: any): any {
    return {
      cod_soc: v.cod_soc, mat_pers: v.mat_pers, num_fam: v.num_fam, dat_soin: v.dat_soin, abrv_act: v.abrv_act,
      cod_app: v.cod_app, num_lig: v.num_lig, dat_act: v.dat_act, num_soin: v.num_soin,
    };
  }

  /** Anciennes clés des appareils enregistrés dont l'appareil ou la date a changé depuis. */
  private clesAppareilsModifiees(controles: AbstractControl[]): any[] {
    const texte = (x: any) => String(x ?? '').trim().toUpperCase();
    return controles
      .map(c => ({ avant: this.cleOrigineApp.get(c), maintenant: c.value }))
      .filter(({ avant, maintenant }) => avant && avant.num_soin != null && String(avant.num_soin).trim() !== ''
        && !(texte(avant.cod_app) === texte(maintenant.cod_app)
          && this.memeCleActe({ ...avant, cod_act: '' }, { ...maintenant, abrv_act: avant.abrv_act, cod_act: '' })))
      .map(({ avant }) => avant);
  }

  /** Numéros des lignes d'appareils commencées (appareil, montant, code…) mais sans appareil ou sans date. */
  private lignesAppareilsIncompletes(): number[] {
    const rempli = (x: any) => x !== null && x !== undefined && String(x).trim() !== '';
    const numeros: number[] = [];
    this.appareil.controls.forEach((c, i) => {
      const v = c.value;
      const commencee = [v.cod_app, v.mnt_honor, v.prf_cod].some(rempli);
      if (commencee && (!rempli(v.cod_app) || !rempli(v.dat_act))) numeros.push(i + 1);
    });
    return numeros;
  }

  /** Retire la ligne de l'écran (tableau et listes associées) ; une ligne vide est recréée si c'était la dernière. */
  private retirerLigneAppareil(index: number): void {
    this.appareil.removeAt(index);
    this.appareilCode.splice(index, 1);
    this.libAppareil.splice(index, 1);
    this.refEtablisApp.splice(index, 1);
    this.etab_rsoc_appareil.splice(index, 1);
    this.mntNetArrayAppareil.splice(index, 1);

    this.calculateTotalsAppareil();

    if (this.appareil.length === 0) {
      this.addLigneAppareil(0);
    }
  }

  ConfirmDeleteApp(index: number): void {
    // clé en base : si l'appareil ou la date a été changé sans enregistrer, c'est l'ancienne ligne qu'il faut supprimer
    const cleEnBase = this.cleOrigineApp.get(this.appareil.at(index));
    const ligne = cleEnBase ? { ...this.appareil.at(index).value, ...cleEnBase } : this.appareil.at(index).value;
    const present = (v: any) => v !== null && v !== undefined && String(v).trim() !== '';

    // appareil jamais enregistré (pas de numéro de soin ni de ligne) : rien à supprimer en base
    if (!present(ligne.num_soin) || !present(ligne.num_lig) || !present(ligne.mat_pers) || !present(ligne.num_fam)) {
      this.retirerLigneAppareil(index);
      return;
    }

    // clé complète de l'appareil : sans la date de l'acte, le numéro de ligne et le numéro de soin,
    // la vérification répondait toujours « absent » et la ligne n'était retirée que de l'écran
    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
      abrv_act: ligne.abrv_act,
      dat_act: ligne.dat_act,
      cod_app: ligne.cod_app,
      num_lig: ligne.num_lig,
      num_soin: ligne.num_soin,
    };

    this.serv.existeLigBultApp(cle).subscribe({
      next: (exists: boolean) => {
        if (!exists) {
          this.retirerLigneAppareil(index);
          return;
        }
        this.serv.deleteLigBultApp(
          ligne.cod_soc,
          ligne.mat_pers,
          ligne.num_fam,
          ligne.dat_soin,
          ligne.abrv_act,
          ligne.num_lig,
          ligne.cod_app,
          ligne.num_soin,
          ligne.dat_act
        ).subscribe({
          next: () => this.retirerLigneAppareil(index),
          error: (error) => {
            console.error("Erreur lors de la suppression :", error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors de la suppression de l\'appareil',
              confirmButtonText: 'OK'
            });
          }
        });
      },
      error: (error) => {
        // la vérification a échoué : la ligne reste affichée, on ne la retire pas à tort de l'écran
        console.error("Erreur lors de la vérification d'existence :", error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de vérifier l\'appareil avant suppression',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  etab_rsoc_appareil: string[] = []

  onSelectedEtablisApp(selectedValue: any, index: number): void {
    if (!selectedValue || !selectedValue.prf_cod) {
      console.warn('Invalid etablissement selection:', selectedValue);
      return;
    }

    const selectedActe = this.listRefEtablisApp.find(etablis => etablis.prf_cod === selectedValue.prf_cod);

    while (this.refEtablisApp.length <= index) {
      this.refEtablisApp.push('');
      this.etab_rsoc_appareil.push('');
    }

    this.refEtablisApp[index] = selectedValue.prf_cod;
    this.etab_rsoc_appareil[index] = selectedActe?.etab_rsoc || '';

    this.appareil.at(index).patchValue({
      prf_cod: selectedValue.prf_cod
    });
  }

  mntNetArrayAppareil: number[] = [];

  /** Honoraires d'un appareil modifiés : nouveau calcul du net de la ligne. */
  calcul_mnt_net_app(_event: any, index: number) {
    this.recalculerNetAppareil(index);
  }

  /** Dernier calcul demandé par ligne d'appareil : une réponse plus ancienne arrivée après est ignorée. */
  private calculNetAppareil = new WeakMap<AbstractControl, number>();

  /**
   * Net d'un appareil, calculé par le serveur : min(honoraires, prix de l'appareil), avec les règles de l'appareil
   * (droit mensuel, devis, droit périodique) et le plafond CNAM. Les messages de ces règles sont affichés.
   */
  recalculerNetAppareil(index: number): void {
    const ligne = this.appareil.at(index);
    if (!ligne) return;
    const v = ligne.value;
    const nombre = (x: any) => { const n = Number(String(x ?? '').replace(',', '.')); return isNaN(n) ? 0 : n; };
    const rempli = (x: any) => x !== null && x !== undefined && String(x).trim() !== '';
    const appliquer = (net: number) => {
      this.mntNetArrayAppareil[index] = net;
      ligne.patchValue({ mnt_net: net });
      this.calculateTotalsAppareil();
    };

    if (!rempli(v.cod_app) || !rempli(v.mnt_honor) || nombre(v.mnt_honor) <= 0) {
      appliquer(0);
      return;
    }

    const numero = (this.calculNetAppareil.get(ligne) ?? 0) + 1;
    this.calculNetAppareil.set(ligne, numero);

    this.serv.calculer_montant_net_app(
      this.formBuletinSoin.get('cod_soc')?.value, this.formBuletinSoin.get('mat_pers')?.value,
      this.formBuletinSoin.get('num_fam')?.value, this.formBuletinSoin.get('dat_soin')?.value,
      nombre(v.mnt_honor), v.cod_app, null,
    ).subscribe({
      next: (data: any) => {
        if (this.calculNetAppareil.get(ligne) !== numero) return;   // une modification plus récente est en cours
        if (data?.message) {
          Swal.fire({ icon: 'warning', title: 'Appareil', text: data.message, confirmButtonText: 'Compris' });
        }
        appliquer(nombre(data?.p_mnt_net));
      },
      error: () => {
        if (this.calculNetAppareil.get(ligne) !== numero) return;
        Swal.fire({ icon: 'error', title: 'Net non calculé', text: 'Le calcul du net de l\x27appareil a échoué. Réessayez.', confirmButtonText: 'Compris' });
      },
    });
  }

  totalHonorairesAppareil: number = 0;
  totalNetAppareil: number = 0;
  calculateTotalsAppareil() {
    this.totalHonorairesAppareil = this.appareil.controls.reduce((sum, ligne) => {
      const honor = parseFloat((ligne.get('mnt_honor')?.value || '0')) || 0;
      return sum + honor;
    }, 0);

    this.totalNetAppareil = this.appareil.controls.reduce((sum, ligne) => {
      const net = parseFloat((ligne.get('mnt_net')?.value || '0')) || 0;
      return sum + net;
    }, 0);
  }

  verif_indice_app(item: any, index: any) {
    const ligPhar = this.ligAppareilForm.get('appareil') as FormArray;
    this.serv.verif_indice(ligPhar.value[index].abrv_act, this.formBuletinSoin.get('cod_fil')?.value, this.formBuletinSoin.get('cod_assur')?.value, ligPhar.value[index].abrv_act.indice).
      subscribe((data: any) => {
        if (data.reponse != null) {
          Swal.fire({
            title: 'Message',
            text: data.reponse,
            icon: 'error',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });

          item.target.value = '';
        }
      })
  }


  /* Fin Traitement des appareils*/


  totalHonorairesLigBult: number = 0;
  totalNetLigBult: number = 0;



  /** Actes mutuelle dans l'ordre de leur numéro de ligne (la requête du serveur ne les trie pas). */
  private trierActesMutuelle(data: any): any[] {
    return (Array.isArray(data) ? [...data] : []).sort((a, b) => (Number(a?.num_lig) || 0) - (Number(b?.num_lig) || 0));
  }

  calculerTotaux() {
    // remis à zéro quand il n'y a aucun acte (sinon les totaux du bulletin précédent restaient affichés)
    const lignes = Array.isArray(this.ligBult) ? this.ligBult : [];
    this.totalHonorairesLigBult = lignes.reduce((sum, item) => sum + (Number(item?.mnt_honor) || 0), 0);
    this.totalNetLigBult = lignes.reduce((sum, item) => sum + (Number(item?.mnt_net) || 0), 0);
  }

  /** Actes mutuelle du bénéficiaire à la date de soin, avec leur libellé (onglet « Consultation actes Mut »). */
  chargerActesMutuelle() {
    const soc = String(this.formBuletinSoin.get('cod_soc')?.value ?? '').trim();
    const mat = String(this.formBuletinSoin.get('mat_pers')?.value ?? '').trim();
    const fam = String(this.formBuletinSoin.get('num_fam')?.value ?? '').trim();   // 0 = l'adhérent lui-même
    const datSoin = this.dateSoinComplete();
    if (!soc || !mat || fam === '' || !datSoin) {
      this.ligBult = [];
      this.calculerTotaux();
      return;
    }
    const demande = [soc, mat, fam, datSoin].join('|');
    this.demandeActesMutuelle = demande;
    this.serv.getLigBultCons(soc, mat, fam, datSoin).subscribe({
      next: (data: any) => {
        if (this.demandeActesMutuelle !== demande) return;   // une réponse plus ancienne arrive après la nouvelle
        this.ligBult = this.trierActesMutuelle(data);
        this.calculerTotaux();
      },
      error: (err: any) => {
        if (this.demandeActesMutuelle !== demande) return;
        // repli : liste sans libellé plutôt que « Aucun acte » si la consultation avec libellé échoue
        console.error('Erreur lors du chargement des actes mutuelle (avec libellé) :', err);
        this.serv.getLigBult(soc, mat, fam, datSoin).subscribe({
          next: (data: any) => {
            if (this.demandeActesMutuelle !== demande) return;
            this.ligBult = this.trierActesMutuelle(data);
            this.calculerTotaux();
          },
          error: () => {
            if (this.demandeActesMutuelle !== demande) return;
            this.ligBult = [];
            this.calculerTotaux();
          }
        });
      }
    });
  }
  private demandeActesMutuelle = '';

  startRowEditActes(row: any) {
    try {
      this.tableActes?.initRowEdit(row)
      setTimeout(() => { this.cdr.detectChanges() }, 50)
    } catch (e) {
      setTimeout(() => { this.tableActes?.initRowEdit(row); this.cdr.detectChanges() }, 100)
    }
  }
  closeRowEditActes(row: any) { this.tableActes?.cancelRowEdit(row) }
  startRowEditPhar(row: any) {
    try {
      this.tablePhar?.initRowEdit(row)
      setTimeout(() => { this.cdr.detectChanges() }, 50)
    } catch (e) {
      setTimeout(() => { this.tablePhar?.initRowEdit(row); this.cdr.detectChanges() }, 100)
    }
  }
  closeRowEditPhar(row: any) { this.tablePhar?.cancelRowEdit(row) }
  startRowEditVisite(row: any) {
    try {
      this.tableVisite?.initRowEdit(row)
      setTimeout(() => { this.cdr.detectChanges() }, 50)
    } catch (e) {
      setTimeout(() => { this.tableVisite?.initRowEdit(row); this.cdr.detectChanges() }, 100)
    }
  }
  closeRowEditVisite(row: any) { this.tableVisite?.cancelRowEdit(row) }
  startRowEditApp(row: any) {
    try {
      this.tableApp?.initRowEdit(row)
      setTimeout(() => { this.cdr.detectChanges() }, 50)
    } catch (e) {
      setTimeout(() => { this.tableApp?.initRowEdit(row); this.cdr.detectChanges() }, 100)
    }
  }
  closeRowEditApp(row: any) { this.tableApp?.cancelRowEdit(row) }
}
