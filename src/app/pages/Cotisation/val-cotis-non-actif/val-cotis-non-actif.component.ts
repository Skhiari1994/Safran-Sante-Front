
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { CotisationService } from '../cotisation.service';

@Component({
  selector: 'app-val-cotis-non-actif',
  templateUrl: './val-cotis-non-actif.component.html',
  styleUrl: './val-cotis-non-actif.component.scss'
})
export class ValCotisNonActifComponent implements OnInit {




  imageURL: string | undefined;
  isReadOnly: boolean = true;  // Set to 'true' to visually make it readonly

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
  codMatVal?: string;
  codActiviteVal?: string;

  ///list /////
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
  listMat: any[] = [];

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
  breadCrumbItems!: Array<{}>;

  ////////////////////////lib


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


  formCotisMutPersForm!: FormGroup;
  formCotisMutPersFormIns!: FormGroup;
  formAdherent!: FormGroup;
  save!: boolean;
  isDisabled!: boolean;
  masterSelected!: boolean;

  file!: File;

  isSearch: boolean = true;

  errorMessageMat!: any;
  rows: any;
  searchResults: any;
  allcompany: any;
  searchTerm: any;
  company?: any[];
  resultsLigCotis: any;
  errorMessage!: string;
  snackBar: any;
  cotisations: any[] = []; // List of cotisations from API
  loading = true;

  showNavigationArrows: any;
  showNavigationIndicators: any;

  etaBool!: boolean
  etatCot?: String;
  modPay?: String;
  numCot: number = 0;

