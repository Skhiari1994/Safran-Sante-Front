import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
  ViewChild,
} from "@angular/core";
import { AdherentService } from "../adherent.service";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { SaveService } from "src/app/shared/Service/save.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { TableauComponent } from "src/app/shared/Composants/tableau/tableau.component";
import { forkJoin, Observable, of, switchMap, combineLatest, startWith } from "rxjs";
import { PaginationService } from "src/app/core/services/pagination.service";
import { ngxCsv } from "ngx-csv";
import { TokenStorage } from "src/app/account/token-storage.service";
import { HttpErrorResponse } from "@angular/common/http";
import Swal from "sweetalert2";

@Component({
  selector: 'app-valid-adherent',
  templateUrl: './valid-adherent.component.html',
  styleUrl: './valid-adherent.component.scss',
  providers: [AdherentService]
})
export class ValidAdherentComponent {
  p: any
  pSusp: number = 1;
  editIndex: number | null = null; // Track the index of the child being edited
  editIndexCarte: number | null = null;
  editCarteIndex: number | null = null;
  serachEdit: boolean = true

  breadCrumbItems!: Array<{}>;
  listNationalite: any[] = [];
  listAffectation: any[] = [];
  listTypeDepart: any[] = [];
  listBanque: any[] = [];
  listLieu: any[] = [];
  listAgence: any[] = [];
  listGouv: any[] = [];
  listPoste: any[] = [];
  listAdresse: any[] = [];
  listPersonnel: any[] = [];
  listMatInt: any[] = [];

  dataRows!: any[];
  listActivite!: any[];
  CarteSoinList!: any[];
  filteredDataRows: any
  filteredDataCarteSoint: any
  codeField: string = "cod_natp";
  codLieu: string = "cod_lieu_geog";
  codAffect: string = "cod_affect";
  codTypDepart: string = "cod_typ_depart";
  codBanque: string = "cod_banq";
  codAgence: string = "cod_agc";
  codPost: string = "cod_poste";
  codGouv: string = "cod_gouv";
  codNatP?: String = "";
  codLieuVal?: string;
  codAffectVal?: string;
  codTypDepartVal?: string;
  codBanqueVal?: string;
  codAgenceVal?: string;
  codPostVal?: string;
  codGouvVal?: string;
  codMatIntVal?: string;
  codActiviteVal?: string;
  numFam?: string;
  files!: File;
  idAttachment?: number

  selectedCode: string = "";
  selectedCodeLieu: string = "";

  libNat: string = "";
  libLieu: string = "";
  libAffect: string = "";
  libTypDepart: string = "";
  libBanque: string = "";
  libAgence: string = "";
  libGouv: string = "";
  libPoste: string = "";
  libMatInt: string = "";
  libActivite: string = "";
  libNom: string = "";

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
  columnsActivite: any[] = [];
  columnFamille: any[] = [];

  file!: File;
  imageURL: string | undefined;

  submitted = false;
  searchTerm: any;
  company?: any;
  ///////////////////////////// save
  save!: boolean;
  isDisabled!: boolean;
  customers: any[] = [];
  totalRecords: number = 0;
  masterSelected!: boolean;
  checkedList: any;
  // Api Data
  econtent?: any;
  allcompany: any;
  searchResults: any;
  formEnfant!: FormGroup;
  edit: boolean = true
  ////////////////////////////////
  errorMessageMat!: any;
  @ViewChild("content") content: any;
  isSearch: boolean = true;
  @ViewChild("tableau1") tableau1!: TableauComponent<any>; // Reference to the first TableauComponent
  @ViewChild("tableau2") tableau2!: TableauComponent<any>;
  @Output() deleteRowEvent = new EventEmitter<number>(); // EventEmitter to pass index for deletion

  columnTitles: { [key: string]: string } = {
    num_fam: 'Numéro',
    nom_pren: 'Nom & Prénom',
    sexe: 'Sexe',
    handicap: 'Handicap',
    cod_activite: 'Code',
    lib_activite: 'Libelle',
    Pec: 'Pec',
    dat_pec: 'Date pec',
    dat_dece: 'Date déces',
  };
  columnTitlesCarte: { [key: string]: string } = {
    num_fam: 'Numéro',
    nom_pren: 'Nom & Prénom',
    nat_cart: 'Nature',
    num_cart: 'Num carte',
    dat_cart: 'Date carte',
    etat_cart: 'Etat',
    perdu: 'Perdu',
    obs_cart: 'Observation',
  };

