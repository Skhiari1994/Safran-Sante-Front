import { Component } from '@angular/core';
import { AdherentService } from '../../Adherent/adherent.service';
import { ConventionServiceService } from '../convention-service.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-val-conv-mut',
  templateUrl: './val-conv-mut.component.html',
  styleUrl: './val-conv-mut.component.scss'
})
export class ValConvMutComponent {
  listCorps: any[] = []
  form!: FormGroup
  listOffConv: any[] = []
  listOffConvFiltre: any[] = []
  pSusp: any
  breadCrumbItems!: Array<{}>;
  columnTitles: { [key: string]: string } = {
    mat_pers: 'Matricule',
    num_retr: 'CNR',
    nom: 'Nom Pers',
    cod_off: 'Cod Off',
    cod_conv: 'Cod Conv',
    num_tel: 'Num Tel',
    mnt_off: 'Mnt Payé',
    mod_p: 'Mode payement',
    etat_lig_off: 'Etat',
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
    this.listOffConv = this.service.onSort(column, this.listOffConv);
  }

  searchz: any = {

    mat_pers: '',
    num_retr: '',
    nom: '',
    cod_off: '',
    cod_conv: '',
    num_tel: '',
    mnt_off: '',
    mod_p: '',
    etat_lig_off: ''

  };

  applyFilter() {
    this.listOffConv = this.listOffConvFiltre.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
  }
  onChange() {
    console.log("cc", this.form.get('mois')?.value)
    this.serv.getLigOffConv("01", this.form.get('mois')?.value, this.form.get('corps')?.value).subscribe((data: any) => {
      console.log("cc", data)
      this.listOffConvFiltre = data
      this.applyFilter()
    })
  }

  getTotalPages(): number {
    return Math.ceil(this.listOffConv.length / 9);
  }

  changeModPay(data: any, valid: any) {
    const mat = data.mat_pers;
    const conv = data.cod_conv;
    const off = data.cod_off;
    const seq = data.seq;
    const soc = '01';

    console.log("data :", data)
    console.log("valid :", valid)
    this.serv.updateLigOffConvVir(conv, soc, off, mat, seq, "01/" + this.form.get('mois')?.value, valid).subscribe((dataa: any) => {
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Mode payement changer avec succés",
        showConfirmButton: false,
        timer: 2000,
      });

    })
  }
  onValid(data: any, valid: string) {
    console.log("Triggered onValid with data:", data, "and valid:", valid);

    const mat = data.mat_pers;
    const conv = data.cod_conv;
    const off = data.cod_off;
    const seq = data.seq;
    const soc = '01';

    if (valid) {
      console.log("Calling updateLigOffConv with:", { conv, soc, off, mat, seq, etat: valid });

      this.serv.updateLigOffConv(conv, soc, off, mat, seq, "01/" + this.form.get('mois')?.value, valid).subscribe({
        next: (response: any) => {
          console.log("Update response:", response);
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "État changé avec succès",
            showConfirmButton: false,
            timer: 2000,
          });
          this.onChange();
        },
        error: (error) => {
          console.error("Update error:", error);
          Swal.fire({
            icon: "error",
            title: "Erreur",
            text: "Impossible de changer l'état",
          });
        }
      });
    } else {
      console.warn("État invalide :", valid);
    }
  }



}
