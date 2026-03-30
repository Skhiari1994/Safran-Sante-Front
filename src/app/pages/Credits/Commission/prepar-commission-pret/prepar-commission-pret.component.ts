import { Component } from '@angular/core';
import { CommissionService } from '../commission.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { SaveService } from 'src/app/shared/Service/save.service';
import { PaginationService } from 'src/app/core/services/pagination.service';

@Component({
  selector: 'app-prepar-commission-pret',
  templateUrl: './prepar-commission-pret.component.html',
  styleUrl: './prepar-commission-pret.component.scss'
})
export class PreparCommissionPretComponent {
  p: number = 1;
  commissionForm!: FormGroup
  detailCommissionForm!: FormGroup
  listCommission: any[] = [];
  listDetailCommission: any[] = [];
  columnsCommission: any[] = [];
  isSearch: boolean = true;
  currentIndex: number = 0;
  save!: boolean;
  isDisabled!: boolean;
  breadCrumbItems!: Array<{}>;

  constructor(private serv: CommissionService, private fb: FormBuilder, public service: PaginationService, private saveService: SaveService) {

    this.commissionForm = this.fb.group({
      cod_soc: ['01'],
      num_comm: [''],
      dat_comm: [''],
      ref_comm: [''],
      dat_deb_comm: [''],
      dat_fin_comm: [''],
      dat_real: [''],
      cod_etat_pret: [{ value: 'P', disabled: true }],
      typ_etat: [''],
      observ: ['']

    })

    this.detailCommissionForm = this.fb.group({
      cod_soc: ['01'],
      num_comm: [''],
      mat_pers: [''],
      num_dem_pret: [''],
      resultat_comm: [''],
      mnt_acc: [''],
      dat_effet: [''],
      nbr_ech_acc: [''],
      delai_grace: [''],
      nbr_tranche: [''],
      cod_rejet: [''],
      cod_etat_pret: [''],
      typ_etat: [''],
      obs_comm: ['']


    })
  }

  ngOnInit() {
    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch = canSearch

    })

    this.saveService.canSave$.subscribe((canSave) => {
      this.save = canSave;
      if (this.save) {
        this.addCommission();
      }
      this.getCommission()
    });

    this.saveService.registerSaveCallback(() => this.addCommission());

    this.saveService.add$.subscribe((reset) => {
      if (reset) {
        this.commissionForm.reset(); // Reset the form
        this.detailCommissionForm.reset();
        this.commissionForm.get('cod_soc')?.setValue('01')

      }
    });
    this.commissionForm.valueChanges.subscribe(() => {
      this.isDisabled = this.commissionForm.pristine;
      this.saveService.setDisabled(!this.isDisabled);
    });
    //this.loadData(this.currentIndex)
  }
  getCommission() {
    this.serv.getCommission().subscribe(
      (data: any) => {
        this.listCommission = data
        this.columnsCommission = [
          { key: "num_comm", label: "Num comm" },
          { key: "dat_comm", label: "Date commission" },
          { key: "ref_comm", label: "Ref comm" },
        ];
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );
  }
  search(item: any) {
    console.log("item :", item)
    this.commissionForm.patchValue({
      cod_soc: item.cod_soc,
      num_comm: item.num_comm,
      dat_comm: item.dat_comm,
      ref_comm: item.ref_comm,
      dat_deb_comm: item.dat_deb_comm,
      dat_fin_comm: item.dat_fin_comm,
      dat_real: item.dat_real,
      cod_etat_pret: item.cod_etat_pret,
      typ_etat: item.typ_etat,
      obser: item.obser
    });

    this.serv.getDetailCommission(item.cod_soc, item.num_comm).subscribe(
      (data: any) => {
        this.listDetailCommission = data

        this.detailCommissionForm.patchValue({
          cod_soc: data.cod_soc,
          num_comm: data.num_comm,
          mat_pers: data.mat_pers,
          num_dem_pret: data.num_dem_pret,
          resultat_comm: data.resultat_comm,
          mnt_acc: data.mnt_acc,
          dat_effet: data.dat_effet,
          nbr_ech_acc: data.nbr_ech_acc,
          delai_grace: data.delai_grace,
          nbr_tranche: data.nbr_tranche,
          cod_rejet: data.cod_rejet,
          cod_etat_pret: data.cod_etat_pret,
          typ_etat: data.typ_etat,
          obs_comm: data.obs_comm
        });
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );


  }
 addCommission() {
  const formatDates = (form: FormGroup, fields: string[]) =>
    fields.forEach(field => {
      const control = form.get(field);
      const value = this.formatDate(control?.value);
      control?.setValue(value);
    });

  this.commissionForm.get('cod_soc')?.setValue('01');

  formatDates(this.commissionForm, [
    'dat_deb_comm',
    'dat_fin_comm',
    'dat_comm'
  ]);

  const payload = this.commissionForm.getRawValue();  // IMPORTANT

  console.log("FINAL PAYLOAD :", payload);

  this.serv.AddCommission(payload).subscribe(() => {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Commission ajouté avec succès",
      showConfirmButton: false,
      timer: 2000,
    });
    this.getCommission();
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
goToFirst() {
  this.currentIndex = 0;
  console.log("this.currentIndex",this.currentIndex)
  this.loadData(this.currentIndex);

}

goToLast() {
  this.currentIndex =this.listCommission.length - 1;
  console.log("this.currentIndex",this.currentIndex)
  this.loadData(this.currentIndex);

}
  preparCommission() {

    console.log(this.commissionForm.value)
    const formatDates = (form: FormGroup, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value);
        form.get(field)?.setValue(value);
        if (value) {
          formatted.push(value);
        }
        return formatted;
      }, []);

    formatDates(this.commissionForm, [
      'dat_deb_comm',
      'dat_fin_comm',

    ]);

    this.serv.PreparCommission(this.commissionForm.get('cod_soc')?.value, this.commissionForm.get('dat_deb_comm')?.value,
      this.commissionForm.get('dat_fin_comm')?.value, this.commissionForm.get('num_comm')?.value).
      subscribe((data: any) => {
        Swal.fire({
          position: "center",
          icon: "warning",
          title: data.message,
          showConfirmButton: true,
        });
      })
  }

  loadData(index: number): void {
    const currentData = this.listCommission[index];
    this.commissionForm.patchValue(currentData);

    this.serv.getDetailCommission(this.listCommission[index].cod_soc, this.listCommission[index].num_comm).subscribe(
      (data: any) => {
        this.listDetailCommission = data

        this.detailCommissionForm.patchValue({
          cod_soc: data.cod_soc,
          num_comm: data.num_comm,
          mat_pers: data.mat_pers,
          num_dem_pret: data.num_dem_pret,
          resultat_comm: data.resultat_comm,
          mnt_acc: data.mnt_acc,
          dat_effet: data.dat_effet,
          nbr_ech_acc: data.nbr_ech_acc,
          delai_grace: data.delai_grace,
          nbr_tranche: data.nbr_tranche,
          cod_rejet: data.cod_rejet,
          cod_etat_pret: data.cod_etat_pret,
          typ_etat: data.typ_etat,
          obs_comm: data.obs_comm
        });
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );

  }

  navigate(direction: number): void {
    this.currentIndex += direction;
    this.loadData(this.currentIndex);
  }
  onSort(column: any) {
    console.log("this.dataRows :", this.commissionForm);
    this.listCommission = this.service.onSort(column, this.listCommission);
  }

  onPageChangeForGouv(page: number): void {
    console.log("Pagination pour le tableau 1 : ", page);

    this.p = page;

  }
}
