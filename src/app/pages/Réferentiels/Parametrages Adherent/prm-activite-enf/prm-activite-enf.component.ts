import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
 import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { ParamAdherentService } from '../param-adherent.service';
@Component({
  selector: 'app-prm-activite-enf',
  templateUrl: './prm-activite-enf.component.html',
  styleUrl: './prm-activite-enf.component.scss'
})
export class PrmActiviteEnfComponent {
p: number = 1; // Pagination pour le premier tableau
  pCertif: number = 1;
  formActiviteEnf!: FormGroup; 
  listActiviteEnf: any[] = [];
  breadCrumbItems!: Array<{}>;
  save!: boolean;
  isDisabled!: boolean;

  edit: boolean = true;
  constructor(
    private fb: FormBuilder,
    private serv: ParamAdherentService,
    public service: PaginationService,
    private modalService: NgbModal, 
    private cdr: ChangeDetectorRef
  ) {
    this.formActiviteEnf = this.fb.group({
      cod_activite: [""],
      lib_activite: [""],
      lib_activite_a: [""] 
    });

  }
  ngOnInit(): void {
    
 this.getAffectation()
  }
  /////////////////////////////////////////////////////////////
  columnTitles: { [key: string]: string } = {
    cod_activite: "Code activité",
    lib_activite: "Libellé activité",
    lib_activite_a: "Libellé activité arabe", 
  };
 

  showFilters: { [key: string]: boolean } = {};
 
  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }

  searchz: any = {
    cod_activite: "",
    lib_activite: "",
    lib_activite_a: "", 
  };

  listActiviteEnfFiltre:any[]=[]
  applyFilter() {
    this.listActiviteEnf = this.listActiviteEnfFiltre.filter((row:any) => {
     return Object.keys(this.searchz).every((key) => {
       const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
       const rowValue = row[key]?.toString().toLowerCase() || "";
       return rowValue.includes(searchValue);
     });
   });
 }
 





//////////////////////////////////////////////////////
  addActiviteEnf() {
    
     this.serv.addActiviteEnf(this.formActiviteEnf.value).subscribe((data) => {
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
    console.log("this.dataRows :", this.listActiviteEnf);
    this.listActiviteEnf = this.service.onSort(column, this.listActiviteEnf);
  }
  
  

 
  openModalTab(content: any) {
    this.edit = true;
    this.formActiviteEnf.reset()
    //this.formCertif.reset()
    this.modalService.open(content, { size: "xl", centered: true });
  }

  editDataGet(id: any, data: any, content: any) {
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });

    this.formActiviteEnf.get("cod_activite")?.patchValue(data.cod_activite),
    this.formActiviteEnf.get("lib_activite")?.patchValue(data.lib_activite),
    this.formActiviteEnf.get("lib_activite_a")?.patchValue(data.lib_activite_a)
      

  }
  getAffectation () {
   this.serv
      .getActiviteEnf()
      .subscribe((data) => {
        console.log("data", data);
        this.listActiviteEnf = data;
        this.listActiviteEnfFiltre=data
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

        this.serv
        .deletActiviteEnf( this.deleteId.cod_activite)
        .subscribe((data) => {
          this.serv
          .getActiviteEnf()
          .subscribe((data) => {
            console.log("data", data);
            this.listActiviteEnf = data;
            this.listActiviteEnfFiltre=data
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

