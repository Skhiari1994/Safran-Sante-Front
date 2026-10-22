import { Component } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { AssurService } from "../assur.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { PaginationService } from "src/app/core/services/pagination.service";
import Swal from "sweetalert2";


@Component({
  selector: 'app-prise-charge-barem-remb',
  templateUrl: './prise-charge-barem-remb.component.html',
  styleUrl: './prise-charge-barem-remb.component.scss'
})
export class PriseChargeBaremRembComponent {
  breadCrumbItems!: Array<{}>;
  listeBaremeFilter: any[] = [];
  columnTypeActe: any[] = [];
  columnFiliere: any[] = [];
  columnActe: any[] = [];
  columnAssuranc: any[] = [];
  formBareme!: FormGroup;
  pSusp: any;
  deleteId: any;

  listeBarameRemb: any[] = [];
  listTypeActe: any[] = [];
  ListeFiliere: any[] = [];
  ListeActe: any[] = [];
  ListeAssurance: any[] = [];

  typActe: string = ''
  codeFiliere: string = ''
  codeActe: string = ''
  codeAssur: string = ''
  libTypeActe: string = ''
  libActe: string = ''
  libAssur: string = ''
  libFiliere: string = ''
  selectedNature: string = '';
  selectedPlafond: string = '';

  edit: boolean = true;
  listeBareme: any[] = [];


  columnTitles: { [key: string]: string } = {
    cod_fil: "Filière",
    abrv_act: "Abrv",
    lib_act: "Acte",
    cod_assur: "Assurance",
    a_indice: "Indice",
    mtt_acte: "Mnt. Acte",
    dat_acte: "Date acte",
    taux_act: "Taux",
    plafonne: "Plafonné",
    plafond: "Plafond",
    verif_piece: "Verif. Pcs",
    nat_act: "Nat. Acte",
    verif_vign: "Verif. Vign",

    plafon_prest: "Plafond Prest.",

  };

  constructor(
    private fb: FormBuilder,
    private serv: AssurService,
    private modalService: NgbModal,
    public service: PaginationService
  ) {
    this.formBareme = this.fb.group({
      cod_fil: [''],
      abrv_act: [''],
      cod_assur: [''],
      a_indice: [false],
      mtt_acte: [''],
      dat_acte: [''],
      taux_act: [''],
      plafonne: [''],
      plafond: [''],
      verif_piece: [false],
      nat_act: [''],
      verif_vign: [false],
      duree_act: [''],
      plafon_prest: [false],
    });
  }

  ngOnInit() {
    this.getAllActe();
    this.getAllAssurance();
    this.getAllFiliere();
    this.getAllBaremRemb();
    this.getTypeActe();

  }



  onNatureChange(value: string) {
    this.selectedNature = value;
  }

  onNatureplafond(value: string) {
    this.selectedPlafond = value;
  }

  getTypeActe() {
    this.serv.getTypeActe().subscribe((data: any) => {

      this.listTypeActe = data;
      this.columnTypeActe = [
        { key: "abrv_act", label: "Type acte" },
        { key: "lib_type_acte", label: "Libelle" },
      ]

    });
  }

  getAllFiliere() {
    this.serv.GetAllFiliere().subscribe((data: any) => {

      this.ListeFiliere = data;
      this.columnFiliere = [
        { key: "cod_fil", label: "Code filière" },
        { key: "lib_fill", label: "Libellé" },
      ]

    });
  }


  getAllActe() {
    this.serv.getAllActe().subscribe((data: any) => {

      this.ListeActe = data;
      console.log("liste des actes", this.ListeActe)
      this.columnActe = [
        { key: "abrv_act", label: "Type acte" },
        { key: "lib_act", label: "Libellé" },
      ]

    });
  }



  getAllAssurance() {
    this.serv.GetAllAssurance().subscribe((data: any) => {

      this.ListeAssurance = data;
      this.columnAssuranc = [
        { key: "cod_assur", label: "Code Assurance" },
        { key: "lib_assur", label: "Libellé" },
      ]

    });
  }



  getAllBaremRemb() {
    this.serv.getAllBaremeRemb().subscribe((data: any) => {
      this.listeBareme = data;
      this.listeBaremeFilter = data

    });
  }