  tableConfig = {
    columns: [
      {
        header: "Numéro",
        field: "num_fam",
        editable: true,
        width: "100px",
        natureChamp: "code",
        searchable: true,
      },
      {
        header: "Nom & Prénom",
        field: "nom_pren",
        editable: true,
        width: "200px",
        natureChamp: "code",
        searchable: true,
      },
      {
        header: "Date naissance",
        field: "dat_naiss",
        editable: true,
        mask: "00/00/0000",
        format: "date",
        width: "150px",
        searchable: true,
      },
      {
        header: "Sexe",
        field: "sexe",
        editable: true,
        selectOptions: [
          { label: "Masculin", value: "M" },
          { label: "Feminin", value: "F" },
        ],
        width: "100px",
        searchable: true,
      },
      {
        header: "Handicap",
        field: "handicap",
        editable: true,
        selectOptions: [
          { label: "Oui", value: "O" },
          { label: "Non", value: "N" },
        ],
        width: "100px",
        searchable: true,
      },
      {
        header: "Code",
        field: "cod_activite",
        editable: true,
        isLov: true,
        width: "120px",
        lovList: [],
        lovColumns: [
          { key: "cod_activite", label: "cod_activite" },
          { key: "lib_activite", label: "Libelle" },
        ],
        updateFieldsOnSelect: { lib_activite: "lib_activite" },
        searchable: true,
      },
      {
        header: "libActivite",
        field: "lib_activite",
        editable: true,
        width: "200px",
        natureChamp: "code",
        ignoreInForm: true,
        searchable: true,
      },
      {
        header: "Pec",
        field: "pec",
        editable: true,
        selectOptions: [
          { label: "Oui", value: "O" },
          { label: "Non", value: "N" },
        ],
        width: "100px",
        searchable: true,
      },
      {
        header: "Date Pec",
        field: "dat_pec",
        editable: true,
        mask: "00/00/0000",
        format: "date",
        width: "150px",
        searchable: true,
      },
      {
        header: "Date Décé",
        field: "dat_dece",
        editable: true,
        mask: "00/00/0000",
        format: "date",
        width: "150px",
        searchable: true,
      },
    ],
    rowsPerPage: 10,
    ISDeleted: true,
  };
  CarteSoinTable = {
    columns: [
      {
        header: "Num fam",
        field: "num_fam",
        editable: true,
        isLov: true,
        width: "120px",
        lovList: [],
        lovColumns: [
          { key: "num_fam", label: "Num fam" },
          { key: "nom_pren", label: "nom_pren" },
        ],
        updateFieldsOnSelect: { nom_pren: "nom_pren" },
      },
      // { header: 'libActivite', field: 'lib_activite', editable: true, width: '200px', natureChamp: 'code' ,ignoreInForm: true },
      // { header: 'Numéro', field: 'num_fam', editable: true, width: '80px', natureChamp: 'code' },
      {
        header: "Nom & Prénom",
        field: "nom_pren",
        editable: true,
        width: "200px",
        natureChamp: "code",
        ignoreInForm: true,
      },
      {
        header: "Nature",
        field: "nat_cart",
        editable: true,
        selectOptions: [
          { label: "Carte de Soins", value: "S" },
          { label: "Carnet Militaire", value: "M" },
        ],
        width: "200px",
      },
      {
        header: "Numéro",
        field: "num_cart",
        editable: true,
        width: "80px",
        natureChamp: "code",
      },
      {
        header: "Date affect",
        field: "dat_cart",
        editable: true,
        mask: "00/00/0000",
        format: "date",
        width: "150px",
      },
      {
        header: "Etat",
        field: "etat_cart",
        editable: true,
        selectOptions: [
          { label: "Courant", value: "C" },
          { label: "Non Courant", value: "N" },
        ],
        width: "100px",
      },
      {
        header: "Perdu",
        field: "etat_cart",
        editable: true,
        selectOptions: [
          { label: "Oui", value: "O" },
          { label: "Non", value: "N" },
        ],
        width: "100px",
      },
      {
        header: "Observation",
        field: "obs_cart",
        editable: true,
        width: "200px",
        natureChamp: "code",
      },
    ],
    ISDeleted: true,
  };
  patchedCode: any;
  rows: any;
  listFamille: any;
  formCarteSoin!: FormGroup;
  searchFields: any;
  p1: any;
  constructor(
    private adherentServ: AdherentService,
    private fb: FormBuilder,
    private saveService: SaveService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    public service: PaginationService,
    private tokenStorage: TokenStorage
  ) {
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
    this.formAdherent.setValidators(this.birthBeforeHireValidator);
    this.formPhoto = this.fb.group({
      cod_soc: [""],
      mat_pers: [""],
      photo: [""],
      file_name: [""],
      content_type: [""],
      path: [""],
      id_photo_pers: [""],
    });
    this.formAdrPers = this.fb.group({
      cod_gouv: ['', Validators.required],
      cod_poste: ['', Validators.required],
      cod_soc: ['', Validators.required],
      mat_pers: ['', Validators.required],
      num_adr: [1],
      rue: [''],
      tel_pers: [''],
      fax_pers: [''],
      adr_courant: ['O'],
      rue_a: [''],

    });

    this.formPere = this.fb.group({
      cod_soc: [""],
      mat_pers: [""],
      num_fam: [""],
      parente: [""],
      nom_pren: ["", Validators.required],
      dat_naiss: [""],
      sexe: [""],
      cod_sit: [""],
      handicap: [""],
      cod_activite: [""],
      dat_dece: [""],
      pec: [""],
      dat_pec: [""],
      dat_mar: [""],
      nom_jf: [""],
      num_ass_conj: [""],
      mat_pers_conj: [""],
      pec_mut: [""],
      dat_pec_mut: [""],
    });
    this.formMere = this.fb.group({
      cod_soc: [""],
      mat_pers: [""],
      num_fam: [],
      parente: [""],
      nom_pren: ["", Validators.required],
      dat_naiss: [""],
      sexe: [""],
      cod_sit: [""],
      handicap: [""],
      cod_activite: [""],
      dat_dece: [""],
      pec: [""],
      dat_pec: [""],
      dat_mar: [""],
      nom_jf: [""],
      num_ass_conj: [""],
      mat_pers_conj: [""],
      pec_mut: [""],
      dat_pec_mut: [""],
    });

    this.formEnfant = this.fb.group({
      enfants: this.fb.array([]), // FormArray for dynamic children
    });
    this.formCarteSoin = this.fb.group({
      carteSoin: this.fb.array([]), // FormArray for dynamic children
    });
    this.formConjoint = this.fb.group({
      cod_soc: [""],
      mat_pers: [""],
      num_fam: [],
      parente: [""],
      nom_pren: [""],
      dat_naiss: [""],
      sexe: [""],
      cod_sit: [""],
      handicap: [""],
      cod_activite: [""],
      dat_dece: [""],
      pec: [""],
      dat_pec: [""],
      dat_mar: [""],
      nom_jf: [""],
      num_ass_conj: [""],
      mat_pers_conj: [""],
      pec_mut: [""],
      dat_pec_mut: [""],
    });
  }
  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
    ];
    this.getNationalite();
    this.getDepartement();
    this.getAffectation();
    this.getTypeDepart();
    this.getBanque();
    this.getGouv();
    this.getPersonnels();
    this.getActivite();
    this.getMatInt();
    this.addEnfant();

    this.addCarteSoin()
    //this.getCarteSoin()
    this.getFamille()
    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch = canSearch

    })
    // this.saveService.canSave$.subscribe((canSave) => {
    //   this.save = canSave;
    //   if (this.save) {
    //     this.submit();
    //   }
    // });
    this.saveService.registerSaveCallback(() => this.submit());

    this.formAdherent.valueChanges.subscribe(() => {
      this.isDisabled = this.formAdherent.pristine;
      // Keep save button enabled if a personnel has been selected
      if (this.serachEdit) {
        this.saveService.setDisabled(true);
      } else {
        this.saveService.setDisabled(!this.isDisabled);
      }
    });
    this.setupBirthHireAlert();

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Subscribe to resetObservable to reset the form
    this.saveService.add$.subscribe((reset) => {
      if (reset) {
        this.formAdherent.reset(); // Reset the form
        this.formAdrPers.reset();
        this.formConjoint.reset();
        this.formMere.reset();
        this.formPere.reset();
        this.formCarteSoin.reset();
        this.formEnfant.reset();
        this.listFamille = []
        this.listAdresse = []
        this.codNatP = "";
        this.codLieuVal = "";
        this.codAffectVal = "";
        this.codTypDepartVal = "";
        this.codBanqueVal = "";
        this.codAgenceVal = "";
        this.codPostVal = "";
        this.codGouvVal = "";
        this.selectedCode = "";
        this.selectedCodeLieu = "";

        this.libNat = "";
        this.libLieu = "";
        this.libAffect = "";
        this.libTypDepart = "";
        this.libBanque = "";
        this.libAgence = "";
        this.libGouv = "";
        this.libPoste = "";
        this.tableau1 = null as any;
        this.tableau2 = null as any;
        this.CarteSoinList = [];
        this.filteredDataCarteSoint = []
        this.filteredDataRows = []
        this.dataRows = [];
        this.saveService.setAdded(false); // Reset the observable to false
        this.file = null as any;
        console.log("this.file :", this.file);
      }
    });
  }


  ngOnDestroy() {
    // Clear the callback to avoid memory leaks
    this.saveService.clearSaveCallback();
    this.saveService.setIsSearch(false)
    if (this.imageURL) {
      URL.revokeObjectURL(this.imageURL);
    }
  }

  getActivite() {
    this.adherentServ.getActivite().subscribe(
      (data: any) => {
        this.listActivite = data;
        this.columnsActivite = [
          { key: "cod_activite", label: "Code" },
          { key: "lib_activite", label: "Libelle" },
        ];

        // Set the lovList for the column in tableConfig
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );
  }
  getFamille() {
    const soc = this.tokenStorage.getUser().codSoc;
    const mat = this.formAdherent.get('mat_pers')?.value;
    if (!mat) {
      this.listFamille = [];
      this.columnFamille = [
        { key: 'num_fam', label: 'Num fam' },
        { key: 'nom_pren', label: 'Nom' },
      ];
      return;
    }
    this.adherentServ.getFamille(soc, mat).subscribe(
      (data: any) => {
        this.listFamille = data;
        this.columnFamille = [
          { key: 'num_fam', label: 'Num fam' },
          { key: 'nom_pren', label: 'Nom' },
        ];
      },
      (error) => {
        console.error('Error fetching data:', error);
        this.listFamille = [];
      }
    );
  }
  onSelectedValueFamille(item: any) {
    // this.libNom = item.nom_pren; // Mise à jour du champ libellé
    // this.formCarteSoin.patchValue({
    //   num_fam: item.num_fam,
    // });


    const enfantsArray = this.formCarteSoin.get('carteSoin') as FormArray;



    const selectedFormGroup = enfantsArray.at(0) as FormGroup;

    console.log("enfantsArray", enfantsArray);

    if (selectedFormGroup) {
      if (selectedFormGroup.get('num_fam')) {
        this.libNom = item.nom_pren
        selectedFormGroup.patchValue({
          num_fam: item.num_fam,
        });
        console.log("selectedFormGroup", selectedFormGroup);

        console.log(`Patched values: num_fam = ${item.num_fam}, libNom = ${item.nom_pren}`);
      } else {
        console.error(`num_fam control is missing in the FormGroup at index ${this.editIndex}`);
      }
    } else {
      console.error(`FormGroup is missing at index ${this.editIndex}`);
    }

  }
  onSelectedValueActivite(item: any): void {
    const enfantsArray = this.formEnfant.get('enfants') as FormArray;
    this.libActivite = item.lib_activite

    if (this.editIndex !== null && this.editIndex >= 0) {
      const selectedFormGroup = enfantsArray.at(0) as FormGroup;

      console.log("enfantsArray", enfantsArray);

      if (selectedFormGroup) {
        if (selectedFormGroup.get('cod_activite')) {
          selectedFormGroup.patchValue({
            cod_activite: item.cod_activite,
          });
          console.log("selectedFormGroup", selectedFormGroup);

          console.log(`Patched values: cod_activite = ${item.cod_activite}, lib_activite = ${item.lib_activite}`);
        } else {
          console.error(`cod_activite control is missing in the FormGroup at index ${this.editIndex}`);
        }
      } else {
        console.error(`FormGroup is missing at index ${this.editIndex}`);
      }
    } else {
      console.error('Invalid editIndex:', this.editIndex);
    }
  }


  onSelectedValueNat(item: any) {
    this.libNat = item.lib_nat; // Mise à jour du champ libellé
    this.formAdherent.patchValue({
      cod_natp: item.cod_natp,
    });
    if (item == null) this.libNat = "";
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
    this.adherentServ.getAgence(this.codBanque).subscribe((data) => {
      this.listAgence = data;
    });
    this.columnsAgence = [
      { key: "cod_agc", label: "Code" },
      { key: "lib_agc", label: "Libelle" },
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
    this.adherentServ.getPoste(item.cod_gouv).subscribe((data) => {
      this.listPoste = data;
      this.columnsPoste = [
        { key: "cod_poste", label: "Code" },
        { key: "lib_post", label: "Libelle" },
      ];
      console.log("poste :", this.listPoste);
    });


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
    this.formAdherent.get("mat_pers")?.setValue(item.matPers); // Mise à jour du champ libellé

    this.formAdherent.get("mat_pers")?.patchValue(item.matPers); // Mise à jour du champ libellé
  }
  getMatInt() {
    this.adherentServ.getMatInt().subscribe((data) => {
      this.listMatInt = data;
      console.log(this.listNationalite);
      // Définir les colonnes dynamiques du tableau
      this.columnsMatInt = [
        { key: "matInt", label: "Mat int" },
        { key: "matPers", label: "Matricule" },
        { key: "nomPren", label: "Nom & Prénom" },
      ];
    });
  }
  getNationalite() {
    this.adherentServ.getNationalite().subscribe((data) => {
      this.listNationalite = data;
      console.log(this.listNationalite);
      // Définir les colonnes dynamiques du tableau
      this.columnsNat = [
        { key: "cod_natp", label: "Code" },
        { key: "lib_nat", label: "Libelle" },
        { key: "lib_nat_a", label: "Libelle arabe" },

        // { key: 'lib_tit_a', label: 'Libellé 2éme langue' }
      ];
    });
  }
  getTypeDepart() {
    this.adherentServ.getTypeDepart().subscribe((data) => {
      this.listTypeDepart = data;
      // Définir les colonnes dynamiques du tableau
      this.columnsTypDepart = [
        { key: "cod_typ_depart", label: "Code" },
        { key: "lib_typ_depart", label: "Libelle" },
        { key: "etat_act", label: "Etat" },

        // { key: 'lib_tit_a', label: 'Libellé 2éme langue' }
      ];
    });
  }
  getAffectation() {
    this.adherentServ.getAffectation().subscribe((data) => {
      this.listAffectation = data;
      this.columnAffect = [
        { key: "cod_affect", label: "Code" },
        { key: "lib_affect", label: "Libelle" },
        { key: "lib_affect_a", label: "Libelle arabe" },
      ];
    });
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

  getBanque() {
    this.adherentServ.getBanque().subscribe((data) => {
      this.listBanque = data;
      this.columnBanque = [
        { key: "cod_banq", label: "Code" },
        { key: "lib_banq", label: "Libelle" },
        { key: "abrv_banq", label: "Abréviation" },
      ];
    });
  }
  getGouv() {
    this.adherentServ.getGouv().subscribe((data) => {
      this.listGouv = data;
      console.log("listGouv", this.listGouv);
      this.columnsGouv = [
        { key: "cod_gouv", label: "Code" },
        { key: "lib_gouv", label: "Libelle" },
        { key: "lib_gouv_a", label: "Abréviation" },
      ];
    });
  }

  getPersonnels() {
    this.adherentServ.getPersonnelsEnInstance().subscribe((data) => {
      this.listPersonnel = data;
      this.columnsSearch = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "nom_pers", label: "Nom" },
        { key: "pren_pers", label: "Prénom" },
        { key: "num_retr", label: "Id unique" },
        { key: "cin", label: "CIN" },
        { key: "cod_lieu_geog", label: "Service" },
      ];
    });
  }
  countMat() {
    this.adherentServ.countMat(this.tokenStorage.getUser().codSoc, "998").subscribe((data) => { });
  }
  submit(): void {
    const formatDates = (form: FormGroup, fields: string[]): void => {
      fields.forEach(field => {
        const rawValue = form.get(field)?.value;
        const formatted = this.formatDate(rawValue);
        form.get(field)?.setValue(formatted);
      });
    };

    // Format dates
    formatDates(this.formAdherent, ["dat_nais", "dat_emb", "dat_affect", "dat_depart", "dat_ass", "dat_aff_cnam"]);
    formatDates(this.formPere, ["dat_naiss", "dat_pec", "dat_dece", "dat_pec_mut"]);
    formatDates(this.formMere, ["dat_naiss", "dat_pec", "dat_dece", "dat_pec_mut"]);
    formatDates(this.formConjoint, ["dat_naiss", "dat_pec", "dat_dece", "dat_pec_mut", "dat_mar"]);

    const matPers = this.formAdherent.get("mat_pers")?.value;
    const codSoc = this.tokenStorage.getUser().codSoc;

    [this.formAdrPers, this.formPere, this.formMere, this.formConjoint, this.formPhoto].forEach(form => {
      form.get("mat_pers")?.setValue(matPers);
      form.get("cod_soc")?.setValue(codSoc);
    });

    this.formAdherent.get("cod_soc")?.patchValue(codSoc);
    this.formConjoint.patchValue({ parente: "C", num_fam: "99" });
    this.formPere.patchValue({ parente: "P", num_fam: "97" });
    this.formMere.patchValue({ parente: "M", num_fam: "98" });

    this.onUploadFiles(this.file);




    const codSit = this.formAdherent.get("cod_sit")?.value;

    // 1. Appel à AddPersonnel
    this.adherentServ.AddPersonnel(this.formAdherent.value).pipe(
      switchMap(() => {
        const requests: Observable<any>[] = [];

        if (this.formPere.valid) requests.push(this.adherentServ.AddPere(this.formPere.value));
        if (this.formMere.valid) requests.push(this.adherentServ.AddMere(this.formMere.value));
        if (this.formConjoint.valid && codSit && codSit !== "C") {
          requests.push(this.adherentServ.AddConjoint(this.formConjoint.value));
        }

        if (this.enfants.valid && this.enfants.value?.length > 0) {
          const soc = codSoc;
          const mat = matPers;
          const enfantsVal = (this.enfants.value as any[]).map(e => ({ ...e, parente: 'E' }));
          const missing = enfantsVal.filter(e => !e.num_fam);
          if (missing.length > 0 && soc && mat) {
            requests.push(
              this.adherentServ.getMaxNumFamEnfants(soc, mat).pipe(
                switchMap((max: number) => {
                  let next = (max || 0) + 1;
                  const filled = enfantsVal.map(e => e.num_fam ? e : { ...e, num_fam: String(next++) });
                  return this.adherentServ.AddEnfants(filled);
                })
              )
            );
          } else {
            requests.push(this.adherentServ.AddEnfants(enfantsVal));
          }
        }

        if (this.carteSoin.valid && this.carteSoin.value?.length > 0) {
          requests.push(this.adherentServ.AddCarteSoinPers(this.carteSoin.value));
        }
        if (this.formAdrPers.valid && Object.keys(this.formAdrPers.value).length > 0) {
          requests.push(this.adherentServ.AddAdresse(this.formAdrPers.value));
        }

        return forkJoin(requests.length ? requests : [of(null)]);
      })
    ).subscribe({
      next: () => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouté avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
      },
      error: (err) => {
        console.error("Erreur lors de l'envoi :", err);
        Swal.fire("Erreur", "Échec de l'enregistrement.", "error");
      }
    });
  }




  onUploadFiles(file: File): void {
    if (!file) {
      console.warn("No file selected.");
      return;
    }

    const formData = new FormData();
    const photoForm = this.formPhoto.value;

    formData.append("file", file);
    formData.append("photoPers", JSON.stringify(photoForm));

    this.adherentServ.AddPhoto(formData).subscribe({
      next: (res) => {
        console.log("Upload success:", res);
      },
      error: (error: HttpErrorResponse) => {
        console.error("Upload error:", error);
      }
    });
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

  private parseDdMmYyyy(value: string | Date): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value as Date;
    if (typeof value !== 'string') return null;
    const s = value.trim();
    let d: number, mo: number, y: number;
    const m1 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m1) {
      d = parseInt(m1[1], 10);
      mo = parseInt(m1[2], 10) - 1;
      y = parseInt(m1[3], 10);
    } else if (/^\d{8}$/.test(s)) {
      d = parseInt(s.substring(0, 2), 10);
      mo = parseInt(s.substring(2, 4), 10) - 1;
      y = parseInt(s.substring(4, 8), 10);
    } else {
      const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!m2) return null;
      y = parseInt(m2[1], 10);
      mo = parseInt(m2[2], 10) - 1;
      d = parseInt(m2[3], 10);
    }
    const dt = new Date(y, mo, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null;
    return dt;
  }

  private birthBeforeHireValidator: ValidatorFn = (control: AbstractControl) => {
    const group = control as FormGroup;
    const b = this.parseDdMmYyyy(group.get('dat_nais')?.value);
    const h = this.parseDdMmYyyy(group.get('dat_emb')?.value);
    return b && h && b > h ? { birthAfterHire: true } : null;
  };

  private checkBirthHire(): void {
    const bStr = this.formAdherent.get('dat_nais')?.value;
    const hStr = this.formAdherent.get('dat_emb')?.value;
    const b = this.parseDdMmYyyy(bStr);
    const h = this.parseDdMmYyyy(hStr);
    const invalid = !!(b && h && b > h);
    const bn = this.formAdherent.get('dat_nais');
    const hn = this.formAdherent.get('dat_emb');
    if (invalid) {
      bn?.setErrors({ ...(bn.errors || {}), birthAfterHire: true });
      hn?.setErrors({ ...(hn.errors || {}), birthAfterHire: true });
    } else {
      if (bn?.hasError('birthAfterHire')) {
        const e = { ...(bn.errors || {}) };
        delete (e as any)['birthAfterHire'];
        bn.setErrors(Object.keys(e).length ? e : null);
      }
      if (hn?.hasError('birthAfterHire')) {
        const e = { ...(hn.errors || {}) };
        delete (e as any)['birthAfterHire'];
        hn.setErrors(Object.keys(e).length ? e : null);
      }
    }
    this.formAdherent.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }

  private birthHireAlertShown = false;
  private setupBirthHireAlert(): void {
    const bn = this.formAdherent.get('dat_nais');
    const hn = this.formAdherent.get('dat_emb');
    if (!bn || !hn) return;
    const birth$ = bn.valueChanges.pipe(startWith(bn.value));
    const hire$ = hn.valueChanges.pipe(startWith(hn.value));
    combineLatest([birth$, hire$]).subscribe(([bStr, hStr]) => {
      const b = this.parseDdMmYyyy(bStr);
      const h = this.parseDdMmYyyy(hStr);
      if (!b || !h) return;
      const invalid = b > h;
      if (invalid) {
        bn.setErrors({ ...(bn.errors || {}), birthAfterHire: true });
        hn.setErrors({ ...(hn.errors || {}), birthAfterHire: true });
        this.birthHireAlertShown = false;
      } else {
        this.birthHireAlertShown = false;
        if (bn.hasError('birthAfterHire')) {
          const e = { ...(bn.errors || {}) };
          delete (e as any)['birthAfterHire'];
          bn.setErrors(Object.keys(e).length ? e : null);
        }
        if (hn.hasError('birthAfterHire')) {
          const e = { ...(hn.errors || {}) };
          delete (e as any)['birthAfterHire'];
          hn.setErrors(Object.keys(e).length ? e : null);
        }
      }
      this.formAdherent.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  onBirthHireBlur(): void {
    const b = this.parseDdMmYyyy(this.formAdherent.get('dat_nais')?.value);
    const h = this.parseDdMmYyyy(this.formAdherent.get('dat_emb')?.value);
    if (b && h && b > h) {
      const bn = this.formAdherent.get('dat_nais');
      const hn = this.formAdherent.get('dat_emb');
      bn?.setErrors({ ...(bn?.errors || {}), birthAfterHire: true });
      hn?.setErrors({ ...(hn?.errors || {}), birthAfterHire: true });
    }
  }

  checkMatricule(event: any) {
    this.adherentServ.countMat(this.tokenStorage.getUser().codSoc, event.target.value).subscribe(
      (result: number) => {
        if (result !== 0) {
          this.errorMessageMat = "Matricule exist déja.";
        } else {
          this.errorMessageMat = "";
          // Proceed with other logic if needed
        }
      },
      (error) => {
        console.error("Error checking matricule:", error);
        this.errorMessageMat =
          "An error occurred while validating the matricule.";
      }
    );

    console.log("result :", this.errorMessageMat);
  }
  validators() {
    if (this.formAdherent.get("mat_pers")?.value === "") {
      this.errorMessageMat = "Matricule obligatoire";
    }
  }

  // openModal(targetModal: any, adr: any): void {
  //   this.modalService.open(targetModal, {
  //     windowClass: "my-class",
  //     centered: true,
  //   });
  //   this.formAdrPers.patchValue({
  //     codGouv: adr.codGouv,
  //     codPost: adr.codPoste,
  //     cod_soc: adr.cod_soc,
  //     mat_pers: adr.mat_pers,
  //     num_adr: adr.num_adr,
  //     rue: adr.rue,
  //     tel_pers: adr.tel_pers,
  //     fax_pers: adr.fax_pers,
  //     adr_courant: adr.adrCourant,
  //     rue_a: adr.rue_a,
  //   });
  // }

  openModalAdd(targetModal: any): void {

    this.modalService.open(targetModal, {
      windowClass: "my-class",
      centered: true,
      size: "xl"
    });

    this.formAdrPers.reset();
    this.formAdrPers.patchValue({
      cod_soc: this.tokenStorage.getUser().codSoc,
      num_adr: 1,
      adr_courant: 'O'
    });
    console.log(this.formAdrPers.value);
  }

  deleteRow(id: any) {
    console.log("id", id);
    console.log("id", this.formAdherent.get("mat_pers")?.value);
    Swal.fire({
      title: "Es-tu sûr?",
      text: "Tu ne pourras pas revenir en arrière!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#34c38f",
      cancelButtonColor: "#f46a6a",
      confirmButtonText: "Oui, Supprimer le!",
    }).then((result) => {
      if (result.value) {
        this.adherentServ
          .deleteFamille(
            this.tokenStorage.getUser().codSoc,
            id.num_fam,
            this.formAdherent.get("mat_pers")?.value
          )
          .subscribe({
            next: () => {
              console.log("succes");
              this.deleteRowEvent.emit(id.num_fam);
            },
            error: (err) => {
              console.error("Error deleting row:", err);
            },
          });
      }
    });
  }

  handleRowAdded(event: any) {
    console.log("Row added:", event);
  }

  search(item: any) {
    this.serachEdit = true
    this.codMatIntVal = item.mat_int
    this.codNatP = item.cod_natp

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
      nbr_enf: item.nbr_enf,
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
    this.codNatP = item.cod_natp;
    this.codLieuVal = item.cod_lieu_geog;
    this.codAffectVal = item.cod_affect;
    this.codTypDepartVal = item.cod_typ_depart;
    this.codBanqueVal = item.codBanque;
    this.codAgence = item.codAgenceVal;
    console.log("this.codAffectVal", this.codAffectVal);
    this.adherentServ.getEnfants(item.cod_soc, item.mat_pers).subscribe(
      (data: any) => {
        this.dataRows = data;
        this.filteredDataRows = [...this.dataRows];
        console.log("filteredDataRows:", this.dataRows);
        const enfantsFormGroups = data.map((child: any) =>
          this.createEnfantFormGroup(child)
        );
        this.formEnfant.setControl('enfants', this.fb.array(enfantsFormGroups));



      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );
    this.adherentServ.getCarteSoin(item.cod_soc, item.mat_pers).subscribe(
      (data: any) => {
        this.CarteSoinList = data;
        this.filteredDataCarteSoint = data
        const carteFormGroups = data.map((child: any) =>
          this.createCarteFormGroup(child)
        );
        this.formCarteSoin.setControl('carteSoin', this.fb.array(carteFormGroups));

        console.log("this.CarteSoinList", this.CarteSoinList);
        // Set the lovList for the column in tableConfig
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );
    this.adherentServ.getPere(item.cod_soc, item.mat_pers).subscribe(
      (data: any) => {
        this.formPere.patchValue({
          cod_soc: data.cod_soc || '',
          mat_pers: data.mat_pers || '',
          num_fam: data.num_fam || '',
          parente: data.parente || '',
          nom_pren: data.nom_pren || '',
          dat_naiss: data.dat_naiss || '',
          sexe: data.sexe || '',
          cod_sit: data.cod_sit || '',
          handicap: data.handicap || '',
          cod_activite: data.cod_activite || '',
          dat_dece: data.dat_dece || '',
          pec: data.pec || '',
          dat_pec: data.dat_pec || '',
          dat_mar: data.dat_mar || '',
          nom_jf: data.nom_jf || '',
          num_ass_conj: data.num_ass_conj || '',
          mat_pers_conj: data.mat_pers_conj || '',
          pec_mut: data.pec_mut || '',
          dat_pec_mut: data.dat_pec_mut || '',
        });
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );
    this.adherentServ.getMere(item.cod_soc, item.mat_pers).subscribe(
      (data: any) => {
        this.formMere.patchValue({
          cod_soc: data.cod_soc || '',
          mat_pers: data.mat_pers || '',
          num_fam: data.num_fam || '',
          parente: data.parente || '',
          nom_pren: data.nom_pren || '',
          dat_naiss: data.dat_naiss || '',
          sexe: data.sexe || '',
          cod_sit: data.cod_sit || '',
          handicap: data.handicap || '',
          cod_activite: data.cod_activite || '',
          dat_dece: data.dat_dece || '',
          pec: data.pec || '',
          dat_pec: data.dat_pec || '',
          dat_mar: data.dat_mar || '',
          nom_jf: data.nom_jf || '',
          num_ass_conj: data.num_ass_conj || '',
          mat_pers_conj: data.mat_pers_conj || '',
          pec_mut: data.pec_mut || '',
          dat_pec_mut: data.dat_pec_mut || '',
        });
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );
    this.adherentServ.getConjoint(item.cod_soc, item.mat_pers).subscribe(
      (data: any) => {
        this.formConjoint.patchValue({
          cod_soc: data.cod_soc || '',
          mat_pers: data.mat_pers || '',
          num_fam: data.num_fam || '',
          parente: data.parente || '',
          nom_pren: data.nom_pren || '',
          dat_naiss: data.dat_naiss || '',
          sexe: data.sexe || '',
          cod_sit: data.cod_sit || '',
          handicap: data.handicap || '',
          cod_activite: data.cod_activite || '',
          dat_dece: data.dat_dece || '',
          pec: data.pec || '',
          dat_pec: data.dat_pec || '',
          dat_mar: data.dat_mar || '',
          nom_jf: data.nom_jf || '',
          num_ass_conj: data.num_ass_conj || '',
          mat_pers_conj: data.mat_pers_conj || '',
          pec_mut: data.pec_mut || '',
          dat_pec_mut: data.dat_pec_mut || '',
        });
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );
    this.adherentServ
      .getAdresse(item.cod_soc, item.mat_pers)
      .subscribe((data) => {
        this.listAdresse = Array.isArray(data) ? data : [];
        const a = this.listAdresse[0];
        if (a) {
          this.formAdrPers.patchValue({
            cod_gouv: a.codGouv,
            cod_poste: a.codPoste,
            cod_soc: a.codSoc,
            mat_pers: a.matPers,
            num_adr: a.numAdr,
            rue: a.rue,
            tel_pers: a.telPers,
            fax_pers: a.faxPers,
            adr_courant: a.adrCourant,
            rue_a: a.rueA,
          });
        }
      });

    // this.adherentServ.getFamille(this.tokenStorage.getUser().codSoc, item.mat_pers).subscribe(
    //   (data: any) => {
    //     console.log("titou :",data)
    //     //  this.listActivite = data;
    //     //this.listFamille = data;

    //     // Set the lovList for the column in tableConfig
    //     const codeColumn = this.CarteSoinTable.columns.find(
    //       (column) => column.field === "num_fam"
    //     );
    //     if (codeColumn) {
    //       codeColumn.lovList = data; 
    //     }
    //   },
    //   (error) => {
    //     console.error("Error fetching data:", error);
    //   }
    // );
    this.getFamille()

    this.adherentServ.getPhoto(item.cod_soc, item.mat_pers).subscribe(
      (response: any) => {
        console.log("photo:", response);
        if (response && response.photo) {
          // Décoder les données Base64
          const byteCharacters = atob(response.photo);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);

          // Créer un fichier à partir des données décodées
          const file = new File([byteArray], response.file_name, { type: response.file_type });

          // Stocker le fichier et son ID
          this.files = file; // Tableau contenant un seul fichier
          this.idAttachment = response.id_photo_pers; // Tableau contenant un seul ID
          this.imageURL = `data:${response.content_type};base64,${response.photo}`;
          (document.getElementById("product-img") as HTMLImageElement).src = this.imageURL;

          console.log("fileName", this.files);
          console.log("idAttachment", this.idAttachment);
        } else {
          console.log("Aucun fichier disponible dans la réponse.");
        }
      },
      (error) => {
        console.log(error);
      }
    );

    // Enable save button after loading personnel data
    this.saveService.setDisabled(false);
  }
  createEnfantFormGroup(data: any): FormGroup {
    return this.fb.group({
      cod_soc: [data?.cod_soc || ''],
      mat_pers: [data?.mat_pers || ''],
      num_fam: [data?.num_fam || '', Validators.required],
      parente: ["E"],
      nom_pren: [data?.nom_pren || '', Validators.required],
      dat_naiss: [data?.dat_naiss || '', Validators.required],
      sexe: [data?.sexe || '', Validators.required],
      cod_sit: [data?.cod_sit],
      handicap: [data?.handicap || 'N'],
      pec: [data?.pec || 'N'],
      dat_pec: [data?.dat_pec || ''],
      cod_activite: [data?.cod_activite || ''],
      dat_dece: [data?.dat_dece || ''],
      dat_mar: [data?.dat_mar || ''],
      nom_jf: [data?.nom_jf || ''],
      num_ass_conj: [data?.num_ass_conj || ''],
      mat_pers_conj: [data?.mat_pers_conj || ''],
      pec_mut: [data?.pec_mut || ''],
      dat_pec_mut: [data?.dat_pec_mut || ''],



    });
  }
  createCarteFormGroup(data: any): FormGroup {
    return this.fb.group({


      num_fam: [data?.num_fam || ''],
      mat_pers: [data?.mat_pers || ''],
      cod_soc: [data?.cod_soc || ''],
      nat_cart: [data?.nat_cart || ''],
      num_cart: [data?.num_cart || ''],
      dat_cart: [data?.dat_cart || ''],
      perdu: [data?.perdu || ''],
      etat_cart: [data?.etat_cart || ''],
      obs_cart: [data?.obs_cart || ''],

    });
  }

  editAdresse(id: any, data: any, content: any) {
    console.log(data)
    this.edit = false;
    this.formAdrPers.patchValue({
      cod_gouv: data.codGouv,
      cod_poste: data.codPoste,
      cod_soc: data.codSoc,
      mat_pers: data.matPers,
      num_adr: data.numAdr,
      rue: data.rue,
      tel_pers: data.telPers,
      fax_pers: data.faxPers,
      adr_courant: data.adrCourant,
      rue_a: data.rueA,
    })
    this.codGouv = data[0].codGouv
    this.adherentServ.getPoste(data.codGouv).subscribe((data: any) => {
      this.codPost = data[0].codPoste
    })


    this.modalService.open(content, { size: 'xl' });
  }
  openEditModal(content: any, index: number) {

    this.editIndex = index;
    const enfantData = this.filteredDataRows[index];
    console.log("index :", index)
    console.log("enfantData :", this.filteredDataRows)
    this.edit = false;
    // Populate the modal form with the selected child's data
    this.formEnfant.setControl(
      'enfants',
      this.fb.array([this.createEnfantFormGroup(enfantData)])
    );
    this.codActiviteVal = enfantData.cod_activite
    // Open the modal
    this.modalService.open(content, { size: 'lg' });
  }
  openEditCarteModal(content: any, index: number) {
    this.editCarteIndex = index;
    const CarteData = this.filteredDataCarteSoint[index];
    console.log("enfantData :", CarteData)
    this.edit = false;
    // Populate the modal form with the selected child's data
    this.formCarteSoin.setControl(
      'carteSoin',
      this.fb.array([this.createCarteFormGroup(CarteData)])
    );
    this.numFam = CarteData.num_fam
    console.log("enfantData :", this.numFam)
    // Open the modal
    this.modalService.open(content, { size: 'lg' });
  }
  fileChange(event: any) {
    let fileList: any = event.target as HTMLInputElement;
    this.file = fileList.files[0];
    document.getElementById("");

    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
      (document.getElementById("product-img") as HTMLImageElement).src =
        this.imageURL;
    };
    reader.readAsDataURL(this.file);
    console.log("file", this.file);
  }

  changePage() {
    this.filteredDataRows = this.service.changePage(this.filteredDataRows);
  }
  changePageCarte() {
    this.filteredDataCarteSoint = this.service.changePage(this.filteredDataCarteSoint);
  }


  openModalTab(content: any) {
    this.editCarteIndex = null
    this.submitted = false;
    this.edit = true,
      this.formCarteSoin.reset()
    this.modalService.open(content, { size: "xl", centered: true });


    const newEnfantGroup = this.createCarteFormGroup({
      cod_soc: '',
      mat_pers: '',
      num_fam: '',
      nat_cart: '',
      num_cart: '',
      dat_cart: '',
      etat_cart: '',
      obs_cart: '',
      perdu: '',

    });
    this.numFam = ''
    this.formCarteSoin.setControl('carteSoin', this.fb.array([newEnfantGroup]));
  }
  openAddModal(content: any) {
    this.editIndex = null;
    this.edit = true,
      this.formEnfant.reset()

    const newEnfantGroup = this.createEnfantFormGroup({
      cod_soc: '',
      mat_pers: '',
      num_fam: '',
      parente: '',
      nom_pren: '',
      dat_naiss: '',
      sexe: '',
      cod_sit: '',
      handicap: '',
      cod_activite: '',
      dat_dece: '',
      pec: '',
      dat_pec: '',
      dat_mar: '',
      nom_jf: '',
      num_ass_conj: '',
      mat_pers_conj: '',
      pec_mut: '',
      dat_pec_mut: '',
    });
    this.codActiviteVal = ''
    this.formEnfant.setControl('enfants', this.fb.array([newEnfantGroup]));

    // Open the modal
    this.modalService.open(content, { size: 'lg' });
  }
  /**
   * Form data get
   */
  get form() {
    return this.formEnfant.controls;
  }


  deleteId: any;
  confirm(content: any, id: any) {
    console.log("annee:", id)
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }

  // Delete Data
  deleteData(id: any) {
    // if (id) {
    //   this.store.dispatch(deleteCompany({ id: this.deleteId.toString() }));
    // } else {
    //   this.store.dispatch(deleteCompany({ id: this.checkedValGet.toString() }));
    // }
    // this.deleteId = '';
    this.masterSelected = false;
  }

  /**
   * Multiple Delete
   */
  checkedValGet: any[] = [];
  deleteMultiple(content: any) {
    var checkboxes: any = document.getElementsByName("checkAll");
    var result;
    var checkedVal: any[] = [];
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        result = checkboxes[i].value;
        checkedVal.push(result);
      }
    }
    if (checkedVal.length > 0) {
      this.modalService.open(content, { centered: true });
    } else {
      Swal.fire({
        text: "Please select at least one checkbox",
        confirmButtonColor: "#239eba",
      });
    }
    this.checkedValGet = checkedVal;
  }








  editCarteSoin(id: any, data: any, content: any) {
    console.log("id :", id)
    console.log("data :", data)


    this.submitted = false;
    this.edit = false
    this.modalService.open(content, { size: "lg", centered: true });


    (this.formEnfant.get('carteSoin') as FormArray).controls[0].get("cod_soc")?.patchValue(data.cod_soc),
      (this.formEnfant.get('carteSoin') as FormArray).controls[0].get("mat_pers")?.patchValue(data.mat_pers),
      (this.formEnfant.get('carteSoin') as FormArray).controls[0].get("num_fam")?.patchValue(data.num_fam),
      (this.formEnfant.get('carteSoin') as FormArray).controls[0].get("nat_cart")?.patchValue(data.nat_cart),
      (this.formEnfant.get('carteSoin') as FormArray).controls[0].get("num_cart")?.patchValue(data.num_cart),
      (this.formEnfant.get('carteSoin') as FormArray).controls[0].get("dat_cart")?.patchValue(data.dat_cart),
      (this.formEnfant.get('carteSoin') as FormArray).controls[0].get("etat_cart")?.patchValue(data.etat_cart),
      (this.formEnfant.get('carteSoin') as FormArray).controls[0].get("obs_cart")?.patchValue(data.obs_cart),
      (this.formEnfant.get('carteSoin') as FormArray).controls[0].get("perdu")?.patchValue(data.perdu)




  }
  sortField: any;
  sortBy: any;
  SortFilter() {
    this.sortField = (
      document.getElementById("choices-single-default") as HTMLInputElement
    ).value;
    if (this.sortField[0] == "D") {
      this.sortBy = "asc";
      this.sortField = this.sortField.replace(/D/g, "");
    }
  }

  onSort(column: any) {
    console.log("this.dataRows :", this.dataRows)
    this.filteredDataCarteSoint = this.service.onSort(column, this.filteredDataCarteSoint);
  }

  get enfants(): FormArray {
    return this.formEnfant.get("enfants") as FormArray;
  }
  // get adresse(): FormArray {
  //   return this.formAdrPers.get("adresse") as FormArray;
  // }
  get carteSoin(): FormArray {
    return this.formCarteSoin.get("carteSoin") as FormArray;
  }
  // addAdresse() {
  //   this.adresse.push(
  //     this.fb.group({
  //       cod_gouv: [],
  //       cod_poste: [],
  //       cod_soc: [],
  //       mat_pers: [],
  //       num_adr: [],
  //       rue: [],
  //       tel_pers: [],
  //       fax_pers: [],
  //       adr_courant: [],
  //       rue_a: [],
  //     })
  //   )
  // }
  addCarteSoin() {
    this.carteSoin.push(
      this.fb.group({
        num_fam: ['', Validators.required],
        mat_pers: [],
        cod_soc: [],
        nat_cart: [],
        num_cart: [],
        dat_cart: [],
        perdu: [],
        etat_cart: [],
        obs_cart: [],
      })
    )
  }
  addEnfant() {
    this.enfants.push(
      this.fb.group({
        cod_soc: [""],
        mat_pers: [""],
        num_fam: ["", Validators.required],
        parente: ["E"],
        nom_pren: ["", Validators.required],
        dat_naiss: ["", Validators.required],
        sexe: ["", Validators.required],
        cod_sit: [""],
        handicap: [""],
        cod_activite: [""],
        dat_dece: [""],
        pec: [""],
        dat_pec: [""],
        dat_mar: [""],
        nom_jf: [""],
        num_ass_conj: [""],
        mat_pers_conj: [""],
        pec_mut: [""],
        dat_pec_mut: [""],
      })
    );
  }

  removeEnfant(index: number) {
    this.enfants.removeAt(index);
  }

  validateAdresse(): void {

    this.formAdrPers.get('mat_pers')?.patchValue(this.formAdherent.get('mat_pers')?.value);
    this.formAdrPers.get('cod_soc')?.patchValue(this.tokenStorage.getUser().codSoc);

    // Push the form value as an object into the array
    this.listAdresse.push(this.formAdrPers.value);

    console.log('listAdresse:', this.listAdresse);
  }

  validateEnfants(): void {
    // Function to format dates for a given FormGroup
    const formatDates = (form: FormGroup, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value);
        form.get(field)?.setValue(value);
        if (value) {
          formatted.push(value);
        }
        return formatted;
      }, []);

    // Get the FormArray 'enfants'
    const enfantsArray = this.formEnfant.get('enfants') as FormArray;

    if (enfantsArray && enfantsArray.valid) {
      // Loop through each FormGroup in the FormArray
      enfantsArray.controls.forEach((formGroup: AbstractControl, index: number) => {
        if (formGroup instanceof FormGroup) {
          // Format the dates
          formatDates(formGroup, [
            'dat_naiss',
            'dat_pec',
            'dat_dece',
            'dat_pec_mut',
          ]);

          // Patch additional fields
          formGroup
            .get('mat_pers')
            ?.patchValue(this.formAdherent.get('mat_pers')?.value);
          formGroup
            .get('cod_soc')
            ?.patchValue(this.tokenStorage.getUser().codSoc);

          // Update the corresponding row in filteredDataRows
          if (this.editIndex !== null) {
            // Replace only the row being edited
            this.filteredDataRows[this.editIndex] = formGroup.value;
          }
        }
      });

      // If adding a new row, push the data to the table

      if (this.editIndex === null) {
        if (!this.filteredDataRows) {
          this.filteredDataRows = [];
        }
        this.filteredDataRows.push(...enfantsArray.value);
      }
      // Reset editIndex after saving
      this.editIndex = null;

      console.log('filteredDataRows:', this.filteredDataRows);
    }
  }

  validateCarteSoin(): void {

    console.log("this.formAdherent.get('mat_pers')?.value :", this.formAdherent.get('mat_pers')?.value)
    // Fonction pour formater les dates d'un FormGroup donné
    const formatDates = (form: FormGroup, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value); // Appel de votre méthode pour formater la date
        form.get(field)?.setValue(value); // Met à jour la valeur formatée dans le champ
        if (value) {
          formatted.push(value); // Ajoute la valeur formatée au tableau

        }
        return formatted;
      }, []);

    // Récupère le FormArray 'enfants'
    const carteArray = this.formCarteSoin.get('carteSoin') as FormArray;

    if (carteArray && carteArray.valid) {
      // Parcourt chaque FormGroup dans le FormArray
      carteArray.controls.forEach((formGroup: AbstractControl) => {
        if (formGroup instanceof FormGroup) {
          formatDates(formGroup, [
            "dat_cart",

          ]);
          formGroup.get('mat_pers')?.patchValue(this.formAdherent.get('mat_pers')?.value)
          formGroup.get('cod_soc')?.patchValue(this.tokenStorage.getUser().codSoc)

        }
        if (this.editCarteIndex !== null) {
          this.filteredDataCarteSoint[this.editCarteIndex] = formGroup.value;
        }
      });


      if (this.editCarteIndex === null) {
        if (!this.filteredDataCarteSoint) {
          this.filteredDataCarteSoint = [];
        }
        this.filteredDataCarteSoint.push(...carteArray.value);
      }
      // Reset editIndex after saving
      this.editCarteIndex = null;
      console.log("this.formCarteSoin :", this.filteredDataCarteSoint);
    }
  }

  searchz: any = {
    num_fam: '',
    nom_pren: '',
    dat_naiss: '',
    sexe: '',
    handicap: '',
    cod_activite: '',
    // lib_activite: '',
    Pec: '',
    dat_pec: '',
    dat_dece: '',
  };
  searchCarteSoin: any = {
    num_fam: '',
    nom_pren: '',
    nat_cart: '',
    num_cart: '',
    dat_cart: '',
    etat_cart: '',
    perdu: '',
    obs_cart: ''
  };
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
  applyFilterCarteSpin() {
    console.log('this.filteredDataRows :', this.filteredDataCarteSoint)
    this.filteredDataCarteSoint = this.CarteSoinList.filter((row) => {
      return Object.keys(this.searchCarteSoin).every((key) => {
        const searchValue = this.searchCarteSoin[key]?.toString().toLowerCase();
        const rowValue = row[key]?.toString().toLowerCase();
        return !searchValue || rowValue.includes(searchValue);
      });
    });
  }


  showFilters: { [key: string]: boolean } = {};

  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }

  onSortFamille(column: any) {
    this.filteredDataRows = this.service.onSort(column, this.filteredDataRows);
  }

  onSortCarte(column: any) {
    this.filteredDataCarteSoint = this.service.onSort(column, this.filteredDataCarteSoint);
  }
}
