import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import { Personnel, AdherentService } from '../../Adherent/adherent.service';
import { CotisationService } from '../cotisation.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edition-etat-cotisation',
  templateUrl: './edition-etat-cotisation.component.html',
  styleUrl: './edition-etat-cotisation.component.scss'
})
export class EditionEtatCotisationComponent {
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
  constructor(
    private personnelService: AdherentService,
    private token: TokenStorage,
    private fb: FormBuilder,
    private saveService: SaveService,
    private cotisServ: CotisationService
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
      corps: [''],
      etat_act: [''],
      choix: ['']
    });
  }

  ngOnInit() {
    this.getAllPersonnel(this.token.getUser().codSoc);
    this.saveService.registerPrintCallback(() => this.printReport());

    const currentDate = new Date();
    const currentMonth = this.moisList[currentDate.getMonth()];
    this.mois = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear();

    this.formAdherent.patchValue({
      mois: currentMonth,
      annee: currentYear
    });
    this.getCorps()
  }
  getCorps() {
    this.personnelService.getCorps().subscribe((data) => {
      this.listCorps = data;
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
    if (this.formAdherent.get('etat_act')?.value == 'A') {
      this.cotisServ.editionEtatCotis(
        '83',
        this.token.getUser().codSoc,
        this.formAdherent.get('mat_pers_deb')?.value,
        this.formAdherent.get('mat_pers_fin')?.value,
        this.mois + '/' + this.formAdherent.get('annee')?.value,
        '',
        this.formAdherent.get('etat_cotis')?.value,
        this.formAdherent.get('corps')?.value
      ).subscribe(
        (data: any) => {
          let file = new Blob([data], { type: 'application/pdf' });
          var fileURL = URL.createObjectURL(file);
          window.open(fileURL);

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
    } else {
      this.cotisServ.editionEtatCotis(
        '84',
        this.token.getUser().codSoc,
        this.formAdherent.get('mat_pers_deb')?.value,
        this.formAdherent.get('mat_pers_fin')?.value,
        this.mois + '/' + this.formAdherent.get('annee')?.value,
        '',
        this.formAdherent.get('etat_cotis')?.value,
        this.formAdherent.get('corps')?.value
      ).subscribe(
        (data: any) => {
          let file = new Blob([data], { type: 'application/pdf' });
          var fileURL = URL.createObjectURL(file);
          window.open(fileURL);
          Swal.close();
        },
        (error) => {
          console.log(error);

          // Close the loading Swal and show an error
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Échec de la génération du rapport.'
          });
        }
      );
    }
  }



}