  onSort(column: any) {
    this.listeBareme = this.service.onSort(column, this.listeBaremeFilter);
  }
  searchz: any = {
    cod_fil: '',
    abrv_act: '',
    lib_act: '',
    cod_assur: '',
    a_indice: '',
    mtt_acte: '',
    dat_acte: '',
    taux_act: '',
    plafonne: '',
    plafond: '',
    verif_piece: '',
    nat_act: '',
    verif_vign: '',
    lib_act_a: '',
    duree_act: '',
    plafon_prest: '',
  };

  applyFilter() {
    this.listeBareme = this.listeBaremeFilter.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
  }
  openModalTab(content: any) {
    this.getTypeActe();
    this.edit = true;

    // Réinitialiser le formulaire avec des valeurs par défaut
    this.formBareme.reset({ nat_act: '', plafonne: '' });
    this.formBareme.setValue({
      cod_fil: '',
      abrv_act: '',
      cod_assur: '',
      a_indice: false,
      mtt_acte: '',
      dat_acte: '',
      taux_act: '',
      plafonne: '',
      plafond: '',
      verif_piece: false,
      nat_act: '',
      verif_vign: false,
      duree_act: '',
      plafon_prest: false
    });

    // Réinitialiser les valeurs des variables associées aux champs
    this.codeFiliere = '';
    this.codeActe = '';
    this.codeAssur = '';
    this.libFiliere = '';
    this.libActe = '';
    this.libAssur = '';
    this.selectedNature = '';
    this.selectedPlafond = '';

    this.modalService.open(content, { size: "xl", centered: true });
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

  confirm(content: any, id: any) {
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDelete() {
    this.serv.deleteBaremeRemboursement(this.deleteId.cod_fil, this.deleteId.abrv_act, this.deleteId.cod_assur).subscribe((data) => {
      this.getAllBaremRemb();
    });
  }
  editDataGet(data: any, content: any) {
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });
    this.formBareme.reset({ nat_act: '', plafonne: '' });
  

    // Initialiser les valeurs du formulaire
    this.codeFiliere = data.cod_fil;
    this.codeActe = data.abrv_act;
    this.codeAssur = data.cod_assur;

    this.libFiliere = data.lib_fill;
    this.libActe = data.lib_act;
    this.libAssur = data.lib_assur;

    this.formBareme.patchValue({
      cod_fil: data.cod_fil,
      abrv_act: data.abrv_act,
      cod_assur: data.cod_assur,
      a_indice: data.a_indice === 'O',
      mtt_acte: Number(data.mtt_acte).toFixed(3),
      dat_acte: data.dat_acte,
      taux_act: data.taux_act,
      plafonne: data.plafonne,
      plafond: data.plafond,
      verif_piece: data.verif_piece === 'O',
      nat_act: data.nat_act,
      verif_vign: data.verif_vign === 'O',
      duree_act: data.duree_act,
      plafon_prest: data.plafon_prest === 'O',
    });

    this.selectedNature = data.nat_act;
    this.selectedPlafond = data.plafonne;


  }

  AddBaremeRemb() {

    const formValue = this.formBareme.value;

    formValue.a_indice = formValue.a_indice ? 'O' : 'N';
    formValue.verif_vign = formValue.verif_vign ? 'O' : 'N';
    formValue.verif_piece = formValue.verif_piece ? 'O' : 'N';
    formValue.plafon_prest = formValue.plafon_prest ? 'O' : 'N';

    this.serv.AddBaremeRemb(formValue).subscribe((data) => {

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouté avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.getAllBaremRemb();
    });
  }

  sanitizeDateInput(value: string): void {
    const sanitizedValue = value.replace(/[^0-9]/g, "");
    this.searchz.dat_dem = sanitizedValue;
    this.applyFilter();
  }

  showFilters: { [key: string]: boolean } = {};
  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }

  onSelectedValueTypeActe(event: any) {
    this.libTypeActe = event.lib_type_acte
    this.formBareme.patchValue({
      type_act: event.type_acte
    })
  }

  onSelectedValueFiliere(event: any) {
    this.libFiliere = event.lib_fill;
    this.formBareme.patchValue({
      cod_fil: event.cod_fil,
    });
  }

  onSelectedValueActe(event: any) {
    this.libActe = event.lib_act;
    this.formBareme.patchValue({
      abrv_act: event.abrv_act,
    });
  }

  onSelectedValueAssur(event: any) {
    this.libAssur = event.lib_assur;
    this.formBareme.patchValue({
      cod_assur: event.cod_assur,
    });
  }


  formatDate2(event: any) {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);

    event.target.value = value;
  }
}
