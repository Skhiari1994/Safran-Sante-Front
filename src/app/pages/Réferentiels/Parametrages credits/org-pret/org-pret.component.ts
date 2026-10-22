import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { CreditService } from '../credit.service';

@Component({
  selector: 'app-org-pret',
  templateUrl: './org-pret.component.html',
  styleUrl: './org-pret.component.scss'
})
export class OrgPretComponent {
  breadCrumbItems!: Array<{}>;

  p: number = 1; // Pagination pour le premier tableau
  pCertif: number = 1;
  formOrgPret!: FormGroup;
  isSearch: boolean = true;
  listOrg: any[] = [];
  columnsSearch: any[] = [];
  save!: boolean;
  isDisabled!: boolean;
  edit: boolean = true;
  listAffectation: any[] = [];
  columnAffect: any[] = [];
  codAffectVal: string = ""
  libAffect: string = ""
  constructor(
    private fb: FormBuilder,
    private serv: CreditService,
    public service: PaginationService,
    private modalService: NgbModal,
    private saveService: SaveService,
    private tokenStorage: TokenStorage,
    private cdr: ChangeDetectorRef,
    private adherentServ: AdherentService
  ) {
    this.formOrgPret = this.fb.group({
      org_pret: [''],
      typ_org: [''],
      lib_organisme: [''],
      adr_organisme: [''],
      cod_post: [''],
      ville: [''],
      resp_org: [''],
      rib_org: [''],
      typ_detach: [''],
      num_cpt: [''],
      cod_tier: [''],

    });

  }
  ngOnInit(): void {
    this.getOrgPrêt()
  }

  onSort(column: any) {
    this.listOrg = this.service.onSort(column, this.listOrg);
  }




  editDataGet(data: any, content: any) {
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });
    this.formOrgPret.patchValue({

      org_pret:data.org_pret,
      typ_org:data.typ_org,
      lib_organisme:data.lib_organisme,
      adr_organisme:data.adr_organisme,
      cod_post:data.cod_post,
      ville:data.ville,
      resp_org:data.resp_org,
      rib_org:data.rib_org,
      typ_detach:data.typ_detach,
      num_cpt:data.num_cpt,
      cod_tier:data.cod_tier,


    })

  }



  getOrgPrêt() {


    this.serv
      .getOrgPret()
      .subscribe((data) => {
        console.log("data", data);
        this.listOrg = data;
      });
  }
  deleteId: any;
  confirm(content: any, id: any) {
    console.log("annee:", id)
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDelete() {
    this.serv.deleteOrgPret(this.deleteId.org_pret).subscribe(data => {
      this.serv
        .getOrgPret()
        .subscribe((data) => {
          console.log("data", data);
          this.listOrg = data;
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

  onPageChangeForGouv(page: number): void {
    console.log("Pagination pour le tableau 1 : ", page);

    this.p = page;
    this.cdr.detectChanges();

  }

  onPageChangeForPoste(page: number): void {
    console.log("Pagination pour le tableau 2 : ", page);
    this.pCertif = page;
    this.cdr.detectChanges();

  }
  saveEtatPret() {
    console.log("data :", this.formOrgPret.value);
    this.serv.AddOrgPret(this.formOrgPret.value).subscribe((data) => {
      console.log("data :", data);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.serv.getOrgPret().subscribe((data: any) => {
        this.listOrg = data
      })
    });
  }


  openModalTab(content: any) {
    this.edit = true;

    this.formOrgPret.reset({ typ_org: '' })
    this.modalService.open(content, { size: "xl", centered: true });
  }

}






