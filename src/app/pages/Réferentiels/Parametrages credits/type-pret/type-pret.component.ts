import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { ParamAdherentService } from '../../Parametrages Adherent/param-adherent.service';
import { CreditService } from '../credit.service';

@Component({
  selector: 'app-type-pret',
  templateUrl: './type-pret.component.html',
  styleUrl: './type-pret.component.scss'
})
export class TypePretComponent {
  breadCrumbItems!: Array<{}>;

  pSusp1:any
  pSusp:any
  p: number = 1; // Pagination pour le premier tableau
  pCertif: number = 1;
  formGroupePret!: FormGroup;
  formTypePret!: FormGroup;
  isSearch: boolean = true;
  listPersonnel: any[] = [];
  listEnfants: any[] = [];
  listGroupePret: any[] = [];
  listTypePret: any[] = [];
  columnsSearch: any[] = [];
  save!: boolean;
  isDisabled!: boolean;
  edit: boolean = true;
  grpPret: any;
  constructor(
    private fb: FormBuilder,
    private serv: CreditService,
    public service: PaginationService,
    private modalService: NgbModal,
    private saveService: SaveService,
    private tokenStorage: TokenStorage,
    private cdr: ChangeDetectorRef
  ) {
    this.formGroupePret = this.fb.group({
      cod_soc: [this.tokenStorage.getUser().codSoc],
      cod_grp_pret: [''],
      lib_grp_pret: [''],
      typ_groupe: [''],
      lib_grp_pret_a: [''],


    });
    this.formTypePret = this.fb.group({
      cod_soc: [this.tokenStorage.getUser().codSoc],
      cod_grp_pret: [''],
      typ_pret: [''],
      abrv_fixe: [''],
      lib_pret: [''],
      taux_int: [''],
      duree_remb: [''],
      delai_grace: [''],
      nbr_tranche: [''],
      anciennete: [''],
      typ_fond: [''],
      typ_plafond: [''],
      indice: [''],
      taux_coop: [''],
      nbr_cariere: [''],
      delai_apres_ret: [''],
      typ_ass_pret: [''],
      int_fixe: [''],
      abreviation: [''],
      nat_typ: [''],
      ass_pret: [''],
      renouv: [''],
      abrv_compta: [''],
      libre_serv: [''],
      chap_comp: [''],
      cod_op: [''],
      lib_pret_a: [''],
      typ_int: [''],
      plafond: [''],
      pourcent: [''],
      dure_renouv: [''],
      commission: [''],
      typ_taux: [''],
      cpt_int: [''],
      cpt_cour_terme: [''],

    });
  }
  ngOnInit(): void {
    this.getGroupePret()
  }

  //   saveBanque() {

  //      this.serv.AddBanque(this.formBanque.value).subscribe((data) => {
  //       console.log("data :", data);
  //       Swal.fire({
  //         position: "top-end",
  //         icon: "success",
  //         title: "Ajouter avec succès !",
  //         showConfirmButton: false,
  //         timer: 2000,
  //       });
  //       this.getBanque()
  //     });
  //   }

  //   saveAgence() {
  //     const agenceFormArray = (this.formAgence.get("Agence") as FormArray)
  //       .value;
  // console.log("posteFormArray :",agenceFormArray)
  //     this.serv.AddAgence(agenceFormArray).subscribe((data) => {
  //       console.log("data :", data);
  //       Swal.fire({
  //         position: "top-end",
  //         icon: "success",
  //         title: "Ajouter avec succès !",
  //         showConfirmButton: false,
  //         timer: 2000,
  //       });
  //       this.serv
  //       .getAgence(agenceFormArray[0].cod_banq)
  //       .subscribe((data) => {
  //         console.log("data", data);
  //         this.listAgence = data;
  //       });
  //     });
  //   }
  onSort1(column: any) {
    this.listTypePret = this.service.onSort(column, this.listTypePret);
  }
  onSort(column: any) {
    this.listGroupePret = this.service.onSort(column, this.listGroupePret);
  }

  /////////////////////////////////////////////////////////////
  columnTitles: { [key: string]: string } = {
    cod_grp_pret: "Code ",
    lib_grp_pret: "Libellé ",
    lib_grp_pret_a: "Libellé  arabe", 
    typ_groupe:"Type groupe"
  };
 

  showFilters: { [key: string]: boolean } = {};
 
  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }
 
  searchz: any = {
    cod_grp_pret: "",
    lib_grp_pret: "",
    lib_grp_pret_a: "", 
    typ_groupe:""
  };

  listGroupePretFiltre:any[]=[]
  applyFilter() {
    this.listGroupePret = this.listGroupePretFiltre.filter((row:any) => {
     return Object.keys(this.searchz).every((key) => {
       const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
       const rowValue = row[key]?.toString().toLowerCase() || "";
       return rowValue.includes(searchValue);
     });
   });
 }
 

///////2 table 



columnTitles1: { [key: string]: string } = {
  typ_pret: "Code ",
  lib_pret: "Libellé ",
  abrv_fixe: "Abréviation", 
  taux_int:"Taux Interêt",
  plafond:"Plafond",

};


showFilters1: { [key: string]: boolean } = {};

toggleFilter1(column: string): void {
  this.showFilters1[column] = !this.showFilters1[column];
}

