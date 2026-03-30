import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { DebCreditService } from '../deb-credit.service';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SaveService } from 'src/app/shared/Service/save.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { PretSearchComponent } from 'src/app/shared/Composants/pret-search/pret-search.component';

@Component({
  selector: 'app-consult-pret',
  templateUrl: './consult-pret.component.html',
  styleUrl: './consult-pret.component.scss'
})
export class ConsultPretComponent {
  formPretPers!: FormGroup
  currentIndex: number = 0;
  p: number = 1;
  formattedAmount: string = '0,000';
  errorMessageMat = "Champs obligatoire"
  listPersonnel: any[] = []
  listOrgPret: any[] = []
  listDetailPret: any[] = []
  breadCrumbItems!: Array<{}>;

  listComm: any[] = []
  columnsMat: any[] = []
  columnsOrgPret: any[] = []
  columnsDetailPret: any[] = []
  columnsComm: any[] = []
  lisPrets: any[] = []
  etatPret: any[] = []
  listLigPret: any[] = []
  codComm?: string;
  grpPret?: string;
  orgPret?: string;
  matricule?: string;
  commission?: string;
  cnrps: string = "";
  nomPers: string = "";
  codLieuGeog: string = "";
  LibLieuGeog: string = "";
  datEmb: string = "";
  DatRetr: string = "";
  codTypDep: string = "";
  libDeprt: string = "";
  datNais: string = "";
  anc: string = "";
  codAffect: string = "";
  libAffect: string = "";
  codSit: string = "";
  nbrEnf: string = "";
  libOrg: string = "";
  typPret: string = "";
  libPret: string = "";
  libRefComm: string = "";
  mntPrev: number = 0.0;
  tauxInt: number = 0.0;
  nbrtranch: string = "";
  nbreEch: string = "";

  datFin: any;
  save!: boolean;
  isDisabled!: boolean;
  isSearch: boolean = true;
  isLoading = false;
  columnsPret: any[] = []

  constructor(private serv: DebCreditService, private token: TokenStorage, private fb: FormBuilder, private saveService: SaveService, public service: PaginationService) {
    this.formPretPers = this.initForm();
  }

  initForm() {
    return this.fb.group({
      cod_soc: [''],
      mat_pers: [''],
      cod_pret: [''],
      num_dem_pret: [''],
      prt_dat_dem: [''],
      prt_mnt_dem: [''],
      cod_grp_pret: [''],
      typ_pret: [''],
      cod_etat_pret: [{ value: '', disabled: true }],
      typ_etat: [''],
      org_pret: [''],
      mod_remb: [{ value: '', disabled: true }],
      methode_calc: [''],
      cod_dept_pers: [''],
      cod_serv_pers: [''],
      cod_motif_pers: [''],
      cod_categ_pers: [''],
      cod_cat_pers: [''],
      cod_grad_pers: [''],
      adm_tech: [''],
      cod_affect: [''],
      cod_lieu_geog: [''],
      corps: [''],
      cod_typ_depart: [''],
      nbr_enf: [''],
      prt_dat_acc: [''],
      prt_dat_deb: [''],
      prt_dat_fin: [''],
      prt_ech: [''],
      prt_taux: [''],
      prt_mnt_glb: [''],
      prt_mnt_prm: [''],
      delai_grace: [''],
      prt_int_grace: [''],
      prt_mnt_rem: [''],
      rem_men: [''],
      dern_rem_men: [''],
      prt_rendu: [''],
      prt_rendu_int: [''],
      nbr_retenue: [''],
      dat_deblocage: [''],
      dat_comptable: [''],
      mode_reglement: [''],
      piece_reglement: [''],
      mnt_report: [''],
      cod_pret_ant: [''],
      ass_pret: [''],
      objet_pret: [''],
      dat_saisie: [''],
      cod_user: [''],
      cod_motif_susp: [''],
      cod_pret_ref: [''],
      num_etat_pret: [''],
      amort_pret: [''],
      nbr_tranche: [''],
      dat_effet: [''],
      prt_mnt_debloque: [''],
      prt_int_tranch: [''],
      num_lig_dem_pret: [''],
      prt_interet: [''],
      num_comm: [''],
      seq_ecrt: [''],
      num_vir: [''],
    });
  }

