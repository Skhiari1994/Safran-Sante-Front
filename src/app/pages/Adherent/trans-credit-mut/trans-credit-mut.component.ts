import { Component, OnInit } from '@angular/core';
import { AdherentService } from '../adherent.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-trans-credit-mut',
  templateUrl: './trans-credit-mut.component.html',
  styleUrl: './trans-credit-mut.component.scss'
})
export class TransCreditMutComponent implements OnInit {

  listPersonnel: any[] = [];
  listData: any[] = [];
  filteredDataRows: any[] = [];

  columnsSearch: any[] = [];
  breadCrumbItems: any[] = [];

  codMatVal: string = '';
  mois: string = '';

  total: number = 0;

  columnTitles: { [key: string]: string } = {
    pret_disk: 'Pret Disk',
    num_retr: 'Num Retr',
    mat_pers: 'Matricule',
    nom_pers: 'Nom et Prénom',
    montant: 'Montant',
    observation: 'Observation',
    valid: 'Valid'
  };

  showFilters: { [key: string]: boolean } = {};
  searchz: { [key: string]: any } = {};

  selectedRow: number | null = null;

  constructor(private adherentServ: AdherentService) { }

  ngOnInit(): void {
    this.getPersonnels();
  }

  getPersonnels(): void {
    this.adherentServ.getPersonnels().subscribe({
      next: (data) => {
        this.listPersonnel = data || [];
        this.columnsSearch = [
          { key: 'mat_pers', label: 'Matricule' },
          { key: 'mat_int', label: 'Mat. Administratif' },
          { key: 'dat_nais', label: 'Date naissance' },
          { key: 'nom_pers', label: 'Nom' },
          { key: 'pren_pers', label: 'Prénom' },
          { key: 'num_retr', label: 'Id unique' },
          { key: 'cin', label: 'CIN' },
          { key: 'cod_lieu_geog', label: 'Service' }
        ];
      },
      error: () => {
        this.listPersonnel = [];
      }
    });
  }

  onSelectedValue(item: any): void {
    this.codMatVal = item?.mat_pers || '';
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files?.[0];
    if (!file) return;

    if (!this.mois?.trim()) {
      Swal.fire('Attention', 'Veuillez saisir le mois (MM/YYYY)', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('soc', '01');
    formData.append('mois', this.mois);
    formData.append('file', file);

    Swal.fire({
      title: 'Chargement en cours...',
      html: 'Veuillez patienter',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
    console.log("this.mois", this.mois)


    this.adherentServ.import_fichier(formData).subscribe({
      next: (resp: any) => {
        const inserted = resp?.insertedLines ?? 0;
        const total = resp?.totalLines ?? 0;
        const percent = total ? Math.round((inserted / total) * 100) : 0;

        Swal.fire({
          icon: 'success',
          title: 'Succès',
          html: `${inserted} lignes sur ${total} (${percent}%)`,
          timer: 3000
        });

        this.loadDiskPret();
      },
      error: (err) => {
        Swal.fire(
          'Erreur',
          err?.error?.message || 'Erreur lors de l’import du fichier',
          'error'
        );
      }
    });
  }

  loadDiskPret(): void {
    this.adherentServ.getDiskPret(this.formatMois(this.mois)).subscribe({
      next: (data: any) => {
        this.listData = Array.isArray(data) ? data : [];
        this.filteredDataRows = [...this.listData];
        this.applyFilter();
        this.total = this.calculateTotal();
        console.log("this.mois", this.filteredDataRows)

      },
      error: () => {
        this.filteredDataRows = [];
        this.total = 0;
      }
    });
  }
  formatMois(value: string): string {
    if (!value) return '';

    // Expect 6 digits: MMYYYY
    if (/^\d{6}$/.test(value)) {
      return value.substring(0, 2) + '/' + value.substring(2, 6);
    }

    return value;
  }

  calculateTotal(): number {
    return this.filteredDataRows.reduce((sum: number, row: any) => {
      return sum + (Number(row?.montant) || 0);
    }, 0);
  }

  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
    if (!this.showFilters[column]) {
      this.searchz[column] = '';
      this.applyFilter();
    }
  }

  onSort(column: string): void {
    // optional: implement sorting
  }

  getAffect(row: any, index: number): void {
    this.selectedRow = index;
  }

  applyFilter(): void {
    this.filteredDataRows = this.listData.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
  }
}
