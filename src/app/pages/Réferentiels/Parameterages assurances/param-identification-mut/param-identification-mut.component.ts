import { Component } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { AssurService } from "../assur.service";
import { SaveService } from "src/app/shared/Service/save.service";
import { HttpErrorResponse } from "@angular/common/http";
import Swal from "sweetalert2";
import { PaginationService } from 'src/app/core/services/pagination.service';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-param-identification-mut",
  templateUrl: "./param-identification-mut.component.html",
  styleUrl: "./param-identification-mut.component.scss",
})
export class ParamIdentificationMutComponent {
  columnMat: any[] = [];
  listAssurance: any[] = [];
  CodeAssur: string = "";
  libelle: string = "";
  tel_assur: string = "";
  typ_plafond: string = "";
  duree_bult_cnam: string = "";
  duree_bult_mut: string = "";
  cod_retr: string = "";
  code_assur: string = "";
  taux_mut: string = "";
  fax_assur: string = "";
  prefixe: string = "";
  num_retr: string = "";
  plaf_mut: string = "";
  formAssurance: FormGroup;
  FormFiliere: FormGroup;
  FormAssurActive : FormGroup;
  breadCrumbItems!: Array<{}>;
  refFilieres: any;
  isDisabled!: boolean;
  isSearch!: boolean;
  ListeFiliere:any;
  ListeAllFiliere:any;
  ListAcivMutuelle:any;
  ListActiviteFamille:any;
  pSusp: any;
  p:any
  deleteId: any;
  deleteIdAssurFamille :any;
  edit: boolean = true;
  edit2: boolean = true;
  constructor(
    private serv: AssurService,
    private fb: FormBuilder,
    private saveService: SaveService,
    public service: PaginationService,
    public modalService: NgbModal
  ) {
    this.formAssurance = this.fb.group({
      cod_assur: [""],
      lib_assur:[""],
      regime_assur: [""],
      num_police: [""],
      typ_plafond: [""],
      lib_assur_a: [""],
      tel_assur: [""],
      fax_assur: [""],
      prefixe: [""],
      mnt_adher: [""],
      mnt_enf: [""],
      mnt_conj: [""],
      mnt_pere: [""],
      mnt_mere: [""],
      prorat_pec: [""],
      duree_bult_mut: [""],
      duree_bult_cnam: [""],
      cod_retr: [""],
      num_retr: [""],
      taux_mut: [""],
      plaf_mut: [""],
    });


    this.FormFiliere = this.fb.group({
      
  
      cod_assur:[""],
      cod_fil:[""],
      mnt_adher:[""],
      mnt_enf:[""],
      mnt_conj:[""],
      mnt_pere:[""],
      mnt_mere:[""],
      prorat_pec:[""],
    })

    this.FormAssurActive = this.fb.group({
      cod_activite:[""],
      cod_assur:[""],
      age_max:[""],
      age_alert:[""],
    })
  }

  columnTitles: { [key: string]: string } = {
    cod_fil: "Code",
    libelle: "Libellé",
    mnt_adher: "Mnt. Adhé",
    mnt_enf: "Mnt. Enf",
    mnt_conj: "Mnt. Conj",
    mnt_pere: "Mnt. Père",
    mnt_mere: "Mnt. Mère",
    prorat_pec: "Prorat. Pec"
  };

  columnTitlesFamille: { [key: string]: string } = {
    cod_activite: "Code",
    libelle: "Libellé",
    age_max: "Age maximum",
    age_alert: "Age d'alerte",
  };

  openModalTab(content: any) {
    this.edit = true;

    this.FormFiliere.reset({ cod_fil: '', prorat_pec: '' })
    this.modalService.open(content, { size: "xl", centered: true });
  }

