import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { ReglementService } from '../reglement.service';

@Component({
  selector: 'app-cpt-vir-bord-cnam',
  templateUrl: './cpt-vir-bord-cnam.component.html',
  styleUrl: './cpt-vir-bord-cnam.component.scss'
})
export class CptVirBordCnamComponent {
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
  bool: boolean = false
  nomFichier: string = ''

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
    private token :TokenStorageService,
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
     /*  { label: "Réglement" },
      { label: "Consultation réglement bordereau CNAM", active: true }, */
    ];
 
 
 
  }
  getReclamationCount(): number {
    return this.bordArriver.filter(item => 
      item.reclamation && item.reclamation.trim() !== ''
    ).length;
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
    tot_remb: '',
    tot_mut:'',
    Mod_pay:''
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
      this.serv.findBultArriverCptCnam(this.cod_bord).subscribe({
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
 
  onValidChange(data: any, valid: any) {
    const mat = data.mat_pers;  // Replace with actual value
    const dat = data.dat_soin;   // Replace with actual value
    const numFam = data.num_fam;  // Replace with actual value 
    this.serv.MajModPayCnam(this.token.getUser().codSoc, mat, numFam, dat, valid).subscribe((dataa: any) => {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Mode de payement est modifier avec succés !',
        showConfirmButton: false,
        timer: 2000,
      });
      this.getBultArriverByCodBord()
    })

  }
  downloadFile() {
    this.serv.download_file(this.nomFichier).subscribe((response: any) => {
      const blob = new Blob([response as BlobPart], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);

      // Créer un lien temporaire pour déclencher le téléchargement
      const a = document.createElement('a');
      a.href = url;
      a.download = this.nomFichier;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(url);
    }, (error: any) => {
      console.error('Erreur lors du téléchargement du fichier', error);
    });
  }

  vir_bord() {
    this.serv.vir_bord(this.token.getUser().codSoc, this.cod_bord, this.nomFichier).subscribe((data: any) => {
      this.bool = true
      console.log("this.nomFichier :",this.nomFichier)
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: data.message,
        showConfirmButton: false,
        timer: 2000,
      });
     })
  }
  getTotalPages(): number {
    return Math.ceil(this.bordArriver.length / 6);
  }

  majRegAdhVirCnam() {
    
    Swal.fire({
      title: 'Traitement en cours...',
      html: 'Veuillez patienter...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();  
      }
    });
  
    this.serv.majRegAdhVirCnam(this.token.getUser().codSoc, this.cod_bord).subscribe(
      (data: any) => {
        this.getBultArriverByCodBord();
        
       
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Comptabilisation terminée !',
          showConfirmButton: false,
          timer: 2000
        });
      },
      (error) => {
        
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la comptabilisation.',
        });
      }
    );
  }
  totalRem: number = 0;
  totalMut: number = 0;
  calculerTotaux(): void {
    this.totalRem = this.bordArriver.reduce((sum, item) => sum + (item.tot_remb || 0), 0);
    this.totalMut = this.bordArriver.reduce((sum, item) => sum + (item.tot_mut || 0), 0);
   }
  totalRemVisit: number = 0;
   calculerTotauxVisit(): void {
     this.totalRemVisit = this.visitArriver.reduce((sum, item) => sum + (item.mnt_remb || 0), 0);
     console.log("Total Rem:", this.totalRemVisit);
  }

  totalRemActe: number = 0;
  totalMutActe: number = 0;
  calculerTotauxActe(): void {
    console.log("this.actArriver :", this.actArriver);
    
    this.totalRemActe = this.actArriver.reduce((sum, item) => sum + (item.mnt_honor || 0), 0);
    this.totalMutActe = this.actArriver.reduce((sum, item) => sum + (item.mnt_remb || 0), 0);
  }
  

   totalRemMed: number = 0;
   totalMutMed: number = 0;
   calculerTotauxMed(): void {
     this.totalRemMed = this.medArriver.reduce((sum, item) => sum + (item.mnt_honor || 0), 0);
     this.totalMutMed = this.medArriver.reduce((sum, item) => sum + (item.mnt_remb || 0), 0);
    }

    totalRemApp: number = 0;
    totalMutApp: number = 0;
    calculerTotauxApp(): void {
      this.totalRemApp = this.appArriver.reduce((sum, item) => sum + (item.mnt_honor || 0), 0);
      this.totalMutApp = this.appArriver.reduce((sum, item) => sum + (item.mnt_remb || 0), 0);
     }

     totalRemLig: number = 0;
     totalMutLig: number = 0;
     calculerTotauxLig(): void {
       this.totalRemLig = this.ligBultArriver.reduce((sum, item) => sum + (item.mnt_honor || 0), 0);
       this.totalMutLig = this.ligBultArriver.reduce((sum, item) => sum + (item.mnt_remb || 0), 0);
      }
}




