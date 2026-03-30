import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { AdherentService } from '../adherent.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SaveService } from 'src/app/shared/Service/save.service';
import { TokenStorage } from 'src/app/account/token-storage.service';

@Component({
  selector: 'app-val-depart-reintegration-pers',
  templateUrl: './val-depart-reintegration-pers.component.html',
  styleUrl: './val-depart-reintegration-pers.component.scss'
})
export class ValDepartReintegrationPersComponent {
 pSusp: any;
  listTypeDepart:any[]=[]
  listDepartReinteg:any[]=[]
  listDepartReintegAFiltrer:any[]=[]
  listPersonnelReinteg:any[]=[]
  columnsSearch: any[] = [];
  columnsTypDepart: any[] = [];
  matPersVal?: string;
  codTypDepartVal?: string;
  nomPren?:String=''
  datEmb?:String=''
  datDepart?:String=''
  codDepart?:String=''
  cod_lieu_geog?:String=''
  cod_affect?:String=''
  lib_lieu?:String=''
  libAffect?:String=''
  libDepart?:String=''
  corps?:String=''
  datNais?:String=''
  libTypDepart?:String=''
  edit: boolean = false;
  formReintegPers:FormGroup
  save!: boolean;
  isDisabled!: boolean;
 constructor(private serv :AdherentService,public service: PaginationService, private modalService: NgbModal,private fb:FormBuilder,
  private saveService: SaveService,private tokenStorage:TokenStorage
 ){
  this.formReintegPers = this.fb.group({
    cod_soc:[this.tokenStorage.getUser().codSoc],
    mat_pers:[],
    cod_typ_depart:[],
    dat_depart:[],
    dat_sais_depart:[],
    obs_depart:[],
    etat_depart:[''],
    corps:[{value:'',disabled:true}],
    cod_affect:[],
    cod_lieu_geog:[],
    
  });
 }
  ngOnInit(): void {
   /*  this.saveService.canSave$.subscribe((canSave) => {
      this.save = canSave;
      if (this.save) {
      }
    }); */
    this.formReintegPers.valueChanges.subscribe(() => {
      this.isDisabled = this.formReintegPers.pristine;
      this.saveService.setDisabled(!this.isDisabled);
    });
    this.getListReinteg()
    this.getListPersonnelReinteg()
    this.getTypeDepart()
  }


  /////////////////////////////////////////////////////////////////

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
    nomPers: "Nom & Prénom",
    dat_depart: "Date départ",
    libDepart: "Motif départ",
    dat_sais_depart: "Date saisie",
    etat_depart: "Etat décision",
    obs_depart:"Observation"
  };

  showFilters: { [key: string]: boolean } = {};
 
  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }
 
  onSort(column: any) {
    this.listDepartReinteg= this.service.onSort(
      column,
      this.listDepartReinteg
    );
  }

  applyFilter() {
    this.listDepartReinteg = this.listDepartReintegAFiltrer.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
       const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
       const rowValue = row[key]?.toString().toLowerCase() || "";
       return rowValue.includes(searchValue);
     });
   });
   //console.log("this.listAffilMutuelle :",this.listAffilMutuelle)

 }
 /////////////////////////////////////////////////////////
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
  getListReinteg(){
    this.serv.getListPersonnelDepartReinteg(this.tokenStorage.getUser().codSoc).subscribe(data=>{
      this.listDepartReinteg=data
      this.listDepartReintegAFiltrer=data
    })
  }
  getListPersonnelReinteg(){
    this.serv.getListPersonnelReinteg(this.tokenStorage.getUser().codSoc).subscribe(data=>{
      this.listPersonnelReinteg=data

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
     this.datDepart=item.dat_depart
     this.codDepart=item.cod_typ_depart
     this.libDepart=item.libDepart
    this.datNais = item.dat_nais;
     this.formReintegPers.patchValue({
      mat_pers: item.mat_pers,
      cod_soc: "01",
      corps: item.corps,
      cod_affect:item.cod_affect,
      cod_lieu_geog:item.cod_lieu_geog,
      cod_typ_depart:"10",
    });
  }

  onSelectedValueTypDepart(item: any) {
    //  this.codTypDepart = item.cod_typ_depart; // Mise à jour du champ code
    this.libTypDepart = item.lib_typ_depart; // Mise à jour du champ libellé
    this.formReintegPers.patchValue({
      cod_typ_depart: item.cod_typ_depart,
    });
  }


  saveDepartPers() {
    console.log("this.formAffilMutuelle.value :", this.formReintegPers.value);
    this.serv
      .AddDepartPers(this.formReintegPers.value)
      .subscribe((data) => {
        console.log("data :", data);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouter avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        this.getListReinteg();
      });
  }

  openModalTab(content: any) {
    this.edit = false;
    console.log("edit :",this.edit)
    //this.formCertif.reset()
    this.modalService.open(content, { size: "lg", centered: true });
    this.formReintegPers.reset()
    this.formReintegPers.get('etat_depart')?.patchValue('I')
    this.nomPren = '',
    this.matPersVal = '',
    this.datEmb =  '',
    this.lib_lieu='',
    this.libAffect='',
    this.libTypDepart='',
    this.codTypDepartVal='',
    this.datNais = '',
     this.cod_lieu_geog = '',
    this.cod_affect='',
    this.codDepart='',
    this.libDepart='',
    this.datDepart=''

  }


  editDataGet(id: any, data: any, content: any) {
    this.edit=true
    console.log("edit :",this.edit)
    this.modalService.open(content, { size: "lg", centered: true });
    
    this.formReintegPers.get("mat_pers")?.patchValue(data.mat_pers);
    this.formReintegPers.get("cod_typ_depart")?.patchValue(data.cod_typ_depart);
    this.formReintegPers.get("dat_depart")?.patchValue(data.dat_depart);
    this.formReintegPers.get("cod_affect")?.patchValue(data.cod_affect);
    this.formReintegPers.get("dat_sais_depart")?.patchValue(data.dat_sais_depart);
    this.formReintegPers.get("obs_depart")?.patchValue(data.obs_depart);
    this.formReintegPers.get("etat_depart")?.patchValue(data.etat_depart);
    this.formReintegPers.get("corps")?.patchValue(data.corps);
    this.formReintegPers.get("cod_lieu_geog")?.patchValue(data.cod_lieu_geog);
    this.formReintegPers.get("cod_typ_depart")?.patchValue(data.cod_typ_depart);
    this.nomPren = data.nomPers; // Mise à jour du champ libellé
    this.matPersVal = data.mat_pers;
    this.datDepart=data.dat_depart
    this.datEmb = data.datEmb;
    this.lib_lieu=data.libLieu
    this.libAffect=data.libAffect
    this.libTypDepart=data.libDepart
    this.codTypDepartVal=data.cod_typ_depart
    this.datNais = data.datNais;
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

  // Check if `formReintegPers` is a valid FormGroup
  if (this.formReintegPers instanceof FormGroup) {
    // Format the specified date fields
    formatDates(this.formReintegPers, ["dat_depart", "dat_sais_depart"]);

    // Update `listDepart` with the form values
    this.listDepartReinteg = [
      this.formReintegPers.getRawValue(),
      ...this.listDepartReinteg
    ];  } else {
    console.error("formReintegPers is not a valid FormGroup.");
  }
  this.saveDepartPers();

}

}
