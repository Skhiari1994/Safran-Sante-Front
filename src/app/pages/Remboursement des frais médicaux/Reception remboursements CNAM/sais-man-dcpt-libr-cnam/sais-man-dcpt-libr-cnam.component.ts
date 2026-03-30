import { Component } from "@angular/core";
import { ReceptionRemboursementService } from "../reception-remboursement.service";
import { HttpErrorResponse } from "@angular/common/http";
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { PaginationService } from "src/app/core/services/pagination.service";
import { TokenStorage } from "src/app/account/token-storage.service";
import { BulletinSoinService } from "../../Bulletin de soins/bulletin-soin.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SaveService } from "src/app/shared/Service/save.service";
import Swal from "sweetalert2";
import { AdherentService } from "src/app/pages/Adherent/adherent.service";
import { IndemnitesService } from "src/app/pages/Indemnites/indemnites.service";
@Component({
  selector: 'app-sais-man-dcpt-libr-cnam',
  templateUrl: './sais-man-dcpt-libr-cnam.component.html',
  styleUrl: './sais-man-dcpt-libr-cnam.component.scss'
})

export class SaisManDcptLibrCnamComponent {

  imageURL: string | undefined;
  isReadOnly: boolean = true;  // Set to 'true' to visually make it readonly

  dataRows!: any[];
  listDataFiltred!: any[];
  selectedCodeLieu: string = '';
  BordArriverForm!: FormGroup;
  formRemboursement!: FormGroup;
  AllBordArrive: any[] = [];

  listActivite!: any[];
  CarteSoinList!: any[];
  filteredDataRows: any
  filteredDataCarteSoint: any
  codeField: string = "cod_natp";
  codLieu: string = "cod_lieu_geog";
  codAffect: string = "";
  codTypDepart: string = "cod_typ_depart";
  codBanque: string = "cod_banq";
  codAgence: string = "cod_agc";
  codPost: string = "cod_poste";
  codGouv: string = "cod_gouv";
  codNatP?: String = "";
  codLieuVal?: string;
  codMatVal?: string
  typDonVal: string = "";


  ///list /////

  listAffectation: any[] = [];
  listBanque: any[] = [];
  listLieu: any[] = [];
  listPersonnel: any[] = [];
  listMatInt: any[] = [];
  listMat: any[] = [];
  listDem: any[] = [];

  columnsNat: any[] = [];
  columnsLieu: any[] = [];
  columnsMatInt: any[] = [];
  columnsSearch: any[] = [];
  listTypDon: any[] = [];
  selectedRows: any[] = [];
  columnFamille: any[] = [];

  isFormValid: boolean = false; // Default disabled
  breadCrumbItems!: Array<{}>;

  ////////////////////////lib
  libNat: string = "";
  libLieu: string = "";
  libAffect: string = "";
  libMatInt: string = "";
  libNom: string = "";
  libNatDon: string = "";


  formCotisMutPersForm!: FormGroup;
  formSaiseIndScol!: FormGroup;
  formCotisMutPersFormIns!: FormGroup;
  formAdherent!: FormGroup;
  save!: boolean;
  isDisabled!: boolean;
  masterSelected!: boolean;

  file!: File;
  max_mnt_don!: number;

  isSearch: boolean = true;
  rows: any;
  searchResults: any;
  allcompany: any;
  searchTerm: any;
  company!: any[];
  checkedValGet: any[] = [];
  isRemoveActionsVisible!: boolean;
  checkedVal: any;
  donData: IdDonData = {
    typ_don: "",
    cod_soc: "",
    mat_pers: "",
    num_fam: 0,
    dat_dem_don: "",
    demandeDon: {
      mnt_acc_don: 0,
      etat_dem: ""
    }
  };
  EtaDem: any;
  mntAccDon: any;
  total: number = 0;
  numFam: any;
  listFamille: any;
  modPay: any;
  dataFamProcScol: { codSoc: any; matPers: any; numFam: any; natDon: any; datDemDon: any; };
  codActiviteVal!: number;
  data1!: { typ_don: string; cod_soc: any; mat_pers: (matricule: any) => void; num_fam: number; dat_dem_don: any; };
  datProcTypDon!: {
    natDon: any; codAffect: any; typDon: string; codSoc: any; matPers: any; numFam: any; // Adjust as necessary
    datDemDon: string; // Replace with a dynamic value if required
  };
  saveVal!: boolean;
  concern: any;
  benif!: string;
  corps: any;
  matricule: any;

  columnBordArriver: any[] = [];

  error: string | null = null;
  codBord: string = "";
  cod_bord: string = "";
  formBuletinSoin!: FormGroup
  ligPretForm!: FormGroup
  ligPharForm!: FormGroup
  ligVisiteForm!: FormGroup
  ligAppareilForm!: FormGroup

  listAdherent: any[] = []
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
  soldPlafondEstim: string = ''
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

  reponseVerifModRemb: any
  showMsgMalad!: boolean
  showMsgDatAccouch!: boolean
  showMsgPriseCharge!: boolean
  bultArriver: any[] = [];
  visitArriver: any[] = [];
  appArriver: any[] = [];
  medArriver: any[] = [];
  actArriver: any[] = [];

  listNumfill: any[] = [];
  columnNumFill: any[] = [];
  AllBultArrivers: any[] = [];
  bordArriver: any[] = [];
  bordArriverFilter: any[] = [];
  dateBord: string = "";

  pSusp: any;
  p: any
  mntNetArray: number[] = []; // Declare an array to store the amounts for each line

  columnTitles: { [key: string]: string } = {

    num_retr: "Num Afil",
    mat_pers: "Matricule",
    nom_prenom: "Nom & Prénom",
    cod_fil: "Filière",
    num_fam: "Prest",
    nom_prest: "Nom",
    dat_soin: "Date de soin",
    reg_remb: "Regime de remb",
    tot_remb: "Total Net.",
  };

  columnTitlesVisite: { [key: string]: string } = {
    dat_act: "Date visite",
    abrv_act: "Visite",
    lib_act: "Libellé",
    mnt_honor: "Mnt. Hon",
    mnt_net: "Mnt. Net.",
    prf_type: "Type",
    lib_org: "Nom",
    prf_cod: "Code",

  };

