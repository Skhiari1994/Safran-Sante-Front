import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { AssurService } from '../assur.service';

@Component({
  selector: 'app-param-etabliss-conventionnees',
  templateUrl: './param-etabliss-conventionnees.component.html',
  styleUrl: './param-etabliss-conventionnees.component.scss'
})
export class ParamEtablissConventionneesComponent {

 breadCrumbItems!: Array<{}>;
  formRefEtablis!:FormGroup
  listRefEtablis:any[]=[]
  columnsSearch:any[]=[]
  isSearch: boolean = true;
  canModify:boolean =true;
  isDisabled!: boolean;
  libActiv:String=''
  ListeActiviteEtabliss : any[] = [];
  columnActiviteEtabliss: any[] = [];
  libGouv:String=''
  libPoste:String=''
  codeActivite:string=''
  libActivite:string=''
  ListeGouv: any[] = [];
  ListePoste: any[] = [];
  columnPoste: any[] = [];
  columnGouv: any[] = [];
  codeGouv:string=''
  codePoste:string=''
  post:string=''
  constructor(private fb :FormBuilder,private serv:AssurService,private saveService :SaveService){
this.formRefEtablis=this.fb.group({
   prf_typ:['2'],
   prf_cod:[''],
   prf_cle:[''],
   etab_rsoc:[''],
   pr_rsoc:[''],
   etab_rsoc_a:[''],
   pr_rsoc_a:[''],
   met_etab:[''],
   comp_etab:[''],
   adr_etablis:[''],
   cod_post:[''],
   cod_gouv:[''],
   conv_etab:['O'],
   dat_conv_etab:[''],
   rib_etab:[''],
   ref_conv_etat:[''],
   adr_etablis_a:[''],
   cod_activ:[''],
   conv_cnam:[''],
   tel_etablis:[''],
   fax_etablis:[''],
   email_etablis:[''],
   resp:[''],
   resp_a:[''],
   etat_act_mut:[''],
   etat_act_cnam:[''],

})
  }

  ngOnInit(){

    this.getAllActiviteEtabliss();
    //this.getAllPoste();
    this.getAllGouv();
    this.getRefEtablis()
    this.saveService.registerSaveCallback(() => this.ajoutPersConv());


   

    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch=canSearch
  
      })

      this.saveService.registerSaveCallback(() => this.modifyRefEtablis());
      this.formRefEtablis.valueChanges.subscribe(() => {
        this.saveService.setDisabled(!this.isDisabled);
     });

  }
  ngOnDestroy() {
     this.saveService.clearSaveCallback();
   }
   ajoutPersConv(){
     
    this.serv.ajoutPersConv(this.formRefEtablis.value).subscribe((data:any)=>{
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajout avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
    })
   }
  search(data:any){
     
    this.canModify=false
    this.codeActivite=data.cod_activ
    this.codeGouv=data.cod_gouv
     this.post=data.cod_post
    this.formRefEtablis.patchValue({
      prf_typ:data.prf_typ,
      prf_cod:data.prf_cod,
      prf_cle:data.prf_cle,
      etab_rsoc:data.etab_rsoc,
      pr_rsoc:data.pr_rsoc,
      etab_rsoc_a:data.etab_rsoc_a,
      pr_rsoc_a:data.pr_rsoc_a,
      met_etab:data.met_etab,
      comp_etab:data.comp_etab,
      adr_etablis:data.adr_etablis,
      cod_post:data.cod_post,
      cod_gouv:data.cod_gouv,
      conv_etab:data.conv_etab,
      dat_conv_etab:data.dat_conv_etab,
      rib_etab:data.rib_etab,
      ref_conv_etat:data.ref_conv_etat,
      adr_etablis_a:data.adr_etablis_a,
      cod_activ:data.cod_activ,
      conv_cnam:data.conv_cnam,
      tel_etablis:data.tel_etablis,
      fax_etablis:data.fax_etablis,
      email_etablis:data.email_etablis,
      resp:data.resp,
      resp_a:data.resp_a,
      etat_act_mut:data.etat_act_mut,
      etat_act_cnam:data.etat_act_cnam,

    })
    this.serv.getActiviteEtablis(data.cod_activ).subscribe((data:any)=>{
      this.libActiv=data.lib_activite
    })

    this.serv.getGouv(data.cod_gouv).subscribe((data:any)=>{
      this.libGouv=data.lib_gouv
    })
    this.serv.getPoste(data.cod_gouv,data.cod_post).subscribe((data:any)=>{
     
      this.libPoste=data.lib_post
      

    })
  }

  getRefEtablis() {
    this.serv.getEtablissParamMutuelle().subscribe((data) => {
  
      this.listRefEtablis = data;
      this.columnsSearch = [
        { key: "prf_cod", label: "Code" },
        { key: "etab_rsoc", label: "Nom" },
       ];
    });
  }



  getAllActiviteEtabliss() {
    this.serv.getAllActiviteEtabliss().subscribe((data:any) => {
     
      this.ListeActiviteEtabliss = data;
      this.columnActiviteEtabliss=[
        { key: "cod_activ", label: "Code activité" },
        { key: "lib_activite", label: "Libellé" },
      ]
 
     });
  }

  getAllGouv() {
    this.serv.getAllGouv().subscribe((data:any) => {
     
      this.ListeGouv = data;
      this.columnGouv=[
        { key: "cod_gouv", label: "Code gouvernorat" },
        { key: "lib_gouv", label: "Libellé" },
      ]
 
     });
  }

  
  modifyRefEtablis(){
    const formatDates = (form: any, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value); 
        form.get(field)?.setValue(value);
        formatted.push(value);  
        return formatted;
      }, []);
  
    const adherentDates = formatDates(this.formRefEtablis, [
      "dat_conv_etab",
      
    ]);
    
    this.serv.AddRefEtablis(this.formRefEtablis.value).subscribe((data:any)=>{
        Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Modifier avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.getRefEtablis()
    })
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

  onSelectedValueActivite(event: any) {
    this.libActiv = event.lib_activite; 
    this.formRefEtablis.patchValue({
      cod_activ: event.cod_activ,
    });
  }

  onSelectedValueGouv(event: any): void {
    this.libGouv = event.lib_gouv; 
    this.formRefEtablis.patchValue({
      cod_gouv: event.cod_gouv,
    });
 
    this.serv.getPosteByGouv(event.cod_gouv).subscribe({
      next: (data) => {
          this.ListePoste = data; 
          this.columnPoste=[
            { key: "cod_poste", label: "Code poste" },
            { key: "lib_post", label: "Libellé" },
          ]

          this.codePoste=this.post
           
      },
      error: (err) => console.error('Erreur API', err)
  });
    

}
 

  onSelectedValuePoste(event: any) {
    this.libPoste = event.lib_post; 
    this.formRefEtablis.patchValue({
      cod_post: event.cod_poste,
    });
  }
  formatDate2(event: any) {
    let value = event.target.value.replace(/\D/g, ''); 
  
    if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
  
    event.target.value = value; 
  }
}