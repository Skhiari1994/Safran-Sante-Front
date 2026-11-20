import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Table } from 'primeng/table';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { AdminService } from '../Admin.service';

@Component({
  selector: 'app-consultation-utilisateur',
  templateUrl: './consultation-utilisateur.component.html',
  styleUrl: './consultation-utilisateur.component.scss'
})
export class ConsultationUtilisateurComponent implements OnInit, AfterViewInit {
  breadCrumbItems!: Array<{}>;
  utilisateurs: any[] = [];
  utilisateursFiltres: any[] = [];
  societes: string[] = [];
  /** libellé de la société filtrée ; '' = toutes ; undefined = pas encore initialisé */
  societeFiltre?: string;
  rolesDisponibles: string[] = [];
  /** nom du rôle filtré ; '' = tous */
  roleFiltre = '';
  listRoles: any[] = [];
  loading = true;
  erreur = false;

  @ViewChild('dt') dt?: Table;
  /** texte de la recherche ; pré-rempli par ?q= (ex. arrivée depuis « Nouvel utilisateur » après un enregistrement) */
  recherche = '';

  // ----- ajout d'un utilisateur (fenêtre) -----
  @ViewChild('ajoutContent') ajoutContent?: TemplateRef<any>;
  ajout: {
    codSoc: string, matricule: string, cin: string, nom: string, prenom: string, email: string,
    roleIds: number[], password: string, confirmation: string
  } | null = null;
  libSocieteAjout = '';
  personnelListe: any[] = [];
  colonnesPersonnel = [
    { key: 'mat_pers', label: 'Matricule' },
    { key: 'cin', label: 'CIN' },
    { key: 'dat_nais', label: 'Date naissance' },
    { key: 'full_name', label: 'Nom & prénom' },
  ];
  /** compte déjà existant ou fiche sans CIN : message affiché sous la sélection, l'enregistrement est alors refusé */
  ficheDejaUtilisateur = false;
  ficheSansCin = false;
  chargementFiche = false;
  chargementPersonnel = false;
  ajoutEnCours = false;
  afficherMotDePasse = false;
  private modalAjoutRef?: NgbModalRef;
  private ouvrirAjoutAuDemarrage = false;
  private readonly MOT_DE_PASSE_FORT = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  private readonly EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  edition: { useId: number, matricule: string, nom: string, prenom: string, roleIds: number[] } | null = null;
  enregistrement = false;
  private modalRef?: NgbModalRef;

  // noms tels qu'ils sont dans la table ROLE (comparés sans casse ni espaces multiples)
  private readonly COULEURS_ROLES: { [role: string]: string } = {
    'ADMIN': 'bg-danger-subtle text-danger',
    'RH': 'bg-info-subtle text-info',
    'UTILISATEUR': 'bg-success-subtle text-success',
    'CHEF': 'bg-warning-subtle text-warning',
    'GESTION DES FRAIS MEDICAUX': 'bg-primary-subtle text-primary',
  };
  private readonly COULEURS_AUTRES = ['bg-primary-subtle text-primary', 'bg-secondary-subtle text-secondary', 'bg-dark-subtle text-dark'];

  constructor(private adminServ: AdminService, private modalService: NgbModal, private token: TokenStorageService,
    private tokenSociete: TokenStorage, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.recherche = this.route.snapshot.queryParamMap.get('q') ?? '';
    this.ouvrirAjoutAuDemarrage = !!this.route.snapshot.data['ouvrirAjout'];
    this.charger();
    this.adminServ.getRole().subscribe((roles: any) => this.listRoles = roles || []);
  }

  ngAfterViewInit(): void {
    // arrivée par l'adresse « Gestion des utilisateurs » (menu) : la fenêtre d'ajout s'ouvre directement
    if (this.ouvrirAjoutAuDemarrage) {
      setTimeout(() => this.ouvrirAjout());
    }
  }

