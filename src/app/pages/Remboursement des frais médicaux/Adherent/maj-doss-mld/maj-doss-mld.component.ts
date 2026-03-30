import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { CaisseRetrService } from 'src/app/pages/CaisseRetraite/caisse-retr.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { AdherentService } from '../adherent.service';

@Component({
  selector: 'app-maj-doss-mld',
  templateUrl: './maj-doss-mld.component.html',
  styleUrl: './maj-doss-mld.component.scss'
})
export class MajDossMldComponent {
  pSusp2: any
  listPersonnel: any[] = []
  columnPersonnels: any[] = []
  listRemb: any[] = []
  columnRemb: any[] = []
  listDossierMld: any[] = []
  listFamille: any[] = []
  columnFamille: any[] = []
  listPrimeRetr: any[] = []
  columnsPrimeRetr: any[] = []
  listMaladie: any[] = []
  columnMaladie: any[] = []
  listRefEtablis: any[] = []
  columnRefEtablis: any[] = []
  nomPren: String = ''
  matPersVal: String = ''
  numVir: String = ''
  numRetr: String = ''
  libAssur: String = ''
  numFam: String = ''
  libNomFam: String = ''
  libMalad: String = ''
  nom: String = ''
  libRef: String = ''
  formPersonnel: FormGroup
  formDossMalad: FormGroup
  isDisabled!: boolean;
  isSearch: boolean = true;
  listVir: any[] = []
  columnsVir: any[] = []
  edit: boolean = true
  editCarteIndex: any
  columnTitles2: { [key: string]: string } = {
    cod_malad: "Maladie",
    libMalad: "Libelle",
    num_fam: "Num Fam",
    nom: "Nom",
    dat_doss_mld: "Date dossier",
    etat: "Etat"
  };
  constructor(private serv: CaisseRetrService, private adherentServ: AdherentService, private token: TokenStorageService, private fb: FormBuilder,
    private modalService: NgbModal, private saveService: SaveService) {
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

    this.formDossMalad = this.fb.group({
      doss: this.fb.array([
        this.fb.group({
          cod_soc: [''],
          mat_pers: [''],
          num_dos_mld: [''],
          cod_malad: [''],
          dat_doss_mld: [''],
          etat_dos_mld: [''],
          num_fam: [''],



        }),
      ]),
    });
  }