searchz1: any = {
  typ_pret: "",
  lib_pret: "",
  abrv_fixe: "", 
  taux_int:"",
  plafond:"",

};

listTypePretFiltre:any[]=[]
applyFilter1() {
  this.listTypePret = this.listTypePretFiltre.filter((row:any) => {
   return Object.keys(this.searchz1).every((key) => {
     const searchValue = this.searchz1[key]?.toString().toLowerCase() || "";
     const rowValue = row[key]?.toString().toLowerCase() || "";
     return rowValue.includes(searchValue);
   });
 });
}




//////////////////////////////////////////////////////


  openModalTab(content: any) {
    this.edit = true;

    this.formTypePret.reset()
    this.formTypePret.patchValue({
      cod_soc:this.tokenStorage.getUser().codSoc
    })
    this.modalService.open(content, { size: "xl", centered: true });
  }

  editDataGet(index:any,data: any, content: any) {
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });
    this.formTypePret.patchValue({
      cod_soc: data.cod_soc,
      cod_grp_pret: data.cod_grp_pret,
      typ_pret: data.typ_pret,
      abrv_fixe: data.abrv_fixe,
      lib_pret: data.lib_pret,
      taux_int: data.taux_int,
      duree_remb: data.duree_remb,
      delai_grace: data.delai_grace,
      nbr_tranche: data.nbr_tranche,
      anciennete: data.anciennete,
      typ_fond: data.typ_fond,
      typ_plafond: data.typ_plafond,
      indice: data.indice,
      taux_coop: data.taux_coop,
      nbr_cariere: data.nbr_cariere,
      delai_apres_ret: data.delai_apres_ret,
      typ_ass_pret: data.typ_ass_pret,
      int_fixe: data.int_fixe,
      abreviation: data.abreviation,
      nat_typ: data.nat_typ,
      ass_pret: data.ass_pret,
      renouv: data.renouv,
      abrv_compta: data.abrv_compta,
      libre_serv: data.libre_serv,
      chap_comp: data.chap_comp,
      cod_op: data.cod_op,
      lib_pret_a: data.lib_pret_a,
      typ_int: data.typ_int,
      plafond: data.plafond,
      pourcent: data.pourcent,
      dure_renouv: data.dure_renouv,
      commission: data.commission,
      typ_taux: data.typ_taux,
      cpt_int: data.cpt_int,
      cpt_cour_terme: data.cpt_cour_terme,


    })

  }

  editDataGrp(data: any, content: any) {
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });
    this.formGroupePret.patchValue({
      cod_soc:data.cod_soc,
      cod_grp_pret:data.cod_grp_pret,
      lib_grp_pret:data.lib_grp_pret,
      typ_groupe:data.typ_groupe,
      lib_grp_pret_a:data.lib_grp_pret_a,
      
    })

  }
  getGroupePret() {


    this.serv
      .getGroupePret()
      .subscribe((data) => {
        console.log("data", data);
        this.listGroupePret = data;
        this.listGroupePretFiltre=data
      });
  }
  selectedRow: number | null = null;

  getType(event: any) {
    this.grpPret=event.cod_grp_pret

    this.formTypePret.patchValue({
      cod_grp_pret: event.cod_grp_pret
    })
    this.serv
      .getTypePret(event.cod_grp_pret)
      .subscribe((data) => {
        console.log("data", data);
        this.listTypePret = data;
        this.listTypePretFiltre=data
      });
  }
  deleteId: any;
  confirm(content: any, id: any) {
    console.log("annee:", id)
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDelete() {
    this.serv.deleteGroupePret(this.deleteId.cod_soc, this.deleteId.cod_grp_pret).subscribe(data => {
      this.serv
        .getGroupePret()
        .subscribe((data) => {
          console.log("data", data);
          this.listGroupePret = data;
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Groupe Pret supprimé avec succès !",
            showConfirmButton: false,
            timer: 2000,
          });
        });
    })


  }
  deleteType: any;
  confirmType(content: any, id: any) {
    console.log("annee:", id)
    this.deleteType = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDeleteType() {
    
    this.serv.deleteTypPret(this.deleteType.cod_soc, this.deleteType.cod_grp_pret, this.deleteType.typ_pret).subscribe(data => {
      this.serv
        .getTypePret(this.deleteType.cod_grp_pret)
        .subscribe((data) => {
          console.log("data", data);
          this.listTypePret = data;
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Type supprimé avec succès !",
            showConfirmButton: false,
            timer: 2000,
          });
        });
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

  onPageChangeForGouv(page: number): void {
    console.log("Pagination pour le tableau 1 : ", page);

    this.p = page;
    this.cdr.detectChanges();

  }

  onPageChangeForPoste(page: number): void {
    console.log("Pagination pour le tableau 2 : ", page);
    this.pCertif = page;
    this.cdr.detectChanges();

  }
  saveGroupe() {

    this.serv.AddGroupe(this.formGroupePret.value).subscribe((data) => {
      console.log("data :", data);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.getGroupePret()
    });
  }
  saveType() {
    this.formTypePret.patchValue({
      cod_grp_pret: this.grpPret})
    this.serv.AddType(this.formTypePret.value).subscribe((data) => {
      console.log("data :", data);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.serv.getTypePret(this.grpPret).subscribe((data: any) => {
        this.listTypePret = data
      })
    });
  }
}


