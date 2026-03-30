

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { IndemnitesService } from '../../Indemnites/indemnites.service';
import { ConventionServiceService } from '../convention-service.service';
@Component({
  selector: 'app-valid-dem-conv',
  templateUrl: './valid-dem-conv.component.html',
  styleUrl: './valid-dem-conv.component.scss'
})
export class ValidDemConvComponent {

  formPiece!: FormGroup
  formSaiseConv!: FormGroup

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
  typDon: string = "nat_don";

  codBanque: string = "cod_banq";
  codAgence: string = "cod_agc";
  codPost: string = "cod_poste";
  codGouv: string = "cod_gouv";
  codNatP?: String = "";
  codLieuVal?: string;
  codAffectVal?: string;
  codTypDepartVal?: string;
  codConv?: string;

  codBanqueVal?: string;
  codAgenceVal?: string;
  codPostVal?: string;
  codGouvVal?: string;
  codMatVal?: string;
  codPiece?: string;
  codOff?: string;
  libOffre?: string;

  codActiviteVal?: string;

  ///list /////
  listConv: any[] = [];

  listCodOff: any[] = [];
  listCodConv: any[] = [];
  listPiece: any[] = [];
  listAffectation: any[] = [];
  listTypeDepart: any[] = [];
  listBanque: any[] = [];
  listLieu: any[] = [];
  listPersGlob: any[] = [];
  columnPersGlob: any[] = [];
  listAgence: any[] = [];
  listGouv: any[] = [];
  listPoste: any[] = [];
  listAdresse: any[] = [];
  listPersonnel: any[] = [];
  listPieceSelected: any[] = [];
  listMatInt: any[] = [];
  listMat: any[] = [];

  columnsNat: any[] = [];
  columnsLieu: any[] = [];
  columnAffect: any[] = [];
  columnBanque: any[] = [];
  columnsTypDepart: any[] = [];
  columnsAgence: any[] = [];
  columnsGouv: any[] = [];
  columnsCodOff: any[] = [];
  columnsPoste: any[] = [];
  columnsSearch: any[] = [];
  columnsCodConv: any[] = [];
  columnsSearchPiece: any[] = [];
  listEligibleTosave: EligibleToSave[] = [];
  columnsMatInt: any[] = [];
  columnsActivite: any[] = [];
  columnFamille: any[] = [];
  breadCrumbItems!: Array<{}>;

  ////////////////////////lib


  libNat: string = "";
  libLieu: string = "";
  libAffect: string = "";
  libPiece: string = "";


  libTypDepart: string = "";
  libConv: string = "";

  libBanque: string = "";
  libAgence: string = "";
  libGouv: string = "";
  libPoste: string = "";
  libMatInt: string = "";
  libActivite: string = "";
  libNom: string = "";
  datFinOff: string = "";



  formCotisMutPersForm!: FormGroup;
  formCotisMutPersFormIns!: FormGroup;

  demandeDonsForm!: FormGroup;

  formConvention!: FormGroup;
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
  edit: boolean = false;

  showNavigationArrows: any;
  showNavigationIndicators: any;

  etaBool!: boolean
  etatCot?: String;
  modPay?: String;
  numCot: number = 0;