  openModalFamille(content1: any) {
    this.edit2 = true;

    this.FormAssurActive.reset({ cod_activite: '' })
    this.modalService.open(content1, { size: "xl", centered: true });
  }
  ngOnInit() {

    this.GetAllFiliere()
    this.GetAllActiviteFamille()
    
    this.GetAllAssurance();
    this.saveService.registerSaveCallback(() => this.save());
    this.formAssurance.valueChanges.subscribe(() => {
      this.saveService.setDisabled(!this.isDisabled);

 
    });

    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch = true;
      console.log("is search valid", canSearch);
    });

    //this.loadRefFilieres(this.formAssurance.get('cod_assur')?.value);
  //  this.GetActivMutuelle(this.formAssurance.get('cod_assur')?.value);

  }


  
  /////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////
  
 

  showFilters1: { [key: string]: boolean } = {};
 
  toggleFilter1(column: string): void {
    this.showFilters1[column] = !this.showFilters1[column];
  }
  pSusp1:any
  searchz1: any = {
    cod_activite: "",
    libelle: "",
    age_max: "", 
    age_alert:""
  };

  ListAcivMutuelleFiltre:any[]=[]
  applyFilter1() {
    this.ListAcivMutuelle = this.ListAcivMutuelleFiltre.filter((row:any) => {
     return Object.keys(this.searchz1).every((key) => {
       const searchValue = this.searchz1[key]?.toString().toLowerCase() || "";
       const rowValue = row[key]?.toString().toLowerCase() || "";
       return rowValue.includes(searchValue);
     });
   });
 }
 





//////////////////////////////////////////////////////
 

  showFilters: { [key: string]: boolean } = {};
 

 
  searchz: any = {
    cod_fil: "",
    libelle: "",
    mnt_adher: "", 
    mnt_enf:"",
    mnt_conj: "",
    mnt_pere: "",
    mnt_mere: "", 
    prorat_pec:""
  };

  ListeFiliereFiltre:any[]=[]
  applyFilter() {
    this.ListeFiliere = this.ListeFiliereFiltre.filter((row:any) => {
     return Object.keys(this.searchz).every((key) => {
       const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
       const rowValue = row[key]?.toString().toLowerCase() || "";
       return rowValue.includes(searchValue);
     });
   });
 }
 





//////////////////////////////////////////////////////

