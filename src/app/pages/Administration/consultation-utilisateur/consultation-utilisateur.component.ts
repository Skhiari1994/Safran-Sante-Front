import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { AdminService } from '../Admin.service';

@Component({
  selector: 'app-consultation-utilisateur',
  templateUrl: './consultation-utilisateur.component.html',
  styleUrl: './consultation-utilisateur.component.scss'
})
export class ConsultationUtilisateurComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  utilisateurs: any[] = [];
  listRoles: any[] = [];
  loading = true;
  erreur = false;

  edition: { useId: number, matricule: string, nom: string, prenom: string, roleIds: number[] } | null = null;
  enregistrement = false;
  private modalRef?: NgbModalRef;

  private readonly COULEURS_ROLES: { [role: string]: string } = {
    'ADMIN': 'bg-danger-subtle text-danger',
    'RH/SOCIAL': 'bg-info-subtle text-info',
    'ADHÉRENT': 'bg-success-subtle text-success',
    'CHEF': 'bg-warning-subtle text-warning',
  };
  private readonly COULEURS_AUTRES = ['bg-primary-subtle text-primary', 'bg-secondary-subtle text-secondary', 'bg-dark-subtle text-dark'];

  constructor(private adminServ: AdminService, private modalService: NgbModal, private token: TokenStorageService) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Espace Admin' },
      { label: 'Consultation utilisateur', active: true }
    ];
    this.charger();
    this.adminServ.getRole().subscribe((roles: any) => this.listRoles = roles || []);
  }

  charger(): void {
    this.loading = true;
    this.adminServ.getUtilisateursConsultation().subscribe({
      next: (data: any[]) => {
        this.utilisateurs = data || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement utilisateurs', err);
        this.erreur = true;
        this.loading = false;
      }
    });
  }

  roles(u: any): string[] {
    return (u?.role || '').split(',').map((r: string) => r.trim()).filter(Boolean);
  }

  couleurRole(role: string): string {
    const connu = this.COULEURS_ROLES[role.toUpperCase()];
    if (connu) return connu;
    let h = 0;
    for (const c of role) h = (h * 31 + c.charCodeAt(0)) % 997;
    return this.COULEURS_AUTRES[h % this.COULEURS_AUTRES.length];
  }

  estUtilisateurConnecte(u: any): boolean {
    return String(u?.matricule) === String(this.token.getUser()?.useLogin);
  }

  ouvrirModification(u: any, content: TemplateRef<any>): void {
    this.edition = {
      useId: u.useId,
      matricule: u.matricule,
      nom: u.nom || '',
      prenom: u.prenom || '',
      roleIds: (u.roleIds || '').split(',').filter(Boolean).map((r: string) => Number(r)),
    };
    this.modalRef = this.modalService.open(content, { centered: true });
  }

  enregistrer(): void {
    if (!this.edition || !this.edition.nom.trim() || !this.edition.prenom.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nom et prénom obligatoires', confirmButtonColor: '#3085d6' });
      return;
    }
    this.enregistrement = true;
    const { useId, nom, prenom, roleIds } = this.edition;
    this.adminServ.modifierUtilisateur(useId, { nom: nom.trim(), prenom: prenom.trim(), roleIds }).subscribe({
      next: () => {
        this.enregistrement = false;
        this.modalRef?.close();
        this.charger();
        Swal.fire({ icon: 'success', title: 'Utilisateur modifié', timer: 1500, showConfirmButton: false });
      },
      error: (err: any) => {
        console.error('Erreur modification utilisateur', err);
        this.enregistrement = false;
        Swal.fire({ icon: 'error', title: 'Modification impossible' });
      }
    });
  }

  supprimer(u: any): void {
    Swal.fire({
      title: 'Supprimer cet utilisateur ?',
      html: `Matricule <b>${u.matricule}</b> – ${u.nom ?? ''} ${u.prenom ?? ''}<br>Cette action est irréversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    }).then(result => {
      if (!result.isConfirmed) return;
      this.adminServ.supprimerUtilisateur(u.useId).subscribe({
        next: () => {
          this.charger();
          Swal.fire({ icon: 'success', title: 'Utilisateur supprimé', timer: 1500, showConfirmButton: false });
        },
        error: (err: any) => {
          console.error('Erreur suppression utilisateur', err);
          Swal.fire({ icon: 'error', title: 'Suppression impossible' });
        }
      });
    });
  }
}
