import { Component } from "@angular/core";
import { ReceptionRemboursementService } from "../reception-remboursement.service";
import { HttpErrorResponse } from "@angular/common/http";
import { FormBuilder, FormGroup } from "@angular/forms";
import { PaginationService } from "src/app/core/services/pagination.service";
import { SaveService } from "src/app/shared/Service/save.service";

@Component({
  selector: "app-charg-bord-arriver-cnam",
  templateUrl: "./charg-bord-arriver-cnam.component.html",
  styleUrls: ["./charg-bord-arriver-cnam.component.scss"],
})
export class ChargBordArriverCNAMComponent {
  bultArriver: any[] = [];
  visitArriver: any[] = [];
  appArriver: any[] = [];
  medArriver: any[] = [];
  actArriver: any[] = [];
 
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
   p:any
  columnTitles: { [key: string]: string } = {
    mat_pers: "Matricule",
    nom_prenom: "Nom & Prénom",
    cod_fil: "Filière",
    num_fam: "Prest",
    nom: "Nom",
    dat_soin: "Date de soin",
    lib_remb: "Regime de remb",
    tot_remb: "Total Net.",
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
    prf_type:"Type étab.",
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




  constructor(
    private serv: ReceptionRemboursementService,
    private service: PaginationService,
    private fb: FormBuilder,
    
        private saveService: SaveService,
  ) {}

  ngOnInit() {
    this.BordArriverForm = this.fb.group({
      cod_bord: [''],
      dat_bord: [''],
      valid: [''],
      nbr_bult: [''],
      tot_remb: [''],
      lib_assurance: [''],
    });

    this.getAllBordArriver();

    this.breadCrumbItems = [
     /*  { label: "Réception remboursement CNAM" },
      { label: "Chargement bordereau arrivée CNAM", active: true }, */
    ];
  }
  ngOnDestroy(){

    this.saveService.setIsSearch(false)
  }

  //selectedRow: number | null = null;

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
     
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des données: ${err.message}`;
      }
    });

    this.serv.geLigActArriverById(cod_soc, mat_pers, num_fam, dat_soin).subscribe({
      next: (response) => {
        this.actArriver = response;
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des données: ${err.message}`;
      }
    });

    this.serv.LigMedArriverById(cod_soc, mat_pers, num_fam, dat_soin).subscribe({
      next: (response) => {
        this.medArriver = response;
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des données: ${err.message}`;
      }
    });

    this.serv.LigAppArriverById(cod_soc, mat_pers, num_fam, dat_soin).subscribe({
      next: (response) => {
        this.appArriver = response;
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des données: ${err.message}`;
      }
    });
  }

  // Tri et filtres des tableaux de détails (visites, actes, médicaments, appareils)
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
    this.bordArriver = this.service.onSort(column, this.bordArriverFilter);
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
      this.serv.getBultArriverByCodBord(this.cod_bord).subscribe({
        next: (data) => {
          this.bordArriver = data;
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
    this.serv.getAllBordArriver().subscribe({
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
      this.BordArriverForm.patchValue({
        cod_bord: event.cod_bord,
        tot_remb: event.tot_remb,
        valid: event.valid,
        nbr_bult: event.nbr_bult,
        lib_assurance: event.lib_assurance,
      });

      this.getBultArriverByCodBord();
    }
  }


  selectedRow: number | null = null;

  getPoste(event: any, index: number) {
    this.selectedRow = index; // Sets the selected row index to highlight it
    this.serv.LigVisitArriverById(event.cod_soc, event.mat_pers, event.num_fam, event.dat_soin).subscribe({
      next: (response: any) => {
        this.visitArriver = response;  // Assigns the API response to visitArriver
        console.log("la liste des visite", this.visitArriver);
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des données: ${err.message}`;
      }
    });
  }
  


   

    getTotalPages(): number {
      return Math.ceil(this.bordArriver.length / 6);
    }

   onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const fileContent = e.target?.result as string;

      // Corrige pour gérer les sauts de ligne (\n ou \r\n)
      const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');

      console.log("lines", lines);

      this.serv.uploadFile(lines,'01').subscribe({
        next: () => {
          alert('Fichier traité avec succès');
        },
        error: (err) => {
          console.error('Erreur :', err);
          alert('Erreur lors du traitement du fichier');
        }
      });
    };

    reader.readAsText(file);
  }
  }



}