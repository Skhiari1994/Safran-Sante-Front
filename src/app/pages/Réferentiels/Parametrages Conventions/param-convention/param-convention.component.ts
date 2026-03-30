import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { ParamAdherentService } from '../../Parametrages Adherent/param-adherent.service';
import { ParamConventionService } from '../param-convention.service';

@Component({
  selector: 'app-param-convention',
  templateUrl: './param-convention.component.html',
  styleUrl: './param-convention.component.scss'
})
export class ParamConventionComponent {
  columnTitles: { [key: string]: string } = {

    cod_conv: 'Code conv',
    lib_conv: 'Libelle',
    dat_conv: 'Date conv',
    ref_contrat: 'Ref Contrat',
  };

  columnTitlesOff: { [key: string]: string } = {

    cod_off: 'Code off',
    lib_off: 'Libelle',
    dat_off: 'Date Off',
    mnt_off: 'Montant Off',
    categ_off: 'Catégorie'
  };
  pCertif: number = 1; // Pagination pour le premier tableau
  pSusp: number = 1;
  formConv!: FormGroup;
  formOffConv!: FormGroup;
  isSearch: boolean = true;
  listPersonnel: any[] = [];
  breadCrumbItems!: Array<{}>;

  listEnfants: any[] = [];
  listConv: any[] = [];
  listOffConv: any[] = [];
  columnsSearch: any[] = [];
  save!: boolean;
  isDisabled!: boolean;
  edit: boolean = true;
  constructor(
    private fb: FormBuilder,

    private serv: ParamConventionService,
    public service: PaginationService,
    private modalService: NgbModal,
    private saveService: SaveService,
    private tokenStorage: TokenStorage,
    private cdr: ChangeDetectorRef
  ) {
    this.formConv = this.fb.group({
      cod_conv: [""],
      lib_conv: [""],
      lib_conv_a: [""],
      dat_conv: [""],
      ref_contrat: [""],


    });
    this.formOffConv = this.fb.group({
      offConv: this.fb.array([
        this.fb.group({
          cod_conv: [""],
          cod_off: [""],
          lib_off: [""],
          dat_off: [""],
          mnt_off: [""],
          categ_off: [""],

        }),
      ]), // FormArray for dynamic children
    });
  }
  ngOnInit(): void {
    this.getConvention()
  }

  saveConvention() {
    this.formConv.patchValue({
      dat_conv: this.formatDateDDMMYYYY(this.formConv.get('dat_conv')?.value)
    })
    this.serv.addConvention(this.formConv.value).subscribe((data) => {
      console.log("data :", data);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.serv
        .getConvention()
        .subscribe((data) => {
          console.log("data", data);
          this.listConv = data;
        });
    });
  }

