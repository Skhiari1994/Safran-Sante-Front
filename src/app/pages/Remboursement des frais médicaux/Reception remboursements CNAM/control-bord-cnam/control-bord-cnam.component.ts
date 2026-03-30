import { Component } from "@angular/core";
import { ReceptionRemboursementService } from "../reception-remboursement.service";
import { HttpErrorResponse } from "@angular/common/http";
import { FormBuilder, FormGroup } from "@angular/forms";
import { PaginationService } from "src/app/core/services/pagination.service";
import { TokenStorage } from "src/app/account/token-storage.service";
import { SaveService } from "src/app/shared/Service/save.service";

@Component({
  selector: "app-control-bord-cnam",
  templateUrl: "./control-bord-cnam.component.html",
  styleUrl: "./control-bord-cnam.component.scss",
})
export class ControlBordCnamComponent {
 

 
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
    tot_net:"Tot. Net."
  };

  constructor(
    private serv: ReceptionRemboursementService,
    private service: PaginationService,
    private fb: FormBuilder,
    private token:TokenStorage,
    private saveService: SaveService,
  ) {}

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
    });

    this.getAllBordEnvoi();

    this.breadCrumbItems = [
     /*  { label: "Réception remboursement CNAM" },
      { label: "Contrôle bordereau CNAM", active: true }, */
    ];
  }
  ngOnDestroy(){

    this.saveService.setIsSearch(false)
  }
  showFilters: { [key: string]: boolean } = {};

  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }

  onSort(column: any) {
    this.bordArriver = this.service.onSort(column, this.bordArriverFilter);
  }

  searchz: any = {
 
    mat_pers: "Matriucle",
    nom_complet_pers: "Nom & Prénom",
    cod_fil: "Filière",
    num_fam: "Préstataire",
    nom_pers: "Nom",
    dat_saisie: "Date saisie",
    dat_soin: "Date soin",
    solde: "Solde",
    tot_honor: "Tot. Honor.",
    tot_net: "Tot. Net.",

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

 
 



  getControleBordCnam(): void {
 
      this.serv.getControleBordCnam(this.token.getUser().codSoc,this.cod_bord).subscribe({
        next: (data) => {
          this.bordArriver = data;
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
        console.log("donne des bordereau",this.AllBordEnvoi)
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
      this.BordEnvoiForm.patchValue({
        cod_bord: event.cod_bord,
        dat_bord: event.dat_bord,
        nbr_bult: event.nbr_bult,
        lib_assurance: event.lib_assurance,
        dat_deb: event.dat_deb,
        dat_fin: event.dat_fin,
        tot_net: event.tot_net,
        tot_honor: event.tot_honor,
      });
  
       
      this.getControleBordCnam();
      console.log("selected cod_bord", event.cod_bord);
 

    }
  }

  getTotalPages(): number {
    return Math.ceil(this.bordArriver.length / 9);
  }
}
 
