import { Component } from "@angular/core";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { ReceptionRemboursementService } from "../reception-remboursement.service";
import { TokenStorage } from "src/app/account/token-storage.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import Swal from "sweetalert2";
import { HttpErrorResponse } from "@angular/common/http";
import { PaginationService } from "src/app/core/services/pagination.service";
import { SaveService } from "src/app/shared/Service/save.service";

@Component({
  selector: "app-calcul-complement-remb",
  templateUrl: "./calcul-complement-remb.component.html",
  styleUrl: "./calcul-complement-remb.component.scss",
})
export class CalculComplementRembComponent {
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
  BordArriverForm!: FormGroup;

  pSusp: any;
  p: any;
  bool: boolean = false
  tot_mut: number = 0
  reg: string = ''
  valid: string = ''
  columnTitles: { [key: string]: string } = {
    mat_pers: "Matricule",
    nom_prenom: "Nom & Prénom",
    cod_fil: "Filière",
    num_fam: "Prest",
    nom: "Nom",
    dat_soin: "Date de soin",
    lib_remb: "Regime de remb",
    solde: "SOLDE",
    tot_remb: "Tot CNAM",
    tot_mut: "Tot Mut",
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
    private serv: ReceptionRemboursementService,
    private service: PaginationService,
    private fb: FormBuilder,
    private token: TokenStorage,
    private saveService: SaveService
  ) { }

  ngOnInit() {
    this.BordArriverForm = this.fb.group({
      cod_bord: [""],
      dat_bord: [""],
      valid: [""],
      nbr_bult: [""],
      tot_remb: [""],
      lib_assurance: [""],
    });

    this.getAllBordArriver();

    this.breadCrumbItems = [
      /*    { label: "Réception remboursement CNAM" },
         { label: "Chargement bordereau arrivée CNAM", active: true }, */
    ];


  }
  ngOnDestroy() {

    this.saveService.setIsSearch(false)
  }

  //selectedRow: number | null = null;

