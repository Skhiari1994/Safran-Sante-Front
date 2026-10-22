import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AssurService } from '../assur.service';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { SaveService } from 'src/app/shared/Service/save.service';

@Component({
  selector: 'app-param-ref-filliere',
  templateUrl: './param-ref-filliere.component.html',
  styleUrl: './param-ref-filliere.component.scss'
})
export class ParamRefFilliereComponent {

  formRefFilliere!:FormGroup
  formRefFilAct!:FormGroup
  listActivEtablis:any[]=[]
  columnEtablis:any[]=[]
  breadCrumbItems!: Array<{}>;

  libEtablis:string=''
  codActiv:string=''
  libAct:string=''
  pSusp: any;
  deleteId: any;
  isSearch: boolean = true;
  listRefFillAct!: any[] ;
  listRefFillActFiltr: any[] = [];
  listActe: any[] = [];
  columnActe: any[] = [];
  columnFilliere: any[] = [];
  listFilliere: any[] = [];
  codActe?: string;
  
  save!: boolean;
  isDisabled!: boolean;
  edit: boolean = true;


  columnTitles: { [key: string]: string } = {
    abrv_act: "Acte",
    libActe: "Libellé",
    val_prix: "Valeur prix", 
 
  };
  constructor(private fb :FormBuilder,private serv :AssurService,private modalService: NgbModal,
    public service: PaginationService,
    private saveService: SaveService,private tokenStorage:TokenStorage){
this.formRefFilliere=this.fb.group({
   cod_fil:[''],
   lib_fill:[''],
   mnt_adher:[''],
   mnt_enf:[''],
   mnt_conj:[''],
   mnt_pere:[''],
   mnt_mere:[''],
   prorat_pec:[''],
   lib_param:[''],
   lib_param_a:[''],
   taux_param:[''],
   lib_fill_a:[''],
   nbr_membre:[''],
   typ_plafond:[''],
   bult_cnam:[''],
   med_fam:[''],
   cod_activ:[''],
   bult_mut:[''],

})
this.formRefFilAct=this.fb.group({
  cod_fil:[''],
abrv_act:[''],
val_prix:[''],

})
  }
  ngOnInit(){
  this.getActiviteEtablis()
  this.getFilliere()
this.getActe()
   this.saveService.isSearch$.subscribe((canSearch) => {
    this.isSearch=canSearch

    })

    this.saveService.registerSaveCallback(() => this.saveRefFilliere());
    this.formRefFilliere.valueChanges.subscribe(() => {
      this.saveService.setDisabled(!this.isDisabled);
   });
   this.formRefFilAct = this.fb.group({
    abrv_act: [''],
    libActe: [''],
    val_prix: ['']
  });
   }
   ngOnDestroy() {
    this.saveService.clearSaveCallback();
  }
  getActiviteEtablis(){
    this.serv.getAllActiviteEtablis().subscribe((data:any)=>{
    this.listActivEtablis=data
    this.columnEtablis=[
      { key: "cod_activ", label: "Code" },
      { key: "lib_activite", label: "Libelle" },
    ]
    })
  }

  onSelectedValueActiviteEtablis(item: any) {
    this.libEtablis=item.lib_activite
    this.formRefFilliere.patchValue({
      cod_activ: item.cod_activ,
   });
 }
 codFil:any
 search(data:any){
  this.codFil=data.cod_fil;
 this.formRefFilliere.patchValue({
    cod_fil:data.cod_fil,
    lib_fill:data.lib_fill,
    mnt_adher:Number(data.mnt_adher).toFixed(3),
    mnt_enf:Number(data.mnt_enf).toFixed(3),
    mnt_conj:Number(data.mnt_conj).toFixed(3),
    mnt_pere:Number(data.mnt_pere).toFixed(3),
    mnt_mere:Number(data.mnt_mere).toFixed(3),
    prorat_pec:data.prorat_pec,
    lib_param:data.lib_param,
    lib_param_a:data.lib_param_a,
    taux_param:data.taux_param,
    lib_fill_a:data.lib_fill_a,
    nbr_membre:data.nbr_membre,
    typ_plafond:data.typ_plafond,
    bult_cnam:data.bult_cnam,
    med_fam:data.med_fam,
    cod_activ:data.cod_activ,
    bult_mut:data.bult_mut,

 })
console.log(this.formRefFilliere.value)
  this.serv.getRefFillAct(data.cod_fil).subscribe((data:any) => {
    console.log("data :",data)
    this.listRefFillAct = data;
    this.listRefFillActFiltr=data
   });
   this.codActiv=data.cod_activ
 }

 
 getRefFilActe(codFil:any){
  this.serv.getRefFillAct(codFil).subscribe((data:any) => {
    console.log("data :",data)
    this.listRefFillAct = data;
    this.listRefFillActFiltr=data
   });
 }
 
