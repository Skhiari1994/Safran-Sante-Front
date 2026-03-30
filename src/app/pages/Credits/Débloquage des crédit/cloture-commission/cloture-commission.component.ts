import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import Swal from 'sweetalert2';
import { DebCreditService } from '../deb-credit.service';
import { SaveService } from 'src/app/shared/Service/save.service';

@Component({
  selector: 'app-cloture-commission',
  templateUrl: './cloture-commission.component.html',
  styleUrl: './cloture-commission.component.scss'
})
export class ClotureCommissionComponent {
  commissionForm!: FormGroup
  datDebl: string = ''
  bool: boolean = false
  listComm: any[] = []
  breadCrumbItems!: Array<{}>;

  columnsComm: any[] = []
  commission: String = ''
  constructor(private fb: FormBuilder, private serv: DebCreditService, private token: TokenStorageService, private saveService: SaveService) {
    this.commissionForm = this.fb.group({
      cod_soc: ['01'],
      num_comm: [''],
      dat_comm: [''],
      ref_comm: [''],
      dat_deb_comm: [''],
      dat_fin_comm: [''],
      dat_real: [''],
      cod_etat_pret: [{ value: '', disabled: true }],
      typ_etat: [''],
      observ: [''],
      datDebl: [],
      dat_op: [''],
      ref_metier: ['']
    })
  }


  ngOnInit() {
    this.getComm()
    this.saveService.setDisabled(false)
  }



  deblocage_carte() {
    Swal.fire({
      title: 'Confirmation',
      text: "Voulez-vous procéder au déblocage de la carte ?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, débloquer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Chargement...',
          text: 'Veuillez patienter pendant le déblocage de la carte',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.serv.deblocage_carte(
          this.commissionForm.get('cod_soc')?.value,
          this.formatDate(this.commissionForm.get('datDebl')?.value),
          this.commissionForm.get('num_comm')?.value,
          this.commissionForm.get('ref_metier')?.value,
          this.formatDate(this.commissionForm.get('dat_op')?.value)
        ).subscribe({
          next: (res) => {
            Swal.close();
            console.log('✅ Backend response:', res);

            Swal.fire({
              title: 'Succès',
              text: res?.message ?? 'Déblocage effectué avec succès',
              icon: 'success',
              confirmButtonColor: '#3085d6',
            });
          },
          error: (err) => {
            Swal.close();
            console.error('❌ Backend error:', err);

            const msg =
              err?.error?.message ||
              err?.error ||
              err?.message ||
              'Erreur inconnue';

            Swal.fire({
              title: 'Erreur',
              text: msg,
              icon: 'error',
              confirmButtonColor: '#3085d6',
            });
          }
        });

      }
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


  getComm() {
    this.serv.getValidCommission(this.token.getUser().codSoc).subscribe((data) => {
      this.listComm = data;
      // Définir les colonnes dynamiques du tableau
      this.columnsComm = [
        { key: "num_comm", label: "Num comm" },
        { key: "ref_comm", label: "Ref comm" },

      ];
    });
  }
  onSelectedComm(item: any) {
    this.commissionForm.patchValue({
      num_comm: item.num_comm,
      dat_comm: item.dat_comm,
      ref_comm: item.ref_comm,
      dat_deb_comm: item.dat_deb_comm,
      dat_fin_comm: item.dat_fin_comm,
      cod_etat_pret: item.cod_etat_pret
    })

  }
}

