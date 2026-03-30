import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { CreditService } from '../credit.service';

@Component({
  selector: 'app-piece-par-typ-pret',
  templateUrl: './piece-par-typ-pret.component.html',
  styleUrl: './piece-par-typ-pret.component.scss'
})
export class PieceParTypPretComponent {
 p: number = 1; // Pagination pour le premier tableau
  pCertif: number = 1;
  formPiecePret!: FormGroup;
  formTypePret!: FormGroup;
  isSearch: boolean = true;
  listPiecePret: any[] = [];
  breadCrumbItems!: Array<{}>;
  
  listTypePret: any[] = [];
  columnsSearch: any[] = [];
  save!: boolean;
  isDisabled!: boolean;
  edit: boolean = true;
  listPiece: any[] = [];
  columnPiece: any[] = [];
  codPieceVal:string=""
  libPiece:string=""
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
 
    this.formPiecePret = this.fb.group({
      cod_soc: [this.tokenStorage.getUser().codSoc],
      cod_grp_pret:[''],
      typ_pret:[''],
      cod_piece_pret:[''],
      nat_piece:[''],
      oblig_piece:[''],
      nbr_copie:[''],
      

    });
  }
  ngOnInit(): void {
    this.getType()
    this.getPieces()
  }

  

  /////////////////////////////////////////////////////////////
  columnTitles: { [key: string]: string } = {
    cod_grp_pret: "Code ",
    lib_grp_pret: "Libellé groupe ",
    typ_pret: "Code type", 
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
    this.serv
    .getAllTypePret()
    .subscribe((data) => {
      this.listTypePret = data;
      this.listTypePretFiltre=data
    });
  }
  searchz: any = {
    cod_grp_pret: "",
    lib_grp_pret: "",
    typ_pret: "", 
    lib_pret:""
  };

///////2 table 



columnTitles1: { [key: string]: string } = {
  cod_piece_pret: "Code ",
  lib_piece_pret: "Libellé ",
  nat_piece: "Abréviation", 
  oblig_piece:"Taux Interêt",
  nbr_copie:"Plafond",

};


showFilters1: { [key: string]: boolean } = {};

toggleFilter1(column: string): void {
  this.showFilters1[column] = !this.showFilters1[column];
  this.serv
  .getAllTypePret()
  .subscribe((data) => {
    this.listPiecePret = data;
    this.listPiecePretFiltre=data
  });
}

searchz1: any = {
  cod_piece_pret: "",
  lib_piece_pret: "",
  nat_piece: "", 
  oblig_piece:"",
  nbr_copie:"",

};

listPiecePretFiltre:any[]=[]
applyFilter1() {
  this.listPiecePret = this.listPiecePretFiltre.filter((row:any) => {
   return Object.keys(this.searchz1).every((key) => {
     const searchValue = this.searchz1[key]?.toString().toLowerCase() || "";
     const rowValue = row[key]?.toString().toLowerCase() || "";
     return rowValue.includes(searchValue);
   });
 });

}




//////////////////////////////////////////////////////
///////////////////////////

  editDataGet(data: any, content: any) {
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });
    console.log("data :",data)
    this.formPiecePret.patchValue({
      
      cod_soc: data.cod_soc,
      cod_grp_pret:data.cod_grp_pret,
      typ_pret:data.typ_pret,
      cod_piece_pret:data.cod_piece_pret,
      nat_piece:data.nat_piece,
      oblig_piece:data.oblig_piece,
      nbr_copie:data.nbr_copie,

    })
    this.codPieceVal=data.cod_piece_pret

  }
  onSort(column: any) {
    console.log("this.dataRows :", this.listPiecePret);
    this.listPiecePret = this.service.onSort(column, this.listPiecePret);
  }
 



  openModalTab(content: any) {
    this.edit = true;

  
    this.modalService.open(content, { size: "xl", centered: true });
  }
 
  getPieces() {
    this.serv.getPieces().subscribe((data) => {
      this.listPiece = data;
      this.columnPiece = [
        { key: "cod_piece_pret", label: "Code" },
        { key: "lib_piece_pret", label: "Libelle" }, 
      ];
    });
  }
 
 

  getType() {

    
    this.serv
      .getAllTypePret()
      .subscribe((data) => {
        console.log("data", data);
        this.listTypePret = data;
      });
  }
  deleteId: any;
  confirm(content: any, id: any) {
    console.log("annee:", id)
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDelete() {
    this.serv.deletePiecePret( this.deleteId.cod_grp_pret,this.deleteId.typ_pret,this.deleteId.cod_piece_pret).subscribe(data => {
      this.serv
        .getPiecesPret(this.deleteId.cod_grp_pret,this.deleteId.typ_pret)
        .subscribe((data) => {
          console.log("data", data);
          this.listPiecePret = data;
          this.listPiecePret=data
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

  getPiecePret(data:any){
    console.log(data)
    
    this.formPiecePret.patchValue({
      cod_grp_pret: data.cod_grp_pret,
      typ_pret:data.typ_pret
    })
    this.serv.getPiecesPret(data.cod_grp_pret,data.typ_pret).subscribe((data)=>{
    console.log('piece',data)

      this.listPiecePret=data
      this.listPiecePret=data
    })
   }
  savePosition() {

    this.serv.AddPiecePret(this.formPiecePret.value).subscribe((data) => {
      console.log("data :", data);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.serv.getPiecesPret(this.formPiecePret.get('cod_grp_pret')?.value,this.formPiecePret.get('typ_pret')?.value).subscribe((data: any) => {
        this.listPiecePret = data
      this.listPiecePret=data

      })
    });
  }
  onSelectedValuePiece(item: any) {
        this.libPiece = item.lib_piece_pret;  
 
    this.formPiecePret.patchValue({
      cod_piece_pret: item.cod_piece_pret,
    });
  }
}




