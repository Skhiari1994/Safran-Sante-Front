import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModifCreditService } from '../modif-credit.service';
import { AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-imputation-mnt-anticip',
  templateUrl: './imputation-mnt-anticip.component.html',
  styleUrls: ['./imputation-mnt-anticip.component.scss']
})
export class ImputationMntAnticipComponent implements OnInit, OnDestroy {

  breadCrumbItems!: Array<{}>;

  // Form
  FormImputAnticip!: FormGroup;

  // Personnel data
  listPersonnel: any[] = [];
  totalPersonnel: number = 0;
  columnPersonnels: any[] = [];
  matPersVal: string = '';
  nomPren: string = '';
  isSearch: boolean = true;

  // Virement data
  listVirAnticipInst: any[] = [];
  columnsVirAnticip: any[] = [];
  numVirVal: string = '';

  // Loading and state
  isLoading: boolean = false;
  isLoadingPersonnel: boolean = false;
  isDisabled: boolean = false;

  // Company code
  codSoc: string = '';

  constructor(
    private fb: FormBuilder,
    private serv: ModifCreditService,
    private adherentServ: AdherentService,
    private token: TokenStorageService,
    private saveService: SaveService
  ) {
    this.codSoc = this.token.getUser().codSoc;
  }

  ngOnInit(): void {
    // Initialize form
    this.initForm();
    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch = canSearch
      console.log("is search valid", canSearch)

    })
    // Configure columns
    this.configureColumns();

    this.breadCrumbItems = [
      { label: 'Crédits' },
      { label: 'Imputation Anticipation Par Compt', active: true }
    ];

    // Preload personnel list so the LOV has data
    this.loadPersonnelAnticip();

    this.loadVirAnticipInst();

    // Register save callback
    this.saveService.registerSaveCallback(() => this.onSubmitImputation());

    // Watch form changes
    this.FormImputAnticip.valueChanges.subscribe(() => {
      this.saveService.setDisabled(!this.isFormValid());
    });
  }

  ngOnDestroy(): void {
    this.saveService.clearSaveCallback();
  }

  /**
   * Initialize the form
   */
  initForm(): void {
    this.FormImputAnticip = this.fb.group({
      cod_soc: [this.codSoc],
      mat_pers: ['', Validators.required],
      num_vir: ['', Validators.required],
      dat_anticip: [{ value: '', disabled: true }],
      mont_vir: [{ value: '', disabled: true }],
      mont_antic: [{ value: '', disabled: true }],
      rest_vir: [{ value: '', disabled: true }],
      mnt_esp: [{ value: '', disabled: true }],
      imput_cpt: [{ value: 'N', disabled: true }],
      etat_vir: [{ value: 'N', disabled: true }],
      ref_metier: ['', Validators.required],
      obs_metier: ['']
    });
  }

  /**
   * Configure columns for LOV components
   */
  configureColumns(): void {
    this.columnPersonnels = [
      { key: 'mat_pers', label: 'Matricule' },
      { key: 'nom_pers', label: 'Nom' },
      { key: 'pren_pers', label: 'Prénom' }
    ];

    this.columnsVirAnticip = [
      { key: 'mat_pers', label: 'Matricule' },
      { key: 'nom', label: 'Nom & Prénom' },
      { key: 'num_vir', label: 'Numéro' },
      { key: 'dat_anticip', label: 'Date' },
      { key: 'mont_vir', label: 'Montant Virement' },
      { key: 'mont_antic', label: 'Montant Anticipation' }
    ];
  }

  /**
   * Load personnel with anticipation eligible
   */
  loadPersonnelAnticip(): void {
    this.isLoadingPersonnel = true;
    this.adherentServ.getPersonnelsCredit().subscribe({
      next: (data) => {
        this.listPersonnel = Array.isArray(data) ? data : [];
        this.totalPersonnel = this.listPersonnel.length;
        this.isLoadingPersonnel = false;

      },
      error: (error) => {
        console.error('Error loading personnel:', error);
        this.isLoadingPersonnel = false;
        this.showError('Erreur lors du chargement de la liste du personnel');
      }
    });
  }

  /**
   * Load virements in instance state (non-imputed)
   */
  loadVirAnticipInst(): void {
    this.serv.getVirAnticipInst().subscribe({
      next: (data) => {
        this.listVirAnticipInst = data;
        console.log('Virements en instance loaded:', data);
      },
      error: (error) => {
        console.error('Error loading virements:', error);
        this.showError('Erreur lors du chargement des virements');
      }
    });
  }

  /**
   * When personnel is selected from LOV
   */
  onSelectedValuePers(item: any): void {
    if (!item) return;

    console.log('Selected personnel:', item);
    const mat = String(item.mat_pers ?? item.matPers ?? item.matricule ?? item.matInt ?? '').trim();
    this.matPersVal = mat;
    this.nomPren = String(item.full_name ?? `${item.nomPers || item.nom_pers || ''} ${item.prenomPers || item.prenom_pers || ''}`.trim());

    // Reset virement-related fields when changing personnel
    this.numVirVal = '';
    this.FormImputAnticip.patchValue({
      mat_pers: mat,
      num_vir: '',
      dat_anticip: '',
      mont_vir: '',
      mont_antic: '',
      rest_vir: '',
      mnt_esp: ''
    });

    this.loadVirementsByMat(mat);
  }

  onOpenPersonnelLov(): void {
    if (!this.listPersonnel || this.listPersonnel.length === 0) {
      this.loadPersonnelAnticip();
    }
  }

  /**
   * Load virements by matricule
   */
  loadVirementsByMat(mat: string): void {
    if (!mat) {
      this.listVirAnticipInst = [];
      return;
    }

    this.isLoading = true;

    // Use the new service method with codSoc and matPers parameters
    this.serv.getVirementsByMat(this.codSoc, mat).subscribe({
      next: (data) => {
        // Filter only non-imputed virements (imput_cpt = 'N' or null)
        this.listVirAnticipInst = data.filter((vir: any) =>
          vir.imput_cpt === 'N' || vir.imput_cpt === null
        );

        console.log('Virements available for personnel:', this.listVirAnticipInst);

        if (this.listVirAnticipInst.length === 0) {
          this.showWarning('Aucun virement disponible pour ce personnel');
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading virements by mat:', error);
        this.listVirAnticipInst = [];
        this.isLoading = false;
        this.showError('Erreur lors du chargement des virements');
      }
    });
  }

  onSelectedVMatIn(mat: string): void {
    const matricule = (mat || '').toString().trim();
    if (!matricule) return;
    const match = this.listPersonnel.find((p: any) => {
      const m = String(p.mat_pers ?? p.matPers ?? p.matricule ?? p.matInt ?? '').trim();
      return m === matricule;
    });
    if (!match) {
      this.showWarning('Aucun personnel avec ce matricule');
      this.listVirAnticipInst = [];
      return;
    }
    const selectedMat = String(match.mat_pers ?? match.matPers ?? match.matricule ?? match.matInt ?? '').trim();
    this.matPersVal = selectedMat;
    this.nomPren = `${match.nomPers || match.nom_pers || ''} ${match.prenomPers || match.prenom_pers || ''}`.trim();
    this.FormImputAnticip.patchValue({ mat_pers: selectedMat });
    this.loadVirementsByMat(selectedMat);
  }

  /**
   * When virement number is selected
   */
  onSelectedVirement(item: any): void {
    if (!item) return;

    console.log('Selected virement:', item);
    this.numVirVal = item.num_vir;

    // Auto-fill form with virement details
    this.FormImputAnticip.patchValue({
      num_vir: item.num_vir,
      dat_anticip: item.dat_anticip,
      mont_vir: Number(item.mont_vir).toFixed(3),
      mont_antic: Number(item.mont_antic).toFixed(3),
      rest_vir: Number(item.rest_vir).toFixed(3),
      mnt_esp: item.mnt_esp ? Number(item.mnt_esp).toFixed(3) : '0.000',
      imput_cpt: item.imput_cpt || 'N',
      etat_vir: item.etat_vir || 'N',
      ref_metier: item.ref_metier || '',
      obs_metier: item.obs_metier || ''
    });
  }
  search(item: any): void {
    if (!item) return;

    // 1. Safe formatting helper
    const formatNum = (val: any) => {
      if (val === null || val === undefined || val === '') return '0,000';
      const num = typeof val === 'string' ? parseFloat(val.replace(/\s/g, '').replace(',', '.')) : Number(val);
      return isNaN(num) ? '0,000' : num.toFixed(3).replace('.', ',');
    };

    // 2. Update local helper variables for display
    this.matPersVal = String(item.mat_pers || '').trim();
    this.nomPren = String(item.nom || '').trim();
    this.numVirVal = String(item.num_vir || '').trim();

    // 3. Robust patchValue
    this.FormImputAnticip.patchValue({
      mat_pers: this.matPersVal,
      num_vir: this.numVirVal,
      dat_anticip: item.dat_anticip,
      mont_vir: formatNum(item.mont_vir),
      mont_antic: formatNum(item.mont_antic),
      rest_vir: formatNum(item.rest_vir),
      mnt_esp: formatNum(item.mnt_esp),
      imput_cpt: item.imput_cpt || 'N',
      etat_vir: item.etat_vir || 'N',
      ref_metier: item.ref_metier || '',
      obs_metier: item.obs_metier || ''
    });

    this.saveService.setIsSearch(false);
  }
  /**
   * Submit imputation
   */
  onSubmitImputation(): void {
    if (!this.isFormValid()) {
      this.showWarning('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const formData = this.FormImputAnticip.getRawValue();

    Swal.fire({
      title: 'Confirmation',
      text: 'Voulez-vous vraiment imputer cette anticipation?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, imputer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.processImputation(formData);
      }
    });
  }

  /**
   * Process the imputation
   */
  processImputation(data: any): void {
    this.isLoading = true;

    const request = {
      codSoc: data.cod_soc,
      matPers: data.mat_pers,
      numVir: Number(data.num_vir),
      refMetier: String(data.ref_metier),
      montVir: parseFloat(data.mont_vir),
      mntEsp: parseFloat(data.mnt_esp || 0),
      restVir: parseFloat(data.rest_vir || 0)
    };

    this.serv.imputationAnticipation(request).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response?.message && response.message.startsWith('ERROR')) {
          this.showError(response.message);
          return;
        }
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Imputation effectuée avec succès',
          showConfirmButton: false,
          timer: 2000
        });
        this.resetForm();
        this.loadVirAnticipInst();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error during imputation:', error);
        this.showError('Erreur lors de l\'imputation');
      }
    });
  }

  /**
   * Reset form
   */
  resetForm(): void {
    this.FormImputAnticip.reset({
      cod_soc: this.codSoc,
      imput_cpt: 'N',
      etat_vir: 'N'
    });
    this.matPersVal = '';
    this.nomPren = '';
    this.numVirVal = '';
  }

  /**
   * Check if form is valid
   */
  isFormValid(): boolean {
    return this.FormImputAnticip.get('mat_pers')?.value &&
      this.FormImputAnticip.get('num_vir')?.value &&
      this.FormImputAnticip.get('ref_metier')?.value;
  }

  /**
   * Notification methods
   */
  showSuccess(message: string): void {
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 2000
    });
  }

  showError(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: message
    });
  }

  showWarning(message: string): void {
    Swal.fire({
      icon: 'warning',
      title: 'Attention',
      text: message
    });
  }

}
