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
  selector: 'app-prm-banque',
  templateUrl: './prm-banque.component.html',
  styleUrl: './prm-banque.component.scss'
})
export class PrmBanqueComponent {
  p: number = 1; // Pagination pour le premier tableau
  pCertif: number = 1;
  formBanque!: FormGroup;
  formAgence!: FormGroup;
  isSearch: boolean = true;
  breadCrumbItems!: Array<{}>;
  listBanqueFiltre: any[] = [];
  listPersonnel: any[] = [];
  listEnfants: any[] = [];
  listBanque: any[] = [];
  listAgence: any[] = [];
  listAgenceFiltre: any[] = [];
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
    this.formBanque = this.fb.group({
      cod_banq: [""],
      lib_banq: [""],
      lib_banq_a: [""],
       
    });
    this.formAgence = this.fb.group({
      Agence: this.fb.array([
        this.fb.group({
          cod_banq: [""],
          cod_agc: [""],
          lib_agc: [""],
          lib_agc_a: [""],
        }),
      ]), // FormArray for dynamic children
    });
  }
  ngOnInit(): void {
    
 this.getBanque()
  }

  /////////////////////////////////////////////////////////////
  columnTitles: { [key: string]: string } = {
    cod_banq: "Code banque",
    lib_banq: "Libellé banque.",
    lib_banq_a: "Libellé banque. arab", 
  };
  columnTitles2: { [key: string]: string } = {
    cod_agc: "Code agence",
    lib_agc: "Libellé agence",
    lib_agc_a: "Libellé agence. arab"
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
    cod_banq: "",
    lib_banq: "",
    lib_banq_a: "", 
  };
  searchz2: any = {
    cod_gouv: "",
    cod_poste:"",
    lib_post: "",
    lib_poste_a: "", 
  };
  applyFilter() {
    this.listBanque = this.listBanqueFiltre.filter((row) => {
     return Object.keys(this.searchz).every((key) => {
       const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
       const rowValue = row[key]?.toString().toLowerCase() || "";
       return rowValue.includes(searchValue);
     });
   });
 }
 

 applyFilter2() {
  this.listAgence = this.listAgenceFiltre.filter((row) => {
   return Object.keys(this.searchz2).every((key) => {
     const searchValue = this.searchz2[key]?.toString().toLowerCase() || "";
     const rowValue = row[key]?.toString().toLowerCase() || "";
     return rowValue.includes(searchValue);
   });

 });

}
 onSort2(column: any) {
  this.listAgence = this.service.onSort(
    column,
    this.listAgence
  );
}



