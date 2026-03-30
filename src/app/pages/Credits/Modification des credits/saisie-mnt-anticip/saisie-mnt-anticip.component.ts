import { Component } from '@angular/core';
import { DebCreditService } from '../../Débloquage des crédit/deb-credit.service';
import { AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModifCreditService } from '../modif-credit.service';
import Swal from 'sweetalert2';
import { SaveService } from 'src/app/shared/Service/save.service';

@Component({
  selector: 'app-saisie-mnt-anticip',
  templateUrl: './saisie-mnt-anticip.component.html',
  styleUrl: './saisie-mnt-anticip.component.scss'
})
export class SaisieMntAnticipComponent {
  breadCrumbItems!: Array<{}>;

  listPersonnel: any[] = []
  columnPersonnels: any[] = []
  nomPren: String = ''
  matPersVal: String = ''
  numVir: String = ''
  FormVirAnticip: FormGroup
  isDisabled!: boolean;
  isSearch: boolean = true;
  listVir:any[]=[]
  columnsVir:any[]=[]
  constructor(private serv: ModifCreditService, private adherentServ: AdherentService, private token: TokenStorageService, private fb: FormBuilder,private saveService:SaveService) {
    this.FormVirAnticip = this.fb.group({
      cod_soc: [this.token.getUser().codSoc],
      mat_pers: [''],
      num_vir: [''],
      dat_anticip: [''],
      mont_vir: [''],
      mont_antic: [''],
      rest_vir: [''],
      etat_vir: this.fb.control({ value: 'N', disabled: true }),  // Correct way to disable
      imput_cpt: this.fb.control({ value: 'N', disabled: true }),  
      seq_ecrt: [''],
      ref_metier: [''],
      obs_metier: [''],
      mnt_esp: [''],

    })
  }

  ngOnInit() {
    this.saveService.registerSaveCallback(() => this.AjouterVirAnticip());
    this.FormVirAnticip.valueChanges.subscribe(() => {
      this.saveService.setDisabled(!this.isDisabled);
   });

   this.saveService.isSearch$.subscribe((canSearch) => {
     this.isSearch=true
     console.log("is search valid",canSearch)
 
     })
    this.getPersonnels()
    this.columnPersonnels = [
      { key: "mat_pers", label: "Matricule" },
      { key: "full_name", label: "Nom & Prénom" },
    ];
//console.log("date anticip",this.formatDate("01022025"))
    this.getAllVirAnticip()
  }

  ngOnDestroy() {
    // Clear the callback to avoid memory leaks
    this.saveService.clearSaveCallback();
    //this.saveService.setCanSave(false)
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



  getPersonnels() {
    this.adherentServ.getPersonnelsCredit().subscribe(data => {
      this.listPersonnel = data

      this.columnPersonnels = [
        { key: "mat_pers", label: "Matricule" },
        { key: "full_name", label: "Nom & Prénom" },
      ];
    })
  }
  thisGetMAxNumVir() {

  }
  onSelectedValuePers(item: any) {
    console.log("item :", item)
    this.nomPren = item.full_name;0
     this.serv.getMAxNumVir(item.mat_pers).subscribe((data: any) => {
      this.FormVirAnticip.patchValue({
        num_vir: data,
        mat_pers:item.mat_pers
      })
    })

  }
 MontRest() {
  const montVir = parseFloat(this.FormVirAnticip.get('mont_vir')?.value) || 0;
  const montAntic = parseFloat(this.FormVirAnticip.get('mont_antic')?.value) || 0;

  this.FormVirAnticip.patchValue({
    rest_vir: montVir - montAntic
  });
}


AjouterVirAnticip() {

  // Fix date
  const dat = this.FormVirAnticip.get('dat_anticip')?.value;
  this.FormVirAnticip.get('dat_anticip')?.setValue(this.formatDate(dat));

  // Force etat_vir = N
  this.FormVirAnticip.get('etat_vir')?.setValue('N'); 

  // Send ALL fields including disabled ones
  const payload = this.FormVirAnticip.getRawValue();

  console.log("DATA SENT:", payload);

  this.serv.AjoutVirAnticip(payload).subscribe(() => {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Virement ajouté avec succès",
      showConfirmButton: false,
      timer: 2000,
    });
    this.getPersonnels();
  });

}


getAllVirAnticip(){

  this.serv.getAllVirAnticip().subscribe((data:any)=>{
    this.listVir=data
console.log("this.listVir",this.listVir)
    this.columnsVir=[
      {key:"mat_pers",label:"Matricule"},
      {key:"nom",label:"Nom & Prénom"},
    ]
  })
}
  search(item: any) {
    console.log("item :", item);
  this.matPersVal=item.mat_pers
    // Mise à jour initiale des champs avec l'élément sélectionné
    this.FormVirAnticip.patchValue({
      cod_soc:item.cod_soc,
      mat_pers:item.mat_pers,
      num_vir:item.num_vir,
      dat_anticip:this.formatDate(item.dat_anticip),
      mont_vir: Number(item.mont_vir).toFixed(3),
      mont_antic:Number(item.mont_antic).toFixed(3),
      rest_vir:Number(item.rest_vir).toFixed(3),
      etat_vir:item.etat_vir,
      imput_cpt:item.imput_cpt,
      seq_ecrt:item.seq_ecrt,
      ref_metier:item.ref_metier,
      obs_metier:item.obs_metier,
      mnt_esp:item.mnt_esp,
      
    });
    this.matPersVal=item.mat_pers
    console.log("this.formPretPers :",this.FormVirAnticip.value)
    // Récupérer les données à partir du service et filtrer par `mat_pers`
  
  }
}
