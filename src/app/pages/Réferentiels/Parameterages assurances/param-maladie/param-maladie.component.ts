import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { AssurService } from '../assur.service';

@Component({
  selector: 'app-param-maladie',
  templateUrl: './param-maladie.component.html',
  styleUrl: './param-maladie.component.scss'
})
export class ParamMaladieComponent {
 formMaladie!: FormGroup;
  pSusp: any;
  deleteId: any;
  isSearch: boolean = true;
  listMaladie!: any[] ;
  listRefMaladieFiltr: any[] = [];
  listActe: any[] = [];
  columnActe: any[] = [];
  codActe?: string;
  
  save!: boolean;
  isDisabled!: boolean;
  edit: boolean = true;
  breadCrumbItems!: Array<{}>;


  columnTitles: { [key: string]: string } = {
    cod_malad: "Code maladie",
    lib_malad: "Libellé maladie",
    lib_malad_a: "Libellé maladie 2eme langue",
    mnt_seuil:"Mnt seuil",
    apci: "Apci", 
  }; 
  constructor(
    private fb: FormBuilder,
    private serv: AssurService,
    private modalService: NgbModal,
    public service: PaginationService,
    private saveService: SaveService,private tokenStorage:TokenStorage
  ) {
 
    this.formMaladie = this.fb.group({
      cod_malad:[''],
      lib_malad:[''],
      apci:[''],
      lib_malad_a:[''],
      mnt_seuil:[''],
      

      
    });
  }

  ngOnInit(): void {
 
   
     this.getMaladie(); 
     this.getActe()
    }

 
 
    getMaladie() {
    this.serv.getMaladie().subscribe((data:any) => {
      console.log("data :",data)
      this.listMaladie = data;
      this.listRefMaladieFiltr=data
     });
  }

 
  onSort(column: any) {
    this.listMaladie = this.service.onSort(
      column,
      this.listMaladie
    );
  }
  searchz: any = {
 
    cod_malad:'',
    lib_malad:'',
    apci:'',
    lib_malad_a:'',
    mnt_seuil:'',


  };
 
  applyFilter() {
     this.listMaladie = this.listRefMaladieFiltr.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
   }
  openModalTab(content: any) {
    this.edit = true;

    this.formMaladie.reset({ apci: '' })
    this.modalService.open(content, { size: "xl", centered: true });
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
 
  getActe() {
    this.serv.getActe().subscribe((data:any) => {
      console.log("data :",data)
      this.listActe = data;
      this.columnActe=[
        { key: "abrv_act", label: "Abrv" },
        { key: "lib_act", label: "Libelle" },
      ]
      });
  }
  confirm(content: any, id: any) {
    console.log("annee:", id);
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDelete() {
     this.serv.deleteMaladie(this.deleteId.cod_malad).subscribe(data=>{
    this.getMaladie()
    })
  }
  editDataGet(data: any, content: any) {
    this.edit=true
    console.log("data :",data)
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });
    this.codActe = data.abrv_act;
    
    this.formMaladie.get("cod_malad")?.patchValue(data.cod_malad);
    this.formMaladie.get("lib_malad")?.patchValue(data.lib_malad);
    this.formMaladie.get("lib_malad_a")?.patchValue(data.lib_malad_a);

    this.formMaladie.get("apci")?.patchValue(data.apci);
     this.formMaladie.get("mnt_seuil")?.patchValue(Number(data.mnt_seuil).toFixed(3));
    
  }

 

  onSelectedValueActe(item: any) {
     this.formMaladie.patchValue({
      abrv_act: item.abrv_act,
    });
  }
 

 
  saveMaladie() {
    console.log("this.formAffilMutuelle.value :", this.formMaladie.value);
   this.serv
      .AddMaladie(this.formMaladie.value)
      .subscribe((data) => {
        console.log("data :", data);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouter avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        this.getMaladie();
      });
  }

  sanitizeDateInput(value: string): void {
    // Sanitize the input to allow only numbers
    const sanitizedValue = value.replace(/[^0-9]/g, '');
  
    // Update the model
    this.searchz.dat_dem = sanitizedValue;
    console.log("value :", sanitizedValue);

    // Apply the filter logic
    this.applyFilter();
  }

  showFilters: { [key: string]: boolean } = {};

  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }

 
}