AjouterFiliere() {
    this.FormFiliere.patchValue({
      cod_assur:this.formAssurance.get('cod_assur')?.value
    })
    
     this.serv.addFiliere(this.FormFiliere.value).subscribe((data) => {
      console.log("data :", data);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.loadRefFilieres(this.formAssurance.get('cod_assur')?.value); 
     
      
    });
  }

 

  AjouterActiviteAssur() {
    this.FormAssurActive.patchValue({
      cod_assur:this.formAssurance.get('cod_assur')?.value
    })
 
     this.serv.addAssurActive(this.FormAssurActive.value).subscribe((data) => {
      console.log("data :", data);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.GetActivMutuelle(this.formAssurance.get('cod_assur')?.value); 
     
      
    });
  }

  onSort(column: any) {
    this.ListeFiliere = this.service.onSort(
      column,
      this.ListeFiliere
    );
  }


  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }



  ngOnDestroy() {
   
    this.saveService.clearSaveCallback();
     
  }
  GetAllAssurance() {
    this.serv.GetAllAssurance().subscribe((data: any) => {
      this.listAssurance = data;
      this.columnMat = [
        {
          key: "cod_assur",
          label: "Code assurance",
        },
        {
          key: "lib_assur",
          label: "Libellé",
        },
      ];
       
    });
  }
  loadRefFilieres(cod_assur: string): void {
    this.serv.GetFiliereByAssurance(cod_assur).subscribe(
      data => {
        this.ListeFiliere = data; 
        console.log('ListeFiliere',this.ListeFiliere)
         this.ListeFiliereFiltre=data
      },
      error => {
      
      }
    );
  }

  GetAllFiliere(): void {
    this.serv.GetAllFiliere().subscribe(
      data => {
        this.ListeAllFiliere = data; 
         
      },
      error => {
        
      }
    );
  }

  GetActivMutuelle(cod_assur: string): void {
    this.serv.GetActivMutuelle(cod_assur).subscribe(
      data => {
        this.ListAcivMutuelle = data; 
         
      },
      error => {
        
      }
    );
  }

  GetAllActiviteFamille(): void {
    this.serv.GetAllActiviteFamille().subscribe(
      data => {
        this.ListActiviteFamille = data; 
        
      },
      error => {
        
      }
    );
  }

  save() {
 

 this.serv.AddAssurance(this.formAssurance.getRawValue()).subscribe(
      (data: any) => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Assurance enregistrée avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
      },
      (error: HttpErrorResponse) => {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Une erreur est survenue !",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    );

    /* this.serv.addAssurance(this.formAssurance.getRawValue()).subscribe((data:any)=>{



    this.serv.assAssurFil(this.formAssurFil.getRawValue()).subscribe((response:any)=>{

    })


    this.serv.activite(this.formAssurFil.getRawValue()).subscribe((response:any)=>{
      
    })
  })*/
  }

  search(data: any) {
    const cod_assur =data.cod_assur;
    if (cod_assur) {
      this.loadRefFilieres(cod_assur); 
      this.GetActivMutuelle(cod_assur); 
    }
    this.formAssurance.patchValue({
      cod_assur: data.cod_assur,
      lib_assur: data.lib_assur,
      regime_assur: data.regime_assur,
      num_police: data.num_police,
      typ_plafond: data.typ_plafond,
      lib_assur_a: data.lib_assur_a,
      tel_assur: data.tel_assur,
      fax_assur: data.fax_assur,
      prefixe: data.prefixe,
      mnt_adher: data.mnt_adher,
      mnt_enf: data.mnt_enf,
      mnt_conj: data.mnt_conj,
      mnt_pere: data.mnt_pere,
      mnt_mere: data.mnt_mere,
      prorat_pec: data.prorat_pec,
      duree_bult_mut: data.duree_bult_mut,
      duree_bult_cnam: data.duree_bult_cnam,
      cod_retr: data.cod_retr,
      num_retr: data.num_retr,
      taux_mut: data.taux_mut,
      plaf_mut: data.plaf_mut,
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


  editFiliere(data: any, content: any) {
    this.edit=true
 
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });
     
    this.FormFiliere.get("cod_assur")?.patchValue(data.cod_assur);
    this.FormFiliere.get("cod_fil")?.patchValue(data.cod_fil);
      this.FormFiliere.get("mnt_adher")?.patchValue(Number(data.mnt_adher).toFixed(3));
     this.FormFiliere.get("mnt_enf")?.patchValue(Number(data.mnt_enf).toFixed(3));
     this.FormFiliere.get("mnt_conj")?.patchValue(Number(data.mnt_conj).toFixed(3));
     this.FormFiliere.get("mnt_pere")?.patchValue(Number(data.mnt_pere).toFixed(3));
     this.FormFiliere.get("mnt_mere")?.patchValue(Number(data.mnt_mere).toFixed(3));
     this.FormFiliere.get("prorat_pec")?.patchValue(data.prorat_pec);

    }

    editActiviteFamille(data: any, content1: any) {
      this.edit=true
  
      this.edit = false;
      this.modalService.open(content1, { size: "xl", centered: true });
       
      this.FormAssurActive.get("cod_assur")?.patchValue(data.cod_assur);
      this.FormAssurActive.get("cod_activite")?.patchValue(data.cod_activite);
      this.FormAssurActive.get("age_max")?.patchValue(data.age_max);
      this.FormAssurActive.get("age_alert")?.patchValue(data.age_alert);
      }

      

    confirm(content: any, id: any) {
      
      this.deleteId = id;
      this.modalService.open(content, { centered: true });
 
      
    }

    confirmActiviteFamille(content1: any, id: any) {
      console.log("id :",id)
      this.deleteIdAssurFamille = id;
      this.modalService.open(content1, { centered: true });
 
    }
    ConfirmDelete() {
       this.serv.deleteFilliere(this.deleteId.cod_assur,this.deleteId.cod_fil).subscribe(data=>{
      this.loadRefFilieres(this.deleteId.cod_assur)
      })
    }


    ConfirmDeleteActiviteFamille() {
 
      this.serv.deleteActiviteFameille(this.deleteIdAssurFamille.cod_activite,this.deleteIdAssurFamille.cod_assur).subscribe(data=>{
     this.GetActivMutuelle(this.deleteIdAssurFamille.cod_assur)
     })
   }
  
}