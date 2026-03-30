import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { ReceptionRemboursementService } from '../../Reception remboursements CNAM/reception-remboursement.service';
import { ReglementService } from '../reglement.service';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-reg-bord-mut',
  templateUrl: './reg-bord-mut.component.html',
  styleUrl: './reg-bord-mut.component.scss'
})
export class RegBordMutComponent {



  AllBordEnvoi: any[] = [];
  breadCrumbItems!: Array<{}>;
  columnBordEnvoi: any[] = [];
  bordArriver: any[] = [];
  bordArriverFilter: any[] = [];
  error: string | null = null;
  dateBord: string = "";
  cod_bord: string = "";
  codBord: string = "";
  BordEnvoiForm!: FormGroup;
  selectedRow: number | null = null;
  pSusp: any;
  p: any;
  reg: string = "";

  columnTitles: { [key: string]: string } = {
    mat_pers: "Matriucle",
    nom_complet_pers: "Nom & Prénom",
    cod_fil: "Filière",
    num_fam: "Préstataire",
    nom_pers: "Nom",
    dat_saisie: "Date saisie",
    dat_soin: "Date soin",
    solde: "Solde.",
    tot_honor: "Tot. Honor.",
    tot_net: "Tot. Net."
  };

  constructor(
    private serv: ReglementService,
    private service: PaginationService,
    private fb: FormBuilder,
    private token: TokenStorage
  ) { }

  ngOnInit() {
    this.BordEnvoiForm = this.fb.group({
      cod_bord: [""],
      dat_bord: [""],
      nbr_bult: [""],
      lib_assurance: [""],
      dat_deb: [""],
      dat_fin: [""],
      tot_net: [""],
      tot_honor: [""],
      cod_assur: [""]
    });

    this.getAllBordEnvoi();

    this.breadCrumbItems = [
      /*  { label: "Réglement" },
       { label: "Calcul réglement par bordereau mutuelle", active: true }, */
    ];
  }

  showFilters: { [key: string]: boolean } = {};

  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }

  onSort(column: any) {
    this.bordArriver = this.service.onSort(column, this.bordArriver);
  }

  searchz: any = {

    mat_pers: "",
    nom_complet_pers: "",
    cod_fil: "",
    num_fam: "",
    nom_pers: "",
    dat_saisie: "",
    dat_soin: "",
    solde: "",
    tot_honor: "",
    tot_net: "",

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






  ControleBordMutuelle(): void {

    this.serv.ControleBordMutuelle(this.token.getUser().codSoc, this.cod_bord).subscribe({
      next: (data) => {
        this.bordArriver = data;
        this.bordArriverFilter = data;
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Erreur lors de la récupération des données: ${err.message}`;
      },
    });

  }



  getAllBordEnvoi(): void {
    this.serv.getAllBordEnvoi(this.token.getUser().codSoc).subscribe({
      next: (data) => {
        this.AllBordEnvoi = data;
        console.log("donne des bordereau", this.AllBordEnvoi)
        this.columnBordEnvoi = [
          { key: "cod_bord", label: "Code de bordereau" },
          { key: "dat_bord", label: "Date de bordereau" },
        ];
      },
      error: (err) => {
        this.error = "Erreur lors de la récupération des données";
      },
    });
  }

  onSelectedValueBordEnvoi(event: any): void {
    if (event) {
      this.cod_bord = event.cod_bord;
      this.dateBord = event.dat_bord;
      this.reg = event.reg_bord;
      this.BordEnvoiForm.patchValue({
        cod_bord: event.cod_bord,
        dat_bord: event.dat_bord,
        nbr_bult: event.nbr_bult,
        lib_assurance: event.lib_assurance,
        dat_deb: event.dat_deb,
        dat_fin: event.dat_fin,
        tot_net: event.tot_net,
        tot_honor: event.tot_honor,
        cod_assur: event.cod_assur
      });


      this.ControleBordMutuelle();
      console.log("selected cod_bord", event.cod_bord);


    }
  }

  getTotalPages(): number {
    return Math.ceil(this.bordArriver.length / 9);
  }

  validateBord(codSoc: string, codAssur: string, codBord: string) {
    this.serv.validateBord(codSoc, codAssur, codBord).subscribe(
      res => Swal.fire('Succès', res.message, 'success'),
      err => Swal.fire('Erreur', 'Erreur lors de la validation', 'error')
    );

  }
  clotureBord() {
    this.validateBord(this.token.getUser().codSoc, this.BordEnvoiForm.get('cod_assur')?.value,
      this.cod_bord
    )

  }
  reglerBord() {
    const codSoc = this.token.getUser().codSoc;
    const codAssur = this.BordEnvoiForm.get('cod_assur')?.value;

    Swal.fire({
      title: 'Traitement en cours...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.serv.regler_bord(codSoc, this.cod_bord, codAssur)
      .subscribe({
        next: res => {
          Swal.close();
          this.ControleBordMutuelle();

          Swal.fire({
            title: 'Message',
            text: res.message,
            icon: res.wreg_bord === 'O' ? 'success' : 'error'
          });
        },
        error: () => {
          Swal.close();
          Swal.fire('Erreur', 'Erreur pendant le règlement', 'error');
        }
      });
  }



  getTotalHonor(): number {
    return this.bordArriver
      ? this.bordArriver.reduce((sum: number, item: { tot_honor: string; }) => sum + (parseFloat(item.tot_honor) || 0), 0)
      : 0;
  }

  getTotalTot(): number {
    return this.bordArriver
      ? this.bordArriver.reduce((sum: number, item: { tot_net: string; }) => sum + (parseFloat(item.tot_net) || 0), 0)
      : 0;
  }
}