  ngOnInit() {

    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch = true
      console.log("is search valid", canSearch)

    })
    this.getPersonnels()
    this.getRemb()
    this.getPrimeRetr()

    //this.getAllVirAnticip()
  }

  ngOnDestroy() {
    // Clear the callback to avoid memory leaks
    this.saveService.clearSaveCallback();
    this.saveService.setCanSave(false)
  }


  getPrimeRetr() {
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

  getPersonnels() {
    this.adherentServ.getPersActif().subscribe(data => {
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

  getRemb() {
    this.serv.getMotifRembour().subscribe(data => {
      this.listRemb = data

      this.columnRemb = [
        { key: "cod_remb", label: "Code" },
        { key: "lib_remb", label: "Libelle" },
      ];
    })
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



  onSelectedValueMalad(item: any) {
    const enfantsArray = this.formDossMalad.get('doss') as FormArray;

    const selectedFormGroup = enfantsArray.at(0) as FormGroup;


    if (selectedFormGroup) {

      if (selectedFormGroup.get('cod_malad')) {
        selectedFormGroup.patchValue({
          cod_malad: item.cod_malad,
        });
        this.libMalad = item.lib_malad

        console.log("selectedFormGroup", selectedFormGroup);

        console.log(`Patched values: num_fam = ${item.cod_fil}, libNom = ${item.nom_pren}`);
      } else {
        console.error(`num_fam control is missing in the FormGroup at index `);
      }
    } else {
      console.error(`FormGroup is missing at index `);
    }

  }
  onSelectedValueFamille(item: any) {
    const enfantsArray = this.formDossMalad.get('doss') as FormArray;

    const selectedFormGroup = enfantsArray.at(0) as FormGroup;


    if (selectedFormGroup) {

      if (selectedFormGroup.get('num_fam')) {
        selectedFormGroup.patchValue({
          num_fam: item.num_fam,
        });
        this.nom = item.nom_PREN

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
    this.libAssur = item.lib_assur
    this.adherentServ.getDossierMld(item.mat_pers).subscribe((data) => {

      this.listDossierMld = data
      console.log("this.listDossierMld", this.listDossierMld)
    })
    this.adherentServ.getMaladie().subscribe((data) => {

      this.listMaladie = data
      this.columnMaladie = [
        { key: "cod_malad", label: "Code" },
        { key: "lib_malad", label: "Libelle" },
      ];
    })

    this.adherentServ.getListAdherentDossMld(item.cod_soc, item.mat_pers).subscribe((data) => {

      this.listFamille = data
      this.columnFamille = [
        { key: "num_fam", label: "Num fam" },
        { key: "nom_PREN", label: "Nom" },
      ];
    })
  }

  // onSelectRefEtablis(item: any) {
  //   console.log("item :", item);
  //   this.libRef = item.nom
  //   this.formDossMalad.patchValue({
  //     prf_typ: item.prf_typ,
  //     prf_cod: item.prf_cod,
  //   });

  // }

  openModalTab(content: any) {
    this.edit = true;
    this.editCarteIndex = null

    //this.formCertif.reset()
    this.modalService.open(content, { size: "xl", centered: true });
  }

  get doss(): FormArray {
    return this.formDossMalad.get("doss") as FormArray;
  }
  addDoss() {
    this.doss.push(
      this.fb.group({
        cod_soc: [''],
        mat_pers: [''],
        num_dos_mld: [''],
        cod_malad: [''],
        dat_doss_mld: [''],
        etat_dos_mld: [''],
        num_fam: [''],
      })
    );
  }
  removeDoss(index: number) {
    this.doss.removeAt(index);
  }


  saveDossAPCI() {
    const formatDates = (form: any, fields: string[]): void => {
      fields.forEach((field) => {
        const value = this.formatDate(form.get(field)?.value);
        if (value) {
          form.get(field)?.setValue(value);
        }
      });
    };

    // Format date in main form
    formatDates(this.formDossMalad, ["dat_doss_mld"]);

    // Get FormArray
    const carteArray = this.formDossMalad.get('doss') as FormArray;

    // Format and patch each FormGroup
    carteArray.controls.forEach((formGroup: AbstractControl) => {
      if (formGroup instanceof FormGroup) {
        formGroup.get('mat_pers')?.patchValue(this.formPersonnel.get('mat_pers')?.value);
        formGroup.get('cod_soc')?.patchValue(this.token.getUser()?.codSoc);
        formatDates(formGroup, ["dat_doss_mld"]);
      }
    });

    const matPers = this.formPersonnel.get('mat_pers')?.value;
    const codSoc = this.token.getUser()?.codSoc;

    if (!matPers || !codSoc) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Informations manquantes pour l'enregistrement.",
      });
      return;
    }
    if (this.edit) {
      this.adherentServ.getNumDoss(codSoc, matPers).subscribe((numDoss: any) => {
        // Inject num_dos_mld in each form group
        carteArray.controls.forEach((control: AbstractControl) => {
          if (control instanceof FormGroup) {
            control.patchValue({ num_dos_mld: numDoss });
          }
        });

        const payload = carteArray.value;
        console.log("benefFormArray.value", payload);

        this.adherentServ.addDossMld(payload).subscribe(() => {
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Ajouté avec succès !",
            showConfirmButton: false,
            timer: 2000,
          });

          this.adherentServ.getDossierMld(matPers).subscribe((data: any) => {
            this.listDossierMld = data;
          });
        });
      });
    } else {
      const payload = carteArray.value;
      this.adherentServ.addDossMld(payload).subscribe(() => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouté avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });

        this.adherentServ.getDossierMld(matPers).subscribe((data: any) => {
          this.listDossierMld = data;
        });
      });
    }

  }


  editDataGet(id: any, data: any, content: any) {
    console.log(data)
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });

    (this.formDossMalad.get("doss") as FormArray).controls[0]
      .get("cod_soc")
      ?.patchValue(data.cod_soc),
      (this.formDossMalad.get("doss") as FormArray).controls[0]
        .get("mat_pers")
        ?.patchValue(data.mat_pers),
      (this.formDossMalad.get("doss") as FormArray).controls[0]
        .get("num_dos_mld")
        ?.patchValue(data.num_dos_mld),
      (this.formDossMalad.get("doss") as FormArray).controls[0]
        .get("cod_malad")
        ?.patchValue(data.cod_malad),
      (this.formDossMalad.get("doss") as FormArray).controls[0]
        .get("dat_doss_mld")
        ?.patchValue(data.dat_doss_mld),
      (this.formDossMalad.get("doss") as FormArray).controls[0]
        .get("etat_dos_mld")
        ?.patchValue(data.etat_dos_mld),
      (this.formDossMalad.get("doss") as FormArray).controls[0]
        .get("num_fam")
        ?.patchValue(data.num_fam)

  }
}