//////////////////////////////////////////////////////
  banqueEnEdition: any = null;

  editBanque(row: any, content: any) {
    this.edit = false;
    this.banqueEnEdition = row;
    this.formBanque.reset({
      cod_banq: row.cod_banq,
      lib_banq: row.lib_banq,
      lib_banq_a: row.lib_banq_a,
    });
    this.modalService.open(content, { size: "xl", centered: true });
  }

  supprimerBanque(row: any) {
    Swal.fire({
      title: "Supprimer cette banque ?",
      html: `Code <b>${row.cod_banq}</b> – ${row.lib_banq ?? ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.serv.deleteBanque(row.cod_banq).subscribe({
        next: () => {
          if (this.codBanq === row.cod_banq) {
            this.listAgence = [];
            this.listAgenceFiltre = [];
            this.codBanq = null;
          }
          this.getBanque();
          Swal.fire({ position: "top-end", icon: "success", title: "Banque supprimée avec succès !", showConfirmButton: false, timer: 2000 });
        },
        error: (err) => {
          const message = typeof err?.error === "string" && err.error ? err.error : "Suppression impossible";
          Swal.fire({ icon: "error", title: "Suppression impossible", text: message });
        },
      });
    });
  }

  saveBanque() {
    // En modification, on conserve les champs non affichés (adresse, tél, ...)
    const banque = this.edit ? this.formBanque.value : { ...this.banqueEnEdition, ...this.formBanque.value };
     this.serv.AddBanque(banque).subscribe((data) => {
      console.log("data :", data);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.getBanque()
    });
  }
 
  saveAgence() {
    const formArray = this.formAgence.get("Agence") as FormArray;
  
    // Mise à jour directe du champ cod_banq dans le FormGroup du FormArray
    const formGroup = formArray.at(0) as FormGroup;
    formGroup.get("cod_banq")?.setValue(this.codBanq);
  
    const agenceFormArray = formArray.value;
    console.log("Données envoyées :", agenceFormArray);
  
    if (!agenceFormArray[0]?.cod_banq) {
      console.error("cod_banq est vide !");
      return;
    }
  
    this.serv.AddAgence(agenceFormArray).subscribe((data) => {
      console.log("Saved data:", data);
  
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouté avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
  
      const codBanq = agenceFormArray[0]?.cod_banq;
  
      if (codBanq) {
        this.serv.getAgence(codBanq).subscribe((data) => {
          console.log("Agence reloaded data:", data);
          this.listAgence = data;
          this.listAgenceFiltre = data;
        });
      } else {
        console.warn("cod_banq is missing, cannot reload agences");
      }
    });
  }
  
  
  
  onSort(column: any) {
   
    this.listBanque = this.service.onSort(column, this.listBanque);
  }
 
  get Agence(): FormArray {
    return this.formAgence.get("Agence") as FormArray;
  }
  addAgence() {
    this.Agence.push(
      this.fb.group({
        cod_banq: [""],
        cod_agc: [""],
        lib_agc: [""],
        lib_agc_a: [""],
      })
    );
  }

  removeEnfant(index: number) {
    this.Agence.removeAt(index);
  }
  openModalTab(content: any) {
    this.edit = true;

    this.formBanque.reset()
    this.formAgence.reset()
    this.modalService.open(content, { size: "xl", centered: true });
  }

  editDataGet(id: any, data: any, content: any) {
    console.log("data test", data, 'id : ', id, ' content   : ', content);
    this.edit = false;
  
    // Access the FormArray
    const agenceArray = this.formAgence.get('Agence') as FormArray;
  
    // Safety check: make sure there is at least one group
    if (agenceArray.length > 0) {
      const firstGroup = agenceArray.at(0) as FormGroup;
  
      firstGroup.patchValue({
        cod_banq: data?.cod_banq || '',
        cod_agc: data?.cod_agc || '',
        lib_agc: data?.lib_agc || '',
        lib_agc_a: data?.lib_agc_a || ''
      });
  
      this.modalService.open(content, { size: "xl", centered: true });
    } else {
      console.error("No form group available in Agence array.");
    }
  }
  
   getBanque () {
 

    this.serv
      .getBanque()
      .subscribe((data) => {
        console.log("data", data);
        this.listBanque = data;
        this.listBanqueFiltre=data
      });
  }
  selectedRow: number | null = null;
  codBanq:any
  getAgence(event: any) {
    this.codBanq = event.cod_banq;
  
    const formArray = this.formAgence.get("Agence") as FormArray;
    const formGroup = formArray.at(0) as FormGroup;
  
    if (formGroup) {
      formGroup.patchValue({
        cod_banq: event.cod_banq
      });
    this.codBanq = formGroup.value.cod_banq;

      console.log("Patched cod_banq:", formGroup.value.cod_banq);
    } else {
      console.error("Form group not found at index 0");
    }
  
    this.serv.getAgence(event.cod_banq).subscribe((data) => {
      console.log("Agence data:", data);
      this.listAgence = data;
      this.listAgenceFiltre = data;
    });
  }
  
  
  deleteId: any;
  confirm(content: any, id: any) {
    console.log("annee:",id)
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDelete() {
 
  
    // ✅ Envoyer un seul objet, pas un tableau
    const agenceToDelete = {
      cod_banq: this.deleteId.cod_banq,
      cod_agc: this.deleteId.cod_agc
    };
  console.log("agenceToDelete", this.deleteId )
    this.serv.deleteAgence( agenceToDelete ).subscribe((data) => {
      // Vous pouvez actualiser la liste après suppression
      this.serv.getAgence(this.codBanq).subscribe((agences) => {
        this.listAgence = agences;
        this.listAgenceFiltre = agences;
      });
    });
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

