import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { AssurService } from '../assur.service';

@Component({
  selector: 'app-ref-visite',
  templateUrl: './ref-visite.component.html',
  styleUrl: './ref-visite.component.scss'
})
export class RefVisiteComponent {
  formRefVisite!: FormGroup;
  pSusp: any;
  deleteId: any;
  isSearch: boolean = true;
  listRefVisite!: any[] ;
  listRefVisiteFiltr: any[] = [];
  listActe: any[] = [];
  columnActe: any[] = [];
  codActe?: string;
  
  save!: boolean;
  isDisabled!: boolean;
  edit: boolean = true;

  breadCrumbItems!: Array<{}>;

  columnTitles: { [key: string]: string } = {
    cod_visit: "Code Visite",
    lib_visit: "Libellé Visite",
    lib_visit_a: "Libellé Visite Arabe",
    prix_visit: "Prix Visite",
    taux_remb: "Taux Remboursement",
    cod_sec: "Code Sécurité",
    typ_nat: "Type Nature",
    abrv_act: "Abréviation Acte"
  };
  
  constructor(
    private fb: FormBuilder,
    private serv: AssurService,
    private modalService: NgbModal,
    public service: PaginationService,
    private saveService: SaveService,private tokenStorage:TokenStorage
  ) {
 
    this.formRefVisite = this.fb.group({
      cod_visit:[''],
      lib_visit:[''],
      cod_sec:[''],
      typ_nat:[''],
      lib_visit_a:[''],
      abrv_act:[''],
      prix_visit:[''],
      taux_remb:[''],
      
    });
  }

  ngOnInit(): void {
 
   
     this.getRefVisit(); 
     this.getActe()
   }

 
 
   getRefVisit() {
    this.serv.getRefVisit().subscribe((data:any) => {
      console.log("data :",data)
      this.listRefVisite = data;
      this.listRefVisiteFiltr=data
     });
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
  onSort(column: any) {
    this.listRefVisite = this.service.onSort(
      column,
      this.listRefVisite
    );
  }
  searchz: any = {
    cod_visit: "",
    lib_visit: "",
    lib_visit_a: "",
    prix_visit: "",
    taux_remb: "",
    cod_sec: "",
    typ_nat: "",
    abrv_act: "",

    
  };
 
  applyFilter() {
     this.listRefVisite = this.listRefVisiteFiltr.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
    console.log("this.listAffilMutuelle :",this.listRefVisite)
  }
  openModalTab(content: any) {
    this.edit = true;

    this.formRefVisite.reset()
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
     this.serv.deleteRefVisite(this.deleteId.cod_visit).subscribe(data=>{
    this.getRefVisit()
    })
  }
  editDataGet(data: any, content: any) {
    this.edit=true
    console.log("data :",data)
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });
    this.codActe = data.abrv_act;
    
    this.formRefVisite.get("cod_visit")?.patchValue(data.cod_visit);
    this.formRefVisite.get("lib_visit")?.patchValue(data.lib_visit);
    this.formRefVisite.get("cod_sec")?.patchValue(data.cod_sec);
    this.formRefVisite.get("typ_nat")?.patchValue(data.typ_nat);
    this.formRefVisite.get("lib_visit_a")?.patchValue(data.lib_visit_a);
    this.formRefVisite.get("abrv_act")?.patchValue(data.abrv_act);
    this.formRefVisite.get("prix_visit")?.patchValue(data.prix_visit);
    this.formRefVisite.get("taux_remb")?.patchValue(data.taux_remb);
 

  }

 

  onSelectedValueActe(item: any) {
     this.formRefVisite.patchValue({
      abrv_act: item.abrv_act,
    });
  }
 

 
  saveRefVisite() {
    console.log("this.formAffilMutuelle.value :", this.formRefVisite.value);
   this.serv
      .AddRefVisite(this.formRefVisite.value)
      .subscribe((data) => {
        console.log("data :", data);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouter avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        this.getRefVisit();
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

