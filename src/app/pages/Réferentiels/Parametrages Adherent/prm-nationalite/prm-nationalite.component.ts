import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ParamAdherentService } from '../param-adherent.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SaveService } from 'src/app/shared/Service/save.service';
import { TokenStorage } from 'src/app/account/token-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-prm-nationalite',
  templateUrl: './prm-nationalite.component.html',
  styleUrl: './prm-nationalite.component.scss'
})
export class PrmNationaliteComponent {
 pSusp: any;
 listNationalite:any[]=[]
 listNationaliteFiltred:any[]=[]
   edit: boolean = false;
  formNationalite:FormGroup
  breadCrumbItems!: Array<{}>;

  save!: boolean;
  isDisabled!: boolean;
  deleteId: any;
 constructor(private serv :ParamAdherentService,public service: PaginationService, private modalService: NgbModal,private fb:FormBuilder,
  private saveService: SaveService,private tokenStorage:TokenStorage
 ){
  this.formNationalite = this.fb.group({
    cod_natp:[],
    lib_nat:[],
    lib_nat_a:[], 
    
  });
 }
  ngOnInit(): void {
     
   
    this.getNationalite()
  }
  getNationalite(){
    this.serv.getNationalite().subscribe(data => {
      this.listNationalite = data;
      this.listNationaliteFiltred = data;
       // Définir les colonnes dynamiques du tableau
      
    });
  }
  showFilters: { [key: string]: boolean } = {};
 
  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }

  columnTitles: { [key: string]: string } = {
    cod_natp: "Code nation.",
    lib_nat: "Libellé nationalité",
    lib_nat_a: "Libellé nationalité arab", 
  };
 
  onSort(column: any) {
    this.listNationalite = this.service.onSort(
      column,
      this.listNationalite
    );
  }
  searchz: any = {
    cod_natp: "",
    lib_nat: "",
    lib_nat_a: "", 
  };
      
  sanitizeDateInput(value: string): void {
    // Sanitize the input to allow only numbers
    const sanitizedValue = value.replace(/[^0-9]/g, '');
  
    // Update the model
    this.searchz.dat_dem = sanitizedValue;
    console.log("value :", sanitizedValue);

    // Apply the filter logic
    this.applyFilter();
  }
   applyFilter() {
    this.listNationalite = this.listNationaliteFiltred.filter((row) => {
     return Object.keys(this.searchz).every((key) => {
       const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
       const rowValue = row[key]?.toString().toLowerCase() || "";
       return rowValue.includes(searchValue);
     });
   });
   console.log("this.listAffilMutuelle :",this.listNationaliteFiltred)
 }
  saveDepartPers() {
    console.log("this.formAffilMutuelle.value :", this.formNationalite.value);
    this.serv
      .AddNationalite(this.formNationalite.value)
      .subscribe((data) => {
        console.log("data :", data);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouter avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        this.getNationalite();
      });
  }

  openModalTab(content: any) {
    this.edit = false;
    console.log("edit :",this.edit)
    //this.formCertif.reset()
    this.modalService.open(content, { size: "lg", centered: true });
    this.formNationalite.reset()
    

  }


  editDataGet(id: any, data: any, content: any) {
    

    this.edit=true
    console.log("edit :",this.edit)
    this.modalService.open(content, { size: "lg", centered: true });
    
    this.formNationalite.get("cod_natp")?.patchValue(data.cod_natp);
    this.formNationalite.get("lib_nat")?.patchValue(data.lib_nat);
    this.formNationalite.get("lib_nat_a")?.patchValue(data.lib_nat_a);
    
   
  }
  
 validatelistDepartPers(): void {
  // Function to format dates within a FormGroup for specified fields
  

  // Check if `formReintegPers` is a valid FormGroup
  if (this.formNationalite instanceof FormGroup) {
    // Format the specified date fields
 
    // Update `listDepart` with the form values
    this.listNationalite = [
      this.formNationalite.getRawValue(),
      ...this.listNationalite
    ];  } else {
    console.error("formReintegPers is not a valid FormGroup.");
  }
}
confirm(content: any, id: any) {
  console.log("annee:",id)
  this.deleteId=id.cod_natp
  this.modalService.open(content, { centered: true });
  console.log("annee:",id.cod_natp)
}

deleteNationalite(){
  console.log("ok",this.deleteId)
  this.serv.deleteNationalite(this.deleteId).subscribe((data:any)=>{
    
    this.getNationalite()
    this.modalService.dismissAll(); 
  })
}
}
