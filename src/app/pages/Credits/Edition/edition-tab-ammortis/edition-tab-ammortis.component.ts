import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { Personnel, AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { IndemnitesService } from 'src/app/pages/Indemnites/indemnites.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { EditionCreditService } from '../edition-credit.service';

@Component({
  selector: 'app-edition-tab-ammortis',
  templateUrl: './edition-tab-ammortis.component.html',
  styleUrl: './edition-tab-ammortis.component.scss'
})
export class EditionTabAmmortisComponent {
  personnelList: Personnel[] = [];
  formAdherent: FormGroup;
  columnsSearch: any[] = [];
  currentMonth: any
  listCorps: any[] = [];
  mois: any
  listTypPret: any[] = [];
  columnTypPret: any[] = [];
  listLieu: any[] = [];
  columnsLieu: any[] = [];
  constructor(
    private personnelService: AdherentService,
    private token: TokenStorage,
    private fb: FormBuilder,
    private saveService: SaveService,
    private serv: EditionCreditService
  ) {
    this.formAdherent = this.fb.group({
      mat_pers_deb: [''],
      nom_deb: [''],
      typ_pret: [''],
      lib_pret: [''],
      cod_pret: [''],
      format: ['PDF']
    });
  }

  ngOnInit() {
    this.getAllPersonnel(this.token.getUser().codSoc);
    this.saveService.registerPrintCallback(() => this.handlePrint());
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

    this.serv.editionTabAmmortExcel(
      '118',
      this.token.getUser().codSoc,
      this.formAdherent.get('cod_pret')?.value,
      this.formAdherent.get('mat_pers_deb')?.value,
    ).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileURL;
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `Tableau_amortissement_${formattedDate}.xlsx`;
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

  onSelectedVMat(item: Personnel) {
    this.formAdherent.patchValue({
      mat_pers_deb: item.mat_pers,
      nom_deb: item.nom
    });

    this.serv.getPretPers(item.mat_pers).subscribe((data: any) => {
      this.listTypPret = data
      this.columnTypPret = [
        { key: "cod_pret", label: "Code Prêt" },
        { key: "typ_pret", label: "Type prêt" },
        { key: "lib_pret", label: "N° CNRPS" },
      ];
    })
  }



  onSelectedTypPret(item: any) {
    this.formAdherent.patchValue({
      cod_pret: item.cod_pret,
      typ_pret: item.typ_pret,
      lib_pret: item.lib_pret,
    });
  }

  getAllPersonnel(soc: string) {
    this.personnelService.getAllPersonnel(soc).subscribe((data) => {
      this.personnelList = data;
      this.columnsSearch = [
        { key: "mat_pers", label: "Matricule" },
        { key: "nom", label: "Nom & Prénom" },
        { key: "num_retr", label: "N° CNRPS" },
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

    this.serv.editionTabAmmort(
      '94',
      this.token.getUser().codSoc,
      this.formAdherent.get('cod_pret')?.value,
      this.formAdherent.get('mat_pers_deb')?.value,
    ).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileURL;
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `Tableau_amortissement_${formattedDate}.pdf`;
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




