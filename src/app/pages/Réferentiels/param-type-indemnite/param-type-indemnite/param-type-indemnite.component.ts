import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { AssurService } from '../../Parameterages assurances/assur.service';
import { ParamIndemniteService } from '../param-indemnite.service';
import { forkJoin, switchMap } from 'rxjs';

@Component({
  selector: 'app-param-type-indemnite',
  templateUrl: './param-type-indemnite.component.html',
  styleUrl: './param-type-indemnite.component.scss'
})
export class ParamTypeIndemniteComponent {


  formParamTypDon!: FormGroup;
  positionAdmForm!: FormGroup;
  pSusp: number = 1;  
  pSusp1: number = 1;

  deleteId: any;
  isSearch: boolean = true;
  listTypInd!: any[] ;
  breadCrumbItems!: Array<{}>;

  listTypIndFiltr: any[] = [];
  listCompte: any[] = [];
  columnCompte: any[] = [];
  codActe?: string;
  listTypDon: any[] = [];
  columnsNat: any[] = [];
  
  listPosAdm: any[] = [];
  listPosAdmFiltr: any[] = [];

  listAffect: any[] = [];
  columnAffect:  any[] = [];
  
  save!: boolean;
  isDisabled!: boolean;
  edit: boolean = true;
  natDon: string="";
  typDonVal: string="";

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
  libNatDon: any;
  max_mnt_don: any;
  concern: any;
  codAffect: any;
  numCpt: any;
  editIndex: number | null = null;
  constructor(
    private fb: FormBuilder,
    private serv: ParamIndemniteService,
    private modalService: NgbModal,
    public service: PaginationService,
    private saveService: SaveService,private tokenStorage:TokenStorage,
    private paramInd:ParamIndemniteService
  ) {
       this.formParamTypDon = this.fb.group({
        nat_don: [''], // Should match formControlName in template
        lib_nat_don: ['', Validators.required],
        frequence: [''],
        concerne: ['A'], // Default to 'Adhérent'
        diff_period: [''],
        max_mnt_don: [''],
        typ_don: ['I'], // Default to 'Indémnite'
        compt_charge: [''],
        lib_nat_don_a:[''],
        debut_cycle:[''],
        fin_cycle:[''],
        limit_depot:[''],
        cod_fond:[''],
        mnt_variable:[''],
        min_mnt_don:[''],
        cod_benif:[''],






      });
      // this.positionAdmForm= this.fb.group({
      //   cod_affect:[''],
      //   lib_affect:[''],
      //   lib_affect_a:[''],

      // })
      this.positionAdmForm = this.fb.group({
        affectations: this.fb.array([]) // Initialize FormArray
      });
  
      // Add a default row
      this.addAffectation();
  }

  ngOnInit(): void {
 this.getAffectation()
      ///////////////////////////save
   
  
    this.getCompte()
     this.getgetListTypDon() 
     this.getNatDon()
    
   }

 
 
   getNatDon() {
  this.serv.getNatDon().subscribe((data:any) => {
      console.log("data :",data)
      this.listTypInd = data;
      this.listTypIndFiltr=data
     });
  }

