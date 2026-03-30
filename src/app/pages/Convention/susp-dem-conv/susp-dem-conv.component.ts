import { Component } from '@angular/core';
import { ConventionServiceService } from '../convention-service.service';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-susp-dem-conv',
  templateUrl: './susp-dem-conv.component.html',
  styleUrl: './susp-dem-conv.component.scss'
})
export class SuspDemConvComponent {
  private modalRef: any;
  private modalRefConv: any;
  listConv: any[] = []
  listOffConv: any[] = []
  listMotif: any[] = []
  columnMotif: any[] = []
  motif: string = ''
  motifConv: string = ''

  breadCrumbItems!: Array<{}>;
  pSusp: any;
  formDemConv!: FormGroup
  formOffConv!: FormGroup
  edit: boolean = true;
  libConv: string = ''
  nom: string = ''
  libMotif: string = ''
  lib_off: string = ''

  // Filter properties
  searchz: { [key: string]: string } = {};
  selectedRow: number | null = null;
  filteredListConv: any[] = [];
  columnTitles: { [key: string]: string } = {
    cod_conv: "Code",
    lib_conv: "Lib Convention",
    mat_pers: "Matricule",
    nom: "Nom & Prénom",
    dat_dem_conv: "Date dem",
    dat_min_fin: "Date Fin",
    etat_dem: "Etat",
    dat_susp: "Date susp"
  };

  columnTitlesOff: { [key: string]: string } = {
    cod_off: "Code",
    lib_off: "Lib Convention",
    num_tel: "Num Tel",
    dat_off: "Date offre",
    dat_saisie: "Date Saisie",
    mnt_off: "Mnt off",
    etat_off_dem: "Etat",
    dat_susp: "Date susp",
    cod_mot_susp: "Motif",
    lib_mot: "Libelle"
  };
  constructor(private serv: ConventionServiceService, private token: TokenStorage, private service: PaginationService,
    private fb: FormBuilder, private modalService: NgbModal
  ) {
    this.formDemConv = this.fb.group({
      cod_conv: [''],
      cod_soc: [''],
      mat_pers: [''],
      dat_dem_conv: [''],
      etat_dem: [''],
      dat_saisie: [''],
      cod_user: [''],
      dat_min_fin: [''],
      obs: [''],
      cod_lieu_geog: [''],
      cod_typ_depart: [''],
      cod_affect: [''],
      dat_susp: [''],
      cin: [''],

    })
    this.formOffConv = this.fb.group({
      cod_conv: [''],
      cod_soc: [''],
      mat_pers: [''],
      cod_off: [''],
      dat_off_dem: [''],
      dat_fin_off: [''],
      mnt_off: [''],
      etat_off_dem: [''],
      cod_user: [''],
      dat_saisie: [''],
      seq: [''],
      dat_susp: [''],
      num_tel: [''],
      cod_mot_susp: [''],
      renouv: [''],
      dat_renouv: [''],
      obs_off: [''],

    })
  }
  ngOnInit() {


    this.getConvSups();
    this.getMotifSusp()
    this.breadCrumbItems = [
      /*    { label: "Réception remboursement CNAM" },
         { label: "Chargement bordereau arrivée CNAM", active: true }, */
    ];
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
    this.listConv = this.service.onSort(column, this.listConv);
  }

