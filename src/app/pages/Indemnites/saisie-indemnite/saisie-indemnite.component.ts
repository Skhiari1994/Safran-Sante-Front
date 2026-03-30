import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { CotisationService } from '../../Cotisation/cotisation.service';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { IndemnitesService } from '../indemnites.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-saisie-indemnite',
  templateUrl: './saisie-indemnite.component.html',
  styleUrl: './saisie-indemnite.component.scss'
})
export class SaisieIndemniteComponent {


  formPiece!: FormGroup

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
  typDonVal?: string;

  codBanqueVal?: string;
  codAgenceVal?: string;
  codPostVal?: string;
  codGouvVal?: string;
  codMatVal?: string;
  codPiece?: string;

  codActiviteVal?: string;

  ///list /////
  listTypDon: any[] = [];

  listPiece: any[] = [];
  listAffectation: any[] = [];
  listTypeDepart: any[] = [];
  listBanque: any[] = [];
  listLieu: any[] = [];
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
  columnsPoste: any[] = [];
  columnsSearch: any[] = [];
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
  libNatDon: string = "";

  libBanque: string = "";
  libAgence: string = "";
  libGouv: string = "";
  libPoste: string = "";
  libMatInt: string = "";
  libActivite: string = "";
  libNom: string = "";


  formCotisMutPersForm!: FormGroup;
  formCotisMutPersFormIns!: FormGroup;

  demandeDonsForm!: FormGroup;

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
  listFamille: any[] = [];
  mntDemander: any;
  pSusp: any;
  matricule: any;
  numFam: any;
  datProcTypDon!: {
    natDon: any; codAffect: any; typDon: string; codSoc: any; matPers: any; numFam: any;
    datDemDon: string;
  };
  data1!: {
    typ_don: string; cod_soc: any; mat_pers: any; num_fam: number;
    dat_dem_don: string;
  };
  concern: any;
  corpsList!: any[];
  corps: any;

