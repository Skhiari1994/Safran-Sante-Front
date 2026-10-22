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
  selector: 'app-etat-pret',
  templateUrl: './etat-pret.component.html',
  styleUrl: './etat-pret.component.scss'
})
export class EtatPretComponent {
p: number = 1; // Pagination pour le premier tableau
  pCertif: number = 1;
  formEtatPret!: FormGroup;
   isSearch: boolean = true; 
   listEtat: any[] = [];
  columnsSearch: any[] = [];
  save!: boolean;
  breadCrumbItems!: Array<{}>;

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
    this.formEtatPret = this.fb.group({
      typ_etat:[''],
      cod_etat_pret:[''],
      lib_etat_pret:[''],
      lib_etat_pret_a:[''],
      nat_etat_pret:[''],
      ord:[''],
      
      
       


    });
   
  }
  ngOnInit(): void {
    this.getEtatPrêt() 
  }

  onSort(column: any) {
     this.listEtat = this.service.onSort(column, this.listEtat);
  } 



 
  editDataGet(data: any, content: any) {
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });
    this.formEtatPret.patchValue({
 
      typ_etat:data.typ_etat,
      cod_etat_pret:data.cod_etat_pret,
      lib_etat_pret:data.lib_etat_pret,
      lib_etat_pret_a:data.lib_etat_pret_a,
      nat_etat_pret:data.nat_etat_pret,
      ord:data.ord,

    })

  }

 

  getEtatPrêt() {

    
    this.serv
      .getEtatPret()
      .subscribe((data) => {
        console.log("data", data);
        this.listEtat = data;
      });
  }
  deleteId: any;
  confirm(content: any, id: any) {
    console.log("annee:", id)
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDelete() {
    this.serv.deleteEtatPret( this.deleteId.typ_etat,this.deleteId.cod_etat_pret).subscribe(data => {
      this.serv
        .getEtatPret()
        .subscribe((data) => {
          console.log("data", data);
          this.listEtat = data;
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
  saveEtatPret() {
    console.log("data :", this.formEtatPret.value);
    this.serv.AddEtatPret(this.formEtatPret.value).subscribe((data) => {
      console.log("data :", data);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.serv.getEtatPret().subscribe((data: any) => {
        this.listEtat = data
      })
    });
  }
 
 
  openModalTab(content: any) {
    this.edit = true;

    this.formEtatPret.reset({ typ_etat: '' }) 
    this.modalService.open(content, { size: "xl", centered: true });
  }

}





