import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { BulletinSoinService } from '../bulletin-soin.service';

@Component({
  selector: 'app-consultation-soin',
  templateUrl: './consultation-soin.component.html',
  styleUrls: ['./consultation-soin.component.scss']
})
export class ConsultationSoinComponent implements OnInit {

  filterForm!: FormGroup;

  // Session
  currentUser: any = {};
  defaultMatPers: string = '';
  codSoc: string = '';

  // Rôle
  isUser: boolean = false;

  // Données LOV Personnel 
  listPersonnel: any[] = [];
  columnsMat: any[] = [
    { key: "mat_pers", label: "Matricule" },
    { key: "mat_int", label: "Mat. Administratif" },
    { key: "dat_nais", label: "Date naissance" }
  ];

  // Données Régimes de remboursement
  listRegime: any[] = [];

  // Données Adhérents / Bénéficiaires
  listAdherents: any[] = [];

  // États de chargement
  loading: boolean = false;

  // Données Bloc 1 : Plafond CNAM
  plafondCnam: any = null;

  // Données Bloc 2 : Plafond Mutuelle
  plafondMutuelle: any = null;

  // Données Bloc 3 : Bulletins CNAM
  bulletinsCnam: any[] = [];
  totalHonorCnam: number = 0;
  totalNetCnam: number = 0;
  totalRembCnam: number = 0;

  // Données Bloc 4 : Bulletins Mutuelle
  bulletinsMutuelle: any[] = [];
  totalHonorMut: number = 0;
  totalNetMut: number = 0;
  totalRembMut: number = 0;

  constructor(
    private fb: FormBuilder,
    private tokenService: TokenStorageService,
    private bultService: BulletinSoinService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.tokenService.getUser() || {};
    this.codSoc = this.currentUser.codSoc || '01';

    // Rôle : utilisateur simple ou RH/Admin
    const roles: string[] = (this.currentUser?.roles || []).map((r: any) => (r.name || r).toUpperCase());
    this.isUser = roles.includes('UTILISATEUR') && !roles.includes('ADMIN') && !roles.includes('RH');

    this.defaultMatPers = this.currentUser?.useLogin || '';

    const currentYear = new Date().getFullYear();

    this.filterForm = this.fb.group({
      natBult: [''], // 'C' = CNAM, 'M' = Mutuelle
      annee: [currentYear, Validators.required],
      matPers: [this.defaultMatPers, Validators.required]
    });

    this.chargerRegimes();

    if (!this.isUser) {
      this.chargerPersonnel();
    }

    if (this.defaultMatPers) {
      this.rechercher();
    }
  }

  chargerRegimes(): void {
    this.bultService.getRegimeRemb().subscribe({
      next: (data: any[]) => {
        this.listRegime = data || [];
      },
      error: (err) => console.error('Erreur chargement régimes', err)
    });
  }

  getLibRemb(b: any): string {
    if (b?.lib_remb) {
      return b.lib_remb;
    }
    if (b?.reg_remb && this.listRegime && this.listRegime.length > 0) {
      const found = this.listRegime.find(r => r.reg_remb === b.reg_remb);
      if (found?.lib_remb) {
        return found.lib_remb;
      }
    }
    return b?.reg_remb || '-';
  }

  getBeneficiaire(b: any): string {
    if (b?.nom_adherent) {
      return b.nom_adherent;
    }
    const numFamStr = b?.num_fam !== undefined && b?.num_fam !== null ? String(b.num_fam).trim() : '';
    if (this.listAdherents && this.listAdherents.length > 0) {
      const found = this.listAdherents.find(a => String(a.num_fam).trim() === numFamStr);
      if (found?.nom_pren ?? found?.nom_PREN) {
        return found.nom_pren ?? found.nom_PREN;
      }
    }
    if (numFamStr === '0' || numFamStr === '') {
      return 'Adhérent';
    }
    return b?.num_fam || '-';
  }

  getLibAssur(b: any): string {
    if (b?.lib_assur) {
      return b.lib_assur;
    }
    if (this.plafondMutuelle && this.plafondMutuelle.cod_assur === b?.cod_assur && this.plafondMutuelle.libAssur) {
      return this.plafondMutuelle.libAssur;
    }
    return b?.cod_assur || '-';
  }

  chargerAdherents(matricule: string): void {
    this.bultService.getAdherent(this.codSoc, matricule).subscribe({
      next: (data: any[]) => {
        this.listAdherents = data || [];
      },
      error: (err) => {
        console.error('Erreur chargement adhérents', err);
        this.listAdherents = [];
      }
    });
  }