  charger(): void {
    this.loading = true;
    this.adminServ.getUtilisateursConsultation().subscribe({
      next: (data: any[]) => {
        this.utilisateurs = data || [];
        this.societes = Array.from(new Set(this.utilisateurs.map(u => u.libSoc).filter(Boolean))).sort() as string[];
        // au premier chargement, on filtre sur la société choisie au login ; ensuite on garde le choix courant
        if (this.societeFiltre === undefined) {
          const libelle = this.tokenSociete.getLibSociete();
          this.societeFiltre = this.societes.includes(libelle) ? libelle : '';
        }
        this.rolesDisponibles = Array.from(new Set(this.utilisateurs.flatMap(u => this.roles(u)))).sort();
        this.appliquerFiltres();
        this.loading = false;
        // la recherche en cours (ou venue de l'adresse) est ré-appliquée une fois les lignes affichées
        if (this.recherche) {
          setTimeout(() => this.dt?.filterGlobal(this.recherche, 'contains'));
        }
      },
      error: (err: any) => {
        console.error('Erreur chargement utilisateurs', err);
        this.erreur = true;
        this.loading = false;
      }
    });
  }

  /** combine les filtres société et rôle ('' = pas de filtre) */
  appliquerFiltres(): void {
    this.utilisateursFiltres = this.utilisateurs.filter(u =>
      (!this.societeFiltre || u.libSoc === this.societeFiltre) &&
      (!this.roleFiltre || this.roles(u).includes(this.roleFiltre)));
  }

  roles(u: any): string[] {
    return (u?.role || '').split(',').map((r: string) => r.trim()).filter(Boolean);
  }

  couleurRole(role: string): string {
    const connu = this.COULEURS_ROLES[role.replace(/\s+/g, ' ').trim().toUpperCase()];
    if (connu) return connu;
    let h = 0;
    for (const c of role) h = (h * 31 + c.charCodeAt(0)) % 997;
    return this.COULEURS_AUTRES[h % this.COULEURS_AUTRES.length];
  }

  /** classe de couleur stable d'une société (selon sa position dans la liste triée) */
  classeSociete(libSoc: string): string {
    const i = this.societes.indexOf(libSoc);
    return 'soc-' + (i < 0 ? 0 : i % 6);
  }

  estUtilisateurConnecte(u: any): boolean {
    return String(u?.matricule) === String(this.token.getUser()?.useLogin);
  }

  /** Ouvre la fenêtre d'ajout : société = celle de la connexion, le reste est repris de la fiche du personnel choisie. */
  ouvrirAjout(): void {
    if (!this.ajoutContent) return;
    this.ajout = {
      codSoc: this.tokenSociete.getSociete() ?? '', matricule: '', cin: '', nom: '', prenom: '', email: '',
      roleIds: [], password: '', confirmation: ''
    };
    this.libSocieteAjout = this.tokenSociete.getLibSociete();
    this.ficheDejaUtilisateur = false;
    this.ficheSansCin = false;
    this.afficherMotDePasse = false;
    // seul le personnel sans compte est proposé (liste relue à chaque ouverture : un compte vient peut-être d'être créé)
    this.personnelListe = [];
    this.chargementPersonnel = true;
    this.adminServ.getPersonnelSansCompte(this.ajout.codSoc).subscribe({
      next: (data: any[]) => { this.personnelListe = data || []; this.chargementPersonnel = false; },
      error: (err: any) => { console.error('Erreur chargement personnel', err); this.chargementPersonnel = false; }
    });
    this.modalAjoutRef = this.modalService.open(this.ajoutContent, { centered: true, size: 'lg' });
    // ouvert par l'adresse du menu : à la fermeture on revient sur l'adresse de la liste
    this.modalAjoutRef.result.then(() => this.revenirListe(), () => this.revenirListe());
  }

  private revenirListe(): void {
    if (this.ouvrirAjoutAuDemarrage) {
      this.ouvrirAjoutAuDemarrage = false;
      this.router.navigate(['/Admin/UtilisateurConsultation'], { replaceUrl: true, queryParams: this.recherche ? { q: this.recherche } : {} });
    }
  }

  /** Membre du personnel choisi : on reprend sa fiche (matricule, nom, prénom, CIN, e-mail) depuis le serveur. */
  onSelectedPersonnel(item: any): void {
    const mat = item?.mat_pers;
    if (!this.ajout || !mat || mat === this.ajout.matricule) return;
    this.chargementFiche = true;
    this.adminServ.getPersonnelUtilisateur(this.ajout.codSoc, String(mat)).subscribe({
      next: (fiche: any) => {
        this.chargementFiche = false;
        if (!this.ajout) return;
        this.ajout.matricule = fiche.matricule;
        this.ajout.cin = fiche.cin || '';
        this.ajout.nom = fiche.nom || '';
        this.ajout.prenom = fiche.prenom || '';
        this.ajout.email = fiche.email || '';
        this.ficheDejaUtilisateur = !!fiche.dejaUtilisateur;
        this.ficheSansCin = !fiche.cin;
      },
      error: (err: any) => {
        this.chargementFiche = false;
        Swal.fire({ icon: 'error', title: 'Fiche introuvable', text: typeof err === 'string' ? err : 'Impossible de lire la fiche du personnel.' });
      }
    });
  }

