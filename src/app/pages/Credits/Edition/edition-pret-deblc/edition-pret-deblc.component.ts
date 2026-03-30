import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { Personnel, AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { EditionCreditService } from '../edition-credit.service';

@Component({
  selector: 'app-edition-pret-deblc',
  templateUrl: './edition-pret-deblc.component.html',
  styleUrl: './edition-pret-deblc.component.scss'
})
export class EditionPretDeblcComponent {
  personnelList: Personnel[] = [];
  formAdherent: FormGroup;
  columnsSearch: any[] = [];
  currentMonth: any
  listCorps: any[] = [];
  mois: any
  moisList: string[] = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  typPretList: any[] = []
  columnstypPret: any[] = []
  constructor(
    private personnelService: AdherentService,
    private token: TokenStorage,
    private fb: FormBuilder,
    private saveService: SaveService,
    private serv: EditionCreditService
  ) {
    this.formAdherent = this.fb.group({
      datDeb: [''],
      typ_pret: [''],
      grp_pret: [''],
      libPret: [''],
      format: ['PDF'] // Default to PDF
    });
  }

  ngOnInit() {
    this.saveService.registerPrintCallback(() => this.handlePrint());

    const currentDate = new Date();
    const currentMonth = this.moisList[currentDate.getMonth()];
    this.mois = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear();

    this.formAdherent.patchValue({
      mois: currentMonth,
      annee: currentYear
    });
    this.getTypePret();
  }

  handlePrint() {
    const format = this.formAdherent.get('format')?.value;
    if (format === 'PDF') {
      this.printReport();
    } else {
      this.printExcel();
    }
  }

  printExcel() {
    Swal.fire({
      title: 'Chargement en cours...',
      html: 'Veuillez patienter pendant la génération du fichier Excel.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.serv.editionPretDeblcExcel(
      '121',
      this.token.getUser().codSoc,
      this.formAdherent.get('grp_pret')?.value,
      this.formAdherent.get('typ_pret')?.value,
      this.formAdherent.get('datDeb')?.value,
    ).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileURL;
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `Prets_debloques_${formattedDate}.xlsx`;
        a.click();
        URL.revokeObjectURL(fileURL);
        Swal.close();
      },
      (error: any) => {
        console.log(error);
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Échec de la génération du fichier Excel.'
        });
      }
    );
  }



  onSelectedTyp(item: any) {
    this.formAdherent.patchValue({
      grp_pret: item.cod_grp_pret,
      typ_pret: item.typ_pret,
      libPret: item.lib_pret,
    });
  }

  getTypePret() {
    this.serv.getTypePret().subscribe((data) => {
      this.typPretList = data;
      this.columnstypPret = [
        { key: "typ_pret", label: "Code" },
        { key: "lib_pret", label: "Libelle" },
      ];
    });
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
  printReport() {
    Swal.fire({
      title: 'Chargement en cours...',
      html: 'Veuillez patienter pendant la génération du rapport PDF.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.serv.editionPretDeblc(
      '97',
      this.token.getUser().codSoc,
      this.formAdherent.get('grp_pret')?.value,
      this.formAdherent.get('typ_pret')?.value,
      this.formAdherent.get('datDeb')?.value,
    ).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileURL;
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `Prets_debloques_${formattedDate}.pdf`;
        a.click();
        URL.revokeObjectURL(fileURL);
        Swal.close();
      },
      (error: any) => {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Échec de la génération du rapport PDF.'
        });
      }
    );
  }



}


