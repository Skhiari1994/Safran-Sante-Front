import { Component } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { AssurService } from "../assur.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { PaginationService } from "src/app/core/services/pagination.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-param-acte-medicaux",
  templateUrl: "./param-acte-medicaux.component.html",
  styleUrl: "./param-acte-medicaux.component.scss",
})
export class ParamActeMedicauxComponent {
  breadCrumbItems!: Array<{}>;
  listeActeFilter: any[] = [];
  columnTypeActe: any[] = [];
  formActe!: FormGroup;
  pSusp: any;
  deleteId: any;
  isSearch: boolean = true;
  listeActe: any[] = [];
  listTypeActe : any[] = [];
  columnActe: any[] = [];
  codActe?: string;
  typActe:string=''
  libTypeActe:string=''
  save!: boolean;
  isDisabled!: boolean;
  edit: boolean = true;

  columnTitles: { [key: string]: string } = {
    type_act: "Type acte",
    abrv_act: "Abréviation acte",
    lib_act: "Libellé acte",
    dat_acte: "Date acte",
    parente: "Parenté",
    ctr_duree: "Controle durée",
    sexe: "Sexe",
    imput_plaf: "Imputation plafond",
  };

  constructor(
    private fb: FormBuilder,
    private serv: AssurService,
    private modalService: NgbModal,
    public service: PaginationService
  ) {
    this.formActe = this.fb.group({
      type_act:[''],
      abrv_act:[''],
      lib_act:[''],
      a_indice:[''],
      mtt_acte:[''],
      dat_acte:[''],
      taux_act:[''],
      plafonne:[''],
      plafond:[''],
      verif_piece:[''],
      nat_act:[''],
      verif_vign:[''],
      lib_act_a:[''],
      duree_act:[''],
      plafon_prest:[''],
      ctr_duree:[''],
      sexe:[''],
      parente:[''],
      imput_plaf:[''],
      
    });
  }

  ngOnInit() {
    this.getAllActe();
    this.getTypeActe();
   
  }


  getTypeActe() {
    this.serv.getTypeActe().subscribe((data:any) => {
      console.log("data :",data)
      this.listTypeActe = data;
      this.columnTypeActe=[
        { key: "type_acte", label: "Type acte" },
        { key: "lib_type_acte", label: "Libelle" },
      ]
 
     });
  }

  getAllActe() {
    this.serv.getAllActe().subscribe((data: any) => {
      this.listeActe = data;
      this.listeActeFilter=data
    });
  }

  onSort(column: any) {
    this.listeActe = this.service.onSort(column, this.listeActeFilter);
  }
  searchz: any = {
    type_act: "",
    abrv_act: "",
    lib_act: "",
    dat_acte: "",
    parente: "",
    ctr_duree: "",
    sexe: "",
    imput_plaf: "",
 
  };

  applyFilter() {
    this.listeActe = this.listeActeFilter.filter((row) => {
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
  
    this.formActe.reset();  
    this.typActe = ''; 
    this.libTypeActe = '';
  
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
    this.serv.deleteActe(this.deleteId.abrv_act).subscribe((data) => {
      this.getAllActe();
    });
  }
  editDataGet(data: any, content: any) {
   
   console.log(data)
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });
    this.typActe=data.type_act
    this.formActe.get("type_act")?.patchValue(data.type_act);
    this.formActe.get("abrv_act")?.patchValue(data.abrv_act);
    this.formActe.get("lib_act")?.patchValue(data.lib_act);
    this.formActe.get("dat_acte")?.patchValue(data.dat_acte);
    this.formActe.get("parente")?.patchValue(data.parente);
    this.formActe.get("ctr_duree")?.patchValue(data.ctr_duree);
    this.formActe.get("sexe")?.patchValue(data.sexe);
    this.formActe.get("imput_plaf")?.patchValue(data.imput_plaf);
  }

  onSelectedValueActe(item: any) {
    this.formActe.patchValue({
      type_act: item.type_act,
    });
  }

  saveTypeActe() {
    this.serv.AddActe(this.formActe.value).subscribe((data) => {
      console.log("data :", data);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
      this.getAllActe();
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

  onSelectedValueTypeActe(event:any){
    this.libTypeActe=event.lib_type_acte
    this.formActe.patchValue({
      type_act:event.type_acte
    })
  }

  formatDate2(event: any) {
    let value = event.target.value.replace(/\D/g, ''); // Supprime tout ce qui n'est pas un chiffre
  
    if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
  
    event.target.value = value; // Met à jour la valeur de l'input
  }
}
