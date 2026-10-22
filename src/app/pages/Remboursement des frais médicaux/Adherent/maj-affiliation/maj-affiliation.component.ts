import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
//import { CaisseRetrService } from 'src/app/pages/CaisseRetraite/caisse-retr.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { AdherentService } from '../adherent.service';

@Component({
  selector: 'app-maj-affiliation',
  templateUrl: './maj-affiliation.component.html',
  styleUrl: './maj-affiliation.component.scss'
})
export class MajAffiliationComponent {
  pSusp2: any
  listPersonnel: any[] = []
  columnPersonnels: any[] = []
  listRemb: any[] = []
  columnRemb: any[] = []
  listPersAffil: any[] = []
  listFamille: any[] = []
  columnFamille: any[] = []
  listPrimeRetr: any[] = []
  columnsPrimeRetr: any[] = []
  listFil: any[] = []
  columnFil: any[] = []
  listRefEtablis: any[] = []
  columnRefEtablis: any[] = []
  nomPren: String = ''
  matPersVal: String = ''
  numVir: String = ''
  numRetr: String = ''
  libRemb: String = ''
  codRemb: String = ''
  numFam: String = ''
  libNomFam: String = ''
  codFil: String = ''
  libFill: String = ''
  prfCod: String = ''
  libRef: String = ''
  formPersonnel: FormGroup
  formAffilPers: FormGroup
  isDisabled!: boolean;
  isSearch: boolean = true;
  listVir: any[] = []
  columnsVir: any[] = []
  edit: boolean = true
  editCarteIndex: any
  columnTitles2: { [key: string]: string } = {
    num_fam: "Num fam",
    nom_benef: "Nom Benef",
    montant_benef: "Montant Benef",
    num_cheq: "Numéro chéque",
  };

  constructor(
    //private serv: CaisseRetrService,
    private adherentServ: AdherentService,
    private token: TokenStorageService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private saveService: SaveService
  ) {
    this.formPersonnel = this.fb.group({
      cod_soc: [''],
      mat_pers: [''],
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
    })

    this.formAffilPers = this.fb.group({
      affil: this.fb.array([
        this.fb.group({
          cod_soc: [''],
          mat_pers: [''],
          cod_fil: [''],
          courant: [''],
          annee_aff: [''],
          prf_typ: [''],
          prf_cod: [''],
        }),
      ]),
    });
  }

