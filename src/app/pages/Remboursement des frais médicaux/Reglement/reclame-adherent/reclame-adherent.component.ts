import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import Swal from 'sweetalert2';
import { ReglementService } from '../reglement.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-reclame-adherent',
  templateUrl: './reclame-adherent.component.html',
  styleUrl: './reclame-adherent.component.scss'
})
export class ReclameAdherentComponent {
  bultArriver: any[] = [];
  visitArriver: any[] = [];
  appArriver: any[] = [];
  medArriver: any[] = [];
  actArriver: any[] = [];
  ligBultArriver: any[] = [];

  AllBultArrivers: any[] = [];
  AllBordArrivers: any[] = [];
  breadCrumbItems!: Array<{}>;
  columnBordArriver: any[] = [];
  bordArriver: any[] = [];
  bordArriverFilter: any[] = [];
  error: string | null = null;
  dateBord: string = "";
  cod_bord: string = "";
  codBord: string = "";
  codAssur: string = "";
  BordArriverForm!: FormGroup;
  bultArriverForm!: FormGroup;
  pSusp: any;
  p: any
  isDisabled!: boolean;

  columns = [
    'mat_pers',
    'nom_prenom',
    'cod_fil',
    'num_fam',
    'nom',
    'dat_soin',
    'lib_remb',
    'Solde',
    'tot_remb',
    'tot_mut',
    'reg_adh',
    'Observation'
  ];
  columnTitles: { [key: string]: string } = {
    mat_pers: "Matricule",
    nom_prenom: "Nom & Prénom",
    cod_fil: "Filière",
    num_fam: "Prest",
    nom: "Nom",
    dat_soin: "Date de soin",
    lib_remb: "Regime de remb",
    tot_remb: "Total CNAM",
    tot_mut: "Tot Mut",
    reg_adh: "Reg Adh"
  };

  columnTitlesVisite: { [key: string]: string } = {
    dat_act: "Date visite",
    abrv_act: "Visite",
    lib_act: "Libellé",
    mnt_honor: "Mnt. Hon",
    mnt_net: "Mnt. Net.",
    prf_type: "Type",
    lib_org: "Nom",
    prf_cod: "Code",

  };

  columnTitlesActes: { [key: string]: string } = {
    dat_act: "Date Acte",
    cod_act: "Acte",
    lib_act: "Libellé",
    mnt_honor: "Mnt. Hon",
    indice: "Unité",
    mnt_remb: "Mnt. Net.",
    mut_mnt_net: "Mut. Mnt. Net.",
    prf_type: "Type",
    lib_org: "Nom",
    prf_cod: "Code",

  };

  columnTitlesMed: { [key: string]: string } = {
    dat_act: "Date Médi",
    cod_med: "Code Med.",
    lib_med: "Libellé Med.",
    indice: "Nbr.J",
    mnt_honor: "Mnt. Hon",
    mnt_remb: "Mnt. Net",
    accord_med: "Accord. Med",
    num_pec_med: "Num. Pec. Med",
    prf_type: "Type étab.",
    prf_cod: "Code",
    lib_org: "Libellé",
  };

  columnTitlesApp: { [key: string]: string } = {
    dat_act: "Date Médi",
    cod_app: "Code App.",
    lib_app: "Libellé App .",
    mnt_honor: "Mnt. Hon",
    mnt_remb: "Mnt. Net",
    accord_app: "Accord. App",

  };

  columnReglementMut: { [key: string]: string } = {
    num_lig: 'Num',
    dat_act: 'Date acte',
    abrv_act: 'Acte',
    lib_act: 'Libellé',
    indice: 'Unit',
    mnt_honor: 'Mnt honor',
    mnt_remb: 'Mnt net'

  };


  constructor(
    private serv: ReglementService,
    private service: PaginationService,
    private fb: FormBuilder,
    private token: TokenStorageService,
    private saveService: SaveService
  ) { }

  ngOnInit() {
    this.BordArriverForm = this.fb.group({
      cod_bord: [''],
      dat_bord: [''],
      tot: [''],
      nbr_bult: [''],
      tot_remb: [''],
      lib_assurance: [''],
    });

    this.getAllBordArriver();

    this.breadCrumbItems = [
      /*    { label: "Réglement" },
         { label: "Prise en charge des reclamationsbordereau CNAM", active: true }, */
    ];

    this.saveService.registerSaveCallback(() => this.saveReclamations());
    this.saveService.registerPrintCallback(() => this.printReclamation());


    this.saveService.setDisabled(!this.isDisabled);

  }
  getReclamationCount(): number {
    return this.bordArriver.filter(item =>
      item.reclamation && item.reclamation.trim() !== ''
    ).length;
  }

