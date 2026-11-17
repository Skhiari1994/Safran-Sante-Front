import { Component } from '@angular/core';
import { AdminService } from '../Admin.service';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaginationService } from "src/app/core/services/pagination.service";
@Component({
  selector: 'app-parametrage-rapports',
  templateUrl: './parametrage-rapports.component.html',
  styleUrl: './parametrage-rapports.component.scss'
})
export class ParametrageRapportsComponent {
  rapports: any[] = [];
  parametres: any[] = [];
  selectedCodRap: any = null;
  breadCrumbItems!: Array<{}>;
  rapportsFiltrer: any[] = [];
  isModalOpen = false;  
  pSusp: any;
  private rapportVide(): any {
    return {
    lib_rap: '',
    abrv_rap: '',
    lib_rap_jsp: '',
    bean_name: '',
    path_report: '',
    titre: '',
    iterator_name: '',
    ndecision: null,
    notif_mail: 'N',
    message: '',
    subject: '',
    second_envoi: '',
    minute_envoi: '',
    heure_envoi: '',
    jour_envoi: '',
    mois_envoi: '',
    annee_envoi: ''
    };
  }
  nouveauRapport: any = this.rapportVide();

  constructor(private rapportServ: AdminService,
    private modalService: NgbModal,
    private service: PaginationService
  ) {}

  ngOnInit(): void {
    this.getAllRapport();
 
  }

  searchz: any = {
    cod_rap: '',
    lib_rap_jsp: '',
    path_report: '',
    titre: '',

  };

  columnTitles: { [key: string]: string } = {
    cod_rap: "Code rapport",
    lib_rap_jsp: "Libellé rapport",
    path_report: "Path",
    titre:"Titre"
    
  };

  aSupprimer: { type: 'rapport' | 'parametre', id: any, libelle: string } | null = null;

  confirmerSuppression(content: any, type: 'rapport' | 'parametre', id: any, libelle: string) {
    this.aSupprimer = { type, id, libelle };
    this.modalService.open(content, { centered: true, size: 'sm' });
  }

  supprimerConfirme() {
    if (!this.aSupprimer) return;
    const { type, id } = this.aSupprimer;
    if (type === 'rapport') this.deleteRapport(id);
    else this.deleteParametreById(id);
  }

  openModalTab(content1: any) {
    this.modalService.open(content1, { size: "xl", centered: true });
  }

  getAllRapport() {
    this.rapportServ.getAllRapport().subscribe((data) => {
      this.rapports = data;
      this.rapportsFiltrer = [...data];
     
    });
  }

  getParametreByIdRapport(cod_rap: any): void {
    this.selectedCodRap = cod_rap; 
    this.rapportServ.getAllParametreByIdRapport(cod_rap).subscribe((data) => {
      this.parametres = data ?? [];
      console.log("Paramètres du rapport :", this.parametres);
    });
  }

  deleteParametreById(cod_param: any): void {
    this.rapportServ.deleteParametreById(cod_param).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Supprimé',
              text: 'Le paramètre a été supprimé avec succès.',
              timer: 2000,
              showConfirmButton: false,
            });
            if (this.selectedCodRap) {
              this.getParametreByIdRapport(this.selectedCodRap);
            }
          },
          error: (err) => {
            console.error('Erreur lors de la suppression du paramètre', err);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Impossible de supprimer ce paramètre.',
            });
          },
        });
  }
  

  deleteRapport(id_rap: any): void {
    this.rapportServ.deleteRapport(id_rap).subscribe({
      next: () => {
        this.getAllRapport();
        Swal.fire({
          icon: 'success',
          title: 'Supprimé',
          text: 'Rapport supprimé avec succès.',
        });
      },
      error: (error) => {
          Swal.fire({
            icon: 'warning',
            title: 'Suppression impossible',
            text: 'Tu dois d\'abord supprimer les paramètres associés avant de supprimer ce rapport.',
            confirmButtonText: 'OK'
          });
      }
    });
  }

  ajouterRapport(): void {
    this.rapportServ.createRapport(this.nouveauRapport).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Rapport créé avec succès !'
        });
        this.getAllRapport(); 
        this.nouveauRapport = this.rapportVide(); 
        this.modalService.dismissAll(); 
      },
      error: (err) => {
        console.error('Erreur création rapport', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la création du rapport.'
        });
      }
    });
  }
  
  

  ajouterParametre(parametreForm: any): void {
    if (!this.selectedCodRap) {
      Swal.fire('Erreur', 'Aucun rapport sélectionné.', 'error');
      return;
    }
  
    const nouveauParametre = {
      ...parametreForm,
      codRap: this.selectedCodRap 
    };
  
    this.rapportServ.createParametre(nouveauParametre).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Ajouté',
          text: 'Le paramètre a été ajouté avec succès.',
          timer: 2000,
          showConfirmButton: false,
        });
        this.getParametreByIdRapport(this.selectedCodRap); 
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout du paramètre', err);
        Swal.fire('Erreur', 'Impossible d\'ajouter le paramètre.', 'error');
      }
    });
  }

  onSort(column: any) {
    this.rapports = this.service.onSort(column, this.rapportsFiltrer);
  }

  applyFilter() {
    this.rapports = this.rapportsFiltrer.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
  }

  showFilters: { [key: string]: boolean } = {};

  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }

  getTotalPages(): number {
    return Math.ceil(this.rapports.length / 6);
  }
  
}
