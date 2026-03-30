import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { AssurService } from '../assur.service';

@Component({
  selector: 'app-param-ref-act',
  templateUrl: './param-ref-act.component.html',
  styleUrl: './param-ref-act.component.scss'
})
export class ParamRefActComponent {
  formRefAct!: FormGroup;
  pSusp: any;
  deleteId: any;
  isSearch: boolean = true;
  listRefAct!: any[] ;
  listRefActFiltr: any[] = [];
  listActe: any[] = [];
  columnActe: any[] = [];
  codActe?: string;
  breadCrumbItems!: Array<{}>;
  
  save!: boolean;
  isDisabled!: boolean;
  edit: boolean = true;


  columnTitles: { [key: string]: string } = {
    cod_act: "Code acte",
    lib_act: "Libellé acte",
    let_cod: "Let",
    cot_act: "Cot act",
    act_prix: "Prix acte",
    taux_act: "Taux",
    nat_act: "Nature acte",
     abrv_act: "Acte"
  };
  
  constructor(
    private fb: FormBuilder,
    private serv: AssurService,
    private modalService: NgbModal,
    public service: PaginationService,
    private saveService: SaveService,private tokenStorage:TokenStorage
  ) {
 
    this.formRefAct = this.fb.group({
    cod_act:[''],
    lib_act:[''],
    let_cod:[''],
    cot_act:[''],
    act_prix:[''],
    nat_act:[''],
    abrv_act:[''],
    taux_act:[''],

      
    });
  }

  ngOnInit(): void {
 
   
     this.getRefAct(); 
     this.getActe()
    }

 
 
    getRefAct() {
    this.serv.getRefAct().subscribe((data:any) => {
      console.log("data :",data)
      this.listRefAct = data;
      this.listRefActFiltr=data
     });
  }

 
  onSort(column: any) {
    this.listRefAct = this.service.onSort(
      column,
      this.listRefAct
    );
  }
  searchz: any = {
 
    cod_act:'',
    lib_act:'',
    let_cod:'',
    cot_act:'',
    act_prix:'',
    nat_act:'',
    abrv_act:'',
    taux_act:'',

  };
 
  applyFilter() {
     this.listRefAct = this.listRefActFiltr.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
   }
  openModalTab(content: any) {
    this.edit = true;

    this.formRefAct.reset()
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
     this.serv.deleteRefAct(this.deleteId.cod_act).subscribe(data=>{
    this.getRefAct()
    })
  }
  editDataGet(data: any, content: any) {
    this.edit=true
    console.log("data :",data)
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });
    this.codActe = data.abrv_act;
    
    this.formRefAct.get("cod_act")?.patchValue(data.cod_act);
    this.formRefAct.get("lib_act")?.patchValue(data.lib_act);
    this.formRefAct.get("let_cod")?.patchValue(data.let_cod);
    this.formRefAct.get("cot_act")?.patchValue(data.cot_act);
    this.formRefAct.get("act_prix")?.patchValue(Number(data.nat_act).toFixed(3));
    this.formRefAct.get("nat_act")?.patchValue(data.cat_med);
    this.formRefAct.get("taux_act")?.patchValue(Number(data.taux_act).toFixed(3));
     this.formRefAct.get("abrv_act")?.patchValue(data.abrv_act); 
  }

 

  onSelectedValueActe(item: any) {
     this.formRefAct.patchValue({
      abrv_act: item.abrv_act,
    });
  }
 

 
  saveRefAct() {
    console.log("this.formAffilMutuelle.value :", this.formRefAct.value);
   this.serv
      .AddRefAct(this.formRefAct.value)
      .subscribe((data) => {
        console.log("data :", data);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouter avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        this.getRefAct();
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



