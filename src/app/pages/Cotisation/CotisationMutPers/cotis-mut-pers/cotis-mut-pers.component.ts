import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import { CotisationService } from '../../cotisation.service';
import Swal from 'sweetalert2';
import { PaginationService } from 'src/app/core/services/pagination.service';

@Component({
  selector: 'app-cotis-mut-pers',
  templateUrl: './cotis-mut-pers.component.html',
  styleUrl: './cotis-mut-pers.component.scss'
})


export class CotisMutPersComponent {
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
  corpsList: any;
  p: any

  constructor(private cdr: ChangeDetectorRef
    , public paginationService: PaginationService, private adherentServ: AdherentService, private cotisServ: CotisationService, private fb: FormBuilder, private saveService: SaveService, private modalService: NgbModal) {
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

    this.cotisServ.getCorps().subscribe(
      (response) => {
        this.corpsList = response;


      },
      (error) => {
        console.error('Error fetching corps list:', error);
      }
    );
    this.saveService.canSave$.subscribe((canSave) => {
      this.save = canSave;
      if (this.save) {
        // this.submit();
        //   this.onSubmit()
      }
    });

    ///////////////////////////save
    this.saveService.registerSaveCallback(() => this.onSubmit());
    this.saveService.registerDeletCallback(() => this.deletCotisPers())

    this.formCotisMutPersForm.valueChanges.subscribe(() => {
      this.isDisabled = this.formCotisMutPersForm.pristine;
      this.saveService.setDisabled(!this.isDisabled);
    });


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

  }
  currentIndex: number = 0;
  listCotis: any[] = [];
  listDetailCotis: any[] = [];


