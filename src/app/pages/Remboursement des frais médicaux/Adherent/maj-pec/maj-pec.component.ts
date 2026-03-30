import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { CaisseRetrService } from 'src/app/pages/CaisseRetraite/caisse-retr.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { AdherentService } from '../adherent.service';
import { BulletinSoinService } from '../../Bulletin de soins/bulletin-soin.service';

@Component({
  selector: 'app-maj-pec',
  templateUrl: './maj-pec.component.html',
  styleUrl: './maj-pec.component.scss'
})
export class MajPecComponent {
  pSusp2: any
  listPersonnel: any[] = []
  columnPersonnels: any[] = []
  listRemb: any[] = []
  columnRemb: any[] = []
  listPriseCharge: any[] = []
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
  nom: string[] = []
  libRef: String = ''
  formPersonnel: FormGroup
  formPriseCharge: FormGroup
  isDisabled!: boolean;
  isSearch: boolean = true;
  listVir: any[] = []
  columnsVir: any[] = []
  edit: boolean = true
  editCarteIndex: any
  columnTitles2: { [key: string]: string } = {
    num_pec: "Num pec",
    dat_pec: "Date pec",
    num_fam: "Num Fam",
    nom: "Nom",
    typ_etablis: "Type établis",
    prf_cod: "Code",
    nomEtab: 'Etablissement',
    dat_eff: 'Date eff',
    etat_pec: 'Etat pec',
  };
  constructor(private serv: CaisseRetrService, private adherentServ: AdherentService, private token: TokenStorageService, private fb: FormBuilder,
    private modalService: NgbModal, private saveService: SaveService, private servBult: BulletinSoinService) {
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

    this.formPriseCharge = this.fb.group({
      charge: this.fb.array([
        this.fb.group({
          cod_soc: [''],
          mat_pers: [''],
          num_pec: [''],
          dat_pec: [''],
          num_fam: [''],
          etat_pec: [''],
          prf_typ: [''],
          prf_cod: [''],
          mnt_pec: [''],
          mnt_remb: [''],
          dat_eff: [''],

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
    const enfantsArray = this.formPriseCharge.get('doss') as FormArray;

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
    this.adherentServ.getPriseCharge(item.cod_soc, item.mat_pers).subscribe((data) => {

      this.listPriseCharge = data
      console.log("this.listPriseCharge", this.listPriseCharge)
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
  OnselectRefTyp(event: any) {
    this.servBult.getRefPhysique(event.target.value).subscribe((data: any) => {
      this.listRefEtablis = data

      this.columnRefEtablis = [
        { key: "prf_cod", label: "Code" },
        { key: "etab_rsoc", label: "Nom & Prénom" },
        { key: "met_etab", label: "Etablis" },

      ];
    })
  }
  etab_rsoc: string[] = []
  onSelectedEtablis(selectedValue: any, index: number): void {


    const selectedActe = this.listRefEtablis.find(etablis => etablis.etab_rsoc === selectedValue.etab_rsoc);
    this.etab_rsoc[index] = selectedActe.etab_rsoc
    this.charge.at(index).patchValue({ prf_cod: selectedValue.prf_cod });
  }
  openModalTab(content: any) {
    this.edit = true;
    this.editCarteIndex = null

    //this.formCertif.reset()
    this.modalService.open(content, { size: "xl", centered: true });
  }

  onSelectedValueFamille(item: any, index: number) {
    console.log('item', item);
    const selectedActe = this.listFamille.find(etablis => etablis.num_fam === item.num_fam);
    console.log('selectedActe', selectedActe);
    this.nom[index] = selectedActe.nom_PREN
    this.charge.at(index).patchValue({ num_fam: item.num_fam });

  }

  get charge(): FormArray {
    return this.formPriseCharge.get("charge") as FormArray;
  }
  addDoss() {
    this.charge.push(
      this.fb.group({
        cod_soc: [''],
        mat_pers: [''],
        num_pec: [''],
        dat_pec: [''],
        num_fam: [''],
        etat_pec: [''],
        prf_typ: [''],
        prf_cod: [''],
        mnt_pec: [''],
        mnt_remb: [''],
        dat_eff: [''],

      })
    );
  }
  removeDoss(index: number) {
    this.charge.removeAt(index);
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

    formatDates(this.formPriseCharge, ["dat_pec", "dat_eff"]);
    const carteArray = this.formPriseCharge.get('charge') as FormArray;

    carteArray.controls.forEach((formGroup: AbstractControl) => {
      if (formGroup instanceof FormGroup) {
        formGroup.get('mat_pers')?.patchValue(this.formPersonnel.get('mat_pers')?.value);
        formGroup.get('cod_soc')?.patchValue(this.token.getUser()?.codSoc);
        formatDates(formGroup, ["dat_pec", "dat_eff"]);
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

    const payload = carteArray.value;
    console.log("payload :", payload)
    this.adherentServ.addPriseCharge(payload).subscribe((data: any) => {
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouté avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });

      this.adherentServ.getPriseCharge(codSoc, matPers).subscribe((data: any) => {
        this.listPriseCharge = data;
      });
    });


  }


  editDataGet(id: any, data: any, content: any) {
    console.log(data)
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });

    (this.formPriseCharge.get("charge") as FormArray).controls[0]
      .get("cod_soc")
      ?.patchValue(data.cod_soc),
      (this.formPriseCharge.get("charge") as FormArray).controls[0]
        .get("num_pec")
        ?.patchValue(data.num_pec),
      (this.formPriseCharge.get("charge") as FormArray).controls[0]
        .get("mat_pers")
        ?.patchValue(data.mat_pers),
      (this.formPriseCharge.get("charge") as FormArray).controls[0]
        .get("dat_pec")
        ?.patchValue(data.dat_pec),
      (this.formPriseCharge.get("charge") as FormArray).controls[0]
        .get("num_fam")
        ?.patchValue(data.num_fam),
      (this.formPriseCharge.get("charge") as FormArray).controls[0]
        .get("etat_pec")
        ?.patchValue(data.etat_pec),
      (this.formPriseCharge.get("charge") as FormArray).controls[0]
        .get("prf_typ")
        ?.patchValue(data.prf_typ),
      (this.formPriseCharge.get("charge") as FormArray).controls[0]
        .get("prf_cod")
        ?.patchValue(data.prf_cod),
      (this.formPriseCharge.get("charge") as FormArray).controls[0]
        .get("mnt_pec")
        ?.patchValue(data.mnt_pec),
      (this.formPriseCharge.get("charge") as FormArray).controls[0]
        .get("mnt_remb")
        ?.patchValue(data.mnt_pec),
      (this.formPriseCharge.get("charge") as FormArray).controls[0]
        .get("dat_eff")
        ?.patchValue(data.dat_eff)
  }

  deleteId: any;
  confirm(content: any, id: any) {
    console.log("annee:", id)
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDelete() {
    console.log("this.deleteId.cod_lieu_geog", this.deleteId);

    this.adherentServ
      .deletePriseCharge(this.deleteId.cod_soc, this.deleteId.mat_pers, this.deleteId.num_pec)
      .subscribe((data) => {
        this.adherentServ
          .getPriseCharge(this.deleteId.cod_soc, this.deleteId.mat_pers)
          .subscribe((data) => {
            console.log("data", data);
            this.listPriseCharge = data;
          });
      });
  }
}