  ngOnInit() {
    // Set initial button states - Save enabled, Delete/Search as needed
    this.saveService.setDisabled(true); // ALWAYS enable save button
    this.saveService.setDisabledDelete(true); // Delete disabled by default
    this.saveService.setIsDisabledSearch(false); // Search enabled

    // Register save callback
    this.saveService.registerSaveCallback(() => this.savePersAffil())

    // Handle search trigger
    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch = true
      console.log("is search valid", canSearch)
    })

    // Load initial data
    this.getPersonnels()
    //this.getRemb()
    //this.getPrimeRetr()
  }

  ngOnDestroy() {
    // Clear the callback to avoid memory leaks
    this.saveService.clearSaveCallback();
    // Reset button states
    this.saveService.setDisabled(true)
    this.saveService.setDisabledDelete(true)
  }

  /*getPrimeRetr() {
    this.serv.getPrimeRetr().subscribe((data) => {
      this.listPrimeRetr = data
      console.log("this.listPrimeRetr", this.listPrimeRetr)
      this.columnsPrimeRetr = [
        { key: "mat_pers", label: "Matricule" },
        { key: "nom", label: "Nom & Prénom" },
        { key: "num_retr", label: "Num Retr" },
      ];
    })
  }
    
  getRemb() {
    this.serv.getMotifRembour().subscribe(data => {
      this.listRemb = data
      this.columnRemb = [
        { key: "cod_remb", label: "Code" },
        { key: "lib_remb", label: "Libelle" },
      ];
    })
  }
  */

  getPersonnels() {
    this.adherentServ.GetAllPers().subscribe(data => {
      this.listPersonnel = data
      this.columnPersonnels = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "num_retr", label: "Num Retr" },
        { key: "nom_pers", label: "Nom " },
        { key: "pren_pers", label: "Prénom " },
      ];
    })
  }

  

  formatDate(dateString: any): string {
    if (dateString && dateString.length === 8) {
      const day = dateString.substring(0, 2);
      const month = dateString.substring(2, 4);
      const year = dateString.substring(4, 8);
      return `${day}/${month}/${year}`;
    }
    return dateString;
  }

  onSelectedValueFil(item: any) {
    const enfantsArray = this.formAffilPers.get('affil') as FormArray;
    const selectedFormGroup = enfantsArray.at(0) as FormGroup;

    if (selectedFormGroup) {
      this.adherentServ.getRefEtablis().subscribe((data: any) => {
        this.listRefEtablis = data
        this.columnRefEtablis = [
          { key: "prf_cod", label: "Code" },
          { key: "nom", label: "Nom" }
        ]
      })

      if (selectedFormGroup.get('cod_fil')) {
        selectedFormGroup.patchValue({
          cod_fil: item.cod_fil,
        });
        this.libFill = item.lib_fill
        console.log("selectedFormGroup", selectedFormGroup);
        console.log(`Patched values: num_fam = ${item.cod_fil}, libNom = ${item.nom_pren}`);
      } else {
        console.error(`num_fam control is missing in the FormGroup at index `);
      }
    } else {
      console.error(`FormGroup is missing at index `);
    }
  }

  search(item: any) {
    console.log("item :", item);
    this.matPersVal = item.mat_pers
    this.codRemb = item.cod_remb

    this.formPersonnel.patchValue({
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

    this.adherentServ.getPersAffil(item.cod_soc, item.mat_pers).subscribe((data) => {
      this.listPersAffil = data
      console.log("this.listBenef", this.listPersAffil)
    })

    this.adherentServ.getRefFilliere().subscribe((data) => {
      this.listFil = data
      this.columnFil = [
        { key: "cod_fil", label: "Code" },
        { key: "lib_fill", label: "Libelle" },
      ];
    })
  }

  onSelectRefEtablis(item: any) {
    console.log("item :", item);
    this.libRef = item.nom
    this.formAffilPers.patchValue({
      prf_typ: item.prf_typ,
      prf_cod: item.prf_cod,
    });
  }

  // Filtres par colonne (loupe de chaque en-tête)
  showFilters: { [key: string]: boolean } = {};
  searchz: { [key: string]: string } = {};
  toggleFilter(key: string) {
    this.showFilters[key] = !this.showFilters[key];
    if (!this.showFilters[key]) this.searchz[key] = '';
  }
  filterRows(list: any[]): any[] {
    const keys = Object.keys(this.searchz).filter(k => this.searchz[k]);
    if (!keys.length) return list || [];
    return (list || []).filter(row =>
      keys.every(k => {
        let v = row[k];
        if (k === 'courant') v = v === 'O' ? 'Oui' : 'Non';
        return String(v ?? '').toLowerCase().includes(this.searchz[k].toLowerCase());
      })
    );
  }

  openModalTab(content: any) {
    this.edit = true;
    this.editCarteIndex = null
    this.modalService.open(content, { size: "xl", centered: true });
  }

  get affil(): FormArray {
    return this.formAffilPers.get("affil") as FormArray;
  }

  addAffil() {
    this.affil.push(
      this.fb.group({
        cod_soc: [''],
        mat_pers: [''],
        cod_fil: [''],
        courant: [''],
        annee_aff: [''],
        prf_typ: [''],
        prf_cod: [''],
      })
    );
  }

  removeAffil(index: number) {
    this.affil.removeAt(index);
  }

  validateAffil(): void {
    const carteArray = this.formAffilPers.get('affil') as FormArray;

    if (carteArray && carteArray.valid) {
      carteArray.controls.forEach((formGroup: AbstractControl) => {
        if (formGroup instanceof FormGroup) {
          formGroup.get('mat_pers')?.patchValue(this.formPersonnel.get('mat_pers')?.value)
          formGroup.get('cod_soc')?.patchValue(this.token.getUser().codSoc)
        }

        if (this.editCarteIndex !== null) {
          this.listPersAffil[this.editCarteIndex] = formGroup.value;
        }
      });

      if (this.editCarteIndex === null) {
        if (!this.listPersAffil) {
          this.listPersAffil = [];
        }
        this.listPersAffil.push(...carteArray.value);
      }

      this.editCarteIndex = null;
      console.log("this.formCarteSoin :", this.listPersAffil);
    }
  }

  savePersAffil() {
    const carteArray = this.formAffilPers.get('affil') as FormArray;

    carteArray.controls.forEach((formGroup: AbstractControl) => {
      if (formGroup instanceof FormGroup) {
        formGroup.get('mat_pers')?.patchValue(this.formPersonnel.get('mat_pers')?.value)
        formGroup.get('cod_soc')?.patchValue(this.token.getUser().codSoc)
      }
    });

    console.log("benefFormArray.value", carteArray.value)

    this.adherentServ.addPersAffil(carteArray.value).subscribe({
      next: (data) => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouté avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });

        this.adherentServ.getPersAffil(
          this.token.getUser().codSoc,
          this.formPersonnel.get('mat_pers')?.value
        ).subscribe((data: any) => {
          this.listPersAffil = data
        })
      },
      error: (error) => {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur est survenue lors de l'enregistrement",
        });
        console.error("Error saving affiliation:", error);
      }
    })
  }

  editDataGet(id: any, data: any, content: any) {
    console.log(data)
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });

    (this.formAffilPers.get("affil") as FormArray).controls[0]
      .get("cod_soc")?.patchValue(data.cod_soc);
    (this.formAffilPers.get("affil") as FormArray).controls[0]
      .get("mat_pers")?.patchValue(data.mat_pers);
    (this.formAffilPers.get("affil") as FormArray).controls[0]
      .get("cod_fil")?.patchValue(data.cod_fil);
    (this.formAffilPers.get("affil") as FormArray).controls[0]
      .get("courant")?.patchValue(data.courant);
    (this.formAffilPers.get("affil") as FormArray).controls[0]
      .get("annee_aff")?.patchValue(data.annee_aff);
    (this.formAffilPers.get("affil") as FormArray).controls[0]
      .get("prf_typ")?.patchValue(data.prf_typ);
    (this.formAffilPers.get("affil") as FormArray).controls[0]
      .get("prf_cod")?.patchValue(data.prf_cod);

    console.log("data.cod_fil", data.cod_fil)
    this.codFil = data.cod_fil
  }
}