  navigate(direction: number): void {
    const nextIndex = this.currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < this.listCotis.length) {
      this.currentIndex = nextIndex;
      this.loadData(this.currentIndex);
      console.log("this.currentIndex", this.currentIndex);
    }
  }
  goToFirst() {
    if (this.listCotis.length > 0) {
      this.currentIndex = 0;
      console.log("this.currentIndex", this.currentIndex);
      this.loadData(this.currentIndex);
    }
  }

  goToLast() {
    if (this.listCotis.length > 0) {
      this.currentIndex = this.listCotis.length - 1;
      console.log("this.currentIndex", this.currentIndex);
      this.loadData(this.currentIndex);
    }
  }
  deletListCotis: [] = []
  deletListLigCotis: [] = []

  loadData(index: number): void {
    if (index < 0 || index >= this.listCotis.length) return;

    const currentData = this.listCotis[index];

    // Extract original dates
    const datDeb = currentData.dat_deb;
    const datFin = currentData.dat_fin;


    // Format the dates to Month/Year
    const formattedDatDeb = this.formatDateToMonthYear(datDeb);
    const formattedDatFin = this.formatDateToMonthYear(datFin);
    console.log("dat ", datDeb, "mois", formattedDatDeb)

    // Format amounts to 3 decimal places
    const mntAPayer = Number((currentData.mnt_a_payer + '').replace(',', '.')).toFixed(3);
    const mntPayer = Number((currentData.mnt_payer + '').replace(',', '.')).toFixed(3);

    // Patch the form with the formatted dates and amounts
    this.formCotisMutPersForm.patchValue({
      ...currentData,
      dat_deb: formattedDatDeb,
      dat_fin: formattedDatFin,
      mnt_a_payer: mntAPayer,
      mnt_payer: mntPayer
    });

    this.deletListCotis = currentData
    console.log("lig    !! :", this.deletListCotis)
    this.fetchLigCotis('01', currentData.mat_pers, currentData.dat_deb, currentData.dat_fin);
  }


  deletCotisPers() {

    console.log("lig  deletListCotis  !! :", this.deletListCotis)

  }

  /////////////////////////////////////////////////////////////////

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
  onSort(column: any) {
    console.log("this.dataRows :", this.dataRows)
    this.filteredDataRows = this.paginationService.onSort(column, this.filteredDataRows);
  }




  /////////////////////////////////////////////////////////
  ngOnDestroy() {
    // Clear the callback to avoid memory leaks
    this.saveService.clearSaveCallback();
    this.saveService.setCanSave(false)
  }
  getPersonnels() {
    this.cotisServ.getPersCotisSearch('01').subscribe((data) => {
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
  pers: any
  onSelectedValueTypDepart(item: any) {
    //  this.codTypDepart = item.cod_typ_depart; // Mise à jour du champ code
    this.libTypDepart = item.lib_typ_depart; // Mise à jour du champ libellé
    this.formAdherent.patchValue({
      cod_typ_depart: item.cod_typ_depart,
    });

  }
  firstCotis: boolean = false
  search(item1: any) {

    //  this.loadData(1)
    this.pers = item1.mat_pers

    console.log("this.codeField", item1)

    this.onSelectedValue(item1);

    this.cotisServ.getCotisationMat('01', item1.mat_pers).subscribe((item: any) => {
      console.log("this.codeField", item)
      this.listCotis = item
      this.firstCotis = true
      this.currentIndex = 0; // Reset index to 0 for new search

      if (this.listCotis && this.listCotis.length > 0) {
        this.loadData(0);
      } else {
        // Clear form or handle no results
        this.dataRows = [];
        this.filteredDataRows = [];
      }
    })

  }
  fetchLigCotis(codSoc: string, matPers: string, datDeb: string, datFin: string): void {
    this.cotisServ.getLigCotisDatRage(codSoc, matPers, datDeb, datFin).subscribe({
      next: (data) => {
        if (data) {
          this.dataRows = data;
          this.filteredDataRows = [...data]; // Initialize filtered data
          console.log("Range date data:", data);
        } else {
          this.dataRows = [];
          this.filteredDataRows = [];
          console.warn("No data received for the given range.");
        }
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.dataRows = [];
        this.filteredDataRows = [];
      }
    });
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
    const matPers = this.formAdherent.get("mat_pers")?.value;
    const codSoc = this.formAdherent.get("cod_soc")?.value;
    const corps = this.formAdherent.get("corps")?.value;
    const codAffect = this.formAdherent.get("cod_affect")?.value;
    const numRetr = this.formAdherent.get("num_retr")?.value;
    const mntParam = this.formAdherent.get("mnt_param")?.value;
    const typDept = this.formAdherent.get("cod_typ_depart")?.value;
    const datSaisie = this.getCurrentDate();

    // Transform MM/YYYY to 01/MM/YYYY
    const datDebControl = this.transformDate(this.formCotisMutPersForm.get("dat_deb")?.value);
    const datFinControl = this.transformDate(this.formCotisMutPersForm.get("dat_fin")?.value);

    const datDeb = datDebControl ? `01/${datDebControl}` : '';
    const datFin = datFinControl ? `01/${datFinControl}` : '';

    // Patch values in form
    this.formCotisMutPersForm.patchValue({
      mat_pers: matPers,
      cod_soc: codSoc,
      corps: corps,
      cod_affect: codAffect,
      num_retr: numRetr,
      mnt_param: mntParam,
      dat_saisie: datSaisie,
      cod_typ_depart: typDept,
      typ_cot: "M",
      etat_cot: "I",
      dat_deb: datDebControl,
      dat_fin: datFinControl
    });

    // Build object to check existing cotisation
    const checkProc = { cod_soc: codSoc, mat_pers: matPers, dat_deb: datDeb, dat_fin: datFin };
    console.log("check", checkProc);

    this.cotisServ.checkCotisation(checkProc).subscribe(
      (response) => {
        console.log("response check", response);

        if (response === "1") {
          Swal.fire({
            icon: 'error',
            title: 'Cotisation existe',
            text: 'Cotisation déjà payée pour cette période...',
            confirmButtonText: 'OK'
          });
          return;
        }

        if (this.formCotisMutPersForm.valid) {
          const formValues = this.formCotisMutPersForm.getRawValue();
          const finalFormValues = {
            ...formValues,
            dat_deb: datDeb,
            dat_fin: datFin
          };

          console.log("Submitting:", finalFormValues);

          this.cotisServ.AddCotis(finalFormValues).subscribe(
            (response) => {
              if (response) {
                console.log('Cotisation saved successfully:', response);
                Swal.fire({
                  icon: 'success',
                  title: 'Cotisation enregistrée',
                  text: 'La cotisation a été enregistrée avec succès !',
                  confirmButtonText: 'OK'
                });

                this.saveService.setDisabled(true);
                this.formCotisMutPersForm.get("num_cot")?.setValue(response.num_cot);
                this.formCotisMutPersForm.get("mnt_a_payer")?.setValue(Number((response.mnt_a_payer + '').replace(',', '.')).toFixed(3))
                this.formCotisMutPersForm.get("mnt_payer")?.setValue(Number((response.mnt_payer + '').replace(',', '.')).toFixed(3))




                // fetch lig cotisation (optional UI refresh)
                this.fetchLigCotis(codSoc, matPers, datDeb, datFin);

                // Show success message

              }
            },
            (error) => {
              console.error('Error saving cotisation:', error);
              const errMsg = error.status === 400
                ? error.error
                : `Une erreur est survenue lors de l'enregistrement de la cotisation pour la période du ${datDeb} au ${datFin}.`;

              Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: errMsg,
                confirmButtonText: 'OK'
              });
            }
          );
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Formulaire invalide',
            text: 'Veuillez remplir tous les champs obligatoires avant de soumettre.',
            confirmButtonText: 'OK'
          });
        }
      },
      (error) => {
        Swal.fire({
          icon: 'warning',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la vérification de la cotisation.',
          confirmButtonText: 'OK'
        });
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


  changePage() {
    this.filteredDataRows = this.paginationService.changePage(this.filteredDataRows);
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



}