import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { ParamAdherentService } from '../param-adherent.service';

@Component({
  selector: 'app-prm-poste',
  templateUrl: './prm-poste.component.html',
  styleUrl: './prm-poste.component.scss'
})
export class PrmPosteComponent {
  p: number = 1; // Pagination pour le premier tableau
  pCertif: number = 1;
  formGouv!: FormGroup;
  formPoste!: FormGroup;
  isSearch: boolean = true;
  listPersonnel: any[] = [];
  breadCrumbItems!: Array<{}>;

  listEnfants: any[] = [];
  listGouv: any[] = [];
  listGouvFiltre: any[] = [];

  listPoste: any[] = [];
  listPosteFiltre: any[] = [];

  columnsSearch: any[] = [];
  save!: boolean;
  isDisabled!: boolean;
  edit: boolean = true;
 pSusp: any;
 pSusp2: any;


  constructor(
    private fb: FormBuilder,
    private serv: ParamAdherentService,
    public service: PaginationService,
    private modalService: NgbModal,
    private saveService: SaveService,
    private tokenStorage:TokenStorage,
    private cdr: ChangeDetectorRef
  ) {
    this.formGouv = this.fb.group({
      cod_gouv: [""],
      lib_gouv: [""],
      lib_gouv_a: [""],
       
    });
    this.formPoste = this.fb.group({
      poste: this.fb.array([
        this.fb.group({
          cod_gouv: [""],
          cod_poste: [""],
          lib_post: [""],
          lib_poste_a: [""],
        }),
      ]), // FormArray for dynamic children
    });
  }
  ngOnInit(): void {
 this.getGouv()
  }

  /////////////////////////////////////////////////////////////
  columnTitles: { [key: string]: string } = {
    cod_gouv: "Code gouv",
    lib_gouv: "Libellé gouv.",
    lib_poste_a: "Libellé gouv. arab", 
  };
  columnTitles2: { [key: string]: string } = {
    cod_gouv: "Code gouv",
    cod_poste: "Code poste",
    lib_post: "Libellé gouv.",
    lib_poste_a: "Libellé gouv. arab", 
  };
  showFilters: { [key: string]: boolean } = {};
 
  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }
  showFilters2: { [key: string]: boolean } = {};
 
  toggleFilter2(column: string): void {
    this.showFilters2[column] = !this.showFilters2[column];
  }
  searchz: any = {
    cod_gouv: "",
    lib_gouv: "",
    lib_poste_a: "", 
  };
  searchz2: any = {
    cod_gouv: "",
    cod_poste:"",
    lib_post: "",
    lib_poste_a: "", 
  };
  applyFilter() {
    this.listGouv = this.listGouvFiltre.filter((row) => {
     return Object.keys(this.searchz).every((key) => {
       const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
       const rowValue = row[key]?.toString().toLowerCase() || "";
       return rowValue.includes(searchValue);
     });
   });
 }
 

 applyFilter2() {
  this.listPoste = this.listPosteFiltre.filter((row) => {
   return Object.keys(this.searchz2).every((key) => {
     const searchValue = this.searchz2[key]?.toString().toLowerCase() || "";
     const rowValue = row[key]?.toString().toLowerCase() || "";
     return rowValue.includes(searchValue);
   });

 });

}
 onSort(column: any) {
  this.listGouv = this.service.onSort(
    column,
    this.listGouv
  );
}

onSort2(column: any) {
  this.listPoste = this.service.onSort(
    column,
    this.listPoste
  );
}