  dat_deb?: any
  dat_fin?: any
  corpsList!: any[];
  constructor(private cdr: ChangeDetectorRef, public paginationService: PaginationService, private adherentServ: AdherentService, private cotisServ: CotisationService, private fb: FormBuilder, private saveService: SaveService, private modalService: NgbModal) {



    this.formCotisMutPersForm = this.fb.group({
      cod_soc: [''],
      mat_pers: [''],
      num_cot: [''],
      typ_cot: [''],
      dat_deb: [''],
      dat_fin: [''],
      mnt_a_payer: [''],
      mnt_payer: [''],
      mod_pay: [''],
      ref_pay: [''],
      dat_saisie: [''],
      etat_cot: [''],
      corps: [''],
      cod_typ_depart: [''],
      cod_affect: [''],
      mnt_param: [''],
      num_retr: [''],
      seq_ecrt1: [''],
      seq_ecrt2: [''],
      imput: ['']

    });

    //  this.formCotisMutPersForm.get('dat_deb')?.valueChanges.subscribe((value) => {
    //   if (value) {
    //     this.formCotisMutPersForm.patchValue({ dat_fin: value });
    //   }
    // }); 
    this.formCotisMutPersFormIns = this.fb.group({



    });
    this.modPay = 'V'
    this.etatCot = 'I'
    this.formCotisMutPersForm.get("mod_pay")?.setValue(this.modPay);
    this.formCotisMutPersForm.get("etat_cot")?.setValue(this.etatCot);

  }
  ngOnInit() {

    this.formCotisMutPersForm.get('dat_deb')?.valueChanges.subscribe((value) => {
      if (value && (value.length === 6 || value.length === 7)) {
        this.dat_deb = this.transformDate(value);
        console.log('Value of dat_deb changed:', this.dat_deb);
      }
    });

    this.formCotisMutPersForm.get('dat_fin')?.valueChanges.subscribe((value) => {
      if (value && (value.length === 6 || value.length === 7)) {
        this.dat_fin = this.transformDate(value);
        console.log('Value of dat_fin changed:', this.dat_fin);
      }
    });

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


    this.getAffectation();
    this.getTypeDepart();
    this.getPersonnels();


    this.saveService.canSave$.subscribe((canSave) => {
      this.save = canSave;
      if (this.save) {
        // this.submit();
        //   this.onSubmit()
      }
    });

    ///////////////////////////save
    //this.saveService.registerSaveCallback(() => this.onSubmit());
    this.saveService.registerSaveCallback(() => this.getValueVirEtat());


    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch = canSearch

      console.log("is search valid", canSearch)
    })
    this.formCotisMutPersForm.valueChanges.subscribe(() => {
      this.isDisabled = this.formCotisMutPersForm.pristine;
      this.saveService.setDisabled(!this.isDisabled);
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Subscribe to resetObservable to reset the form
    this.saveService.add$.subscribe((reset) => {
      if (reset) {
        this.formCotisMutPersForm.reset();
        this.formCotisMutPersForm.enable()
        this.dataRows = []
        this.filteredDataRows = []

        this.formAdherent.reset()
        this.formCotisMutPersForm.get("num_cot")
        this.formCotisMutPersForm.get("num_cot")?.setValue("");
        this.formCotisMutPersForm.get("typ_cot")?.setValue("M");
        this.formCotisMutPersForm.get("mnt_a_payer")?.setValue(0.000);
        this.formCotisMutPersForm.get("etat_cot")?.setValue("I");
        this.formCotisMutPersForm.get("mod_pay")?.setValue("V");

        this.formCotisMutPersForm.get("typ_cot")?.disable()
        this.formCotisMutPersForm.get("mnt_a_payer")?.disable()
        this.formCotisMutPersForm.get("etat_cot")?.disable()


        this.codAffectVal = ''
        this.codTypDepartVal = ''
        this.codPostVal = ''
        this.codMatVal = ''
        this.libTypDepart = ''
        this.libAffect = ''
        this.numCot = 0


      }
    });

    // this.fetchLigCotis(codSoc,matPers,datDeb,datFin)
    this.cotisServ.getCorps().subscribe(
      (response) => {
        this.corpsList = response;


      },
      (error) => {
        console.error('Error fetching corps list:', error);
      }
    );
  }


  /////////////////////////////////////////////////////////////////
  p: any
  onPageChangeFor(page: number): void {
    console.log("Pagination pour le tableau 1 : ", page);

    this.p = page;
    this.cdr.detectChanges();

  }
  searchz: any = {
    dat_cot: '',
    mnt_payer: ''
  };

  columnTitles: { [key: string]: string } = {

    dat_cot: 'Date',
    mnt_payer: ' Mnt payer'
  };

  showFilters: { [key: string]: boolean } = {};

  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
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



  changePage() {
    this.filteredDataRows = this.paginationService.changePage(this.filteredDataRows);
  }


  onSort(column: any) {
    console.log("this.dataRows :", this.dataRows)
    this.filteredDataCarteSoint = this.paginationService.onSort(column, this.filteredDataCarteSoint);
  }
  /////////////////////////////////////////////////////////



  ngOnDestroy() {
    // Clear the callback to avoid memory leaks
    this.saveService.clearSaveCallback();
    //this.saveService.setCanSave(false)
  }
  getPersonnels() {
    this.cotisServ.getPersCotis('01').subscribe((data) => {
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


  validators() {
    if (this.formCotisMutPersForm.get("mat_pers")?.value === "") {
      this.errorMessageMat = "Matricule obligatoire";
    }
  }

  openModal(targetModal: any, adr: any): void {
    this.modalService.open(targetModal, {
      windowClass: "my-class",
      centered: true,
    });
    this.formCotisMutPersForm.patchValue({
      codGouv: adr.codGouv,
      codPost: adr.codPoste,
      cod_soc: adr.cod_soc,
      mat_pers: adr.mat_pers,
      num_adr: adr.num_adr,
      rue: adr.rue,
      tel_pers: adr.tel_pers,
      fax_pers: adr.fax_pers,
      adr_courant: adr.adrCourant,
      rue_a: adr.rue_a,
    });
  }

  openModalAdd(targetModal: any): void {

    this.modalService.open(targetModal, {
      windowClass: "my-class",
      centered: true,
      size: "xl"
    });

    this.formCotisMutPersForm.reset();
    this.formCotisMutPersForm.patchValue({ cod_soc: "01" });
    console.log(this.formCotisMutPersForm.value);
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
  firstCotis: boolean = false
  search(item: any) {
    console.log("this.codeField")
    this.codTypDepartVal = item.cod_typ_depart;
    this.codAffectVal = item.cod_affect;
    this.codMatVal = item.mat_pers;
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
    //this.fetchCotisations(item.cod_soc,item.mat_pers,item.dat_deb,item.dat_fin) 
    this.cotisServ.getCotisationMat('01', item.mat_pers).subscribe((item1: any) => {
      console.log("this.codeField", item1)
      this.listCotis = item1
      this.firstCotis = true


      this.navigate(0)
      this.fetchLigCotis('01', item[0].mat_pers, item[0].dat_deb, item[0].dat_fin);





    })
  }

  onSelectedValue(item: any) {
    console.log("this.codeField", item)
    this.codTypDepartVal = item.cod_typ_depart;
    this.codAffectVal = item.cod_affect;
    this.codMatVal = item.mat_pers;
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

  }
  //////////////////////////////////////////// next,last,previous,first///////////////////////////////////////////////////
  currentIndex: number = 0;
  listCotis: any[] = [];
  listDetailCotis: any[] = [];

  goToFirst() {
    this.currentIndex = 0;
    console.log("this.currentIndex", this.currentIndex)
    this.loadData(this.currentIndex);

  }

  goToLast() {
    this.currentIndex = this.listCotis.length - 1;
    console.log("this.currentIndex", this.currentIndex)
    this.loadData(this.currentIndex);

  }
  navigate(direction: number): void {

    this.currentIndex += direction;
    this.loadData(this.currentIndex);
    console.log("this.currentIndex", this.currentIndex)

  }
  updateListCotis: [] = []
  loadData(index: number): void {

    const currentData = this.listCotis[index];

    // Extract original dates
    const datDeb = currentData.dat_deb;
    const datFin = currentData.dat_fin;


    // Format the dates to Month/Year
    const formattedDatDeb = this.formatDateToMonthYear(datDeb);
    const formattedDatFin = this.formatDateToMonthYear(datFin);

    // Patch the form with the formatted dates and the rest of the data
    this.formCotisMutPersForm.patchValue({
      ...currentData,
      dat_deb: formattedDatDeb,
      dat_fin: formattedDatFin
    });
    this.updateListCotis = currentData
    console.log("lig    !! :", this.updateListCotis)
    this.fetchLigCotis('01', currentData.mat_pers, currentData.dat_deb, currentData.dat_fin);

  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getAffectation() {
    this.adherentServ.getAffectation().subscribe((data) => {
      this.listAffectation = data;
      console.log("affectation", data)
      this.columnAffect = [
        { key: "cod_affect", label: "Code" },
        { key: "lib_affect", label: "Libelle" },
        { key: "lib_affect_a", label: "Libelle arabe" },
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
  convertDateFormatToMounth(dateString: string): string {
    // Ensure the input string is in the format dd/mm/yyyy
    const [day, month, year] = dateString.split('/');
    return `${month}/${year}`;
  }
  onSubmit(): void {





    // Retrieve and prepare the form values
    const matPers = this.formAdherent.get("mat_pers")?.value;
    const codSoc = this.formAdherent.get("cod_soc")?.value;
    const corps = this.formAdherent.get("corps")?.value;
    const codAffect = this.formAdherent.get("cod_affect")?.value;
    const numRetr = this.formAdherent.get("num_retr")?.value;
    const mntParam = this.formAdherent.get("mnt_param")?.value;
    const typDept = this.formAdherent.get("cod_typ_depart")?.value;

    const datSaisie = this.getCurrentDate();

    // Retrieve and format MM/YYYY dates
    const datDebControl = this.transformDate(this.formCotisMutPersForm.get("dat_deb")?.value);
    const datFinControl = this.transformDate(this.formCotisMutPersForm.get("dat_fin")?.value);

    // Convert MM/YYYY to 01/MM/YYYY
    const datDeb = datDebControl ? `01/${datDebControl}` : '';
    const datFin = datFinControl ? `01/${datFinControl}` : '';

    // Update form values
    this.formCotisMutPersForm.get("dat_deb")?.setValue(datDeb);
    this.formCotisMutPersForm.get("dat_fin")?.setValue(datFin);
    this.formCotisMutPersForm.get("mat_pers")?.setValue(matPers);
    this.formCotisMutPersForm.get("cod_soc")?.setValue(codSoc);
    this.formCotisMutPersForm.get("corps")?.setValue(corps);
    this.formCotisMutPersForm.get("cod_affect")?.setValue(codAffect);
    this.formCotisMutPersForm.get("num_retr")?.setValue(numRetr);
    this.formCotisMutPersForm.get("mnt_param")?.setValue(mntParam);
    this.formCotisMutPersForm.get("dat_saisie")?.setValue(datSaisie);
    this.formCotisMutPersForm.get("cod_typ_depart")?.setValue(typDept);
    this.formCotisMutPersForm.get("typ_cot")?.setValue("M");
    this.formCotisMutPersForm.get("etat_cot")?.setValue("I");



  }

  onSearch(): void {





    // Retrieve and prepare the form values
    const matPers = this.formAdherent.get("mat_pers")?.value;
    const codSoc = this.formAdherent.get("cod_soc")?.value;
    const corps = this.formAdherent.get("corps")?.value;
    const codAffect = this.formAdherent.get("cod_affect")?.value;
    const numRetr = this.formAdherent.get("num_retr")?.value;
    const mntParam = this.formAdherent.get("mnt_param")?.value;
    const typDept = this.formAdherent.get("cod_typ_depart")?.value;

    const datSaisie = this.getCurrentDate();

    // Retrieve and format MM/YYYY dates
    const datDebControl = this.transformDate(this.formCotisMutPersForm.get("dat_deb")?.value);
    const datFinControl = this.transformDate(this.formCotisMutPersForm.get("dat_fin")?.value);

    // Convert MM/YYYY to 01/MM/YYYY
    const datDeb = datDebControl ? `01/${datDebControl}` : '';
    const datFin = datFinControl ? `01/${datFinControl}` : '';

    // Update form values
    this.formCotisMutPersForm.get("dat_deb")?.setValue(datDeb);
    this.formCotisMutPersForm.get("dat_fin")?.setValue(datFin);
    this.formCotisMutPersForm.get("mat_pers")?.setValue(matPers);
    this.formCotisMutPersForm.get("cod_soc")?.setValue(codSoc);
    this.formCotisMutPersForm.get("corps")?.setValue(corps);
    this.formCotisMutPersForm.get("cod_affect")?.setValue(codAffect);
    this.formCotisMutPersForm.get("num_retr")?.setValue(numRetr);
    this.formCotisMutPersForm.get("mnt_param")?.setValue(mntParam);
    this.formCotisMutPersForm.get("dat_saisie")?.setValue(datSaisie);
    this.formCotisMutPersForm.get("cod_typ_depart")?.setValue(typDept);
    this.formCotisMutPersForm.get("typ_cot")?.setValue("M");
    this.formCotisMutPersForm.get("etat_cot")?.setValue("I");


    this.fetchCotisations(codSoc, matPers, datDeb, datFin)


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


  // The master checkbox will check/ uncheck all items
  checkUncheckAll(ev: any) {
    this.rows.forEach((row: any) => {
      row.isChecked = this.masterSelected;
    });
    //checkedVal.length > 0 ? (document.getElementById("remove-actions") as HTMLElement).style.display = "block" : (document.getElementById("remove-actions") as HTMLElement).style.display = "none";
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
  // Search Data
  performSearch(): void {
    this.searchResults = this.allcompany.filter((item: any) => {
      return item.name.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
    this.company = this.paginationService.changePage(this.searchResults);
  }

  fetchLigCotis(codSoc: string, matPers: string, datDeb: string, datFin: string): void {
    this.cotisServ.getLigCotisDatRage(codSoc, matPers, datDeb, datFin).subscribe({
      next: (data) => {
        this.dataRows = data;
        console.log("range date", data)
        this.filteredDataRows = [...this.dataRows]; // Initialize filtered data
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      }
    });
  }


  fetchCotisations(codSoc: any, matPers: any, datDeb?: any, datFin?: any) {
    // Example request body
    const request = {
      codSoc: codSoc,
      matPers: matPers,
      datDeb: datDeb,
      datFin: datFin,
    };
    console.log('NOT Fetched cotisations:', request); // Log the response3


    this.cotisServ.getCotisationData(request).subscribe({
      next: (data) => {
        if (data && data.length > 0 && data[0]) {
          console.log('Fetched cotisations:', data[0]); // Log the response
          this.cotisations = data[0]; // Store the fetched data
          this.loading = false;
          // Retrieve and format MM/YYYY dates
          const datDebControl = this.formatDateToMonthYear(data[0].dat_deb);
          const datFinControl = this.formatDateToMonthYear(data[0].dat_fin);

          // Convert MM/YYYY to 01/MM/YYYY
          const datDeb = datDebControl ? `${datDebControl}` : '';
          const datFin = datFinControl ? `${datFinControl}` : '';

          // Update form values
          this.formCotisMutPersForm.get("dat_deb")?.setValue(datDeb);
          this.formCotisMutPersForm.get("dat_fin")?.setValue(datFin);
          const formControls = this.formCotisMutPersForm.controls;

          // Set form values
          formControls["dat_deb"]?.setValue(datDeb || null);
          formControls["dat_fin"]?.setValue(datFin || null);
          formControls["num_cot"]?.setValue(data[0].num_cot || null);

          formControls["mnt_a_payer"]?.setValue(data[0].mnt_a_payer || null);
          formControls["mnt_payer"]?.setValue(data[0].mnt_payer || null);
          formControls["mod_pay"]?.setValue(data[0].mod_pay || null);
          formControls["ref_pay"]?.setValue(data[0].ref_pay || null);
          formControls["typ_cot"]?.setValue(data[0].typ_cot || null);
          formControls["etat_cot"]?.setValue(data[0].etat_cot || null);
          formControls["dat_saisie"]?.setValue(data[0].dat_saisie || null);

          // Set additional variables
          this.etaBool = true;
          this.numCot = formControls["num_cot"]?.value;

          // Fetch related cotisation data
          if (this.formCotisMutPersForm.valid) {
            this.fetchLigCotis(
              request.codSoc,
              request.matPers,
              data[0].dat_deb,
              data[0].dat_fin
            );

            console.log('Num cotisations:', this.numCot); // Log the response
          }
        } else {
          console.error('No cotisations found:', data); // Log error if data is empty
          this.loading = false;
          this.formCotisMutPersForm.controls["dat_deb"]?.setValue(this.dat_deb || null);
          this.formCotisMutPersForm.controls["dat_fin"]?.setValue(this.dat_fin || null);
          Swal.fire({
            icon: 'error',
            title: "Cotisation",
            text: "La cotisation n'existe pas.",
            confirmButtonText: 'OK'
          });

        }
      },
      error: (err) => {
        console.error('Error fetching cotisations:', err); // Log error
        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: "Erreur",
          text: "Une erreur s'est produite lors de la récupération des données.",
          confirmButtonText: 'OK'
        });
      }
    });

  }


  // Array to hold the updated rows
  updatedRows: CotisMutPers[] = [];

  // Function that gets triggered when a change happens
  getValueVirEtat() {

    const ModPayement = ''
    const EtatCot = ''


    // Retrieve and prepare the form values
    const matPers = this.formCotisMutPersForm.get("mat_pers")?.value;
    const codSoc = this.formCotisMutPersForm.get("cod_soc")?.value;
    const corps = this.formCotisMutPersForm.get("corps")?.value;
    const codAffect = this.formCotisMutPersForm.get("cod_affect")?.value;
    const numRetr = this.formCotisMutPersForm.get("num_retr")?.value;
    const mntParam = this.formCotisMutPersForm.get("mnt_param")?.value;
    const typDept = this.formCotisMutPersForm.get("cod_typ_depart")?.value;
    const datSaisie = this.formCotisMutPersForm.get("dat_saisie")?.value;
    const typCot = this.formCotisMutPersForm.get("typ_cot")?.value;

    const numCot = this.numCot;
    console.log("num cot", numCot)
    this.formCotisMutPersForm.get("num_cot")?.setValue(numCot);

    this.formCotisMutPersForm.get("mod_pay")?.setValue(this.modPay);
    this.formCotisMutPersForm.get("etat_cot")?.setValue(this.etatCot);
    // Retrieve and format MM/YYYY dates
    const datDebControl = this.transformDate(this.formCotisMutPersForm.get("dat_deb")?.value);
    const datFinControl = this.transformDate(this.formCotisMutPersForm.get("dat_fin")?.value);

    // Convert MM/YYYY to 01/MM/YYYY
    const datDeb = datDebControl ? `01/${datDebControl}` : '';
    const datFin = datFinControl ? `01/${datFinControl}` : '';

    // Update form values
    this.formCotisMutPersForm.get("dat_deb")?.setValue(datDeb);
    this.formCotisMutPersForm.get("dat_fin")?.setValue(datFin);
    this.formCotisMutPersForm.get("typ_cot")?.setValue("M");

    console.log("updatedRows", this.formCotisMutPersForm.value)


    // Check if the data is already in the updatedRows array
    console.log("d1", this.formCotisMutPersForm.value)
    this.updatedRows.push(this.formCotisMutPersForm.value)
    this.updatedRows[0].num_cot = this.numCot
    //const filteredRows = this.updatedRows.map(({ num_cot, ...rest }) => rest);  
    console.log("updatedRows", this.updatedRows)

    this.isDisabled = true;
    this.saveService.setDisabled(this.isDisabled);
    const updateListAsArray = Object.values(this.updateListCotis);
    this.saveUpdates(this.formCotisMutPersForm.value)
  }


  // Function to show the SweetAlert confirmation before saving
  // Function to show the SweetAlert confirmation before saving
  saveUpdates(filteredRows: any): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Voulez-vous enregistrer les modifications ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, enregistrez-les !',
      cancelButtonText: 'Non, annulez !',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Liste à enregistrer :", filteredRows);

        this.cotisServ.updateCotis(filteredRows).subscribe({
          next: (response) => {
            // If backend returns "1" to confirm success
            if (response) {
              Swal.fire(
                'Enregistré !',
                'Vos modifications ont été enregistrées.',
                'success'
              );
            }

            // Clear updated rows
            this.updatedRows = [];

            // Format and update dat_deb and dat_fin
            const datDebRaw = this.formCotisMutPersForm.get("dat_deb")?.value;
            const datFinRaw = this.formCotisMutPersForm.get("dat_fin")?.value;

            const datDebFormatted = datDebRaw ? this.formatDateToMonthYear(datDebRaw) : '';
            const datFinFormatted = datFinRaw ? this.formatDateToMonthYear(datFinRaw) : '';

            this.formCotisMutPersForm.get("dat_deb")?.setValue(datDebFormatted);
            this.formCotisMutPersForm.get("dat_fin")?.setValue(datFinFormatted);

            this.saveService.setDisabled(false);
            this.isDisabled = false;
          },
          error: (error) => {
            console.error("Erreur lors de la sauvegarde :", error);
            Swal.fire(
              'Erreur !',
              'Un problème est survenu lors de l\'enregistrement.',
              'error'
            );
          }
        });

      } else {
        Swal.fire(
          'Annulé',
          'Vos modifications n\'ont pas été enregistrées.',
          'info'
        );
      }
    });
  }

  getValueEtatCot(arg0: any) {
    console.log("etat cot", arg0)

    this.etatCot = arg0

  }
  getValueModPay(arg0: any) {
    this.modPay = arg0

  }
  SetDatFin(arg0: any) {
    this.dat_fin = arg0

    console.log("dat_deb nn", this.dat_fin)
  }
  SetDatDeb(event: any) {
    this.dat_deb = event

  }

}

// cotis-mut-pers.model.ts
export interface CotisMutPers {
  cod_soc: string;
  mat_pers: string;
  num_cot: number;
  typ_cot: string;
  dat_deb: string; // Use the correct type for dates
  dat_fin: string; // Use the correct type for dates
  mnt_a_payer: number;
  mnt_payer: number;
  mod_pay: string;
  ref_pay: string;
  dat_saisie: string; // Use the correct type for dates
  etat_cot: string;
  corps: string;
  nom_pers?: string;
  cod_typ_depart: string;
  cod_affect: string;
  mnt_param: number;
  num_retr: string;
  seq_ecrt1: number;
  seq_ecrt2: number;
  imput: string;
}