  columnTitlesActes: { [key: string]: string } = {
    dat_act: "Date Acte",
    cod_act: "Acte",
    lib_act: "Libellé",
    mnt_honor: "Mnt. Hon",
    indice: "Unité",
    mnt_remb: "Mnt. Net.",
    mut_mnt_net: "Mut. Mnt. Net.",
    prf_type: "Type",
    lib_org: "Nom",
    prf_cod: "Code",

  };

  columnTitlesMed: { [key: string]: string } = {
    dat_act: "Date Médi",
    cod_med: "Code Med.",
    lib_med: "Libellé Med.",
    indice: "Nbr.J",
    mnt_honor: "Mnt. Hon",
    mnt_remb: "Mnt. Net",
    accord_med: "Accord. Med",
    num_pec_med: "Num. Pec. Med",
    prf_type: "Type étab.",
    prf_cod: "Code",
    lib_org: "Libellé",
  };

  columnTitlesApp: { [key: string]: string } = {
    dat_act: "Date Médi",
    cod_app: "Code App.",
    lib_app: "Libellé App .",
    mnt_honor: "Mnt. Hon",
    mnt_remb: "Mnt. Net",
    accord_app: "Accord. App",

  };
  etab_rsoc_visite: string[] = []
  etab_rsoc: string[] = []
  etab_rsoc_phar: string[] = []
  libMed: string[] = []


  libVisite: string[] = []
  selectedVisit: any
  mntNetArrayVisite: number[] = [];
  libAppareil: string[] = []
  etab_rsoc_appareil!: any[];
  boolCodBord: boolean = false;

