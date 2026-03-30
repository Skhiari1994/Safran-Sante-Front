import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { ModifCreditService } from '../modif-credit.service';

@Component({
  selector: 'app-suspenssion-credit',
  templateUrl: './suspenssion-credit.component.html',
  styleUrl: './suspenssion-credit.component.scss'
})
export class SuspenssionCreditComponent {
  breadCrumbItems!: Array<{}>;

  p:number=1
  formEtatPretPers!: FormGroup
  listPersonnel: any[] = []
  listPret: any[] = []
  columnsPers: any[] = []
  columnsEtatPretPErs: any[] = []
  columnPret: any[] = []
  listVir: any[] = []
  columnVir: any[] = []
  listEtatPretPErs: any[] = []
  listLigPret: any[] = []
  listPretAnticipByMat: any[] = []
  listEtatPret: any[] = []
  nomPers: String = ''
  libPret: String = ''
  datNais: String = ''
  mntRemb: String = ''
  prtRendu: String = ''
  remMen: String = ''
  prtEch: String = ''
  datDeb: String = ''
  datDebEtat: String = ''
  datFin: String = ''
  datEffet: String = ''
  nbrRetenue: String = ''
  element: String = ''
  typePret: String = ''
  matricule: String = ''
  numVir:String=''
  numVirControle:String=''
  nbrMois: String = ''
  restVir:String=''
  natEtat:String=''
  valueToggl:number=0
  isSearch: boolean = true;
  searchfield :boolean = false;
  bool:boolean = false;
  constructor(private serv: ModifCreditService, private token: TokenStorageService, private fb: FormBuilder,private saveService:SaveService,
    private service:PaginationService
  ) {
    this.formEtatPretPers = this.fb.group({
      cod_soc: [this.token.getUser().codSoc],
      mat_pers: [''],
      cod_pret: [''],
      num_etat_pret: [''],
      dat_effet: [''],
      nat_etat_pret: [''],
      type_anticip: [''],
      dat_debut_etat: [''],
      dat_fin_etat: [''],
      mnt_anticipe: [''],
      mnt_capital: [''],
      mnt_interet: [''],
      int_grace: [''],
      mode_payement: [''],
      num_piece: [''],
      dat_piece: [''],
      cod_banq: [''],
      cod_agc: [''],
      nom_emet_piece: [''],
      obs_etat: [''],
      cod_etat_pret: [''],
      typ_etat: ['P'],
      inject: [''],
      num_mvt: [''],
      dat_mvt: [''],
      dat_saisie: [''],
      cod_user: [''],
      cod_grp_pret: [''],
      num_vir: [''],

    })

  }
  ngOnInit() {
    this.getPersonnels()
    this.getEtatPretPers()
   this.getEtatPretSusp()
    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch = canSearch
      console.log("is search valid", canSearch)

    })

    this.saveService.add$.subscribe((reset) => {

      if (reset) {
         this.formEtatPretPers.reset(); // Reset the form
      this.searchfield=false
       this.matricule = "";
       this.libPret="";
       this.nomPers = "";
       this.datNais = "";
       this.datDeb="";
       this.datFin="";
       this.nbrRetenue="";
       this.mntRemb="";
       this.remMen="";
       this.prtRendu="";
       this.prtEch="";
        this.saveService.setAdded(false); // Reset the observable to false
        this.formEtatPretPers.patchValue({
           typ_etat: 'P',
          cod_soc:this.token.getUser().codSoc 

        })
      }
    });
  }

  getEtatPretPers() {
    this.serv.getEtatPretPersSusp().subscribe((data: any) => {
      this.listEtatPretPErs = data
      console.log("this.listEtatPretPErs :",this.listEtatPretPErs)
      this.columnsEtatPretPErs = [
        { key: "cod_pret", label: "Code pêt" },
        { key: "mat_pers", label: "Matricule" },
        { key: "nom", label: "Nom & Prénom" },

      ];
    })
  }
  search(item: any) {
    console.log("item :", item);
  this.searchfield=true
const datDeb=item.dat_debut_etat.substring(3)
const datFin=item.dat_fin_etat.substring(3)

    // Mise à jour initiale des champs avec l'élément sélectionné
    this.formEtatPretPers.patchValue({
      cod_soc:item.cod_soc,
      mat_pers:item.mat_pers,
      cod_pret:item.cod_pret,
      num_etat_pret:item.num_etat_pret,
      dat_effet:item.dat_effet,
      nat_etat_pret:item.nat_etat_pret,
      type_anticip:item.type_anticip,
      dat_debut_etat:datDeb,
      dat_fin_etat:datFin,
      mnt_anticipe:Number(item.mnt_anticipe).toFixed(3),
      mnt_capital:Number(item.mnt_capital).toFixed(3),
      mnt_interet:Number(item.mnt_interet).toFixed(3),
      int_grace:Number(item.int_grace).toFixed(3),
      mode_payement:item.mode_payement,
      num_piece:item.num_piece,
      dat_piece:item.dat_piece,
      cod_banq:item.cod_banq,
      cod_agc:item.cod_agc,
      nom_emet_piece:item.nom_emet_piece,
      obs_etat:item.obs_etat,
      cod_etat_pret:item.cod_etat_pret,
      typ_etat:item.typ_etat,
      inject:item.inject,
      num_mvt:item.num_mvt,
      dat_mvt:item.dat_mvt,
      dat_saisie:item.dat_saisie,
      cod_user:item.cod_user,
      cod_grp_pret:item.cod_grp_pret,
      num_vir:item.num_vir,
      
    });
    this.matricule=item.mat_pers
    const [moisDeb, anneeDeb] = datDeb.split('/').map(Number);
    const [moisFin, anneeFin] = datFin.split('/').map(Number);
    
    // Calcul de la différence en mois
    const diffMois = (anneeFin - anneeDeb) * 12 + (moisFin - moisDeb);
    
    console.log("Nombre de mois:", diffMois);
    this.nbrMois=diffMois.toString()
    if(item.cod_etat_pret=='AT'){
      this.natEtat='AT'
    }else if(item.cod_etat_pret=='AM'){
      this.natEtat='AP'
    }
    this.serv.getPersonnelAnticipByMat(item.cod_soc,item.mat_pers).subscribe((data: any) => {
      this.nomPers=data.nom
      this.datNais=data.dat_nais
    })

     
    this.serv.getPretAnticipByPret(item.cod_soc,item.mat_pers,item.cod_pret).subscribe((response: any) => {

      this.listPretAnticipByMat=response 
      console.log(this.listPretAnticipByMat)
      this.typePret=response.typ_pret
      this.libPret=response.lib_pret
      this.mntRemb = Number(response.prt_mnt_rem).toFixed(3);
      this.prtRendu = Number(response.prt_rendu).toFixed(3);
      this.remMen = Number(response.rem_men).toFixed(3);
      this.prtEch=response.prt_ech
      this.datDeb = response.prt_dat_deb;
      this.datFin = response.prt_dat_fin;
      this.nbrRetenue = response.nbr_retenue;
    })
    this.serv.getLigPRet(item.cod_soc,item.mat_pers,item.cod_pret).subscribe((data:any)=>{
      this.listLigPret=data
    })
 
 
  }
  getPersonnels() {
    this.serv.getPersonnelAnticip(this.token.getUser().codSoc).subscribe((data: any) => {
      this.listPersonnel = data
      this.columnsPers = [
        { key: "mat_pers", label: "Matricule" },
        { key: "nom", label: "Nom & Prénom" },

      ];
    })
  }
  getEtatPretSusp(){
    this.serv.getEtatPretSusp().subscribe((data:any)=>{
      this.listEtatPret=data
    })
  }
  onSelectedVMat(item: any) {
    console.log("item :", item)

    this.nomPers = item.nom,
      this.datNais = item.dat_nais
    this.formEtatPretPers.patchValue({
      mat_pers: item.mat_pers
    })
    this.serv.getPretAnticip(this.token.getUser().codSoc, item.mat_pers).subscribe((data: any) => {
      this.listPret = data
      this.columnPret = [
        { key: "cod_pret", label: "Code prêt" },
        { key: "typ_pret", label: "Type prêt" },
        { key: "lib_pret", label: "Lib prêt" }
      ]
    })
this.serv.getVirAnticipByMat(item.mat_pers).subscribe((data:any)=>{
  this.listVir=data
  this.columnVir= [
    { key: "num_vir", label: "Numéro" },
    { key: "ref_metier", label: "Ref metier" },

  ];
})
  }
 
  //   onSelectTypPret(item:any){
  // this.libPret=item.lib_pret
  // this.datDeb=item.prt_dat_deb
  // this.datFin=item.prt_dat_fin
  // this.datEffet=item.dat_effet
  // this.mntRemb=parseFloat(Number(item.prt_mnt_rem).toFixed(3));
  // this.prtEch=item.prt_ech
  // this.prtRendu=item.prt_rendu
  // this.remMen=item.rem_men
  //   }

  onSelectTypPret(item: any) {
    this.libPret = item.lib_pret;
    this.datDeb = item.prt_dat_deb;
    this.datFin = item.prt_dat_fin;
    this.nbrRetenue = item.nbr_retenue;

    this.datEffet = item.dat_effet;
    this.prtEch = item.prt_ech;

    // Assigner sous forme de string avec format 3 décimales
    this.mntRemb = Number(item.prt_mnt_rem).toFixed(3);
    this.prtRendu = Number(item.prt_rendu).toFixed(3);
    this.remMen = Number(item.rem_men).toFixed(3);
    this.formEtatPretPers.patchValue({
      cod_pret:item.cod_pret,
      dat_effet:item.dat_effet,
      cod_grp_pret:item.cod_grp_pret
    })
  }
  onSelectedNumVir(item:any){
    this.restVir=item.rest_vir
    this.numVirControle=item.num_vir
    this.formEtatPretPers.patchValue({
      num_vir:item.num_vir
    })
  }
  async OnchangeEtatPret(event: any) { 
    this.natEtat = await this.getNatEtat(event);    
      if (this.natEtat == 'ST') {
      this.serv.periode_ant_tot(this.token.getUser().codSoc, this.formEtatPretPers.get('mat_pers')?.value,
        this.formEtatPretPers.get('cod_pret')?.value).subscribe((data: any) => {
           
          this.formEtatPretPers.patchValue({
            dat_debut_etat: data.dat_deb_etat_,
            dat_fin_etat: data.dat_fin_etat_,
          })
          this.datDebEtat=data.dat_deb_etat_
          if (data.message) {
            Swal.fire({
              title: 'Message',
              text: data.message,
              icon: 'info',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'OK',
            });
          }
        });
         this.formEtatPretPers.get('dat_fin_etat')?.disable(); 


    
    }else{
      this.serv.periode_ant_tot(this.token.getUser().codSoc, this.formEtatPretPers.get('mat_pers')?.value,
      this.formEtatPretPers.get('cod_pret')?.value).subscribe((data: any) => {
        this.formEtatPretPers.patchValue({
          dat_debut_etat: data.dat_deb_etat_,
          dat_fin_etat: data.dat_fin_etat_,
        })
        this.datDebEtat=data.dat_deb_etat_
        if (data.message) {
          Swal.fire({
            title: 'Message',
            text: data.message,
            icon: 'info',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });
        }
      });
       this.formEtatPretPers.get('dat_fin_etat')?.enable(); 
    }
  }

 
  async getNatEtat(item: any): Promise<string> {
    console.log("item", item.target.value);
    try {
      const data: any = await this.serv.getEtatPretSuspByEtat(item.target.value).toPromise();
      return data.nat_etat_pret;
    } catch (error) {
      console.error("Erreur lors de la récupération de natEtat:", error);
      return ''; // Valeur par défaut en cas d'erreur
    }
  }
   
   valider(){

   this.formEtatPretPers.patchValue({
    dat_debut_etat:this.formEtatPretPers.get('dat_debut_etat')?.value.substring(3),
    dat_fin_etat:this.formEtatPretPers.get('dat_fin_etat')?.value.substring(3)

   }) 
   console.log(this.formEtatPretPers.getRawValue())
    this.serv.ValiderSusp(this.formEtatPretPers.get("cod_soc")?.value,this.formEtatPretPers.get("mat_pers")?.value,this.formEtatPretPers.get("cod_pret")?.value,this.formEtatPretPers.get("num_etat_pret")?.value,
    this.formEtatPretPers.get("cod_etat_pret")?.value,this.natEtat, this.formEtatPretPers.get("type_anticip")?.value,this.formEtatPretPers.get("dat_debut_etat")?.value ,this.formEtatPretPers.get("dat_fin_etat")?.value).subscribe((data:any)=>{
    console.log("data :",data)
    this.element=data.element
    if (data.message) {
      Swal.fire({
        title: 'Message',
        text: data.message,
        icon: 'info',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
    }
    this.serv.getLigPRet(this.formEtatPretPers.get("cod_soc")?.value,this.formEtatPretPers.get("mat_pers")?.value,this.formEtatPretPers.get("cod_pret")?.value).subscribe((data:any)=>{
      this.listLigPret=data
    })
  })
   }

   AddEtatPretPers(){
     

      this.formEtatPretPers.patchValue({
        dat_debut_etat:'01/'+this.formEtatPretPers.get('dat_debut_etat')?.value,
        dat_fin_etat:'01/'+this.formEtatPretPers.get('dat_fin_etat')?.value,
        nat_etat_pret:this.natEtat

      })
      this.serv.getnuEtatPret(this.token.getUser().codSoc).subscribe((data:any)=>{
        this.formEtatPretPers.patchValue({
          num_etat_pret:data
        })
        this.serv.AddEtatPretPers(this.formEtatPretPers.getRawValue()).subscribe((data=>{
          Swal.fire({
            title: 'Message',
            text: "Ajout Effectuer avec succés",
            icon: 'success',
            confirmButtonColor: '#3085d6',
            position:'top-right'
           });
        }))
        console.log("Add data :",this.formEtatPretPers.getRawValue())

      })

  
   }

   onPageChangeForGouv(page: number): void {
    console.log("Pagination pour le tableau 1 : ", page);
  
    this.p = page;
   
  }
  onSort(column: any) {
     this.listLigPret = this.service.onSort(column, this.listLigPret);
  }

  comparerDates(mois_saisie: String, mois_pret: String): void {
    mois_saisie= this.formatDate(mois_saisie)
console.log(mois_saisie)
console.log(mois_pret)

    // Séparer mois et année et convertir en nombre
    const [mois1, annee1] = mois_saisie.split("/").map(Number);
    const [mois2, annee2] = mois_pret.split("/").map(Number);

    // Vérifier que les valeurs sont valides
    

    // Convertir en format numérique YYYYMM pour comparer facilement
    const date1 = annee1 * 100 + mois1;
    const date2 = annee2 * 100 + mois2;
    console.log("date1",date1)
    console.log("date2 :",date2)

    // Comparaison
    if (date1 < date2) {
      Swal.fire({
        title: "Attention",
        text: "La date saisie est antérieure à la date du prêt !",
        icon: "warning",
        confirmButtonText: "OK",
      }).then(() => {
        // Effacez la valeur du champ
        this.formEtatPretPers.get('dat_debut_etat')?.patchValue('');
        // Remet le focus sur le champ
       });
    }
  }

  verifierDate(): void {
    const mois_saisie = this.formEtatPretPers.get('dat_debut_etat')?.value;
    const mois_pret = this.datDebEtat;

    this.comparerDates(mois_saisie, mois_pret);  
  }

  formatDate(dateString: any): string {
    // Ensure the string is in the format 'ddmmyyyy'
    if (dateString && dateString.length === 6) {
       const month = dateString.substring(0, 2);
      const year = dateString.substring(2, 6);
      return `${month}/${year}`;
    }
    return dateString;
  }

 
}