  // Enregistrer toutes les réclamations
  saveReclamations() {
    console.log("this.bordArriver:", this.bordArriver);

    const requests = this.bordArriver
      .filter(item => item.reclamation && item.reclamation.trim() !== '')
      .map(item => {
        const cle = {
          cod_soc: item.cod_soc,
          mat_pers: item.mat_pers,
          num_fam: item.num_fam,
          dat_soin: item.dat_soin
        };

        return this.serv.updateBultArriver(cle, item.reclamation);
      });



    forkJoin(requests).subscribe({
      next: responses => {

        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Réclamations enregistrées avec succès !',
          showConfirmButton: false,
          timer: 2000,
        });
      },
      error: error => {
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'Erreur lors de l enregistrement des réclamations !',
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  }



  selectedRow: number | null = null;

  logRowData(data: any, index: any): void {
    this.selectedRow = index;

    const { cod_soc, mat_pers, num_fam, dat_soin } = data;
    console.log("Données de la ligne sélectionnée:", data);

    this.serv.getBultArriverById(cod_soc, mat_pers, num_fam, dat_soin).subscribe({
      next: (response) => {
        this.bultArriver = response;
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des données: ${err.message}`;
      }
    });

    this.serv.LigVisitArriverById(cod_soc, mat_pers, num_fam, dat_soin).subscribe({
      next: (response) => {
        this.visitArriver = response;
        this.calculerTotauxVisit()
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des données: ${err.message}`;
      }
    });

    this.serv.geLigActArriverById(cod_soc, mat_pers, num_fam, dat_soin).subscribe({
      next: (response) => {
        this.actArriver = response;
        this.calculerTotauxActe()
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des données: ${err.message}`;
      }
    });

    this.serv.LigMedArriverById(cod_soc, mat_pers, num_fam, dat_soin).subscribe({
      next: (response) => {
        this.medArriver = response;
        this.calculerTotauxMed()
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des données: ${err.message}`;
      }
    });

    this.serv.LigAppArriverById(cod_soc, mat_pers, num_fam, dat_soin).subscribe({
      next: (response) => {
        this.appArriver = response;
        this.calculerTotauxApp()
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des données: ${err.message}`;
      }
    });

    this.serv.getLigBultArriver(cod_soc, mat_pers, num_fam, dat_soin).subscribe({
      next: (response) => {
        this.ligBultArriver = response;
        this.calculerTotauxLig()
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des données: ${err.message}`;
      }
    });
  }

  // Tri et filtres des tableaux de détails
  dsearch: { [key: string]: string } = {};
  private detailSortState: { [key: string]: { field: string; asc: boolean } } = {};
  detailSort(listName: string, column: string) {
    const st = this.detailSortState[listName];
    const asc = st && st.field === column ? !st.asc : true;
    this.detailSortState[listName] = { field: column, asc };
    const dir = asc ? 1 : -1;
    (this as any)[listName] = [...((this as any)[listName] || [])].sort((a: any, b: any) =>
      String(a[column] ?? '').localeCompare(String(b[column] ?? ''), 'fr', { numeric: true }) * dir
    );
  }
  detailRows(list: any[], prefix: string): any[] {
    const keys = Object.keys(this.dsearch).filter(k => k.startsWith(prefix) && this.dsearch[k]);
    if (!keys.length) return list || [];
    return (list || []).filter(row =>
      keys.every(k => String(row[k.substring(prefix.length)] ?? '').toLowerCase().includes(this.dsearch[k].toLowerCase()))
    );
  }

  showFilters: { [key: string]: boolean } = {};

  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }

  onSort(column: any) {
    this.bordArriver = this.service.onSort(column, this.bordArriver);
  }

  searchz: any = {
    mat_pers: '',
    nom_prenom: '',
    cod_fil: '',
    num_fam: '',
    nom: '',
    dat_soin: '',
    lib_remb: '',
    tot_remb: '',
  };

  searchActe: any = {
    dat_act: '',
    cod_act: '',
    lib_act: '',
    mnt_honor: '',
    indice: '',
    mnt_net: '',
    mut_mnt_net: '',
    prf_type: '',
    lib_org: '',
    prf_cod: '',
  };

  searchMed: any = {
    dat_act: '',
    cod_med: '',
    lib_med: '',
    indice: '',
    mnt_honor: '',
    mnt_remb: '',
    accord_med: '',
    prf_type: '',
    prf_cod: '',
    lib_org: '',

  };

  searchApp: any = {
    dat_act: '',
    cod_app: '',
    lib_app: '',
    mnt_honor: '',
    mnt_remb: '',
    accord_app: '',


  };

  applyFilter() {
    this.bordArriver = this.bordArriverFilter.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
  }

  getBultArriverByCodBord(): void {
    if (this.cod_bord) {
      this.serv.getBultArriverReg(this.cod_bord).subscribe({
        next: (data) => {
          this.bordArriver = data;
          this.bordArriverFilter = data;
          this.calculerTotaux();
        },
        error: (err: HttpErrorResponse) => {
          this.error = `Erreur lors de la récupération des données: ${err.message}`;
        },
      });
    } else {
      this.error = "Aucun cod_bord sélectionné.";
    }
  }

  getAllBordArriver(): void {
    this.serv.getBordArriver().subscribe({
      next: (data) => {
        this.AllBordArrivers = data;
        this.columnBordArriver = [
          { key: "cod_bord", label: "Code de bordereau" },
          { key: "dat_bord", label: "Date de bordereau" },
        ];
      },
      error: (err) => {
        this.error = "Erreur lors de la récupération des données";
      },
    });
  }

