import { Component } from '@angular/core';
import { DebCreditService } from '../deb-credit.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { EditionService } from 'src/app/pages/Remboursement des frais médicaux/Editions/edition.service';
import { EditionCreditService } from '../../Edition/edition-credit.service';

@Component({
  selector: 'app-reg-manuel-credit',
  templateUrl: './reg-manuel-credit.component.html',
  styleUrl: './reg-manuel-credit.component.scss'
})
export class RegManuelCreditComponent {
  formSearch!: FormGroup
  listDetailPret: any[] = []
  listLigRegSearch: any[] = []
  columnsDetailPret: any[] = []
  listLigReg: any[] = []
  grpPret: string = ''
  libPret: string = ''
  pSusp: any;
  breadCrumbItems!: Array<{}>;

  constructor(private saveService: SaveService, private serv: DebCreditService, private printServ: EditionCreditService, private token: TokenStorageService, private fb: FormBuilder, public service: PaginationService) {
    this.formSearch = this.fb.group({
      mois: [''],
      filtrer: ['G'],
      corps: [''],
      codGrp: ['']
    })

  }

  ngOnInit() {
    this.getDetailPret()
    this.saveService.registerPrintCallback(() => this.printReport());

  }



  ngOnDestroy() {
    this.saveService.setIsSearch(false)
  }
  getDetailPret() {
    this.serv.getDetailPret(this.token.getUser().codSoc).subscribe((data) => {
      this.listDetailPret = data;
      // Définir les colonnes dynamiques du tableau
      this.columnsDetailPret = [
        { key: "codGrpPret", label: "Groupe prêt" },

        { key: "libPret", label: "Libelle" },

      ];
    });
  }
  onSelectedLigPretCorps(item: any) {

    this.serv.getLigPretRegManuel(this.token.getUser().codSoc, this.formSearch.get('mois')?.value,
      this.formSearch.get('filtrer')?.value, this.formSearch.get('corps')?.value, this.formSearch.get('codGrp')?.value).subscribe((data: any) => {
        this.listLigReg = data
        this.listLigRegSearch = data

      })


  }
  onSelectedDetailPret(item: any) {
    this.libPret = item.libPret

    this.formSearch.patchValue({
      codGrp: item.codGrpPret,

    })
    console.log("mois :", this.formSearch.get('mois')?.value)
    this.serv.getLigPretRegManuel(this.token.getUser().codSoc, this.formSearch.get('mois')?.value,
      this.formSearch.get('filtrer')?.value, this.formSearch.get('corps')?.value, item.codGrpPret).subscribe((data: any) => {
        this.listLigReg = data
        this.listLigRegSearch = data
      })


  }

  onSort(column: any) {
    this.listLigReg = this.service.onSort(
      column,
      this.listLigReg
    );
  }


  searchz: any = {
    matPers: "",
    numRetr: "",
    nom: "",
    type: "",
    mntInt: "",
    mntPeriod: "",
    lpret: "",
    codPret: "",
    capRest: ""
  };
  applyFilter() {
    this.listLigReg = this.listLigRegSearch.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
  }


  onValidChange(data: any, valid: any) {
    const mat = data.matPers;  // Replace with actual value
    const codPret = data.codPret;   // Replace with actual value
    const lpret = data.lpret;  // Replace with actual value
    console.log("data :", data)
    console.log("valid :", valid)
    this.serv.upLigPret(this.token.getUser().codSoc, mat, codPret, lpret, valid).subscribe((dataa: any) => {
      this.serv.getLigPretRegManuel(this.token.getUser().codSoc, this.formSearch.get('mois')?.value,
        this.formSearch.get('filtrer')?.value, this.formSearch.get('corps')?.value, this.formSearch.get('codGrp')?.value).subscribe((data: any) => {
          this.listLigReg = data
        })
    })

  }


  printReport() {
    // Show the loading Swal before starting the request
    Swal.fire({
      title: 'Chargement en cours...',
      html: 'Veuillez patienter pendant la génération du rapport.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });


    this.printServ.editionListRetNonReg(
      '134',
      this.token.getUser().codSoc,
      this.formSearch.get('corps')?.value,
      this.formSearch.get('codGrp')?.value,
      this.formSearch.get('mois')?.value
    ).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);

        const a = document.createElement('a');
        a.href = fileURL;

        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `Rapport_list_ech_non_reg${formattedDate}.pdf`;

        a.click();

        // Nettoyage
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
