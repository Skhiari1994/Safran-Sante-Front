import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DebCreditService } from '../deb-credit.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { AdherentService } from 'src/app/pages/Adherent/adherent.service';
import Swal from 'sweetalert2';
import { SaveService } from 'src/app/shared/Service/save.service';

@Component({
  selector: 'app-reglement-automatique-credit',
  templateUrl: './reglement-automatique-credit.component.html',
  styleUrl: './reglement-automatique-credit.component.scss'
})
export class ReglementAutomatiqueCreditComponent {
  formSearch!: FormGroup
  listDetailPret: any[] = []
  listLigRegSearch: any[] = []
  columnsDetailPret: any[] = []
  listLigReg: any[] = []
  grpPret: string = ''
  libPret: string = ''
  pSusp: any;
  listPersonnel: any[] = []
  columnPersonnels: any[] = []
  listDeskPret: any[] = []
  nomPren: String = ''
  matPersVal: String = ''
  breadCrumbItems!: Array<{}>;

  constructor(private serv: DebCreditService, private saveService: SaveService, private adherentServ: AdherentService, private token: TokenStorageService, private fb: FormBuilder, public service: PaginationService) {
    this.formSearch = this.fb.group({
      mois: [''],
      matPers: [''],
      corps: [''],
      codGrp: ['']
    })

  }

  ngOnInit() {
    this.getDetailPret()
    this.getPersonnels()
    this.columnPersonnels = [
      { key: "mat_pers", label: "Matricule" },
      { key: "full_name", label: "Nom & Prénom" },
    ];
  }

