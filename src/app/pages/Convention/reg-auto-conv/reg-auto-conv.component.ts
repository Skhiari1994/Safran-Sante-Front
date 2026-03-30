import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import Swal from 'sweetalert2';
import { AdherentService } from '../../Adherent/adherent.service';
import { ConventionServiceService } from '../convention-service.service';

@Component({
  selector: 'app-reg-auto-conv',
  templateUrl: './reg-auto-conv.component.html',
  styleUrl: './reg-auto-conv.component.scss'
})
export class RegAutoConvComponent {
  listCorps: any[] = []
  form!: FormGroup
  listDisk: any[] = []
  listDiskFiltre: any[] = []
  pSusp: any
  breadCrumbItems!: Array<{}>;
  columnTitles: { [key: string]: string } = {

    pret_disk: 'Prêt disk',
    num_retr: 'Num Retr',
    mat_pers: 'Matricule',
    nom: 'Nom',
    montant: 'Montant',
    observation: 'Observation',
    valid: 'Valide',
  };
  constructor(private servAdherent: AdherentService, private serv: ConventionServiceService, private service: PaginationService, private fb: FormBuilder,
    private token: TokenStorageService
  ) {
    this.form = this.fb.group({
      mois: [''],
      corps: ['']
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

  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
    if (!this.showFilters[column]) {
      this.searchz[column] = '';
      this.applyFilter();
    }
  }

  onSort(column: any) {
    this.listDisk = this.service.onSort(column, this.listDisk);
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
        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
  }
  onChange() {
    console.log("cc", this.form.get('mois')?.value)
    this.serv.getDiskPret(this.form.get('corps')?.value, this.form.get('mois')?.value).subscribe((data: any) => {
      console.log("cc", data)
      this.listDisk = data
      this.listDiskFiltre = data
      this.applyFilter();
      this.calculerTotaux()
    })
  }

  getTotalPages(): number {
    return Math.ceil(this.listDisk.length / 9);
  }

  changeModPay(data: any, valid: any) {
    const mat = data.mat_pers;
    const conv = data.cod_conv;
    const off = data.cod_off;
    const seq = data.seq;
    console.log("data :", data)
    console.log("valid :", valid)
    this.serv.updateLigOffConvModPay(conv, off, mat, seq, valid).subscribe((dataa: any) => {
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Mode payement changer avec succés",
        showConfirmButton: false,
        timer: 2000,
      });

    })
  }


  onValid() {
    // Affiche une popup de chargement
    Swal.fire({
      title: 'Traitement en cours...',
      html: 'Veuillez patienter...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.serv.maj_convention(
      this.token.getUser().codSoc,
      this.form.get('mois')?.value,
      this.form.get('corps')?.value,
      ""
    ).subscribe({
      next: (dataa: any) => {
        Swal.close();
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Validation avec succès",
          showConfirmButton: false,
          timer: 2000,
        });

        this.onChange();
      },
      error: (err) => {
        Swal.close();

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la validation.',
        });
      }
    });
  }



  totalRem: number = 0;

  calculerTotaux(): void {
    this.totalRem = this.listDisk.reduce((sum, item) => sum + (item.montant || 0), 0);

  }
}