  ngOnInit() {
    this.getMatInt();
    this.getOrgPret();
    this.getDetailPret();
    this.getComm();
    this.getEtatPret();

    this.columnsPret = [
      { key: "num_retr", label: "Id CNRPS" },

      { key: "mat_pers", label: "Matricule" },
      { key: "nomPers", label: "Nom & Prenom" },
      { key: "num_comm", label: "Numéro de commission" },
      { key: "cod_etat_pret", label: "Code etat pret" },
      { key: "cod_pret", label: "Code prêt" },
      { key: 'mod_remb', label: 'Mode de remboursement' },
      { key: 'dat_saisie', label: 'Date de saisie' },
    ];


    this.breadCrumbItems = [
      { label: 'Crédits' },
      { label: 'Consultation des crédits', active: true }
    ];

    this.saveService.registerSaveCallback(() => this.saveLigPretChanges());

    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch = canSearch;
    });
  }

  ngOnDestroy() {
    this.saveService.clearSaveCallback();
  }

  search(item: any) {
    if (item && item.mat_pers) {
      this.serv.getPretEnCours(this.token.getUser().codSoc, item.mat_pers).subscribe(
        (data) => {
          this.lisPrets = data;
          this.currentIndex = this.lisPrets.findIndex(p => p.cod_pret === item.cod_pret);
          if (this.currentIndex === -1) this.currentIndex = 0;
          this.displayPret(this.lisPrets[this.currentIndex]);
        },
        (error) => {
          console.error('Erreur lors du chargement des données :', error);
        }
      );
    }
  }

  displayPret(item: any) {
    if (!item) return;

    this.formPretPers.patchValue({
      ...item,
      prt_mnt_dem: this.updateFormattedAmount(item.prt_mnt_dem),
      prt_taux: this.updateFormattedAmount(item.prt_taux),
      prt_mnt_glb: this.updateFormattedAmount(item.prt_mnt_glb),
      prt_mnt_prm: this.updateFormattedAmount(item.prt_mnt_prm),
      prt_mnt_rem: this.updateFormattedAmount(item.prt_mnt_rem),
      rem_men: this.updateFormattedAmount(item.rem_men),
      prt_rendu: this.updateFormattedAmount(item.prt_rendu),
      prt_rendu_int: this.updateFormattedAmount(item.prt_rendu_int),
      mnt_report: this.updateFormattedAmount(item.mnt_report),
      prt_mnt_debloque: this.updateFormattedAmount(item.prt_mnt_debloque),
      prt_int_tranch: this.updateFormattedAmount(item.prt_int_tranch),
      prt_interet: this.updateFormattedAmount(item.prt_interet),
    });

    this.fetchPersonnelInfo(item.mat_pers);
    this.fetchAdditionalInfo(item);

    this.serv.getLigPRet(this.token.getUser().codSoc, item.mat_pers, item.cod_pret).subscribe((data: any) => {
      this.listLigPret = data;
    });
  }

  fetchPersonnelInfo(matPers: string) {
    this.serv.getPersonnelCreditByMat(this.token.getUser().codSoc, matPers).subscribe((data: any) => {
      if (data) {
        this.cnrps = data.numRetr;
        this.nomPers = data.nom;
        this.codLieuGeog = data.codLieuGeog;
        this.LibLieuGeog = data.libLieu;
        this.datEmb = data.datEmb;
        this.DatRetr = data.datRetraite;
        this.codTypDep = data.codTypDepart;
        this.libDeprt = data.libTypDepart;
        this.datNais = data.dateNaissance;
        this.codAffect = data.codAffect;
        this.libAffect = data.libAffect;
        this.codSit = data.codSit;
        this.nbrEnf = data.nbrEnf;

        this.formPretPers.patchValue({
          mat_pers: data.matPers,
          cod_lieu_geog: data.codLieuGeog,
          cod_typ_depart: data.codTypDepart,
          cod_affect: data.codAffect,
          cod_sit: data.codSit,
          nbr_enf: data.nbrEnf,
        });
      }
    });
  }

  fetchAdditionalInfo(item: any) {
    this.serv.getOrgPret().subscribe((data) => {
      const org = data.find((o) => o.org_pret === item.org_pret);
      this.libOrg = org?.lib_organisme || '';
    });

    this.serv.getDetailPret(this.token.getUser().codSoc).subscribe((data) => {
      const pret = data.find((p) => p.codGrpPret === item.cod_grp_pret && p.typPret === item.typ_pret);
      this.libPret = pret?.libPret || '';
      this.mntPrev = pret?.plafond || 0;
    });

    this.serv.getValidCommission(this.token.getUser().codSoc).subscribe((data) => {
      const comm = data.find((c) => c.num_comm === item.num_comm);
      this.libRefComm = comm?.ref_comm || '';
    });
  }

  navigate(direction: number): void {
    const newIndex = this.currentIndex + direction;
    if (newIndex >= 0 && newIndex < this.lisPrets.length) {
      this.currentIndex = newIndex;
      this.displayPret(this.lisPrets[this.currentIndex]);
    }
  }

  goToFirst() {
    if (this.lisPrets.length > 0) {
      this.currentIndex = 0;
      this.displayPret(this.lisPrets[0]);
    }
  }

  goToLast() {
    if (this.lisPrets.length > 0) {
      this.currentIndex = this.lisPrets.length - 1;
      this.displayPret(this.lisPrets[this.currentIndex]);
    }
  }

  updateFormattedAmount(value: any): string {
    if (value === null || value === undefined) return '0,000';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return numValue.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ' ').replace('.', ',');
  }

  getMatInt() { this.serv.getPersonnelCredit(this.token.getUser().codSoc).subscribe(data => { this.listPersonnel = data; this.columnsMat = [{ key: "numRetr", label: "Id CNRPS" }, { key: "matPers", label: "Matricule" }, { key: "nom", label: "Nom & Prénom" }]; }); }
  getOrgPret() { this.serv.getOrgPret().subscribe(data => { this.listOrgPret = data; this.columnsOrgPret = [{ key: "org_pret", label: "Code" }, { key: "lib_organisme", label: "Libelle" }]; }); }
  getDetailPret() { this.serv.getDetailPret(this.token.getUser().codSoc).subscribe(data => { this.listDetailPret = data; this.columnsDetailPret = [{ key: "codGrpPret", label: "Groupe prêt" }, { key: "typPret", label: "Type prêt" }, { key: "libPret", label: "Libelle" }]; }); }
  getComm() { this.serv.getValidCommission(this.token.getUser().codSoc).subscribe(data => { this.listComm = data; this.columnsComm = [{ key: "num_comm", label: "Num comm" }, { key: "ref_comm", label: "Ref comm" }]; }); }
  getEtatPret() { this.serv.getEtatPret().subscribe(data => this.etatPret = data); }

  VerifMntDem(event: any) {
    const inputValue = parseFloat(event.target.value);
    if (inputValue > this.mntPrev) {
      event.target.value = '';
      Swal.fire({ title: 'Montant demandé dépasse le plafond ! ', text: "Veuiller resaisir le montant !", icon: 'warning', confirmButtonColor: '#3085d6', confirmButtonText: 'D\'accord' });
    }
  }

  VerifTauxInt(event: any) {
    const inputValue = parseFloat(event.target.value);
    if (inputValue > this.tauxInt) {
      event.target.value = '';
      Swal.fire({ title: 'Vérifiez le taux d\'intérêt !', text: 'Le taux saisi dépasse la limite autorisée. Veuillez ressaisir.', icon: 'warning', confirmButtonColor: '#3085d6', confirmButtonText: 'D\'accord' });
    }
  }

  VerifPrtEch(event: any) {
    if (event.target.value > this.formPretPers.get('prt_ech')?.value) {
      Swal.fire({ title: 'Vérifier le nombre d\'écheance ! ', text: "Veuiller resaisir le nombre d\'écheance !", icon: 'warning', confirmButtonColor: '#3085d6', confirmButtonText: 'D\'accord' });
    }
  }

  VerifDatAccord(event: any) {
    this.serv.verif_dat_acc(this.token.getUser().codSoc, this.formPretPers.get('mat_pers')?.value, this.formPretPers.get('cod_grp_pret')?.value, this.formPretPers.get('typ_pret')?.value, this.datEmb, event?.target.value).subscribe((data: any) => {
      this.anc = data.anc;
      if (data.nbre > 0) {
        Swal.fire({ title: 'Ce prêt existe déjà. Veuillez accéder via la modification. ! ', icon: 'warning', confirmButtonColor: '#3085d6', confirmButtonText: 'D\'accord' });
      }
    });
  }

  VerifDatDebut(event: any) {
    this.serv.verif_dat_deb(this.token.getUser().codSoc, this.formPretPers.get('prt_ech')?.value, this.formPretPers.get('prt_dat_acc')?.value, event.target.value, this.DatRetr).subscribe((data: any) => {
      this.datFin = data.datFin;
      this.formPretPers.patchValue({ prt_dat_fin: data.datFin });
      if (data.message) {
        Swal.fire({ title: 'Message', text: data.message, icon: data.message.includes('probléme') ? 'error' : 'info', confirmButtonColor: '#3085d6', confirmButtonText: 'OK' });
        event.target.value = '';
        this.formPretPers.get('prt_dat_fin')?.patchValue('');
      }
    });
  }

  onSort(column: any) { this.listLigPret = this.service.onSort(column, this.listLigPret); }
  onPageChangeForGouv(page: number) { this.p = page; }

  editLigPret(evt: any) {
    const index = this.listLigPret.findIndex(item => item.cod_soc === evt.cod_soc && item.mat_pers === evt.mat_pers && item.num_pret === evt.num_pret && item.l_pret === evt.l_pret);
    if (index !== -1) {
      this.listLigPret[index].reg_pret = evt.reg_pret;
      this.saveService.setDisabled(true);
    }
  }

  saveLigPretChanges() {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Les modifications seront enregistrées.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, enregistrer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.serv.updateListLigPret(this.listLigPret).subscribe(
          (resp: string) => {
            Swal.fire('Succès', resp, 'success');
            this.saveService.setDisabled(true);
          },
          (error: any) => {
            console.error('Erreur mise à jour :', error);
            Swal.fire('Erreur', 'Mise à jour échouée', 'error');
          }
        );
      }
    });
  }
}
