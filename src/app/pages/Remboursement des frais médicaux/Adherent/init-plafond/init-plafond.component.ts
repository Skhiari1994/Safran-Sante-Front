import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { Personnel } from 'src/app/pages/Adherent/adherent.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { EditionService } from '../../Editions/edition.service';
import { AdherentService } from '../adherent.service';
import { forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
@Component({
  selector: 'app-init-plafond',
  templateUrl: './init-plafond.component.html',
  styleUrl: './init-plafond.component.scss'
})
export class InitPlafondComponent {
  personnelListDeb: Personnel[] = [];
  personnelListFin: Personnel[] = [];
  formAdherent: FormGroup;
  columnsSearch: any[] = [];
  currentMonth: any
  constructor(
    private editionService: EditionService,
    private token: TokenStorage,
    private fb: FormBuilder,
    private saveService: SaveService,
    private serv: AdherentService
  ) {
    this.formAdherent = this.fb.group({
      mat_pers_deb: [''],
      nom_deb: [''],
      mat_pers_fin: [''],
      nom_fin: [''],
      annee: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.getPersonnelDeb()
    this.getPersonnelFin()
  }


  onSelectedVMat(item: Personnel) {
    this.formAdherent.patchValue({
      mat_pers_deb: item.mat_pers,
      nom_deb: item.nom
    });

    this.editionService.getPersBultCnamFin(this.token.getUser().codSoc, this.formAdherent.get('mat_pers_deb')?.value).subscribe((data) => {
      this.personnelListFin = data;
      this.columnsSearch = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "nom", label: "Nom & Prénom" },
        { key: "num_retr", label: "N° CNRPS" },
      ];
    });
  }

  onSelectedVMatFin(item: Personnel) {
    this.formAdherent.patchValue({
      mat_pers_fin: item.mat_pers,
      nom_fin: item.nom
    });

    this.editionService.getPersBultCnamDeb(this.token.getUser().codSoc, this.formAdherent.get('mat_pers_fin')?.value).subscribe((data) => {
      this.personnelListDeb = data;
      this.columnsSearch = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "nom", label: "Nom & Prénom" },
        { key: "num_retr", label: "N° CNRPS" },
      ];
    });
  }

  getPersonnelDeb() {
    this.serv.getPersBultCnamDeb(this.token.getUser().codSoc).subscribe((data) => {
      this.personnelListDeb = data;
      this.columnsSearch = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "nom", label: "Nom & Prénom" },
        { key: "num_retr", label: "N° CNRPS" },
      ];
    });
    console.log(this.personnelListDeb)
  }

  getPersonnelFin() {
    this.serv.getPersBultCnamDeb(this.token.getUser().codSoc).subscribe((data) => {
      this.personnelListDeb = data;
      this.columnsSearch = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "nom", label: "Nom & Prénom" },
        { key: "num_retr", label: "N° CNRPS" },
      ];
    });
    console.log(this.personnelListDeb)
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
  calculePlafond() {
    Swal.fire({
      title: 'Chargement en cours...',
      html: '<div id="swal-status">Initialisation...</div>',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const codSoc = this.token.getUser().codSoc;
    const annee = this.formAdherent.get('annee')?.value;
    const matDeb = this.formAdherent.get('mat_pers_deb')?.value;
    const matFin = this.formAdherent.get('mat_pers_fin')?.value;

    const updateSwalMessage = (message: string) => {
      const statusDiv = document.getElementById('swal-status');
      if (statusDiv) statusDiv.innerHTML += `<br>${message}`;
    };

    const plafondCnam$ = this.serv.calPlafondCnam(codSoc, annee, matDeb, matFin).pipe(
      tap(() => updateSwalMessage('✅ Plafond CNAM calculé')),
      catchError(err => {
        updateSwalMessage('❌ Erreur lors du calcul du Plafond CNAM');
        return of(null);
      })
    );

    const plafondMutuelle$ = this.serv.calPlafondMutuelle(codSoc, annee, matDeb, matFin).pipe(
      tap(() => updateSwalMessage('✅ Plafond Mutuelle calculé')),
      catchError(err => {
        updateSwalMessage('❌ Erreur lors du calcul du Plafond Mutuelle');
        return of(null);
      })
    );

    const majPecEnf$ = this.serv.majPecEnf(codSoc, annee, matDeb, matFin).pipe(
      tap(() => updateSwalMessage('✅ PEC enfants mise à jour')),
      catchError(err => {
        updateSwalMessage('❌ Erreur lors de la mise à jour PEC enfants');
        return of(null);
      })
    );

    forkJoin([plafondCnam$, plafondMutuelle$, majPecEnf$]).subscribe(() => {
      updateSwalMessage('<br><b>Toutes les opérations sont terminées.</b>');
      Swal.hideLoading();
      setTimeout(() => {

      }, 2000);
    });
  }




}







