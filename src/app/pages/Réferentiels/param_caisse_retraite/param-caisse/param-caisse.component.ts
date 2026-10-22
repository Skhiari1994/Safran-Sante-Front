import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { ParamAdherentService } from '../../Parametrages Adherent/param-adherent.service';
import { CaisseRetrService } from '../caisse-retr.service';

@Component({
  selector: 'app-param-caisse',
  templateUrl: './param-caisse.component.html',
  styleUrl: './param-caisse.component.scss'
})
export class ParamCaisseComponent {
  pSusp: any;
  listParamCaisse: any[] = []
  listParamCaisseFiltred: any[] = []
  edit: boolean = false;
  formParamCaisse: FormGroup
  breadCrumbItems!: Array<{}>;

  save!: boolean;
  isDisabled!: boolean;
  deleteId: any;
  constructor(private serv: CaisseRetrService, public service: PaginationService, private modalService: NgbModal, private fb: FormBuilder,
    private saveService: SaveService, private tokenStorage: TokenStorage
  ) {
    this.formParamCaisse = this.fb.group({
      cod_param: [''],
      mnt_init_cotis: [''],
      mnt_cotis: [''],
      mnt_aug_cotis: [''],
      nbr_ann_aug: [''],
      mnt_init_prim: [''],
      mnt_prime: [''],
      mnt_aug_prim: [''],
      nbr_aug_prim: [''],
      dat_der_maj: [''],
      dat_fin_maj: [''],


    });
  }
  ngOnInit(): void {


    this.getParamCaisse()
  }
  getParamCaisse() {
    this.serv.getParamCaisse().subscribe(data => {
      this.listParamCaisse = data;
      this.listParamCaisseFiltred = data;
      // Définir les colonnes dynamiques du tableau

    });
  }
  showFilters: { [key: string]: boolean } = {};

  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }

  columnTitles: { [key: string]: string } = {
    cod_param:'Code',
mnt_init_cotis:'Init Cotis',
mnt_cotis:'Mnt Cotis',
mnt_aug_cotis:'Aug Cotis',
nbr_ann_aug:'Ann Aug',
mnt_init_prim:'Init Prim',
mnt_prime:'Mnt Prim',
mnt_aug_prim:'Aug prim',
nbr_aug_prim:'Ann prim',
dat_der_maj:'Date début',
dat_fin_maj:'Date fin',

  };

  onSort(column: any) {
    this.listParamCaisse = this.service.onSort(
      column,
      this.listParamCaisse
    );
  }
  searchz: any = {
    cod_natp: "",
    lib_nat: "",
    lib_nat_a: "",
  };

  sanitizeDateInput(value: string): void {
    // Sanitize the input to allow only numbers
    const sanitizedValue = value.replace(/[^0-9]/g, '');

    // Update the model
    this.searchz.dat_dem = sanitizedValue;
    console.log("value :", sanitizedValue);

    // Apply the filter logic
    this.applyFilter();
  }
  applyFilter() {
    this.listParamCaisse = this.listParamCaisseFiltred.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
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
  saveParamCaisse() {
        const formatDates = (form: any, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value);
        form.get(field)?.setValue(value);
        formatted.push(value);
        return formatted;
      }, []);

    const demConv = formatDates(this.formParamCaisse, [
      "dat_der_maj",
      "dat_fin_maj"
    ]);
    console.log(this.formParamCaisse.value)
    this.serv
      .AddParamCaisse(this.formParamCaisse.value)
      .subscribe((data) => {
        console.log("data :", data);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouter avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        this.getParamCaisse();
      });
  }

  openModalTab(content: any) {
    this.edit = false;
    console.log("edit :", this.edit)
    //this.formCertif.reset()
    this.modalService.open(content, { size: "xl", centered: true });
    this.formParamCaisse.reset()


  }


  editDataGet(id: any, data: any, content: any) {


    this.edit = true
    console.log("edit :", this.edit)
    this.modalService.open(content, { size: "lg", centered: true });

    this.formParamCaisse.get("cod_param")?.patchValue(data.cod_param);
    this.formParamCaisse.get("mnt_init_cotis")?.patchValue(data.mnt_init_cotis);
    this.formParamCaisse.get("mnt_cotis")?.patchValue(data.mnt_cotis);
   this.formParamCaisse.get("mnt_aug_cotis")?.patchValue(data.mnt_aug_cotis);
    this.formParamCaisse.get("nbr_ann_aug")?.patchValue(data.nbr_ann_aug);
    this.formParamCaisse.get("mnt_init_prim")?.patchValue(data.mnt_init_prim);
     this.formParamCaisse.get("mnt_prime")?.patchValue(data.mnt_prime);
    this.formParamCaisse.get("mnt_aug_prim")?.patchValue(data.mnt_aug_prim);
    this.formParamCaisse.get("nbr_aug_prim")?.patchValue(data.nbr_aug_prim);
     this.formParamCaisse.get("dat_der_maj")?.patchValue(data.dat_der_maj);
    this.formParamCaisse.get("dat_fin_maj")?.patchValue(data.dat_fin_maj);  
  }

  validatelistDepartPers(): void {
    // Function to format dates within a FormGroup for specified fields


    // Check if `formReintegPers` is a valid FormGroup
    if (this.formParamCaisse instanceof FormGroup) {
      // Format the specified date fields

      // Update `listDepart` with the form values
      this.listParamCaisse = [
        this.formParamCaisse.getRawValue(),
        ...this.listParamCaisse
      ];
    } else {
      console.error("formReintegPers is not a valid FormGroup.");
    }
  }
  confirm(content: any, id: any) {
    console.log("annee:", id)
    this.deleteId = id.cod_param
    this.modalService.open(content, { centered: true });
    console.log("annee:", id.cod_natp)
  }

  deleteNationalite() {
    console.log("ok", this.deleteId)
    this.serv.deleteParamCaisse(this.deleteId).subscribe((data: any) => {

      this.getParamCaisse()
      this.modalService.dismissAll();
    })
  }
}

