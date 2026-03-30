import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { CaisseRetrService } from '../caisse-retr.service';
@Component({
  selector: 'app-motif-rembour',
  templateUrl: './motif-rembour.component.html',
  styleUrl: './motif-rembour.component.scss'
})
export class MotifRembourComponent {
  pSusp: any;
  listMotifRembour: any[] = []
  listMotifRembourFiltred: any[] = []
  edit: boolean = false;
  formMotifRembour: FormGroup
  breadCrumbItems!: Array<{}>;

  save!: boolean;
  isDisabled!: boolean;
  deleteId: any;
  constructor(private serv: CaisseRetrService, public service: PaginationService, private modalService: NgbModal, private fb: FormBuilder,
    private saveService: SaveService, private tokenStorage: TokenStorage
  ) {
    this.formMotifRembour = this.fb.group({
      cod_remb: [''],
      lib_remb: [''],
      benef_prime: [''],
      benef_droi: [''],
      taux_prime: [''],



    });
  }
  ngOnInit(): void {


    this.getMotifRemb()
  }
  getMotifRemb() {
    this.serv.getAllMotifRembour().subscribe(data => {
      this.listMotifRembour = data;
      this.listMotifRembourFiltred = data;
      // Définir les colonnes dynamiques du tableau

    });
  }
  showFilters: { [key: string]: boolean } = {};

  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }

  columnTitles: { [key: string]: string } = {
    cod_remb: 'Code Remb',
    lib_remb: 'Libelle remboursement',
    benef_prime: 'Benef Prime',
    benef_droi: 'Benef Droi',
    taux_prime: 'Taux Prime',  
  };

  onSort(column: any) {
    this.listMotifRembour = this.service.onSort(
      column,
      this.listMotifRembour
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
    this.listMotifRembour = this.listMotifRembourFiltred.filter((row) => {
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
 
    console.log(this.formMotifRembour.value)
    this.serv
      .addMotifRembour(this.formMotifRembour.value)
      .subscribe((data) => {
        console.log("data :", data);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouter avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        this.getMotifRemb();
      });
  }

  openModalTab(content: any) {
    this.edit = false;
    console.log("edit :", this.edit)
    //this.formCertif.reset()
    this.modalService.open(content, { size: "xl", centered: true });
    this.formMotifRembour.reset()


  }


  editDataGet(id: any, data: any, content: any) {


    this.edit = true
    console.log("edit :", this.edit)
    this.modalService.open(content, { size: "lg", centered: true });

    this.formMotifRembour.get("cod_remb")?.patchValue(data.cod_remb);
    this.formMotifRembour.get("lib_remb")?.patchValue(data.lib_remb);
    this.formMotifRembour.get("benef_prime")?.patchValue(data.benef_prime); 
    this.formMotifRembour.get("benef_droi")?.patchValue(data.benef_droi);
    this.formMotifRembour.get("taux_prime")?.patchValue(data.taux_prime); 
  }

  validatelistDepartPers(): void {
    // Function to format dates within a FormGroup for specified fields


    // Check if `formReintegPers` is a valid FormGroup
    if (this.formMotifRembour instanceof FormGroup) {
      // Format the specified date fields

      // Update `listDepart` with the form values
      this.listMotifRembour = [
        this.formMotifRembour.getRawValue(),
        ...this.listMotifRembour
      ];
    } else {
      console.error("formReintegPers is not a valid FormGroup.");
    }
  }
  confirm(content: any, id: any) { 
    this.deleteId = id.cod_remb
    this.modalService.open(content, { centered: true }); 
  }

  deleteNationalite() {
    console.log("ok", this.deleteId)
    this.serv.deleteMotifRembour(this.deleteId).subscribe((data: any) => {

      this.getMotifRemb()
      this.modalService.dismissAll();
    })
  }
}

