import { Component } from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { AdherentService } from "../adherent.service";
import { PaginationService } from "src/app/core/services/pagination.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SaveService } from "src/app/shared/Service/save.service";
import Swal from "sweetalert2";
import { TokenStorage } from "src/app/account/token-storage.service";

@Component({
  selector: "app-maj-certif-fam",
  templateUrl: "./maj-certif-fam.component.html",
  styleUrl: "./maj-certif-fam.component.scss",
})
export class MajCertifFamComponent {
  p: any
  pCertif: any
  formAdherent!: FormGroup;
  formCertif!: FormGroup;
  isSearch: boolean = true;
  listPersonnel: any[] = [];
  listEnfants: any[] = [];
  listCertifFam: any[] = [];
  columnsSearch: any[] = [];
  save!: boolean;
  isDisabled!: boolean;
  edit: boolean = true;
  breadCrumbItems!: Array<{}>;
  constructor(
    private fb: FormBuilder,
    private adherentServ: AdherentService,
    public service: PaginationService,
    private modalService: NgbModal,
    private saveService: SaveService,
    private tokenStorage: TokenStorage
  ) {
    this.formAdherent = this.fb.group({
      cod_soc: [""],
      mat_pers: [""],
      cod_assur: [""],
      nom_pers: [""],
      etat_act: [""],
      dat_emb: [""],
      cod_sit: [""],
      nbr_enf: [""],
      num_assur: [""],
      dat_ass: [""],
    });
    this.formCertif = this.fb.group({
      CertifFam: this.fb.array([
        this.fb.group({
          cod_soc: [""],
          mat_pers: [""],
          num_fam: [""],
          annee_certif: [""],
          dat_certif: [""],
          annee_scol: [""],
          obs: [""],
        }),
      ]), // FormArray for dynamic children
    });
  }
  ngOnInit(): void {
    this.getPersonnels();

    this.saveService.registerSaveCallback(() => this.saveCertif());

    this.formCertif.valueChanges.subscribe(() => {
      this.isDisabled = this.formCertif.pristine;
      this.saveService.setDisabled(!this.isDisabled);
    });
  }

