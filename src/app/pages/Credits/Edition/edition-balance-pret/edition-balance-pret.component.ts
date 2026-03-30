import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { Personnel, AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { ConventionServiceService } from 'src/app/pages/Convention/convention-service.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { EditionCreditService } from '../edition-credit.service';
@Component({
  selector: 'app-edition-balance-pret',
  templateUrl: './edition-balance-pret.component.html',
  styleUrl: './edition-balance-pret.component.scss'
})
export class EditionBalancePretComponent {
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
  groupPretList: any[] = []
  columnsGroupPret: any[] = []
  constructor(
    private personnelService: AdherentService,
    private token: TokenStorage,
    private fb: FormBuilder,
    private saveService: SaveService,
    private serv: EditionCreditService
  ) {
    this.formAdherent = this.fb.group({
      mat_pers: [''],
      num_retr_deb: [''],
      nom_deb: [''],
      mat_pers2: [''],
      num_retr_fin: [''],
      nom_fin: [''],
      datDeb: [''],
      datFin: [''],
      cod_pret: [''],
      libPret: [''],
      corps: [''],
      etat: [''],
      typ_reg: [''],
      format: ['PDF'] // Default to PDF
    });
  }

  ngOnInit() {
    this.getAllPersonnel(this.token.getUser().codSoc);
    this.saveService.registerPrintCallback(() => this.handlePrint());

    const currentDate = new Date();
    const currentMonth = this.moisList[currentDate.getMonth()];
    this.mois = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear();

    this.formAdherent.patchValue({
      mois: currentMonth,
      annee: currentYear
    });
    this.getCorps();
    this.getGroupePret();
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

    this.serv.editionBalancePretExcel(
      '120',
      this.token.getUser().codSoc,
      this.formAdherent.get('mat_pers')?.value,
      this.formAdherent.get('mat_pers2')?.value,
      this.formAdherent.get('datDeb')?.value,
      this.formAdherent.get('datFin')?.value,
      this.formAdherent.get('cod_pret')?.value,
      this.formAdherent.get('corps')?.value,
      this.formAdherent.get('etat')?.value,
      this.formAdherent.get('typ_reg')?.value,
    ).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileURL;
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `Balance_pret_${formattedDate}.xlsx`;
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
  getCorps() {
    this.personnelService.getCorps().subscribe((data) => {
      this.listCorps = data;
    });
  }

  onSelectedVMat(item: Personnel) {
    this.formAdherent.patchValue({
      mat_pers: item.mat_pers,
      num_retr_deb: item.num_retr,
      nom_deb: item.nom
    });
  }

  onSelectedVMat2(item: Personnel) {
    this.formAdherent.patchValue({
      mat_pers2: item.mat_pers,
      num_retr_fin: item.num_retr,
      nom_fin: item.nom
    });
  }
  onSelectedGrpPret(item: any) {
    this.formAdherent.patchValue({
      cod_pret: item.cod_grp_pret,
      libPret: item.lib_grp_pret,
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
  getGroupePret() {
    this.serv.getGroupePret().subscribe((data) => {
      this.groupPretList = data;
      this.columnsGroupPret = [
        { key: "cod_grp_pret", label: "Code" },
        { key: "lib_grp_pret", label: "Libelle" },
      ];
    });
  }
  getPersonnelByMatPers(soc: string, matPers: string) {
    this.personnelService
      .getPersonnelByMatPers(soc, matPers)
      .subscribe((data) => {
        this.personnelList = data;
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

    this.serv.editionBalancePret(
      '96',
      this.token.getUser().codSoc,
      this.formAdherent.get('mat_pers')?.value,
      this.formAdherent.get('mat_pers2')?.value,
      this.formAdherent.get('datDeb')?.value,
      this.formAdherent.get('datFin')?.value,
      this.formAdherent.get('cod_pret')?.value,
      this.formAdherent.get('corps')?.value,
      this.formAdherent.get('etat')?.value,
      this.formAdherent.get('typ_reg')?.value,
    ).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileURL;
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `Balance_pret_${formattedDate}.pdf`;
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

