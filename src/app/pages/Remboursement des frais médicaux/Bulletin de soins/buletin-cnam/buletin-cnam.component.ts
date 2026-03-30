import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { BulletinSoinService } from '../bulletin-soin.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SaveService } from 'src/app/shared/Service/save.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaginationService } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { forkJoin, map, Subject, takeUntil, tap } from 'rxjs';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-buletin-cnam',
  templateUrl: './buletin-cnam.component.html',
  styleUrl: './buletin-cnam.component.scss'
})
export class BuletinCNAMComponent {
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
  visiteCode: string[] = []
  appareilCode: string[] = []
  Med: string[] = []
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
    public service: PaginationService, private cdr: ChangeDetectorRef) {
    this.formBuletinSoin = this.fb.group({
      cod_soc: [this.token.getUser().codSoc],
      mat_pers: [''],
      num_fam: [''],
      dat_soin: [''],
      cod_bord: [''],
      cod_assur: [''],
      num_soin: [''],
      ord_bult: [''],
      tot_honor: [0],
      tot_net: [0],
      tot_remb: [0],
      reg_remb: [''],
      cod_malad: [''],
      num_pec: [''],
      cod_fil: [''],
      num_assur: [''],
      dat_prev_accouch: [''],
      nat_bult: ['C'],
      mat_pers_conj: [''],
      num_ass_conj: [''],
      dat_saisie: [new Date().toLocaleDateString().substring(0, 10)],
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
    this.getPersonnel()
    this.getRegimeRemb()
    this.getBultSoin()
    this.calculerTotaux()
    //this.getBultSoin()
    this.saveService.isSearch$
      .pipe(takeUntil(this.destroy$))
      .subscribe((canSearch) => {
        this.isSearch = canSearch
        console.log("is search valid", canSearch)
      })

    this.saveService.add$.subscribe((reset) => {
      if (reset) {
        this.resetForm();
      }
    });
  }
  ngOnDestroy() {
    // Clear the callback to avoid memory leaks

    this.destroy$.next();
    this.destroy$.complete();
    this.saveService.clearSaveCallback();
  }

  addBultSoin() {

    if (!this.formBuletinSoin.valid) {
      Swal.fire('Formulaire invalide', 'Veuillez remplir le formulaire', 'warning');
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

    // Debug logging
    console.log('🔍 Header before toNullIfEmpty:', header);
    console.log('🔍 reg_remb value:', header.reg_remb, 'Type:', typeof header.reg_remb);

    // Convert empty strings → null
    Object.keys(header).forEach(k => header[k] = toNullIfEmpty(header[k]));

    console.log('🔍 Header after toNullIfEmpty:', header);
    console.log('🔍 reg_remb after conversion:', header.reg_remb);

    /* ---------- SAVE HEADER ---------- */

    this.serv.addBultSoin(header).subscribe({

      next: () => {

        const clean = (obj: any, remove: string[] = []) => {
          const o = { ...obj };
          remove.forEach(f => delete o[f]);
          Object.keys(o).forEach(k => o[k] = toNullIfEmpty(o[k]));
          return o;
        };

        const visites = formArrays[0].controls.filter(c => c.valid).map(c => clean(c.value));
        const acts = formArrays[2].controls.filter(c => c.valid).map(c => clean(c.value, ['nbr_piece', 'nbr_vign', 'obs']));
        const meds = formArrays[1].controls.filter(c => c.valid).map(c => clean(c.value, ['nbr_piece', 'nbr_vign', 'obs']));
        const apps = formArrays[3].controls.filter(c => c.valid).map(c => clean(c.value));

        this.serv.addAllLigBult(visites, acts, meds, apps).subscribe({
          next: () => {
            Swal.fire('Succès', 'Bulletin enregistré avec succès', 'success');
            this.getBultSoin();
            this.resetForm();
          },
          error: () => this.showServerError()
        });
      },

      error: () => this.showServerError()
    });
  }

  resetForm() {
    this.ligPretForm.reset();
    this.ligPharForm.reset();
    this.formBuletinSoin.reset();
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
    this.refEtablis = [];
    this.refEtablisApp = [];
    this.refEtablisPhar = [];
    this.refEtablisVisit = [];
    this.etab_rsoc_visite = [];
    this.etab_rsoc = [];
    this.etab_rsoc_phar = [];
    this.etab_rsoc_appareil = [];
    this.acte = [];
    this.libAct = [];
    this.refEtablis = [];
    this.etab_rsoc = [];
    this.Med = [];
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
    console.log('item.num_fam :', item)
    this.matricule = item.mat_pers
    this.PEC = item.num_pec

    this.serv.getAdherent(this.token.getUser().codSoc, item.mat_pers).subscribe((data: any) => {
      this.listAdherent = Array.isArray(data) ? data : [];
      this.numFam = item.num_fam;

      // Patch name if num_fam is present
      if (item.num_fam !== null && item.num_fam !== undefined) {
        const adherent = this.listAdherent.find(a => a.num_fam == item.num_fam);
        if (adherent) {
          this.nomAdherent = adherent.nom_PREN;
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

    // 🔥 FIX: Load medicine list FIRST, then load the table data
    this.serv.getMeds(item.cod_fil, item.cod_assur).subscribe((medData: any) => {
      this.listMed = medData;
      this.columnsMed = [
        { key: "cod_med", label: "Code" },
        { key: "lib_med", label: "Libelle" },
        { key: "med_prix", label: "Mdc Prix" },
      ];

      // Now load the pharmacy data AFTER medicines are loaded
      this.serv.getLigBultMed(item.cod_soc, item.mat_pers, item.num_fam, item.dat_soin).subscribe((data: any) => {
        this.loadDataIntoTableMed(data);
        this.calculateTotalsPhar();
      });
    });

    // Load actes
    this.serv.getActes(this.parente, this.sexe, item.cod_fil, item.num_assur).subscribe((acteList: any) => {
      this.listActe = acteList; // ✅ Store the master list

      this.columnActe = [
        { key: "abrv_act", label: "Abrv acte" },
        { key: "lib_act", label: "Libelle" },
      ];

      console.log("listActe (master list):", this.listActe);

      // Now load the saved actes from database
      this.serv.getLigBultAct(item.cod_soc, item.mat_pers, item.num_fam, item.dat_soin).subscribe((data: any) => {
        // DON'T overwrite this.listActe here!
        console.log("Loaded actes from DB:", data);
        this.loadDataIntoTable(data);
      });
    });

    // Load visits
    this.serv.getLigBultVisit(item.cod_soc, item.mat_pers, item.num_fam, item.dat_soin).subscribe((data: any) => {
      this.loadDataIntoTableVisite(data);
      this.calculateTotalsVisite();
    })

    // Load apparatus
    this.serv.getLigBultApp(item.cod_soc, item.mat_pers, item.num_fam, item.dat_soin).subscribe((data: any) => {
      this.loadDataIntoTablApp(data);
      this.calculateTotalsAppareil();
    })

    // Load plafond
    this.serv.get_plafond_cnam(this.token.getUser().codSoc, item.mat_pers, item.dat_soin, this.datNais,
      item.cod_assur, item.dat_saisie).subscribe((data: any) => {
        this.ageAn = data.ageAn;
        this.ageMois = data.ageMois;
        this.soldPlafond = Number(data.soldPlafond).toFixed(3);
        const val = Number(data.soldPlafondEstim);
        this.soldPlafondEstim = isNaN(val) ? '0.000' : val.toFixed(3);
      })
  }

  loadDataIntoTable(data: any[]) {
    // Clear existing arrays first
    this.acte = [];
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
          const selectedActe = this.listActe.find(acte => acte.abrv_act === item.abrv_act);
          this.libAct.push(selectedActe?.lib_act || '');

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
            mnt_remb: [Number(item.mnt_remb).toFixed(3)],
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
          }))
        )
      );
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
        num_lig: [item.num_lig],
        mnt_honor: [Number(item.mnt_honor).toFixed(3)],
        mnt_remb: [Number(item.mnt_remb).toFixed(3)],
        mnt_net: [Number(item.mnt_net).toFixed(3)],
        indice: [item.indice],
        dat_act: [item.dat_act],
        prf_typ: [item.prf_typ],
        prf_cod: [item.prf_cod],
        prix_visit: [item.prix_visit],
        taux_remb: [item.taux_remb],
        mut_mnt_net: [item.mut_mnt_net],
      }))));

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
        mnt_honor: [Number(item.mnt_honor).toFixed(3)],
        mnt_remb: [Number(item.mnt_remb).toFixed(3)],
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

      this.calculateTotalsPhar();
      console.log("this.ligPharForm :", this.ligPharForm.value);
      console.log("this.libMed :", this.libMed);
      console.log("this.Med :", this.Med);
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
        mnt_honor: [Number(item.mnt_honor).toFixed(3)],
        mnt_remb: [Number(item.mnt_remb).toFixed(3)],
        mnt_net: [Number(item.mnt_net).toFixed(3)],
        indice: [item.indice],
        dat_act: [item.dat_act],
        prf_typ: [item.prf_typ],
        prf_cod: [item.prf_cod],
        accord_app: [item.accord_med],
        num_pec_app: [item.num_pec_app],
        num_lig_app: [item.num_lig_app],
        mut_mnt_net: [item.mut_mnt_net],
      }))));

      this.calculateTotalsAppareil();
    });
  }

  getPersonnel() {
    this.serv.getPersonnelBultSoin(this.token.getUser().codSoc).subscribe(
      (data: any) => {
        this.listPersonnel = Array.isArray(data) ? data : [];

        this.columnsMat = [
          { key: "mat_pers", label: "Matricule" },
          { key: "mat_int", label: "Mat. Administratif" },
          { key: "dat_nais", label: "Date naissance" },
          { key: "nom", label: "Nom & Prénom" },
          { key: "num_retr", label: "Id CNRPS" },
        ];
      },
      error => {
        console.error('Error loading personnel:', error);
        this.listPersonnel = [];
      }
    );
  }


  onSelectedAdherent(item: any) {
    if (!item) {
      console.warn('No adherent selected');
      return;
    }

    console.log("onSelectedAdherent :", item);
    this.nomAdherent = item.nom_PREN;
    this.formBuletinSoin.patchValue({
      num_fam: item.num_fam
    });

    this.serv.getDatNais(this.token.getUser().codSoc, this.formBuletinSoin.get('mat_pers')?.value, item.num_fam).subscribe(
      (data: any) => {
        this.datNais = data?.dat_nais || '';
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

        this.serv.getActes(this.sexe, this.parente, codFil, codAssur).subscribe(
          (data: any) => {
            this.listActe = Array.isArray(data) ? data : [];

            this.columnActe = [
              { key: "abrv_act", label: "Abrv acte" },
              { key: "lib_act", label: "Libelle" },
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
            console.log("listVisite :", this.listVisite);

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

    console.log("item :", item);
    this.numAssur = item.numRetr;
    this.nomPers = item.nom;
    this.codAssur = item.codLieuGeog;
    this.libAssur = item.libLieu;
    this.cod_fil = item.datEmb;
    this.lib_fill = item.lib_fill;
    this.lib_assur = item.lib_assur;
    this.num_retr = item.num_retr;

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
          { key: "nom_PREN", label: "Nom & Prénom" },
        ];

        // If num_fam is provided in item (e.g. from file parsing), patch it and the name
        if (item.num_fam !== null && item.num_fam !== undefined) {
          this.numFam = item.num_fam;
          const adherent = this.listAdherent.find(a => a.num_fam == item.num_fam);
          if (adherent) {
            this.nomAdherent = adherent.nom_PREN;
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


  controleDatSoin(item: any) {
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
    console.log(this.formBuletinSoin.get('dat_soin')?.value)
    this.serv.get_duree_bulletin(item.target.value, this.formBuletinSoin.get('cod_assur')?.value).subscribe((data: any) => {
      console.log("data :", data)
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

    this.serv.getLigBult(this.formBuletinSoin.get('cod_soc')?.value, this.formBuletinSoin.get('mat_pers')?.value,
      this.formBuletinSoin.get('num_fam')?.value, this.formBuletinSoin.get('dat_soin')?.value).subscribe((data: any) => {
        this.ligBult = data
        this.calculerTotaux()
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
      event.target.value, this.parente, this.sexe
    ).subscribe((data: any) => {
      this.reponseVerifModRemb = data;
      console.log("this.showMsgMalad :", this.reponseVerifModRemb);
      // Vérification des valeurs retournées
      this.showMsgMalad = data.msg_malad === "true";
      this.showMsgDatAccouch = data.msg_dat_accouch === "true";
      this.showMsgPriseCharge = data.msg_prise_charge === "true";

      console.log("this.showMsgMalad :", this.showMsgMalad);
      console.log("this.showMsgDatAccouch :", this.showMsgDatAccouch);
      console.log("this.showMsgPriseCharge :", this.showMsgPriseCharge);

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

  // confirm(content: any, id: any) {
  //   console.log("annee:", id);
  //   this.deleteId = id;
  //   this.modalService.open(content, { centered: true });
  // }
  /* Traitement des actes*/

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
      num_lig: ['1'],
      let_cod: [''],
      cot_act: [''],
      act_prix: [''],
      mnt_honor: [''],
      mnt_remb: [''],
      accord_act: [''],
      mnt_net: [''],
      indice: [''],
      dat_act: [''],
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

    const codSoc = this.formBuletinSoin.get('cod_soc')?.value;
    const matPers = this.formBuletinSoin.get('mat_pers')?.value;
    const numFam = this.formBuletinSoin.get('num_fam')?.value;
    const datSoin = this.formBuletinSoin.get('dat_soin')?.value;

    // ✅ Only call API if all required values exist
    if (codSoc && matPers && numFam && datSoin) {
      this.serv.getNumLigAct(codSoc, matPers, numFam, datSoin).subscribe(
        (data: any) => {
          this.lignes.at(index).patchValue({ num_lig: data });
        },
        (error) => {
          console.error('Error fetching num_lig:', error);
          this.lignes.at(index).patchValue({ num_lig: index + 1 });
        }
      );
    } else {
      // Set default value when form data is not ready
      this.lignes.at(index).patchValue({ num_lig: index + 1 });
    }

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

  // removeLigne(index: number): void {
  //   this.lignes.removeAt(index);
  //   this.calculateTotals(); // Met à jour les totaux

  // }
  selectedIndex: number | null = null;
  confirm(index: any, content: any, id: any) {
    this.selectedIndex = index
    console.log("this.selectedIndex:", this.selectedIndex);
    //this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDelete(index: number): void {
    const ligne = this.lignes.at(index).value;
    console.log("ligne:", ligne);
    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
      abrv_act: ligne.abrv_act,
      cod_act: ligne.cod_act,
      num_lig: ligne.num_lig,
      dat_act: ligne.dat_act
    };

    console.log("Clé à vérifier :", cle);

    this.serv.existeLigBultAct(cle).subscribe({
      next: (exists: boolean) => {
        console.log("Enregistrement existant :", exists);

        if (exists) {
          this.serv.deleteLigBultAct(
            ligne.cod_soc,
            ligne.mat_pers,
            ligne.num_fam,
            ligne.dat_soin,
            ligne.abrv_act,
            ligne.num_lig,
            ligne.dat_act,
            ligne.cod_act
          ).subscribe({
            next: () => {
              // Remove from FormArray
              this.lignes.removeAt(index);

              // Remove from all related arrays
              this.acte.splice(index, 1);
              this.libAct.splice(index, 1);
              this.refEtablis.splice(index, 1);
              this.etab_rsoc.splice(index, 1);
              this.mntNetArray.splice(index, 1);

              this.calculateTotals();

              // Add a new empty line if this was the last one
              if (this.lignes.length === 0) {
                this.addLigne(0);
              }
            },
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
        } else {
          // Remove from FormArray
          this.lignes.removeAt(index);

          // Remove from all related arrays
          this.acte.splice(index, 1);
          this.libAct.splice(index, 1);
          this.refEtablis.splice(index, 1);
          this.etab_rsoc.splice(index, 1);
          this.mntNetArray.splice(index, 1);

          this.calculateTotals();

          // Add a new empty line if this was the last one
          if (this.lignes.length === 0) {
            this.addLigne(0);
          }
        }
      },
      error: (error) => {
        console.error("Erreur lors de la vérification d'existence :", error);
        // Still remove locally even if check fails
        this.lignes.removeAt(index);
        this.acte.splice(index, 1);
        this.libAct.splice(index, 1);
        this.refEtablis.splice(index, 1);
        this.etab_rsoc.splice(index, 1);
        this.mntNetArray.splice(index, 1);

        this.calculateTotals();

        if (this.lignes.length === 0) {
          this.addLigne(0);
        }
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
    this.libAct[index] = selectedActe?.lib_act || '';

    this.lignes.at(index).patchValue({
      abrv_act: selectedValue.abrv_act,
      cod_act: selectedValue.cod_act
    });
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

    this.visite.at(index).patchValue({
      cod_visit: selectedValue.cod_Visit,
      abrv_act: selectedValue.abrv_Act
    });
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

    this.appareil.at(index).patchValue({
      cod_app: selectedValue.cod_app,
      abrv_act: selectedValue.abrv_act
    });
  }
  mntNetArray: number[] = []; // Declare an array to store the amounts for each line

  calcul_mnt_net(event: any, index: number) {
    const ligBult = this.ligPretForm.get('lignes') as FormArray;
    if (event.target.value == null) {
      Swal.fire({
        title: 'Message',
        text: 'Mnt honor est obligatoire',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
    }
    console.log("ligBult :", ligBult.value[index].abrv_act)
    this.serv.calculer_montant_net_act(this.formBuletinSoin.get("cod_soc")?.value, this.formBuletinSoin.get("mat_pers")?.value, ligBult.value[index].cod_act, event.target.value,
      this.formBuletinSoin.get("dat_soin")?.value, this.selectedAct.act_prix, this.selectedAct.taux_act, 0, 0).subscribe((data: any) => {


        this.mntNet = data.p_mnt_net ?? 0; // Assurez-vous que la valeur est 0 si null ou undefined

        this.mntNetArray[index] = this.mntNet === 0 ? 0 : data.p_mnt_net;
        this.lignes.at(index).patchValue({ mnt_net: this.mntNetArray[index] });
        this.calculateTotals();
        console.log(this.mntNetArray)
      })
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
      console.log("ligne :", ligne.get('mnt_honor')?.value)
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
      indice: [''],
      mnt_honor: [''],
      mnt_net: [''],
      mnt_remb: [''],
      accord_med: [''],
      dat_act: [''],
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
    console.log("selectedIndexMed:", this.selectedIndexMed);
    this.modalService.open(content, { centered: true });
  }
  ConfirmDeleteMed(index: number): void {
    const ligne = this.phar.at(index).value;
    console.log("ligne:", ligne);

    // 🔥 SIMPLIFIED: Just try to delete directly
    this.serv.deleteLigBultMed(
      ligne.cod_soc,
      ligne.mat_pers,
      ligne.num_fam,
      ligne.dat_soin,
      ligne.abrv_act,
      ligne.num_lig_med,
      ligne.cod_med
    ).subscribe({
      next: (response) => {
        console.log("Suppression effectuée:", response);

        // Remove from FormArray and all related arrays
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

        Swal.fire({
          icon: 'success',
          title: 'Suppression réussie',
          text: 'Le médicament a été supprimé avec succès',
          confirmButtonText: 'OK',
          timer: 2000
        });
      },
      error: (error) => {
        console.error("Erreur lors de la suppression :", error);

        // Still remove locally even if DB delete fails
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

        // Only show error if it's a real database error, not "record not found"
        if (error.status !== 404) {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Erreur lors de la suppression du médicament',
            confirmButtonText: 'OK'
          });
        }
      }
    });
  }
  verif_indice_phar(item: any, index: any) {
    const ligPhar = this.ligPharForm.get('phar') as FormArray;
    this.serv.verif_indice(ligPhar.value[index].abrv_act, this.formBuletinSoin.get('cod_fil')?.value, this.formBuletinSoin.get('cod_assur')?.value, ligPhar.value[index].abrv_act.indice).
      subscribe((data: any) => {
        console.log("data", data)
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

    console.log("Checking vignettes for:", currentLine);

    this.serv.verif_vign(
      currentLine.abrv_act,
      this.formBuletinSoin.get('cod_fil')?.value,
      this.formBuletinSoin.get('cod_assur')?.value,
      currentLine.mnt_honor,
      value  // ✅ Use the input value directly
    ).subscribe({
      next: (data: any) => {
        console.log("verif_vign response:", data);

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

    console.log("Checking pieces for:", currentLine);

    this.serv.verif_piece(
      currentLine.abrv_act,
      this.formBuletinSoin.get('cod_fil')?.value,
      this.formBuletinSoin.get('cod_assur')?.value,
      currentLine.mnt_honor,
      value  // ✅ Use the input value directly
    ).subscribe({
      next: (data: any) => {
        console.log("verif_piece response:", data);

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
  calcul_mnt_netPhar(event: any, index: number) {
    const ligPhar = this.ligPharForm.get('phar') as FormArray;
    console.log("ligBult :", ligPhar)
    this.serv.calculer_montant_net_med(this.formBuletinSoin.get("cod_soc")?.value, this.formBuletinSoin.get("mat_pers")?.value, ligPhar.value[index].cod_med
      , event.target.value, this.formBuletinSoin.get("dat_soin")?.value, this.selectedMed.prix_remb,
      ligPhar.value[index].indice, 0, 0).subscribe((data: any) => {
        this.mntNetPhar = data.p_mnt_net

        this.mntNetArrayPhar[index] = data.p_mnt_net;
        this.phar.at(index).patchValue({ mnt_net: this.mntNetArrayPhar[index] });
        this.calculateTotalsPhar();
        console.log(this.mntNetArray)
      })
  }
  totalHonorairesPhar: number = 0;
  totalNetPhar: number = 0;
  calculateTotalsPhar() {
    console.log("this.phar :", this.phar)
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

    this.phar.at(index).patchValue({
      cod_med: selectedValue.cod_med,
      abrv_act: selectedValue.abrv_act,
      mdc_prix: selectedValue.mdc_prix
    });
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
      dat_soin: ['', Validators.required],
      abrv_act: [''],
      cod_visit: ['', Validators.required],
      num_lig: [''],
      mnt_honor: [''],
      mnt_remb: [''],
      mnt_net: [''],
      indice: [''],
      dat_act: [''],
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
    console.log("selectedIndexVisit:", this.selectedIndexVisit);
    this.modalService.open(content, { centered: true });
  }
  ConfirmDeleteVisit(index: number): void {
    const ligne = this.visite.at(index).value;
    console.log("ligne:", ligne);
    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
      abrv_act: ligne.abrv_act,
      cod_visit: ligne.cod_visit,
      dat_act: ligne.dat_act,
    };

    console.log("Clé à vérifier :", cle);

    this.serv.existeLigBultVisit(cle).subscribe({
      next: (exists: boolean) => {
        console.log("Enregistrement existant :", exists);

        if (exists) {
          this.serv.deleteLigBultVisit(
            ligne.cod_soc,
            ligne.mat_pers,
            ligne.num_fam,
            ligne.dat_soin,
            ligne.abrv_act,
            ligne.num_lig,
            ligne.dat_act,
            ligne.cod_visit
          ).subscribe({
            next: () => {
              // Remove from FormArray
              this.visite.removeAt(index);

              // Remove from all related arrays
              this.visiteCode.splice(index, 1);
              this.libVisite.splice(index, 1);
              this.refEtablisVisit.splice(index, 1);
              this.etab_rsoc_visite.splice(index, 1);
              this.mntNetArrayVisite.splice(index, 1);

              this.calculateTotalsVisite();

              // Add a new empty line if this was the last one
              if (this.visite.length === 0) {
                this.addLigneVisite();
              }
            },
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
        } else {
          // Remove from FormArray
          this.visite.removeAt(index);

          // Remove from all related arrays
          this.visiteCode.splice(index, 1);
          this.libVisite.splice(index, 1);
          this.refEtablisVisit.splice(index, 1);
          this.etab_rsoc_visite.splice(index, 1);
          this.mntNetArrayVisite.splice(index, 1);

          this.calculateTotalsVisite();

          // Add a new empty line if this was the last one
          if (this.visite.length === 0) {
            this.addLigneVisite();
          }
        }
      },
      error: (error) => {
        console.error("Erreur lors de la vérification d'existence :", error);
        // Still remove locally even if check fails
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
  calcul_mnt_net_visite(event: any, index: number) {
    const ligBult = this.ligVisiteForm.get('visite') as FormArray;
    if (event.target.value == null) {
      Swal.fire({
        title: 'Message',
        text: 'Mnt honor est obligatoire',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
    }
    console.log("ligBult :", ligBult.value[index].abrv_act)
    this.serv.calculer_montant_net_visit(this.formBuletinSoin.get("cod_soc")?.value, this.formBuletinSoin.get("mat_pers")?.value, ligBult.value[index].cod_visit,
      event.target.value, this.formBuletinSoin.get("dat_soin")?.value, this.selectedVisit.prix_Visit, this.selectedVisit.taux_Remb, '0').subscribe((data: any) => {
        this.mntNet = data.p_mnt_net

        this.mntNetArrayVisite[index] = data.p_mnt_net;
        this.visite.at(index).patchValue({ mnt_net: this.mntNetArrayVisite[index] });
        this.calculateTotalsVisite();
        console.log(this.mntNetArrayVisite)
      })
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
        console.log("data", data)
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
      mnt_honor: [''],
      mnt_net: [''],
      mnt_remb: [''],
      accord_app: [''],
      indice: [''],
      dat_act: [''],
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
    console.log("selectedIndexAct:", this.selectedIndexAct);
    this.modalService.open(content, { centered: true });
  }

  selectedIndexApp: number | null = null;
  confirmApp(index: any, content: any) {
    this.selectedIndexApp = index;
    console.log("selectedIndexApp:", this.selectedIndexApp);
    this.modalService.open(content, { centered: true });
  }
  ConfirmDeleteApp(index: number): void {
    const ligne = this.appareil.at(index).value;
    console.log("ligne:", ligne);
    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
      abrv_act: ligne.abrv_act,
      cod_app: ligne.cod_app,
      num_lig_app: ligne.num_lig_app,
    };

    console.log("Clé à vérifier :", cle);

    this.serv.existeLigBultApp(cle).subscribe({
      next: (exists: boolean) => {
        console.log("Enregistrement existant :", exists);

        if (exists) {
          this.serv.deleteLigBultApp(
            ligne.cod_soc,
            ligne.mat_pers,
            ligne.num_fam,
            ligne.dat_soin,
            ligne.abrv_act,
            ligne.num_lig_app,
            ligne.cod_app
          ).subscribe({
            next: () => {
              // Remove from FormArray
              this.appareil.removeAt(index);

              // Remove from all related arrays
              this.appareilCode.splice(index, 1);
              this.libAppareil.splice(index, 1);
              this.refEtablisApp.splice(index, 1);
              this.etab_rsoc_appareil.splice(index, 1);
              this.mntNetArrayAppareil.splice(index, 1);

              this.calculateTotalsAppareil();

              // Add a new empty line if this was the last one
              if (this.appareil.length === 0) {
                this.addLigneAppareil(0);
              }
            },
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
        } else {
          // Remove from FormArray
          this.appareil.removeAt(index);

          // Remove from all related arrays
          this.appareilCode.splice(index, 1);
          this.libAppareil.splice(index, 1);
          this.refEtablisApp.splice(index, 1);
          this.etab_rsoc_appareil.splice(index, 1);
          this.mntNetArrayAppareil.splice(index, 1);

          this.calculateTotalsAppareil();

          // Add a new empty line if this was the last one
          if (this.appareil.length === 0) {
            this.addLigneAppareil(0);
          }
        }
      },
      error: (error) => {
        console.error("Erreur lors de la vérification d'existence :", error);
        // Still remove locally even if check fails
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
  calcul_mnt_net_app(event: any, index: number) {
    const ligBult = this.ligAppareilForm.get('appareil') as FormArray;
    if (event.target.value == null) {
      Swal.fire({
        title: 'Message',
        text: 'Mnt honor est obligatoire',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
    }
    console.log("ligBult :", ligBult.value[index].abrv_act)
    this.serv.calculer_montant_net_app(this.formBuletinSoin.get("cod_soc")?.value, this.formBuletinSoin.get("mat_pers")?.value, this.formBuletinSoin.get("num_fam")?.value,
      this.formBuletinSoin.get("dat_soin")?.value, event.target.value, ligBult.value[index].cod_app, 0).subscribe((data: any) => {
        this.mntNet = data.p_mnt_net ?? 0

        this.mntNetArrayAppareil[index] = this.mntNet === 0 ? 0 : data.p_mnt_net;
        this.appareil.at(index).patchValue({ mnt_net: this.mntNetArrayAppareil[index] });
        this.calculateTotalsAppareil();
        console.log(this.mntNetArrayVisite)
      })
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
        console.log("data", data)
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



  calculerTotaux() {
    if (this.ligBult && this.ligBult.length) {
      this.totalHonorairesLigBult = this.ligBult.reduce((sum, item) => sum + (item.mnt_honor || 0), 0);
      this.totalNetLigBult = this.ligBult.reduce((sum, item) => sum + (item.mnt_net || 0), 0);
    }
  }

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
