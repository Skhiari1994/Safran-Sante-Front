import { Component } from '@angular/core';

import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { AdherentService } from "../adherent.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SaveService } from "src/app/shared/Service/save.service";
import { PaginationService } from "src/app/core/services/pagination.service";
import Swal from "sweetalert2";
import { TokenStorage } from 'src/app/account/token-storage.service';

@Component({
  selector: 'app-renouvellement-adhesion',
  templateUrl: './renouvellement-adhesion.component.html',
  styleUrl: './renouvellement-adhesion.component.scss'
})
export class RenouvellementAdhesionComponent {
 formAdherent!: FormGroup;
  formAffilMutuelle!: FormGroup;
  pSusp: any;
  deleteId: any;
  isSearch: boolean = true;
  listPersonnel: any[] = [];
  listCorps: any[] = [];
  listAffilMutuelle: any[] = [];
  breadCrumbItems!: Array<{}>;

  listTrans: any[] = [];
  listTypeDepart: any[] = [];
  listAffectation: any[] = [];
  columnsTypDepart: any[] = [];
  columnAffect: any[] = [];
  columnsSearch: any[] = [];
  codAffectVal?: string;
  codTypDepartVal?: string;
  matPersVal?: string;
  libTypDepart: string = "";
  libAffect: string = "";
  nomPers: string = "";
  prenPers: string = "";
  datEmb: string = "";
  codSit: string = "";
  cin: string = "";
  etatAct: string = "";
  nbrEnf: string = "";
  save!: boolean;
  isDisabled!: boolean;
  edit: boolean = true;
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
      
