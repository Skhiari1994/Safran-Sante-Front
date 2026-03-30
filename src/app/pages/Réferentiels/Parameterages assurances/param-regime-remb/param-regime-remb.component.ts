import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { AssurService } from '../assur.service';

@Component({
  selector: 'app-param-regime-remb',
  templateUrl: './param-regime-remb.component.html',
  styleUrl: './param-regime-remb.component.scss'
})
export class ParamRegimeRembComponent {
 formRegimeRemb!: FormGroup;
  pSusp: any;
  deleteId: any;
  isSearch: boolean = true;
  listRegimeRemb!: any[] ;
  listRegimeRembFiltr: any[] = [];
  listActe: any[] = [];
  columnActe: any[] = [];
  codActe?: string;
  
  save!: boolean;
  isDisabled!: boolean;
  edit: boolean = true;

  breadCrumbItems!: Array<{}>;

  columnTitles: { [key: string]: string } = {
    reg_remb: "Code",
    lib_remb: "Libellé",
    lib_remb_a: "Libellé 2eme langue",
    dat_accouch: "Date accouch",
    apci: "APCI",
    sexe: "Sexe",
    pec: "Pec",
    parente: "Parente"
  };
  
  constructor(
    private fb: FormBuilder,
    private serv: AssurService,
    private modalService: NgbModal,
    public service: PaginationService,
    private saveService: SaveService,private tokenStorage:TokenStorage
  ) {
 
    this.formRegimeRemb = this.fb.group({
      reg_remb:[''],
      lib_remb:[''],
      lib_remb_a:[''],
      dat_accouch:[''],
      apci:[''],
      pec:[''],
      sexe:[''],
      parente:[''],
      

      
    });
  }

  ngOnInit(): void {
 
   
     this.getRegimeRemb(); 
     this.getActe()
    }

 
 
    getRegimeRemb() {
    this.serv.getRegimeRemb().subscribe((data:any) => {
      console.log("data :",data)
      this.listRegimeRemb = data;
      this.listRegimeRembFiltr=data
     });
  }

 
  onSort(column: any) {
    this.listRegimeRemb = this.service.onSort(
      column,
      this.listRegimeRemb
    );
  }
  searchz: any = {
 
    reg_remb:'',
    lib_remb:'',
    lib_remb_a:'',
    dat_accouch:'',
    apci:'',
    pec:'',
    sexe:'',
    parente:'',
    

  };
 
  applyFilter() {
     this.listRegimeRemb = this.listRegimeRembFiltr.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
   }
  openModalTab(content: any) {
    this.edit = true;

    this.formRegimeRemb.reset()
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
     this.serv.deleteRegimeRemb(this.deleteId.reg_remb).subscribe(data=>{
    this.getRegimeRemb()
    })
  }
  editDataGet(data: any, content: any) {
    this.edit=true
    console.log("data :",data)
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });
    this.codActe = data.abrv_act;
    
    this.formRegimeRemb.get("reg_remb")?.patchValue(data.reg_remb);
    this.formRegimeRemb.get("lib_remb")?.patchValue(data.lib_remb);
    this.formRegimeRemb.get("lib_remb_a")?.patchValue(data.lib_remb_a);
    this.formRegimeRemb.get("dat_accouch")?.patchValue(data.dat_accouch);
     this.formRegimeRemb.get("apci")?.patchValue(data.apci);
      this.formRegimeRemb.get("pec")?.patchValue(data.pec); 
      this.formRegimeRemb.get("sexe")?.patchValue(data.sexe); 
      this.formRegimeRemb.get("parente")?.patchValue(data.parente); 

  }
 
  

  onSelectedValueActe(item: any) {
     this.formRegimeRemb.patchValue({
      abrv_act: item.abrv_act,
    });
  }
 

 
  saveRegimeRemb() {
    console.log("this.formAffilMutuelle.value :", this.formRegimeRemb.value);
   this.serv
      .addRegimeRemb(this.formRegimeRemb.value)
      .subscribe((data) => {
        console.log("data :", data);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouter avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        this.getRegimeRemb();
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




