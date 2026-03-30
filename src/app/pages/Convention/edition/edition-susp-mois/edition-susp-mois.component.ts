import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { Personnel, AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { IndemnitesService } from 'src/app/pages/Indemnites/indemnites.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { ConventionServiceService } from '../../convention-service.service';

@Component({
  selector: 'app-edition-susp-mois',
  templateUrl: './edition-susp-mois.component.html',
  styleUrl: './edition-susp-mois.component.scss'
})
export class EditionSuspMoisComponent {
  personnelList: Personnel[] = [];
  formAdherent: FormGroup;
  columnsSearch: any[] = [];
  currentMonth: any
  listCorps: any[] = [];
  mois: any
  natDontList: any[] = [];
  columnsNatDon: any[] = [];
  constructor(
    private personnelService: AdherentService,
    private token: TokenStorage,
    private fb: FormBuilder,
    private saveService: SaveService,
    private serv: ConventionServiceService
  ) {
    this.formAdherent = this.fb.group({
      mat_pers_deb: [''],
      nom_deb: [''],

      annee: ['']
    });
  }

  ngOnInit() {
    this.getAllPersonnel(this.token.getUser().codSoc);
    this.saveService.registerPrintCallback(() => this.printReport());

  }

  onSelectedVMat(item: Personnel) {
    this.formAdherent.patchValue({
      mat_pers_deb: item.mat_pers,
      nom_deb: item.nom
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

  formatDate(dateString: any): string {
    // Ensure the string is in the format 'ddmmyyyy'
    if (dateString && dateString.length === 6) {
      const month = dateString.substring(0, 2);
      const year = dateString.substring(2, 6);
      return `${month}/${year}`;
    }
    return dateString;
  }
  printReport() {
    Swal.fire({
      title: 'Chargement en cours...',
      html: 'Veuillez patienter pendant la génération du rapport.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const formatDates = (form: any, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value);
        form.get(field)?.setValue(value);
        formatted.push(value);
        return formatted;
      }, []);

    const demConv = formatDates(this.formAdherent, [
      "annee",
    ]);

    this.serv.editionEtatSusp(
      '89',
      this.token.getUser().codSoc,
      this.formAdherent.get('mat_pers_deb')?.value,
      this.formAdherent.get('annee')?.value,
    ).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);

        const a = document.createElement('a');
        a.href = fileURL;

        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `Rapport_Susp_${formattedDate}.pdf`;

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