  getCompte() {
    this.serv.getCompte().subscribe((data:any) => {
      console.log("listCompte :",data)
      this.listCompte = data;
      this.columnCompte=[
        { key: "num_cpt", label: "Num compte" },
        { key: "lib_cpt", label: "Libelle" },
      ]
      });
  }
  onSort(column: any) {
    this.listTypInd = this.service.onSort(
      column,
      this.listTypInd
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
     this.listTypInd = this.listTypIndFiltr.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
    console.log("this.listAffilMutuelle :",this.listTypInd)
  }
  openModalTab(content: any) {
    this.edit = true;

    this.formParamTypDon.reset()
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
 
idDel:any
  confirm(content: any, id: any) {
    console.log("annee:", id);
    this.deleteId = id;
    this.idDel=id.nat_don

    
    this.listTypInd = this.listTypInd.filter(item => item.id !== id);
    this.modalService.open(content, { centered: true });
  
  }
  ConfirmDelete() {
     //this.serv.deleteRefVisite(this.deleteId.cod_visit).subscribe(data=>{
      this.serv.deletNat(this.idDel).subscribe((data)=>{
        // Message de succès
        Swal.fire(
          'Supprimé !',
          'L\'élément a été supprimé avec succès.',
          'success'
        );
        this.getNatDon()

      })
   
  //  })
  }
   editDataGet(data: any, content: any) {
    this.edit=true
    console.log("data :",data)
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });
    
    this.formParamTypDon.get("nat_don")?.patchValue(data.nat_don);
    this.formParamTypDon.get("lib_nat_don")?.patchValue(data.lib_nat_don);
    this.formParamTypDon.get("lib_nat_don_a")?.patchValue(data.lib_nat_don_a);
    this.formParamTypDon.get("typ_don")?.patchValue(data.typ_don);
    this.formParamTypDon.get("debut_cycle")?.patchValue(data.debut_cycle);
    this.formParamTypDon.get("fin_cycle")?.patchValue(data.fin_cycle);
    this.formParamTypDon.get("limit_depot")?.patchValue(data.limit_depot);
    this.formParamTypDon.get("cod_fond")?.patchValue(data.cod_fond);
    this.formParamTypDon.get("frequence")?.patchValue(data.frequence);
    this.formParamTypDon.get("concerne")?.patchValue(data.concerne);
    this.formParamTypDon.get("diff_period")?.patchValue(data.diff_period);
    this.formParamTypDon.get("max_mnt_don")?.patchValue(data.max_mnt_don);
    this.formParamTypDon.get("typ_don")?.patchValue(data.typ_don);
    this.formParamTypDon.get("compt_charg")?.patchValue(data.compt_charg);
    this.formParamTypDon.get("mnt_variable")?.patchValue(data.mnt_variable);
    this.formParamTypDon.get("concerne")?.patchValue(data.concerne);
    this.formParamTypDon.get("min_mnt_don")?.patchValue(data.min_mnt_don);
    this.formParamTypDon.get("cod_benif")?.patchValue(data.cod_benif);
    this.formParamTypDon.get("diff_period")?.patchValue(data.diff_period);
    this.formParamTypDon.get("compt_charge")?.patchValue(data.compt_charge);
      
     
    

  } 


  get affectations(): FormArray {
    return this.positionAdmForm.get('affectations') as FormArray;
  }

  // Create a new affectation form group
  newAffectation(): FormGroup {
    return this.fb.group({
      cod_affect: [''],
     nat_don:['']
    });
  }

  // Add a new affectation to the array
  addAffectation(): void {
    this.affectations.push(this.newAffectation());
  }

  // Remove an affectation by index
  removeAffectation(index: number): void {
    if (this.affectations.length > 1) {
      this.affectations.removeAt(index);
    }
  }

  libAffect: string[] = []
  onSelectedValueAffectation(selectedValue: any, index: number): void {
    console.log('selectedValue', selectedValue);

    const selectedActe = this.listAffect.find(affect => affect.cod_affect === selectedValue.cod_affect);
    console.log('selectedActe', selectedActe);
    this.libAffect[index] = selectedActe.lib_affect
    console.log('this.libAffect[index]', this.libAffect[index]);
    this.affectations.at(index).patchValue({ cod_affect: selectedValue.cod_affect  });
    console.log('this.affectations', this.affectations);
     
  }
    /* editDataGet(data: any, index: number, modal: any) {
      if (!data) {
          console.error("Error: Data is undefined!");
          return;
      }
  
      this.edit = false; // Indicates an edit operation
      this.editIndex = index; // Store index for update
  
      this.formParamTypDon.patchValue({
          nat_don: data.nat_don || '',
          lib_nat_don: data.lib_nat_don || '',
          frequence: data.frequence || '',
          concerne: data.concerne || '',
          diff_period: data.diff_period || '',
          max_mnt_don: data.max_mnt_don || '',
          typ_don: data.typ_don || '',
          compt_charg: data.compt_charg || ''
      });
  
      console.log("Editing Item:", data);
  
      // Open the modal
      this.modalService.open(modal, { centered: true });
    }
  
   */
    
    

  onSelectedValueActe(item: any) {
     this.formParamTypDon.patchValue({
      abrv_act: item.abrv_act,
    });
  }
 
