import { Component } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { AdherentService } from "../adherent.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { PaginationService } from "src/app/core/services/pagination.service";
import { SaveService } from "src/app/shared/Service/save.service";
import Swal from "sweetalert2";
import { forkJoin } from "rxjs";
import { TokenStorage } from "src/app/account/token-storage.service";

@Component({
  selector: "app-validation-susp-et-valid-adherent",
  templateUrl: "./validation-susp-et-valid-adherent.component.html",
  styleUrl: "./validation-susp-et-valid-adherent.component.scss",
})
export class ValidationSuspEtValidAdherentComponent {
  formAdherent!: FormGroup;
  formAffilMutuelle!: FormGroup;
  pSusp: any;
  deleteId: any;
  listAffilMutuelle: any[] = [];
  listTrans: any[] = [];
  save!: boolean;
  isDisabled!: boolean;
  breadCrumbItems!: Array<{}>;

  edit: boolean = true;
  nomPers: any;
  constructor(
    private fb: FormBuilder,
    private adherentServ: AdherentService,
    private modalService: NgbModal,
    public service: PaginationService,
    private saveService: SaveService,private tokenStorage:TokenStorage
  ) {
    this.formAdherent = this.fb.group({
      cod_soc: [""],
      mat_pers: [""],
      cod_assur: [""],
      nom_pers: [""],
      etat_act: [""],
      dat_emb: [""],
      cod_sit: [""],
      nbr_enf: [""],
      num_assur: [""],
      dat_ass: [""],
    });
    this.formAffilMutuelle = this.fb.group({
      cod_soc: [""],
      mat_pers: [""],
      dat_ass: [""],
      num_assur: [""],
      typ_aff: [{ value: "", disabled: true }],
      dat_dem: [""],
      obs_aff: [""],
      coef_cot: [""],
      etat_aff: ["I"],
      corps: [""],
      cod_typ_depart: [""],
      cod_affect: [""],
    });
  }

  ngOnInit(): void {
    this.saveService.canSave$.subscribe((canSave) => {
      this.save = canSave;
      if (this.save) {
        //this.saveAffiliation();
      }
    });
    this.formAffilMutuelle.valueChanges.subscribe(() => {
      this.isDisabled = this.formAffilMutuelle.pristine;
      this.saveService.setDisabled(!this.isDisabled);
    });
    this.getAffilMutuelle();
  }

  onSort(column: any) {
    this.listAffilMutuelle = this.service.onSort(
      column,
      this.listAffilMutuelle
    );
  }
  searchz: any = {
    mat_pers: "",
    nompren: "",
    dat_dem: "",
    typ_aff: "",
    dat_ass: "",
    coef_cot: "",
    etat_aff:""
  };
  
  columnTitles: { [key: string]: string } = {
    mat_pers: "Matricule",
    nompren: "Nom & Prénom",
    dat_dem: "Date demande",
    typ_aff: "Nature",
    dat_ass: "Date Aff",
    coef_cot: "Coef.cot",
    etat_aff:"Etat"
  };


  showFilters: { [key: string]: boolean } = {};
 
  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }
 
  
  applyFilter() {
    this.listAffilMutuelle = this.listTrans.filter((row:any) => {
     return Object.keys(this.searchz).every((key) => {
       const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
       const rowValue = row[key]?.toString().toLowerCase() || "";
       return rowValue.includes(searchValue);
     });
   });
   //console.log("this.listAffilMutuelle :",this.listAffilMutuelle)

 }

 /////////////////////////////////////////////////////////////
  getAffilMutuelle() {
    this.adherentServ.getAffilMutuelleEnInstance(this.tokenStorage.getUser().codSoc).subscribe((data) => {
      this.listAffilMutuelle = data;
      this.listTrans = data;
    });
  }
  executeValiderAff() {
    console.log("this.listAffilMutuelle", this.listAffilMutuelle);
  
    // 🔄 Show loading spinner
    Swal.fire({
      title: 'Chargement...',
      html: 'Veuillez patienter pendant la validation.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    const observables = this.listAffilMutuelle.map((item) => {
      const { cod_soc, etat_aff, typ_aff, mat_pers, dat_ass } = item;
      console.log('item :', item);
      return this.adherentServ.ValiderAff(cod_soc, etat_aff, typ_aff, mat_pers, dat_ass);
    });
  
    forkJoin(observables).subscribe({
      next: (responses) => {
        console.log('Toutes les réponses :', responses);
  
        // ✅ Close loading before showing success
        Swal.close();
  
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Validation avec succès !',
          showConfirmButton: false,
          timer: 2000,
        });
      },
      error: (error) => {
        console.error("Erreur lors de l'exécution des appels :", error);
  
        // ✅ Close loading before showing error
        Swal.close();
  
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Échec de la validation.',
        });
      },
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
  validatelistCertifFam(): void {
    // Fonction pour formater les dates d'un FormGroup donné

    let param = {
      cod_soc: this.tokenStorage.getUser().codSoc,
      mat_pers: this.formAffilMutuelle.get("mat_pers")?.value,
      dat_ass: this.formAffilMutuelle.get("dat_ass")?.value,
    };
    this.adherentServ
      .updateEtat(param, this.formAffilMutuelle.get("etat_aff")?.value)
      .subscribe((data: any) => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouter avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });

        this.getAffilMutuelle();
      });

    
    /* // Mise à jour des données dans `listAffilMutuelle`
    this.listAffilMutuelle = [{ ...this.formAffilMutuelle.value }]; // Utilise un spread operator pour créer une copie
    console.log("this.listAffilMutuelle:", this.listAffilMutuelle);
    console.log("this.formAffilMutuelle:", this.formAffilMutuelle.value);
  } else {
    console.error("Erreur : formAffilMutuelle n'est pas un FormGroup valide.");
  }*/
  }

  editDataGet(id: any, data: any, content: any) {
    this.edit = true;
    console.log("data :", data);
    this.edit = false;
    this.modalService.open(content, { size: "lg", centered: true });

    this.formAffilMutuelle.get("mat_pers")?.patchValue(data.mat_pers);
    this.formAffilMutuelle.get("dat_dem")?.patchValue(data.dat_dem);
    this.formAffilMutuelle.get("typ_aff")?.patchValue(data.typ_aff);
    this.formAffilMutuelle.get("dat_ass")?.patchValue(data.dat_ass);
    this.formAffilMutuelle.get("coef_cot")?.patchValue(data.coef_cot);
    this.formAffilMutuelle.get("etat_aff")?.patchValue(data.etat_aff);
    this.nomPers = data.nompren; // Mise à jour du champ libellé
  }
}
