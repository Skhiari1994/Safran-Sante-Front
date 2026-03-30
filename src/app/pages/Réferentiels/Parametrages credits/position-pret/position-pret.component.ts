import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { CreditService } from '../credit.service';
import { AdherentService } from 'src/app/pages/Adherent/adherent.service';

@Component({
  selector: 'app-position-pret',
  templateUrl: './position-pret.component.html',
  styleUrl: './position-pret.component.scss'
})
export class PositionPretComponent {
  p: number = 1; // Pagination pour le premier tableau
  pCertif: number = 1;
  formPositionPret!: FormGroup;
  formTypePret!: FormGroup;
  isSearch: boolean = true;
  breadCrumbItems!: Array<{}>;

  listPostion: any[] = [];
  listEnfants: any[] = [];
  listGroupePret: any[] = [];
  listTypePret: any[] = [];
  columnsSearch: any[] = [];
  save!: boolean;
  isDisabled!: boolean;
  edit: boolean = true;
  listAffectation: any[] = [];
  columnAffect: any[] = [];
  codAffectVal:string=""
  libAffect:string=""
  constructor(
    private fb: FormBuilder,
    private serv: CreditService,
    public service: PaginationService,
    private modalService: NgbModal,
    private saveService: SaveService,
    private tokenStorage: TokenStorage,
    private cdr: ChangeDetectorRef,
    private adherentServ:AdherentService
  ) {
    this.formPositionPret = this.fb.group({
      cod_soc: [this.tokenStorage.getUser().codSoc],
      cod_grp_pret:[''],
      typ_pret:[''],
      cod_motif:[''],
       


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
    this.getType()
    this.getAffectation()
  }

  onSort(column: any) {
    console.log("this.dataRows :", this.listEnfants);
    this.listTypePret = this.service.onSort(column, this.listTypePret);
  }
  onSort1(column: any) {
    console.log("this.dataRows :", this.listGroupePret);
    this.listGroupePret = this.service.onSort(column, this.listGroupePret);
  }


  /////////////////////////////////////////////////////////////
  columnTitles: { [key: string]: string } = {
    cod_grp_pret: "Code ",
    lib_grp_pret: "Libellé groupe ",
    typ_pret: "Code", 
    lib_pret:"Libellé type"
  };
 
listTypePretFiltre:any[]=[]
applyFilter() {
  this.listTypePret = this.listTypePretFiltre.filter((row:any) => {
   return Object.keys(this.searchz).every((key) => {
     const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
     const rowValue = row[key]?.toString().toLowerCase() || "";
     return rowValue.includes(searchValue);
   });
 });
}

  showFilters: { [key: string]: boolean } = {};
 
  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }
  searchz: any = {
    cod_grp_pret: "",
    lib_grp_pret: "",
    typ_pret: "", 
    lib_pret:""
  };


 

///////2 table 



columnTitles1: { [key: string]: string } = {
  cod_motif: "Code Motif ",
  lib_affect: "Libellé affect ",

};

showFilters1: { [key: string]: boolean } = {};

toggleFilter1(column: string): void {
  this.showFilters1[column] = !this.showFilters1[column];
}

searchz1: any = {
  cod_motif: "",
  lib_affect: "",

};

listPostionFiltre:any[]=[]
applyFilter1() {
  this.listPostion = this.listPostionFiltre.filter((row:any) => {
   return Object.keys(this.searchz1).every((key) => {
     const searchValue = this.searchz1[key]?.toString().toLowerCase() || "";
     const rowValue = row[key]?.toString().toLowerCase() || "";
     return rowValue.includes(searchValue);
   });
 });
}

pSusp:any
pSusp1:any

//////////////////////////////////////////////////////



  openModalTab(content: any) {
    this.edit = true;

    this.formTypePret.reset()
    this.formTypePret.patchValue({
      cod_soc:this.tokenStorage.getUser().codSoc
    })
    this.modalService.open(content, { size: "xl", centered: true });
  }

  editDataGet(id: any, data: any, content: any) {
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });
    this.formPositionPret.patchValue({
      
      cod_soc: data.cod_soc,
      cod_grp_pret:data.cod_grp_pret,
      typ_pret:data.typ_pret,
      cod_motif:data.cod_motif,

    })
    this.codAffectVal=data.cod_motif

  }

  getAffectation() {
    this.adherentServ.getAffectation().subscribe((data) => {
      this.listAffectation = data;
      this.columnAffect = [
        { key: "cod_affect", label: "Code" },
        { key: "lib_affect", label: "Libelle" },
        { key: "lib_affect_a", label: "Libelle arabe" },
      ];
    });
  }
 getPositionPret(data:any){
  console.log(data)
  
  this.formPositionPret.patchValue({
    cod_grp_pret: data.cod_grp_pret,
    typ_pret:data.typ_pret
  })
  this.serv.getPositionPret(data.cod_grp_pret,data.typ_pret).subscribe((data)=>{
    this.listPostion=data
    this.listPostionFiltre=data
  })
 }
 

  getType() {

    
    this.serv
      .getAllTypePret()
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
    this.serv.deletePositionPret( this.deleteId.cod_grp_pret,this.deleteId.typ_pret,this.deleteId.cod_motif).subscribe(data => {
      this.serv
        .getPositionPret(this.deleteId.cod_grp_pret,this.deleteId.typ_pret)
        .subscribe((data) => {
          console.log("data", data);
          this.listPostion = data;
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
    console.log("Pagination pour le tableau 1 : ", page);

    this.p = page;
    this.cdr.detectChanges();

  }

  onPageChangeForPoste(page: number): void {
    console.log("Pagination pour le tableau 2 : ", page);
    this.pCertif = page;
    this.cdr.detectChanges();

  }
  savePosition() {

    this.serv.AddPosition(this.formPositionPret.value).subscribe((data) => {
      console.log("data :", data);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.serv.getPositionPret(this.formPositionPret.get('cod_grp_pret')?.value,this.formPositionPret.get('typ_pret')?.value).subscribe((data: any) => {
        this.listPostion = data
      })
    });
  }
  onSelectedValueAffect(item: any) {
    //   this.codAffect = item.cod_affect; // Mise à jour du champ code
    if (item.cod_affect) {
      this.libAffect = item.lib_affect; // Mise à jour du champ libellé
    }
    this.formPositionPret.patchValue({
      cod_motif: item.cod_affect,
    });
  }
}