  /** Initiales de la carte de la fiche choisie. */
  get initialesAjout(): string {
    const a = this.ajout;
    const i = `${(a?.prenom || '').trim().charAt(0)}${(a?.nom || '').trim().charAt(0)}`.toUpperCase();
    return i || '?';
  }

  /** Règles du mot de passe, cochées au fur et à mesure de la saisie. */
  get reglesMotDePasse(): { libelle: string, ok: boolean }[] {
    const p = this.ajout?.password ?? '';
    return [
      { libelle: '8 caractères minimum', ok: p.length >= 8 },
      { libelle: 'Une majuscule', ok: /[A-Z]/.test(p) },
      { libelle: 'Un chiffre', ok: /\d/.test(p) },
      { libelle: 'Un symbole', ok: /[^A-Za-z0-9]/.test(p) },
    ];
  }

  /** Ce qu'il reste à renseigner : explique pourquoi « Enregistrer » est grisé. */
  get manque(): string[] {
    const a = this.ajout;
    if (!a) return [];
    const reste: string[] = [];
    if (!a.matricule) reste.push('un membre du personnel');
    else if (this.ficheDejaUtilisateur) reste.push('un membre sans compte (celui-ci en a déjà un)');
    else if (!a.cin) reste.push('un CIN sur la fiche');
    if (a.roleIds.length === 0) reste.push('au moins un rôle');
    if (!a.password) reste.push('un mot de passe');
    else if (!this.motDePasseFort) reste.push('un mot de passe conforme aux règles');
    if (a.password && this.motDePasseFort && a.password !== a.confirmation) reste.push('la même valeur dans la confirmation');
    else if (!a.password && !a.confirmation) { /* déjà signalé */ }
    if (this.emailInvalide) reste.push('un e-mail valide');
    return reste;
  }

  get motDePasseFort(): boolean {
    return this.MOT_DE_PASSE_FORT.test(this.ajout?.password ?? '');
  }

  get emailInvalide(): boolean {
    const e = (this.ajout?.email ?? '').trim();
    return !!e && !this.EMAIL.test(e);
  }

  get ajoutValide(): boolean {
    const a = this.ajout;
    return !!a && !!a.matricule && !!a.cin && !this.ficheDejaUtilisateur && a.roleIds.length > 0
      && this.motDePasseFort && a.password === a.confirmation && !this.emailInvalide;
  }

  enregistrerAjout(): void {
    const a = this.ajout;
    if (!a || !this.ajoutValide) return;
    this.ajoutEnCours = true;
    this.adminServ.creerUtilisateur({
      codSoc: a.codSoc, matricule: a.matricule, email: a.email.trim(), roleIds: a.roleIds, password: a.password
    }).subscribe({
      next: () => {
        this.ajoutEnCours = false;
        // la liste s'ouvre sur le nouvel utilisateur : son matricule est mis dans la recherche
        this.recherche = a.matricule;
        this.modalAjoutRef?.close();
        this.charger();
        Swal.fire({
          icon: 'success', title: 'Utilisateur ajouté',
          text: `${a.nom} ${a.prenom} peut se connecter avec son CIN (${a.cin}).`,
          confirmButtonColor: '#3085d6'
        });
      },
      error: (err: any) => {
        this.ajoutEnCours = false;
        Swal.fire({ icon: 'error', title: 'Ajout impossible', text: typeof err === 'string' ? err : 'Erreur lors de l\'enregistrement.' });
      }
    });
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

  aSupprimer: any = null;

  confirmerSuppression(content: TemplateRef<any>, u: any): void {
    if (this.estUtilisateurConnecte(u)) return;
    this.aSupprimer = u;
    this.modalService.open(content, { centered: true, size: 'sm' });
  }

  supprimerConfirme(): void {
    const u = this.aSupprimer;
    if (!u) return;
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
  }

  /** Initiales affichées dans l'avatar (prénom + nom). */
  initiales(u: any): string {
    const i = `${(u?.prenom || '').trim().charAt(0)}${(u?.nom || '').trim().charAt(0)}`.toUpperCase();
    return i || '?';
  }
}
