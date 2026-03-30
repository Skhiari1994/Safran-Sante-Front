import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { AssurService } from '../assur.service';

@Component({
  selector: 'app-param-pers-physique',
  templateUrl: './param-pers-physique.component.html',
  styleUrl: './param-pers-physique.component.scss'
})
export class ParamPersPhysiqueComponent {
  breadCrumbItems!: Array<{}>;
  formRefEtablis!:FormGroup
  listRefEtablis:any[]=[]
  columnsSearch:any[]=[]
  isSearch: boolean = true;
  canModify:boolean =true;
  isDisabled!: boolean;
  libActiv:String=''
  libGouv:String=''
  libPoste:String=''
  constructor(private fb :FormBuilder,private serv:AssurService,private saveService :SaveService){
this.formRefEtablis=this.fb.group({
   prf_typ:[''],
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
   conv_etab:[''],
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

    
    

    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch=canSearch
  
      })

      this.saveService.registerSaveCallback(() => this.modifyRefEtablis());
      this.formRefEtablis.valueChanges.subscribe(() => {
        this.saveService.setDisabled(!this.isDisabled);
     });
  this.getRefEtablis()
  }
  ngOnDestroy() {
     this.saveService.clearSaveCallback();
   }

  search(data:any){
    console.log(data)
    this.canModify=false
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
    this.serv.getPersPhysique().subscribe((data) => {
      console.log("personnel", data);
      this.listRefEtablis = data;
      this.columnsSearch = [
        { key: "prf_cod", label: "Prf code" },
        { key: "etab_rsoc", label: "Etab rsoc" },
        { key: "met_etab", label: "Met etab" }, 
      ];
    });
  }


  modifyRefEtablis(){
    const formatDates = (form: any, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value); // Assuming formatDate returns a string or null
        form.get(field)?.setValue(value);
        formatted.push(value); // Push value into the string[] array
        return formatted;
      }, []);
  
    const adherentDates = formatDates(this.formRefEtablis, [
      "dat_conv_etab",
      
    ]);
    console.log("this.formRefEtablis.value :",this.formRefEtablis.value)
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
}