  applyFilter(): void {
    this.listConv = this.filteredListConv.filter((item: any) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key];
        if (!searchValue) return true;

        const itemValue = item[key];
        if (itemValue === null || itemValue === undefined) return false;

        return itemValue.toString().toLowerCase().includes(searchValue.toLowerCase());
      });
    });
  }

  getConvSups() {
    this.serv.getConvValSusp(this.token.getUser().codSoc).subscribe((data: any) => {
      this.filteredListConv = [...data]; // Initialize filtered list
      this.applyFilter();
      console.log("list conv susp", data)
    })
  }


  logRowData(data: any, index: any): void {

    this.serv.getOffConv(data.cod_conv, data.mat_pers).subscribe((data: any) => {
      this.listOffConv = data
    })
  }

  getTotalPages(): number {
    return Math.ceil(this.listConv.length / 6);
  }

  editDataGet(data: any, content: any) {
    this.edit = false;
    console.log(data)
    this.modalRef = this.modalService.open(content, { size: "xl", centered: true });
    this.formDemConv.patchValue({

      cod_conv: data.cod_conv,
      cod_soc: data.cod_soc,
      mat_pers: data.mat_pers,
      dat_dem_conv: data.dat_dem_conv,
      etat_dem: data.etat_dem,
      dat_saisie: data.dat_saisie,
      cod_user: data.cod_user,
      dat_min_fin: data.dat_min_fin,
      obs: data.obs,
      cod_lieu_geog: data.cod_lieu_geog,
      cod_typ_depart: data.cod_typ_depart,
      cod_affect: data.cod_affect,
      dat_susp: data.dat_susp,
      cin: data.cin,


    })
    this.libConv = data.lib_conv,
      this.nom = data.nom
    this.motif = data.cod_motif_susp

  }
  editOffConv(data: any, content: any) {
    this.edit = false;
    console.log(data)
    this.modalRefConv = this.modalService.open(content, { size: "xl", centered: true });
    this.formOffConv.patchValue({

      cod_conv: data.cod_conv,
      cod_soc: data.cod_soc,
      mat_pers: data.mat_pers,
      cod_off: data.cod_off,
      dat_off_dem: data.dat_off_dem,
      dat_fin_off: data.dat_fin_off,
      mnt_off: data.mnt_off,
      etat_off_dem: data.etat_off_dem,
      cod_user: data.cod_user,
      dat_saisie: data.dat_saisie,
      seq: data.seq,
      dat_susp: data.dat_susp,
      num_tel: data.num_tel,
      cod_mot_susp: data.cod_mot_susp,
      renouv: data.renouv,
      dat_renouv: data.dat_renouv,
      obs_off: data.obs_off,



    })
    this.lib_off = data.lib_off,
      this.motifConv = data.cod_mot_susp

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
  saveSusp() {
    const formatDates = (form: any, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value);
        form.get(field)?.setValue(value);
        formatted.push(value);
        return formatted;
      }, []);

    const demConv = formatDates(this.formDemConv, [
      "dat_susp",

    ]);

    if (this.formDemConv.get('etat_dem')?.value == 'S' && this.formDemConv.get('dat_susp')?.value == null) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Il faut Saisir la date du suspention !!!",
        showConfirmButton: false,
        timer: 2000,
      });
    } else {

      this.serv.addDemConv(this.formDemConv.value).subscribe((data: any) => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Modifier avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        this.getConvSups(); // This will refresh both listConv and filteredListConv
        this.modalRef.close()
      })
    }
  }
  getMotifSusp() {
    this.serv.findAllMotif().subscribe((data: any) => {
      this.listMotif = data
      this.columnMotif = [
        { key: "cod_mot_susp", label: "Motif" },
        { key: "lib_mot_susp", label: "Libelle" },
      ]
    })
  }

  onSelectedValue(item: any) {
    this.libMotif = item.lib_mot_susp
    this.formOffConv.patchValue({
      cod_mot_susp: item.cod_mot_susp
    })
    console.log('this.formOffConv :', this.formOffConv.value)
  }


  saveOffSusp() {
    const formatDates = (form: any, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value);
        form.get(field)?.setValue(value);
        formatted.push(value);
        return formatted;
      }, []);

    const demConv = formatDates(this.formDemConv, [
      "dat_susp",

    ]);

    if (this.formOffConv.get('etat_off_dem')?.value == 'S' && this.formOffConv.get('dat_susp')?.value == null) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Il faut Saisir la date du suspention !!!",
        showConfirmButton: false,
        timer: 2000,
      });
    } else if (this.formOffConv.get('etat_off_dem')?.value == 'V' && this.formOffConv.get('dat_susp')?.value != null) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Vous devez suspendre la demande au paravant !!!",
        showConfirmButton: false,
        timer: 2000,
      });
    }
    else if (this.formOffConv.get('etat_off_dem')?.value == 'V' && this.formOffConv.get('cod_mot_susp')?.value != null) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Vous devez suspendre la demande au paravant !!!",
        showConfirmButton: false,
        timer: 2000,
      });
    }
    else if (this.formOffConv.get('etat_off_dem')?.value == 'S' && this.formOffConv.get('cod_mot_susp')?.value == null) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "If faut Saisir le motif de suspention !!!",
        showConfirmButton: false,
        timer: 2000,
      });
    }
    else {

      this.serv.addOffDemConv(this.formOffConv.value).subscribe((data: any) => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Modifier avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        this.serv.getOffConv(data.cod_conv, data.mat_pers).subscribe((data: any) => {
          this.listOffConv = data
        })
        this.modalRefConv.close()
      })
    }
  }
}
