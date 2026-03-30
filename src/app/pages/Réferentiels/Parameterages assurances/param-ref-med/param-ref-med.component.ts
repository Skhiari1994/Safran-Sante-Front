import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { AssurService } from '../assur.service';

@Component({
  selector: 'app-param-ref-med',
  templateUrl: './param-ref-med.component.html',
  styleUrl: './param-ref-med.component.scss'
})
export class ParamRefMedComponent {
  formRefMed!: FormGroup;
  pSusp: any;
  deleteId: any;
  isSearch: boolean = true;
  listRefMed!: any[] ;
  listRefMedFiltr: any[] = [];
  listActe: any[] = [];
  columnActe: any[] = [];
  codActe?: string;
  
  save!: boolean;
  isDisabled!: boolean;
  edit: boolean = true;

  breadCrumbItems!: Array<{}>;

  columnTitles: { [key: string]: string } = {
    cod_med: "Code médicament",
    lib_med: "Libellé médicament",
    mdc_prix: "Mdc",
    med_prix: "Med",
    prix_remb: "Remb",
    cat_med: "Cat med",
    ap: "Ap",
    rb: "Rb",
    abrv_act: "Acte"
  };
  
  constructor(
    private fb: FormBuilder,
    private serv: AssurService,
    private modalService: NgbModal,
    public service: PaginationService,
    private saveService: SaveService,private tokenStorage:TokenStorage
  ) {
 
    this.formRefMed = this.fb.group({
      cod_med:[''],
      lib_med:[''],
      mdc_prix:[''],
      med_prix:[''],
      prix_remb:[''],
      cat_med:[''],
      ap:[''],
      rb:[''],
      abrv_act:[''],
      
    });
  }

  ngOnInit(): void {
 
   
     this.getRefMed(); 
     this.getActe()
    }

 
 
   getRefMed() {
    this.serv.getRefMed().subscribe((data:any) => {
      console.log("data :",data)
      this.listRefMed = data;
      this.listRefMedFiltr=data
     });
  }

 
  onSort(column: any) {
    this.listRefMed = this.service.onSort(
      column,
      this.listRefMed
    );
  }
  searchz: any = {
 
 cod_med: "",
lib_med: "",
mdc_prix: "",
med_prix: "",
prix_remb: "",
cat_med: "",
ap: "",
rb: "",
abrv_act: ""

  };
 
  applyFilter() {
     this.listRefMed = this.listRefMedFiltr.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
   }
  openModalTab(content: any) {
    this.edit = true;

    this.formRefMed.reset()
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
     this.serv.deleteRefMed(this.deleteId.cod_med).subscribe(data=>{
    this.getRefMed()
    })
  }
  editDataGet(data: any, content: any) {
    this.edit=true
    console.log("data :",data)
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });
    this.codActe = data.abrv_act;
    
    this.formRefMed.get("cod_med")?.patchValue(data.cod_med);
    this.formRefMed.get("lib_med")?.patchValue(data.lib_med);
    this.formRefMed.get("mdc_prix")?.patchValue(Number(data.mdc_prix).toFixed(3));
    this.formRefMed.get("med_prix")?.patchValue(Number(data.med_prix).toFixed(3));
    this.formRefMed.get("prix_remb")?.patchValue(Number(data.prix_remb).toFixed(3));
    this.formRefMed.get("cat_med")?.patchValue(data.cat_med);
    this.formRefMed.get("ap")?.patchValue(data.ap);
    this.formRefMed.get("rb")?.patchValue(data.rb);
    this.formRefMed.get("abrv_act")?.patchValue(data.abrv_act);


  }

 

  onSelectedValueActe(item: any) {
     this.formRefMed.patchValue({
      abrv_act: item.abrv_act,
    });
  }
 

 
  saveRefMed() {
    console.log("this.formAffilMutuelle.value :", this.formRefMed.value);
   this.serv
      .AddRefMed(this.formRefMed.value)
      .subscribe((data) => {
        console.log("data :", data);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouter avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        this.getRefMed();
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


