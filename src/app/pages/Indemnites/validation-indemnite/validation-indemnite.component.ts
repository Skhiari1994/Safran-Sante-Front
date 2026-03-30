import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { SharedModule } from "../../../shared/shared.module";
import { IndemnitesService } from '../indemnites.service';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-validation-indemnite',
  templateUrl: './validation-indemnite.component.html',
  styleUrl: './validation-indemnite.component.scss'
})


export class ValidationIndemniteComponent {
  @ViewChild('dt') table!: Table;
  imageURL: string | undefined;
  isReadOnly: boolean = true;  // Set to 'true' to visually make it readonly

  dataRows!: any[];
  listDataFiltred!: any[];
  selectedCodeLieu: string = '';

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

  columnsNat: any[] = [];
  columnsLieu: any[] = [];
  columnsMatInt: any[] = [];
  columnsSearch: any[] = [];
  listTypDon: any[] = [];
  selectedRows: any[] = [];
  currentEditingRow: any | null = null;


  breadCrumbItems!: Array<{}>;

  ////////////////////////lib
  libNat: string = "";
  libLieu: string = "";
  libAffect: string = "";
  libMatInt: string = "";
  libNom: string = "";
  libNatDon: string = "";


  formCotisMutPersForm!: FormGroup;
  formCotisMutPersFormIns!: FormGroup;
  formAdherent!: FormGroup;
  save!: boolean;
  isDisabled!: boolean;
  masterSelected!: boolean;

  file!: File;
  max_mnt_don!: Number;