  getPersonnels() {
    this.adherentServ.getPersonnels().subscribe((data) => {
      console.log("personnel", data);
      this.listPersonnel = data;
      this.columnsSearch = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "nom_pers", label: "Nom" },
        { key: "pren_pers", label: "Prénom" },
        { key: "num_retr", label: "Id unique" },
        { key: "cin", label: "CIN" },
        { key: "cod_lieu_geog", label: "Service" },
      ];
    });
  }

  search(item: any) {
    this.formAdherent.patchValue({
      cod_soc: item.cod_soc,
      mat_pers: item.mat_pers,
      num_assur: item.num_assur,
      nom_pers: item.nom_pers,
      pren_pers: item.pren_pers,
      dat_emb: item.dat_emb,
      cod_sit: item.cod_sit,
      nbr_enf: item.nbr_enf,
      etat_act: item.etat_act,
      dat_ass: item.dat_ass,
    });

    this.adherentServ.getEnfants(item.cod_soc, item.mat_pers).subscribe(
      (data: any) => {
        this.listEnfants = data;

        console.log("this.dataRows", this.listEnfants);
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );
  }
  saveCertif() {
    const certifFamArray = (this.formCertif.get("CertifFam") as FormArray)


    certifFamArray.controls.forEach((control) => {
      control.get("num_fam")?.patchValue(certifFamArray.value[0].num_fam);
    });
    this.adherentServ.AddCertifFamille(certifFamArray.value).subscribe((data) => {
      console.log("data :", data);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ajouter avec succès !",
        showConfirmButton: false,
        timer: 2000,
      });
    });
  }
  onSort(column: any) {
    this.listEnfants = this.service.onSort(column, this.listEnfants);
  }
  onSortCertif(column: any) {
    this.listCertifFam = this.service.onSort(column, this.listCertifFam);
  }

  // Filtres par colonne (loupe de chaque en-tête) : clés préfixées « e_ » (enfants) et « c_ » (certificats)
  showFilters: { [key: string]: boolean } = {};
  searchz: { [key: string]: string } = {};
  toggleFilter(key: string) {
    this.showFilters[key] = !this.showFilters[key];
    if (!this.showFilters[key]) this.searchz[key] = '';
  }
  filterList(list: any[], prefix: string): any[] {
    const keys = Object.keys(this.searchz).filter(k => k.startsWith(prefix) && this.searchz[k]);
    if (!keys.length) return list || [];
    return (list || []).filter(row =>
      keys.every(k => String(row[k.substring(prefix.length)] ?? '').toLowerCase().includes(this.searchz[k].toLowerCase()))
    );
  }

  get CertifFam(): FormArray {
    return this.formCertif.get("CertifFam") as FormArray;
  }
  addCertifFam() {
    this.CertifFam.push(
      this.fb.group({
        cod_soc: [""],
        mat_pers: [""],
        num_fam: [""],
        annee_certif: [""],
        dat_certif: [""],
        annee_scol: [""],
        obs: [""],
      })
    );
  }

  removeEnfant(index: number) {
    this.CertifFam.removeAt(index);
  }
  openModalTab(content: any) {
    this.edit = true;

    //this.formCertif.reset()
    this.modalService.open(content, { size: "xl", centered: true });
  }

  editDataGet(id: any, data: any, content: any) {
    this.edit = false;
    this.modalService.open(content, { size: "lg", centered: true });

    (this.formCertif.get("CertifFam") as FormArray).controls[0]
      .get("cod_soc")
      ?.patchValue(data.cod_soc),
      (this.formCertif.get("CertifFam") as FormArray).controls[0]
        .get("mat_pers")
        ?.patchValue(data.mat_pers),
      (this.formCertif.get("CertifFam") as FormArray).controls[0]
        .get("num_fam")
        ?.patchValue(data.num_fam),
      (this.formCertif.get("CertifFam") as FormArray).controls[0]
        .get("annee_certif")
        ?.patchValue(data.annee_certif),
      (this.formCertif.get("CertifFam") as FormArray).controls[0]
        .get("dat_certif")
        ?.patchValue(data.dat_certif),
      (this.formCertif.get("CertifFam") as FormArray).controls[0]
        .get("annee_scol")
        ?.patchValue(data.annee_scol),
      (this.formCertif.get("CertifFam") as FormArray).controls[0]
        .get("obs")
        ?.patchValue(data.obs);
  }
  getCertifEnf(event: any) {
    const formArray = this.formCertif.get("CertifFam") as FormArray;
    formArray.controls.forEach((control) => {
      control.get("num_fam")?.patchValue(event.num_fam);
    });

    this.adherentServ
      .getCertifEnf(event.mat_pers, event.num_fam)
      .subscribe((data) => {
        console.log("data", data);
        this.listCertifFam = data;
      });
  }
  deleteId: any;
  confirm(content: any, id: any) {
    console.log("annee:", id)
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDelete() {
    this.adherentServ.deleteCertifFamille(this.deleteId.cod_soc, this.deleteId.num_fam, this.deleteId.mat_pers, this.deleteId.annee_certif).subscribe(data => {
      this.adherentServ
        .getCertifEnf(this.deleteId.mat_pers, this.deleteId.num_fam)
        .subscribe((data) => {
          console.log("data", data);
          this.listCertifFam = data;
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
  validatelistCertifFam(): void {
    // Fonction pour formater les dates d'un FormGroup donné
    const formatDates = (form: FormGroup, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value); // Appel de votre méthode pour formater la date
        form.get(field)?.setValue(value); // Met à jour la valeur formatée dans le champ
        if (value) {
          formatted.push(value); // Ajoute la valeur formatée au tableau
        }
        return formatted;
      }, []);

    // Récupère le FormArray 'enfants'
    const CertifFamArray = this.formCertif.get("CertifFam") as FormArray;

    if (CertifFamArray && CertifFamArray.valid) {
      // Parcourt chaque FormGroup dans le FormArray
      CertifFamArray.controls.forEach((formGroup: AbstractControl) => {
        if (formGroup instanceof FormGroup) {
          formatDates(formGroup, ["dat_certif"]);
          formGroup
            .get("mat_pers")
            ?.patchValue(this.formAdherent.get("mat_pers")?.value);
          formGroup.get("cod_soc")?.patchValue(this.tokenStorage.getUser().codSoc);
        }
      });
      console.log("filteredDataRows :", CertifFamArray);

      // Mise à jour des lignes de données avec les valeurs du FormArray
      this.listCertifFam = [...CertifFamArray.value];
    }
  }


}
