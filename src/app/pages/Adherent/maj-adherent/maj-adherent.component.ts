import { TokenStorage } from './../../../account/token-storage.service';
import { ChangeDetectorRef, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { AdherentService } from '../adherent.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TableauComponent } from 'src/app/shared/Composants/tableau/tableau.component';
import { forkJoin, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CarteCnamAlertService } from '../carte-cnam-alert.service';

@Component({
  selector: 'app-maj-adherent',
  templateUrl: './maj-adherent.component.html',
  styleUrl: './maj-adherent.component.scss'
})
export class MajAdherentComponent {
  breadCrumbItems!: Array<{}>;
  listNationalite: any[] = []
  listAffectation: any[] = []
  listTypeDepart: any[] = []
  listBanque: any[] = []
  listLieu: any[] = []
  listAgence: any[] = []
  listGouv: any[] = []
  listPoste: any[] = []
  listAdresse: any[] = []
  listPersonnel: any[] = []
  listMatInt: any[] = []

  dataRows!: any[];
  listActivite!: any[];
  CarteSoinList!: any[];
  CarteSoinCnamList: any[] = [];
  /** Écran en lecture seule : aucune saisie, modification ou suppression. */
  readonly isConsultation = true;

  private static readonly BADGES_CNAM: { [statut: string]: { label: string; cls: string } } = {
    a_venir: { label: "À venir", cls: "bg-info-subtle text-info" },
    en_cours: { label: "En cours", cls: "bg-success-subtle text-success" },
    bientot: { label: "Expire bientôt", cls: "bg-warning-subtle text-warning" },
    expiree: { label: "Expirée", cls: "bg-danger-subtle text-danger" },
    remplacee: { label: "Remplacée", cls: "bg-secondary-subtle text-secondary" },
  };

  badgeCarteCnam(row: any) {
    const statut = this.carteCnamAlert.statutLigne(row, this.CarteSoinCnamList);
    return statut ? MajAdherentComponent.BADGES_CNAM[statut] : null;
  }


  codeField: string = 'cod_natp';
  codLieu: string = 'cod_lieu_geog';
  codAffect: string = 'cod_affect';
  codTypDepart: string = 'cod_typ_depart';
  codBanque: string = 'cod_banq';
  codAgence: string = 'cod_agc';
  codPost: string = 'cod_poste';
  codGouv: string = 'cod_gouv';
  codNatP?: String = ''
  codLieuVal?: string;
  codAffectVal?: string;
  codTypDepartVal?: string;
  codBanqueVal?: string;
  codAgenceVal?: string;
  codPostVal?: string;
  codGouvVal?: string;
  codMatIntVal?: string;

  selectedCode: string = '';
  selectedCodeLieu: string = '';

  libNat: string = ''
  libLieu: string = ''
  libAffect: string = ''
  libTypDepart: string = ''
  libBanque: string = ''
  libAgence: string = ''
  libGouv: string = ''
  libPoste: string = ''
  libMatInt: string = ''

  formAdherent!: FormGroup;
  formAdrPers!: FormGroup;
  formPere!: FormGroup;
  formMere!: FormGroup;
  formConjoint!: FormGroup;
  formPhoto!: FormGroup;
  columnsNat: any[] = [];
  columnsLieu: any[] = [];
  columnAffect: any[] = [];
  columnBanque: any[] = [];
  columnsTypDepart: any[] = [];
  columnsAgence: any[] = [];
  columnsGouv: any[] = [];
  columnsPoste: any[] = [];
  columnsSearch: any[] = [];
  columnsMatInt: any[] = [];
  file!: File
  imageURL: string | undefined;


  ///////////////////////////// save
  save !: boolean
  isDisabled !: boolean;
  customers: any[] = [];
  totalRecords: number = 0;
  ////////////////////////////////
  errorMessageMat!: any
  @ViewChild('content') content: any;
  isSearch: boolean = true;
  @ViewChild('tableau1') tableau1!: TableauComponent<any>; // Reference to the first TableauComponent
  @ViewChild('tableau2') tableau2!: TableauComponent<any>;
  @Output() deleteRowEvent = new EventEmitter<number>(); // EventEmitter to pass index for deletion

  tableConfig = {

    columns: [
      { header: 'Numéro', field: 'num_fam', editable: true, width: '100px', natureChamp: 'code', searchable: true },
      { header: 'Nom & Prénom', field: 'nom_pren', editable: true, width: '200px', natureChamp: 'code', searchable: true },
      { header: 'Date naissance', field: 'dat_naiss', editable: true, mask: '00/00/0000', format: 'date', width: '150px', searchable: true },
      { header: 'Sexe', field: 'sexe', editable: true, selectOptions: [{ label: "Masculin", value: "M" }, { label: "Feminin", value: "F" }], width: '100px', searchable: true },
      { header: 'Handicap', field: 'handicap', editable: true, selectOptions: [{ label: "Oui", value: "O" }, { label: "Non", value: "N" }], width: '100px', searchable: true },
      {
        header: 'Code',
        field: 'cod_activite',
        editable: true,
        isLov: true,
        width: '120px',
        lovList: [],
        lovColumns: [{ key: 'cod_activite', label: 'cod_activite' }, { key: 'lib_activite', label: 'Libelle' }],
        updateFieldsOnSelect: { 'lib_activite': 'lib_activite' }, searchable: true
      },
      { header: 'libActivite', field: 'lib_activite', editable: true, width: '200px', natureChamp: 'code', ignoreInForm: true, searchable: true },
      { header: 'Pec', field: 'pec', editable: true, selectOptions: [{ label: "Oui", value: "O" }, { label: "Non", value: "N" }], width: '100px', searchable: true },
      { header: 'Date Pec', field: 'dat_pec', editable: true, mask: '00/00/0000', format: 'date', width: '150px', searchable: true },
      { header: 'Date Décé', field: 'dat_dece', editable: true, mask: '00/00/0000', format: 'date', width: '150px', searchable: true },

    ],
    rowsPerPage: 10,
    ISDeleted: false,
    readonly: true

  };
  CarteSoinTable = {
    columns: [
      {
        header: 'Num fam',
        field: 'num_fam',
        editable: true,
        isLov: true,
        width: '120px',
        lovList: [],
        lovColumns: [{ key: 'num_fam', label: 'Num fam' }, { key: 'nom_pren', label: 'nom_pren' }],
        updateFieldsOnSelect: { 'nom_pren': 'nom_pren' }
      },
      // { header: 'libActivite', field: 'lib_activite', editable: true, width: '200px', natureChamp: 'code' ,ignoreInForm: true },
      // { header: 'Numéro', field: 'num_fam', editable: true, width: '80px', natureChamp: 'code' },
      { header: 'Nom & Prénom', field: 'nom_pren', editable: true, width: '200px', natureChamp: 'code', ignoreInForm: true },
      { header: 'Nature', field: 'nat_cart', editable: true, selectOptions: [{ label: "Carte de Soins", value: "S" }, { label: "Carnet Militaire", value: "M" }], width: '200px' },
      { header: 'Numéro', field: 'num_cart', editable: true, width: '80px', natureChamp: 'code' },
      { header: 'Date affect', field: 'dat_cart', editable: true, mask: '00/00/0000', format: 'date', width: '150px' },
      { header: 'Etat', field: 'etat_cart', editable: true, selectOptions: [{ label: "Courant", value: "C" }, { label: "Non Courant", value: "N" }], width: '100px' },
      { header: 'Perdu', field: 'etat_cart', editable: true, selectOptions: [{ label: "Oui", value: "O" }, { label: "Non", value: "N" }], width: '100px' },
      { header: 'Observation', field: 'obs_cart', editable: true, width: '200px', natureChamp: 'code' },

    ],
    ISDeleted: false,
    readonly: true

  };
  patchedCode: any;
  rows: any;
  constructor(private route: ActivatedRoute, private adherentServ: AdherentService, private fb: FormBuilder, private saveService: SaveService, private modalService: NgbModal, private cdr: ChangeDetectorRef, private tokenStorage: TokenStorage, private carteCnamAlert: CarteCnamAlertService) {

    this.formAdherent = this.fb.group({
      cod_soc: [''],
      mat_pers: ['', Validators.required],
      cod_assur: [''],
      nom_pers: [''],
      sexe: [''],
      cin: [''],
      dat_nais: [''],
      pren_pers: [''],
      dat_emb: [''],
      cod_sit: [''],
      nbr_enf: [''],
      cod_retr: [''],
      num_retr: [''],
      num_assur: [''],
      dat_ass: [''],
      cod_pay: [''],
      rib: [''],
      nom_pers_a: [''],
      pren_pers_a: [''],
      cod_natp: [''],
      cod_banq: [''],
      cod_agc: [''],
      dat_dece: [''],
      etat_act: [''],
      dat_motif: [''],
      cod_lieu_geog: [''],
      bas_plafond: [''],
      nom_jf: [''],
      nom_jf_a: [''],
      photo_pers: [''],
      lieu_nais: [''],
      mnt_param: [''],
      etat_prof: [''],
      dat_aff_cnam: [''],
      corps: [''],
      cod_affect: [''],
      dat_affect: [''],
      cod_typ_depart: [''],
      dat_depart: [''],
      typ_aff: [''],
      cod_user: [''],
      dat_maj: [''],
      mat_int: [''],
      pers_carte: [''],

    });
    this.formPhoto = this.fb.group({
      cod_soc: [''],
      mat_pers: [''],
      photo: [''],
      file_name: [''],
      content_type: [''],
      path: [''],
      id_photo_pers: [''],


    })
    this.formAdrPers = this.fb.group({
      cod_gouv: [],
      cod_poste: [],
      cod_soc: [],
      mat_pers: [],
      num_adr: [],
      rue: [],
      tel_pers: [],
      fax_pers: [],
      adr_courant: [],
      rue_a: [],

    })


    this.formPere = this.fb.group({
      cod_soc: [''],
      mat_pers: [''],
      num_fam: [''],
      parente: [''],
      nom_pren: ['', Validators.required],
      dat_naiss: [''],
      sexe: [''],
      cod_sit: [''],
      handicap: [''],
      cod_activite: [''],
      dat_dece: [''],
      pec: [''],
      dat_pec: [''],
      dat_mar: [''],
      nom_jf: [''],
      num_ass_conj: [''],
      mat_pers_conj: [''],
      pec_mut: [''],
      dat_pec_mut: [''],

    })
    this.formMere = this.fb.group({
      cod_soc: [''],
      mat_pers: [''],
      num_fam: [],
      parente: [''],
      nom_pren: ['', Validators.required],
      dat_naiss: [''],
      sexe: [''],
      cod_sit: [''],
      handicap: [''],
      cod_activite: [''],
      dat_dece: [''],
      pec: [''],
      dat_pec: [''],
      dat_mar: [''],
      nom_jf: [''],
      num_ass_conj: [''],
      mat_pers_conj: [''],
      pec_mut: [''],
      dat_pec_mut: [''],

    })
    this.formConjoint = this.fb.group({
      cod_soc: [''],
      mat_pers: [''],
      num_fam: [],
      parente: [''],
      nom_pren: [''],
      dat_naiss: [''],
      sexe: [''],
      cod_sit: [''],
      handicap: [''],
      cod_activite: [''],
      dat_dece: [''],
      pec: [''],
      dat_pec: [''],
      dat_mar: [''],
      nom_jf: [''],
      num_ass_conj: [''],
      mat_pers_conj: [''],
      pec_mut: [''],
      dat_pec_mut: [''],

    })
  }
  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    // Consultation : formulaires verrouillés, boutons Enregistrer / Supprimer / Nouveau de la barre d'outils désactivés
    [this.formAdherent, this.formAdrPers, this.formPere, this.formMere, this.formConjoint].forEach(f => f?.disable({ emitEvent: false }));
    this.saveService.clearSaveCallback();
    this.saveService.clearDeleteCallback();
    this.saveService.setDisabled(false);
    this.saveService.setConsultation(true);
    this.saveService.setIsSearch(false)
    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch = canSearch

    })

    this.breadCrumbItems = [
      { label: 'Adherent' },
      { label: 'ConsAdherent', active: true }
    ];
    this.getNationalite()
    this.getDepartement()
    this.getAffectation()
    this.getTypeDepart()
    this.getBanque()
    this.getGouv()

    this.getPersonnels(); // Call your service once

    this.getActivite()
    this.getMatInt()
    //this.getCarteSoin()
    // this.getFamille()


    this.route.queryParams.subscribe(params => {
      if (params['triggerSubmit']) {
        this.submit();
        console.log("test save :")

      }
    });


    this.formAdherent.valueChanges.subscribe(() => {
      this.isDisabled = this.formAdherent.pristine;
      this.saveService.setDisabled(!this.isDisabled);
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Subscribe to resetObservable to reset the form
    this.saveService.add$.subscribe(reset => {
      if (reset) {
        this.formAdherent.reset(); // Reset the form
        this.formAdrPers.reset();
        this.formConjoint.reset();
        this.formMere.reset();
        this.formPere.reset();
        this.codNatP = ''
        this.codLieuVal = '';
        this.codAffectVal = '';
        this.codTypDepartVal = '';
        this.codBanqueVal = '';
        this.codAgenceVal = '';
        this.codPostVal = '';
        this.codGouvVal = '';
        this.selectedCode = '';
        this.selectedCodeLieu = '';

        this.libNat = ''
        this.libLieu = ''
        this.libAffect = ''
        this.libTypDepart = ''
        this.libBanque = ''
        this.libAgence = ''
        this.libGouv = ''
        this.libPoste = ''
        this.tableau1 = null as any
        this.tableau2 = null as any
        this.CarteSoinList = []
        this.CarteSoinCnamList = []
        this.dataRows = []
        this.saveService.setAdded(false); // Reset the observable to false
        this.file = null as any
        console.log("this.file :", this.file)
      }
    });


  }
  ngOnDestroy() {
    this.saveService.setConsultation(false);
    if (this.imageURL) {
      URL.revokeObjectURL(this.imageURL);
    }
  }


  getActivite() {
    this.adherentServ.getActivite().subscribe(
      (data: any) => {
        this.listActivite = data;

        // Set the lovList for the column in tableConfig
        const codeColumn = this.tableConfig.columns.find(column => column.field === 'cod_activite');
        if (codeColumn) {
          codeColumn.lovList = data;
          //  codeColumn.selectOptions = data;
          // Iterate over each item in the data array and assign it to selectOptions


        }
      },
      error => {
        console.error('Error fetching data:', error);
      }
    );
  }
  /*getFamille() {
    this.adherentServ.getFamille(this.tokenStorage.getUser().codSoc,this.formAdherent.get('mat_pers')?.value).subscribe(
        (data: any) => {
          //  this.listActivite = data;
  
            // Set the lovList for the column in tableConfig
            const codeColumn = this.CarteSoinTable.columns.find(column => column.field === 'num_fam');
            if (codeColumn) {
                codeColumn.lovList = data;
              //  codeColumn.selectOptions = data;
                // Iterate over each item in the data array and assign it to selectOptions
                
  
             }
        },
        error => {
            console.error('Error fetching data:', error);
        }
    );
  }*/
  onSelectedValueNat(item: any) {
    this.libNat = item.lib_nat; // Mise à jour du champ libellé
    this.formAdherent.patchValue({
      cod_natp: item.cod_natp,

    });
    if (item == null)
      this.libNat = ''

  }
  onSelectedValueLieu(item: any) {
    this.selectedCodeLieu = item.cod_lieu_geog; // Mise à jour du champ code
    this.libLieu = item.lib_lieu; // Mise à jour du champ libellé
    this.formAdherent.patchValue({
      cod_lieu_geog: item.cod_lieu_geog,

    });
  }
  onSelectedValueAffect(item: any) {
    //   this.codAffect = item.cod_affect; // Mise à jour du champ code
    if (item.cod_affect) {
      this.libAffect = item.lib_affect; // Mise à jour du champ libellé
    }
    this.formAdherent.patchValue({
      cod_affect: item.cod_affect,

    });
  }

  onSelectedValueTypDepart(item: any) {
    //  this.codTypDepart = item.cod_typ_depart; // Mise à jour du champ code
    this.libTypDepart = item.lib_typ_depart; // Mise à jour du champ libellé
    this.formAdherent.patchValue({
      cod_typ_depart: item.cod_typ_depart,

    });
  }
  onSelectedValueBanque(item: any) {
    // this.codBanque = item.cod_banq; // Mise à jour du champ code
    this.libBanque = item.lib_banq; // Mise à jour du champ libellé
    this.adherentServ.getAgence(this.codBanque).subscribe(data => {
      this.listAgence = data
    })
    this.columnsAgence = [
      { key: 'cod_agc', label: 'Code' },
      { key: 'lib_agc', label: 'Libelle' },
    ];

    this.formAdherent.patchValue({
      cod_banq: item.cod_banq,

    });
  }

  onSelectedValueAgence(item: any) {
    //this.codAgence = item.cod_agc; // Mise à jour du champ code
    this.libAgence = item.lib_agc; // Mise à jour du champ libellé
    this.formAdherent.patchValue({
      cod_agc: item.cod_agc,

    });

  }
  onSelectedValueGouv(item: any) {
    //  this.codGouv = item.cod_gouv; // Mise à jour du champ code
    this.libGouv = item.lib_gouv; // Mise à jour du champ libellé
    this.adherentServ.getPoste(item.cod_gouv).subscribe(data => {
      this.listPoste = data
      console.log('poste :', this.listPoste)
    })

    this.columnsAgence = [
      { key: 'cod_poste', label: 'Code' },
      { key: 'lib_post', label: 'Libelle' },
    ];
    this.formAdrPers.patchValue({
      cod_gouv: item.cod_gouv,

    });
  }
  onSelectedValuePoste(item: any) {
    this.codPost = item.cod_poste; // Mise à jour du champ code
    this.libPoste = item.lib_post; // Mise à jour du champ libellé

    this.formAdrPers.patchValue({
      cod_poste: item.cod_poste,

    });
  }
  onSelectedVMatInt(item: any) {
    this.formAdherent.get('mat_pers')?.setValue(item.matPers)  // Mise à jour du champ libellé

    this.formAdherent.get('mat_pers')?.patchValue(item.matPers)  // Mise à jour du champ libellé


  }
  getMatInt() {
    this.adherentServ.getMatInt().subscribe(data => {
      this.listMatInt = data;
      console.log(this.listNationalite)
      // Définir les colonnes dynamiques du tableau
      this.columnsMatInt = [
        { key: 'matInt', label: 'Mat int' },
        { key: 'matPers', label: 'Matricule' },
        { key: 'nomPren', label: 'Nom & Prénom' },

        // { key: 'lib_tit_a', label: 'Libellé 2éme langue' }
      ];

    });
  }
  getNationalite() {
    this.adherentServ.getNationalite().subscribe(data => {
      this.listNationalite = data;
      console.log(this.listNationalite)
      // Définir les colonnes dynamiques du tableau
      this.columnsNat = [
        { key: 'cod_natp', label: 'Code' },
        { key: 'lib_nat', label: 'Libelle' },
        { key: 'lib_nat_a', label: 'Libelle arabe' },

        // { key: 'lib_tit_a', label: 'Libellé 2éme langue' }
      ];

    });
  }
  getTypeDepart() {
    this.adherentServ.getTypeDepart().subscribe(data => {
      this.listTypeDepart = data;
      // Définir les colonnes dynamiques du tableau
      this.columnsTypDepart = [
        { key: 'cod_typ_depart', label: 'Code' },
        { key: 'lib_typ_depart', label: 'Libelle' },
        { key: 'etat_act', label: 'Etat' },

        // { key: 'lib_tit_a', label: 'Libellé 2éme langue' }
      ];

    });
  }
  getAffectation() {
    this.adherentServ.getAffectation().subscribe(data => {
      this.listAffectation = data;
      this.columnAffect = [
        { key: 'cod_affect', label: 'Code' },
        { key: 'lib_affect', label: 'Libelle' },
        { key: 'lib_affect_a', label: 'Libelle arabe' },
      ];

    });
  }
  getDepartement() {
    this.adherentServ.getLieu().subscribe(data => {
      this.listLieu = data;
      this.columnsLieu = [
        { key: 'cod_lieu_geog', label: 'Code' },
        { key: 'lib_lieu', label: 'Libelle' },
        { key: 'lib_lieu_a', label: 'Libelle arabe' },

      ];

    });
  }

  getBanque() {
    this.adherentServ.getBanque().subscribe(data => {
      this.listBanque = data;
      this.columnBanque = [
        { key: 'cod_banq', label: 'Code' },
        { key: 'lib_banq', label: 'Libelle' },
        { key: 'abrv_banq', label: 'Abréviation' },
      ];

    });
  }
  getGouv() {
    this.adherentServ.getGouv().subscribe(data => {
      this.listGouv = data;
      console.log("listGouv", this.listGouv)
      this.columnsGouv = [
        { key: 'cod_gouv', label: 'Code' },
        { key: 'lib_gouv', label: 'Libelle' },
        { key: 'lib_gouv_a', label: 'Abréviation' },
      ];

    });
  }

  getPersonnels() {
    this.adherentServ.getPersonnels().subscribe(data => {
      console.log("personnel", data)
      this.listPersonnel = data;
      this.columnsSearch = [
        { key: 'mat_pers', label: 'Matricule' },
        { key: 'mat_int', label: 'Mat. Administratif' },
        { key: 'dat_nais', label: 'Date naissance' },
        { key: 'nom_pers', label: 'Nom' },
        { key: 'pren_pers', label: 'Prénom' },
        { key: 'num_retr', label: 'Id unique' },
        { key: 'cin', label: 'CIN' },
        { key: 'cod_lieu_geog', label: 'Service' },
      ];

    });
  }
  countMat() {
    this.adherentServ.countMat(this.tokenStorage.getUser().codSoc, '998').subscribe(data => {


    });
  }


  submit() {
    // Format dates for formAdherent
    const formatDates = (form: any, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value); // Assuming formatDate returns a string or null
        form.get(field)?.setValue(value);
        formatted.push(value); // Push value into the string[] array
        return formatted;
      }, []);

    const adherentDates = formatDates(this.formAdherent, [
      'dat_nais',
      'dat_emb',
      'dat_affect',
      'dat_depart',
      'dat_ass',
      'dat_aff_cnam',
    ]);

    const pereDates = formatDates(this.formPere, [
      'dat_naiss',
      'dat_pec',
      'dat_dece',
      'dat_pec_mut',
    ]);

    const mereDates = formatDates(this.formMere, [
      'dat_naiss',
      'dat_pec',
      'dat_dece',
      'dat_pec_mut',
    ]);

    const conjointDates = formatDates(this.formConjoint, [
      'dat_naiss',
      'dat_pec',
      'dat_dece',
      'dat_pec_mut',
      'dat_mar',
    ]);

    // Set mat_pers across all forms
    const matPers = this.formAdherent.get('mat_pers')?.value;


    [this.formAdrPers, this.formPere, this.formMere, this.formConjoint, this.formPhoto].forEach((form) => {
      form.get('mat_pers')?.setValue(matPers);
      form.get('cod_soc')?.setValue(this.tokenStorage.getUser().codSoc);
    });
    this.formConjoint.get('parente')?.setValue('C')
    this.formConjoint.get('num_fam')?.setValue('99')
    this.formPere.get('parente')?.setValue('P')
    this.formPere.get('num_fam')?.setValue('97')
    this.formMere.get('parente')?.setValue('M')
    this.formMere.get('num_fam')?.setValue('98')

    // Update tableau1 and tableau2 rows
    this.tableau1.rowsForm.value.rows = this.tableau1.rowsForm.value.rows.map((group: any) => ({
      ...group,
      mat_pers: matPers,
      cod_soc: this.tokenStorage.getUser().codSoc,
      parente: 'E',
    }));

    this.tableau2.rowsForm.value.rows = this.tableau2.rowsForm.value.rows.map((group: any) => ({
      ...group,
      mat_pers: matPers,
      cod_soc: this.tokenStorage.getUser().codSoc,
    }));

    this.validators();
    const formData = new FormData();
    const photoForm = this.formPhoto.value;
    formData.append('file', this.file);
    formData.append('photoPers', JSON.stringify(photoForm));

    console.log("formData", this.file)
    //mise a jour
    if (matPers) {
      if (this.formPere.valid) {
        this.adherentServ.AddPere(this.formPere.value).subscribe(data => { })

      }
      if (this.formMere.valid) {
        this.adherentServ.AddMere(this.formMere.value).subscribe(data => { })

      }
      if (this.formAdherent.valid) {
        const observables = [
          this.adherentServ.AddPersonnel(this.formAdherent.value).pipe(
            switchMap(() =>
              forkJoin([
                this.adherentServ.AddCarteSoinPers(this.tableau2.rowsForm.value.rows),
                this.adherentServ.AddPhoto(formData)
                /*this.adherentServ.getMaxNumAdr(this.tokenStorage.getUser().codSoc, matPers).pipe(
                  switchMap((numAdr) => {
                    this.formAdrPers.get('num_adr')?.setValue(numAdr);
                    return this.adherentServ.AddAdresse(this.formAdrPers.value);
                  })
                ),*/
              ])
            )
          ),
        ];
        console.log("this.formAdherent", this.formAdherent.value)
        console.log("this.formAdrPers", this.formAdrPers.value)
        console.log("this.formMere.value", this.formMere.value)
        console.log("this.formConjoint.value", this.formConjoint.value)
        console.log("this.tableau1.rowsForm.value.rows", this.tableau1.rowsForm.value.rows)
        console.log("this.tableau2.rowsForm.value.rows", this.tableau2.rowsForm.value.rows)

        if (this.formAdherent.get('cod_sit')?.value !== 'C' && this.formAdherent.get('cod_sit')?.value !== '') {
          observables.push(this.adherentServ.AddConjoint(this.formConjoint.value));
        }

        forkJoin(observables).subscribe({
          next: () => {
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Ajouter avec succès !',
              showConfirmButton: false,
              timer: 2000,
            });
          },
          error: (error) => {
            console.error("Error while adding data:", error);
            Swal.fire({
              position: 'top-end',
              icon: 'error',
              title: 'Erreur lors de l\'ajout des données. Veuillez réessayer.',
              showConfirmButton: false,
              timer: 2000,
            });
          },
        });
      } else {
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'Veuillez vérifier votre formulaire',
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } /*ajout*/
    else {
      if (this.formPere.valid) {
        this.adherentServ.AddPere(this.formPere.value).subscribe(data => { })

      }
      if (this.formMere.valid) {
        this.adherentServ.AddMere(this.formMere.value).subscribe(data => { })

      }
      if (this.formAdherent.valid) {
        const observables = [
          this.adherentServ.AddPersonnel(this.formAdherent.value).pipe(
            switchMap(() =>
              forkJoin([
                this.adherentServ.AddCarteSoinPers(this.tableau2.rowsForm.value.rows),
                this.adherentServ.getMaxNumAdr(this.tokenStorage.getUser().codSoc, matPers).pipe(
                  switchMap((numAdr) => {
                    this.formAdrPers.get('num_adr')?.setValue(numAdr);
                    return this.adherentServ.AddAdresse(this.formAdrPers.value);
                  })
                ),
              ])
            )
          ),
        ];

        if (this.formAdherent.get('cod_sit')?.value !== 'C' && this.formAdherent.get('cod_sit')?.value !== '') {
          observables.push(this.adherentServ.AddConjoint(this.formConjoint.value));
        }

        forkJoin(observables).subscribe({
          next: () => {
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Ajouter avec succès !',
              showConfirmButton: false,
              timer: 2000,
            });
          },
          error: (error) => {
            console.error("Error while adding data:", error);
            Swal.fire({
              position: 'top-end',
              icon: 'error',
              title: 'Erreur lors de l\'ajout des données. Veuillez réessayer.',
              showConfirmButton: false,
              timer: 2000,
            });
          },
        });
      } else {
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'Veuillez vérifier votre formulaire',
          showConfirmButton: false,
          timer: 2000,
        });
      }
    }
  }


  formatDate(dateString: string): string {
    // Ensure the string is in the format 'ddmmyyyy'
    if (dateString && dateString.length === 8) {
      const day = dateString.substring(0, 2);
      const month = dateString.substring(2, 4);
      const year = dateString.substring(4, 8);
      return `${day}/${month}/${year}`;
    }
    return dateString;
  }

  checkMatricule(event: any) {

    this.adherentServ.countMat(this.tokenStorage.getUser().codSoc, event.target.value).subscribe(
      (result: number) => {
        if (result !== 0) {
          this.errorMessageMat = 'Matricule exist déja.';
        }
        else {
          this.errorMessageMat = '';
          // Proceed with other logic if needed
        }
      },
      (error) => {
        console.error('Error checking matricule:', error);
        this.errorMessageMat = 'An error occurred while validating the matricule.';
      }
    );

    console.log("result :", this.errorMessageMat)

  }
  validators() {
    if (this.formAdherent.get('mat_pers')?.value === '') {
      this.errorMessageMat = 'Matricule obligatoire'
    }

  }

  openModal(targetModal: any, adr: any): void {
    this.modalService.open(targetModal, {
      windowClass: "my-class",
      centered: true,
    });
    this.formAdrPers.patchValue({
      codGouv: adr.codGouv,
      codPost: adr.codPoste,
      cod_soc: adr.cod_soc,
      mat_pers: adr.mat_pers,
      num_adr: adr.num_adr,
      rue: adr.rue,
      tel_pers: adr.tel_pers,
      fax_pers: adr.fax_pers,
      adr_courant: adr.adrCourant,
      rue_a: adr.rue_a
    });
  }

  openModalAdd(targetModal: any): void {
    this.modalService.open(targetModal, {
      windowClass: "my-class",
      centered: true,
    });

    this.formAdrPers.reset()
    this.formAdrPers.patchValue({ cod_soc: this.tokenStorage.getUser().codSoc })
    console.log(this.formAdrPers.value)
  }

  deleteRow(id: any) {
    console.log("id", id)
    console.log("id", this.formAdherent.get('mat_pers')?.value)
    Swal.fire({
      title: 'Es-tu sûr?',
      text: 'Tu ne pourras pas revenir en arrière!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#34c38f',
      cancelButtonColor: '#f46a6a',
      confirmButtonText: 'Oui, Supprimer le!'
    }).then(result => {
      if (result.value) {

        this.adherentServ.deleteFamille(this.tokenStorage.getUser().codSoc, id.num_fam, this.formAdherent.get('mat_pers')?.value).subscribe({
          next: () => {
            console.log("succes");
            // this.rows = this.rows.filter((row:any) => row.id !== id.num_fam);

            // Emit the delete event to the generic component
            this.deleteRowEvent.emit(id.num_fam);
            // Remove the row from the data array after successful deletion
            //this.rows = this.rows.filter(row => row.id !== id);
          },
          error: (err) => {
            console.error('Error deleting row:', err);
          }
        });

      }
    });

  }

  handleRowAdded(event: any) {
    console.log('Row added:', event);
  }

  search(item: any) {
    console.log("this.codeField", this.codeField)
    this.carteCnamAlert.verifierExpirationMatricule(item.mat_pers, item.cod_soc, [item.nom_pers, item.pren_pers].filter(Boolean).join(' '));
    this.formAdherent.patchValue({
      cod_soc: item.cod_soc,
      mat_pers: item.mat_pers,
      cod_assur: item.cod_assur,
      nom_pers: item.nom_pers,
      sexe: item.sexe,
      cin: item.cin,
      dat_nais: item.dat_nais,
      pren_pers: item.pren_pers,
      dat_emb: item.dat_emb,
      cod_sit: item.cod_sit,
      //nbr_enf:item.nbr_enf,
      cod_retr: item.cod_retr,
      num_retr: item.num_retr,
      num_assur: item.num_assur,
      dat_ass: item.dat_ass,
      cod_pay: item.cod_pay,
      rib: item.rib,
      nom_pers_a: item.nom_pers_a,
      pren_pers_a: item.pren_pers_a,
      cod_natp: item.cod_natp,
      cod_banq: item.cod_banq,
      cod_agc: item.cod_agc,
      dat_dece: item.dat_dece,
      etat_act: item.etat_act,
      dat_motif: item.dat_motif,
      cod_lieu_geog: item.cod_lieu_geog,
      bas_plafond: item.bas_plafond,
      nom_jf: item.nom_jf,
      nom_jf_a: item.nom_jf_a,
      photo_pers: item.photo_pers,
      lieu_nais: item.lieu_nais,
      mnt_param: item.mnt_param,
      etat_prof: item.etat_prof,
      dat_aff_cnam: item.dat_aff_cnam,
      corps: item.corps,
      cod_affect: item.cod_affect,
      dat_affect: item.dat_affect,
      cod_typ_depart: item.cod_typ_depart,
      dat_depart: item.dat_depart,
      typ_aff: item.typ_aff,
      cod_user: item.cod_user,
      dat_maj: item.dat_maj,
      mat_int: item.mat_int,
      pers_carte: item.pers_carte,
    });

    this.codNatP = item.cod_natp
    this.codLieuVal = item.cod_lieu_geog
    this.codAffectVal = item.cod_affect
    this.codTypDepartVal = item.cod_typ_depart
    this.codBanqueVal = item.codBanque
    this.codAgence = item.codAgenceVal
    console.log("this.codNatP", this.codNatP)
    this.adherentServ.getEnfants(item.cod_soc, item.mat_pers).subscribe(
      (data: any) => {
        this.dataRows = data;
        console.log("this.dataRows", this.dataRows)

      },
      error => {
        console.error('Error fetching data:', error);
      }
    );
    this.adherentServ.getCarteSoin(item.cod_soc, item.mat_pers).subscribe(
      (data: any) => {
        this.CarteSoinList = data;
        console.log("this.CarteSoinList", this.CarteSoinList)
        // Set the lovList for the column in tableConfig

      },
      error => {
        console.error('Error fetching data:', error);
      }
    );
    this.adherentServ.getCarteSoinCnam(item.cod_soc, item.mat_pers).subscribe(
      (data: any) => {
        this.CarteSoinCnamList = Array.isArray(data) ? data : [];
      },
      error => {
        console.error('Error fetching carte soins CNAM:', error);
        this.CarteSoinCnamList = [];
      }
    );
    this.adherentServ.getPere(item.cod_soc, item.mat_pers).subscribe(
      (data: any) => {
        this.formPere.patchValue({
          cod_soc: data.cod_soc,
          mat_pers: data.mat_pers,
          num_fam: data.num_fam,
          parente: data.parente,
          nom_pren: data.nom_pren,
          dat_naiss: data.dat_naiss,
          sexe: data.sexe,
          cod_sit: data.cod_sit,
          handicap: data.handicap,
          cod_activite: data.cod_activite,
          dat_dece: data.dat_dece,
          pec: data.pec,
          dat_pec: data.dat_pec,
          dat_mar: data.dat_mar,
          nom_jf: data.nom_jf,
          num_ass_conj: data.num_ass_conj,
          mat_pers_conj: data.mat_pers_conj,
          pec_mut: data.pec_mut,
          dat_pec_mut: data.dat_pec_mut,

        })


      },
      error => {
        console.error('Error fetching data:', error);
      }
    );
    this.adherentServ.getMere(item.cod_soc, item.mat_pers).subscribe(
      (data: any) => {
        this.formMere.patchValue({
          cod_soc: data.cod_soc,
          mat_pers: data.mat_pers,
          num_fam: data.num_fam,
          parente: data.parente,
          nom_pren: data.nom_pren,
          dat_naiss: data.dat_naiss,
          sexe: data.sexe,
          cod_sit: data.cod_sit,
          handicap: data.handicap,
          cod_activite: data.cod_activite,
          dat_dece: data.dat_dece,
          pec: data.pec,
          dat_pec: data.dat_pec,
          dat_mar: data.dat_mar,
          nom_jf: data.nom_jf,
          num_ass_conj: data.num_ass_conj,
          mat_pers_conj: data.mat_pers_conj,
          pec_mut: data.pec_mut,
          dat_pec_mut: data.dat_pec_mut,

        })


      },
      error => {
        console.error('Error fetching data:', error);
      }
    );
    this.adherentServ.getConjoint(item.cod_soc, item.mat_pers).subscribe(
      (data: any) => {
        this.formConjoint.patchValue({
          cod_soc: data.cod_soc,
          mat_pers: data.mat_pers,
          num_fam: data.num_fam,
          parente: data.parente,
          nom_pren: data.nom_pren,
          dat_naiss: data.dat_naiss,
          sexe: data.sexe,
          cod_sit: data.cod_sit,
          handicap: data.handicap,
          cod_activite: data.cod_activite,
          dat_dece: data.dat_dece,
          pec: data.pec,
          dat_pec: data.dat_pec,
          dat_mar: data.dat_mar,
          nom_jf: data.nom_jf,
          num_ass_conj: data.num_ass_conj,
          mat_pers_conj: data.mat_pers_conj,
          pec_mut: data.pec_mut,
          dat_pec_mut: data.dat_pec_mut,

        })


      },
      error => {
        console.error('Error fetching data:', error);
      }
    );
    this.adherentServ.getAdresse(item.cod_soc, item.mat_pers).subscribe(data => {
      this.listAdresse = data
      console.log("this.listAdresse", data)
      this.formAdrPers.patchValue({
        cod_gouv: data[0].codGouv,
        cod_poste: data[0].codPoste,
        cod_soc: data[0].codSoc,
        mat_pers: data[0].matPers,
        num_adr: data[0].numAdr,
        rue: data[0].rue,
        tel_pers: data[0].telPers,
        fax_pers: data[0].faxPers,
        adr_courant: data[0].adrCourant,
        rue_a: data[0].rueA,
      })
      console.log("this.listAdresse", this.formAdrPers.value)


    });

    this.adherentServ.getFamille(this.tokenStorage.getUser().codSoc, item.mat_pers).subscribe(
      (data: any) => {
        //  this.listActivite = data;

        // Set the lovList for the column in tableConfig
        const codeColumn = this.CarteSoinTable.columns.find(column => column.field === 'num_fam');
        if (codeColumn) {
          codeColumn.lovList = data;
          //  codeColumn.selectOptions = data;
          // Iterate over each item in the data array and assign it to selectOptions


        }
      },
      error => {
        console.error('Error fetching data:', error);
      }
    );

    this.adherentServ.getPhoto(item.cod_soc, item.mat_pers).subscribe({
      next: (data: any) => {
        if (data.photo) {
          console.log("data.photo", data.photo);

          try {
            // Decode the Base64 string and create a Blob
            const byteCharacters = atob(data.photo);
            const byteNumbers = Array.from(byteCharacters, char => char.charCodeAt(0));
            const byteArray = new Uint8Array(byteNumbers);
            const fileBlob = new Blob([byteArray], { type: data.content_type });

            // Create a File object from the Blob
            this.file = new File([fileBlob], data.file_name || 'uploaded_file', {
              type: data.content_type,
            });

            // Optional: Preview the file (if it's an image)
            if (data.content_type.startsWith('image/')) {
              const imageURL = URL.createObjectURL(this.file);
              this.previewImage(imageURL); // Encapsulated image preview
            }

            console.log("File Object:", this.file);
          } catch (error) {
            console.error("Error decoding Base64 or handling the file:", error);
          }
        } else {
          console.warn("No photo data available.");
        }
      },
      error: (err) => {
        console.error("Error fetching photo:", err);
      },
    });





  }
  private previewImage(imageURL: string): void {
    const imageElement = document.getElementById('product-img') as HTMLImageElement;
    if (imageElement) {
      imageElement.src = imageURL;
    } else {
      console.warn("Image element not found.");
    }
  }
  fileChange(event: any) {
    let fileList: any = (event.target as HTMLInputElement);
    this.file = fileList.files[0];
    document.getElementById('')

    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
      (document.getElementById('product-img') as HTMLImageElement).src = this.imageURL;
    }
    reader.readAsDataURL(this.file)
    console.log("file", this.file)
  }
}
