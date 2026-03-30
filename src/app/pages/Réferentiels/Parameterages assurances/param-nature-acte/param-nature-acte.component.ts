import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AssurService } from '../assur.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import { TokenStorage } from 'src/app/account/token-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-param-nature-acte',
  templateUrl: './param-nature-acte.component.html',
  styleUrl: './param-nature-acte.component.scss'
})
export class ParamNatureActeComponent {
  breadCrumbItems!: Array<{}>;

  formTypeActe!: FormGroup;
  pSusp: any;
  deleteId: any;
  isSearch: boolean = true;
  listTypeActe!: any[] ;
  listTypeActeFiltr: any[] = [];
  listActe: any[] = [];
  columnActe: any[] = [];
  codActe?: string;
  
  save!: boolean;
  isDisabled!: boolean;
  edit: boolean = true;


  columnTitles: { [key: string]: string } = {
    type_acte: "Code Type acte",
    lib_type_acte: "Libellé Type acte",
    lib_type_acte_a: "Libellé Type acte Arabe",
   
  };
  
  constructor(
    private fb: FormBuilder,
    private serv: AssurService,
    private modalService: NgbModal,
    public service: PaginationService,
    private saveService: SaveService,private tokenStorage:TokenStorage
  ) {
 
    this.formTypeActe = this.fb.group({
      type_acte:[''],
      lib_type_acte:[''],
      lib_type_acte_a:[''],
   
      
    });
  }

  ngOnInit() {

    this.getTypeActe(); 
 

  }


getTypeActe() {
    this.serv.getTypeActe().subscribe((data:any) => {
      console.log("data :",data)
      this.listTypeActe = data;
      this.listTypeActeFiltr=data
     });
  }

 
  onSort(column: any) {
    this.listTypeActe = this.service.onSort(
      column,
      this.listTypeActeFiltr
    );
  }
  searchz: any = {
    type_acte: "",
    lib_type_acte: "",
    lib_type_acte_a: "",
  
  };
 
  applyFilter() {
     this.listTypeActe = this.listTypeActeFiltr.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
    
  }
  openModalTab(content: any) {
    this.edit = true;

    this.formTypeActe.reset()
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
 

  confirm(content: any, id: any) {
    console.log("annee:", id);
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDelete() {
     this.serv.deleteTypeActe(this.deleteId.type_acte).subscribe(data=>{
    this.getTypeActe()
    })
  }
  editDataGet(data: any, content: any) {
    this.edit=true
    console.log("data :",data)
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });
 
    
    this.formTypeActe.get("type_acte")?.patchValue(data.type_acte);
    this.formTypeActe.get("lib_type_acte")?.patchValue(data.lib_type_acte);
    this.formTypeActe.get("lib_type_acte_a")?.patchValue(data.lib_type_acte_a);
   
  }
 
  onSelectedValueActe(item: any) {
     this.formTypeActe.patchValue({
      type_acte: item.type_acte,
    });
  }
 
 
  saveTypeActe() {
 
   this.serv
      .AddTypeActe(this.formTypeActe.value)
      .subscribe((data) => {
        console.log("data :", data);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouter avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        this.getTypeActe();
      });
  }

  sanitizeDateInput(value: string): void {
    const sanitizedValue = value.replace(/[^0-9]/g, '');
    this.searchz.dat_dem = sanitizedValue;
    console.log("value :", sanitizedValue);
    this.applyFilter();
  }

  showFilters: { [key: string]: boolean } = {};
  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }

}