  isSearch: boolean = true;
  rows: any;
  searchResults: any;
  allcompany: any;
  searchTerm: any;
  company!: any[];
  checkedValGet: any[] = [];
  isRemoveActionsVisible!: boolean;
  demandeDonsForm: any;
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
  pSusp: any

datDeb: string = ''; 
datFin: string = ''; 
datDeblocag: any = ''; 
  modPay: any;
  constructor(private tokenStorage: TokenStorage, public paginationService: PaginationService, private adherentServ: AdherentService, private indemniteServ: IndemnitesService, private fb: FormBuilder, private saveService: SaveService, private modalService: NgbModal) {
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


  }
  ngOnInit() {
    this.libNatDon = ''
    this.max_mnt_don = 0
    this.demandeDonsForm = this.fb.group({

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


    //this.getPersonnels();
    this.getDepartement()


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
    this.saveService.registerSaveCallback(() => this.saveUpdates());



    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch = canSearch

      console.log("is search valid", canSearch)
    })

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


        this.libAffect = ''


      }
    });
    this.getgetListTypDon()

  }
  ngOnChanges() {
    this.total = this.calculateTotalMntAccDem();
  }
  ngOnDestroy() {
    // Clear the callback to avoid memory leaks
    this.saveService.clearSaveCallback();
    //this.saveService.setCanSave(false)
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





  onSelectedValue(item: any) {
    this.formAdherent.patchValue({
      mat_pers: item.mat_pers,
      num_retr: item.num_retr,
      nom_pers: item.nom_pers,
      pren_pers: item.pren_pers
    });
  }

  onSelectedValueLieu(item: any) {
    this.selectedCodeLieu = item.cod_lieu_geog; // Mise à jour du champ code
    this.libLieu = item.lib_lieu; // Mise à jour du champ libellé
    this.formAdherent.patchValue({
      cod_lieu_geog: item.cod_lieu_geog,
    });
    this.codAffect = item.cod_lieu_geog;
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

  applyFilter() {
    console.log('this.filteredDataRows :', this.filteredDataRows);

    this.filteredDataRows = this.dataRows.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || ''; // Si null/undefined -> ''
        const rowValue = row[key] ? row[key].toString().toLowerCase() : ''; // Si null/undefined -> ''

        return !searchValue || rowValue.includes(searchValue);
      });
    });
  }

  onSort(column: any) {
    console.log("this.dataRows :", this.dataRows)
    this.filteredDataCarteSoint = this.paginationService.onSort(column, this.filteredDataCarteSoint);
  }

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

    }


  }
  ChargActInx() {
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
        { key: "concerne", label: "Concerne" }


        // { key: 'lib_tit_a', label: 'Libellé 2éme langue' }
      ];
    });
  }

  onSelectedValueTypDon(item: any) {

    this.libNatDon = item.lib_nat_Don;
    this.typDonVal = item.nat_Don
    this.max_mnt_don = item.max_mnt_don

  }

  PersIndValid() {
    this.indemniteServ.PersIndValidationCp(this.tokenStorage.getUser().codSoc, this.codAffect, this.typDonVal,this.datDeb,this.datFin).subscribe((data) => {

      this.dataRows = data.map((row: any) => ({
        ...row,
        num_piece: row.num_piece || '1' // Set default value to '1' if not already set
      }));

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
    const totalRows: number = this.filteredDataRows.length;
    const selectedCount: number = this.filteredDataRows.filter((row: DataRow) => row.state).length;

    this.masterSelected = totalRows > 0 && selectedCount === totalRows;

    // Update selected rows list
    this.selectedRows = this.filteredDataRows.filter((row: DataRow) => row.state);

    console.log("Updated Selected Rows:", this.selectedRows);
    this.total = this.calculateTotalMntAccDem()
  }


  checkUncheckAll(event: any): void {
    const isChecked: boolean = event.target.checked;

    this.filteredDataRows.forEach((row: DataRow) => {
      row.state = isChecked;
    });

    this.selectedRows = isChecked ? [...this.filteredDataRows] : [];

    console.log("Selected Rows:", this.selectedRows);
    this.total = this.calculateTotalMntAccDem()
  }

  updatedData: IdDonData[] = []


  calculateTotalMntAccDem(): number {
    if (!Array.isArray(this.selectedRows) || this.selectedRows.length === 0) {
      return 0;
    }

    const total = this.selectedRows.reduce((sum, row) => {
      const montant = parseFloat(row?.mnt_acc_don )?? parseFloat('0'); // Si `mnt_acc_don` est null, on prend 0
      return sum + montant;
    }, 0);
    return total;
  }

  startRowEdit(rowData: any) {
    if (this.currentEditingRow && this.currentEditingRow !== rowData) {
      this.table?.cancelRowEdit(this.currentEditingRow);
    }
    this.table?.initRowEdit(rowData);
    this.currentEditingRow = rowData;
  }

  closeRowEdit(rowData: any) {
    this.table?.cancelRowEdit(rowData);
    if (this.currentEditingRow === rowData) {
      this.currentEditingRow = null;
    }
  }

  applyThreeDecimalsMask(rowData: any, ev: any) {
    const raw = ev?.target?.value ?? rowData?.mnt_acc_don;
    const clean = String(raw).replace(/,/g, '.').replace(/[^0-9.]/g, '');
    let num = Number(clean);
    if (isNaN(num)) num = 0;
    rowData.mnt_acc_don = Number(num.toFixed(3));
    console.log("💰 Montant capturé:", rowData.mnt_acc_don, "pour matricule:", rowData.mat_pers);
    this.total = this.calculateTotalMntAccDem();
    this.markAsUnsaved(rowData);
  }

  markAsUnsaved(rowData: any) {
    this.saveService.setDisabled(true);
  }

  onSelectionChange(rows: any[]) {
    this.selectedRows = rows || [];
    this.total = this.calculateTotalMntAccDem();
  }

  ValiderInd() {
    if (!this.selectedRows || this.selectedRows.length === 0) {
      Swal.fire('Aucun élément sélectionné', 'Veuillez sélectionner des éléments à valider.', 'warning');
      return;
    }

    // Log selected rows to see actual values
    console.log("🔍 Selected rows before save:", this.selectedRows.map(r => ({
      mat_pers: r.mat_pers,
      mnt_acc_don: parseFloat(r.mnt_acc_don)
    })));

    this.saveUpdates();
  }
  formatToThreeDecimals(item: any): void {
    if (item.mnt_acc_don != null && item.mnt_acc_don !== '') {
      item.mnt_acc_don = parseFloat(item.mnt_acc_don).toFixed(3);
    }
  }

  saveUpdates(): void {
    // S'assurer que c'est un tableau pour contenir les données mises à jour
    this.updatedData = [];

    // Vérification si selectedRows contient des éléments
    if (!this.selectedRows || this.selectedRows.length === 0) {
      Swal.fire('Aucun élément sélectionné', 'Veuillez sélectionner des éléments à mettre à jour.', 'warning');
      return;
    }
    if (!this.EtaDem || this.EtaDem.trim() === '') {
      this.EtaDem = 'V';
    }


    // Construction des données mises à jour
    this.selectedRows.forEach((row) => {
      if (row && row.typ_don && row.cod_soc && row.mat_pers) {
        console.log("Montant mis à jour :", parseFloat(row.mnt_acc_don));

     const updatedRow = {
  typ_don: row.typ_don,
  cod_soc: row.cod_soc,
  mat_pers: row.mat_pers,
  num_fam: row.num_fam,
  dat_dem_don: row.dat_dem_don,
  demandeDon: {
    mnt_acc_don: parseFloat(row.mnt_acc_don),
    etat_dem: this.EtaDem,
    num_piece: row.num_piece ?? '1'  // 
  }
};


        // Ajout de la ligne mise à jour au tableau
        this.updatedData.push(updatedRow);

        console.log("Updated Row:", updatedRow); // Log pour voir les données
      } else {
        console.warn('Données manquantes ou incorrectes pour la ligne:', row);
      }
    });
    console.log("updatedData Row:", this.updatedData); // Log pour voir les données

    // Vérification si le tableau contient des données avant d'envoyer
    if (this.updatedData.length === 0) {
      Swal.fire('Erreur', 'Aucune donnée valide à mettre à jour.', 'error');
      return;
    }

    // Affichage d'une boîte de confirmation avec SweetAlert
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Voulez-vous enregistrer les mises à jour ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, enregistrez-le !'
    }).then((result) => {
      if (result.isConfirmed) {
        // Si l'utilisateur confirme, procéder à la mise à jour
        this.indemniteServ.updateDemandeDon(this.updatedData).subscribe(
          (data: any) => {
            if (data && data.length > 0) {
              console.log("Données enregistrées :", data);
              Swal.fire('Enregistré !', 'Vos changements ont été enregistrés.', 'success');
              this.saveService.setDisabled(false);
            } else {
              console.error("Réponse vide ou erronée de l'API :", data);
              Swal.fire('Erreur !', 'Il y a eu une erreur lors de l\'enregistrement des mises à jour.', 'error');
              this.saveService.setDisabled(true);
            }
          },
          (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            Swal.fire('Erreur !', 'Une erreur s\'est produite lors de l\'enregistrement.', 'error');
            this.saveService.setDisabled(true);
          }
        );
      } else {
        // Si l'utilisateur annule, aucune action n'est effectuée
        console.log("Mise à jour annulée");
      }
    });
  }

  ValiderTout() {
    this.selectedRows = [...(this.filteredDataRows || [])];
    this.saveUpdates();
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