  onSelectedValueNumCompte(item: any) {
    console.log("item :", item);

this.numCpt=item.num_cpt
    this.formParamTypDon.patchValue({
      compt_charg: item.num_cpt
   });
 }
 savePosAdm(){
   // Ensure lists are initialized
  this.serv.addMotifs(this.positionAdmForm.value).subscribe((data:any)=>{
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Ajouter avec succès !",
      showConfirmButton: false,
      timer: 2000,
    });
    this.getAffectation()
  })
 }
 saveTypDon() {
  this.serv.addNatDon(this.formParamTypDon.value).subscribe((data:any)=>{
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Ajouter avec succès !",
      showConfirmButton: false,
      timer: 2000,
    });
    this.getNatDon()
  })  
}

    getAffectation(){

   

      this.serv.getAffectation().subscribe((data=>{
        console.log("listAffect :",data)
        this.listAffect = data;
        this.columnAffect=[
          { key: "cod_affect", label: "Code" },
          { key: "lib_affect", label: "Libelle" },
          { key: "lib_affect_a", label: "Libelle 2éme langue" },

        ]
        }));
    }
    editDataGetAdmPos(data: any, content: any) {
      this.edit=true
      console.log("data :",data)
      this.edit = false;
      this.modalService.open(content, { size: "xl", centered: true });
      //this.codActe = data.abrv_act;
      
      this.positionAdmForm.get("cod_affect")?.patchValue(data.cod_affect);
      this.positionAdmForm.get("lib_affect")?.patchValue(data.lib_affect);
      this.positionAdmForm.get("lib_affect_a")?.patchValue(data.lib_affect);
   
  
    }  
    
    selectedRow: number | null = null;
    getAffect(event: any, index: number) {
      this.natDon=event.nat_don
      this.selectedRow = index;
      // const formArray = this.positionAdmForm.get("affectations") as FormArray;
      // formArray.controls.forEach((control) => {
      //   control.get("nat_don")?.patchValue(event.nat_don);
      // });
  
      this.serv
        .getNatDonByNat(event.nat_don)
        .subscribe((data) => {
          console.log("data", data);
          this.listPosAdm = data;
        });
        console.log("formArray", this.natDon);
    }
    saveTyp() {
      const AffectationFormArray = (this.positionAdmForm.get("affectations") as FormArray) .value;
      const AffectationForm = this.positionAdmForm.get("affectations") as FormArray ;
             // Loop through each FormGroup in the FormArray
             AffectationForm.controls.forEach((formGroup: AbstractControl, index: number) => {
              if (formGroup instanceof FormGroup) {
                formGroup
                  .get('nat_don')
                  ?.patchValue(this.natDon);
              }
            });
         
           
         
  console.log("posteFormArray :",AffectationForm.value)
      this.serv.addMotifs(AffectationForm.value).subscribe((data) => {
        console.log("data :", data);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouter avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        this.serv
        .getNatDonByNat(this.natDon)
        .subscribe((data) => {
          console.log("data", data);
          this.listPosAdm = data;
        });
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

  getgetListTypDon() {
    this.paramInd.getgetListNatDon().subscribe((data) => {
      this.listTypDon = data;
      console.log(this.listTypDon);
      // Définir les colonnes dynamiques du tableau
      this.columnsNat = [
        { key: "lib_nat_Don", label: "Libelle" },
        { key: "max_mnt_don", label: "Plafond" },
        { key: "concerne", label: "Concerne" },
        { key: "cod_affect", label: "Affectation" },


        // { key: 'lib_tit_a', label: 'Libellé 2éme langue' }
      ];
    });
  }
  onSelectedValueTypDon(item: any) {
  
    this.libNatDon = item.lib_nat_Don;
    this.typDonVal=item.nat_Don
    this.max_mnt_don=item.max_mnt_don
   // Prepare data objects
   this.concern = item.concerne
   this.codAffect=item.cod_affect
this.formParamTypDon.patchValue({
  nat_don:item.nat_Don,
  lib_nat_don:item.lib_nat_Don

}
)
  
}

// onSelectedValueAffectation(item:any){

//    this.codAffect=item.cod_affect
//    this.positionAdmForm.patchValue({
//     cod_affect:item.cod_affect,
//     lib_affect:item.lib_affect,
//     lib_affect_a:item.lib_affect_a
  
//   })

// }

paginationControls(event: number, table: string) {
  console.log(`Table ${table} pagination changed to: ${event}`);
  if (table === 'first') {
    this.pSusp = event;
  } else {
    this.pSusp1 = event;
  }
}
}

