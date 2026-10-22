import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
 import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { ParamAdherentService } from '../param-adherent.service';
@Component({
  selector: 'app-prm-departement',
  templateUrl: './prm-departement.component.html',
  styleUrl: './prm-departement.component.scss'
})
export class PrmDepartementComponent {
 p: number = 1; // Pagination pour le premier tableau
  pCertif: number = 1;
  formDepartement!: FormGroup; 
  listDepartement: any[] = [];
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
    this.formDepartement = this.fb.group({
      cod_lieu_geog: [""],
      lib_lieu: [""],
      lib_lieu_a: [""],
      type_lieu: [""]
    });

  }
  ngOnInit(): void {
 this.getDepartement()
  }

  /////////////////////////////////////////////////////////////
  columnTitles: { [key: string]: string } = {
    cod_lieu_geog: "Code département",
    lib_lieu: "Libellé département",
    lib_lieu_a: "Libellé département arabe", 
    type_lieu:"Type département"
  };
 

  showFilters: { [key: string]: boolean } = {};
 
  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }
 
  searchz: any = {
    cod_lieu_geog: "",
    lib_lieu: "",
    lib_lieu_a: "", 
    type_lieu:""
  };

  listDepartementFiltre:any[]=[]
  applyFilter() {
    this.listDepartement = this.listDepartementFiltre.filter((row:any) => {
     return Object.keys(this.searchz).every((key) => {
       const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
       const rowValue = row[key]?.toString().toLowerCase() || "";
       return rowValue.includes(searchValue);
     });
   });
 }
 





//////////////////////////////////////////////////////
  AddDepartement() {
    
     this.serv.AddDepartement(this.formDepartement.value).subscribe((data) => {
      console.log("data :", data);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.getDepartement()
    });
  }
 
 
  onSort(column: any) {
    console.log("this.dataRows :", this.listDepartement);
    this.listDepartement = this.service.onSort(column, this.listDepartement);
  }
  
  

 
  openModalTab(content: any) {
    this.edit = true;
    this.formDepartement.reset({ type_lieu: '' })
    //this.formCertif.reset()
    this.modalService.open(content, { size: "xl", centered: true });
  }

  editDataGet(id: any, data: any, content: any) {
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });

    this.formDepartement.get("cod_lieu_geog")?.patchValue(data.cod_lieu_geog),
    this.formDepartement.get("lib_lieu")?.patchValue(data.lib_lieu),
    this.formDepartement.get("lib_lieu_a")?.patchValue(data.lib_lieu_a),
    this.formDepartement.get("type_lieu")?.patchValue(data.type_lieu)
     

  }
  getDepartement () {
 

    this.serv
      .getDepartement()
      .subscribe((data) => {
        console.log("data", data);
        this.listDepartement = data;
        this.listDepartementFiltre=data
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
    console.log("this.deleteId.cod_lieu_geog", this.deleteId.cod_lieu_geog);

    this.serv
    .deleteDep( this.deleteId.cod_lieu_geog)
    .subscribe((data) => {
      this.serv
      .getDepartement()
      .subscribe((data) => {
        console.log("data", data);
        this.listDepartement = data;
        this.listDepartementFiltre=data
      });
    });
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

