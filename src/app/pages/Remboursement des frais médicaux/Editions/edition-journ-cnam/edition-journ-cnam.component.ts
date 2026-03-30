import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { Personnel } from 'src/app/pages/Adherent/adherent.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { EditionService } from '../edition.service';

@Component({
  selector: 'app-edition-journ-cnam',
  templateUrl: './edition-journ-cnam.component.html',
  styleUrl: './edition-journ-cnam.component.scss'
})
export class EditionJournCNAMComponent {
  personnelListDeb: Personnel[] = [];
  personnelListFin: Personnel[] = [];
  formAdherent: FormGroup;
  columnsSearch: any[] = [];
  breadCrumbItems!: Array<{}>;
  currentMonth: any
  constructor(
    private editionService: EditionService,
    private token: TokenStorage,
    private fb: FormBuilder,
    private saveService: SaveService,
  ) {
    this.formAdherent = this.fb.group({
      mat_pers_deb: [''],
      nom_deb: [''],
      mat_pers_fin: [''],
      nom_fin: [''],
      dat_deb: [''],
      dat_fin: [''],
      choix: ['']
    });
  }

  ngOnInit() {
    this.saveService.registerPrintCallback(() => this.printReport());
    this.getPersonnelDeb()
    this.getPersonnelFin()
  }


  onSelectedVMat(item: Personnel) {
    this.formAdherent.patchValue({
      mat_pers_deb: item.mat_pers,
      nom_deb: item.nom
    });

    this.editionService.getPersBultCnamFin(this.token.getUser().codSoc, this.formAdherent.get('mat_pers_deb')?.value).subscribe((data) => {
      this.personnelListFin = data;
      this.columnsSearch = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "nom", label: "Nom & Prénom" },
        { key: "num_retr", label: "N° CNRPS" },
      ];
    });
  }

  onSelectedVMatFin(item: Personnel) {
    this.formAdherent.patchValue({
      mat_pers_fin: item.mat_pers,
      nom_fin: item.nom
    });

    this.editionService.getPersBultCnamDeb(this.token.getUser().codSoc, this.formAdherent.get('mat_pers_fin')?.value).subscribe((data) => {
      this.personnelListDeb = data;
      this.columnsSearch = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "nom", label: "Nom & Prénom" },
        { key: "num_retr", label: "N° CNRPS" },
      ];
    });
  }

  getPersonnelDeb() {
    const matFin = this.formAdherent.get('mat_pers_fin')?.value || '';
    console.log('Calling getPersBultCnamDeb with soc:', this.token.getUser().codSoc, 'mat_fin:', matFin);
    this.editionService.getPersBultCnamDeb(this.token.getUser().codSoc, matFin).subscribe((data) => {
      console.log('getPersBultCnamDeb response:', data);
      this.personnelListDeb = data;
      this.columnsSearch = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "nom", label: "Nom & Prénom" },
        { key: "num_retr", label: "N° CNRPS" },
      ];
    }, (error) => {
      console.error('Error in getPersBultCnamDeb:', error);
    });
    console.log(this.personnelListDeb)
  }

  getPersonnelFin() {
    const matDeb = this.formAdherent.get('mat_pers_deb')?.value || '';
    console.log('Calling getPersBultCnamFin with soc:', this.token.getUser().codSoc, 'mat_deb:', matDeb);
    this.editionService.getPersBultCnamFin(this.token.getUser().codSoc, matDeb).subscribe((data) => {
      console.log('getPersBultCnamFin response:', data);
      this.personnelListFin = data;
      this.columnsSearch = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "nom", label: "Nom & Prénom" },
        { key: "num_retr", label: "N° CNRPS" },
      ];
    }, (error) => {
      console.error('Error in getPersBultCnamFin:', error);
    });
    console.log(this.personnelListDeb)
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
      "dat_deb",
      "dat_fin",
    ]);

    if (this.formAdherent.get('choix')?.value == 1) {
      this.editionService.editionListBS(
        '113',
        this.token.getUser().codSoc,
        this.formAdherent.get('mat_pers_deb')?.value,
        this.formAdherent.get('mat_pers_fin')?.value,
        this.formAdherent.get('dat_deb')?.value,
        this.formAdherent.get('dat_fin')?.value,
      ).subscribe(
        (data: any) => {
          let file = new Blob([data], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);

          const a = document.createElement('a');
          a.href = fileURL;

          const date = new Date();
          const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
          a.download = `List_Bult_Soin_Cnam_${formattedDate}.pdf`;

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
    } else {
      this.editionService.editionListBS(
        '114',
        this.token.getUser().codSoc,
        this.formAdherent.get('mat_pers_deb')?.value,
        this.formAdherent.get('mat_pers_fin')?.value,
        this.formAdherent.get('dat_deb')?.value,
        this.formAdherent.get('dat_fin')?.value,
      ).subscribe(
        (data: any) => {
          let file = new Blob([data], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);

          const a = document.createElement('a');
          a.href = fileURL;

          const date = new Date();
          const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
          a.download = `List_Bult_Soin_Cnam_detaillé${formattedDate}.pdf`;

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





}






