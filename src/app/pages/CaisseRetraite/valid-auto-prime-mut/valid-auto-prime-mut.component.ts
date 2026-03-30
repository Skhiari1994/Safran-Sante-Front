import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { AdherentService } from '../../Adherent/adherent.service';
import { CotisationService } from '../../Cotisation/cotisation.service';
import { CaisseRetrService } from '../caisse-retr.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { ConventionServiceService } from '../../Convention/convention-service.service';

@Component({
  selector: 'app-valid-auto-prime-mut',
  templateUrl: './valid-auto-prime-mut.component.html',
  styleUrl: './valid-auto-prime-mut.component.scss'
})
export class ValidAutoPrimeMutComponent {
  breadCrumbItems!: Array<{}>;

  listCorps: any[] = []
  form!: FormGroup
  listDisk: any[] = []
  listDiskFiltre: any[] = []
  pSusp: any
  columnTitles: { [key: string]: string } = {

    pret_disk: 'Prêt disk',
    num_retr: 'Num Retr',
    mat_pers: 'Matricule',
    nom: 'Nom',
    montant: 'Montant',
    observation: 'Observation',
    valid: 'Valide',
  };
  constructor(private servAdherent: AdherentService, private serv: CaisseRetrService, private service: PaginationService, private fb: FormBuilder,
    private token: TokenStorageService
  ) {
    this.form = this.fb.group({
      mois: [''],
      corps: [''],
      mat: ['']
    })
  }

  ngOnInit() {
    this.getCorps()
  }

  getCorps() {
    this.servAdherent.getCorps().subscribe((data) => {
      this.listCorps = data;
    });
  }


  showFilters: { [key: string]: boolean } = {};

  toggleFilter(column: string, event: Event): void {
    event.stopPropagation();
    this.showFilters[column] = !this.showFilters[column];
    if (!this.showFilters[column]) {
      this.searchz[column] = '';
      this.applyFilter();
    }
  }


  searchz: any = {

    pret_disk: '',
    num_retr: '',
    mat_pers: '',
    nom: '',
    montant: '',
    observation: '',
    valid: '',

  };

  applyFilter() {
    this.listDisk = this.listDiskFiltre.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        if (!searchValue) return true;

        let rowValue = "";
        if (key === 'valid') {
          // Special case for status display labels
          const statusLabel = (row[key] === 'I' ? 'En instance' : 'Validé').toLowerCase();
          return statusLabel.includes(searchValue);
        } else {
          rowValue = row[key]?.toString().toLowerCase() || "";
          return rowValue.includes(searchValue);
        }
      });
    });
    this.calculerTotaux();
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
  onChange() {
    const moisValue = this.form.get('mois')?.value;
    const matValue = this.form.get('mat')?.value;
    const corpsValue = this.form.get('corps')?.value;

    console.log('Form values:', {
      mois: moisValue,
      mat: matValue,
      corps: corpsValue
    });

    // Check if mois has a value before calling the service
    if (!moisValue) {
      console.warn('Mois is empty!');
      return;
    }

    this.serv.getDiskPret(
      matValue || null,
      corpsValue || null,
      moisValue
    ).subscribe({
      next: (data: any) => {
        console.log("Data received from backend:", data);
        console.log("Data length:", data?.length);
        this.listDiskFiltre = data || [];
        this.applyFilter(); // This will populate listDisk and calc totals
      },
      error: (error) => {
        console.error("Error fetching data:", error);
        this.listDisk = [];
        this.listDiskFiltre = [];
      }
    });
  }

  getTotalPages(): number {
    return Math.ceil(this.listDisk.length / 15);
  }

  // changeModPay(data: any, valid: any) {
  //   const mat = data.mat_pers;
  //   const conv = data.cod_conv;
  //   const off = data.cod_off;
  //   const seq = data.seq;
  //   console.log("data :", data)
  //   console.log("valid :", valid)
  //   this.serv.updateLigOffConvModPay(conv, off, mat, seq, valid).subscribe((dataa: any) => {
  //     Swal.fire({
  //       position: "top-end",
  //       icon: "success",
  //       title: "Mode payement changer avec succés",
  //       showConfirmButton: false,
  //       timer: 2000,
  //     });

  //   })
  // }

  onValid(): void {

    Swal.fire({
      title: 'Traitement en cours...',
      html: 'Veuillez patienter...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
    console.log("mat :", this.form.get('mat')?.value)
    console.log("mois :", this.form.get('mois')?.value)
    console.log("corps :", this.form.get('corps')?.value)
    console.log("codSoc :", this.token.getUser().codSoc)
    this.serv.maj_cotisation(
      this.token.getUser().codSoc,
      this.form.get('mat')?.value,
      this.form.get('mois')?.value,
      this.form.get('corps')?.value
    ).subscribe({
      next: (nb: number) => {

        Swal.close();

        if (nb > 0) {
          Swal.fire({
            icon: 'success',
            title: 'Validation réussie',
            text: `${nb} cotisation(s) mise(s) à jour avec succès.`,
          });

          this.reloadDiskPret();
        } else {
          Swal.fire({
            icon: 'info',
            title: 'Aucune mise à jour',
            text: 'Aucune cotisation à valider pour ce critère.',
          });
        }
      },
      error: () => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la validation.'
        });
      }
    });
  }

  reloadDiskPret(): void {
    this.serv.getDiskPret(
      this.form.get('mat')?.value,
      this.form.get('corps')?.value,
      this.form.get('mois')?.value
    ).subscribe((data: any[]) => {
      this.listDiskFiltre = data || [];
      this.applyFilter();
    });
  }





  totalRem: number = 0;

  calculerTotaux(): void {
    this.totalRem = this.listDisk.reduce((sum, item) => sum + (item.montant || 0), 0);

  }
}


