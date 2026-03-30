import { Component, OnInit } from "@angular/core";
import { AdherentService, Personnel } from "../../adherent.service";
import { TokenStorage } from "src/app/account/token-storage.service";
import { FormBuilder, FormGroup } from "@angular/forms";
import { SaveService } from "src/app/shared/Service/save.service";

@Component({
  selector: "app-edition-adhesion-mutuelle",
  templateUrl: "./edition-adhesion-mutuelle.component.html",
  styleUrls: ["./edition-adhesion-mutuelle.component.scss"]
})
export class EditionAdhesionMutuelleComponent implements OnInit {
  personnelList: Personnel[] = [];
  formAdherent: FormGroup;
  columnsSearch: any[] = [];

  constructor(
    private personnelService: AdherentService,
    private token: TokenStorage,
    private fb: FormBuilder,
    private saveService: SaveService
  ) {
    this.formAdherent = this.fb.group({
      mat_pers_deb: [""],
      num_retr_deb: [""],
      nom_deb: [""],
      mat_pers_fin: [""],
      num_retr_fin: [""],
      nom_fin: [""],
    });
  }

  ngOnInit() {
    this.getAllPersonnel(this.token.getUser().codSoc);
    this.saveService.registerPrintCallback(() => this.printReport());


  }

  onSelectedVMat(item: Personnel) {
    this.formAdherent.patchValue({
      mat_pers_deb: item.mat_pers,
      num_retr_deb: item.num_retr,
      nom_deb: item.nom
    });
  }

  onSelectedVMat2(item: Personnel) {
    this.formAdherent.patchValue({
      mat_pers_fin: item.mat_pers,
      num_retr_fin: item.num_retr,
      nom_fin: item.nom
    });
  }
  getAllPersonnel(soc: string) {
    this.personnelService.getAllPersonnel(soc).subscribe((data) => {
      this.personnelList = data;
      this.columnsSearch = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "nom", label: "Nom & Prénom" },
        { key: "num_retr", label: "N° CNRPS" },
      ];
    });
  }

  getPersonnelByMatPers(soc: string, matPers: string) {
    this.personnelService
      .getPersonnelByMatPers(soc, matPers)
      .subscribe((data) => {
        this.personnelList = data;
      });
  }

  printReport() {

    this.personnelService.editionAdhesionMutuell('64', this.token.getUser().codSoc, this.formAdherent.get('mat_pers_deb')?.value, this.formAdherent.get('mat_pers_fin')?.value).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/pdf' });
        var filURL = URL.createObjectURL(file);
        window.open(filURL)
        //////////////clear print call back
        this.saveService.clearPrintCallback();

      },
      (error) => {
        console.log(error);


        this.saveService.clearPrintCallback()
      }
    );
  }
}



