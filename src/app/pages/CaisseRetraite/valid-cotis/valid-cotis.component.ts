import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { AdherentService } from '../../Adherent/adherent.service';
import { CotisationService } from '../../Cotisation/cotisation.service';
import { CaisseRetrService } from '../caisse-retr.service';

@Component({
  selector: 'app-valid-cotis',
  templateUrl: './valid-cotis.component.html',
  styleUrl: './valid-cotis.component.scss'
})
export class ValidCotisComponent {
  imageURL: string | undefined;
  isReadOnly: boolean = true;  // Set to 'true' to visually make it readonly

  dataRows!: any[];
  listActivite!: any[];
  listPrime: any[] = []
  CarteSoinList!: any[];
  columnsSearchPers: any[] = []
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


  formPrimeMutPersForm!: FormGroup;
  formPrimeMutPersFormIns!: FormGroup;
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
  numPrime: any;

  constructor(private cdr: ChangeDetectorRef, private servRetr: CaisseRetrService, public paginationService: PaginationService,
    private adherentServ: AdherentService, private cotisServ: CotisationService, private fb: FormBuilder, private saveService: SaveService,
    private modalService: NgbModal, private token: TokenStorage) {
    this.formPrimeMutPersForm = this.fb.group({
      cod_soc: [''],
      mat_pers: [''],
      num_prime: [{ value: '', disabled: true }],
      typ_prime: [{ value: '', disabled: true }],
      dat_deb: [''],
      dat_fin: [''],
      mnt_a_payer: [''],
      mnt_payer: [''],
      mod_pay: ['V'],
      ref_pay: [''],
      dat_saisie: [''],
      etat_prime: [''],
      corps: [''],
      cod_typ_depart: [''],
      cod_affect: [''],
      mnt_param: [''],
      num_retr: [''],
      seq_ecrt1: [''],
      seq_ecrt2: [''],
      imput: [''],

    });



    this.formPrimeMutPersFormIns = this.fb.group({



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
    this.getAllPrimes()

    this.cotisServ.getCorps().subscribe(
      (response) => {
        this.corpsList = response;


      },
      (error) => {
        console.error('Error fetching corps list:', error);
      }
    );
    // this.saveService.canSave$.subscribe((canSave) => {
    //   this.save = canSave;
    //   if (this.save) {
    //     // this.submit();
    //     //   this.onSubmit()
    //   }
    // });

    ///////////////////////////save
    this.saveService.registerSaveCallback(() => this.onSubmit());
    // this.saveService.registerDeletCallback(()=>this.deletCotisPers())

    this.formPrimeMutPersForm.valueChanges.subscribe(() => {
      this.isDisabled = this.formPrimeMutPersForm.pristine;
      this.saveService.setDisabled(true);
    });


    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch = canSearch

      console.log("is search valid", canSearch)
    })

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Subscribe to resetObservable to reset the form
    this.saveService.add$.subscribe((reset) => {
      if (reset) {
        this.formPrimeMutPersForm.reset();
        this.formPrimeMutPersForm.enable()
        this.dataRows = []
        this.filteredDataRows = []

        this.formAdherent.reset()
        this.formPrimeMutPersForm.get("num_prime")
        this.formPrimeMutPersForm.get("num_prime")?.setValue("");
        this.formPrimeMutPersForm.get("typ_prime")?.setValue("M");
        this.formPrimeMutPersForm.get("mnt_a_payer")?.setValue(0.000);
        this.formPrimeMutPersForm.get("etat_prime")?.setValue("I");
        this.formPrimeMutPersForm.get("mod_pay")?.setValue("V");

        this.formPrimeMutPersForm.get("typ_prime")?.disable()
        this.formPrimeMutPersForm.get("mnt_a_payer")?.disable()
        this.formPrimeMutPersForm.get("etat_prime")?.disable()


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
  listCotis: any[] = [];
  listDetailCotis: any[] = [];

  /* deletCotisPers(){
  
    console.log("lig  deletListCotis  !! :",this.deletListCotis)
    
  } */

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


  ngOnDestroy() {
    this.saveService.clearSaveCallback();
    this.saveService.setCanSave(false)
  }
  getPersonnels() {
    this.servRetr.getPersPrimeSearch(this.token.getUser().codSoc).subscribe((data) => {
      console.log("personnel", data);
      this.listPersonnel = data;
      this.columnsSearchPers = [
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
  getAllPrimes() {
    this.servRetr.getAllVald().subscribe((data: any) => {
      this.listPrime = data
      this.columnsSearch = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "nom", label: "Nom & Prénom" },
        { key: "num_prime", label: "Num" },
      ];
    })
  }



  validators() {
    if (this.formPrimeMutPersForm.get("mat_pers")?.value === "") {
      this.errorMessageMat = "Matricule obligatoire";
    }
  }

  openModal(targetModal: any, adr: any): void {
    this.modalService.open(targetModal, {
      windowClass: "my-class",
      centered: true,
    });
    this.formPrimeMutPersForm.patchValue({
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

    this.formPrimeMutPersForm.reset();
    this.formPrimeMutPersForm.patchValue({ cod_soc: "01" });
    console.log(this.formPrimeMutPersForm.value);
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
    this.getAllByMat(item1.mat_pers)
    this.numPrime = item1.num_prime

    console.log("=== SEARCH CALLED ===");
    console.log("Selected item from search:", item1);
    console.log("num_prime from search:", item1.num_prime);

    console.log("this.codeField")
    const request = {
      codSoc: '01',
      matPers: item1.mat_pers
    }
    console.log("this.codeField", item1)
    this.codTypDepartVal = item1.cod_typ_depart;
    this.codAffectVal = item1.cod_affect;
    this.codMatVal = item1.mat_pers;
    this.formAdherent.patchValue({
      cod_soc: item1.cod_soc,
      mat_pers: item1.mat_pers,
      cod_assur: item1.cod_assur,
      nom_pers: item1.nom_pers,
      sexe: item1.sexe,
      cin: item1.cin,
      dat_nais: item1.dat_nais,
      pren_pers: item1.pren_pers,
      dat_emb: item1.dat_emb,
      cod_sit: item1.cod_sit,
      nbr_enf: item1.nbr_enf,
      cod_retr: item1.cod_retr,
      num_retr: item1.num_retr,
      num_assur: item1.num_assur,
      dat_ass: item1.dat_ass,
      cod_pay: item1.cod_pay,
      rib: item1.rib,
      nom_pers_a: item1.nom_pers_a,
      pren_pers_a: item1.pren_pers_a,
      cod_natp: item1.cod_natp,
      cod_banq: item1.cod_banq,
      cod_agc: item1.cod_agc,
      dat_dece: item1.dat_dece,
      etat_act: item1.etat_act,
      dat_motif: item1.dat_motif,
      cod_lieu_geog: item1.cod_lieu_geog,
      bas_plafond: item1.bas_plafond,
      nom_jf: item1.nom_jf,
      nom_jf_a: item1.nom_jf_a,
      photo_pers: item1.photo_pers,
      lieu_nais: item1.lieu_nais,
      mnt_param: item1.mnt_param,
      etat_prof: item1.etat_prof,
      dat_aff_cnam: item1.dat_aff_cnam,
      corps: item1.corps,
      cod_affect: item1.cod_affect,
      dat_affect: item1.dat_affect,
      cod_typ_depart: item1.cod_typ_depart,
      dat_depart: item1.dat_depart,
      typ_aff: item1.typ_aff,
      cod_user: item1.cod_user,
      dat_maj: item1.dat_maj,
      mat_int: item1.mat_int,
      pers_carte: item1.pers_carte,
    });
    this.formPrimeMutPersForm.patchValue({
      cod_soc: item1.cod_soc,
      mat_pers: item1.mat_pers,
      num_prime: item1.num_prime,
      typ_prime: item1.typ_prime,
      dat_deb: item1.dat_deb,
      dat_fin: item1.dat_fin,
      mnt_a_payer: Number(item1.mnt_a_payer).toFixed(3),
      mnt_payer: Number(item1.mnt_payer).toFixed(3),
      mod_pay: item1.mod_pay,
      ref_pay: item1.ref_pay,
      dat_saisie: item1.dat_saisie,
      etat_prime: item1.etat_prime,
      corps: item1.corps,
      cod_typ_depart: item1.cod_typ_depart,
      cod_affect: item1.cod_affect,
      mnt_param: item1.mnt_param,
      num_retr: item1.num_retr,
      seq_ecrt1: item1.seq_ecrt1,
      seq_ecrt2: item1.seq_ecrt2,
      imput: item1.imput,

    })

    // DISABLE BOTH FORMS AFTER PATCHING VALUES (same as saisie-cotis)
    this.formAdherent.disable();
    this.formPrimeMutPersForm.disable();

    console.log("Form Adherent values:", this.formAdherent.value);
    console.log("Form Prime values:", this.formPrimeMutPersForm.value);
  }

  onSelectedValue(item: any) {
    console.log("this.codeField", item)
    this.codTypDepartVal = item.cod_typ_depart;
    this.codAffectVal = item.cod_affect;
    this.codMatVal = item.mat_pers;
    this.libAffect = item.libAffect
    this.libTypDepart = item.libDepart
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
    this.formPrimeMutPersForm.patchValue({
      mat_pers: item.mat_pers
    })

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
    console.log("=== onSubmit() STARTED ===");

    const matPers = this.formAdherent.get("mat_pers")?.value;
    const codSoc = this.formAdherent.get("cod_soc")?.value;
    const corps = this.formAdherent.get("corps")?.value;
    const codAffect = this.formAdherent.get("cod_affect")?.value;
    const numRetr = this.formAdherent.get("num_retr")?.value;
    const mntParam = this.formAdherent.get("mnt_param")?.value;
    const typDept = this.formAdherent.get("cod_typ_depart")?.value;

    console.log("Form Adherent values:", {
      matPers, codSoc, corps, codAffect, numRetr, mntParam, typDept
    });

    const datSaisie = this.getCurrentDate();
    console.log("datSaisie:", datSaisie);

    const formatDates = (form: any, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value);
        form.get(field)?.setValue(value);
        formatted.push(value);
        return formatted;
      }, []);

    const demConv = formatDates(this.formPrimeMutPersForm, [
      "dat_deb",
      "dat_fin",
    ]);
    console.log("Formatted dates:", demConv);

    this.formPrimeMutPersForm.get("mat_pers")?.setValue(matPers);
    this.formPrimeMutPersForm.get("cod_soc")?.setValue(codSoc);
    this.formPrimeMutPersForm.get("corps")?.setValue(corps);
    this.formPrimeMutPersForm.get("cod_affect")?.setValue(codAffect);
    this.formPrimeMutPersForm.get("num_retr")?.setValue(numRetr);
    this.formPrimeMutPersForm.get("mnt_param")?.setValue(mntParam);
    this.formPrimeMutPersForm.get("dat_saisie")?.setValue(datSaisie);
    this.formPrimeMutPersForm.get("cod_typ_depart")?.setValue(typDept);
    this.formPrimeMutPersForm.get("typ_prime")?.setValue("M");
    this.formPrimeMutPersForm.get("etat_prime")?.setValue('V');

    console.log("Form Prime Mut Pers values after patching:", this.formPrimeMutPersForm.value);

    // 1) Essayer de récupérer un num_prime existant (cas validation d'une prime déjà créée)
    let numPrimeValue = this.formPrimeMutPersForm.get("num_prime")?.value || this.numPrime;

    console.log("Resolved num_prime value before decision:", numPrimeValue);
    console.log("this.numPrime backup value:", this.numPrime);

    // 2) Si aucun num_prime n'existe, on crée une nouvelle prime (même logique que saisie-cotis)
    if (!numPrimeValue) {
      console.log("No existing num_prime found. Creating a new prime before validation.");

      this.servRetr.getMaxNum(this.token.getUser().codSoc, matPers).subscribe({
        next: (num: any) => {
          numPrimeValue = num;
          console.log("Generated num_prime from getMaxNum:", numPrimeValue);

          this.formPrimeMutPersForm.patchValue({
            num_prime: numPrimeValue,
            etat_prime: 'V',
            typ_prime: this.formPrimeMutPersForm.get('typ_prime')?.value || 'M',
          });

          console.log("Prime form before addPrime (creation branch):", this.formPrimeMutPersForm.getRawValue());

          this.servRetr.addPrime(this.formPrimeMutPersForm.getRawValue()).subscribe({
            next: () => {
              console.log("addPrime SUCCESS, calling majLigCotisationRetr (creation branch)");

              this.servRetr.majLigCotisationRetr(
                this.token.getUser().codSoc,
                matPers,
                numPrimeValue,
                this.formPrimeMutPersForm.get('dat_deb')?.value,
                this.formPrimeMutPersForm.get('dat_fin')?.value,
                this.formPrimeMutPersForm.get('mnt_payer')?.value,
              ).subscribe({
                next: (data: any) => {
                  console.log("majLigCotisationRetr SUCCESS (creation branch)", data);
                  Swal.fire({
                    icon: 'success',
                    title: 'Succés',
                    text: 'Cotisation enregistrée et validée avec succés',
                    showCancelButton: false,
                  });
                },
                error: (error) => {
                  console.error("majLigCotisationRetr ERROR (creation branch)", error);
                  Swal.fire('Erreur', 'La mise à jour des cotisations a échoué', 'error');
                },
              });
            },
            error: (err) => {
              console.error("addPrime ERROR (creation branch)", err);
              Swal.fire('Erreur', 'La création de la prime a échoué', 'error');
            },
          });
        },
        error: (err) => {
          console.error("getMaxNum ERROR (creation branch)", err);
          Swal.fire('Erreur', 'Impossible de générer le numéro de cotisation', 'error');
        },
      });

    } else {
      // 3) Si un num_prime existe déjà, on se contente de valider la prime existante
      console.log("Existing num_prime found, validating existing prime:", numPrimeValue);

      const body = {
        cod_soc: this.formPrimeMutPersForm.get("cod_soc")?.value,
        mat_pers: this.formPrimeMutPersForm.get("mat_pers")?.value,
        num_prime: numPrimeValue,
        etat_prime: 'V',
      };
      console.log("Body to be sent:", body);

      console.log("=== Calling updateEtatPrime ===");
      this.servRetr
        .updateEtatPrime(
          this.formPrimeMutPersForm.get('cod_soc')?.value,
          this.formPrimeMutPersForm.get('mat_pers')?.value,
          numPrimeValue,
          'V',
        )
        .subscribe({
          next: () => {
            console.log("=== updateEtatPrime SUCCESS ===");
            console.log("Calling majLigCotisationRetr with:", {
              codSoc: this.token.getUser().codSoc,
              matPers: matPers,
              numPrime: numPrimeValue,
              datDeb: this.formPrimeMutPersForm.get('dat_deb')?.value,
              datFin: this.formPrimeMutPersForm.get('dat_fin')?.value,
              mntPayer: this.formPrimeMutPersForm.get('mnt_payer')?.value,
            });

            this.servRetr.majLigCotisationRetr(
              this.token.getUser().codSoc,
              matPers,
              numPrimeValue,
              this.formPrimeMutPersForm.get('dat_deb')?.value,
              this.formPrimeMutPersForm.get('dat_fin')?.value,
              this.formPrimeMutPersForm.get('mnt_payer')?.value,
            ).subscribe({
              next: (data: any) => {
                console.log("=== majLigCotisationRetr SUCCESS ===", data);
                Swal.fire({
                  icon: 'success',
                  title: 'Succés',
                  text: 'Cotisation validée avec succés',
                  showCancelButton: false,
                });
              },
              error: (error) => {
                console.error("=== majLigCotisationRetr ERROR ===", error);
                Swal.fire('Erreur', 'La mise à jour des cotisations a échoué', 'error');
              },
            });
          },
          error: (err) => {
            console.error("=== updateEtatPrime ERROR ===", err);
            Swal.fire('Erreur', 'La mise à jour a échoué', 'error');
          },
        });
    }

    console.log("=== onSubmit() ENDED ===");
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
  verifDateDeb(event: any) {
    const formatDates = (form: any, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value);
        form.get(field)?.setValue(value);
        formatted.push(value);
        return formatted;
      }, []);

    const demConv = formatDates(this.formPrimeMutPersForm, [
      "dat_deb",
      "dat_fin",
    ]);
    const datDebValue = this.formPrimeMutPersForm.get('dat_deb')?.value;
    const datFinValue = this.formPrimeMutPersForm.get('dat_fin')?.value;

    if (datDebValue && datFinValue) {
      this.servRetr.verifLigCotisation(this.token.getUser().codSoc, this.formPrimeMutPersForm.get('mat_pers')?.value,
        datDebValue, datFinValue).subscribe((data: any) => {
          Swal.fire({
            icon: 'success',
            title: data,
            text: data,
            showCancelButton: false
          });
        })

    }
  }

  verifDateFin(event: any) {
    const formatDates = (form: any, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value);
        form.get(field)?.setValue(value);
        formatted.push(value);
        return formatted;
      }, []);

    const demConv = formatDates(this.formPrimeMutPersForm, [
      "dat_deb",
      "dat_fin",
    ]);
    const datDebValue = this.formPrimeMutPersForm.get('dat_deb')?.value;
    const datFinValue = this.formPrimeMutPersForm.get('dat_fin')?.value;

    if (datDebValue && datFinValue) {
      const datDeb = new Date(datDebValue);
      const datFin = new Date(datFinValue);


      if (datDeb > datFin) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'La date de fin doit être supérieure ou égale à la date de début.',
          confirmButtonText: 'OK'
        });
        this.formPrimeMutPersForm.get('dat_fin')?.reset();
        return;
      }

      this.servRetr.verifLigCotisation(
        this.token.getUser().codSoc,
        this.formPrimeMutPersForm.get('mat_pers')?.value,
        datDebValue,
        datFinValue
      ).subscribe((data: any) => {
        if (data.message) {
          Swal.fire({
            icon: 'warning',
            title: data.message,
            text: data.message,
            showCancelButton: false
          });
          this.formPrimeMutPersForm.get('dat_deb')?.reset()
          this.formPrimeMutPersForm.get('dat_fin')?.reset()
          this.formPrimeMutPersForm.get('mnt_a_payer')?.reset()
          this.formPrimeMutPersForm.get('mnt_payer')?.reset()
        }
      });

      this.servRetr.calculCotisation(
        this.token.getUser().codSoc,
        this.formPrimeMutPersForm.get('mat_pers')?.value,
        datDebValue,
        datFinValue,
        0
      ).subscribe((data: any) => {
        this.formPrimeMutPersForm.patchValue({
          mnt_a_payer: Number(data.cot).toFixed(3),
          mnt_payer: Number(data.cot).toFixed(3),
        })
      });
    }
  }



