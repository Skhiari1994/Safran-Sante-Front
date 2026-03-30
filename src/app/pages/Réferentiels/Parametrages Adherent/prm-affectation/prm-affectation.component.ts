import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
 import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { ParamAdherentService } from '../param-adherent.service';
@Component({
  selector: 'app-prm-affectation',
  templateUrl: './prm-affectation.component.html',
  styleUrl: './prm-affectation.component.scss'
})
export class PrmAffectationComponent {
p: number = 1; // Pagination pour le premier tableau
  pCertif: number = 1;
  formAffectation!: FormGroup; 
  listAffectation: any[] = [];
   
  save!: boolean;
  isDisabled!: boolean;
  edit: boolean = true;
  breadCrumbItems!: Array<{}>;

  constructor(
    private fb: FormBuilder,
    private serv: ParamAdherentService,
    public service: PaginationService,
    private modalService: NgbModal, 
    private cdr: ChangeDetectorRef
  ) {
    this.formAffectation = this.fb.group({
      cod_affect: [""],
      lib_affect: [""],
      lib_affect_a: [""] 
    });

  }
  ngOnInit(): void {
 this.getAffectation()
  }

  AddAffectation() {
    
     this.serv.AddAffectation(this.formAffectation.value).subscribe((data) => {
      console.log("data :", data);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.getAffectation()
    });
  }
 
 
  onSort(column: any) {
    console.log("this.dataRows :", this.listAffectation);
    this.listAffectation = this.service.onSort(column, this.listAffectation);
  }
  
  

 
  openModalTab(content: any) {
    this.edit = true;
    this.formAffectation.reset()
    //this.formCertif.reset()
    this.modalService.open(content, { size: "xl", centered: true });
  }

  editDataGet(id: any, data: any, content: any) {
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });

    this.formAffectation.get("cod_affect")?.patchValue(data.cod_affect),
    this.formAffectation.get("lib_affect")?.patchValue(data.lib_affect),
    this.formAffectation.get("lib_affect_a")?.patchValue(data.lib_affect_a)
      

  }
  getAffectation () {
   this.serv
      .getAffectation()
      .subscribe((data) => {
        console.log("data", data);
        this.listAffectation = data;
      });
  }
  selectedRow: number | null = null;

  
  deleteId: any;
  confirm(content: any, id: any) {
    console.log("annee:",id)
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDelete(){
    this.serv.delAffectation(this.deleteId.cod_affect).subscribe((data:any)=>{
      this.serv
      .getAffectation()
      .subscribe((data) => {
        this.listAffectation = data;
      });
    })
  }
  // ConfirmDelete(){
  //   this.serv.deleteCertifFamille(this.deleteId.cod_soc,this.deleteId.num_fam,this.deleteId.mat_pers,this.deleteId.annee_certif).subscribe(data=>{
  //     this.adherentServ
  //   .getCertifEnf(this.deleteId.mat_pers, this.deleteId.num_fam)
  //   .subscribe((data) => {
  //     console.log("data", data);
  //     this.listCertifFam = data;
  //   });
  //   })

   
  // }
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

}