  chargerPersonnel(): void {
    this.bultService.getPersonnelBultSoin(this.codSoc).subscribe({
      next: (data: any[]) => {
        this.listPersonnel = data || [];
      },
      error: (err) => console.error('Erreur chargement personnel', err)
    });
  }

  onSelectedMatricule(item: any): void {
    const mat = item?.mat_pers || item?.matricule || '';
    if (mat) {
      this.filterForm.patchValue({ matPers: mat });
      this.rechercher();
    }
  }

  onMatriculeInput(event: any): void {
    const val = event?.target?.value;
    if (val !== undefined) {
      this.filterForm.patchValue({ matPers: val });
    }
  }

  rechercher(): void {
    if (this.filterForm.invalid) {
      return;
    }

    const { natBult, annee, matPers } = this.filterForm.value;
    const anneeNum = Number(annee);
    const matricule = (matPers || '').trim();

    if (!matricule) {
      return;
    }

    this.loading = true;

    // Réinitialiser les totaux et états
    this.resetData();

    // Charger les bénéficiaires pour ce matricule
    this.chargerAdherents(matricule);

    // 1. Bloc 1 : Plafond CNAM 
    if (natBult !== 'M') {
      this.bultService.getPlafondCnamAdherent(matricule).subscribe({
        next: (data: any[]) => {
          this.plafondCnam = data?.find((p: any) => Number(p.annee_cnam) === anneeNum) || null;
        },
        error: (err) => {
          console.error('Erreur chargement Plafond CNAM', err);
          this.plafondCnam = null;
        }
      });
    }

    // 2. Bloc 2 : Plafond Mutuelle
    if (natBult !== 'C') {
      this.bultService.getPlafondAssurAdherent(matricule).subscribe({
        next: (data: any[]) => {
          this.plafondMutuelle = data?.find((p: any) => Number(p.annee_assur) === anneeNum) || null;
        },
        error: (err) => {
          console.error('Erreur chargement Plafond Mutuelle', err);
          this.plafondMutuelle = null;
        }
      });
    }

    // 3 & 4. Blocs 3 & 4 : Bulletins CNAM et Mutuelle
    this.bultService.getConsultationBulletins(this.codSoc, matricule, natBult, anneeNum).subscribe({
      next: (list: any[]) => {
        const bulletins = list || [];

        // Séparation selon la nature nat_bult
        this.bulletinsCnam = bulletins.filter(b => b.nat_bult === 'C');
        this.bulletinsMutuelle = bulletins.filter(b => b.nat_bult === 'M');

        // Calcul des totaux CNAM
        this.totalHonorCnam = this.bulletinsCnam.reduce((sum, b) => sum + (Number(b.tot_honor) || 0), 0);
        this.totalNetCnam = this.bulletinsCnam.reduce((sum, b) => sum + (Number(b.tot_net) || 0), 0);
        this.totalRembCnam = this.bulletinsCnam.reduce((sum, b) => sum + (Number(b.tot_remb) || 0), 0);

        // Calcul des totaux Mutuelle
        this.totalHonorMut = this.bulletinsMutuelle.reduce((sum, b) => sum + (Number(b.tot_honor) || 0), 0);
        this.totalNetMut = this.bulletinsMutuelle.reduce((sum, b) => sum + (Number(b.tot_net) || 0), 0);
        this.totalRembMut = this.bulletinsMutuelle.reduce((sum, b) => sum + (Number(b.tot_remb) || 0), 0);

        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement Bulletins', err);
        this.loading = false;
      }
    });
  }

  reinitialiser(): void {
    const currentYear = new Date().getFullYear();
    const defaultMat = this.isUser ? this.defaultMatPers : '';
    this.filterForm.patchValue({
      natBult: '',
      annee: currentYear,
      matPers: defaultMat
    });
    if (this.isUser && defaultMat) {
      this.rechercher();
    } else {
      this.resetData();
    }
  }

  private resetData(): void {
    this.plafondCnam = null;
    this.plafondMutuelle = null;
    this.bulletinsCnam = [];
    this.bulletinsMutuelle = [];
    this.totalHonorCnam = 0;
    this.totalNetCnam = 0;
    this.totalRembCnam = 0;
    this.totalHonorMut = 0;
    this.totalNetMut = 0;
    this.totalRembMut = 0;
  }
}