  private parseDate(dateStr: string): Date {
    // Si la date est au format 'dd/MM/yyyy'
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // mois commence à 0
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    // Sinon on tente un new Date classique
    return new Date(dateStr);
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


  fetchLigCotis(soc: any, matPers: any, num: any, dat1: any, dat2: any): void {
    this.servRetr.getAllLigByMat(soc, matPers, num, dat1, dat2).subscribe({
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




  currentIndex: number = 0;

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
    this.currentIndex = this.listPersByMat.length - 1;
    console.log("this.currentIndex", this.currentIndex)
    this.loadData(this.currentIndex);

  }

  loadData(index: number): void {

    const item1 = this.listPersByMat[index];

    /* // Apply the mask to specific fields before patching the form
    const formattedData = {
      ...currentData,
      prt_mnt_dem: this.updateFormattedAmount(currentData.prt_mnt_dem),
      prt_mnt_glb: this.updateFormattedAmount(currentData.prt_mnt_glb),
      prt_mnt_rem: this.updateFormattedAmount(currentData.prt_mnt_rem),
      prt_rendu :this.updateFormattedAmount(currentData.prt_rendu),
    }; */
    console.log("=== loadData CALLED ===");
    console.log("currentData :", item1, '01', item1.mat_pers, item1.num_prime, item1.dat_deb, item1.dat_fin)
    console.log("num_prime in loadData:", item1.num_prime);
    this.fetchLigCotis('01', item1.mat_pers, item1.num_prime, item1.dat_deb, item1.dat_fin)


    this.formPrimeMutPersForm.patchValue({
      cod_soc: item1.cod_soc,
      mat_pers: item1.mat_pers,
      num_prime: item1.num_prime,
      typ_prime: item1.typ_prime,
      dat_deb: item1.dat_deb,
      dat_fin: item1.dat_fin,
      mnt_a_payer: Number(item1.mnt_a_payer).toFixed(3),
      mnt_payer: Number(item1.mnt_payer).toFixed(3),
      mod_pay: item1.mod_pay,
      ref_pay: item1.ref_pay,
      dat_saisie: item1.dat_saisie,
      etat_prime: item1.etat_prime,
      corps: item1.corps,
      cod_typ_depart: item1.cod_typ_depart,
      cod_affect: item1.cod_affect,
      mnt_param: item1.mnt_param,
      num_retr: item1.num_retr,
      seq_ecrt1: item1.seq_ecrt1,
      seq_ecrt2: item1.seq_ecrt2,
      imput: item1.imput,

    })
  }
  listPersByMat: any[] = []
  getAllByMat(mat: any) {
    this.servRetr.getAllByMat(mat).subscribe((data: any) => {
      this.listPersByMat = data
      console.log("lis by mat ", data)

    })
  }
}