  onSelectedValueBordArriver(event: any): void {
    if (event) {
      this.cod_bord = event.cod_bord;
      this.dateBord = event.dat_bord;
      this.codAssur = event.cod_assur
      console.log("event :", event)
      this.BordArriverForm.patchValue({
        cod_bord: event.cod_bord,
        tot_remb: event.tot_remb,
        tot: event.tot,
        nbr_bult: event.nbr_bult,
        lib_assurance: event.lib_assurance,
      });

      this.getBultArriverByCodBord();
    }
  }



  getPoste(event: any, index: number) {
    this.selectedRow = index;
    this.serv.LigVisitArriverById(event.cod_soc, event.mat_pers, event.num_fam, event.dat_soin).subscribe({
      next: (response: any) => {
        this.visitArriver = response;
        console.log("la liste des visite", this.visitArriver);
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des données: ${err.message}`;
      }
    });
  }

  cloturer() {
    this.serv.updateBordArriver(this.token.getUser().codSoc, this.codAssur, this.cod_bord).subscribe((data: any) => {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Cloture Términer !',
        showConfirmButton: false,
        timer: 2000,
      });
    })
  }



  getTotalPages(): number {
    return Math.ceil(this.bordArriver.length / 6);
  }
  totalRem: number = 0;
  totalMut: number = 0;
  calculerTotaux(): void {
    this.totalRem = this.bordArriver?.reduce((sum, item) => sum + (item.tot_remb || 0), 0) || 0;
    this.totalMut = this.bordArriver?.reduce((sum, item) => sum + (item.tot_mut || 0), 0) || 0;
  }
  totalRemVisit: number = 0;
  calculerTotauxVisit(): void {
    this.totalRemVisit = this.visitArriver?.reduce((sum, item) => sum + (item.mnt_remb || 0), 0) || 0;
    console.log("Total Rem:", this.totalRemVisit);
  }

  totalRemActe: number = 0;
  totalMutActe: number = 0;
  calculerTotauxActe(): void {
    console.log("this.actArriver :", this.actArriver);

    this.totalRemActe = this.actArriver?.reduce((sum, item) => sum + (item.mnt_honor || 0), 0) || 0;
    this.totalMutActe = this.actArriver?.reduce((sum, item) => sum + (item.mnt_remb || 0), 0) || 0;
  }


  totalRemMed: number = 0;
  totalMutMed: number = 0;
  calculerTotauxMed(): void {
    this.totalRemMed = this.medArriver?.reduce((sum, item) => sum + (item.mnt_honor || 0), 0) || 0;
    this.totalMutMed = this.medArriver?.reduce((sum, item) => sum + (item.mnt_remb || 0), 0) || 0;
  }

  totalRemApp: number = 0;
  totalMutApp: number = 0;
  calculerTotauxApp(): void {
    this.totalRemApp = this.appArriver?.reduce((sum, item) => sum + (item.mnt_honor || 0), 0) || 0;
    this.totalMutApp = this.appArriver?.reduce((sum, item) => sum + (item.mnt_remb || 0), 0) || 0;
  }

  totalRemLig: number = 0;
  totalMutLig: number = 0;
  calculerTotauxLig(): void {
    this.totalRemLig = this.ligBultArriver?.reduce((sum, item) => sum + (item.mnt_honor || 0), 0) || 0;
    this.totalMutLig = this.ligBultArriver?.reduce((sum, item) => sum + (item.mnt_remb || 0), 0) || 0;
  }

  printReclamation() {
    // Validate that a row is selected
    if (this.selectedRow === null || this.selectedRow === undefined) {
      Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Veuillez sélectionner une ligne dans le tableau.'
      });
      return;
    }

    // Validate that bordereau is selected
    if (!this.cod_bord) {
      Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Veuillez sélectionner un bordereau.'
      });
      return;
    }

    // Get the selected row data
    const selectedData = this.bordArriver[this.selectedRow];
    if (!selectedData) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible de récupérer les données de la ligne sélectionnée.'
      });
      return;
    }

    // Show loading message
    Swal.fire({
      title: 'Chargement en cours...',
      html: 'Veuillez patienter pendant la génération du rapport.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Extract parameters for the report
    const soc = this.token.getUser().codSoc;
    const mat = selectedData.mat_pers;
    const dat_soin = selectedData.dat_soin;
    const num = this.cod_bord; // cod_bord maps to 'num' parameter
    const numf = selectedData.num_fam.toString(); // num_fam maps to 'numf' parameter

    // Debug: Log parameters
    console.log('Print Reclamation Parameters:', {
      soc,
      mat,
      dat_soin,
      num,
      numf,
      selectedData
    });

    // Call the print service
    this.serv.printReclamationAdherent(soc, mat, dat_soin, num, numf).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);

        const a = document.createElement('a');
        a.href = fileURL;

        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `Reclamation_Adherent_${mat}_${formattedDate}.pdf`;

        a.click();

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

