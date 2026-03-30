import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { Personnel, AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { ConventionServiceService } from '../../convention-service.service';

@Component({
  selector: 'app-edition-etat-reg-espece',
  templateUrl: './edition-etat-reg-espece.component.html',
  styleUrl: './edition-etat-reg-espece.component.scss'
})
export class EditionEtatRegEspeceComponent {
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
  offConvList: any[] = [];
  columnsOffConv: any[] = [];
  constructor(
    private personnelService: AdherentService,
    private token: TokenStorage,
    private fb: FormBuilder,
    private saveService: SaveService,
    private serv: ConventionServiceService
  ) {
    this.formAdherent = this.fb.group({
      mat_pers: [''],
      num_retr_deb: [''],
      nom_deb: [''],
      mat_pers2: [''],
      num_retr_fin: [''],
      nom_fin: [''],
      mois: [''],
      annee: [''],
      etat_cotis: [''],
      cod_off: [''],
      lib_off: [''],
    });
  }

  ngOnInit() {
    this.getAllPersonnel(this.token.getUser().codSoc);
    this.saveService.registerPrintCallback(() => this.printReport());

    /*   const currentDate = new Date();
      const currentMonth = this.moisList[currentDate.getMonth()];
      this.mois = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const currentYear = currentDate.getFullYear();
  
      this.formAdherent.patchValue({
        mois: currentMonth,
        annee: currentYear
      }); */
    this.getOffConv()
  }
  getCorps() {
    this.personnelService.getCorps().subscribe((data) => {
      this.listCorps = data;
    });
  }
  onSelectedOffConv(item: any) {
    this.formAdherent.patchValue({
      cod_off: item.cod_off,
      lib_off: item.lib_off
    });
  }
  getOffConv() {
    this.serv.getAllOffConv().subscribe((data) => {
      this.offConvList = data;
      this.columnsOffConv = [
        { key: "cod_off", label: "Code off" },
        { key: "lib_off", label: "Libelle" },
      ];
    });
  }
  onSelectedVMat(item: Personnel) {
    this.formAdherent.patchValue({
      mat_pers_deb: item.mat_pers,
      num_retr_deb: item.num_retr,
      nom_deb: item.nom
    });
  }

  onSelectedVMat2(item: Personnel) {
    this.formAdherent.patchValue({
      mat_pers_fin: item.mat_pers,
      num_retr_fin: item.num_retr,
      nom_fin: item.nom
    });
  }
  getAllPersonnel(soc: string) {
    this.personnelService.getAllPersonnel(soc).subscribe((data) => {
      this.personnelList = data;
      this.columnsSearch = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "nom", label: "Nom & Prénom" },
        { key: "num_retr", label: "N° CNRPS" },
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
    this.serv.editionListRegEspece(
      '93',
      this.token.getUser().codSoc,
      this.formAdherent.get('annee')?.value,
      this.formAdherent.get('mat_pers')?.value,
      this.formAdherent.get('mat_pers2')?.value,
      this.formAdherent.get('cod_off')?.value,
      this.formAdherent.get('etat_cotis')?.value
    ).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);

        const a = document.createElement('a');
        a.href = fileURL;

        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `Rapport_reg_espece${formattedDate}.pdf`;

        a.click();

        // Nettoyage
        URL.revokeObjectURL(fileURL);

        Swal.close();
      },
      (error) => {
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

