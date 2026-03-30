import { Component } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { CotisationService } from '../cotisation.service';
import { SharedModule } from "../../../shared/shared.module";
import { TokenStorage } from 'src/app/account/token-storage.service';
import { concatMap, forkJoin, from } from 'rxjs';

@Component({
  selector: 'app-val-cot-actif-auto',
  templateUrl: './val-cot-actif-auto.component.html',
  styleUrl: './val-cot-actif-auto.component.scss'
})
export class ValCotActifAutoComponent {

  imageURL: string | undefined;
  isReadOnly: boolean = true;  // Set to 'true' to visually make it readonly

  dataRows!: any[];
  listDataFiltred!: any[];
  pSusp: any;

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
  total: number = 0;

  isSearch: boolean = true;
  columnTitles: { [key: string]: string } = {
    pret_disk: "Pret Disk",
    num_retr: "Num Retr",
    mat_pers: "Matricule",
    nom_pers: "Nom et Prénom",
    montant: "Montant",
    observation: "Observation",
    valid: "Valid",
  };
  errorMessageMat!: any;
  rows: any;
  searchResults: any;
  allcompany: any;
  searchTerm: any;
  company?: any[] | undefined;
  resultsLigCotis: any;
  errorMessage!: string;
  snackBar: any;
  checkedValGet: any[] = [];
  isRemoveActionsVisible: boolean = false;
  corpsList: any[] = []; // To store the list of corps
  selectedCorps: string = '';
  etat_cot: any;
  mod_pay: any;
  uPdateEtacVir: any
  ListuPdateEtacVir: any[] = []; // Initialize the array
  showFilters: { [key: string]: boolean } = {};

  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
    if (!this.showFilters[column]) {
      this.searchz[column] = '';
      this.applyFilter();
    }
  }

  constructor(public paginationService: PaginationService, private tokenStorage: TokenStorage, private adherentServ: AdherentService, private cotisServ: CotisationService, private fb: FormBuilder, private saveService: SaveService, private modalService: NgbModal) {
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


    this.formCotisMutPersFormIns = this.fb.group({



    });


  }
  ngOnInit() {


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






    ///////////////////////////save
    //this.saveService.registerSaveCallback(() => this.saveUpdates());




    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Subscribe to resetObservable to reset the form
    this.saveService.add$.subscribe((reset) => {
      if (reset) {
        this.formCotisMutPersForm.reset();
        this.formCotisMutPersForm.enable()
        this.dataRows = []
        this.listDataFiltred = []
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
  ngOnDestroy() {
    // Clear the callback to avoid memory leaks
    this.saveService.clearSaveCallback();
    //this.saveService.setCanSave(false)
  }

  getPersonnels() {
    this.cotisServ.PersCotisActif('01').subscribe((data) => {
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
    this.formCotisMutPersForm.patchValue({


    })
  }

  onSelectedValue(item: any) {
    this.formAdherent.patchValue({
      mat_pers: item.mat_pers,
      num_retr: item.num_retr,
      nom_pers: item.nom_pers,
      pren_pers: item.pren_pers
    });
  }


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

  onSubmit(data: any[]): void {
    this.cotisServ.updateEtatAndModPay(data).subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Succès!',
          text: 'Tous les changements ont été effectués avec succès.',
          confirmButtonText: 'OK',
        });
        this.ListuPdateEtacVir = []; // Clear the list after successful update
        this.saveService.setDisabled(true); // Disable save button
        this.saveService.clearSaveCallback()

      },
      (error) => {
        console.error("Error updating:", error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur!',
          text: 'Certaines mises à jour ont échoué. Vérifiez les logs.',
          confirmButtonText: 'OK',
        });
        this.saveService.setDisabled(false); // Keep save button enabled for retry
      }
    );
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


  searchz: any = {
    mat_pers: '',
    num_retr: '',
    nom_pers: '',
    dat_deb: '',
    mnt_payer: '',
    mod_pay: '',
    etat_cot: ''
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
  onSort(column: any) {
    console.log("this.dataRows :", this.dataRows)
    this.filteredDataCarteSoint = this.paginationService.onSort(column, this.filteredDataCarteSoint);
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
        this.listDataFiltred = data;
        this.dataRows = data;
        console.log("range date", data)
        this.filteredDataRows = [...this.dataRows]; // Initialize filtered data
        this.applyFilter();
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      }
    });
  }
  onCheckboxChange(e: any) {
    const checkedVal: any[] = [];

    if (this.company) {
      for (let i = 0; i < this.dataRows.length; i++) {
        if (this.company[i]?.state === true) {
          checkedVal.push(this.company[i]);
        }
      }
    }

    this.checkedValGet = checkedVal;
    this.isRemoveActionsVisible = checkedVal.length > 0;
  }
  deleteId: any;

  confirm(content: any, id: any) {
    console.log("annee:", id)
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }

  onCorpsChange(event: any): void {

    this.selectedCorps = event.target.value;
    const selectedValue = (event.target as HTMLSelectElement).value;
    console.log('Selected corps value:', this.selectedCorps);

    const datDebControl = this.transformDate(this.formCotisMutPersForm.get("dat_deb")?.value);
    const datDeb = datDebControl ? `01/${datDebControl}` : '';

    const data = {
      cod_soc: '01',
      corps: selectedValue,
      dat_deb: datDeb
    }
    console.log("data", data)

    this.cotisServ.getDiskPret(selectedValue, datDebControl).subscribe({
      next: (dataC) => {
        this.dataRows = dataC;
        this.listDataFiltred = dataC
        console.log("range date", dataC)
        this.filteredDataRows = [...this.dataRows]; // Initialize filtered data
        this.applyFilter();
        this.total = this.calculateTotalMntAccDem();

      },
      error: (error) => {
        console.error('Error fetching data:', error);
      }
    });
  }

  ChargActInxx() {
    const datDebControl = this.transformDate(this.formCotisMutPersForm.get("dat_deb")?.value);
    const datDeb = datDebControl ? `01/${datDebControl}` : '';
    const data = {
      soc: '01',
      mois: datDeb,
      mat: this.formCotisMutPersForm.get("mat_pers")?.value

    }
    this.cotisServ.updateCotisation(this.filteredDataRows).subscribe({
      next: (item) => {
        console.log('prepared ', item)

      }
    })

  }
  ChargActInx() {
    const datDebControl = this.transformDate(this.formCotisMutPersForm.get("dat_deb")?.value);

    Swal.fire({
      title: 'Chargement en cours...',
      text: 'La procédure est en cours de traitement',
      showConfirmButton: false,
      didOpen: () => Swal.showLoading()
    });

    const data = {
      p_mat_pers: null,
      p_corps: this.selectedCorps || null,
      p_mois: datDebControl,
      p_cod_soc: this.tokenStorage.getUser().codSoc
    };
    console.log("📅 p_mois envoyé =", datDebControl);

    this.cotisServ.updateCotisation(data).subscribe({
      next: (res: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Succès!',
          text: `Procédure exécutée. Lignes mises à jour: ${res.rowsUpdated}`,
          confirmButtonText: 'OK'
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Échec!',
          text: err?.error?.message || 'Erreur lors de l’exécution de la procédure',
          confirmButtonText: 'OK'
        });
      }
    });
  }


  saveVir(data: any): void {
    console.log('Saving Payment Mode:', data.mod_pay, 'for ID:', data._id);
    /*  // Call your service to save the updated payment mode
     this.cotisServ.savePaymentMode(data).subscribe({
       next: (response) => {
         console.log('Payment mode saved successfully:', response);
       },
       error: (err) => {
         console.error('Failed to save payment mode:', err);
       }
     }); */
  }
  saveEtat(data: any): void {
    console.log('Saving Payment State:', data.etat_cot, 'for ID:', data._id);
    /* // Call your service to save the updated payment state
    this.cotisServ.savePaymentState(data).subscribe({
      next: (response) => {
        console.log('Payment state saved successfully:', response);
      },
      error: (err) => {
        console.error('Failed to save payment state:', err);
      }
    }); */
  }
  dataB: any;
  saveB!: boolean;

  getValueVirEtatt(data: any): void {
    // Create the cotisation object
    const cotisation: any = {
      cod_soc: data.cod_soc,
      mat_pers: data.mat_pers,
      num_cot: data.num_cot,
      typ_cot: data.typ_cot,
      dat_deb: data.dat_deb,
      dat_fin: data.dat_fin,
      mnt_payer: data.mnt_payer,
      mod_pay: data.mod_pay,
      ref_pay: data.ref_pay,
      dat_saisie: data.dat_saisie,
      etat_cot: data.etat_cot,
      corps: data.corps,
      cod_typ_depart: data.cod_typ_depart,
      cod_affect: data.cod_affect,
      mnt_param: data.mnt_param,
      num_retr: data.num_retr,
      seq_ecrt1: data.seq_ecrt1,
      seq_ecrt2: data.seq_ecrt2,
      imput: data.imput
    };

    // Check if the cotisation already exists in the ListuPdateEtacVir array
    const existingIndex = this.ListuPdateEtacVir.findIndex(
      (item: any) =>
        item.cod_soc === cotisation.cod_soc &&
        item.mat_pers === cotisation.mat_pers &&
        item.num_cot === cotisation.num_cot
    );

    if (existingIndex !== -1) {
      // Update the existing entry
      this.ListuPdateEtacVir[existingIndex] = cotisation;
    } else {
      // Add the new entry
      this.ListuPdateEtacVir.push(cotisation);
    }

    // Prepare the data object for the service call
    const filterData = {
      cod_soc: '01',
      corps: data.corps,
      dat_deb: data.dat_deb
    };

    // Log the received data
    console.log("Received Data:", data);

    // Fetch the filtered list of active cotisations
    this.cotisServ.getPersCotisActifCorps(filterData).subscribe({
      next: (filteredData) => {
        this.listDataFiltred = filteredData;

        console.log('Filtered Data:', this.listDataFiltred);

        // Check and update the save button state
        for (const item of this.listDataFiltred) {
          if (
            item?.cod_soc === data.cod_soc &&
            item?.mat_pers === data.mat_pers &&
            item?.num_cot === data.num_cot
          ) {
            if (item?.etat_cot !== data.etat_cot || item?.mod_pay !== data.mod_pay) {
              this.isDisabled = true;
              this.saveService.setDisabled(this.isDisabled);
            } else {
              this.isDisabled = false;
              this.saveService.setDisabled(this.isDisabled);
            }
          }
        }
      },
      error: (err) => {
        console.error("Error fetching filtered data:", err);
      }
    });

    // Enable the save button and update the data state
    this.saveB = true;
    this.saveService.setDisabled(false);

    // Update component state with the current data
    this.etat_cot = data.etat_cot;
    this.mod_pay = data.mod_pay;
    this.dataB = { ...data, etat_cot: this.etat_cot, mod_pay: this.mod_pay };

    // Log state updates
    console.log('Saving State:', {
      etat_cot: this.dataB.etat_cot,
      mod_pay: this.dataB.mod_pay,
      num_cot: this.dataB.num_cot
    });
  }


  // Array to hold the updated rows
  updatedRows: CotisMutPers[] = [];

  // Function that gets triggered when a change happens
  getValueVirEtat(data: CotisMutPers) {
    // Check if the data is already in the updatedRows array
    const index = this.updatedRows.findIndex(
      (item) => item.mat_pers === data.mat_pers && item.num_cot === data.num_cot
    );

    this.isDisabled = true;
    this.saveService.setDisabled(this.isDisabled);

    // Destructure the object to exclude `nom_pers`
    const { nom_pers, ...dataWithoutNomPers } = data;

    if (index === -1) {
      // Add the updated data without `nom_pers` if it's not already tracked
      this.updatedRows.push({ ...dataWithoutNomPers });
    } else {
      // If it's already in the updatedRows, update it without `nom_pers`
      this.updatedRows[index] = { ...dataWithoutNomPers };
    }
  }


  // Function to show the SweetAlert confirmation before saving
  // Function to show the SweetAlert confirmation before saving
  saveUpdates() {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Voulez-vous enregistrer les modifications ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, enregistrez-le !',
      cancelButtonText: 'Non, annulez !',
      reverseButtons: true
    }).then((result) => {
      console.log("list vw", this.updatedRows)
      if (result.isConfirmed) {
        // Send all updated rows as an array
        this.cotisServ.saveUpdatedRows(this.updatedRows).subscribe(
          (response) => {
            if (response == "1")
              Swal.fire(
                'Enregistré !',
                'Vos modifications ont été enregistrées.',
                'success'
              );
            this.updatedRows = []; // Clear the updated rows after saving
          },
          (error) => {
            Swal.fire(
              'Erreur !',
              'Un problème est survenu lors de l\'enregistrement de vos modifications.',
              'error'
            );
          }
        );
      } else {
        // If user cancels, show cancel message
        Swal.fire(
          'Annulé',
          'Vos modifications n\'ont pas été enregistrées.',
          'error'
        );
      }
    });
    this.isDisabled = false;
    this.saveService.setDisabled(this.isDisabled);
  }




  calculateTotalMntAccDem(): number {
    console.log("selectedRows:", this.filteredDataRows);

    if (!this.filteredDataRows || this.filteredDataRows.length === 0) {
      console.warn("selectedRows est vide ou non défini !");
      return 0;
    }

    const total = this.filteredDataRows.reduce((sum: any, row: any) => {
      const montant = row?.montant ?? 0; // Si `mnt_acc_don` est null, on prend 0
      console.log("Row montant:", montant);
      return sum + montant;
    }, 0);

    console.log("Total montant accumulé:", total);
    return total;
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
