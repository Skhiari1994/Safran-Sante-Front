import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import Swal from 'sweetalert2';
import { ReglementService } from '../reglement.service';
import * as saveAs from 'file-saver';

@Component({
  selector: 'app-vir-bord-mut',
  templateUrl: './vir-bord-mut.component.html',
  styleUrl: './vir-bord-mut.component.scss'
})
export class VirBordMutComponent {

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
  bool: boolean = false
  nomFichier: string = ''
  isLoadingCharger: boolean = false;
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
    tot_net: "Tot. Remb."
  };
  message!: string;

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
      /*  { label: "Réglement" },
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

    this.serv.majModPayement(this.token.getUser().codSoc, this.cod_bord).subscribe({
      next: (data) => {
        this.bordArriver = data;
        this.bordArriverFilter = data;
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




  onValidChange(data: any, valid: any) {
    const mat = data.mat_pers;  // Replace with actual value
    const dat = data.dat_soin;   // Replace with actual value
    const numFam = data.num_fam;  // Replace with actual value 
    this.serv.MajModPay(this.token.getUser().codSoc, mat, numFam, dat, valid).subscribe((dataa: any) => {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Mode de payement est modifier avec succés !',
        showConfirmButton: false,
        timer: 2000,
      });
      this.getPayBordMutuelle();
    })

  }

  totalRem: number = 0;
  totalMut: number = 0;
  calculerTotaux(): void {

    this.totalRem = this.bordArriver.reduce((sum, item) => sum + (item.tot_honor || 0), 0);
    this.totalMut = this.bordArriver.reduce((sum, item) => sum + (item.tot_remb || 0), 0);

  }


  downloadFile() {
    this.serv.download_file(this.nomFichier).subscribe((response: any) => {
      const blob = new Blob([response as BlobPart], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);

      // Créer un lien temporaire pour déclencher le téléchargement
      const a = document.createElement('a');
      a.href = url;
      a.download = this.nomFichier;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(url);
    }, (error: any) => {
      console.error('Erreur lors du téléchargement du fichier', error);
    });
  }

  vir_bord() {


    this.serv.vir_bord(this.token.getUser().codSoc, this.cod_bord, this.nomFichier).subscribe((data: any) => {
      this.bool = true

      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Mode de payement est modifier avec succés !',
        showConfirmButton: false,
        timer: 2000,
      });
    })
  }

  generateFile() {
    this.isLoadingCharger = true;
    Swal.fire({
      title: 'Chargement...',
      text: 'Veuillez patienter pendant la génération du fichier.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    console.log('cod bord')
    this.serv.generateVirFile(this.token.getUser().codSoc, this.cod_bord).subscribe(
      response => {
        this.isLoadingCharger = false;
        Swal.close();
        this.message = response.message;
        if (response.seq) {
          this.downloadFileBordMut(response.seq);
        }
      },
      error => {
        this.isLoadingCharger = false;
        Swal.close();
        this.message = 'Error: ' + (error.error?.message || error.message);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.message
        });
      }
    );
  }

  downloadFileBordMut(seq: number) {
    this.serv.downloadVirFile(seq).subscribe(
      blob => {
        saveAs(blob, `VIR_${this.token.getUser().codSoc}_${seq}.TXT`);
      },
      error => {
        this.message = 'Error downloading file: ' + (error.error?.message || error.message);
      }
    );
  }
}