  logRowData(data: any, index: any): void {
    this.selectedRow = index;

    const { cod_soc, mat_pers, num_fam, dat_soin } = data;
    console.log("Données de la ligne sélectionnée:", data);

    this.serv
      .getBultArriverById(cod_soc, mat_pers, num_fam, dat_soin)
      .subscribe({
        next: (response) => {
          this.bultArriver = response;

        },
        error: (err: HttpErrorResponse) => {
          this.error = `Erreur lors de la récupération des données: ${err.message}`;
        },
      });

    this.serv
      .LigVisitArriverById(cod_soc, mat_pers, num_fam, dat_soin)
      .subscribe({
        next: (response) => {
          this.visitArriver = response;

        },
        error: (err: HttpErrorResponse) => {
          this.error = `Erreur lors de la récupération des données: ${err.message}`;
        },
      });

    this.serv
      .geLigActArriverById(cod_soc, mat_pers, num_fam, dat_soin)
      .subscribe({
        next: (response) => {
          this.actArriver = response;
        },
        error: (err: HttpErrorResponse) => {
          this.error = `Erreur lors de la récupération des données: ${err.message}`;
        },
      });

    this.serv
      .LigMedArriverById(cod_soc, mat_pers, num_fam, dat_soin)
      .subscribe({
        next: (response) => {
          this.medArriver = response;
        },
        error: (err: HttpErrorResponse) => {
          this.error = `Erreur lors de la récupération des données: ${err.message}`;
        },
      });

    this.serv
      .LigAppArriverById(cod_soc, mat_pers, num_fam, dat_soin)
      .subscribe({
        next: (response) => {
          this.appArriver = response;
        },
        error: (err: HttpErrorResponse) => {
          this.error = `Erreur lors de la récupération des données: ${err.message}`;
        },
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

  showFilters: { [key: string]: boolean } = {};

  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }

  onSort(column: any) {
    this.bordArriver = this.service.onSort(column, this.bordArriverFilter);
  }

  searchz: any = {
    mat_pers: "",
    nom_prenom: "",
    cod_fil: "",
    num_fam: "",
    nom: "",
    dat_soin: "",
    lib_remb: "",
    solde: "",
    tot_remb: "",
    tot_mut: "",
  };

  searchActe: any = {
    dat_act: "",
    cod_act: "",
    lib_act: "",
    mnt_honor: "",
    indice: "",
    mnt_net: "",
    mut_mnt_net: "",
    prf_type: "",
    lib_org: "",
    prf_cod: "",
  };

  searchMed: any = {
    dat_act: "",
    cod_med: "",
    lib_med: "",
    indice: "",
    mnt_honor: "",
    mnt_remb: "",
    accord_med: "",
    prf_type: "",
    prf_cod: "",
    lib_org: "",
  };

  searchApp: any = {
    dat_act: "",
    cod_app: "",
    lib_app: "",
    mnt_honor: "",
    mnt_remb: "",
    accord_app: "",
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
      this.serv.getBultArriverByCodBord4(this.cod_bord).subscribe({
        next: (data) => {
          this.bordArriver = data;
          this.calculerTotaux()
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
    this.serv.GetAllBordArriver(this.token.getUser().codSoc).subscribe({
      next: (data) => {
        this.AllBordArrivers = data;
        console.log("la liste des bordereaux", this.AllBordArrivers);
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

      // Initially use event data with trimming
      this.valid = (event.valid || '').trim();
      this.reg = (event.reg_bord || '').trim();

      // Fetch latest status from API to be sure
      this.serv.getcodBordArriver(this.cod_bord).subscribe({
        next: (data: any) => {
          console.log('🔍 Bordereau status check:', data);
          const bordData = Array.isArray(data) ? data[0] : data;
          if (bordData) {
            this.reg = (data[0].reg_bord || '').trim();
            this.valid = (data[0].valid || '').trim();
            console.log('✅ Updated status - reg:', data[0].reg_bord);
          }
        },
        error: (err) => console.error('❌ Error fetching status:', err)
      });

      this.BordArriverForm.patchValue({
        cod_bord: event.cod_bord,
        tot_remb: event.tot_remb,
        valid: event.valid,
        nbr_bult: event.nbr_bult,
        lib_assurance: event.lib_assurance || event.lib_assur,
      });

      this.getBultArriverByCodBord();
    }
  }

  selectedRow: number | null = null;

  getPoste(event: any, index: number) {
    this.selectedRow = index; // Sets the selected row index to highlight it
    this.serv
      .LigVisitArriverById(
        event.cod_soc,
        event.mat_pers,
        event.num_fam,
        event.dat_soin
      )
      .subscribe({
        next: (response: any) => {
          this.visitArriver = response; // Assigns the API response to visitArriver
          console.log("la liste des visite", this.visitArriver);
        },
        error: (err: HttpErrorResponse) => {
          this.error = `Erreur lors de la récupération des données: ${err.message}`;
        },
      });
  }

  getTotalPages(): number {
    return Math.ceil(this.bordArriver.length / 6);
  }

  regler_bord() {
    Swal.fire({
      title: 'Chargement...',
      text: 'Calcul des remboursements en cours',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.serv
      .reglerBord(this.token.getUser().codSoc, this.cod_bord)
      .subscribe({
        next: (data: any) => {
          Swal.close();
          console.log('✅ regler_bord response:', data);
          const resData = Array.isArray(data) ? data[0] : data;
          this.tot_mut = resData.tot_mut;
          this.reg = (resData.reg_bord || '').trim();
          this.bool = true;

          if (data.message || resData.message) {
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: data.message || resData.message,
              showConfirmButton: false,
              timer: 2000,
            });
            this.refreshStatus(); // 🔄 Re-check status to update buttons
            this.getBultArriverByCodBord();
          }
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur est survenue lors du règlement du bordereau'
          });
          console.error(err);
        }
      });
  }

  cloture_bord() {
    Swal.fire({
      title: 'Chargement...',
      text: 'Clôture du bordereau en cours',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.serv
      .cloture_bord(this.token.getUser().codSoc, this.token.getUser().codSoc, this.cod_bord)
      .subscribe({
        next: (data: any) => {
          Swal.close();
          console.log('✅ cloture_bord response:', data);
          const resData = Array.isArray(data) ? data[0] : data;
          this.valid = (resData.valid || '').trim();

          if (data.message || resData.message) {
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: data.message || resData.message,
              showConfirmButton: false,
              timer: 2000,
            });
            this.refreshStatus(); // 🔄 Re-check status to update buttons
          }
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur est survenue lors de la clôture du bordereau'
          });
          console.error(err);
        }
      });
  }

  totalRemLig: number = 0;
  totalMutLig: number = 0;
  calculerTotauxLig(): void {
    this.totalRemLig = this.ligBultArriver.reduce((sum, item) => sum + (item.mnt_honor || 0), 0);
    this.totalMutLig = this.ligBultArriver.reduce((sum, item) => sum + (item.mnt_remb || 0), 0);
  }
  totalRemb: number = 0;
  totalCnam: number = 0;
  totalMut: number = 0;
  calculerTotaux(): void {
    this.totalRemb = this.bordArriver.reduce((sum, item) => sum + (item.tot_remb || 0), 0);
    this.totalCnam = this.bordArriver.reduce((sum, item) => sum + (item.tot_remb || 0), 0);
    this.totalMut = this.bordArriver.reduce((sum, item) => sum + (item.tot_mut || 0), 0);
  }

  private refreshStatus(): void {
    if (!this.cod_bord) return;
    this.serv.getcodBordArriver(this.cod_bord).subscribe({
      next: (data: any) => {
        console.log('🔄 Status refreshed after action:', data);
        const bordData = Array.isArray(data) ? data[0] : data;
        if (bordData) {
          this.reg = (bordData.reg_bord || '').trim();
          this.valid = (bordData.valid || '').trim();
        }
      }
    });
  }
}
