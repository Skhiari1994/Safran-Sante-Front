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
  selector: 'app-piece-pret',
  templateUrl: './piece-pret.component.html',
  styleUrl: './piece-pret.component.scss'
})
export class PiecePretComponent {
  breadCrumbItems!: Array<{}>;

 p: number = 1; // Pagination pour le premier tableau
  pCertif: number = 1;
  formPiece!: FormGroup;
   isSearch: boolean = true; 
  listPiece: any[] = [];
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
    this.formPiece = this.fb.group({
      cod_piece_pret:[''],
      lib_piece_pret:[''],
      lib_piece_pret_a:[''],
      
       


    });
   
  }
  ngOnInit(): void {
    this.getPiece() 
  }

  onSort(column: any) {
    console.log("this.dataRows :", this.listPiece);
    this.listPiece = this.service.onSort(column, this.listPiece);
  } 



 
  editDataGet(data: any, content: any) {
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });
    this.formPiece.patchValue({
      
      cod_piece_pret:data.cod_piece_pret,
      lib_piece_pret:data.lib_piece_pret,
      lib_piece_pret_a:data.lib_piece_pret_a,
      

    })

  }

 

  getPiece() {

    
    this.serv
      .getPieces()
      .subscribe((data) => {
        console.log("data", data);
        this.listPiece = data;
      });
  }
  deleteId: any;
  confirm(content: any, id: any) {
    console.log("annee:", id)
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDelete() {
    this.serv.deletePiece( this.deleteId.cod_piece_pret).subscribe(data => {
      this.serv
        .getPieces()
        .subscribe((data) => {
          console.log("data", data);
          this.listPiece = data;
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
  savePiece() {
    console.log("data :", this.formPiece.value);
    this.serv.AddPiece(this.formPiece.value).subscribe((data) => {
      console.log("data :", data);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.serv.getPieces().subscribe((data: any) => {
        this.listPiece = data
      })
    });
  }
 
 
  openModalTab(content: any) {
    this.edit = true;

    this.formPiece.reset() 
    this.modalService.open(content, { size: "xl", centered: true });
  }

}