  ngOnDestroy() {
    this.saveService.setIsSearch(false)
  }
  getDetailPret() {
    this.serv.getDetailPret(this.token.getUser().codSoc).subscribe((data) => {
      this.listDetailPret = data;
      // Définir les colonnes dynamiques du tableau
      this.columnsDetailPret = [
        { key: "codGrpPret", label: "Groupe prêt" },

        { key: "libPret", label: "Libelle" },

      ];
    });
  }
  ValiderAutomatique() {
    Swal.fire({
      title: 'Confirmation',
      text: "Voulez-vous procéder à la validation automatique ?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, valider',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Chargement...',
          text: 'Veuillez patienter pendant la validation automatique',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.serv.ValiderAutomatique(this.token.getUser().codSoc, this.formSearch.get('matPers')?.value,
          this.formSearch.get('codGrp')?.value, this.formSearch.get('corps')?.value, this.formSearch.get('mois')?.value).subscribe({
            next: (data: any) => {
              Swal.close();
              Swal.fire({
                title: 'Message',
                text: "Validation avec succès",
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK',
              });

              this.getDiskPret(); // Refresh list after validation
            },
            error: (err) => {
              Swal.close();
              console.error('❌ Backend error:', err);
              const msg = err?.error?.message || err?.error || err?.message || 'Erreur inconnue';
              Swal.fire({
                title: 'Erreur',
                text: msg,
                icon: 'error',
                confirmButtonColor: '#3085d6',
              });
            }
          })
      }
    });


  }
  onSelectedDetailPret(item: any) {
    this.libPret = item.libPret

    this.formSearch.patchValue({
      codGrp: item.codGrpPret,

    })
    console.log("codGrp :", this.formSearch.get('codGrp')?.value)
    this.getDiskPret()


  }

  onSort(column: any) {
    this.listLigReg = this.service.onSort(
      column,
      this.listLigReg
    );
  }


  searchz: any = {
    matPers: "",
    numRetr: "",
    nom: "",
    type: "",
    mntInt: "",
    mntPeriod: "",
    lpret: "",
    codPret: "",
    capRest: ""
  };
  applyFilter() {
    this.listLigReg = this.listLigRegSearch.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        // Map search keys to data keys if necessary
        let dataKey = key;
        if (key === 'nom') dataKey = 'nom';
        if (key === 'matPers') dataKey = 'mat_pers';
        if (key === 'numRetr') dataKey = 'num_retr';
        if (key === 'mntPeriod') dataKey = 'montant'; // Align with "Mnt" column
        if (key === 'type') dataKey = 'pret_disk'; // Map first filter box to first data column

        const rowValue = row[dataKey]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
  }


  getDiskPret() {
    console.log("Fetching DiskPret with:", {
      mois: this.formSearch.get('mois')?.value,
      matPers: this.formSearch.get('matPers')?.value,
      corps: this.formSearch.get('corps')?.value,
      codGrp: this.formSearch.get('codGrp')?.value
    });

    const matPers = this.formSearch.get('matPers')?.value || "";

    this.serv.getDiskPret(
      matPers,
      this.formSearch.get('corps')?.value,
      this.formSearch.get('mois')?.value,
      this.formSearch.get('codGrp')?.value
    ).subscribe((dataa: any) => {
      this.listDeskPret = dataa;
      this.listLigReg = dataa; // Use this for display
      this.listLigRegSearch = dataa; // Keep master copy for filtering
      console.log("Data loaded matching db query:", dataa.length, "items");
    });
  }

  getPersonnels() {
    this.adherentServ.getPersonnelsCredit().subscribe(data => {
      this.listPersonnel = data

      this.columnPersonnels = [
        { key: "mat_pers", label: "Matricule" },
        { key: "full_name", label: "Nom & Prénom" },
      ];
    })
  }

  onSelectedValuePers(item: any) {
    console.log("item :", item)
    this.nomPren = item.full_name;
    this.formSearch.patchValue({
      matPers: item.mat_pers,
      corps: item.corps

    })

    this.getDiskPret()

  }
  getTotalMontant(): number {
    if (!this.listLigReg || this.listLigReg.length === 0) {
      // console.log("getTotalMontant: listLigReg is empty");
      return 0;
    }

    let total = 0;
    let validCount = 0;

    this.listLigReg.forEach((item, index) => {
      let val = 0;
      const rawValue = item.montant;

      if (typeof rawValue === 'number') {
        val = rawValue;
      } else if (typeof rawValue === 'string') {
        // Robust parsing:
        // 1. Remove all spaces
        // 2. If there are multiple dots/commas, assume only the last one is a decimal separator
        // This handles "1.234,567" or "1 234.567" or "1.234.567,89"
        let clean = rawValue.replace(/\s/g, '');

        // If there's a comma, treat it as a potential decimal separator
        // but if there's also a dot later, then comma was a thousands separator.
        // Simplified approach: remove all non-digit/dot/comma, then replace comma with dot
        // and if multiple dots exist, remove all but the last.
        clean = clean.replace(/[^0-9.,]/g, '');

        if (clean.includes(',') && clean.includes('.')) {
          // Mixed separators: thousands and decimal.
          // Assume the last one is the decimal.
          const lastComma = clean.lastIndexOf(',');
          const lastDot = clean.lastIndexOf('.');
          if (lastComma > lastDot) {
            // Comma is decimal
            clean = clean.replace(/\./g, '').replace(',', '.');
          } else {
            // Dot is decimal
            clean = clean.replace(/,/g, '');
          }
        } else if (clean.includes(',')) {
          // Only comma used
          clean = clean.replace(',', '.');
        } else if ((clean.match(/\./g) || []).length > 1) {
          // Multiple dots used (thousands separator)
          clean = clean.replace(/\.(?=[^.]*\.)/g, ''); // Remove all but last dot
        }

        val = parseFloat(clean);
      }

      if (!isNaN(val)) {
        total += val;
        validCount++;
      }

      // Log the first few items to verify property names and values in dev mode
      if (index === 0 && this.listLigReg.length > 0) {
        console.log("DEBUG: First item:", item);
        console.log("DEBUG: Parsed montant:", val, "from raw:", rawValue);
      }
    });

    // Logging summary for the user to check in console
    // console.log(`TOTAL DEBUG: Summed ${validCount} items out of ${this.listLigReg.length}. Total Fixed: ${total}`);

    return total;
  }
}
