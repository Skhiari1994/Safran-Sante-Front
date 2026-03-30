import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import Swal from 'sweetalert2';
import { PrepRetenueService } from '../prep-retenue.service';

@Component({
  selector: 'app-valid-retenu-mens',
  templateUrl: './valid-retenu-mens.component.html',
  styleUrl: './valid-retenu-mens.component.scss'
})
export class ValidRetenuMensComponent {

  listDetRetMens: any[] = [];
  listRetMens: any[] = [];
  listRetMensFiltred: any[] = [];
  breadCrumbItems!: Array<{}>;
  error: string | null = null;
  mois: string = '';
  BordArriverForm!: FormGroup;
  pSusp: any;
  p: any

  columnTitles: { [key: string]: string } = {
    mat_pers: "Matricule",
    nom_prenom: "Nom & Prénom",
    abrv_fixe: "Rubrique",
    mnt_retenue: "Mnt retenue",
    date_fin: "Date fin"
  };

  columnTitlesVisite: { [key: string]: string } = {
    cod_pret: "Code",
    l_pret: "Lig",
    cod_grp_pret: "Grp",
    cod_typ_pret: "Type",
    lib_pret: "Libellé",
    mnt_period: "Mnt période",
    mnt_int: "Mnt Int",

  };



  constructor(
    private serv: PrepRetenueService,
    private service: PaginationService,
    private fb: FormBuilder,
    private token: TokenStorageService
  ) { }

  ngOnInit() {

    this.breadCrumbItems = [
      /*    { label: "Réception remboursement CNAM" },
         { label: "Chargement bordereau arrivée CNAM", active: true }, */
    ];
  }

  selectedRow: number | null = null;

  logRowData(data: any, index: any): void {
    this.selectedRow = index;

    const { cod_soc, mat_pers, mois_retenue, abrv_fixe } = data;


    this.serv.getDetRetMens(cod_soc, mat_pers, mois_retenue, abrv_fixe).subscribe({
      next: (response) => {
        this.listDetRetMens = response;
        console.log("Données de la ligne sélectionnée:", response);
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des données: ${err.message}`;
      }
    });

  }

  showFilters: { [key: string]: boolean } = {};

  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
    if (!this.showFilters[column]) {
      this.searchz[column] = '';
      this.applyFilter();
    }
  }

  onSort(column: any) {
    this.listRetMens = this.service.onSort(column, this.listRetMens);
  }

  searchz: any = {
    mat_pers: '',
    nom_prenom: '',
    cod_fil: '',
    num_fam: '',
    nom: '',
    dat_soin: '',
    lib_remb: '',
    tot_remb: '',
    cod_bord: '',
    reg_adh: ''
  };



  applyFilter() {
    this.listRetMens = this.listRetMensFiltred.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
  }


  validRetMens() {
    this.serv.validRetMens(this.formatDate(this.mois)).subscribe((data: any) => {
      this.serv.getRetMens(this.token.getUser().codSoc, this.formatDate(this.mois)).subscribe((data: any) => {
        this.listRetMens = data
        this.listRetMensFiltred = data
        this.applyFilter()
        console.log(this.listRetMens)
      })
      Swal.fire({

        position: 'top-end',
        icon: 'success',
        title: 'Chargement Términer !',
        showConfirmButton: false,
        timer: 2000,
      });
    })
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

  getRetenuMens(event: any) {
    console.log("test .................256554")

    this.serv.getRetMensVald(this.token.getUser().codSoc, this.formatDate(event.target.value)).subscribe((data: any) => {
      this.listRetMens = data
      this.listRetMensFiltred = data
      this.applyFilter()
      console.log(this.listRetMens)
    })
  }


  getTotalPages(): number {
    return Math.ceil(this.listRetMens.length / 6);
  }

}


