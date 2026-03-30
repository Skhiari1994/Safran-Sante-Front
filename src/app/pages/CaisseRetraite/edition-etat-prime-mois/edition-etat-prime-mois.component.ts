import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { Personnel, AdherentService } from '../../Adherent/adherent.service';
import { EditionCreditService } from '../../Credits/Edition/edition-credit.service';
import { CaisseRetrService } from '../caisse-retr.service';

@Component({
  selector: 'app-edition-etat-prime-mois',
  templateUrl: './edition-etat-prime-mois.component.html',
  styleUrl: './edition-etat-prime-mois.component.scss'
})
export class EditionEtatPrimeMoisComponent {
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
  private monthMap: { [key: string]: string } = {
    'Janvier': '01',
    'Février': '02',
    'Mars': '03',
    'Avril': '04',
    'Mai': '05',
    'Juin': '06',
    'Juillet': '07',
    'Août': '08',
    'Septembre': '09',
    'Octobre': '10',
    'Novembre': '11',
    'Décembre': '12'
  };
  groupPretList: any[] = []
  columnsGroupPret: any[] = []
  constructor(
    private personnelService: AdherentService,
    private token: TokenStorage,
    private fb: FormBuilder,
    private saveService: SaveService,
    private serv: CaisseRetrService
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
      cod_pret: [''],
      libPret: [''],
      corps: [''],
      etat_cotis: ['']
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
    const initialMonthCode = this.toMonthCode(currentMonth);
    this.mois = initialMonthCode;
    this.formAdherent.get('mois')?.valueChanges.subscribe((val) => {
      this.mois = this.toMonthCode(val);
    });
    this.getCorps()
  }
  getCorps() {
    this.personnelService.getCorps().subscribe((data) => {
      this.listCorps = data;
    });
  }
  private toMonthCode(value: any): string {
    if (!value) return '';
    const s = String(value).trim();
    if (/^\d{2}\/\d{4}$/.test(s)) {
      return s.split('/')[0];
    }
    if (/^\d{2}$/.test(s)) {
      return s;
    }
    const m = this.monthMap[s] || '';
    if (m) return m;
    const idx = this.moisList.findIndex(x => x.toLowerCase() === s.toLowerCase());
    return idx >= 0 ? (idx + 1).toString().padStart(2, '0') : '';
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

    // const formatDates = (form: any, fields: string[]): string[] =>
    //   fields.reduce<string[]>((formatted, field) => {
    //     const value = this.formatDate(form.get(field)?.value);
    //     form.get(field)?.setValue(value);
    //     formatted.push(value);
    //     return formatted;
    //   }, []);

    // const demConv = formatDates(this.formAdherent, [
    //   "datDeb",
    //   "datFin",
    // ]);
    const year = this.formAdherent.get('annee')?.value?.toString() || '';
    const moisVal = this.formAdherent.get('mois')?.value;
    const monthCode = this.toMonthCode(moisVal || this.mois);
    const moi = monthCode && year ? monthCode + '/' + year : '';
    this.serv.printEtatPrimeMois(
      this.token.getUser().codSoc,
      moi,
      this.formAdherent.get('etat_cotis')?.value || '',
      this.formAdherent.get('mat_pers')?.value || '',
      this.formAdherent.get('mat_pers2')?.value || '',
      this.formAdherent.get('corps')?.value || ''
    ).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);

        const a = document.createElement('a');
        a.href = fileURL;

        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `Etat_prime_retraite${formattedDate}.pdf`;

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


