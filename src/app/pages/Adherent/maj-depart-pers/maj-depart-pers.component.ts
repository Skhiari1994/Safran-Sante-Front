import { AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { Component } from '@angular/core';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { SaveService } from 'src/app/shared/Service/save.service';
import { TokenStorage } from 'src/app/account/token-storage.service';

@Component({
  selector: 'app-maj-depart-pers',
  templateUrl: './maj-depart-pers.component.html',
  styleUrl: './maj-depart-pers.component.scss'
})
export class MajDepartPersComponent  {
  pSusp: any;
  listTypeDepart:any[]=[]
  listDepart:any[]=[]
  listDepartAFiltrer:any[]=[]
  listPersonnelDepart:any[]=[]
  columnsSearch: any[] = [];
  columnsTypDepart: any[] = [];
  matPersVal?: string;
  codTypDepartVal?: string;
  nomPren?:String=''
  breadCrumbItems!: Array<{}>;

  datEmb?:String=''
  cod_lieu_geog?:String=''
  cod_affect?:String=''
  lib_lieu?:String=''
  libAffect?:String=''
  corps?:String=''
  datNais?:String=''
  libTypDepart?:String=''
  edit: boolean = false;
  formDepartPers:FormGroup
  save!: boolean;
  isDisabled!: boolean;
 constructor(private serv :AdherentService,public service: PaginationService, private modalService: NgbModal,private fb:FormBuilder,
  private saveService: SaveService,private tokenStorage:TokenStorage
 ){
  this.formDepartPers = this.fb.group({
    cod_soc:[this.tokenStorage.getUser().codSoc],
    mat_pers:[],
    cod_typ_depart:[],
    dat_depart:[],
    dat_sais_depart:[],
    obs_depart:[],
    etat_depart:['I'],
    corps:[{value:'',disabled:true}],
    cod_affect:[],
    cod_lieu_geog:[],
    
  });
 }
  ngOnInit(): void {
  /*   this.saveService.canSave$.subscribe((canSave) => {
      this.save = canSave;
      if (this.save) {
        this.saveDepartPers();
      }
    });
    this.formDepartPers.valueChanges.subscribe(() => {
      this.isDisabled = this.formDepartPers.pristine;
      this.saveService.setDisabled(!this.isDisabled);
    }); */
    this.getListDepart()
    this.getListPersonnelDepart()
    this.getTypeDepart()
  }


  
  onSort(column: any) {
    this.listDepart = this.service.onSort(
      column,
      this.listDepart
    );
  }
  searchz: any = {
    mat_pers: "",
    nomPers: "",
    dat_depart: "",
    libDepart: "",
    dat_sais_depart: "",
    etat_depart: "",
    obs_depart:""
  };
  
 
  columnTitles: { [key: string]: string } = {
    mat_pers: "Matricule",
    nomPers: "",
    dat_depart: "Nom & Prénom",
    libDepart: "Date départ",
    dat_sais_depart: "Motif départ",
    etat_depart: "Date saisie",
    obs_depart:"Etat décision"
  };


  showFilters: { [key: string]: boolean } = {};
 
  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }
 
  
  applyFilter() {
    this.listDepart = this.listDepartAFiltrer.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
       const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
       const rowValue = row[key]?.toString().toLowerCase() || "";
       return rowValue.includes(searchValue);
     });
   });
   //console.log("this.listAffilMutuelle :",this.listAffilMutuelle)

 }

 /////////////////////////////////////////////
  getTypeDepart(){
    this.serv.getTypeDepart().subscribe(data => {
      this.listTypeDepart = data;
       // Définir les colonnes dynamiques du tableau
      this.columnsTypDepart = [
        { key: 'cod_typ_depart', label: 'Code' },
        { key: 'lib_typ_depart', label: 'Libelle' },
        { key: 'etat_act', label: 'Etat' },

       // { key: 'lib_tit_a', label: 'Libellé 2éme langue' }
      ];
 
    });
  }
  getListDepart(){
    this.serv.getListDepart(this.tokenStorage.getUser().codSoc).subscribe(data=>{
      this.listDepart=data
      this.listDepartAFiltrer=data
    })
  }
  getListPersonnelDepart(){
    this.serv.getListPersonnelDepart(this.tokenStorage.getUser().codSoc).subscribe(data=>{
      this.listPersonnelDepart=data

      this.columnsSearch = [
        { key: "mat_pers", label: "Matricule" },
        { key: "nomPren", label: "Nom & Prénom" },
        { key: "cod_lieu_geog", label: "Département" },
        { key: "cod_affect", label: "Affectation" },
        { key: "corps", label: "Corps" },
      ];
    })
  }

  onSelectedValuePers(item: any) {
    console.log("item :",item)
    this.nomPren = item.nomPren; // Mise à jour du champ libellé
     this.datEmb = item.dat_emb;
     this.cod_lieu_geog = item.cod_lieu_geog;
     this.cod_affect=item.cod_affect
     this.lib_lieu=item.lib_lieu
     this.libAffect=item.libAffect
     this.corps=item.corps
    this.datNais = item.dat_nais;
     this.formDepartPers.patchValue({
      mat_pers: item.mat_pers,
      cod_soc: this.tokenStorage.getUser().codSoc,
      corps: item.corps,
      cod_lieu_geog:item.cod_lieu_geog,
      cod_affect: item.cod_affect,
    });
  }

  onSelectedValueTypDepart(item: any) {
    //  this.codTypDepart = item.cod_typ_depart; // Mise à jour du champ code
    this.libTypDepart = item.lib_typ_depart; // Mise à jour du champ libellé
    this.formDepartPers.patchValue({
      cod_typ_depart: item.cod_typ_depart,
    });
  }



  saveDepartPers() {
    console.log("this.formAffilMutuelle.value :", this.formDepartPers.value);
    this.serv
      .AddDepartPers(this.formDepartPers.value)
      .subscribe((data) => {
        console.log("data :", data);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouter avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        this.getListDepart();
      });
  }

  openModalTab(content: any) {
    this.edit = false;
    console.log("edit :",this.edit)
    //this.formCertif.reset()
    this.modalService.open(content, { size: "lg", centered: true });
    this.formDepartPers.reset()
    this.nomPren = '',
    this.matPersVal = '',
    this.datEmb =  '',
    this.lib_lieu='',
    this.libAffect='',
    this.libTypDepart='',
    this.codTypDepartVal='',
    this.datNais = '',
     this.cod_lieu_geog = '',
    this.cod_affect=''
  }


  editDataGet(id: any, data: any, content: any) {
    this.edit=true
    console.log("edit :",this.edit)
    this.modalService.open(content, { size: "lg", centered: true });
    
    this.formDepartPers.get("mat_pers")?.patchValue(data.mat_pers);
    this.formDepartPers.get("cod_typ_depart")?.patchValue(data.cod_typ_depart);
    this.formDepartPers.get("dat_depart")?.patchValue(data.dat_depart);
    this.formDepartPers.get("cod_affect")?.patchValue(data.cod_affect);
    this.formDepartPers.get("dat_sais_depart")?.patchValue(data.dat_sais_depart);
    this.formDepartPers.get("obs_depart")?.patchValue(data.obs_depart);
    this.formDepartPers.get("etat_depart")?.patchValue(data.etat_depart);
    this.formDepartPers.get("corps")?.patchValue(data.corps);
    this.formDepartPers.get("cod_lieu_geog")?.patchValue(data.cod_lieu_geog);
    this.formDepartPers.get("cod_typ_depart")?.patchValue(data.cod_typ_depart);
    this.nomPren = data.nomPers; // Mise à jour du champ libellé
    this.matPersVal = data.mat_pers;

    this.datEmb = data.dat_emb;
    this.lib_lieu=data.libLieu
    this.libAffect=data.libAffect
    this.libTypDepart=data.libDepart
    this.codTypDepartVal=data.cod_typ_depart
    this.datNais = data.dat_nais;
     this.cod_lieu_geog = data.cod_lieu_geog;
    this.cod_affect=data.cod_affect
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
 validatelistDepartPers(): void {
  // Function to format dates within a FormGroup for specified fields
  const formatDates = (form: FormGroup, fields: string[]): void => {
    fields.forEach((field) => {
      const control = form.get(field); // Get the control
      if (control) {
        const value = this.formatDate(control.value); // Format the date using your custom method
        control.setValue(value); // Update the control with the formatted value
      }
    });
  };

  // Check if `formDepartPers` is a valid FormGroup
  if (this.formDepartPers instanceof FormGroup) {
    // Format the specified date fields
    formatDates(this.formDepartPers, ["dat_depart", "dat_sais_depart"]);

    // Update `listDepart` with the form values
    this.listDepart = [
      this.formDepartPers.getRawValue(),
      ...this.listDepart
    ];  } else {
    console.error("formDepartPers is not a valid FormGroup.");
  }
  this.saveDepartPers();

}

}
