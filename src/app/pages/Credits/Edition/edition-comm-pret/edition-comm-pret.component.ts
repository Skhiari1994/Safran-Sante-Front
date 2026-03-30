import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { Personnel, AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { EditionCreditService } from '../edition-credit.service';
import { CommissionService } from '../../Commission/commission.service';

@Component({
  selector: 'app-edition-comm-pret',
  templateUrl: './edition-comm-pret.component.html',
  styleUrl: './edition-comm-pret.component.scss'
})
export class EditionCommPretComponent {
  personnelList: Personnel[] = [];
  formCommission: FormGroup;
  columnsSearch: any[] = [];
  currentMonth: any
  listCorps: any[] = [];
  mois: any
  choix: any
  corps: any
  save!: boolean;
  isSearch: boolean = true;
  isDisabled!: boolean;
  listCommission: any[] = []
  columnsCommission: any[] = []
  currentIndex: number = 0;
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
    private serv: EditionCreditService,
    private commServ: CommissionService
  ) {
    this.formCommission = this.fb.group({
      cod_soc: [this.token.getUser().codSoc],
      num_comm: [''],
      dat_comm: [''],
      ref_comm: [''],
      dat_deb_comm: [''],
      dat_fin_comm: [''],
      dat_real: [''],
      cod_etat_pret: [''],
      typ_etat: [''],
      observ: [''],
      format: ['PDF'] // Default to PDF
    });
  }

  ngOnInit() {
    this.saveService.registerPrintCallback(() => this.handlePrint());

    const currentDate = new Date();
    const currentMonth = this.moisList[currentDate.getMonth()];
    this.mois = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear();

    this.formCommission.patchValue({
      mois: currentMonth,
      annee: currentYear
    });
    this.getCorps()
    this.saveService.registerSaveCallback(() => this.addCommission());
    this.saveService.canSave$.subscribe((canSave) => {
      this.save = canSave;
      if (this.save) {
        this.addCommission();
      }

    });
    this.formCommission.valueChanges.subscribe(() => {
      this.saveService.setDisabled(!this.isDisabled);
    });

    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch = canSearch
      console.log(canSearch)
    })

    this.getCommission()
  }
  getCommission() {
    this.commServ.getCommission().subscribe(
      (data: any) => {
        this.listCommission = data
        this.columnsCommission = [
          { key: "num_comm", label: "Num comm" },
          { key: "dat_comm", label: "Date commission" },
          { key: "ref_comm", label: "Ref comm" },
        ];
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );
  }
  search(item: any) {
    console.log("item :", item)
    this.formCommission.patchValue({
      cod_soc: item.cod_soc,
      num_comm: item.num_comm,
      dat_comm: item.dat_comm,
      ref_comm: item.ref_comm,
      dat_deb_comm: item.dat_deb_comm,
      dat_fin_comm: item.dat_fin_comm,
      dat_real: item.dat_real,
      cod_etat_pret: item.cod_etat_pret,
      typ_etat: item.typ_etat,
      obser: item.obser
    });




  }
  getCorps() {
    this.personnelService.getCorps().subscribe((data) => {
      this.listCorps = data;
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

  handlePrint() {
    const format = this.formCommission.get('format')?.value;
    if (format === 'PDF') {
      this.printReport();
    } else {
      this.printExcel();
    }
  }

  printExcel() {
    if (this.formCommission.get('num_comm')?.value == null || this.formCommission.get('num_comm')?.value === '') {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Il faut saisir le numéro de commission'
      });
      return;
    }

    Swal.fire({
      title: 'Chargement en cours...',
      html: 'Veuillez patienter pendant la génération du fichier Excel.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const numRap = this.choix == 1 ? '124' : '125';

    this.serv.editionCommExcel(
      numRap,
      this.token.getUser().codSoc,
      this.formCommission.get('num_comm')?.value,
      this.corps
    ).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileURL;
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        const suffix = this.choix == 1 ? '' : '_daf';
        a.download = `Rapport_Commission${suffix}_${formattedDate}.xlsx`;
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

  printReport() {
    if (this.formCommission.get('num_comm')?.value == null || this.formCommission.get('num_comm')?.value === '') {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Il faut saisir le numéro de commission'
      });
      return;
    }

    Swal.fire({
      title: 'Chargement en cours...',
      html: 'Veuillez patienter pendant la génération du rapport PDF.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.serv.editionComm(
      this.choix == 1 ? '100' : '101',
      this.token.getUser().codSoc,
      this.formCommission.get('num_comm')?.value,
      this.corps
    ).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileURL;
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        const suffix = this.choix == 1 ? '' : '_daf';
        a.download = `Rapport_Commission${suffix}_${formattedDate}.pdf`;
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

  addCommission() {
    const formatDates = (form: any, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value);
        form.get(field)?.setValue(value);
        formatted.push(value);
        return formatted;
      }, []);

    const demConv = formatDates(this.formCommission, [
      "dat_comm",
      "dat_deb_comm",
      "dat_fin_comm",
    ]);
    this.commServ.AddCommission(this.formCommission.value).subscribe((data: any) => {

      Swal.fire({
        icon: 'success',
        text: 'Ajout avec succés.',
        showCancelButton: false
      });

    })
  }

  goToFirst() {
    this.currentIndex = 0;
    console.log("this.currentIndex", this.currentIndex)
    this.loadData(this.currentIndex);
  }

  goToLast() {
    this.currentIndex = this.listCommission.length - 1;
    console.log("this.currentIndex", this.currentIndex)
    this.loadData(this.currentIndex);
  }

  navigate(direction: number): void {
    this.currentIndex += direction;
    this.loadData(this.currentIndex);
  }

  loadData(index: number): void {
    const currentData = this.listCommission[index];
    this.formCommission.patchValue(currentData);
  }

}