  dat_deb?: any
  dat_fin?: any
  selectedCodeLieu: string = '';
  max_mnt_don!: Number;
  benifList: any;
  listFamille: any;
  mntDemander: any;
  pSusp: any;
  matricule: any;
  numFam: any;
  datProcTypDon!: {
    natDon: any; codAffect: any; typDon: string; codSoc: any; matPers: any; numFam: any; // Adjust as necessary
    datDemDon: string; // Replace with a dynamic value if required
  };
  data1!: {
    typ_don: string; cod_soc: any; mat_pers: any; num_fam: number; // Default value
    dat_dem_don: string;
  };
  concern: any;
  corpsList!: any[];
  columnTitles: { [key: string]: string } = {
    cod_off: "cod off",
    lib_off: "Libéllé offre",
    num_tel: "Num tél",
    dat_off_dem: "Date off",
    etat: "Etat",
    mnt_off: "mnt_off",
    dat_susp: "Date susp",
    renouv: "Renouv",
    dat_renouv: "Date renouv",
    action: "Action"

  };
  datDem: any;
  result: any;
  cin: any;
  codLieuGeog: any;
  canAddConv!: boolean;
  validB: boolean = false;
  newValue: any;
  seq: any;
  constructor(public service: PaginationService, private serv: ConventionServiceService, private tokenStorage: TokenStorage, public paginationService: PaginationService, private adherentServ: AdherentService, private indemniteServ: IndemnitesService, private fb: FormBuilder, private saveService: SaveService, private modalService: NgbModal) {
    this.formPiece = this.fb.group({
      cod_piece: [''],
      lib_piece: [''],
      nbr_copie: [0],
    });




    //  this.formCotisMutPersForm.get('dat_deb')?.valueChanges.subscribe((value) => {
    //   if (value) {
    //     this.formCotisMutPersForm.patchValue({ dat_fin: value });
    //   }
    // }); 



  }
  ngOnInit() {

    ///////////////////////////save
    this.saveService.registerSaveCallback(() => this.saveConv());
    this.getListCodConv()
    this.getPersGlob()
    this.formSaiseConv = this.fb.group({
      lib_off: [''],
      num_tel: [''],
      dat_off_dem: [''],
      dat_fin_off: [''],
      mnt_off: [''],
      etat_off_dem: ['I'], // default to "En instance"
      dat_susp: [''],
      renouv: ['O'],       // default to "Oui"
      dat_renouv: ['']
    });
    this.indemniteServ.getCorps().subscribe(
      (response) => {
        this.corpsList = response;


      },
      (error) => {
        console.error('Error fetching corps list:', error);
      }
    );
    this.data1 = {
      typ_don: '',
      cod_soc: null,
      mat_pers: null,
      num_fam: 0,
      dat_dem_don: '',
    };
    this.datProcTypDon = {
      natDon: null,
      codAffect: null,
      typDon: '',
      codSoc: null,
      matPers: null,
      numFam: null,
      datDemDon: '', // You can replace this with a dynamic date
    };
    this.demandeDonsForm = this.fb.group({
      typ_don: ['I', Validators.required], // Donation type
      cod_soc: [''], // Company code
      mat_pers: [''], // Person ID
      num_fam: [''],
      dat_dem_don: [''],
      nat_don: [''],
      mnt_dem_don: ['', [this.exceedsPlafondValidator.bind(this)]],  // Requested amount
      raison: [''],
      etat_dem: ['I'],
      cod_lieu_geog: [''],
      corps: [''],
      cod_affect: [''],
      cod_fond: ['01'],
      mode_payement: ['E'],
      cod_user: [''],
      dat_saisie: [''],
      typ_benificiaire: ['A'],
      imput_cpt: ['N']
    });


    this.formConvention = this.fb.group({
      nom_pren: [''],
      corps: [''],
      cod_affect: [''],
      lib_affect: [''],
      cod_lieu_geog: [''],
      lib_lieu: [''],
      cod_typ_depart: [''],
      lib_depart: [''],
      dat_depart: [''],
      dat_dem_conv: [''],
      obs: [''],
      dat_saisie: [''],
      dat_min_fin: [null],
      etat_dem: ['I'],  // default to 'Instance'
      dat_susp: ['']
    });

    this.getAffectation();
    this.getTypeDepart();
    this.getDepartement();
    this.getPersonnels()
    // this.getListConv(this.tokenStorage.getUser().codSoc)
    this.getListPiece()

    this.saveService.setDisabled(false);


    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch = canSearch

      console.log("is search valid", canSearch)
    })


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Subscribe to resetObservable to reset the form
    this.saveService.add$.subscribe((reset) => {
      if (reset) {

        this.dataRows = []
        this.filteredDataRows = []

        this.formConvention.reset()

        this.codAffectVal = ''
        this.codTypDepartVal = ''
        this.codConv = ''
        this.codPostVal = ''
        this.codMatVal = ''
        this.codPiece = ''


        this.libTypDepart = ''
        this.libConv = ''
        this.libAffect = ''
        this.numCot = 0


      }
    });
    this.libPiece = ''

    // this.fetchLigCotis(codSoc,matPers,datDeb,datFin)
    this.max_mnt_don = 0
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /*   getListConv(typDon: any) {
      this.serv.getListConv(typDon).subscribe((data) => {
        this.listConv = data;
        console.log(this.listConv);
        // Définir les colonnes dynamiques du tableau
        this.columnsNat = [
          { key: "mat_pers", label: "Matricule" },
          { key: "cin", label: "Cin" },
          { key: "num_retr", label: "Num retr" },
          { key: "nom_pren", label: "Nom & prénom" },
  
  
          // { key: 'lib_tit_a', label: 'Libellé 2éme langue' }
        ];
      });
    } */


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
  showFilters: { [key: string]: boolean } = {};

  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }

  onSort(column: any) {
    this.listConv = this.service.onSort(
      column,
      this.listConv
    );
  }

  performSearch(): void {
    this.searchResults = this.allcompany.filter((item: any) => {
      return item.name.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
    this.company = this.service.changePage(this.searchResults);
  }

  changePage() {
    this.filteredDataRows = this.service.changePage(this.filteredDataRows);
  }
  formatDateDDMMYYYY(rawDate: string | Date): string {
    if (!rawDate) return '';

    let dateObj: Date;

    if (typeof rawDate === 'string') {
      // If string is in "ddMMyyyy" format (e.g., "31082023")
      if (rawDate.length === 8 && /^\d+$/.test(rawDate)) {
        const day = rawDate.substring(0, 2);
        const month = rawDate.substring(2, 4);
        const year = rawDate.substring(4, 8);
        return `${day}/${month}/${year}`;
      }

      // If string is in "DD/MM/YYYY" format
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDate)) {
        return rawDate; // Already in correct format
      }

      // Otherwise, try ISO or other parsable formats
      dateObj = new Date(rawDate);
    } else {
      dateObj = rawDate;
    }

    if (isNaN(dateObj.getTime())) return '';

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
  }


  onDateSaisieBlur() {

    const datOffDem = this.formatDateDDMMYYYY(this.formSaiseConv.value.dat_off_dem);


    const datDem = this.formatDateDDMMYYYY(this.formConvention.value.dat_dem_conv);

    const request: OffDTO = {
      pCodSoc: this.tokenStorage.getUser().codSoc,
      pMatPers: this.codMatVal!,
      pEtatOffDem: 'V',
      pDatDemConv: datDem,
      pDatOffDem: datOffDem
    };

    this.serv.executeProcedure(request).subscribe({
      next: (res) => {
        this.result = res;
        this.validB = true
        console.log('Procedure Result:', res);
        console.log('res.p_dat_fin_off:', res.p_dat_fin_off);
        this.datFinOff = this.formatDateDDMMYYYY(res.p_dat_fin_off);

        this.formSaiseConv.patchValue({
          dat_fin_off: res.p_dat_fin_off
        })
        this.formConvention.patchValue({
          dat_min_fin: res.p_dat_min_fin
        })

        // Display the message in SweetAlert
        if (res && res.p_message) {
          this.validB = false

          Swal.fire({
            title: 'Message from Procedure',
            text: res.p_message,
            icon: 'info',
            confirmButtonText: 'OK'
          });
        }
      },
      error: (err) => {
        this.validB = false

        console.error('Error calling procedure:', err);
        Swal.fire({
          title: 'Error',
          text: 'There was an error calling the procedure.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }


  formatDateToDDMMYYYY(date: string | Date): string {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) {
      console.warn('Invalid date:', date);
      return '';
    }

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  }

  saveConv() {
    this.canAddConv = true;
    const user = this.tokenStorage.getUser();

    // Vérification utilisateur
    if (!user || !user.codSoc) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Utilisateur non connecté ou codSoc manquant.',
      });
      return;
    }

    // Vérification des champs requis
    if (!this.codConv || !this.codMatVal || !this.codOff || !this.seq || !this.newValue) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Certaines données requises sont manquantes (codConv, codMatVal, codOff, seq, ou newValue).',
      });
      return;
    }

    // Format de la date
    this.lisUpdateConv.dat_susp = this.formatDateToDDMMYYYY(this.lisUpdateConv.dat_susp);
    const { modified, ...cleanedObject } = this.lisUpdateConv;

    // Envoi de la requête de mise à jour sans confirmation
    this.serv.updateEtatDemConvBatch(cleanedObject).subscribe({
      next: (data: any) => {
        console.log('Response from backend:', data);

        if (data) {
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'La demande a été enregistrée avec succès.',
            showConfirmButton: false,
            timer: 1000  // se ferme après 2 secondes
          });
          this.saveService.setDisabled(true);
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Aucune mise à jour',
            text: 'Aucune demande n’a été mise à jour. Vérifiez les données envoyées.'
          });
          console.warn('No record updated:', data);
          this.saveService.setDisabled(false);
        }
      },
      error: (err) => {
        const errorMessage = err.error?.message || err.message || 'Une erreur est survenue lors de l’enregistrement.';
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: errorMessage
        });
        console.error('Erreur lors de la mise à jour:', err);
        this.saveService.setDisabled(false);
      },
      complete: () => {
        console.log('Update request completed');
      }
    });
  }

  lisUpdateConv: any = []
  onEtatChange(event: any, item: any) {
    this.saveService.setDisabled(false);
    this.lisUpdateConv = item
    item.etat_off_dem = event.target.value;
    item.modified = true; // Mark this row as modified
    console.log('Updated item:', item);
    this.codOff = item.cod_off
    this.seq = item.seq
    this.newValue = item.etat_off_dem

    if (this.codOff) {
      this.saveConv()
    }



  }
  addDemConv() {
    this.canAddConv = true

    this.saveService.setDisabled(false);

    const user = this.tokenStorage.getUser();

    // Vérification : formulaire valide et utilisateur présent
    if (!this.formSaiseConv?.valid || !user) {
      Swal.fire({
        icon: 'error',
        title: 'Formulaire invalide',
        text: 'Veuillez remplir tous les champs correctement.',
      });
      return;
    }

    const datSaisie = this.getCurrentDate();
    // Formatage des dates
    const datFinOff = this.formatDateDDMMYYYY(this.formSaiseConv.value.dat_fin_off);
    const datOffDem = this.formatDateDDMMYYYY(this.formSaiseConv.value.dat_off_dem);
    const obs = this.formConvention.value.obs;

    const datSusp = this.formatDateDDMMYYYY(this.formSaiseConv.value.dat_susp);
    const renouv = this.formSaiseConv.value.renouv;
    const datRenouv = this.formatDateDDMMYYYY(this.formSaiseConv.value.dat_renouv);
    const datDem = this.formatDateDDMMYYYY(this.formConvention.value.dat_dem_conv);


    const datMinFin = this.formatDateDDMMYYYY(this.formConvention.value.dat_min_fin);
    const codOff = this.formSaiseConv.value.cod_off;
    const libOff = this.formSaiseConv.value.lib_off;
    const numTel = this.formSaiseConv.value.num_tel;


    const mntOff = this.formSaiseConv.value.mnt_off;
    const etatOffDem = this.formSaiseConv.value.etat_off_dem;


    // Création de l'objet de demande
    const newRowDem = {
      cod_off: this.codOff,
      lib_off: this.formSaiseConv.value.lib_off,
      num_tel: this.formSaiseConv.value.num_tel,
      dat_off_dem: datOffDem,
      dat_fin_off: datFinOff,
      mnt_off: this.formSaiseConv.value.mnt_off,
      etat_off_dem: this.formSaiseConv.value.etat_off_dem,
      dat_susp: this.formatDateDDMMYYYY(this.formSaiseConv.value.dat_susp),
      renouv: this.formSaiseConv.value.renouv,
      dat_renouv: this.formatDateDDMMYYYY(this.formSaiseConv.value.dat_renouv)
    };
    this.listConv.push(newRowDem);


  }



  getListCodConv() {
    this.serv.getListCodConv().subscribe((data) => {
      this.listCodConv = data;
      console.log("listCodConv", this.listCodConv);
      // Définir les colonnes dynamiques du tableau
      this.columnsCodConv = [
        { key: "cod_conv", label: "Code conv" },
        { key: "lib_conv", label: "Libéllé" },
      ];

    })
  }
  getListCodOff(codOff: any) {
    this.serv.getListCodOff(codOff).subscribe((data) => {
      this.listCodOff = data;
      console.log(this.listCodOff);
      // Définir les colonnes dynamiques du tableau
      this.columnsCodOff = [
        { key: "cod_off", label: "Code off" },
        { key: "lib_off", label: "Libéllé" },
      ];

    })
  }
  getPersonnels() {
    this.serv.getListConv(this.tokenStorage.getUser().codSoc).subscribe((data) => {
      this.listPersonnel = data;
      console.log(this.listPersonnel);
      // Définir les colonnes dynamiques du tableau
      this.columnsNat = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "cin", label: "Cin" },
        { key: "num_retr", label: "Num retr" },
        { key: "nom_pren", label: "Nom & prénom" },
      ];
    });

  }

  getPersGlob() {

  }
  onSelectedValueCodConv(item: any) {


    this.seachOff()


    this.codConv = item.cod_conv

    this.formConvention.patchValue({

      cod_conv: item.cod_conv,

    });
    this.libConv = item.lib_conv;
    this.getListCodOff(item.cod_conv)
  }



  onSelectedCodOff(item: any) {
    this.codOff = item.cod_off
    console.log(" this.codOff", this.codOff);

    this.formSaiseConv.patchValue({
      cod_off: item.cod_off,
      lib_off: item.lib_off,
      mnt_off: item.mnt_off,



    })

  }







  // Function to handle date formatting
  formatToMaskDate(value: string | number | Date): string {
    let formattedDate: string;

    // If it's a Date object, format it to dd/mm/yyyy
    if (value instanceof Date) {
      formattedDate = `${String(value.getDate()).padStart(2, '0')}/${String(value.getMonth() + 1).padStart(2, '0')}/${value.getFullYear()}`;
    }
    // If it's a string that matches a date format (assuming dd/mm/yyyy)
    else if (typeof value === 'string') {
      // We can assume it's a valid date string for simplicity
      const dateParts = value.split('/');
      if (dateParts.length === 3) {
        const [day, month, year] = dateParts;
        formattedDate = `${String(Number(day)).padStart(2, '0')}/${String(Number(month)).padStart(2, '0')}/${year}`;
      } else {
        throw new Error('Invalid date string format');
      }
    }
    // If it's a number, assume it's in timestamp format
    else if (typeof value === 'number') {
      const date = new Date(value);
      formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    }
    else {
      throw new Error('Unsupported value type');
    }

    return formattedDate;
  }

  // The main function where you integrate the formatting logic
  calculateRetirementData(matPers: string, datOffDem: string, datDemConv?: string, datMinFin?: string): void {
    console.log("codSoc:", this.tokenStorage.getUser().codSoc, "matPers:", matPers);

    const parseDate = (dateStr: string): Date => {
      const formats = [
        () => new Date(dateStr), // ISO
        () => { const [d, m, y] = dateStr.split('/'); return new Date(+y, +m - 1, +d); }, // DD/MM/YYYY
        () => { const [m, d, y] = dateStr.split('-'); return new Date(+y, +m - 1, +d); }, // MM-DD-YYYY
      ];

      for (const format of formats) {
        try {
          const date = format();
          if (!isNaN(date.getTime())) return date;
        } catch { }
      }
      throw new Error(`Unsupported date format: ${dateStr}`);
    };

    // Function to format Date as 'dd/mm/yyyy'
    const formatToMaskDate = (value: Date): string => {
      return `${String(value.getDate()).padStart(2, '0')}/${String(value.getMonth() + 1).padStart(2, '0')}/${value.getFullYear()}`;
    };

    try {
      // Parse input dates using the helper function
      const datOffDemDate = parseDate(datOffDem);
      const datDemConvDate = datDemConv ? parseDate(datDemConv) : undefined;
      const datMinFinDate = datMinFin ? parseDate(datMinFin) : undefined;

      // Format the dates to 'dd/mm/yyyy' before assigning them
      const formattedDatOffDem = formatToMaskDate(datOffDemDate);
      const formattedDatDemConv = datDemConvDate ? formatToMaskDate(datDemConvDate) : undefined;
      const formattedDatMinFin = datMinFinDate ? formatToMaskDate(datMinFinDate) : undefined;

      this.serv.getNais(this.tokenStorage.getUser().codSoc, matPers).subscribe((data: any) => {
        if (!data[0] || !data[0].dat_nais || !data[0].corps) {
          Swal.fire('Erreur', 'Personnel non trouvé', 'error');
          throw new Error('Form trigger failure');
        }

        let wdat_nais = new Date(data[0].dat_nais);
        const corps_ = data[0].corps;
        let wdat_retraite: Date;

        // Adjust birthdate to 1st of next month if needed
        if (wdat_nais.getDate() !== 1) {
          wdat_nais.setMonth(wdat_nais.getMonth() + 1);
          wdat_nais = new Date(wdat_nais.getFullYear(), wdat_nais.getMonth(), 1);
        }

        const addMonths = (date: Date, months: number): Date => {
          const d = new Date(date);
          d.setMonth(d.getMonth() + months);
          return d;
        };

        // Retirement logic
        if (corps_ === 'S') {
          wdat_retraite = addMonths(wdat_nais, 660);
        } else {
          wdat_retraite = addMonths(wdat_nais, 720);
        }

        if (wdat_retraite.getFullYear() <= 2019) {
          wdat_retraite = (corps_ === 'S') ? addMonths(wdat_nais, 672) : addMonths(wdat_nais, 732);
        } else {
          wdat_retraite = (corps_ === 'S') ? addMonths(wdat_nais, 684) : addMonths(wdat_nais, 744);
        }

        // Truncate offer date to start of month
        const datOffDemTrunc = new Date(datOffDemDate.getFullYear(), datOffDemDate.getMonth(), 1);

        // Compute dat_min_fin
        let finalDatMinFin = datMinFinDate;
        if ((!datMinFinDate || datMinFinDate < addMonths(datOffDemTrunc, 12)) &&
          (!datDemConvDate || datOffDemTrunc >= datDemConvDate)) {
          finalDatMinFin = addMonths(datOffDemTrunc, 12);
          finalDatMinFin.setDate(finalDatMinFin.getDate() - 1);
        }

        const datFinOff = new Date(wdat_retraite.getFullYear(), wdat_retraite.getMonth() + 1, 0);

        // Validation with Swal
        if (datDemConvDate && datOffDemDate < datDemConvDate) {
          Swal.fire('Attention', "La date de l'offre est inférieure à la date de demande !", 'warning');
          throw new Error('Form trigger failure');
        }

        if (finalDatMinFin && datDemConvDate && datOffDemDate < addMonths(datDemConvDate, -12)) {
          Swal.fire('Attention', "La date de l'offre est inférieure à la date de la dernière offre !", 'warning');
          throw new Error('Form trigger failure');
        }

        // Ensure that datFinOff is a valid Date object
        if (datFinOff instanceof Date && !isNaN(datFinOff.getTime())) {
          // Format it only if it's a valid date
          this.formSaiseConv.patchValue({
            dat_fin_off: formatToMaskDate(datFinOff),
          });

          this.formConvention.patchValue({
            dat_min_fin: formatToMaskDate(datFinOff),
          });
          console.log('Date parsing  formatToMaskDate(datFinOff):', formatToMaskDate(datFinOff));

        } else {
          console.error('Invalid datFinOff:', datFinOff); // Log an error if datFinOff is invalid
          Swal.fire('Erreur', 'Date de fin invalide !', 'error');
        }


      });

    } catch (error) {
      console.error('Date parsing error:', error);
      Swal.fire('Erreur', 'Format de date invalide !', 'error');
      throw new Error('Form trigger failure');
    }
  }




  formatDateISO(date: Date): string | null {
    return date instanceof Date && !isNaN(date.getTime())
      ? date.toISOString().split('T')[0]
      : null;
  }



  addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    const d = result.getDate();
    result.setMonth(result.getMonth() + months);

    // Handle edge cases like end-of-month overflows
    if (result.getDate() !== d) {
      result.setDate(0);
    }
    return result;
  }



  search(item: any) {
    console.log("this.codeField", this.codeField);
    this.getConvValIn(item)
    this.saveService.setDisabled(true);

    this.formConvention.patchValue({
      mat_pers: item.mat_pers,
      num_retr: item.num_retr,
      nom_pren: item.nom_pren,
      corps: item.corps,
      cod_affect: item.cod_affect,
      lib_affect: item.lib_affect,
      cod_lieu_geog: item.cod_lieu_geog,
      lib_lieu: item.lib_lieu,
      cod_typ_depart: item.cod_typ_depart,
      lib_depart: item.lib_depart,
      dat_depart: item.dat_depart,
      dat_dem_cov: item.dat_dem_conv,
      obs: item.obs,
      dat_saisie: item.dat_saisie,
      dat_min_fin: item.dat_min_fin,
      etat_dem: item.etat_dem,
      dat_susp: item.dat_susp
    });
    this.matricule = item.mat_pers
    //this.getFamille(item.mat_pers)

    console.log("this.formConvention", this.formConvention.value);
    this.codMatVal = item.mat_pers;
    this.codNatP = item.cod_natp;
    this.codLieuVal = item.cod_lieu_geog;
    this.codAffectVal = item.cod_affect;
    this.codTypDepartVal = item.cod_typ_depart;
    this.codBanqueVal = item.codBanque;
    this.codAgence = item.codAgenceVal;
    console.log("this.codNatP", this.codNatP);
    //this.fetchCotisations(item.cod_soc,item.mat_pers,item.dat_deb,item.dat_fin) 


  }
  getConvVal(soc: any, mat: any): void {
    this.serv.getConvVal('01', mat).subscribe((data: any[]) => {
      console.log("I value : data", data);

      if (data && data.length > 0) {
        const last = data[data.length - 1];

        this.codConv = last.cod_conv;
        this.libConv = last.lib_conv;

        this.formConvention.patchValue({
          mat_pers: last.mat_pers,
          cod_conv: last.cod_conv,
          dat_min_fin: last.dat_min_fin,
          etat_dem: last.etat_dem,
          cod_typ_depart: null,  // À modifier si tu veux utiliser une vraie valeur
          cod_user: null,        // Idem
          dat_dem_conv: last.dat_dem_conv,
          dat_saisie: last.dat_saisie,
          obs: last.obs,
          dat_susp: last.dat_susp
        });
      } else {
        console.warn("Aucune donnée retournée depuis le backend.");
      }
    }, error => {
      console.error("Erreur lors de la récupération des données :", error);
    });
  }


  onSelectedValue(item: any) {
    this.getConvVal(item.cod_soc, item.mat_pers)
    this.getConvValIn(item)

    console.log("pers data", item)
    this.codMatVal = item.mat_pers
    this.datDem = item.dat_min_fin

    this.cin = item.cin
    this.codAffect = item.cod_affect
    this.codConv = item.cod_conv
    this.codLieuGeog = item.cod_lieu_geog
    this.codTypDepart = item.cod_typ_depart;

    this.formConvention.patchValue({
      mat_pers: item.mat_pers,
      num_retr: item.num_retr,
      nom_pren: item.nom_pren,
      corps: item.corps,
      cod_affect: item.cod_affect,
      lib_affect: item.lib_affect,
      cod_lieu_geog: item.cod_lieu_geog,
      lib_lieu: item.lib_lieu,
      cod_typ_depart: item.cod_typ_depart,
      lib_depart: item.lib_depart,
      dat_depart: item.dat_depart,
      dat_dem_cov: item.dat_dem_conv,
      dat_susp: item.dat_susp
    });

    /*  this.formConvention.patchValue({
       mat_pers: item.mat_pers,
       num_retr: item.num_retr,
       nom_pren: item.nom_pren,
       corps: item.corps,
       cod_affect: item.cod_affect,
       lib_affect: item.lib_affect,
       cod_lieu_geog: item.cod_lieu_geog,
       lib_lieu: item.lib_lieu,
       cod_typ_depart: item.cod_typ_depart,
       lib_depart: item.lib_depart,
       dat_depart: item.dat_depart,
       dat_dem_cov: item.dat_dem_conv,
       obs: item.obs,
       dat_saisie: item.dat_saisie,
       dat_min_fin: item.dat_min_fin,
       etat_dem: item.etat_dem ,
       dat_susp: item.dat_susp
     }); */
  }
















  //////////////////////////////////////////////////////////////////////////////////


  setData1FromDatProcTypDon(): void {
    if (this.datProcTypDon) {
      this.data1.typ_don = this.datProcTypDon.typDon || '';
      this.data1.cod_soc = this.datProcTypDon.codSoc || null;
      this.data1.mat_pers = this.datProcTypDon.matPers || null;
      this.data1.num_fam = this.datProcTypDon.numFam || 0;
      this.data1.dat_dem_don = this.datProcTypDon.datDemDon || '';
    } else {
      console.error('datProcTypDon is undefined or null');
    }
  }
  exceedsPlafondValidator(control: any) {
    const plafond = this.demandeDonsForm?.get('max_mnt_don')?.value;
    const montantDemande = control.value;

    if (!montantDemande || montantDemande.trim() === '') {
      // Error when the value is not set or is empty
      return { required: true };
    }

    if (plafond && parseFloat(montantDemande) > parseFloat(plafond)) {
      // Error when the value exceeds the plafond
      return { exceedsPlafond: true };
    }

    return null; // No errors
  }

  ngOnDestroy() {
    // Clear the callback to avoid memory leaks
    this.saveService.clearSaveCallback();
    //this.saveService.setCanSave(false)
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


  onSelectedValueAffect(item: any) {
    //   this.codAffect = item.cod_affect; // Mise à jour du champ code
    if (item.cod_affect) {
      this.libAffect = item.lib_affect; // Mise à jour du champ libellé

    }
    this.formConvention.patchValue({
      cod_affect: item.cod_affect,
    });
  }
  onSelectedValueTypDepart(item: any) {
    //  this.codTypDepart = item.cod_typ_depart; // Mise à jour du champ code
    this.libTypDepart = item.lib_typ_depart; // Mise à jour du champ libellé
    this.formConvention.patchValue({
      cod_typ_depart: item.cod_typ_depart,
    });
  }

  // Reusable function for 'A' and 'C' cases
  private handleConcerneCase(concerne: string) {
    this.indemniteServ.getConcerne(concerne).subscribe((data) => {
      this.numFam = data;
      this.data1.num_fam = data;
      this.datProcTypDon.numFam = data;

      console.log("datProcTypDon:", this.datProcTypDon);

      this.indemniteServ.execProcTypDon(this.datProcTypDon).subscribe({
        next: (response) => {
          this.listEligibleTosave = response

          console.log("Response from execProcTypDon:", response);

          this.max_mnt_don = Number(response.p_max_mnt_don);

          // Convert valid to a number to handle comparisons properly
          const valid = Number(response.valid);

          // Handle response statuses
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

            default:
              console.error("Unhandled response.valid value:", response.valid);
              break;
          }
        },
        error: (error) => {
          console.error("Error during execProcTypDon:", error);
        },
      });


      this.demandeDonsForm.patchValue({
        num_fam: this.data1.num_fam,
      });

      console.log("Updated Form:", this.demandeDonsForm.value);
    });
  }

  // Reusable function for 'E' case
  private handleEnfantCase() {
    this.indemniteServ.getFamilleEnfant(this.data1.cod_soc, this.data1.mat_pers).subscribe((fetchedData) => {
      console.log("Fetched family children data:", fetchedData);
    });
  }



  onSelectedValuePiece(item: any) {
    if (item.cod_piece) {
      this.libPiece = item.lib_piece; // Mise à jour du champ libellé

    }
    this.formPiece.patchValue({
      cod_piece: item.cod_piece,
      lib_piece: item.lib_piece

    })
    this.formPiece.get('cod_piece')?.setValue(item.cod_piece);
    this.formPiece.get('lib_piece')?.setValue(item.lib_piece);
    this.formPiece.get('nbr_copie')?.setValue(item.nbr_copie);
    console.log('listPiece', this.listPiece)
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
  listResponse: any = null; // Define a variable to hold the response object

  onSubmit(): void {
    console.log('Form values on submit:', this.demandeDonsForm.value);
    console.log('Piece list:', this.listPiece);

    this.listPiece = this.listPiece.map(({ lib_piece, ...rest }) => rest);

    if (!this.listPiece || this.listPiece.length === 0) {
      // Show an alert if the listPiece is empty
      Swal.fire({
        icon: 'warning',
        title: 'Alerte',
        text: 'Il doit attacher une pièce.',
        confirmButtonText: 'OK'
      });
      return; // Stop further execution if listPiece is empty
    }

    if (this.demandeDonsForm.valid) {
      // Call the service to get the response
      this.indemniteServ.execProcTypDon(this.datProcTypDon).subscribe({
        next: (response) => {
          this.listEligibleTosave = response

          this.listResponse = response; // Save the response in the list
          console.log('Response:', response);

          // Check if valid === 4
          if (this.listResponse.valid === "4") {
            // Proceed with saving
            this.saveDemandeAndPieces();
          } else {
            // Show the p_status message in Swal
            Swal.fire({
              icon: 'warning',
              title: 'Message',
              text: this.listResponse.p_status,
              confirmButtonText: 'OK'
            });
          }
        },
        error: (error) => {
          console.error('Error during execProcTypDon:', error);

          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: "Une erreur s'est produite lors de la validation.",
            confirmButtonText: 'Réessayer'
          });
        }
      });
    } else {
      // Form validation error message
      Swal.fire({
        icon: 'warning',
        title: 'Formulaire invalide',
        text: 'Veuillez remplir tous les champs obligatoires.',
        confirmButtonText: 'OK'
      });
    }
  }

  // Save function for demande and pieces
  private saveDemandeAndPieces(): void {
    // Sanitize data by replacing null values with empty strings
    const sanitizedData = Object.entries(this.demandeDonsForm.value).reduce(
      (acc: { [key: string]: any }, [key, value]) => {
        acc[key] = value === null ? '' : value;
        return acc;
      },
      {} as { [key: string]: any }
    );
    const payload = [this.listPiece];

    // Prepare both API calls using forkJoin
    const demandeDon$ = this.indemniteServ.createDemandeDon(sanitizedData); // First API call
    const pieceDon$ = this.indemniteServ.createPieceDemandeDon(this.listPiece); // Second API call
    console.log('Piece response:', payload);
    // Combine the two API calls
    forkJoin([demandeDon$, pieceDon$]).subscribe({
      next: ([demandeResponse, pieceResponse]) => {
        console.log('Demande response:', demandeResponse);
        console.log('Piece response:', pieceResponse);

        // Show a success message
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Les données de la demande et des pièces ont été ajoutées avec succès.',
          confirmButtonText: 'OK'
        });

        // Reset the forms after success
        this.demandeDonsForm.reset();
        this.formPiece.reset();
        this.listPiece = []
      },
      error: (error) => {
        console.error('Error occurred:', error);

        // Show an error message if any API call fails
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: "Une erreur s'est produite lors de l'enregistrement des données.",
          confirmButtonText: 'Réessayer'
        });
      }
    });
  }


  onSearch(): void {





    // Retrieve and prepare the form values
    const matPers = this.formConvention.get("mat_pers")?.value;
    const codSoc = this.formConvention.get("cod_soc")?.value;
    const corps = this.formConvention.get("corps")?.value;
    const codAffect = this.formConvention.get("cod_affect")?.value;
    const numRetr = this.formConvention.get("num_retr")?.value;
    const mntParam = this.formConvention.get("mnt_param")?.value;
    const typDept = this.formConvention.get("cod_typ_depart")?.value;

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




  fetchCotisations(codSoc: any, matPers: any, datDeb?: any, datFin?: any) {
    // Example request body
    const request = {
      codSoc: codSoc,
      matPers: matPers,
      datDeb: datDeb,
      datFin: datFin,
    };
    console.log('NOT Fetched cotisations:', request); // Log the response3




  }


  saveUpdates(filteredRows: any) {

    /*  Swal.fire({
       title: 'Êtes-vous sûr ?',
       text: 'Voulez-vous enregistrer les modifications ?',
       icon: 'warning',
       showCancelButton: true,
       confirmButtonText: 'Oui, enregistrez-le !',
       cancelButtonText: 'Non, annulez !',
       reverseButtons: true
     }).then((result) => {
       console.log("list vw", filteredRows)
       if (result.isConfirmed) {
         // Send all updated rows as an array
         this.indemniteServ.saveUpdatedRows(filteredRows).subscribe(
           (response) => {
             if(response=="1")
             Swal.fire(
               'Enregistré !',
               'Vos modifications ont été enregistrées.',
               'success'
             );
             this.updatedRows = []; // Clear the updated rows after saving
             const datDebControl =this.formatDateToMonthYear(this.formCotisMutPersForm.get("dat_deb")?.value); 
         const datFinControl =this.formatDateToMonthYear(this.formCotisMutPersForm.get("dat_fin")?.value); 
     
         // Convert MM/YYYY to 01/MM/YYYY
         const datDeb = datDebControl ? `${datDebControl}` : '';
         const datFin = datFinControl ? `${datFinControl}` : '';
     
         // Update form values
         this.formCotisMutPersForm.get("dat_deb")?.setValue(datDeb);
         this.formCotisMutPersForm.get("dat_fin")?.setValue(datFin);
         this.saveService.setDisabled(false);
   
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
     }); */

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
  getFamille(mat: any) {
    this.indemniteServ.getFamille(this.tokenStorage.getUser().codSoc, mat).subscribe(
      (data: any) => {
        this.listFamille = data;
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
  onSelectedValueFamille(item: any) {
    this.libNom = item.nom_pren; // Update the label field
    const datSaisie = this.getCurrentDate();

    // Update form and data values
    this.numFam = item.num_fam;
    this.data1.num_fam = item.num_fam;
    this.datProcTypDon.numFam = item.num_fam;

    this.demandeDonsForm.patchValue({
      num_fam: item.num_fam,
      cod_lieu_geog: this.formConvention.get('cod_lieu_geog')?.value,
    });

    // this.max_mnt_don = item.max_mnt_don;

    console.log("Selected item and num_fam:", item, item.num_fam);
    console.log("datProcTypDon:", this.datProcTypDon);

    this.numFam = item.num_fam;
    // Execute procedure if num_fam is valid
    if (![0, 97, 98, 99].includes(item.num_fam)) {
      this.indemniteServ.execProcTypDon(this.datProcTypDon).subscribe({
        next: (response) => {
          console.log("Response from execProcTypDon:", response);

          this.max_mnt_don = Number(response.p_max_mnt_don);
          this.listEligibleTosave = response
          // Convert valid to a number to handle comparisons properly
          const valid = Number(response.valid);

          // Handle response statuses
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

            default:
              console.error("Unhandled response.valid value:", response.valid);
              break;
          }
        },
        error: (error) => {
          console.error("Error during execProcTypDon:", error);
        },
      });

    }

    // Debugging form values
    console.log("Updated demandeDonsForm values:", this.demandeDonsForm.value);
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

    this.formConvention.patchValue({
      cod_banq: item.cod_banq,
    });
  }

  onSelectedVMatInt(item: any) {
    this.formConvention.get("mat_pers")?.setValue(item.matPers); // Mise à jour du champ libellé

    this.formConvention.get("mat_pers")?.patchValue(item.matPers); // Mise à jour du champ libellé
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

  onSelectedValueLieu(item: any) {
    this.selectedCodeLieu = item.cod_lieu_geog; // Mise à jour du champ code
    this.libLieu = item.lib_lieu; // Mise à jour du champ libellé
    this.formConvention.patchValue({
      cod_lieu_geog: item.cod_lieu_geog,
    });
  }

  openModalTab(content: any) {
    this.listConv = []
    this.edit = false;
    console.log("edit :", this.edit)
    this.modalService.open(content, { size: "lg", centered: true });
    //this.formSaiseConv.reset()

  }

  getListPiece() {
    this.indemniteServ.getListPiece().subscribe((data) => {
      console.log("Liste piece:", data);


      console.log("personnel", data);
      this.listPieceSelected = data;
      this.columnsSearchPiece = [
        { key: "cod_piece", label: "Code Piece" },
        { key: "lib_piece", label: "Libellé" }
      ];
    });
  }


  savePieceDon() {
    console.log("this.formPiece.value :", this.formPiece.value);
    const datSaisie = this.getCurrentDate();
    // const newPiece = this.formPiece.value;
    const newPiece = {
      typ_don: 'I',
      cod_soc: this.tokenStorage.getUser().codSoc,
      mat_pers: this.matricule,
      num_fam: this.numFam,
      dat_dem_don: datSaisie,
      cod_piece: this.formPiece.value.cod_piece,
      nbr_copie: this.formPiece.value.nbr_copie,
      lib_piece: this.formPiece.value.lib_piece
    };
    // Add the new piece to the list
    this.listPiece.push(newPiece);

    console.log('Updated listPiece:', this.listPiece);

    // Reset the form for the next entry
    this.formPiece.reset();


  }

  getPieceDemandeDon(data: any) {
    this.indemniteServ.getPieceDemandeDon(data).subscribe(data => {
      //this.listP = data;
      // Définir les colonnes dynamiques du tableau

    });
  }


  currentIndex: number = 0;
  listCotis: any[] = [];
  listDetailCotis: any[] = [];


  navigate(direction: number): void {

    this.currentIndex += direction;
    this.loadData(this.currentIndex);
    console.log("this.currentIndex", this.currentIndex)

  }
  goToFirst() {
    this.currentIndex = 0;
    console.log("this.currentIndex", this.currentIndex)
    this.loadData(this.currentIndex);

  }

  goToLast() {
    this.currentIndex = this.listDemConv.length - 1;
    console.log("this.currentIndex", this.currentIndex)
    this.loadData(this.currentIndex);

  }

  deletListCotis: [] = []
  deletListLigCotis: [] = []

  loadData(index: number): void {

    const currentData = this.listDemConv[index];
    console.log("currentData", currentData);

    // Extract original dates
    const datDeb = currentData.dat_deb;
    const datFin = currentData.dat_fin;

    this.deletListCotis = currentData
    this.getConvValInCodConv(currentData)

    console.log("this.currentData", currentData);

  }
  seachOff() {
    const user = this.tokenStorage.getUser();
    console.log("matricule", this.codMatVal!)
    this.listConv = []

    this.serv.getListDemOff(this.codConv!, user.codSoc, this.codMatVal!).subscribe((data: any) => {

      this.listConv = data
      console.log("data offre", data)
      if (!data) {
        this.listConv = []

      }


    })


  }
  /* seachOff(item:any){
    const user = this.tokenStorage.getUser();
    console.log("item  ;",item)
    this.listConv=[]

    this.serv.getListDemOffPers(user.codSoc,item.mat_pers).subscribe((data:any)=>{

      this.listConv=data
      console.log("data offre",data)
      if (!data){
    this.listConv=[]

      }
      
      
    })


  } */
  listDemConv: any[] = []
  getConvValIn(item: any): void {
    this.serv.getConvValIn('01', item.mat_pers).subscribe((data: any[]) => {
      console.log("I value : data", data);
      this.listDemConv = data

      if (data && data.length > 0) {
        const last = data[data.length - 1];

        this.codConv = last.cod_conv;
        this.libConv = last.lib_conv;

        this.formConvention.patchValue({
          mat_pers: last.mat_pers,
          cod_conv: last.cod_conv,
          dat_min_fin: last.dat_min_fin,
          etat_dem: last.etat_dem,
          cod_typ_depart: null,  // À modifier si tu veux utiliser une vraie valeur
          cod_user: null,        // Idem
          dat_dem_conv: last.dat_dem_conv,
          dat_saisie: last.dat_saisie,
          obs: last.obs,
          dat_susp: last.dat_susp
        });
      } else {
        console.warn("Aucune donnée retournée depuis le backend.");
      }
    }, error => {
      console.error("Erreur lors de la récupération des données :", error);
    });
  }
  getConvValInCodConv(item: any): void {
    console.log("this.currentData fff", item);

    const last = item

    this.codConv = last.cod_conv;
    this.libConv = last.lib_conv;

    this.formConvention.patchValue({
      mat_pers: last.mat_pers,
      cod_conv: last.cod_conv,
      dat_min_fin: last.dat_min_fin,
      etat_dem: last.etat_dem,

      dat_dem_conv: last.dat_dem_conv,
      dat_saisie: last.dat_saisie,
      obs: last.obs,
      dat_susp: last.dat_susp
    });
  }
}
export interface EligibleToSave {
  p_status: string;
  valid: string;
  p_typ_benef: string;
  p_lib_nat_don: string;
  p_max_mnt_don: number;
}
export interface OffDTO {
  pCodSoc: string;
  pMatPers: string;
  pEtatOffDem: string;
  pDatDemConv: string; // Format: 'YYYY-MM-DD'
  pDatOffDem: string;  // Format: 'YYYY-MM-DD'
}

