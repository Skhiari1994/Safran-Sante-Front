import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import { ModifCreditService } from '../modif-credit.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-valid-mnt-anticip',
  templateUrl: './valid-mnt-anticip.component.html',
  styleUrl: './valid-mnt-anticip.component.scss'
})
export class ValidMntAnticipComponent {
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
      etat_vir: [''],  // Correct way to disable
      imput_cpt: this.fb.control({ value: '', disabled: true }),
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

    this.getAllVirAnticip()
  }

  ngOnDestroy() {
    // Clear the callback to avoid memory leaks
    this.saveService.clearSaveCallback();
    //this.saveService.setCanSave(false)
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
    this.nomPren = item.full_name;
     this.serv.getMAxNumVir(item.mat_pers).subscribe((data: any) => {
      this.FormVirAnticip.patchValue({
        num_vir: data,
        mat_pers:item.mat_pers
      })
    })

  }
  MontRest() {
    this.FormVirAnticip.patchValue({
      rest_vir: this.FormVirAnticip.get('mont_vir')?.value - this.FormVirAnticip.get('mont_antic')?.value
    })

  }

  AjouterVirAnticip() {
    console.log("this.FormVirAnticip.value :", this.FormVirAnticip.value)
     this.serv.AjoutVirAnticip(this.FormVirAnticip.value).subscribe((data: any) => {
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Virement ajouté avec succés",
        showConfirmButton: false,
        timer: 2000,
      });
      this.getPersonnels()
    }) 
  }

getAllVirAnticip(){

  this.serv.getVirAnticipInst().subscribe((data:any)=>{
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
  
    // Mise à jour initiale des champs avec l'élément sélectionné
    this.FormVirAnticip.patchValue({
      cod_soc:item.cod_soc,
      mat_pers:item.mat_pers,
      num_vir:item.num_vir,
      dat_anticip:item.dat_anticip,
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
    this.nomPren=item.nom

    console.log("this.formPretPers :",this.FormVirAnticip.value)
    // Récupérer les données à partir du service et filtrer par `mat_pers`
  
  }
}

