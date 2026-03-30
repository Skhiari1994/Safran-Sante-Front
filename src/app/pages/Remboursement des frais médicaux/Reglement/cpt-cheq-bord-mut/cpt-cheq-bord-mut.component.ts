import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import Swal from 'sweetalert2';
import { ReglementService } from '../reglement.service';

@Component({
  selector: 'app-cpt-cheq-bord-mut',
  templateUrl: './cpt-cheq-bord-mut.component.html',
  styleUrl: './cpt-cheq-bord-mut.component.scss'
})
export class CptCheqBordMutComponent {

  AllBordEnvoi: any[] = [];
  breadCrumbItems!: Array<{}>;
  columnBordEnvoi: any[] = [];
  bordArriver: any[] = [];
  bordArriverFilter: any[] = [];
  error: string | null = null;
  dateBord: string = "";
  cod_bord: string = "";
  codBord: string = "";
  reg_adh: string = "";
  BordEnvoiForm!: FormGroup;
  selectedRow: number | null = null;
  pSusp: any;
  p: any;

  columnTitles: { [key: string]: string } = {
    mat_pers: "Matriucle",
    nom_complet_pers: "Nom & Prénom",
    cod_fil: "Filière",
    num_fam: "Préstataire",
    nom_pers: "Nom",
    dat_saisie: "Date saisie",
    dat_soin: "Date soin",
    solde: "Solde.",
    tot_honor: "Tot. Honor.",
    tot_net: "Tot. Net."
  };

  constructor(
    private serv: ReglementService,
    private service: PaginationService,
    private fb: FormBuilder,
    private token: TokenStorage
  ) { }

  ngOnInit() {
    this.BordEnvoiForm = this.fb.group({
      cod_bord: [""],
      dat_bord: [""],
      nbr_bult: [""],
      lib_assurance: [""],
      dat_deb: [""],
      dat_fin: [""],
      tot_net: [""],
      tot_honor: [""],
      cod_assur: [""]
    });

    this.getAllBordEnvoi();

    this.breadCrumbItems = [
      /* { label: "Réglement" },
      { label: "Réglement des adhérents par bordereau mutuelle", active: true }, */
    ];
  }

  showFilters: { [key: string]: boolean } = {};

  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }

  onSort(column: any) {
    this.bordArriver = this.service.onSort(column, this.bordArriver);
  }

  searchz: any = {

    mat_pers: "",
    nom_complet_pers: "",
    cod_fil: "",
    num_fam: "",
    nom_pers: "",
    dat_saisie: "",
    dat_soin: "",
    solde: "",
    tot_honor: "",
    tot_net: "",

  };

  applyFilter() {
    this.bordArriver = this.bordArriverFilter.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
  }






  getPayBordMutuelle(): void {

    this.serv.getBultSoinCheqCpt(this.token.getUser().codSoc, this.cod_bord).subscribe({
      next: (data) => {
        this.bordArriver = data;
        this.bordArriverFilter = data;
        console.log("this.bordArriver",this.bordArriver)
        this.calculerTotaux()
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des données: ${err.message}`;
      },
    });

  }



  getAllBordEnvoi(): void {
    this.serv.getAllBordEnvoi(this.token.getUser().codSoc).subscribe({
      next: (data) => {
        this.AllBordEnvoi = data;
         this.columnBordEnvoi = [
          { key: "cod_bord", label: "Code de bordereau" },
          { key: "dat_bord", label: "Date de bordereau" },
        ];
      },
      error: (err) => {
        this.error = "Erreur lors de la récupération des données";
      },
    });
  }

  onSelectedValueBordEnvoi(event: any): void {
    if (event) {
      this.cod_bord = event.cod_bord;
      this.dateBord = event.dat_bord;
      this.reg_adh = event.reg_adh
      this.BordEnvoiForm.patchValue({
        cod_bord: event.cod_bord,
        dat_bord: event.dat_bord,
        nbr_bult: event.nbr_bult,
        lib_assurance: event.lib_assurance,
        dat_deb: event.dat_deb,
        dat_fin: event.dat_fin,
        tot_net: event.tot_net,
        tot_honor: event.tot_honor,
        cod_assur: event.cod_assur
      });


      this.getPayBordMutuelle();
 

    }
  }

  getTotalPages(): number {
    return Math.ceil(this.bordArriver.length / 9);
  }



 

  totalRem: number = 0;
  totalMut: number = 0;
  calculerTotaux(): void {
     
    this.totalRem = this.bordArriver.reduce((sum, item) => sum + (item.tot_honor || 0), 0);
    this.totalMut = this.bordArriver.reduce((sum, item) => sum + (item.tot_net || 0), 0);
    
  }

  majRegAdh() {
    
    Swal.fire({
      title: 'Traitement en cours...',
      html: 'Veuillez patienter...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();  
      }
    });
  
    this.serv.majRegAdh(this.token.getUser().codSoc, this.cod_bord).subscribe(
      (data: any) => {
        this.getPayBordMutuelle();
        
       
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Comptabilisation terminée !',
          showConfirmButton: false,
          timer: 2000
        });
      },
      (error) => {
        
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la comptabilisation.',
        });
      }
    );
  }
    onValidChange(data: any, valid: any) {
        const mat = data.mat_pers;  // Replace with actual value
        const dat = data.dat_soin;   // Replace with actual value
        const numFam = data.num_fam;  // Replace with actual value
        console.log("data :", data)
        console.log("valid :", valid)
        this.serv.ReglerAdh(this.token.getUser().codSoc, mat, numFam, dat, valid).subscribe((dataa: any) => {
          Swal.fire({
            title: 'Message',
            text: 'Régler',
            icon: 'success',
    
          });
         // this.getPayBordMutuelle();
        })
    
    
      }
      onModPayChange(row: any) {
    if (row.mod_pay !== 'V') {
      row.dat_vir = null;
    }
  }
  
logRowData(rowData: any, rowIndex: number): void {
  this.selectedRow = rowIndex;
  console.log('Row index:', rowIndex);
  console.log('Row data:', rowData);
}
}