  constructor(private router: Router, private tokenStorage: TokenStorage, public paginationService: PaginationService, private adherentServ: AdherentService, private indemniteServ: IndemnitesService, private fb: FormBuilder, private saveService: SaveService, private modalService: NgbModal) {
    this.formPiece = this.fb.group({
      cod_piece: ['01'],
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
      mode_payement: ['V'],
      cod_user: [''],
      dat_saisie: [''],
      typ_benificiaire: ['A'],
      imput_cpt: ['N'],
      mnt_acc_don: [''],
      dat_deblocage: [''],
      ref_payement: [''],
      num_piece: ['1'],
      rib: [''],
      ref_metier: [''],
      num_vir: [''],
      seq_ecrt: ['']
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
    this.getDepartement();
    this.getgetListTypDon("I", "01")
    this.getListPiece()
    this.saveService.canSave$.subscribe((canSave) => {
      this.save = canSave;
      if (this.save) {
        // this.submit();
        //   this.onSubmit()
      }
    });

    ///////////////////////////save

    this.saveService.registerSaveCallback(() => this.onSubmit());
    this.demandeDonsForm.valueChanges.subscribe(() => {
      this.isDisabled = this.demandeDonsForm.pristine;
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

        this.dataRows = []
        this.filteredDataRows = []

        this.formAdherent.reset()

        this.codAffectVal = ''
        this.codTypDepartVal = ''
        this.typDonVal = ''
        this.codPostVal = ''
        this.codMatVal = ''
        this.codPiece = ''
        this.typDonVal = ''
        this.libNatDon = ''
        this.codActiviteVal = ''
        this.libNom = ''

        this.libTypDepart = ''
        this.libNatDon = ''
        this.libAffect = ''
        this.numCot = 0

        this.demandeDonsForm.reset()
      }
      this.searchBool = false

    });
    this.libPiece = ''

    // this.fetchLigCotis(codSoc,matPers,datDeb,datFin)
    this.max_mnt_don = 0
    this.saveService.setCanSave(true)

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.saveService.clearSaveCallback();
    });
  }
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
  exceedsPlafondValidator(control: AbstractControl) {
    // Get the plafond value from the component property
    // We access the component instance via `this` because we bound it in the form definition
    const plafond = this.max_mnt_don ? Number(this.max_mnt_don) : 0;

    // Get the requested amount (convert to float)
    const montantDemande = control.value;
    if (montantDemande == null || montantDemande === '') {
      return { required: true }; // required validation
    }

    const montant = parseFloat(montantDemande);

    if (isNaN(montant)) {
      return { invalidNumber: true }; // Not a number
    }

    if (plafond > 0 && montant > plafond) {
      return { exceedsPlafond: true }; // Amount exceeds maximum
    }

    return null; // No error
  }


  /*
    ngOnDestroy() {
      // Clear the callback to avoid memory leaks
      this.saveService.clearSaveCallback();
      //this.saveService.setCanSave(false)
    }*/
  getPersonnels() {
    this.indemniteServ.getPersInd(this.tokenStorage.getUser().codSoc).subscribe((data) => {
      console.log("personnel", data);
      // Transform data to ensure mat_int is never null
      this.listPersonnel = data.map(person => ({
        ...person,
        mat_int: person.mat_int || ''
      }));

      this.columnsSearch = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "nom_pers", label: "Nom" },
        { key: "pren_pers", label: "Prénom" },
        { key: "dat_nais", label: "Date Naissance" },
        { key: "num_retr", label: "Id unique" },
        { key: "cin", label: "CIN" },
      ];
    });
  }




  //////////////////////////////////////////// next,last,previous,first///////////////////////////////////////////////////
  currentIndex: number = 0;
  listInd: any[] = [];
  listDetailCotis: any[] = [];

  goToFirst() {
    this.currentIndex = 0;
    console.log("this.currentIndex", this.currentIndex)
    this.loadData(this.currentIndex);

  }

  goToLast() {
    this.currentIndex = this.listInd.length - 1;
    console.log("this.currentIndex", this.currentIndex)
    this.loadData(this.currentIndex);

  }
  navigate(direction: number): void {

    this.currentIndex += direction;
    this.loadData(this.currentIndex);
    console.log("this.currentIndex", this.currentIndex)

  }
  updateListInd: [] = []
  loadData(index: number): void {

    const lastInd = this.listInd[index];

    //  const lastInd = this.listInd[0];
    const today = new Date();
    const formattedDate = today.toLocaleDateString('fr-FR'); // dd/mm/yyyy
    const refMetierValue = this.matricule + '/' + formattedDate;
    this.typDonVal = lastInd.nat_don
    this.demandeDonsForm.patchValue({
      typ_don: lastInd.typ_don,
      cod_soc: this.tokenStorage.getUser().codSoc,
      mat_pers: this.matricule,
      num_fam: lastInd.num_fam,
      dat_dem_don: lastInd.dat_dem_don,
      nat_don: lastInd.nat_Don,
      mnt_dem_don: parseFloat(lastInd.mnt_dem_don),
      raison: lastInd.raison,
      etat_dem: lastInd.etat_dem,
      cod_lieu_geog: this.formAdherent.get('cod_lieu_geog')?.value,
      corps: lastInd.corps,
      cod_affect: lastInd.cod_affect,
      cod_fond: lastInd.cod_fond || '01',
      mode_payement: lastInd.mode_payement || 'E',
      cod_user: this.tokenStorage.getUser().matPers,
      dat_saisie: lastInd.dat_saisie,
      typ_benificiaire: lastInd.concerne || 'A',
      imput_cpt: lastInd.imput_cpt || 'N',
      ref_payement: lastInd.ref_payement,
      num_piece: '1',
      rib: lastInd.rib,
      ref_metier: refMetierValue,
      num_vir: lastInd.num_vir,
      seq_ecrt: lastInd.seq_ecrt
    });
    this.demandeDonsForm.patchValue({
      mnt_acc_don: parseFloat(lastInd.mnt_dem_don),
      dat_deblocage: this.formatDate(lastInd.dat_deblocage || ''),
    });
    this.max_mnt_don = lastInd.max_mnt_don ? parseFloat(lastInd.max_mnt_don) : 0;
    // this.fetchLigCotis('01', currentData.mat_pers, currentData.dat_deb, currentData.dat_fin); 

  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////




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
  formatDate(dateStr: string): string {
    if (!dateStr || dateStr.length !== 8) return dateStr; // basic check
    const day = dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const year = dateStr.substring(4, 8);
    return `${day}/${month}/${year}`;
  }

  onSelectedValueTypDon(item: any) {
    if (!this.searchBool) {
      let datSaisie = this.formatDate(this.demandeDonsForm.get('dat_saisie')?.value);

      if (!datSaisie || datSaisie.trim() === '') {
        datSaisie = this.getCurrentDate();
      }

      this.concern = item.concerne;

      // Update form values
      this.demandeDonsForm.patchValue({
        dat_saisie: datSaisie,
        nat_don: item.nat_Don,
        typ_benificiaire: item.concerne,
        cod_affect: item.cod_affect,
        mat_pers: this.matricule,
        cod_user: this.tokenStorage.getUser().matPers,
        cod_soc: this.tokenStorage.getUser().codSoc,
        dat_dem_don: datSaisie,
        cod_lieu_geog: this.formAdherent.get('cod_lieu_geog')?.value,
        typ_don: 'I',
        etat_dem: 'I'
      });


      // Prepare data objects
      this.data1 = {
        typ_don: 'I',
        cod_soc: this.tokenStorage.getUser().codSoc,
        mat_pers: this.matricule,
        num_fam: 0,
        dat_dem_don: datSaisie,
      };

      this.datProcTypDon = {
        natDon: item.nat_Don,
        codAffect: item.cod_affect,
        typDon: this.data1.typ_don,
        codSoc: this.data1.cod_soc,
        matPers: this.data1.mat_pers,
        numFam: this.numFam,
        datDemDon: datSaisie,
      };

      // Handle the `concerne` logic
      if (item.concerne === "A" || item.concerne === "C") {
        this.handleConcerneCase(item.concerne);
      } else if (item.concerne === "E") {
        this.handleEnfantCase();
      }

      this.libNatDon = item.lib_nat_Don;

      console.log("Final Form Values:", this.demandeDonsForm.value);
      console.log("Data1 demande don:", this.data1);
    }
  }


  changeBenifi(val: any) {
    this.concern = val
    if (val === 'A' || val === 'C' || val === 'P') {
      this.handleConcerneCase(val);
    } else if (val === 'E') {
      this.handleEnfantCase();
    }
  }

  // Reusable function for 'A' and 'C' cases
  private handleConcerneCase(concerne: string) {
    if (concerne === 'A') {
      this.numFam = 0;
      this.data1.num_fam = 0;
      this.datProcTypDon.numFam = 0;
      this.indemniteServ.execProcTypDon(this.datProcTypDon).subscribe({
        next: (response) => {
          console.log("Response from execProcTypDon:", response);

          this.listEligibleTosave = response;
          this.max_mnt_don = Number(response.p_max_mnt_don);

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
              this.saveService.setDisabled(false);
              break;

            case 4:
              this.saveService.setDisabled(true);
              break;

            default:
              console.error("Unhandled value for response.valid:", valid);
              this.saveService.setDisabled(false);
              break;
          }
        },
        error: (error) => {
          console.error("Error during execProcTypDon:", error);
          this.saveService.setDisabled(false); // Optional: disable save on error
        },
      });


      this.demandeDonsForm.patchValue({
        num_fam: this.data1.num_fam,
      });

      console.log("Updated Form:", this.demandeDonsForm.value);
    } else {
      this.indemniteServ.getConcerne(concerne).subscribe((data) => {
        this.numFam = data;
        this.data1.num_fam = data;
        this.datProcTypDon.numFam = data;

        console.log("datProcTypDon:", this.datProcTypDon);

        this.indemniteServ.execProcTypDon(this.datProcTypDon).subscribe({
          next: (response) => {
            console.log("Response from execProcTypDon:", response);

            this.listEligibleTosave = response;
            this.max_mnt_don = Number(response.p_max_mnt_don);

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
                this.saveService.setDisabled(false);
                break;

              case 4:
                this.saveService.setDisabled(true);
                break;

              default:
                console.error("Unhandled value for response.valid:", valid);
                this.saveService.setDisabled(false);
                break;
            }
          },
          error: (error) => {
            console.error("Error during execProcTypDon:", error);
            this.saveService.setDisabled(false); // Optional: disable save on error
          },
        });


        this.demandeDonsForm.patchValue({
          num_fam: this.data1.num_fam,
        });

        console.log("Updated Form:", this.demandeDonsForm.value);
      });
    }

  }

  // Reusable function for 'E' case
  // Reusable function for 'E' case
  private handleEnfantCase() {
    this.indemniteServ.getFamilleEnfant(this.data1.cod_soc, this.data1.mat_pers).subscribe((fetchedData) => {
      console.log("Fetched family children data:", fetchedData);
      this.listFamille = fetchedData;
      this.columnFamille = [
        { key: "num_fam", label: "Num fam" },
        { key: "nom_pren", label: "Nom" },
        { key: "dat_naiss", label: "Date naissance" },
      ];
    });
  }

  searchBool: Boolean = false
  search(item: any) {
    this.searchBool = true

    console.log("this.codeField", this.codeField);
    this.indemniteServ.getDemInd(item.cod_soc, item.mat_pers).subscribe((data: any) => {

      console.log("data:", data);
      this.listInd = data;
      const lastInd = this.listInd[0];

      this.typDonVal = lastInd.nat_don
      this.libNatDon = lastInd.lib_nat_don
      this.codActiviteVal = lastInd.num_fam
      this.libNom = lastInd.nom_pers
      this.demandeDonsForm.patchValue({
        typ_don: lastInd.typ_don,
        cod_soc: this.tokenStorage.getUser().codSoc,
        mat_pers: this.matricule,
        num_fam: lastInd.num_fam,
        dat_dem_don: lastInd.dat_dem_don,
        nat_don: lastInd.nat_Don,
        mnt_dem_don: parseFloat(lastInd.mnt_dem_don),
        raison: lastInd.raison,
        etat_dem: lastInd.etat_dem,
        cod_lieu_geog: this.formAdherent.get('cod_lieu_geog')?.value,
        corps: lastInd.corps,
        cod_affect: lastInd.cod_affect,
        cod_fond: lastInd.cod_fond || '01',
        mode_payement: lastInd.mode_payement || 'E',
        cod_user: this.tokenStorage.getUser().matPers,
        dat_saisie: lastInd.dat_saisie,
        typ_benificiaire: lastInd.concerne || 'A',
        imput_cpt: lastInd.imput_cpt || 'N',
        ref_payement: lastInd.ref_payement,
        num_piece: '1',
        rib: lastInd.rib,
        ref_metier: lastInd.ref_metier,
        num_vir: lastInd.num_vir,
        seq_ecrt: lastInd.seq_ecrt
      });
      this.demandeDonsForm.patchValue({
        mnt_acc_don: parseFloat(lastInd.mnt_dem_don),
        dat_deblocage: this.formatDate(lastInd.dat_deblocage || ''),
      });
      this.max_mnt_don = lastInd.max_mnt_don ? parseFloat(lastInd.max_mnt_don) : 0;

    });

    // this.searchBool=false

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
    this.matricule = item.mat_pers
    this.getFamille(item.mat_pers)

    console.log("this.formAdherent", this.formAdherent.value);
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

  onSelectedValue(item: any) {
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
    this.matricule = item.mat_pers
    this.getFamille(item.mat_pers)

    console.log("this.formAdherent", this.formAdherent.value);
    this.codMatVal = item.mat_pers;
    this.codNatP = item.cod_natp;
    this.codLieuVal = item.cod_lieu_geog;
    this.codAffectVal = item.cod_affect;
    this.codTypDepartVal = item.cod_typ_depart;
    this.codBanqueVal = item.codBanque;
    this.codAgence = item.codAgenceVal;
    this.corps = item.corps
    console.log("this.codNatP", this.codNatP);
    //this.fetchCotisations(item.cod_soc,item.mat_pers,item.dat_deb,item.dat_fin) 
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
    this.demandeDonsForm.patchValue({
      corps: this.corps
      //num_piece:
    });
    this.listPiece = this.listPiece.map(({ lib_piece, ...rest }) => rest);

    if (!this.listPiece || this.listPiece.length === 0) {
      // Show an alert if the listPiece is empty
      this.formPiece.patchValue({
        cod_piece: '01',
        nbr_copie: 1



      })
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

    const formValue = { ...this.demandeDonsForm.value };

    formValue.mnt_acc_don = formValue.mnt_dem_don;

    const sanitizedData = Object.entries(formValue).reduce(
      (acc: { [key: string]: any }, [key, value]) => {
        acc[key] = value === null ? '' : value;
        return acc;
      },
      {} as { [key: string]: any }
    );

    const demandeDon$ = this.indemniteServ.createDemandeDon(sanitizedData);
    const pieceDon$ = this.indemniteServ.createPieceDemandeDon(this.listPiece);

    forkJoin([demandeDon$, pieceDon$]).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Les données de la demande et des pièces ont été ajoutées avec succès.',
          confirmButtonText: 'OK'
        });

        this.demandeDonsForm.reset();
        this.formPiece.reset();
        this.listPiece = [];
      },
      error: () => {
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


  changePage() {
    this.filteredDataRows = this.paginationService.changePage(this.filteredDataRows);
  }

  searchz: any = {
    dat_cot: '',
    mnt_payer: ''
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
        console.log("data fam ", data)
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

    if (!this.searchBool) {
      this.libNom = item.nom_pren; // Update the label field
      const datSaisie = this.getCurrentDate();

      // Update form and data values
      this.numFam = item.num_fam;
      this.data1.num_fam = item.num_fam;
      this.datProcTypDon.numFam = item.num_fam;

      this.demandeDonsForm.patchValue({
        num_fam: item.num_fam,
        cod_lieu_geog: this.formAdherent.get('cod_lieu_geog')?.value,
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

              case 4:
                this.saveService.setDisabled(true);
                break;
              default:
                console.error("Unhandled response.valid value:", response.valid);
                this.saveService.setDisabled(false);
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

  onSelectedVMatInt(item: any) {
    this.formAdherent.get("mat_pers")?.setValue(item.matPers); // Mise à jour du champ libellé

    this.formAdherent.get("mat_pers")?.patchValue(item.matPers); // Mise à jour du champ libellé
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
    this.formAdherent.patchValue({
      cod_lieu_geog: item.cod_lieu_geog,
    });
  }

  openModalTab(content: any) {
    this.edit = false;
    console.log("edit :", this.edit)
    this.modalService.open(content, { size: "lg", centered: true });
    this.formPiece.reset()

  }
  getgetListTypDon(typDon: any, codAffect: any) {
    this.indemniteServ.getgetListTypDon(typDon, codAffect).subscribe((data) => {
      this.listTypDon = data;
      console.log(this.listTypDon);
      // Définir les colonnes dynamiques du tableau
      this.columnsNat = [
        { key: "nat_Don", label: "Code" },
        { key: "lib_nat_Don", label: "Libelle" },
        { key: "max_mnt_don", label: "Plafond" },
        { key: "concerne", label: "Concerne" },
        { key: "cod_affect", label: "Affectation" },


        // { key: 'lib_tit_a', label: 'Libellé 2éme langue' }
      ];
    });
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
}
export interface EligibleToSave {
  p_status: string;
  valid: string;
  p_typ_benef: string;
  p_lib_nat_don: string;
  p_max_mnt_don: number;
}
