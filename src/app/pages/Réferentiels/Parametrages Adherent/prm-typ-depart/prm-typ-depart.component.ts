import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
 import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { ParamAdherentService } from '../param-adherent.service';
@Component({
  selector: 'app-prm-typ-depart',
  templateUrl: './prm-typ-depart.component.html',
  styleUrl: './prm-typ-depart.component.scss'
})
export class PrmTypDepartComponent {
p: number = 1; // Pagination pour le premier tableau
  pCertif: number = 1;
  formTypDepart!: FormGroup; 
  listTypDepart: any[] = [];
   
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
    this.formTypDepart = this.fb.group({
      cod_typ_depart: [""],
      lib_typ_depart: [""],
      etat_act: [""] ,
      lib_typ_depart_a: [""],
    });

  }
  ngOnInit(): void {
 this.getTypeDepart()
  }
  /////////////////////////////////////////////////////////////
  columnTitles: { [key: string]: string } = {
    cod_typ_depart: "Code Type départ",
    lib_typ_depart: "Libellé Type départ",
    lib_typ_depart_a: "Libellé Type départ arabe", 
    etat_act:"Etat act"
  };
 

  showFilters: { [key: string]: boolean } = {};
 
  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }
 
  searchz: any = {
    cod_typ_depart: "",
    lib_typ_depart: "",
    lib_typ_depart_a: "", 
    etat_act:""
  };
  listTypDepartFiltre:any[]=[]
  applyFilter() {
    this.listTypDepart = this.listTypDepartFiltre.filter((row:any) => {
     return Object.keys(this.searchz).every((key) => {
       const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
       const rowValue = row[key]?.toString().toLowerCase() || "";
       return rowValue.includes(searchValue);
     });
   });
 }
 





//////////////////////////////////////////////////////
  AddTypeDepart() {
    
     this.serv.AddTypeDepart(this.formTypDepart.value).subscribe((data) => {
      console.log("data :", data);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.getTypeDepart()
    });
  }
 
 
  onSort(column: any) {
    console.log("this.dataRows :", this.listTypDepart);
    this.listTypDepart = this.service.onSort(column, this.listTypDepart);
  }
  
  

 
  openModalTab(content: any) {
    this.edit = true;
    this.formTypDepart.reset({ etat_act: '' })
    //this.formCertif.reset()
    this.modalService.open(content, { size: "xl", centered: true });
  }

  editDataGet(id: any, data: any, content: any) {
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });

    this.formTypDepart.get("cod_typ_depart")?.patchValue(data.cod_typ_depart),
    this.formTypDepart.get("lib_typ_depart")?.patchValue(data.lib_typ_depart),
    this.formTypDepart.get("etat_act")?.patchValue(data.etat_act),
    this.formTypDepart.get("lib_typ_depart_a")?.patchValue(data.lib_typ_depart_a)

      

  }
  getTypeDepart () {
   this.serv
      .getTypeDepart()
      .subscribe((data) => {
        console.log("data", data);
        this.listTypDepart = data;
        this.listTypDepartFiltre=data
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
    
    this.serv.deleTypeDepart(this.deleteId.cod_typ_depart).subscribe((data:any)=>{
      this.serv
      .getTypeDepart()
      .subscribe((data) => {
        console.log("data", data);
        this.listTypDepart = data;
        this.listTypDepartFiltre=data
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

}

