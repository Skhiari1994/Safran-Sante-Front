import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { Personnel, AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { IndemnitesService } from 'src/app/pages/Indemnites/indemnites.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { EditionService } from '../edition.service';

@Component({
  selector: 'app-edition-recap-remb-adh',
  templateUrl: './edition-recap-remb-adh.component.html',
  styleUrl: './edition-recap-remb-adh.component.scss'
})
export class EditionRecapRembAdhComponent {
  personnelList: Personnel[] = [];
  formAdherent: FormGroup;
  columnsSearch: any[] = [];
  currentMonth: any
  @ViewChild('requiredInput') requiredInputRef!: ElementRef;
  constructor(
    private editionService: EditionService,
    private token: TokenStorage,
    private fb: FormBuilder,
    private saveService: SaveService,
  ) {
    this.formAdherent = this.fb.group({
      mat_pers: [''],
      nom_deb: [''],
      annee: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.saveService.registerPrintCallback(() => this.printReport());
  }


  onSelectedVMat(item: Personnel) {
    this.formAdherent.patchValue({
      mat_pers: item.mat_pers,
      nom_deb: item.nom
    });
  }



  getAllPersonnel(item: any) {
    console.log(item.target.value)
    this.editionService.getPersonnelByMatPers(this.token.getUser().codSoc, item.target.value).subscribe((data) => {
      this.personnelList = data;
      this.columnsSearch = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "nom", label: "Nom & Prénom" },
        { key: "num_retr", label: "N° CNRPS" },
      ];
    });
    console.log(this.personnelList)
  }

  onBlur() {
    const control = this.formAdherent.get('annee');
    if (control && control.errors?.['required']) {
      Swal.fire({
        icon: 'warning',
        title: 'Champ obligatoire',
        text: 'Ce champ ne peut pas être vide.',
        allowOutsideClick: false
      }).then(() => {
        // Remettre le focus sur le champ si vide
        this.requiredInputRef.nativeElement.focus();
      });
    }
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

    if (this.formAdherent.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Champ requis',
        text: 'Veuillez remplir l année.'
      }).then(() => {
        // Remettre le focus après la fermeture de Swal
        this.requiredInputRef.nativeElement.focus();
      });
      return;
    }

    console.log(this.formAdherent.value)

    this.editionService.editionListRembadh(
      '110',
      this.token.getUser().codSoc,
      this.formAdherent.get('mat_pers')?.value,
      this.formAdherent.get('annee')?.value,

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