//////////////////////////////////////////////////////
  saveGouv() {
    
     this.serv.AddGouvernerat(this.formGouv.value).subscribe((data) => {
      console.log("data :", data);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.serv
      .getGouv()
      .subscribe((data) => {
        console.log("data", data);
        this.listGouv = data;
      });
    });
  }
 
  savePoste() {
    const posteFormArray = (this.formPoste.get("poste") as FormArray);
    posteFormArray.controls.forEach((control) => {
      control.get("cod_gouv")?.patchValue(posteFormArray.value[0].cod_gouv);
    });
    console.log("posteFormArray ",posteFormArray.value)
    this.serv.AddPoste(posteFormArray.value).subscribe((data) => {
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.serv
      .getPoste(posteFormArray.value[0].cod_gouv)
      .subscribe((data) => {
        this.listPoste = data;
        this.listPosteFiltre=data
      });
    });
  }
 
  onSort1(column: any) {
    console.log("this.dataRows :", this.listGouv);
    this.listGouv = this.service.onSort(column, this.listGouv);
  }
  get Poste(): FormArray {
    return this.formPoste.get("poste") as FormArray;
  }
  addPoste() {
    this.Poste.push(
      this.fb.group({
        cod_gouv: [""],
        cod_poste: [""],
        lib_post: [""],
        lib_poste_a: [""],
      })
    );
  }

  removeEnfant(index: number) {
    this.Poste.removeAt(index);
  }
  openModalTab(content: any) {
    this.edit = true;

    //this.formCertif.reset()
    this.modalService.open(content, { size: "xl", centered: true });
  }

  editDataGet(id: any, data: any, content: any) {
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });

    (this.formPoste.get("poste") as FormArray).controls[0]
      .get("cod_gouv")
      ?.patchValue(data.cod_gouv),
      (this.formPoste.get("poste") as FormArray).controls[0]
        .get("cod_poste")
        ?.patchValue(data.cod_poste),
      (this.formPoste.get("poste") as FormArray).controls[0]
        .get("lib_post")
        ?.patchValue(data.lib_post),
      (this.formPoste.get("poste") as FormArray).controls[0]
        .get("lib_poste_a")
        ?.patchValue(data.lib_poste_a)
      
  }
  getGouv() {
 

    this.serv
      .getGouv()
      .subscribe((data) => {
        console.log("data", data);
        this.listGouv = data;
        this.listGouvFiltre=data
      });
  }
  selectedRow: number | null = null;

  getPoste(event: any, index: number) {
    this.selectedRow = index;
    const formArray = this.formPoste.get("poste") as FormArray;
    formArray.controls.forEach((control) => {
      control.get("cod_gouv")?.patchValue(event.cod_gouv);
    });

    this.serv
      .getPoste(event.cod_gouv)
      .subscribe((data) => {
        console.log("data", data);
        this.listPoste = data;
        this.listPosteFiltre=data

      });
  }
  deleteId: any;
  confirm(content: any, id: any) {
    console.log("annee:",id)
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
   ConfirmDelete(){
    const idPost={
       cod_gouv: this.deleteId.cod_gouv,
        cod_poste: this.deleteId.cod_poste
    }

    this.serv.deletePoste(idPost).subscribe((data=>{

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Poste supprimé avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.serv
      .getPoste( this.deleteId.cod_gouv)
      .subscribe((data) => {
        console.log("data", data);
        this.listPoste = data;
      });
    }))
  
   

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
  validatelistPoste(): void {
    // Fonction pour formater les dates d'un FormGroup donné
    

    // Récupère le FormArray 'enfants'
    const CertifFamArray = this.formPoste.get("poste") as FormArray;

    if (CertifFamArray && CertifFamArray.valid) {
      // Parcourt chaque FormGroup dans le FormArray
      CertifFamArray.controls.forEach((formGroup: AbstractControl) => {
        if (formGroup instanceof FormGroup) {
 
          formGroup
            .get("cod_gouv")
            ?.patchValue(this.formGouv.get("cod_gouv")?.value);
          formGroup.get("cod_soc")?.patchValue(this.tokenStorage.getUser().codSoc);
        }
      });
      console.log("filteredDataRows :", CertifFamArray);

      // Mise à jour des lignes de données avec les valeurs du FormArray
      //this.listCertifFam = [...CertifFamArray.value];
    }
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

