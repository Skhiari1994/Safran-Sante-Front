import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { ParamConventionService } from '../param-convention.service';

@Component({
  selector: 'app-param-motif-susp',
  templateUrl: './param-motif-susp.component.html',
  styleUrl: './param-motif-susp.component.scss'
})
export class ParamMotifSuspComponent {
  columnTitles: { [key: string]: string } = {

    cod_mot_susp: 'Code motif',
    lib_mot_susp: 'Libelle', 
  };


  pCertif: number = 1; // Pagination pour le premier tableau
  pSusp: number = 1;
  formMotif!: FormGroup;
  isSearch: boolean = true;
  breadCrumbItems!: Array<{}>;
  listMotif: any[] = [];
  columnsSearch: any[] = [];
  save!: boolean;
  isDisabled!: boolean;
  edit: boolean = true;
  constructor(
    private fb: FormBuilder,

    private serv: ParamConventionService,
    public service: PaginationService,
    private modalService: NgbModal, 
    private cdr: ChangeDetectorRef
  ) {
    this.formMotif = this.fb.group({
      cod_mot_susp: [''],
      lib_mot_susp: [''],



    });

  }
  ngOnInit(): void {
    this.getMotifSusp()
  }

  saveMotifSup() {
    this.serv.addMotifSusp(this.formMotif.value).subscribe((data) => {
       Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.serv
        .getMotifSusp()
        .subscribe((data) => {
           this.listMotif = data;
        });
    });
  }




  openModalTab(content: any) {
    this.edit = true;

     this.modalService.open(content, { size: "xl", centered: true });
  }
  editDataGetConv(id: any, data: any, content: any) {
     this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });

    this.formMotif.patchValue({
      cod_mot_susp: data.cod_mot_susp,
      lib_mot_susp: data.lib_mot_susp


    })
  }

  onSort(column: any) {
    this.listMotif = this.service.onSort(column, this.listMotif);
  }

  getMotifSusp() {


    this.serv
      .getMotifSusp()
      .subscribe((data) => {
         this.listMotif = data;
      });
  }

  deleteId: any;
  confirm(content: any, id: any) {
     this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDelete() {
    this.serv.deleteMotif(this.deleteId.cod_mot_susp).subscribe(data => {
      this.getMotifSusp()

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

  onPageChangeForGouv(page: number): void {
 
    this.pCertif = page;
    this.cdr.detectChanges();

  }

  onPageChangeForPoste(page: number): void {
     this.pSusp = page;
    this.cdr.detectChanges();

  }

  getTotalPages(): number {
    return Math.ceil(this.listMotif.length / 9);
  }

  formatDateDDMMYYYY(rawDate: string): string {
    if (!rawDate || rawDate.length !== 8) return rawDate;

    const day = rawDate.substring(0, 2);
    const month = rawDate.substring(2, 4);
    const year = rawDate.substring(4, 8);

    return `${day}/${month}/${year}`;
  }
}



