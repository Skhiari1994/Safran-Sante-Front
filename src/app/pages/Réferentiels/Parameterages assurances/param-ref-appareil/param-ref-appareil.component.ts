import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { AssurService } from '../assur.service';

@Component({
  selector: 'app-param-ref-appareil',
  templateUrl: './param-ref-appareil.component.html',
  styleUrl: './param-ref-appareil.component.scss'
})
export class ParamRefAppareilComponent {
  formRefAppareil!: FormGroup;
  pSusp: any;
  deleteId: any;
  isSearch: boolean = true;
  listRefAppareil!: any[] ;
  listRefAppareilFiltr: any[] = [];
  listActe: any[] = [];
  columnActe: any[] = [];
  codActe?: string;
  
  save!: boolean;
  isDisabled!: boolean;
  edit: boolean = true;
  breadCrumbItems!: Array<{}>;


  columnTitles: { [key: string]: string } = {
    cod_app: "Code app",
    lib_app: "Libellé app",
    lib_app_a: "Libelle 2eme langue",
    prix_app: "Prix app",
    mois: "Mois",
    devis: "Devis",
    duree_app: "Durée/mois",
     abrv_act: "Acte"
 
  };
  
  constructor(
    private fb: FormBuilder,
    private serv: AssurService,
    private modalService: NgbModal,
    public service: PaginationService,
    private saveService: SaveService,private tokenStorage:TokenStorage
  ) {
 
    this.formRefAppareil = this.fb.group({
      cod_app:[''],
      lib_app:[''],
      lib_app_a:[''],
      abrv_act:[''],
      prix_app:[''],
      mois:[''],
      devis:[''],
      duree_app:[''],
      
    });
  }

  ngOnInit(): void {
 
   
     this.getRefAppareil(); 
     this.getActe()
    }

 
 
    getRefAppareil() {
    this.serv.getRefAppareil().subscribe((data:any) => {
      console.log("data :",data)
      this.listRefAppareil = data;
      this.listRefAppareilFiltr=data
     });
  }

 
  onSort(column: any) {
    this.listRefAppareil = this.service.onSort(
      column,
      this.listRefAppareil
    );
  }
  searchz: any = {
    cod_app:'',
    lib_app:'',
    lib_app_a:'',
    abrv_act:'',
    prix_app:'',
    mois:'',
    devis:'',
    duree_app:'',
    

  };
 
  applyFilter() {
     this.listRefAppareil = this.listRefAppareilFiltr.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
   }
  openModalTab(content: any) {
    this.edit = true;

    this.formRefAppareil.reset()
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
     this.serv.deleteRefAppareil(this.deleteId.cod_app).subscribe(data=>{
    this.getRefAppareil()
    })
  }
  editDataGet(data: any, content: any) {
    this.edit=true
    console.log("data :",data)
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });
    this.codActe = data.abrv_act;
    
    this.formRefAppareil.get("cod_app")?.patchValue(data.cod_app);
    this.formRefAppareil.get("lib_app")?.patchValue(data.lib_app);
    this.formRefAppareil.get("lib_app_a")?.patchValue(data.lib_app_a);
    this.formRefAppareil.get("devis")?.patchValue(data.devis);
     this.formRefAppareil.get("mois")?.patchValue(data.mois);
    this.formRefAppareil.get("prix_app")?.patchValue(Number(data.prix_app).toFixed(3));
    this.formRefAppareil.get("duree_app")?.patchValue(data.duree_app);

     this.formRefAppareil.get("abrv_act")?.patchValue(data.abrv_act); 
  }

   
  onSelectedValueActe(item: any) {
     this.formRefAppareil.patchValue({
      abrv_act: item.abrv_act,
    });
  }
 

 
  saveRefAppareil() {
    console.log("this.formAffilMutuelle.value :", this.formRefAppareil.value);
   this.serv
      .AddRefAppareil(this.formRefAppareil.value)
      .subscribe((data) => {
        console.log("data :", data);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouter avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        this.getRefAppareil();
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




