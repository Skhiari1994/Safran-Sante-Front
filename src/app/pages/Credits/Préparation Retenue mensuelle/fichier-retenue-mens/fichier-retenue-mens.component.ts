import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import Swal from 'sweetalert2';
import { PrepRetenueService } from '../prep-retenue.service';

@Component({
  selector: 'app-fichier-retenue-mens',
  templateUrl: './fichier-retenue-mens.component.html',
  styleUrl: './fichier-retenue-mens.component.scss'
})
export class FichierRetenueMensComponent {

  listDetRetMens: any[] = [];
  listRetMens: any[] = [];
  listRetMensFiltred: any[] = [];
  breadCrumbItems!: Array<{}>;
  error: string | null = null;
  mois: string = '';
  fichForm!: FormGroup;
  pSusp: any;
  p: any
  bool: boolean = false
  generatedFiles: string[] = [];
  columnTitles: { [key: string]: string } = {
    mat_pers: "Matricule",
    nom_prenom: "Nom & Prénom",
    abrv_fixe: "Rubrique",
    mnt_retenue: "Mnt retenue",
    date_fin: "Date fin"
  };

  columnTitlesVisite: { [key: string]: string } = {
    cod_pret: "Code",
    l_pret: "Lig",
    cod_grp_pret: "Grp",
    cod_typ_pret: "Type",
    lib_pret: "Libellé",
    mnt_period: "Mnt période",
    mnt_int: "Mnt Int",

  };



  constructor(
    private serv: PrepRetenueService,
    private service: PaginationService,
    private fb: FormBuilder,
    private token: TokenStorageService
  ) { }

  ngOnInit() {

    this.fichForm = this.fb.group({
      mois: [''],
      typ: ['']
    })

    // Reset preparation state when form values change
    this.fichForm.valueChanges.subscribe(() => {
      this.resetPrep();
    });

    this.breadCrumbItems = [
      /*    { label: "Réception remboursement CNAM" },
         { label: "Chargement bordereau arrivée CNAM", active: true }, */
    ];
  }

  selectedRow: number | null = null;

  logRowData(data: any, index: any): void {
    this.selectedRow = index;

    const { cod_soc, mat_pers, mois_retenue, abrv_fixe } = data;


    this.serv.getDetRetMens(cod_soc, mat_pers, mois_retenue, abrv_fixe).subscribe({
      next: (response) => {
        this.listDetRetMens = response;
        console.log("Données de la ligne sélectionnée:", response);
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des données: ${err.message}`;
      }
    });

  }

  showFilters: { [key: string]: boolean } = {};

  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
    if (!this.showFilters[column]) {
      this.searchz[column] = '';
      this.applyFilter();
    }
  }

  onSort(column: any) {
    this.listRetMens = this.service.onSort(column, this.listRetMens);
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
    cod_bord: '',
    reg_adh: ''
  };



  applyFilter() {
    this.listRetMens = this.listRetMensFiltred.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
  }


  Charger() {
    this.serv.chargeRetMens(this.token.getUser().codSoc, this.formatDate(this.mois), null).subscribe((data: any) => {
      this.serv.getRetMensValdO(this.token.getUser().codSoc, this.formatDate(this.mois)).subscribe((data: any) => {
        this.listRetMens = data
        this.listRetMensFiltred = data
        this.applyFilter()
        console.log(this.listRetMens)
      })
      Swal.fire({

        position: 'top-end',
        icon: 'success',
        title: 'Chargement Términer !',
        showConfirmButton: false,
        timer: 2000,
      });
    })
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

  getRetenuMens(event: any) {

    this.serv.getRetMensValdO(this.token.getUser().codSoc, this.formatDate(event.target.value)).subscribe((data: any) => {
      this.listRetMens = data
      this.listRetMensFiltred = data
      this.applyFilter()
      console.log(this.listRetMens)
    })
  }


  getTotalPages(): number {
    return Math.ceil(this.listRetMens.length / 6);
  }

  resetPrep() {
    this.bool = false;
    this.generatedFiles = [];
  }


  vir_carte() {
    const typ = this.fichForm.get('typ')?.value;
    const moisRaw = this.fichForm.get('mois')?.value;

    if (!moisRaw || !typ) {
      Swal.fire({
        title: 'Erreur',
        text: 'Veuillez vérifier la date de retenue et le type de personnel',
        icon: 'error'
      });
      return;
    }

    const formattedDate = this.formatDate(moisRaw);

    const handleResponse = (data: any) => {
      this.bool = true;
      // Handle cases where data is { files: [...] } or just [...] or { message: "...", files: [...] }
      this.generatedFiles = data.files || (Array.isArray(data) ? data : []);

      const message = data.message || "Préparation terminée avec succès";
      const icon = (data.message === 'erreur' || (!this.generatedFiles.length && !data.message)) ? 'error' : 'info';

      Swal.fire({
        title: 'Message',
        text: message,
        icon: icon as any,
        confirmButtonColor: '#3085d6',
      });

      console.log("Generated files:", this.generatedFiles);
    };

    if (typ === 'A') {
      this.serv.vir_carte_ret(this.token.getUser().codSoc, formattedDate).subscribe({
        next: handleResponse,
        error: (err) => {
          console.error("Error in vir_carte_ret:", err);
          Swal.fire('Erreur', 'Échec de la préparation des fichiers', 'error');
        }
      });
    } else if (typ === 'C') {
      this.serv.vir_carte_aux(this.token.getUser().codSoc, formattedDate).subscribe({
        next: handleResponse,
        error: (err) => {
          console.error("Error in vir_carte_aux:", err);
          Swal.fire('Erreur', 'Échec de la préparation des fichiers AUX', 'error');
        }
      });
    }
  }

  downloadFile() {
    if (!this.generatedFiles || this.generatedFiles.length === 0) {
      Swal.fire('Attention', 'Aucun fichier n\'est disponible pour le téléchargement. Veuillez d\'abord charger les données.', 'warning');
      return;
    }

    const typ = this.fichForm.get('typ')?.value;

    // Filter files based on selected type: handle potential paths and be case-insensitive
    const filteredFiles = this.generatedFiles.filter(path => {
      const fileName = path.split(/[\\/]/).pop() || path;
      if (typ === 'A') {
        const allowedAdherentPrefixes = ['SEC', 'COM', 'MED', 'ITES', 'MIN', 'HCCAF', 'VID'];
        return allowedAdherentPrefixes.some(prefix => fileName.toUpperCase().startsWith(prefix.toUpperCase()));
      } else if (typ === 'C') {
        return fileName.toUpperCase().startsWith('AUX');
      }
      return false;
    });

    if (filteredFiles.length === 0) {
      Swal.fire({
        title: 'Attention',
        text: 'Aucun fichier correspondant au type sélectionné n\'a été trouvé dans la préparation actuelle.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    filteredFiles.forEach((fileName, index) => {
      setTimeout(() => {
        this.serv.downloadFile(fileName).subscribe({
          next: (response: any) => {
            // response should be a Blob due to responseType: 'blob' in service
            const blob = response instanceof Blob ? response : new Blob([response as BlobPart], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Extract filename if it's a full path
            const downloadName = fileName.split(/[\\/]/).pop() || fileName;
            a.download = downloadName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          },
          error: (error: any) => {
            console.error(`Erreur lors du téléchargement du fichier ${fileName}`, error);
            Swal.fire('Erreur', `Impossible de télécharger le fichier ${fileName}`, 'error');
          }
        });
      }, index * 500); // 500ms delay between downloads
    });
  }
}