  saveOffre() {
    const posteFormArray = this.formOffConv.get("offConv") as FormArray;

    // Ensure cod_conv is set for all rows
    posteFormArray.controls.forEach((control) => {
      control.get("cod_conv")?.patchValue(posteFormArray.value[0].cod_conv);
    });

    // Reformat date fields to 'dd/MM/yyyy'
    const formattedData = posteFormArray.value.map((item: any) => {
      return {
        ...item,
        dat_off: this.formatDateDDMMYYYY(item.dat_off),
      };
    });

    console.log("Formatted Data Sent:", formattedData);

    this.serv.addOffConvention(formattedData).subscribe((data) => {
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });

      this.serv.getOffConvention(posteFormArray.value[0].cod_conv).subscribe((data) => {
        this.listOffConv = data;
      });
    });
  }

  // Add this helper method to your component
  formatDatep(date: any): string {
    if (!date) return ''; // avoid formatting null/undefined

    const d = new Date(date);
    if (isNaN(d.getTime())) {
      console.error("Invalid date:", date);
      return ''; // avoid formatting if the date is invalid
    }

    const day = ('0' + d.getDate()).slice(-2);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  }


  get offConv(): FormArray {
    return this.formOffConv.get("offConv") as FormArray;
  }
  addOffConv() {
    this.offConv.push(
      this.fb.group({
        cod_conv: [""],
        cod_off: [""],
        lib_off: [""],
        dat_off: [""],
        mnt_off: [""],
        categ_off: [""],

      })
    );
  }

  removeEnfant(index: number) {
    this.offConv.removeAt(index);
  }
  openModalTab(content: any) {
    this.edit = true;

    //this.formCertif.reset()
    this.modalService.open(content, { size: "xl", centered: true });
  }
  editDataGetConv(id: any, data: any, content: any) {
    console.log(data)
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });

    this.formConv.patchValue({
      cod_conv: data.cod_conv,
      lib_conv: data.lib_conv,
      lib_conv_a: data.lib_conv_a,
      dat_conv: data.dat_conv ? data.dat_conv.replace(/\//g, '') : '',
      ref_contrat: data.ref_contrat,

    })
  }
  editDataGet(id: any, data: any, content: any) {
    console.log(data)
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });

    (this.formOffConv.get("offConv") as FormArray).controls[0]
      .get("cod_conv")
      ?.patchValue(data.cod_conv),
      (this.formOffConv.get("offConv") as FormArray).controls[0]
        .get("cod_off")
        ?.patchValue(data.cod_off),
      (this.formOffConv.get("offConv") as FormArray).controls[0]
        .get("lib_off")
        ?.patchValue(data.lib_off),
      (this.formOffConv.get("offConv") as FormArray).controls[0]
        .get("dat_off")
        ?.patchValue(data.dat_off ? data.dat_off.replace(/\//g, '') : ''),
      (this.formOffConv.get("offConv") as FormArray).controls[0]
        .get("mnt_off")
        ?.patchValue(data.mnt_off),
      (this.formOffConv.get("offConv") as FormArray).controls[0]
        .get("categ_off")
        ?.patchValue(data.categ_off)
  }

  onSort(column: any) {
    this.listConv = this.service.onSort(column, this.listConv);
  }
  onSort1(column: any) {
    this.listOffConv = this.service.onSort(column, this.listOffConv);
  }
  getConvention() {


    this.serv
      .getConvention()
      .subscribe((data) => {
        console.log("data", data);
        this.listConv = data;
      });
  }
  selectedRow: number | null = null;

  getOff(event: any, index: number) {
    this.selectedRow = index;
    const formArray = this.formOffConv.get("offConv") as FormArray;
    formArray.controls.forEach((control) => {
      control.get("cod_conv")?.patchValue(event.cod_conv);
    });
    console.log('formArray :', formArray.value)
    this.serv
      .getOffConvention(event.cod_conv)
      .subscribe((data) => {
        console.log("data", data);
        this.listOffConv = data;
      });
  }
  deleteId: any;
  confirm(content: any, id: any) {
    console.log("annee:", id)
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDelete() {
    this.serv.deleteConvention(this.deleteId.cod_conv).subscribe(data => {
      this.getConvention()

    })
  }

  ConfirmDeleteOff() {
    this.serv.deleteOffConv(this.deleteId.cod_conv, this.deleteId.cod_off).subscribe(data => {
      this.serv
        .getOffConvention(this.deleteId.cod_conv)
        .subscribe((data) => {
          console.log("data", data);
          this.listOffConv = data;
        });

    })
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
  validatelistPoste(): void {
    // Fonction pour formater les dates d'un FormGroup donné


    // Récupère le FormArray 'enfants'
    const CertifFamArray = this.formOffConv.get("offConv") as FormArray;

    if (CertifFamArray && CertifFamArray.valid) {
      // Parcourt chaque FormGroup dans le FormArray
      CertifFamArray.controls.forEach((formGroup: AbstractControl) => {
        if (formGroup instanceof FormGroup) {

          formGroup
            .get("cod_gouv")
            ?.patchValue(this.formConv.get("cod_conv")?.value);
          formGroup.get("cod_soc")?.patchValue(this.tokenStorage.getUser().codSoc);
        }
      });
      console.log("filteredDataRows :", CertifFamArray);

      // Mise à jour des lignes de données avec les valeurs du FormArray
      //this.listCertifFam = [...CertifFamArray.value];
    }
  }
  onPageChangeForGouv(page: number): void {
    console.log("Pagination pour le tableau 1 : ", page);

    this.pCertif = page;
    this.cdr.detectChanges();

  }

  onPageChangeForPoste(page: number): void {
    console.log("Pagination pour le tableau 2 : ", page);
    this.pSusp = page;
    this.cdr.detectChanges();

  }

  getTotalPages(): number {
    return Math.ceil(this.listConv.length / 9);
  }
  getTotalPagesOff(): number {
    return Math.ceil(this.listOffConv.length / 9);
  }

  formatDateDDMMYYYY(rawDate: string): string {
    if (!rawDate || rawDate.length !== 8) return rawDate;

    const day = rawDate.substring(0, 2);
    const month = rawDate.substring(2, 4);
    const year = rawDate.substring(4, 8);

    return `${day}/${month}/${year}`;
  }
}


