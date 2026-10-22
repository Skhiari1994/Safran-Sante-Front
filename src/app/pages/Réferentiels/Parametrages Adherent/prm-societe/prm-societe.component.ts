import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
 import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { ParamAdherentService } from '../param-adherent.service';
@Component({
  selector: 'app-prm-societe',
  templateUrl: './prm-societe.component.html',
  styleUrl: './prm-societe.component.scss'
})
export class PrmSocieteComponent {
  p: number = 1; // Pagination pour le premier tableau
  pCertif: number = 1;
  formSociete!: FormGroup; 
  listSociete: any[] = [];
   
  save!: boolean;
  isDisabled!: boolean;
  breadCrumbItems!: Array<{}>;

  edit: boolean = true;
  constructor(
    private fb: FormBuilder,
    private serv: ParamAdherentService,
    public service: PaginationService,
    private modalService: NgbModal,
    private saveService: SaveService,
    private tokenStorage:TokenStorage,
    private cdr: ChangeDetectorRef
  ) {
    this.formSociete = this.fb.group({
      cod_soc: [""],
      lib_soc: [""],
      cod_retr: [""],
      adr_soc: [""],
      lib_soc_a: [""],
      adr_soc_a: [""],
      tel_soc: [""],
      fax_soc: [""],
      num_retr: [""],
      rep_web: [""],
      regime: [""],
      num_police: [""], 
    });

  }
  ngOnInit(): void {
 this.getSociete()
  }


  /////////////////////////////////////////////////////////////
  columnTitles: { [key: string]: string } = {
    cod_banq: "Code société",
    lib_banq: "Libellé société.",
    lib_banq_a: "Libellé société. arab", 
  };
 
  
  showFilters: { [key: string]: boolean } = {};
 
  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }
 
  searchz: any = {
    cod_banq: "",
    lib_banq: "",
    lib_banq_a: "", 
  };

  litSoc:any
  applyFilter() {
    this.litSoc = this.litSoc.filter((row:any) => {
     return Object.keys(this.searchz).every((key) => {
       const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
       const rowValue = row[key]?.toString().toLowerCase() || "";
       return rowValue.includes(searchValue);
     });
   });
 }
 





//////////////////////////////////////////////////////
  AddSociete() {
    
     this.serv.AddSociete(this.formSociete.value).subscribe((data) => {
      console.log("data :", data);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.getSociete()
    });
  }
 
 
  onSort(column: any) {
    console.log("this.dataRows :", this.listSociete);
    this.listSociete = this.service.onSort(column, this.listSociete);
  }
  
  

 
  openModalTab(content: any) {
    this.edit = true;
    this.formSociete.reset({ cod_retr: '', rep_web: '' })
    //this.formCertif.reset()
    this.modalService.open(content, { size: "xl", centered: true });
  }

  editDataGet(id: any, data: any, content: any) {
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });

    this.formSociete.get("cod_soc")?.patchValue(data.cod_soc),
    this.formSociete.get("lib_soc")?.patchValue(data.lib_soc),
    this.formSociete.get("cod_retr")?.patchValue(data.cod_retr),
    this.formSociete.get("adr_soc")?.patchValue(data.adr_soc),
    this.formSociete.get("lib_soc_a")?.patchValue(data.lib_soc_a),
    this.formSociete.get("adr_soc_a")?.patchValue(data.adr_soc_a),
    this.formSociete.get("tel_soc")?.patchValue(data.tel_soc),
    this.formSociete.get("fax_soc")?.patchValue(data.fax_soc),
    this.formSociete.get("num_retr")?.patchValue(data.num_retr),
    this.formSociete.get("rep_web")?.patchValue(data.rep_web),
    this.formSociete.get("regime")?.patchValue(data.regime),
    this.formSociete.get("num_police")?.patchValue(data.num_police)

  }
  getSociete () {
 

    this.serv
      .getSociete()
      .subscribe((data) => {
        console.log("data", data);
        this.listSociete = data;
      });
  }
  selectedRow: number | null = null;

  
  deleteId: any;
  confirm(content: any, id: any) {
    console.log("annee:",id)
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  // ConfirmDelete(){
  //   this.serv.deleteCertifFamille(this.deleteId.cod_soc,this.deleteId.num_fam,this.deleteId.mat_pers,this.deleteId.annee_certif).subscribe(data=>{
  //     this.adherentServ
  //   .getCertifEnf(this.deleteId.mat_pers, this.deleteId.num_fam)
  //   .subscribe((data) => {
  //     console.log("data", data);
  //     this.listCertifFam = data;
  //   });
  //   })

   
  // }
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

