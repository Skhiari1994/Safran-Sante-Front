import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AssurService } from '../assur.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaginationService } from 'src/app/core/services/pagination.service';
 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-param-activite-etablis',
  templateUrl: './param-activite-etablis.component.html',
  styleUrl: './param-activite-etablis.component.scss'
})
export class ParamActiviteEtablisComponent {
 breadCrumbItems!: Array<{}>;

  formActiviteEtabliss!: FormGroup;
  pSusp: any;
  deleteId: any;
  isSearch: boolean = true;
  listActiviteEtablis!: any[] ;
  listActiviteEtablisFiltr: any[] = [];
   
 
 
  
  save!: boolean;
  isDisabled!: boolean;
  edit: boolean = true;


  columnTitles: { [key: string]: string } = {
    cod_activ: "Code activité",
    lib_activite: "Libellé activité",
    lib_activite_a: "Libellé activité Arabe",
   
  };
  
  constructor(
    private fb: FormBuilder,
    private serv: AssurService,
    private modalService: NgbModal,
    public service: PaginationService,

  ) {
 
    this.formActiviteEtabliss = this.fb.group({
      cod_activ:[''],
      lib_activite:[''],
      lib_activite_a:[''],
   
      
    });
  }

  ngOnInit() {

    this.getAllActiviteEtabliss(); 
 

    
  }


  getAllActiviteEtabliss() {
    this.serv.getAllActiviteEtabliss().subscribe((data:any) => {
      console.log("data :",data)
      this.listActiviteEtablis = data;
      this.listActiviteEtablisFiltr=data
     });
  }

 
  onSort(column: any) {
    this.listActiviteEtablis = this.service.onSort(
      column,
      this.listActiviteEtablisFiltr
    );
  }
  searchz: any = {
    cod_activ: "",
    lib_activite: "",
    lib_activite_a: "",
  
  };
 
  applyFilter() {
     this.listActiviteEtablis = this.listActiviteEtablisFiltr.filter((data) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        const rowValue = data[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
    
  }
  openModalTab(content: any) {
    this.edit = true;

    this.formActiviteEtabliss.reset()
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
     this.serv.deleteActiviteEtablis(this.deleteId.cod_activ).subscribe(data=>{
    this.getAllActiviteEtabliss()
    })
  }
  editDataGet(data: any, content: any) {
    this.edit=true
    
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });
 
    
    this.formActiviteEtabliss.get("cod_activ")?.patchValue(data.cod_activ);
    this.formActiviteEtabliss.get("lib_activite")?.patchValue(data.lib_activite);
    this.formActiviteEtabliss.get("lib_activite_a")?.patchValue(data.lib_activite_a);
   
  }
 
  onSelectedValueAActiviteEtabliss(item: any) {
     this.formActiviteEtabliss.patchValue({
      cod_activ: item.cod_activ,
    });
  }
 
 
  createOrUpdateActiviteEtabliss() {
 
   this.serv
      .createOrUpdateActiviteEtabliss(this.formActiviteEtabliss.value)
      .subscribe((data) => {
        console.log("data :", data);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouter avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        this.getAllActiviteEtabliss();
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