  constructor(public service: PaginationService, private servLibre: ReceptionRemboursementService, private tokenStorage: TokenStorage, public paginationService: PaginationService, private adherentServ: AdherentService, private indemniteServ: IndemnitesService, private fb: FormBuilder, private saveService: SaveService, private modalService: NgbModal) {

    this.dataFamProcScol = {
      codSoc: null,
      matPers: null,
      numFam: '',
      natDon: null,
      datDemDon: '',
    };

    this.formCotisMutPersForm = this.fb.group({
      cod_soc: [''],
      mat_pers: [''],
      num_cot: [{ value: '', disabled: true }],
      typ_cot: [{ value: 'M', disabled: true }],
      dat_deb: ['', Validators.required],
      dat_fin: ['', Validators.required],
      mnt_a_payer: [{ value: 0.000, disabled: true }],
      mnt_payer: ['', Validators.required],
      mod_pay: ['V', Validators.required],
      ref_pay: [''],
      dat_saisie: [''],
      etat_cot: [{ value: 'I', disabled: true }],
      corps: [''],
      cod_typ_depart: [''],
      cod_affect: [''],
      mnt_param: [''],
      num_retr: [''],
      seq_ecrt1: ['null'],
      seq_ecrt2: ['null'],
      imput: ['']

    });

    this.formCotisMutPersForm.get('dat_deb')?.valueChanges.subscribe((value) => {
      if (value) {
        this.formCotisMutPersForm.patchValue({ dat_fin: value });
      }
    });
    this.formCotisMutPersFormIns = this.fb.group({



    });
    this.formSaiseIndScol = this.fb.group({
      mat_pers: [''],
      nom_pers: [''],
      num_fam: [''],
      nom_fam: [''],
      mnt_dem_don: [0, [Validators.required, this.montantValidator.bind(this)]],
      mnt_livre: [''],
      mode_payement: ['V'],

    });


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

    this.addLigne(0);
    this.addLignePhar(0);
    this.addLigneVisite()
    this.addLigneAppareil(0)
  }
  ngOnInit() {
    this.lovNumFilCnamLibre(this.tokenStorage.getUser().codSoc)
    this.formRemboursement = this.fb.group({
      num_retr: [''], // 👈 Ajouter cette ligne
      mat_pers: [''],
      nom_prenom: [''],
      cod_fil: [''],
      num_fam: [''],
      nom_prest: [''],
      dat_soin: [''],
      reg_remb: [''],
      tot_remb: ['']
    });

    this.matricule = ''
    this.numFam = ''
    this.nomPers = ''
    this.lib_assur = ''
    this.lib_fill = ''
    this.nomAdherent = ''
    this.datNais = ''
    this.ageAn = ''
    this.ageMois = ''
    this.PEC = ''
    this.etabliss = ''
    this.datPec = ''
    this.soldPlafond = ''
    this.soldPlafondEstim = ''
    this.num_retr = ''
    this.refEtablis = []
    this.refEtablisApp = []
    this.refEtablisPhar = []
    this.refEtablisVisit = []
    this.etab_rsoc_visite = []
    this.etab_rsoc = []
    this.etab_rsoc_phar = []
    this.etab_rsoc_appareil = []
    this.acte = []
    this.libAct = []
    this.refEtablis = []
    this.etab_rsoc = []
    this.Med = []
    this.visiteCode = []
    this.appareilCode = []
    this.libAppareil = []
    this.libMed = []
    this.libVisite = []
    this.lignes.clear()
    this.phar.clear()
    this.appareil.clear()
    this.visite.clear()
    this.BordArriverForm = this.fb.group({
      cod_bord: [''],
      dat_bord: [''],
      cod_assur: [''],
      valid: [''],
      nbr_bult: [''],
      tot_remb: [''],
      lib_assurance: [''],
      tot: [''],
      typ_bord: ['L'],
      cod_soc: [''],
      valid_bord: [''],
    });


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
    this.getAllBordArrive()

    this.numFam = ''
    this.formSaiseIndScol = this.fb.group({
      mat_pers: [''],
      nom_pers: [''],
      num_fam: [''],
      nom_fam: [''],
      mnt_dem_don: [''], // Ajout de Validators.required
      mnt_livre: ['', [Validators.required, this.exceedsPlafondValidator.bind(this)]],
      mode_payement: ['V'],
      max_mnt_don: [''] // Ajout du champ plafond pour l'exemple
    });

    this.datProcTypDon = {
      natDon: null,
      codAffect: null,
      typDon: '',
      codSoc: null,
      matPers: null,
      numFam: null,
      datDemDon: '', // You can replace this with a dynamic date
    };

    this.libNatDon = ''
    this.max_mnt_don = 0

    this.formAdherent = this.fb.group({
      cod_soc: [""],
      mat_pers: ["", Validators.required],
      cod_assur: [""],
      nom_pers: [""],
      sexe: [""],
      cin: [""],
      dat_nais: [""],
      pren_pers: [""],
      dat_emb: [""],
      cod_sit: [""],
      nbr_enf: [""],
      cod_retr: [""],
      num_retr: [""],
      num_assur: [""],
      dat_ass: [""],
      cod_pay: [""],
      rib: [""],
      nom_pers_a: [""],
      pren_pers_a: [""],
      cod_natp: [""],
      cod_banq: [""],
      cod_agc: [""],
      dat_dece: [""],
      etat_act: [""],
      dat_motif: [""],
      cod_lieu_geog: [""],
      bas_plafond: [""],
      nom_jf: [""],
      nom_jf_a: [""],
      photo_pers: [""],
      lieu_nais: [""],
      mnt_param: [""],
      etat_prof: [""],
      dat_aff_cnam: [""],
      corps: [""],
      cod_affect: [""],
      dat_affect: [""],
      cod_typ_depart: [""],
      dat_depart: [""],
      typ_aff: [""],
      cod_user: [""],
      dat_maj: [""],
      mat_int: [""],
      pers_carte: [""],
    });


    this.getDepartement();

    this.saveService.canSave$.subscribe((canSave) => {
      this.save = canSave;
      if (this.save) {
        // this.submit();
        //   this.onSubmit()
      }
    });

    this.formCotisMutPersForm.valueChanges.subscribe(() => {
      // this.isDisabled = this.formCotisMutPersForm.pristine;
      this.saveService.setDisabled(this.isDisabled);
    });
    ///////////////////////////save
    this.saveService.registerSaveCallback(() => this.saveGlobal());



    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch = canSearch

      console.log("is search valid", canSearch)
    })



    this.getgetListTypDon()
    // Listen for form changes
    this.formSaiseIndScol.statusChanges.subscribe(status => {
      this.isFormValid = status === 'VALID';
    });
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

    this.addLigne(0);
    this.addLignePhar(0);
    this.addLigneVisite()
    this.addLigneAppareil(0)

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Subscribe to resetObservable to reset the form
    this.saveService.add$.subscribe((reset) => {
      if (reset) {
        this.saveService.setDisabled(true)

        this.BordArriverForm.reset();
        this.BordArriverForm.enable()

        this.formSaiseIndScol.reset();
        this.formSaiseIndScol.enable()

        this.ligVisiteForm.reset();
        this.ligVisiteForm.enable()

        this.ligPretForm.reset();
        this.ligPretForm.enable()


        this.ligPharForm.reset();
        this.ligPharForm.enable()

        this.ligAppareilForm.reset();
        this.ligAppareilForm.enable()
        this.codBord = ""


        this.bordArriver = []
        this.visitArriver = []
        this.actArriver = []

        this.medArriver = []

        this.appArriver = []

        this.visitArriver = []
        this.cod_bord = ""
        this.dateBord = ""

        //  this.formCotisMutPersForm.get("typ_cot")?.setValue("M"); 


        this.boolCodBord = true
        console.log("boolCodBord :", this.boolCodBord)


      }
    });

    this.getAllAssurance()
  }

  ngOnChanges() {
    this.total = this.calculateTotalMntAccDem();
  }
  ngOnDestroy() {
    // Clear the callback to avoid memory leaks
    this.saveService.clearSaveCallback();
    //this.saveService.setCanSave(false)
  }
  onSelectedValueNumRetr(event: any) {

    this.formRemboursement.patchValue({
      num_retr: event.num_retr,
      mat_pers: event.mat_pers,
      nom_prenom: event.nom_prenom,
      cod_fil: event.cod_fil


    })

  }
  addRemboursement() {

    if (this.formRemboursement.valid) {
      // Push a copy of form values into the array
      this.bordArriver.push({ ...this.formRemboursement.value });

      // Optionally: Reset the form after adding
      this.formRemboursement.reset();
    } else {
      console.log('Form is invalid');
    }
  }


  // Add these properties to your component class
  currentPage = 0;
  pageSize = 100;
  hasMoreData = true;
  isLoading = false;

  lovNumFilCnamLibre(soc: any, loadMore: boolean = false) {
    // Don't load if already loading or no more data
    if (this.isLoading || (loadMore && !this.hasMoreData)) return;

    this.isLoading = true;

    // If loading more, increment page, otherwise reset to first page
    if (loadMore) {
      this.currentPage++;
    } else {
      this.currentPage = 0;
      this.listNumfill = []; // Clear existing data for fresh load
      this.hasMoreData = true;
    }

    this.servLibre.lovNumFilCnamLibre(soc, this.currentPage, this.pageSize)
      .subscribe({
        next: (data: any) => {
          console.log("Received data page", this.currentPage, ":", data);

          // Check if response is paginated (has content property)
          const items = data.content || data;

          if (Array.isArray(items)) {
            const newItems = items.map((item: any) => ({
              num_retr: item.num_retr,
              mat_pers: item.mat_pers,
              nom_prenom: item.nom_prenom,
              cod_fil: item.cod_fil,
            }));

            // Append new items or replace if first load
            this.listNumfill = loadMore
              ? [...this.listNumfill, ...newItems]
              : newItems;

            // Check if there's more data (for paginated responses)
            if (data.totalPages !== undefined) {
              this.hasMoreData = this.currentPage < data.totalPages - 1;
            } else {
              // Fallback check for non-paginated responses
              this.hasMoreData = items.length === this.pageSize;
            }
          } else {
            console.error("Expected array data but got:", items);
          }

          // Initialize columns if not already done
          if (this.columnNumFill) {
            this.loadMoreData()
            this.columnNumFill = [
              { key: "num_retr", label: "Code fil" },
              { key: "mat_pers", label: "Matricule" },
              { key: "nom_prenom", label: "Nom et Prénom" },
              { key: "cod_fil", label: "Fill" },
            ];
          }
        },
        error: (error) => {
          console.error("Error fetching data:", error);
          if (loadMore) {
            this.currentPage--; // Rollback page increment on error
          }
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  // Add this method for "Load More" functionality
  loadMoreData(): void {
    this.lovNumFilCnamLibre('01', true);
  }
  /////////////////////////////////////***************************************************** */
  onSelectedValueAssur(event: any) {
    this.libAssur = event.lib_assur;
    this.codAssur = event.cod_assur

  }
  ListeAssurance: any[] = [];
  columnAssuranc: any[] = [];

  getAllAssurance() {
    this.servLibre.GetAllAssurance().subscribe((data: any) => {

      this.ListeAssurance = data;
      this.columnAssuranc = [
        { key: "cod_assur", label: "Code Assurance" },
        { key: "lib_assur", label: "Libellé" },
      ]

    });
  }
  addLigneVisite(): void {
    this.visite.push(this.createLigneVisite());
    this.calculateTotalsVisite()
  }
  addLigne(index: any): void {
    this.lignes.push(this.createLigne());
    this.calculateTotals(); // Met à jour les totaux

  }
  mntNetArrayPhar: number[] = [];
  calcul_mnt_netPhar(event: any, index: number) {
    const ligPhar = this.ligPharForm.get('phar') as FormArray;
    console.log("ligBult :", ligPhar)

  }

  onSelectedVisite(selectedValue: any, index: number): void {
    this.selectedVisit = selectedValue

    const selectedActe = this.listVisite.find(acte => acte.cod_Visit === selectedValue.cod_Visit);
    this.libVisite[index] = selectedActe.lib_Visit
    this.visite.at(index).patchValue({
      cod_visit: selectedValue.cod_Visit,
      abrv_act: selectedValue.abrv_Act
    });


  }
  selectedMed: any
  mntNetArrayAppareil: number[] = [];

  onSelectedMed(selectedValue: any, index: number): void {
    console.log('selectedValue', selectedValue);

    const selectedMed = this.listMed.find(acte => acte.cod_MED === selectedValue.cod_MED);
    this.libMed[index] = selectedMed.lib_MED
    this.phar.at(index).patchValue({
      cod_med: selectedValue.cod_MED,
      abrv_act: selectedValue.abrv_ACT
    });
  }
  get lignes(): FormArray {
    return this.ligPretForm.get('lignes') as FormArray;
  }
  // Création d'une ligne avec les champs nécessaires
  createLigne(): FormGroup {
    return this.fb.group({
      cod_soc: [this.tokenStorage.getUser().codSoc],
      mat_pers: [''],
      num_fam: [''],
      dat_soin: ['', Validators.required],
      abrv_act: ['', Validators.required],
      cod_act: [''],
      num_lig: ['1'],
      let_cod: [''],
      cot_act: [''],
      act_prix: [''],
      mnt_honor: [0],
      mnt_remb: [0],
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

    });

  }
  totalHonoraires: number = 0;
  totalNet: number = 0;



  libAct: string[] = []
  selectedAct: any
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
  addLignePhar(index: any): void {
    this.phar.push(this.createLignePhar());
    this.calculateTotalsPhar()
    const ligPhar = this.ligPharForm.get('phar') as FormArray;


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

  createLignePhar(): FormGroup {
    return this.fb.group({

      cod_soc: [this.tokenStorage.getUser().codSoc],
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


    });

  }
  get phar(): FormArray {
    return this.ligPharForm.get('phar') as FormArray;
  }
  get appareil(): FormArray {
    return this.ligAppareilForm.get('appareil') as FormArray;
  }

  createLigneAppareil(): FormGroup {
    return this.fb.group({

      cod_soc: [this.tokenStorage.getUser().codSoc],
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
      mut_mnt_net: [''],


    });

  }
  addLigneAppareil(index: number): void {
    const ligBult = this.ligAppareilForm.get('appareil') as FormArray;
    this.appareil.push(this.createLigneAppareil());
    this.calculateTotalsVisite()
    console.log("ligBult.value ", ligBult.value)



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


  /* Traitement des Visites*/


  createLigneVisite(): FormGroup {
    return this.fb.group({
      cod_soc: [this.tokenStorage.getUser().codSoc],
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
      mut_mnt_net: [''],



    });

  }

  removeLigneVisite(index: number): void {
    this.visite.removeAt(index);
    this.calculateTotalsVisite()
  }

  selectedIndexVisit: number | null = null;
  confirmVisit(index: any, content: any, id: any) {
    this.selectedIndexVisit = index
    console.log("this.selectedIndex:", this.selectedIndexVisit);
    //this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDeleteVisit(index: number): void {
    const ligne = this.visite.at(index).value; // Récupérer les données de la ligne
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

    this.servLibre.existeLigBultVisit(cle).subscribe({
      next: (exists: boolean) => {
        console.log("Enregistrement existant :", exists);

        if (exists) {
          // Si l'enregistrement existe, on appelle le service de suppression
          this.servLibre.deleteLigBultVisit(
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
              this.visite.removeAt(index); // Suppression de la ligne dans le formulaire
              this.calculateTotalsVisite();
            },
            error: (error: any) => {
              console.error("Erreur lors de la suppression :", error);
            }
          });
        } else {
          // Si l'enregistrement n'existe pas, on supprime directement du formulaire
          this.visite.removeAt(index);
          this.calculateTotalsVisite();
        }
      },
      error: (error: any) => {
        console.error("Erreur lors de la vérification d'existence :", error);
        //alert("Une erreur est survenue lors de la vérification. Veuillez réessayer.");
      }
    });
  }
  /*  getPersonnels() {
     this.indemniteServ.PersCotisActif('01').subscribe((data) => {
       console.log("personnel", data);
       this.listPersonnel = data;
       this.columnsSearch = [
         { key: "mat_pers", label: "Matricule" },
         { key: "nom_pers", label: "Nom" },
         { key: "pren_pers", label: "Prénom" },
         { key: "num_retr", label: "Id unique" },
         { key: "cin", label: "CIN" },
       ];
     });
   } */

  onSelectedValueBordArriver(event: any): void {
    console.log("data", event)
    if (event) {


      this.cod_bord = event.cod_bord;
      this.dateBord = event.dat_bord;
      this.BordArriverForm.patchValue({
        cod_bord: event.cod_bord,
        tot_remb: event.tot_remb,
        valid: event.valid,
        nbr_bult: event.nbr_bult,
        lib_assurance: event.lib_assurance,
        tot: event.tot
      });

      this.getBultArriverByCodBord();
    }
  }
  getBultArriverByCodBord(): void {
    if (this.cod_bord) {
      this.servLibre.getBultArriveLibrCnam(this.cod_bord).subscribe({
        next: (data) => {
          this.bordArriver = data;
        },
        error: (err: HttpErrorResponse) => {
          this.error = `Erreur lors de la récupération des données: ${err.message}`;
        },
      });
    } else {
      this.error = "Aucun cod_bord sélectionné.";
    }
  }
  getAllBordArrive(): void {
    this.servLibre.EnteteSaisieBordArriverManuLibreCnam(this.tokenStorage.getUser().codSoc).subscribe({
      next: (data) => {
        this.AllBordArrive = data;
        console.log("liste des bordereaux :", this.AllBordArrive);

        this.columnBordArriver = [
          { key: "cod_bord", label: "Code de bordereau" },
          { key: "dat_bord", label: "Date de bordereau" },
        ];
      },
      error: (err) => {
        this.error = "Erreur lors de la récupération des données";
      },
    });
  }

  applyFilter() {
    console.log('this.filteredDataRows :', this.filteredDataRows)
    this.filteredDataRows = this.dataRows.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase();
        const rowValue = row[key]?.toString().toLowerCase();
        return !searchValue || rowValue.includes(searchValue);
      });
    });

  }


  showFilters: { [key: string]: boolean } = {};

  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }
  onSort(column: any) {
    this.AllBordArrive = this.service.onSort(
      column,
      this.AllBordArrive
    );
  }

  formatDate(dateString: any): string {
    // Ensure the string is in the format 'ddmmyyyy'
    if (dateString && dateString.length === 8) {
      const day = dateString.substring(0, 2);
      const month = dateString.substring(2, 4);
      const year = dateString.substring(4, 8);
      return `${day}/${month}/${year}`;
    }
    return dateString;
  }

  getTotalPages(): number {
    return Math.ceil(this.bordArriver.length / 6);
  }
  /* Traitement des Visites*/

  get visite(): FormArray {
    return this.ligVisiteForm.get('visite') as FormArray;
  }

  selectedRow: number | null = null;
  logRowData(data: any, index: number): void {
    this.selectedRow = index;
    const { cod_soc, mat_pers, num_fam, dat_soin } = data;

    console.log("Données de la ligne sélectionnée:", data);

    // ➤ Récupération des données du bulletin
    this.servLibre.getBultArriverById(data.cod_soc, data.mat_pers, data.num_fam, data.dat_soin).subscribe({
      next: (reponse) => {
        this.bultArriver = reponse;
        console.log("Données bulletin:", this.bultArriver);

        // ✅ Nettoyer l'ancien contenu du FormArray
        this.visite.clear();

        // ✅ Créer et patcher un seul FormGroup avec les données reçues
        const ligneForm = this.fb.group({
          dat_act: [reponse.dat_act],
          cod_Visit: [reponse.cod_Visit],
          libelle: [reponse.mat_pers],
          mnt_honor: [reponse.mnt_honor],
          mnt_net: [reponse.mnt_net],
          prf_typ: [reponse.prf_typ],
          prf_cod: [reponse.prf_cod],
          etablissement: [reponse.etablissement ?? data.etablissement],
        });

        this.visite.push(ligneForm);
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des données du bulletin: ${err.message}`;
      }
    });

    this.servLibre.LigVisitArriverById(cod_soc, mat_pers, num_fam, dat_soin).subscribe({
      next: (response) => {
        this.visitArriver = response;

      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des données: ${err.message}`;
      }
    });
    // ➤ Récupération des actes
    this.servLibre.geLigActArriverById(cod_soc, mat_pers, num_fam, dat_soin).subscribe({
      next: (response) => {
        this.actArriver = response;
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des actes: ${err.message}`;
      }
    });

    // ➤ Récupération des médicaments
    this.servLibre.LigMedArriverById(cod_soc, mat_pers, num_fam, dat_soin).subscribe({
      next: (response) => {
        this.medArriver = response;
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des médicaments: ${err.message}`;
      }
    });

    // ➤ Récupération des appareillages
    this.servLibre.LigAppArriverById(cod_soc, mat_pers, num_fam, dat_soin).subscribe({
      next: (response) => {
        this.appArriver = response;
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des appareillages: ${err.message}`;
      }
    });

    /* 
          this.servLibre.getActes(this.sexe, this.parente, this.formBuletinSoin.get('cod_fil')?.value, this.formBuletinSoin.get('cod_assur')?.value).subscribe((data: any) => {
            this.listActe = data
    
            this.columnActe = [
              { key: "abrv_act", label: "Abrv acte" },
              { key: "lib_act", label: "Libelle" },
    
            ];
    
          })
    
          this.servLibre.getVisite(this.parente, this.sexe, this.formBuletinSoin.get('cod_fil')?.value, this.formBuletinSoin.get('cod_assur')?.value).subscribe((data: any) => {
            this.listVisite = data
            console.log("listVisite :", this.listVisite)
            this.columnVisite = [
              { key: "cod_Visit", label: "Abrv acte" },
              { key: "lib_Visit", label: "Libelle" },
    
            ];
    
          }) */
  }



  getPersonnels() {
    this.indemniteServ.getPersIndAff(this.tokenStorage.getUser().codSoc, this.selectedCodeLieu).subscribe((data) => {
      console.log("personnel", data);
      this.listPersonnel = data;
      this.columnsSearch = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "nom_pers", label: "Nom" },
        { key: "pren_pers", label: "Prénom" },
        { key: "num_retr", label: "Id unique" },
        { key: "cin", label: "CIN" },
      ];
    });
  }

  onSelectedValue(item: any) {
    if (!item || !item.mat_pers) {
      console.error("onSelectedValue: item is undefined or missing mat_pers", item);
      return;
    }

    console.log("Selected item:", item);
    // Met à jour les champs du formulaire
    this.formSaiseIndScol.patchValue({
      mat_pers: item.mat_pers,
      nom_pers: item.nom_pers + " " + item.pren_pers,
    });
    // Récupération des informations associées
    this.getFamille(item.mat_pers);

    // Met à jour la variable matricule
    this.matricule = item.mat_pers;
    this.corps = item.corps
    // Vérifie si la liste de famille est vide
    if (!this.listFamille || this.listFamille.length === 0) {
      this.formSaiseIndScol.patchValue({
        num_fam: 0,
        nom_fam: "Adhérent",
        mnt_dem_don: this.max_mnt_don,
      });
    } else {


      console.log("Form updated with:", this.formSaiseIndScol.value);
    }


  }


  onSelectedValueLieu(item: any) {
    this.selectedCodeLieu = item.cod_lieu_geog; // Mise à jour du champ code
    this.libLieu = item.lib_lieu; // Mise à jour du champ libellé
    this.formAdherent.patchValue({
      cod_lieu_geog: item.cod_lieu_geog,
    });
    this.codAffect = item.cod_lieu_geog;
    this.getPersonnels();

  }


  convertDateFormatToMounth(dateString: string): string {
    // Ensure the input string is in the format dd/mm/yyyy
    const [day, month, year] = dateString.split('/');
    return `${month}/${year}`;
  }

  onSubmit(data: any[]): void {

  }

  transformDate(input: string): string {
    const regexWithMonthSlash = /^\d{2}\/\d{4}$/; // Matches "mm/yyyy" or "01/yyyy"
    const regexWithoutSlash = /^\d{6}$/;         // Matches "mmyyyy"

    let month: string, year: string;

    if (regexWithMonthSlash.test(input)) {
      [month, year] = input.split('/');
      if (month === "01" && year.length === 4) {
        return `${month}/${year}`;
      }
    } else if (regexWithoutSlash.test(input)) {
      month = input.substring(0, 2);
      year = input.substring(2);
    } else {
      throw new Error('Invalid date format. Expected "mm/yyyy", "mmyyyy", or "01/yyyy".');
    }

    return `${month}/${year}`;
  }
  getCurrentDate(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Mois basé sur 0
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year}`; // Format: DD/MM/YYYY HH:mm:ss
  }

  formatDateToMonthYear(date: string): string {
    if (typeof date !== "string" || !date.trim()) {
      console.error("Invalid input: The date must be a non-empty string.");
      return "";
    }

    const parts = date.split("/");
    if (parts.length !== 3) {
      console.error("Invalid date format: Expected 'dd/mm/yyyy', received:", date);
      return "";
    }

    const [day, month, year] = parts;

    if (!day || !month || !year) {
      console.error("Invalid date components: Missing day, month, or year in:", date);
      return "";
    }

    return `${month}/${year}`;
  }

  changePage() {
    this.filteredDataRows = this.paginationService.changePage(this.filteredDataRows);
  }

  searchz: any = {
    mat_pers: '',
    num_retr: '',
    nom_pers: '',
    dat_deb: '',
    mnt_payer: '',
    mod_pay: '',
    etat_cot: ''
  };

  // Delete Data
  deleteData(id: any) {

    this.masterSelected = false;
  }
  // Search Data
  performSearch(): void {
    this.searchResults = this.allcompany.filter((item: any) => {
      return item.name.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
    this.company = this.paginationService.changePage(this.searchResults);
  }


  ChargActInxx() {
    const datDebControl = this.transformDate(this.formCotisMutPersForm.get("dat_deb")?.value);
    const datDeb = datDebControl ? `01/${datDebControl}` : '';

    const data = {
      soc: '01',
      mois: datDeb,
      mat: this.formCotisMutPersForm.get("mat_pers")?.value
    };

    // Show loading alert
    Swal.fire({
      title: 'Chargement en cours...',
      text: 'La procédure est en cours de traitement',
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();  // Show the loading spinner
      }
    });


  }



  getEtat(data: any) {
    this.EtaDem = data.etat_dem
    this.saveService.setDisabled(true);

  }

  getDepartement() {
    this.adherentServ.getLieu().subscribe((data) => {
      this.listLieu = data;
      this.columnsLieu = [
        { key: "cod_lieu_geog", label: "Code" },
        { key: "lib_lieu", label: "Libelle" },
        { key: "lib_lieu_a", label: "Libelle arabe" },
      ];
    });
  }

  getgetListTypDon() {
    this.indemniteServ.getgetListNatDon().subscribe((data) => {
      this.listTypDon = data;
      console.log(this.listTypDon);
      // Définir les colonnes dynamiques du tableau
      this.columnsNat = [
        { key: "lib_nat_Don", label: "Libelle" },
        { key: "max_mnt_don", label: "Plafond" },
        { key: "concerne", label: "Concerne" },
        { key: "cod_affect", label: "Affectation" },


        // { key: 'lib_tit_a', label: 'Libellé 2éme langue' }
      ];
    });
  }

  onSelectedValueTypDon(item: any) {

    this.libNatDon = item.lib_nat_Don;
    this.typDonVal = item.nat_Don
    this.max_mnt_don = item.max_mnt_don
    // Prepare data objects
    this.concern = item.concerne
    this.codAffect = item.cod_affect
    this.PersIndValid();

  }

  PersIndValid() {
    this.indemniteServ.PersIndValid(this.tokenStorage.getUser().codSoc, this.selectedCodeLieu, this.typDonVal).subscribe((data) => {

      this.dataRows = data
      this.listDem = data

      this.filteredDataRows = [...this.dataRows];
      console.log("demande en instance ", data, this.codAffect, this.typDonVal)

    })

  }
  updateMontant(data: any) {
    this.mntAccDon = data.mnt_acc_don


    this.saveService.setDisabled(true);

    console.log("Montant mis à jour :", data.mnt_acc_don);
    this.total = this.calculateTotalMntAccDem()

    // You can send an API request here to save changes if necessary
  }

  onCheckboxChange(): void {
    this.saveService.setDisabled(true);
    const totalRows: number = this.listDem.length;
    const selectedCount: number = this.listDem.filter((row: DataRow) => row.state).length;

    this.masterSelected = totalRows > 0 && selectedCount === totalRows;

    // Update selected rows list
    this.selectedRows = this.listDem.filter((row: DataRow) => row.state);

    console.log("Updated Selected Rows:", this.selectedRows);
    this.total = this.calculateTotalMntAccDem()
  }
  deleteInd() {
    this.listDem = this.listDem.filter(row => !this.selectedRows.includes(row));
    console.log("list after delete:", this.listDem);
  }

  checkUncheckAll(event: any): void {
    const isChecked: boolean = event.target.checked;

    this.listDem.forEach((row: DataRow) => {
      row.state = isChecked;
    });

    this.selectedRows = isChecked ? [...this.listDem] : [];

    console.log("Selected Rows:", this.selectedRows);
    this.total = this.calculateTotalMntAccDem()
  }

  updatedData: IdDonData[] = []


  calculateTotalMntAccDem(): number {
    console.log("selectedRows:", this.selectedRows);

    if (!this.selectedRows || this.selectedRows.length === 0) {
      console.warn("selectedRows est vide ou non défini !");
      return 0;
    }

    const total = this.selectedRows.reduce((sum, row) => {
      const montant = row?.mnt_acc_don ?? 0; // Si `mnt_acc_don` est null, on prend 0
      console.log("Row montant:", montant);
      return sum + montant;
    }, 0);

    console.log("Total montant accumulé:", total);
    return total;
  }

  saveGlobal(): void {
    // Vider cod_bord pour forcer la régénération à chaque fois
    this.BordArriverForm.patchValue({ cod_bord: null });

    const datB = this.BordArriverForm.get("dat_bord")?.value;

    this.BordArriverForm.patchValue({
      cod_assur: this.codAssur,
      dat_bord: datB,
      typ_bord: 'L',
      cod_soc: this.tokenStorage.getUser().codSoc,
      valid_bord: this.BordArriverForm.get("valid_bord")?.value,
      tot_remb: this.total,
      nbr_bult: this.bultArriver.length,
    });

    if (this.BordArriverForm.valid) {
      this.servLibre.generateCodBordArrive(this.tokenStorage.getUser().codSoc).subscribe((data) => {
        console.log("✔️ Nouveau code bordereau généré :", data);
        this.codBord = data;
        this.BordArriverForm.patchValue({ cod_bord: data });

        const formData = { ...this.BordArriverForm.getRawValue() };
        delete formData.lib_assurance;

        Swal.fire({
          title: 'Êtes-vous sûr ?',
          text: 'Voulez-vous vraiment enregistrer ce bordereau ?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Oui, enregistrer',
          cancelButtonText: 'Annuler'
        }).then((result) => {
          if (result.isConfirmed) {
            this.servLibre.saveBordArriver(formData).subscribe(response => {
              console.log('📦 Données enregistrées :', response);
              Swal.fire('Succès', 'Le bordereau a été enregistré.', 'success');
            });
          }
        });
      });
    }
  }









  onSelectedValueFamille(item: any) {
    this.numFam = item.num_fam



    const datSaisie = this.getCurrentDate();
    console.log("data proc fam ", item)

    this.dataFamProcScol = {
      codSoc: this.tokenStorage.getUser().codSoc,
      matPers: this.matricule,
      numFam: item.num_fam,
      natDon: this.typDonVal,
      datDemDon: datSaisie,
    };
    console.log("data proc fam ", this.dataFamProcScol)

    this.indemniteServ.execProcFamScol(this.dataFamProcScol).subscribe((data => {
      console.log("data RETURN ", data)


      const valid = Number(data.valid);

      // Handle response statuses
      switch (valid) {
        case 1:
        case 2:
        case 3:
        case 4:
          Swal.fire({
            icon: 'warning',
            title: 'Message:',
            text: data.p_status,
            confirmButtonText: 'OK',
          });
          break;
        case 0:
          this.formSaiseIndScol.patchValue({
            num_fam: item.num_fam,
            nom_fam: item.nom_pren, // Ensure this is correct, previously it was `num_fam`

            mnt_dem_don: this.max_mnt_don
          });
          break;

        default:
          console.error("Unhandled response.valid value:", data.valid);
          break;
      }



    }))


    if (!item || !item.num_fam) {
      console.error("onSelectedValueFamille: item is undefined or missing properties", item);
      return;
    }


    console.log("Form updated with:", item);
    this.VerifTypDon()

  }
  VerifTypDon() {
    const user = this.tokenStorage.getUser();
    const datSaisie = this.getCurrentDate();

    this.datProcTypDon = {
      natDon: this.typDonVal,
      codAffect: this.codAffect,
      typDon: "I",
      codSoc: user.codSoc,
      matPers: this.matricule,
      numFam: this.numFam,
      datDemDon: datSaisie
    };
    console.log("execProcTypDon:", this.datProcTypDon);

    // Call the service
    this.indemniteServ.execProcTypDon(this.datProcTypDon).subscribe({
      next: (response) => {
        console.log("Response from execProcTypDon:", response);
        const valid = Number(response.valid);

        switch (valid) {
          case 1:
          case 2:
          case 3:
            Swal.fire({
              icon: 'warning',
              title: 'Message:',
              text: response.p_status,
              confirmButtonText: 'OK',
            });
            break;

          case 4:
            this.isFormValid = true; // Enable button when valid
            this.benif = response.p_typ_benef
            break;

          default:
            console.error("Unhandled response.valid value:", response.valid);
            break;
        }
      },
      error: (error) => {
        console.error("Error during execProcTypDon:", error);
      }
    });
  }

  getFamille(mat: any) {
    console.log("famille 1", mat)

    this.indemniteServ.getFamilleEnfant(this.tokenStorage.getUser().codSoc, mat).subscribe(
      (data: any) => {
        this.listFamille = data;
        console.log("famille", data)
        this.columnFamille = [
          { key: "num_fam", label: "Num fam" },
          { key: "nom_pren", label: "Nom" },
          { key: "dat_naiss", label: "Date naissance  " },
        ];
        // Set the lovList for the column in tableConfig

      },
      error => {
        console.error('Error fetching data:', error);
      }
    );
  }


  // Validator personnalisé
  montantValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value ? Number(control.value) : 0;

    if (value <= 0) {
      return { montantInvalide: 'Le montant doit être supérieur à zéro.' };
    }

    if (this.max_mnt_don > 0 && value > this.max_mnt_don) {
      return { montantDepasse: `Le montant ne doit pas dépasser ${this.max_mnt_don}.` };
    }

    return null; // Valide
  }
  exceedsPlafondValidator(control: AbstractControl): ValidationErrors | null {
    const plafond = this.formSaiseIndScol?.get('mnt_dem_don')?.value; // Récupération du plafond
    const montantDemande = control.value;

    console.log("montant", montantDemande, "plafond", plafond);

    if (!montantDemande || montantDemande.toString().trim() === '') {
      return { required: true }; // Vérification du champ vide
    }

    if (plafond && parseFloat(montantDemande) > parseFloat(plafond)) {
      return { exceedsPlafond: true }; // Vérification si dépassement du plafond
    }

    return null; // Pas d'erreur
  }
  openModalTab(content: any) {

    this.modalService.open(content, { size: "lg", centered: true });


  }
  openModalTab2(content: any) {

    this.modalService.open(content, { size: "xl", centered: true });


  }
  openModalEdit(content: any) {
    /******************************************************************* */
    this.formSaiseIndScol.patchValue(this.selectedRows);
    this.formSaiseIndScol.patchValue({
      mat_pers: this.selectedRows[0].mat_pers || '',
      num_fam: this.selectedRows[0].num_fam || '',
      nom_fam: this.selectedRows[0].nom_fam || '',
      mnt_dem_don: this.selectedRows[0].mnt_dem_don || '',
      mnt_livre: this.selectedRows[0].mnt_livre || '',
      mode_payement: this.selectedRows[0].mode_payement || '',
    });
    // Open the modal
    this.modalService.open(content, { size: "lg", centered: true });


  }


  getValueModPay(arg0: any) {
    this.modPay = arg0

  }
  addDemDon() {


    this.indemniteServ.chekExisteDem(this.datProcTypDon).subscribe((data => {

      console.log("data.p_status :", data.p_status);

      if (data.p_status === 1) {
        Swal.fire({
          icon: 'warning',
          title: 'Entrée en double',
          text: "Veuillez vérifier si cet adhérent n'a pas encore bénéficié de cette indemnité pour le même prestataire.",
          confirmButtonText: 'OK'
        });
      } else
        if (data.p_status === 0) {
          console.log("Valeurs du formulaire :", this.formSaiseIndScol.value);

          // Vérifier que les données du formulaire et de l'utilisateur sont présentes
          const user = this.tokenStorage.getUser();
          if (!this.formSaiseIndScol?.valid || !user) {
            console.error("Le formulaire est invalide ou les informations utilisateur sont manquantes.");
            return;
          }

          const datSaisie = this.getCurrentDate();

          // Déterminer le type de bénéficiaire
          this.benif = (Number(this.numFam) !== 0) ? 'E' : 'A';

          // Création de l'objet de demande
          const newRowDem = {
            typ_don: 'I',
            cod_soc: user.codSoc,
            mat_pers: this.matricule,
            nom_pers: this.formSaiseIndScol.value.nom_pers,
            num_fam: this.numFam,
            mnt_dem_don: Number(this.formSaiseIndScol.value.mnt_dem_don),
            mnt_livre: Number(this.formSaiseIndScol.value.mnt_livre),
            mode_payement: this.formSaiseIndScol.value.mode_payement,
            nat_don: this.typDonVal,
            cod_lieu_geog: this.selectedCodeLieu,
            cod_affect: this.codAffect,
            mnt_acc_don: Number(this.formSaiseIndScol.value.mnt_dem_don) + Number(this.formSaiseIndScol.value.mnt_livre),
            typ_benificiaire: this.benif,
            cod_fond: '01',
            corps: this.corps
          };

          // Vérifier si la ligne existe déjà dans la liste
          const isDuplicate = this.listDem.some(row =>
            row.mat_pers === newRowDem.mat_pers &&
            row.num_fam === newRowDem.num_fam &&
            row.nat_don === newRowDem.nat_don &&
            row.mnt_dem_don === newRowDem.mnt_dem_don
          );

          if (isDuplicate) {
            // Afficher un message d'erreur si la ligne est un doublon
            Swal.fire({
              icon: 'error',
              title: 'Entrée en double',
              text: 'Cette entrée existe déjà dans la liste.',
              confirmButtonText: 'OK'
            });
            return; // Ne pas ajouter la ligne si elle est un doublon
          }

          // Ajouter la nouvelle ligne à la liste si elle n'est pas un doublon
          this.listDem.push(newRowDem);
          console.log('Liste mise à jour listDem:', this.listDem);

        }

    }))

  }






}

interface DataRow {
  _id: string;
  mat_pers: string;
  nom_pers: string;
  dat_dem_don: string;
  num_fam: string;
  nat_don: string;
  lib_nat_don: string;
  mnt_acc_don: number;
  etat_dem: string;
  state: boolean; // This represents whether the checkbox is checked
}

export interface DemandeDon {
  mnt_acc_don: number;
  etat_dem: string;
}

export interface IdDonData {
  typ_don: string;
  cod_soc: string;
  mat_pers: string;
  num_fam: number;
  dat_dem_don: string;
  demandeDon: DemandeDon;
}

export interface LovNumFilCnamLibre {
  // Define the properties based on your actual response
  id?: number;
  numFil?: string;
  // ... other properties
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  // ... other page properties if needed
}