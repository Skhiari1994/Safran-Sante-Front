import { Component } from '@angular/core';
import { AdherentService } from '../../adherent.service';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SaveService } from 'src/app/shared/Service/save.service';
import { IndemnitesService } from 'src/app/pages/Indemnites/indemnites.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-liste-adherent-enfant',
  templateUrl: './liste-adherent-enfant.component.html',
  styleUrl: './liste-adherent-enfant.component.scss'
})
export class ListeAdherentEnfantComponent {

  formAdherent: FormGroup;

  constructor(
    private personnelService: AdherentService,
    private token: TokenStorage,
    private fb: FormBuilder,
    private saveService: SaveService, 
  ) {
    this.formAdherent = this.fb.group({
       age_deb: [''],
       age_fin: [''],
       
    });
  }

  ngOnInit() {
     this.saveService.registerPrintCallback(() => this.printReport()); 
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
  
  
  
 
  
    this.personnelService.editionListEnfant(
      '108',
      this.token.getUser().codSoc,
      this.formAdherent.get('age_deb')?.value,
      this.formAdherent.get('age_fin')?.value, 
    ).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
  
        const a = document.createElement('a');
        a.href = fileURL;
  
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `List_des_enfants_${formattedDate}.pdf`;
  
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
