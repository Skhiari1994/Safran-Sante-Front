import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { ReceptionRemboursementService } from '../../Reception remboursements CNAM/reception-remboursement.service';
import { ReglementService } from '../reglement.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-pay-bord-mut',
  templateUrl: './pay-bord-mut.component.html',
  styleUrl: './pay-bord-mut.component.scss'
})
export class PayBordMutComponent {


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
      /*   { label: "Réglement" },
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

    this.serv.getPayBordMutuelle(this.token.getUser().codSoc, this.cod_bord).subscribe({
      next: (data) => {
        this.bordArriver = data;
        this.bordArriverFilter = data;
        console.log("this.bordArriver", this.bordArriver)
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des données: ${err.message}`;
      },
    });

  }



  getAllBordEnvoi(): void {
    this.serv.PayBordEnvoi(this.token.getUser().codSoc).subscribe({
      next: (data) => {
        this.AllBordEnvoi = data;
        console.log("donne des bordereau", this.AllBordEnvoi)
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
      console.log("selected cod_bord", event.cod_bord);


    }
  }

  getTotalPages(): number {
    return Math.ceil(this.bordArriver.length / 9);
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
      this.getPayBordMutuelle();
    })


  }
  getTotalHonor(): number {
    return this.bordArriver
      ? this.bordArriver.reduce((sum: number, item: { tot_honor: string; }) => sum + (parseFloat(item.tot_honor) || 0), 0)
      : 0;
  }

  getTotalTot(): number {
    return this.bordArriver
      ? this.bordArriver.reduce((sum: number, item: { tot_net: string; }) => sum + (parseFloat(item.tot_net) || 0), 0)
      : 0;
  }

  printEtatEmarg() {
    if (!this.cod_bord) {
      Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Veuillez sélectionner un bordereau.'
      });
      return;
    }

    Swal.fire({
      title: 'Chargement en cours...',
      html: 'Veuillez patienter pendant la génération du rapport.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.serv.printEtatEmargMut(this.token.getUser().codSoc, this.cod_bord).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);

        const a = document.createElement('a');
        a.href = fileURL;

        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `Etat_Emargement_${this.cod_bord}_${formattedDate}.pdf`;

        a.click();

        URL.revokeObjectURL(fileURL);

        Swal.close();
      },
      (error: any) => {
        console.log(error);

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Échec de la génération du rapport.'
        });
      }
    );
  }

  printOrdreVirement() {
    if (!this.cod_bord) {
      Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Veuillez sélectionner un bordereau.'
      });
      return;
    }

    Swal.fire({
      title: 'Chargement en cours...',
      html: 'Veuillez patienter pendant la génération du rapport.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.serv.printOrdreVirementMut(this.token.getUser().codSoc, this.cod_bord).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);

        const a = document.createElement('a');
        a.href = fileURL;

        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `Ordre_Virement_${this.cod_bord}_${formattedDate}.pdf`;

        a.click();

        URL.revokeObjectURL(fileURL);

        Swal.close();
      },
      (error: any) => {
        console.log(error);

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Échec de la génération du rapport.'
        });
      }
    );
  }
}