      cod_typ_depart: [""],
      cod_affect: [""],
    });
    this.formAffilMutuelle = this.fb.group({
      cod_soc: [""],
      mat_pers: [""],
      dat_ass: [""],
      num_assur: [""],
      typ_aff: ["S"],
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
   /*  this.saveService.canSave$.subscribe((canSave) => {
      this.save = canSave;
      if (this.save) {
        this.saveAffiliation();
      }
    });
    this.formAffilMutuelle.valueChanges.subscribe(() => {
      this.isDisabled = this.formAffilMutuelle.pristine;
      this.saveService.setDisabled(!this.isDisabled);
    }); */
    this.getCorps();
    this.getAffilMutuelle();
    this.getAffectation();
    this.getTypeDepart();
    this.getPersonnels();
   } 
   getPersonnels() {
    this.adherentServ.getAffilPersMut(this.tokenStorage.getUser().codSoc).subscribe((data) => {
      console.log("personnel", data);
      this.listPersonnel = data;
      this.columnsSearch = [
        { key: "mat_pers", label: "Matricule" },
        { key: "nom_pers", label: "Nom" },
        { key: "pren_pers", label: "Prénom" },
        { key: "etat_act", label: "Etat" },
      ];
    });
  }
 /////////////////////////////////////////////////////////////////////
 
 onSort(column: any) {
  this.listAffilMutuelle = this.service.onSort(
    column,
    this.listAffilMutuelle
  );
}
searchz: any = {
  dat_dem: "",
  num_assur: "",
  typ_aff: "",
  dat_ass: "",
  coef_cot: "",
  obs_aff:"Obs"
};

columnTitles: { [key: string]: string } = {
  dat_dem: "Date demande",
  num_assur: "Num assur",
  typ_aff: "Type aff",
  dat_ass: "Date assur",
  coef_cot: "Coef",
  obs_aff:"Obs"
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

}
 ////////////////////////////////////////////////////////
  getCorps() {
    this.adherentServ.getCorps().subscribe((data) => {
      this.listCorps = data;
    });
  }
  getAffilMutuelle() {
    this.adherentServ.getAffilMutuelle().subscribe((data) => {
      this.listAffilMutuelle = data;
      this.listTrans = data;
    });
  }
  openModalTab(content: any) {

    this.formAffilMutuelle.reset({})
    this.edit = true;

    //this.formCertif.reset()
    this.modalService.open(content, { size: "lg", centered: true });
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
    const formatDates = (form: FormGroup, fields: string[]): string[] => {
      return fields.reduce<string[]>((formatted, field) => {
        const control = form.get(field); // Récupère le contrôle
        if (control) {
          const value = this.formatDate(control.value); // Appel de votre méthode pour formater la date
          control.setValue(value); // Met à jour la valeur formatée dans le champ
          if (value) {
            formatted.push(value); // Ajoute la valeur formatée au tableau
          }
        }
        return formatted;
      }, []);
    };

    // Vérifie si le FormGroup 'formAffilMutuelle' est valide avant de procéder
    if (this.formAffilMutuelle instanceof FormGroup) {
      // Récupère et formate les dates spécifiées
      const adherentDates = formatDates(this.formAffilMutuelle, [
        "dat_ass",
        "dat_dem",
      ]);
    }
    /* // Mise à jour des données dans `listAffilMutuelle`
    this.listAffilMutuelle = [{ ...this.formAffilMutuelle.value }]; // Utilise un spread operator pour créer une copie
    console.log("this.listAffilMutuelle:", this.listAffilMutuelle);
    console.log("this.formAffilMutuelle:", this.formAffilMutuelle.value);
  } else {
    console.error("Erreur : formAffilMutuelle n'est pas un FormGroup valide.");
  }*/
    this.saveAffiliation();
  }

  confirm(content: any, id: any) {
    console.log("annee:", id);
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDelete() {
     this.adherentServ.deleteAffil(this.deleteId.cod_soc,this.deleteId.mat_pers,this.deleteId.dat_ass).subscribe(data=>{
      this.adherentServ
    .getAffilMutuelle()
    .subscribe((data) => {
      console.log("data", data);
      this.listAffilMutuelle = data;
    });
    })
  }
  editDataGet(id: any, data: any, content: any) {
    this.edit=true
    if(this.edit=false)
    console.log("data :",data)
    this.edit = false;
    this.modalService.open(content, { size: "lg", centered: true });
    this.matPersVal = data.mat_pers;
    
    this.formAffilMutuelle.get("num_assur")?.patchValue(data.num_assur);
    this.formAffilMutuelle.get("dat_dem")?.patchValue(data.dat_dem);
    this.formAffilMutuelle.get("typ_aff")?.patchValue(data.typ_aff);
    this.formAffilMutuelle.get("dat_ass")?.patchValue(data.dat_ass);
    this.formAffilMutuelle.get("coef_cot")?.patchValue(data.coef_cot);
    this.formAffilMutuelle.get("obs_aff")?.patchValue(data.obs_aff);
    this.formAffilMutuelle.get("cod_soc")?.patchValue(this.tokenStorage.getUser().codSoc);

    this.matPersVal=data.mat_pers
    this.nomPers = data.nom_pers; // Mise à jour du champ libellé
    this.prenPers = data.pren_pers;
    this.datEmb = data.dat_emb;
    this.codSit = data.cod_sit;
    this.cin = data.cin;
    this.etatAct = data.etat_act;
    this.nbrEnf = data.nbr_enf;
    this.codAffectVal=data.cod_affect;
    this.codTypDepartVal=data.cod_typ_depart;
    this.formAffilMutuelle.patchValue({
      mat_pers: data.mat_pers,
      cod_soc: this.tokenStorage.getUser().codSoc,
      corps: data.corps,
      num_assur: data.num_assur,
    });
 
    this.adherentServ.getAffilPersByMat(this.tokenStorage.getUser().codSoc,data.mat_pers).subscribe((data:any)=>{
      this.nomPers = data.nom_pers; // Mise à jour du champ libellé
      this.prenPers = data.pren_pers;
      this.datEmb = data.dat_emb;
      this.codSit = data.cod_sit;
      this.cin = data.cin;
      this.etatAct = data.etat_act;
      this.nbrEnf = data.nbr_enf;
     

    })
  }

  getTypeDepart() {
    this.adherentServ.getTypeDepart().subscribe((data) => {
      this.listTypeDepart = data;
      // Définir les colonnes dynamiques du tableau
      this.columnsTypDepart = [
        { key: "cod_typ_depart", label: "Code" },
        { key: "lib_typ_depart", label: "Libelle" },
        { key: "etat_act", label: "Etat" },

        // { key: 'lib_tit_a', label: 'Libellé 2éme langue' }
      ];
    });
  }

  onSelectedValueTypDepart(item: any) {
    //  this.codTypDepart = item.cod_typ_depart; // Mise à jour du champ code
    this.libTypDepart = item.lib_typ_depart; // Mise à jour du champ libellé
    this.formAffilMutuelle.patchValue({
      cod_typ_depart: item.cod_typ_depart,
    });
  }

  getAffectation() {
    this.adherentServ.getAffectation().subscribe((data) => {
      this.listAffectation = data;
      this.columnAffect = [
        { key: "cod_affect", label: "Code" },
        { key: "lib_affect", label: "Libelle" },
        { key: "lib_affect_a", label: "Libelle arabe" },
      ];
    });
  }
  onSelectedValueAffect(item: any) {
    //   this.codAffect = item.cod_affect; // Mise à jour du champ code
    if (item.cod_affect) {
      this.libAffect = item.lib_affect; // Mise à jour du champ libellé
    }
    this.formAffilMutuelle.patchValue({
      cod_affect: item.cod_affect,
    });
  }

  onSelectedValuePers(item: any) {
    this.matPersVal=item.mat_pers
    this.nomPers = item.nom_pers; // Mise à jour du champ libellé
    this.prenPers = item.pren_pers;
    this.datEmb = item.dat_emb;
    this.codSit = item.cod_sit;
    this.cin = item.cin;
    this.etatAct = item.etat_act;
    this.nbrEnf = item.nbr_enf;
    this.formAffilMutuelle.patchValue({
      mat_pers: item.mat_pers,
      cod_soc: this.tokenStorage.getUser().codSoc,
      corps: item.corps,
      num_assur: item.num_assur,
    });
  }
  saveAffiliation() {
    console.log("this.formAffilMutuelle.value :", this.formAffilMutuelle.value);
    this.adherentServ
      .AddAffiliation(this.formAffilMutuelle.value)
      .subscribe((data) => {
        console.log("data :", data);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouter avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        this.getAffilMutuelle();
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
}
