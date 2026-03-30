import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { IndemnitesService } from 'src/app/pages/Indemnites/indemnites.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { Personnel, AdherentService } from '../../adherent.service';

@Component({
  selector: 'app-list-carte-adherent',
  templateUrl: './list-carte-adherent.component.html',
  styleUrl: './list-carte-adherent.component.scss'
})
export class ListCarteAdherentComponent {
  personnelList: Personnel[] = [];
  formAdherent: FormGroup;
  columnsSearch: any[] = [];
  currentMonth: any
  listCorps: any[] = [];
  mois: any
  natDontList: any[] = [];
  columnsNatDon: any[] = [];
  listLieu: any[] = [];
  columnsLieu: any[] = [];
  listTypeDepart: any[] = [];
  columnsTypDepart: any[] = [];
  libLieu: string = ''
  codLieuVal: string = ''
  libTypDepart: string = ''
  codTypDepartVal: string = ''
  constructor(
    private personnelService: AdherentService,
    private token: TokenStorage,
    private fb: FormBuilder,
    private saveService: SaveService,
    private serv: IndemnitesService
  ) {
    this.formAdherent = this.fb.group({
      mat_pers_deb: [''],
      nom_deb: [''],
      mat_pers_fin: [''],
      nom_fin: [''],
      etat_cart: [''],
      perdu: [''],
      nat_carte: [''],
    });
  }

  ngOnInit() {
    this.getAllPersonnel(this.token.getUser().codSoc);
    this.saveService.registerPrintCallback(() => this.printReport());
  }


  onSelectedVMat(item: Personnel) {
    this.formAdherent.patchValue({
      mat_pers_deb: item.mat_pers,
      nom_deb: item.nom
    });
  }

  onSelectedVMat2(item: Personnel) {
    this.formAdherent.patchValue({
      mat_pers_fin: item.mat_pers,

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

  printReport() {
    Swal.fire({
      title: 'Chargement en cours...',
      html: 'Veuillez patienter pendant la génération du rapport.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });



    console.log(this.formAdherent.value)

    this.personnelService.editionListCarteSoin(
      '109',
      this.token.getUser().codSoc,
      this.formAdherent.get('mat_pers_deb')?.value,
      this.formAdherent.get('mat_pers_fin')?.value,
      this.formAdherent.get('nat_cart')?.value,
      this.formAdherent.get('perdu')?.value,
      this.formAdherent.get('etat_cart')?.value,

    ).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);

        const a = document.createElement('a');
        a.href = fileURL;

        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `List_Carte_Soin_${formattedDate}.pdf`;

        a.click();

        // Nettoyage
        URL.revokeObjectURL(fileURL);

        Swal.close();
      },
      (error) => {
        console.log(error);

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Échec de la génération du rapport.'
        });
      }
    );
  }





}



