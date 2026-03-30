import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { IndemnitesService } from 'src/app/pages/Indemnites/indemnites.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { Personnel, AdherentService } from '../../adherent.service';

@Component({
  selector: 'app-liste-adherent',
  templateUrl: './liste-adherent.component.html',
  styleUrl: './liste-adherent.component.scss'
})
export class ListeAdherentComponent {
  personnelList: Personnel[] = [];
  formAdherent: FormGroup;
  columnsSearch: any[] = [];
  currentMonth: any
  listCorps: any[] = [];
  mois: any
  natDontList: any[] = [];
  columnsNatDon: any[] = [];
  listLieu: any[] = [];
  columnsLieu: any[] = [];
  listTypeDepart: any[] = [];
  columnsTypDepart: any[] = [];
  libLieu: string = ''
  codLieuVal: string = ''
  libTypDepart: string = ''
  codTypDepartVal: string = ''
  constructor(
    private personnelService: AdherentService,
    private token: TokenStorage,
    private fb: FormBuilder,
    private saveService: SaveService,
    private serv: IndemnitesService
  ) {
    this.formAdherent = this.fb.group({
      mat_pers_deb: [''],
      nom_deb: [''],
      mat_pers_fin: [''],
      nom_fin: [''],
      etat_act: [''],
      dat_deb: [''],
      dat_fin: [''],
      corps: [''],
      cod_typ_depart: [''],
      cod_lieu_geog: ['']
    });
  }

  ngOnInit() {
    this.getAllPersonnel(this.token.getUser().codSoc);
    this.saveService.registerPrintCallback(() => this.printReport());
    this.getDepartement()
    this.getCorps()
    this.getTypeDepart()
  }
  getCorps() {
    this.personnelService.getCorps().subscribe((data) => {
      this.listCorps = data;
    });
  }
  getTypeDepart() {
    this.personnelService.getTypeDepart().subscribe((data) => {
      this.listTypeDepart = data;
      // Définir les colonnes dynamiques du tableau
      this.columnsTypDepart = [
        { key: "cod_typ_depart", label: "Code" },
        { key: "lib_typ_depart", label: "Libelle" },
        { key: "etat_act", label: "Etat" },

        // { key: 'lib_tit_a', label: 'Libellé 2éme langue' }
      ];
    });
  }
  onSelectedValueTypDepart(item: any) {
    //  this.codTypDepart = item.cod_typ_depart; // Mise à jour du champ code
    this.libTypDepart = item.lib_typ_depart; // Mise à jour du champ libellé
    this.formAdherent.patchValue({
      cod_typ_depart: item.cod_typ_depart,
    });
  }
  onSelectedVMat(item: Personnel) {
    this.formAdherent.patchValue({
      mat_pers_deb: item.mat_pers,
      nom_deb: item.nom
    });
  }

  onSelectedVMat2(item: Personnel) {
    this.formAdherent.patchValue({
      mat_pers_fin: item.mat_pers,

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
  getDepartement() {
    this.personnelService.getLieu().subscribe((data) => {
      this.listLieu = data;
      this.columnsLieu = [
        { key: "cod_lieu_geog", label: "Code" },
        { key: "lib_lieu", label: "Libelle" },
        { key: "lib_lieu_a", label: "Libelle arabe" },
      ];
    });
  }
  onSelectedValueLieu(item: any) {
    this.libLieu = item.lib_lieu; // Mise à jour du champ libellé
    this.formAdherent.patchValue({
      cod_lieu_geog: item.cod_lieu_geog,
    });
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

    this.personnelService.editionListAdherent(
      '102',
      this.token.getUser().codSoc,
      this.formAdherent.get('mat_pers_deb')?.value,
      this.formAdherent.get('mat_pers_fin')?.value,
      this.formAdherent.get('cod_typ_depart')?.value,
      this.formAdherent.get('corps')?.value,

      this.formAdherent.get('cod_lieu_geog')?.value,
      this.formAdherent.get('etat_act')?.value
    ).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);

        const a = document.createElement('a');
        a.href = fileURL;

        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `Rapport_Indemnité_${formattedDate}.pdf`;

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