  onSort(column: any) {
    this.listRefFillAct = this.service.onSort(
      column,
      this.listRefFillAct
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
     this.listRefFillAct = this.listRefFillActFiltr.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
   }
  openModalTab(content: any) {
    this.codActe=''
    this.libAct=''
    this.formRefFilAct.reset({ val_prix: '' });
    this.edit = true;

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
  getFilliere() {
    this.serv.getRefFilliere().subscribe((data:any) => {
      console.log("data :",data)
      this.listFilliere = data;
      this.columnFilliere=[
        { key: "cod_fil", label: "Code" },
        { key: "lib_fill", label: "Libelle" },
      ]
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
  confirm(content: any, id: any) {
    console.log("annee:", id);
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDelete() {
    const deltFil={
      fil_act:this.deleteId.cod_fil,
      abrv_act:this.deleteId.abrv_act
    }
    console.log("deltFil :",deltFil)


    this.serv.deleteRefFillAct({
      cod_fil: this.deleteId.cod_fil,
      abrv_act: this.deleteId.abrv_act
    }).subscribe(response => {
      console.log("Deleted successfully:", response);
    this.getRefFilActe(this.deleteId.cod_fil)

    }, error => {
      console.error("Error deleting:", error);
    });
  }
  editDataGet(data: any, content: any) {
    this.edit=true
    console.log("data :",data)
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });
    this.codActe = data.abrv_act;
    
    this.formRefFilliere.get("lib_act")?.patchValue(data.lib_act);
    this.formRefFilliere.get("abrv_act")?.patchValue(data.abrv_act);
    this.formRefFilliere.get("val_prix")?.patchValue(data.val_prix);
    

   }

   
  onSelectedValueActe(item: any) {
    this.libAct=item.lib_act
     this.formRefFilAct.patchValue({
      abrv_act: item.abrv_act,
    });
  }
 
  saveRefFilliere() {
    console.log("this.formAffilMutuelle.value :", this.formRefFilliere.value);
   this.serv
      .addRefFilliere(this.formRefFilliere.value)
      .subscribe((data) => {
        console.log("data :", data);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouter avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
       });
  }
 
  saveRefFilAct() {
    // Ensure 'cod_fil' is set from the parent form
    const codFil = this.formRefFilliere.get('cod_fil')?.value;
  
    if (!codFil) {
      console.error("cod_fil is missing from formRefFilliere!");
      return;
    }
  
    // Patch cod_fil into the child form
    this.formRefFilAct.patchValue({
      cod_fil: codFil,
    });
  
    // Create a shallow copy and remove the unwanted field
    const formData = { ...this.formRefFilAct.value };
    delete formData.libActe;
  
    // Construct the object to send
    const filAct = {
      cod_fil: this.codFil,
      abrv_act: formData.abrv_act,
      val_prix: formData.val_prix,
    };
  
    console.log("filAct to send:", filAct);
  
    // Send to service
    this.serv.addRefFillAct(filAct).subscribe(
      (data) => {
        console.log("Response:", data);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouté avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        
  
        // Refresh list after adding
        this.getRefFilActe(codFil);
      },
      (error) => {
        console.error("Error saving RefFilAct:", error);
        Swal.fire({
          icon: "error",
          title: "Erreur lors de l'ajout",
          text: "Veuillez vérifier les données ou réessayer plus tard.",
        });
      }
    );
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





