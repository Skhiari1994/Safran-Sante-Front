import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import { AdherentService } from '../adherent.service';
import Swal from 'sweetalert2';
//import { CaisseRetrService } from 'src/app/pages/CaisseRetraite/caisse-retr.service';

@Component({
  selector: 'app-maj-plafond',
  templateUrl: './maj-plafond.component.html',
  styleUrl: './maj-plafond.component.scss'
})
export class MajPlafondComponent {
  pSusp: any
  pSusp2: any
  listPersonnel: any[] = []
  columnPersonnels: any[] = []
  listPlafAssur: any[] = []
  listPlafCnam: any[] = []
  nomPren: String = ''
  matPersVal: String = ''
  libAssur: String = ''
  nom: String = ''
  libRef: String = ''
  formPersonnel: FormGroup
  formPlafondAssur: FormGroup
  formPlafondCnam: FormGroup
  isDisabled!: boolean;
  isSearch: boolean = true;
  listVir: any[] = []
  columnsVir: any[] = []
  edit: boolean = true
  editCarteIndex: any
  columnTitles2: { [key: string]: string } = {
    annee_assur: "Année",
    cod_assur: "Assurance",
    libAssur: "Libelle",
    plafond: "Plafond",
    sold_plaf: "Sold Plaf"
  };
  columnTitles: { [key: string]: string } = {
    annee_cnam: "Année",
    plafond: "Plafond",
    sold_plaf: "Solde",
  };
  constructor(/*private serv: CaisseRetrService, */private adherentServ: AdherentService, private token: TokenStorageService, private fb: FormBuilder,
    private modalService: NgbModal, private saveService: SaveService, private service: PaginationService) {
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

    this.formPlafondAssur = this.fb.group({
      annee_assur: [''],
      cod_soc: [''],
      mat_pers: [''],
      cod_assur: [''],
      plafond: [''],
      sold_plaf: [''],
      sold_assur_estim: [''],

    })
    this.formPlafondCnam = this.fb.group({
      annee_cnam: [''],
      cod_soc: [''],
      mat_pers: [''],
      plafond: [''],
      sold_plaf: [''],
      sold_cnam_estim: [''],

    })
  }

  ngOnInit() {

    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch = true
      console.log("is search valid", canSearch)

    })
    this.getPersonnels()

  }

  ngOnDestroy() {
    // Clear the callback to avoid memory leaks
    this.saveService.clearSaveCallback();
    this.saveService.setCanSave(false)
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
    this.adherentServ.getPlafondAssur(item.mat_pers).subscribe((data: any) => {
      this.listPlafAssur = data
    })

    this.adherentServ.getPlafondCnam(this.formPersonnel.get('mat_pers')?.value).subscribe((data: any) => {
      this.listPlafCnam = data
    })
  }
  savePlafAssur() {

    this.adherentServ.addPlafAssur(this.formPlafondAssur.value).subscribe((data) => {
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });

      this.adherentServ.getPlafondAssur(this.formPersonnel.get('mat_pers')?.value).subscribe((data: any) => {
        this.listPlafAssur = data
      })
    })

  }
  savePlafCnam() {

    this.adherentServ.addPlafCnam(this.formPlafondCnam.value).subscribe((data) => {
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });

      this.adherentServ.getPlafondCnam(this.formPersonnel.get('mat_pers')?.value).subscribe((data: any) => {
        this.listPlafCnam = data
      })
    })

  }
  openModalTab(content: any) {
    this.edit = true;
    this.editCarteIndex = null

    //this.formCertif.reset()
    this.modalService.open(content, { size: "xl", centered: true });
  }


  // Filtres par colonne : clés préfixées « a_ » (plafond mutuelle) et « c_ » (plafond CNAM)
  showFilters: { [key: string]: boolean } = {};
  searchz: { [key: string]: string } = {};
  toggleFilter(key: string) {
    this.showFilters[key] = !this.showFilters[key];
    if (!this.showFilters[key]) this.searchz[key] = '';
  }
  filterRows(list: any[], prefix: string): any[] {
    const keys = Object.keys(this.searchz).filter(k => k.startsWith(prefix) && this.searchz[k]);
    if (!keys.length) return list || [];
    return (list || []).filter(row =>
      keys.every(k => String(row[k.substring(prefix.length)] ?? '').toLowerCase().includes(this.searchz[k].toLowerCase()))
    );
  }

  onSort(column: any) {
    this.listPlafAssur = this.service.onSort(column, this.listPlafAssur);
  }
  onSort2(column: any) {
    this.listPlafCnam = this.service.onSort(column, this.listPlafCnam);
  }
  getTotalPages(): number {
    return Math.ceil(this.listPlafAssur.length / 6);
  }
  getTotalPages2(): number {
    return Math.ceil(this.listPlafCnam.length / 6);
  }

  editDataGet(id: any, data: any, content: any) {
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });

    this.formPlafondAssur.patchValue({
      annee_assur: data.annee_assur,
      cod_soc: data.cod_soc,
      mat_pers: data.mat_pers,
      cod_assur: data.cod_assur,
      plafond: Number(data.plafond).toFixed(3),
      sold_plaf: Number(data.sold_plaf).toFixed(3),
      sold_assur_estim: data.sold_assur_estim,

    })
    this.libAssur = data.libAssur

  }


  editDataGetCnam(id: any, data: any, content: any) {
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });

    this.formPlafondCnam.patchValue({
      annee_cnam: data.annee_cnam,
      cod_soc: data.cod_soc,
      mat_pers: data.mat_pers,
      plafond: Number(data.plafond).toFixed(3),
      sold_plaf: Number(data.sold_plaf).toFixed(3),
      sold_cnam_estim: data.sold_cnam_estim,


    })

  }
}
