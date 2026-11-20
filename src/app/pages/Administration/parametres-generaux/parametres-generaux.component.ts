import { Component, OnInit } from '@angular/core';
import { AdminService } from '../Admin.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-parametres-generaux',
  templateUrl: './parametres-generaux.component.html',
  styleUrls: ['./parametres-generaux.component.scss']
})
export class ParametresGenerauxComponent implements OnInit {

  parametres: any[] = [];
  isEditMode: boolean = false;
  isLoading: boolean = false;

  currentParam: any = this.initParam();

  constructor(
    private adminService: AdminService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.chargerParametres();
  }

  initParam(): any {
    return {
      idParam: null,
      libParam: '',
      commentaireParam: '',
      valeur1: '',
      valeur2: '',
      valeur3: '',
      type: 1
    };
  }

  chargerParametres(): void {
    this.isLoading = true;
    this.adminService.getAllParamGrh().subscribe({
      next: (data) => {
        this.parametres = data || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les paramètres généraux'
        });
      }
    });
  }

  ouvrirModal(content: any, param?: any): void {
    if (param) {
      this.isEditMode = true;
      this.currentParam = { ...param };
    } else {
      this.isEditMode = false;
      this.currentParam = this.initParam();
    }
    this.modalService.open(content, { size: 'lg', backdrop: 'static' });
  }

  enregistrer(modal: any): void {
    if (!this.currentParam.libParam || !this.currentParam.valeur1) {
      Swal.fire({
        icon: 'warning',
        title: 'Champs obligatoires',
        text: 'Le code/libellé et la valeur 1 sont obligatoires.'
      });
      return;
    }

    if (this.isEditMode) {
      this.adminService.updateParamGrh(this.currentParam.idParam, this.currentParam).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Paramètre mis à jour avec succès.',
            timer: 1500,
            showConfirmButton: false
          });
          this.chargerParametres();
          modal.close();
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur de validation',
            text: this.extraireMessageErreur(err)
          });
        }
      });
    } else {
      this.adminService.addParamGrh(this.currentParam).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Nouveau paramètre ajouté avec succès.',
            timer: 1500,
            showConfirmButton: false
          });
          this.chargerParametres();
          modal.close();
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur de validation',
            text: this.extraireMessageErreur(err)
          });
        }
      });
    }
  }

  extraireMessageErreur(err: any): string {
    if (!err) return 'Erreur de communication avec le serveur.';
    if (err.error && typeof err.error.message === 'string' && err.error.message.trim().length > 0) {
      return err.error.message;
    }
    if (typeof err.error === 'string' && err.error.trim().length > 0) {
      return err.error;
    }
    if (err.error && typeof err.error.text === 'string' && err.error.text.trim().length > 0) {
      return err.error.text;
    }
    if (typeof err.message === 'string' && err.message.trim().length > 0) {
      return err.message;
    }
    return 'Format ou valeur invalide pour ce type de paramètre.';
  }

  supprimer(param: any): void {
    Swal.fire({
      title: 'Confirmation',
      text: `Êtes-vous sûr de vouloir supprimer le paramètre "${param.libParam}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((res) => {
      if (res.isConfirmed) {
        this.adminService.deleteParamGrh(param.idParam).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Supprimé',
              text: 'Paramètre supprimé avec succès.',
              timer: 1500,
              showConfirmButton: false
            });
            this.chargerParametres();
          },
          error: () => {
            Swal.fire('Erreur', 'Impossible de supprimer ce paramètre.', 'error');
          }
        });
      }
    });
  }

  getTypeLibelle(type: number): string {
    switch (type) {
      case 1: return 'Nombre';
      case 2: return 'Montant / Décimal';
      case 3: return 'Texte';
      case 4: return 'Booléen (Oui/Non)';
      case 5: return 'Date';
      default: return 'Général';
    }
  }
}
