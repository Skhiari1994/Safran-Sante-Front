import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { ReceptionRemboursementService } from '../reception-remboursement.service';
import Swal from 'sweetalert2';
import { BulletinSoinService } from '../../Bulletin de soins/bulletin-soin.service';
import { EnvoiServiceService } from '../../Envoi/envoi-service.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SaveService } from 'src/app/shared/Service/save.service';
import { forkJoin } from 'rxjs';
import { HasUnsavedChanges } from 'src/app/core/guards/unsaved-changes.guard';

@Component({
  selector: 'app-saisie-envoi-bord-cnam',
  templateUrl: './saisie-envoi-bord-cnam.component.html',
  styleUrls: ['./saisie-envoi-bord-cnam.component.scss']
})
export class SaisieEnvoiBordCnamComponent implements OnInit, HasUnsavedChanges {
  breadCrumbItems!: Array<{}>;

  // Forms
  BordEnvoiForm!: FormGroup;
  SaisieBulletinForm!: FormGroup;
  ligActeForm!: FormGroup;
  ligVisiteForm!: FormGroup;
  ligPharForm!: FormGroup;
  ligAppareilForm!: FormGroup;

  // Data Lists
  AllBordEnvoi: any[] = [];
  ListePersonnel: any[] = [];
  ListeFamillePersonnelParLigne: Record<number, any[]> = {};
  ListeAssurance: any[] = [];
  listActe: any[] = [];
  listVisite: any[] = [];
  listMed: any[] = [];
  listAppareil: any[] = [];
  listRefEtablis: any[] = [];
  listRefEtablisVisit: any[] = [];
  listRefEtablisMed: any[] = [];
  listRefEtablisApp: any[] = [];
  ListeRegimeRemb: any[] = [];

  // UI State
  selectedRow: number | null = null;
  isSearch: boolean = true;
  isReadOnly: boolean = false;

  // Bordereau Data
  cod_bord: string = '';
  dateBord: string = '';
  codeAssur: string = '';
  libAssur: string = '';
  codBord: string = '';

  // Helper Arrays for UI
  numRetr: string[] = [];
  NumFam: any[] = [];
  NomPrenom: string[] = [];
  Nom: string[] = [];

  // Acte helpers
  actes: string[] = [];
  libAct: string[] = [];
  refEtablis: string[] = [];
  etab_rsoc: string[] = [];

  // Visite helpers
  visiteCode: string[] = [];
  libVisite: string[] = [];
  refEtablisVisit: string[] = [];
  etab_rsoc_visite: string[] = [];

  // Med helpers
  Med: string[] = [];
  libMed: string[] = [];
  refEtablisPhar: string[] = [];
  etab_rsoc_phar: string[] = [];

  // Appareil helpers
  appareilCode: string[] = [];
  libAppareil: string[] = [];
  refEtablisApp: string[] = [];
  etab_rsoc_appareil: string[] = [];

  // Totals
  totalHonoraires: number = 0;
  totalNet: number = 0;
  totalHonorairesVisite: number = 0;
  totalNetVisite: number = 0;
  totalHonorairesPhar: number = 0;
  totalNetPhar: number = 0;
  totalHonorairesAppareil: number = 0;
  totalNetAppareil: number = 0;

  // Grand Totals (for bordereau)
  totalNetTot: number = 0;
  totalHonoraireTot: number = 0;

  // Columns for LOV
  columnBordArriver: any[] = [];
  columnPersonnel: any[] = [];
  columneFamillePersonnel: any[] = [];
  columnAssuranc: any[] = [];
  columnActe: any[] = [];
  columnVisite: any[] = [];
  columnsMed: any[] = [];
  columnsAppareil: any[] = [];
  columnsRefEtablis: any[] = [];
  columnsRefEtablisVisit: any[] = [];
  columnsRefEtablisMed: any[] = [];
  columnsRefEtablisApp: any[] = [];

  // UI State
  activeTab: string = 'visites';
  selectedBulletinKey: string = '';
  bultArriver: any = null;
  selectedAct: any = null;
  selectedVisit: any = null;
  selectedMed: any = null;
  selectedApp: any = null;

  selectedIndex: number | null = null;
  selectedIndexMed: number | null = null;
  selectedIndexVisit: number | null = null;
  selectedIndexApp: number | null = null;

  constructor(
    private serv: ReceptionRemboursementService,
    private servRemb: BulletinSoinService,
    private envoiServ: EnvoiServiceService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private token: TokenStorageService,
    private saveService: SaveService,
    private cdRef: ChangeDetectorRef
  ) {
    this.breadCrumbItems = [
      { label: 'Remboursement' },
      { label: 'Saisie Bordereau Envoi CNAM', active: true }
    ];
  }

  ngOnInit(): void {
    this.initializeForms();
    this.getAllBordEnvoi();
    this.getAllBordEnvoi();
    this.getAllAssurance();
    this.GetAllRegimeRemb();
    this.saveService.registerSaveCallback(() => this.saveBordereau());
    this.saveService.setDisabled(true);
    console.log('🔧 Component initialized');
  }

  async checkUnsavedChanges(): Promise<boolean> {
    if (this.isReadOnly) return true;

    const isDirty = this.BordEnvoiForm.dirty ||
      this.SaisieBulletinForm.dirty ||
      this.ligActeForm.dirty ||
      this.ligVisiteForm.dirty ||
      this.ligPharForm.dirty ||
      this.ligAppareilForm.dirty;

    if (isDirty) {
      const result = await Swal.fire({
        title: `Modifications non enregistrées Détails du Bulletin - Ligne ${(this.selectedRow ?? 0) + 1}`,
        text: 'Vous avez des modifications non enregistrées. Voulez-vous continuer sans sauvegarder ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, abandonner',
        cancelButtonText: 'Non, rester ici'
      });
      return result.isConfirmed;
    }
    return true;
  }

  markAllPristine(): void {
    this.BordEnvoiForm.markAsPristine();
    this.SaisieBulletinForm.markAsPristine();
    this.ligActeForm.markAsPristine();
    this.ligVisiteForm.markAsPristine();
    this.ligPharForm.markAsPristine();
    this.ligAppareilForm.markAsPristine();
  }

  ngOnDestroy(): void {
    this.saveService.clearSaveCallback();
  }

  initializeForms(): void {
    // Bordereau Form
    this.BordEnvoiForm = this.fb.group({
      cod_bord: [''],
      cod_assur: [''],
      dat_bord: [''],
      dat_deb: [''],
      dat_fin: [''],
      nbr_bult: [''],
      tot_honor: [''],
      typ_bord: [''],
      cod_soc: [''],
      tot_net: [''],
      valid_bord: [''],
      reg_bord: [''],
      tot_remb: [''],
      valid: [''],
      clot_bord: [''],
      tot: [''],
      num_retr: [''],
      cod_bord_cnam: [''],
      seq_bord: ['']
    });

    // Bulletin Form
    this.SaisieBulletinForm = this.fb.group({
      lignes: this.fb.array([])
    });

    // Detail Forms
    this.ligActeForm = this.fb.group({
      acte: this.fb.array([])
    });

    this.ligVisiteForm = this.fb.group({
      visite: this.fb.array([])
    });

    this.ligPharForm = this.fb.group({
      phar: this.fb.array([])
    });

    this.ligAppareilForm = this.fb.group({
      appareil: this.fb.array([])
    });
  }

  // FormArray Getters
  get lignes(): FormArray {
    return this.SaisieBulletinForm.get('lignes') as FormArray;
  }

  get acte(): FormArray {
    return this.ligActeForm.get('acte') as FormArray;
  }

  get visite(): FormArray {
    return this.ligVisiteForm.get('visite') as FormArray;
  }

  get phar(): FormArray {
    return this.ligPharForm.get('phar') as FormArray;
  }

  get appareil(): FormArray {
    return this.ligAppareilForm.get('appareil') as FormArray;
  }

  // API Calls
  getAllBordEnvoi(): void {
    this.serv.getAllBordEnvoiCnam(this.token.getUser().codSoc).subscribe({
      next: (data) => {
        this.AllBordEnvoi = data;
        this.columnBordArriver = [
          { key: 'cod_bord', label: 'Code Bordereau' },
          { key: 'dat_bord', label: 'Date' },
          { key: 'cod_assur', label: 'Assurance' },
          { key: 'nbr_bult', label: 'Nbre Bulletins' },
          { key: 'tot_remb', label: 'Total Remb.' }
        ];
      },
      error: (err) => {
        console.error('Error loading bordereaux:', err);
        Swal.fire('Erreur', 'Impossible de charger les bordereaux', 'error');
      }
    });
  }

  getAllAssurance(): void {
    this.serv.GetAllAssurance().subscribe({
      next: (data: any) => {
        this.ListeAssurance = data;
        this.columnAssuranc = [
          { key: 'cod_assur', label: 'Code' },
          { key: 'lib_assur', label: 'Libellé' }
        ];
      },
      error: (err: any) => console.error('Error loading assurances:', err)
    });
  }

  isPrintButtonsDisabled: boolean = false;

  printBordArrivGlobal() {
    if (!this.cod_bord) {
      Swal.fire('Avertissement', 'Veuillez sélectionner un bordereau.', 'warning');
      return;
    }
    Swal.fire({
      title: 'Chargement en cours...',
      html: 'Veuillez patienter pendant la génération du rapport.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
    this.serv.imprimerBordArrivGlobal(this.token.getUser().codSoc, this.cod_bord).subscribe({
      next: (data: any) => {
        const file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileURL;
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `Bordereau_CNAM_Arriv_Global_${this.cod_bord}_${formattedDate}.pdf`;
        a.click();
        URL.revokeObjectURL(fileURL);
        Swal.close();
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Échec de la génération du rapport global.' });
      }
    });
  }

  printBordArrivDetail() {
    if (!this.cod_bord) {
      Swal.fire('Avertissement', 'Veuillez sélectionner un bordereau.', 'warning');
      return;
    }
    Swal.fire({
      title: 'Chargement en cours...',
      html: 'Veuillez patienter pendant la génération du rapport.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
    this.serv.imprimerBordArrivDetail(this.token.getUser().codSoc, this.cod_bord).subscribe({
      next: (data: any) => {
        const file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileURL;
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `Bordereau_CNAM_Arriv_Detail_${this.cod_bord}_${formattedDate}.pdf`;
        a.click();
        URL.revokeObjectURL(fileURL);
        Swal.close();
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Échec de la génération du rapport détaillé.' });
      }
    });
  }

  async onSelectedValueBordArriver(event: any): Promise<void> {
    if (!event) return;

    const allowed = await this.checkUnsavedChanges();
    if (!allowed) return;

    this.isReadOnly = false;
    this.isSearch = false;
    this.selectedRow = null;
    this.selectedBulletinKey = '';
    this.cod_bord = event.cod_bord;
    this.dateBord = event.dat_bord;
    this.codeAssur = event.cod_assur;

    console.log('🔄 Selecting Bordereau:', this.cod_bord);

    // Check if bordereau is regulated/validated (O = yes, cannot modify)
    this.serv.getcodBordArriver(this.cod_bord).subscribe({
      next: (data: any) => {
        console.log('🔍 Status check API response:', data);
        const bordData = Array.isArray(data) ? data[0] : data;

        const regStatus = (bordData?.reg_bord || '').trim().toUpperCase();
        const validStatus = (bordData?.valid || event.valid || '').trim().toUpperCase();

        if (regStatus === 'O' || validStatus === 'O') {
          this.isReadOnly = true;
          this.saveService.setDisabled(true); // true = DISABLED
          console.log('🔒 READ-ONLY confirmed (Reg:', regStatus, 'Valid:', validStatus, ')');

          Swal.fire({
            icon: 'info',
            title: 'Bordereau Validé',
            text: 'Ce bordereau est réglé/validé et ne peut pas être modifié',
            confirmButtonText: 'OK'
          });
        } else {
          this.isReadOnly = false;
          console.log('✅ Status confirmed: EDITABLE');
        }
        this.cdRef.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error checking bordereau details:', err);
        // Fallback to basic check if API fails
        this.isReadOnly = (event.valid || '').trim().toUpperCase() === 'O';
        this.saveService.setDisabled(this.isReadOnly);
        this.cdRef.detectChanges();
      }
    });




    this.BordEnvoiForm.patchValue({
      cod_bord: event.cod_bord,
      tot_remb: event.tot_remb,
      valid: event.valid,
      nbr_bult: event.nbr_bult,
      dat_bord: event.dat_bord,
      cod_assur: event.cod_assur
    });

    // Check if it exists in Arriver to get the confirmed total
    this.serv.getBordArriverById(event.cod_bord).subscribe({
      next: (bordArriv: any) => {
        if (bordArriv && bordArriv.tot_remb !== undefined) {
          console.log('📈 Update header total from Arriver:', bordArriv.tot_remb);
          this.BordEnvoiForm.patchValue({ tot_remb: bordArriv.tot_remb });
        }
      },
      error: () => console.log('ℹ️ No Arriver header found for this bordereau.')
    });

    const assurance = this.ListeAssurance.find(a => a.cod_assur === event.cod_assur);
    this.libAssur = assurance?.lib_assur || '';

    // Load bulletins for this bordereau
    this.loadBulletins(event.cod_bord, event.cod_assur);
  }

  loadBulletins(codBord: string, codAssur: string): void {
    const codSoc = this.token.getUser().codSoc;

    console.log(`🔍 Checking Bordereau Arriver Header: ${codBord}`);

    // 1️⃣ First check if the bordereau header exists in BORD_ARRIVER
    this.serv.getBordArriverById(codBord).subscribe({
      next: (bordArriv: any) => {
        // Robust check: ensure the object has a cod_bord
        const isActuallyArrived = !!(bordArriv && (bordArriv.cod_bord || bordArriv.codBord));
        console.log(`📊 Bordereau header check for ${codBord}:`, {
          result: bordArriv,
          isActuallyArrived
        });

        if (isActuallyArrived) {
          // 2️⃣ Header EXISTS: Load from BULT_ARRIVER (Confirmed Results)
          this.serv.getBultArriverByCodBord2(codBord).subscribe({
            next: (bulletinsArriv: any[]) => {
              console.log(`📥 BULT_ARRIVER response for ${codBord}:`, bulletinsArriv);
              if (bulletinsArriv && bulletinsArriv.length > 0) {
                this.processBulletins(bulletinsArriv, true);
              } else {
                console.log('⚠️ BULT_ARRIVER empty, falling back to BULT_SOIN with confirmed=true');
                this.loadFromEnvoiSource(codSoc, codBord, codAssur, true);
              }
            },
            error: (err) => {
              console.error('❌ Error loading BULT_ARRIVER:', err);
              this.loadFromEnvoiSource(codSoc, codBord, codAssur, true);
            }
          });
        } else {
          // 3️⃣ Header NOT Found: Load from BULT_SOIN and force Tot. Net to 0
          console.log('ℹ️ Header not found in ARRIVER. Using ENVOI source and zeroing totals.');
          this.loadFromEnvoiSource(codSoc, codBord, codAssur, false);
        }
      },
      error: (err) => {
        console.warn('⚠️ Error checking header, assuming not arrived.', err);
        this.loadFromEnvoiSource(codSoc, codBord, codAssur, false);
      }
    });
  }

  private loadFromEnvoiSource(codSoc: string, codBord: string, codAssur: string, isArrived: boolean): void {
    if (!isArrived) {
      this.BordEnvoiForm.patchValue({ tot_remb: 0 });
    }

    this.envoiServ.findBultEnvoiByCodBord(codSoc, codBord, codAssur).subscribe({
      next: (bulletinsEnvoi: any[]) => {
        if (bulletinsEnvoi && bulletinsEnvoi.length > 0) {
          console.log(`✅ Loading from BULT_SOIN (isArrived: ${isArrived})`);
          this.processBulletins(bulletinsEnvoi, isArrived);
        } else {
          Swal.fire('Info', 'Aucun bulletin trouvé pour ce bordereau', 'info');
          this.lignes.clear();
        }
      },
      error: (err: any) => {
        console.error('Error loading Envoi bulletins:', err);
        Swal.fire('Erreur', 'Impossible de charger les bulletins (Source Envoi)', 'error');
      }
    });
  }

  private processBulletins(bulletins: any[], isCharged: boolean = true): void {
    console.log(`⚙️ Processing ${bulletins.length} bulletins (Charged: ${isCharged})`);
    this.lignes.clear();

    bulletins.forEach((bult: any, index: number) => {
      const ligneGroup = this.createLigne();

      // Ensure we have numbers to avoid null/undefined issues
      const rawTotNet = bult.tot_net !== undefined && bult.tot_net !== null ? bult.tot_net : 0;
      const rawTotRemb = bult.tot_remb !== undefined && bult.tot_remb !== null ? bult.tot_remb : rawTotNet;

      if (!isCharged) {
        bult.tot_net = 0;
        bult.tot_remb = 0;
      } else {
        // Log a few items to check the fields
        if (index < 3) console.log(`📄 Bulletin ${index} fields:`, { tot_net: bult.tot_net, tot_remb: bult.tot_remb });
        bult.tot_net = rawTotNet;
        bult.tot_remb = rawTotRemb;
      }

      ligneGroup.patchValue(bult);

      // Explicitly set totals to ensure they are visible in form controls
      ligneGroup.get('tot_net')?.setValue(bult.tot_net);
      ligneGroup.get('tot_remb')?.setValue(bult.tot_remb);

      this.lignes.push(ligneGroup);
      // ... helper arrays ...
      this.numRetr[index] = bult.num_retr || bult.num_assur || '';
      this.NumFam[index] = bult.num_fam || '';
      this.NomPrenom[index] = bult.nom_prenom || '';
      this.Nom[index] = bult.nom || '';

      ligneGroup.patchValue({
        nom_prenom: bult.nom_prenom || '',
        nom: bult.nom || '',
        num_assur: bult.num_retr || bult.num_assur || '',
        originalIndex: index
      }, { emitEvent: false });
    });
    //...


    // Set save button state after processing
    //  this.saveService.setDisabled(this.isReadOnly); // true = DISABLED, false = ENABLED
    this.isSearch = false;

    // Auto-reload details if a row was already active (using unique key for robustness)
    if (this.selectedBulletinKey) {
      console.log('🔄 Searching for bulletin to auto-recharge:', this.selectedBulletinKey);
      const activeLigne = this.lignes.controls.find(c => {
        const item = c.value;
        const dat = this.formatDate(item.dat_soin);
        const key = `${item.mat_pers}_${item.num_fam}_${dat}`;
        return key === this.selectedBulletinKey;
      });

      if (activeLigne) {
        const idx = activeLigne.get('originalIndex')?.value;
        console.log('✅ Found active bulletin at index:', idx);
        this._executeLoad(activeLigne.value, idx);
      }
    }
  }

  createLigne(): FormGroup {
    return this.fb.group({
      cod_soc: [this.token.getUser().codSoc],
      mat_pers: [''],
      num_retr: [''],
      num_fam: [''],
      dat_soin: [''],
      cod_bord: [''],
      cod_assur: [''],
      tot_remb: [''],
      tot_honor: [''],
      tot_net: [''],
      reg_remb: [''],
      cod_malad: [''],
      num_pec: [''],
      dat_saisie: [''],
      cod_fil: [''],
      ord_bult: [''],
      nom_prenom: [''], // Helper field for filtering
      nom: [''],         // Helper field for filtering
      originalIndex: [null] // Helper field to track index during filter/sort
    });
  }

  async load(item: any, index: number): Promise<void> {
    console.log(`📡 load called for row index: ${index} (Current selectedRow: ${this.selectedRow})`);

    // Guard: ignore if the same row is already selected to prevent redundant loading
    const isSameBulletin = this.bultArriver &&
      this.bultArriver.mat_pers === item.mat_pers &&
      this.bultArriver.num_fam === item.num_fam &&
      this.bultArriver.dat_soin === item.dat_soin;

    if (this.selectedRow === index && isSameBulletin) {
      console.log('ℹ️ load skipped: row or bulletin already selected');
      return;
    }

    const allowed = await this.checkUnsavedChanges();
    if (!allowed) return;

    this._executeLoad(item, index);
  }

  private _executeLoad(item: any, index: number): void {
    this.selectedRow = index;
    this.bultArriver = item;
    const dat = this.formatDate(item.dat_soin);
    this.selectedBulletinKey = `${item.mat_pers}_${item.num_fam}_${dat}`;
    this.isSearch = false;
    this.activeTab = 'visites';

    // Clear existing details
    this.clearAllDetails();
    this.markAllPristine(); // Start with clean state after switching rows

    // Initialize column definitions
    this.columnActe = [
      { key: 'cod_act', label: 'Code' },
      { key: 'lib_act', label: 'Libellé' }
    ];

    this.columnVisite = [
      { key: 'cod_Visit', label: 'Code' },
      { key: 'lib_Visit', label: 'Libellé' }
    ];

    this.columnsMed = [
      { key: 'cod_med', label: 'Code' },
      { key: 'lib_med', label: 'Libellé' }
    ];

    this.columnsAppareil = [
      { key: 'cod_app', label: 'Code' },
      { key: 'lib_app', label: 'Libellé' }
    ];

    // Load reference lists in parallel
    forkJoin({
      listActe: this.servRemb.getActesManuel(item.cod_fil, item.cod_assur),
      listVisite: this.servRemb.getVisitManuel(item.cod_fil, item.cod_assur),
      listMed: this.servRemb.getMeds(item.cod_fil, item.cod_assur),
      listApp: this.servRemb.getAppareil(item.cod_fil, item.cod_assur)
    }).subscribe({
      next: (refs: any) => {
        this.listActe = refs.listActe || [];
        this.listVisite = refs.listVisite || [];
        this.listMed = refs.listMed || [];
        this.listAppareil = refs.listApp || [];

        // Load details from backend
        this.loadDetails(item);
      },
      error: (err) => {
        console.error('Error loading reference data:', err);
        Swal.fire('Erreur', 'Impossible de charger les données de référence', 'error');
      }
    });
  }

  loadDetails(item: any): void {
    const dat_soin = this.formatDate(item.dat_soin);

    forkJoin({
      actes: this.serv.geLigActArriverById(item.cod_soc, item.mat_pers, item.num_fam, dat_soin),
      visites: this.serv.LigVisitArriverById(item.cod_soc, item.mat_pers, item.num_fam, dat_soin),
      meds: this.serv.LigMedArriverById(item.cod_soc, item.mat_pers, item.num_fam, dat_soin),
      apps: this.serv.LigAppArriverById(item.cod_soc, item.mat_pers, item.num_fam, dat_soin)
    }).subscribe({
      next: (res: any) => {
        if (res.actes && res.actes.length > 0) {
          this.loadDataIntoTable(res.actes, 'acte');
        }
        if (res.visites && res.visites.length > 0) {
          this.loadDataIntoTable(res.visites, 'visite');
        }
        if (res.meds && res.meds.length > 0) {
          this.loadDataIntoTable(res.meds, 'phar');
        }
        if (res.apps && res.apps.length > 0) {
          this.loadDataIntoTable(res.apps, 'appareil');
        }

        this.calculateAllTotals();
        this.cdRef.detectChanges();
        this.markAllPristine();
      },
      error: (err) => {
        console.error('Error loading details:', err);
      }
    });
  }

  loadDataIntoTable(data: any[], type: string): void {
    const formArray = type === 'acte' ? this.acte :
      type === 'visite' ? this.visite :
        type === 'phar' ? this.phar : this.appareil;

    formArray.clear();
    data.forEach((item, index) => {
      const group = this.createDetailGroup(type);
      group.patchValue(item);
      formArray.push(group);

      // Set helper arrays
      if (type === 'acte') {
        this.actes[index] = item.cod_act;
        this.libAct[index] = this.listActe.find(a => a.cod_act === item.cod_act)?.lib_act || '';
      } else if (type === 'visite') {
        this.visiteCode[index] = item.cod_visit;
        this.libVisite[index] = this.listVisite.find(v => v.cod_Visit === item.cod_visit)?.lib_Visit || '';
      } else if (type === 'phar') {
        this.Med[index] = item.cod_med;
        this.libMed[index] = this.listMed.find(m => m.cod_med === item.cod_med)?.lib_med || '';
      } else if (type === 'appareil') {
        this.appareilCode[index] = item.cod_app;
        this.libAppareil[index] = this.listAppareil.find(a => a.cod_app === item.cod_app)?.lib_app || '';
      }
    });
  }

  createDetailGroup(type: string): FormGroup {
    const baseFields = {
      cod_soc: [this.token.getUser().codSoc],
      mat_pers: [''],
      num_fam: [''],
      dat_soin: ['', Validators.required],
      abrv_act: [''],
      num_lig: [''],
      mnt_honor: [''],
      mnt_remb: [''],
      mnt_net: [''],
      indice: [''],
      dat_act: [''],
      prf_typ: [''],
      prf_cod: ['']
    };

    if (type === 'acte') {
      return this.fb.group({
        ...baseFields,
        cod_act: ['', Validators.required]
      });
    } else if (type === 'visite') {
      return this.fb.group({
        ...baseFields,
        cod_visit: ['', Validators.required],
        prix_visit: [''],
        taux_remb: [''],
        mut_mnt_net: [''],
        decis_med: ['']
      });
    } else if (type === 'phar') {
      return this.fb.group({
        ...baseFields,
        cod_med: [''],
        accord_med: [''],
        num_pec_med: [''],
        mdc_prix: [''],
        med_prix: [''],
        prix_remb: [''],
        mut_mnt_net: [''],
        nbr_j: [''],
        decis_med: ['']
      });
    } else {
      return this.fb.group({
        ...baseFields,
        cod_app: ['', Validators.required],
        accord_app: [''],
        num_pec_app: ['']
      });
    }
  }

  clearAllDetails(): void {
    this.acte.clear();
    this.visite.clear();
    this.phar.clear();
    this.appareil.clear();

    this.actes = [];
    this.libAct = [];
    this.visiteCode = [];
    this.libVisite = [];
    this.Med = [];
    this.libMed = [];
    this.appareilCode = [];
    this.libAppareil = [];
  }

  calculateAllTotals(): void {
    this.calculateTotals('acte');
    this.calculateTotals('visite');
    this.calculateTotals('phar');
    this.calculateTotals('appareil');
  }

  calculateTotals(type: string): void {
    const formArray = type === 'acte' ? this.acte :
      type === 'visite' ? this.visite :
        type === 'phar' ? this.phar : this.appareil;

    const honoraires = formArray.controls.reduce((sum, ligne) => {
      const val = ligne.get('mnt_honor')?.value;
      const honor = parseFloat(val) || 0;
      return sum + honor;
    }, 0);

    const net = formArray.controls.reduce((sum, ligne) => {
      // Check both mnt_remb and mnt_net as fallback
      const remb = ligne.get('mnt_remb')?.value;
      const netVal = ligne.get('mnt_net')?.value;
      const mnt = parseFloat(remb) || parseFloat(netVal) || 0;
      return sum + mnt;
    }, 0);

    if (type === 'acte') {
      this.totalHonoraires = honoraires;
      this.totalNet = net;
    } else if (type === 'visite') {
      this.totalHonorairesVisite = honoraires;
      this.totalNetVisite = net;
    } else if (type === 'phar') {
      this.totalHonorairesPhar = honoraires;
      this.totalNetPhar = net;
    } else {
      this.totalHonorairesAppareil = honoraires;
      this.totalNetAppareil = net;
    }

    // Recompute current bulletin line total and bordereau grand total
    if (this.selectedRow !== null && this.selectedRow !== undefined) {
      this.recomputeCurrentLineNet(this.selectedRow);
      this.calculateTotalsTot();
    }
  }

  recomputeCurrentLineNet(index: number): void {
    if (index === null || index === undefined) return;

    const sumNet = (arr: FormArray) => arr?.controls.reduce((sum, c) => {
      const v1 = c.get('mnt_remb')?.value;
      const v2 = c.get('mnt_net')?.value;
      return sum + (parseFloat(v1) || parseFloat(v2) || 0);
    }, 0) || 0;

    const actesNet = sumNet(this.acte);
    const visitesNet = sumNet(this.visite);
    const pharNet = sumNet(this.phar);
    const appNet = sumNet(this.appareil);

    const newTotNet = actesNet + visitesNet + pharNet + appNet;

    // Also compute tot_honor if needed
    const actesHonor = this.acte?.controls.reduce((sum, c) => sum + (parseFloat(c.get('mnt_honor')?.value) || 0), 0) || 0;
    const visitesHonor = this.visite?.controls.reduce((sum, c) => sum + (parseFloat(c.get('mnt_honor')?.value) || 0), 0) || 0;
    const pharHonor = this.phar?.controls.reduce((sum, c) => sum + (parseFloat(c.get('mnt_honor')?.value) || 0), 0) || 0;
    const appHonor = this.appareil?.controls.reduce((sum, c) => sum + (parseFloat(c.get('mnt_honor')?.value) || 0), 0) || 0;

    const newTotHonor = actesHonor + visitesHonor + pharHonor + appHonor;

    const ligne = this.lignes.at(index);
    if (ligne) {
      ligne.patchValue({
        tot_net: newTotNet,
        tot_honor: newTotHonor,
        tot_remb: newTotNet
      }, { emitEvent: false }); // Avoid infinite loop if tot_net change triggers something
    }
  }

  calculateTotalsTot(): void {
    console.log("this.tot :", this.lignes);
    this.totalNetTot = this.lignes.controls.reduce((sum, ligne) => {
      const net = parseFloat((ligne.get('tot_net')?.value || '0')) || 0;
      return sum + net;
    }, 0);

    this.totalHonoraireTot = this.lignes.controls.reduce((sum, ligne) => {
      const honor = parseFloat((ligne.get('tot_honor')?.value || '0')) || 0;
      return sum + honor;
    }, 0);

    const nbrBult = this.lignes.controls.filter(l => l.get('num_retr')?.value || l.get('mat_pers')?.value).length;

    const patchData: any = {
      tot_honor: this.totalHonoraireTot,
      tot_net: this.totalNetTot,
      nbr_bult: nbrBult
    };

    patchData.tot_remb = this.totalNetTot;
    this.BordEnvoiForm.patchValue(patchData);
  }

  saveBordereau(): void {
    if (this.isReadOnly) {
      Swal.fire('Info', 'Ce bordereau est validé et ne peut pas être modifié', 'info');
      return;
    }

    if (!this.BordEnvoiForm.valid) {
      Swal.fire('Attention', 'Veuillez remplir tous les champs requis', 'warning');
      return;
    }

    Swal.fire({
      title: 'Sauvegarde en cours...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const bordData = {
      ...this.BordEnvoiForm.value,
      typ_bord: 'C',
      cod_soc: this.token.getUser().codSoc,
      dat_bord: this.formatDate(this.BordEnvoiForm.value.dat_bord),
      dat_deb: this.formatDate(this.BordEnvoiForm.value.dat_deb),
      dat_fin: this.formatDate(this.BordEnvoiForm.value.dat_fin)
    };

    // Exclude UI-only helper fields and format data for backend
    const bulletinsData = this.lignes.value.map((bulletin: any) => {
      const { num_retr, nom_prenom, nom, originalIndex, ...rest } = bulletin;
      const data = {
        ...rest,
        cod_soc: this.token.getUser().codSoc,
        num_assur: num_retr, // Map num_retr to num_assur for backend entity
        dat_soin: this.formatDate(rest.dat_soin),
        dat_saisie: this.formatDate(rest.dat_saisie),
        tot_honor: rest.tot_honor || 0,
        tot_net: rest.tot_net || 0,
        tot_remb: rest.tot_net || 0,
        nat_bult: 'C'
      };

      // Convert empty strings to null for consistency with backend
      Object.keys(data).forEach(k => {
        if ((data as any)[k] === '') (data as any)[k] = null;
      });

      return data;
    });

    this.servRemb.addBBordArriver(bordData).subscribe({
      next: () => {
        this.servRemb.addBultArriver(bulletinsData).subscribe({
          next: () => {
            this.saveAllDetails();
          },
          error: (err) => {
            console.error('Error saving bulletins:', err);
            this.showServerError();
          }
        });
      },
      error: (err) => {
        console.error('Error saving bordereau:', err);
        this.showServerError();
      }
    });
  }

  saveAllDetails(): void {
    if (!this.bultArriver) {
      console.error('No bulletin selected');
      Swal.fire('Erreur', 'Aucun bulletin sélectionné', 'error');
      return;
    }

    // Get bulletin context
    const bulletinContext = {
      cod_soc: this.bultArriver.cod_soc || this.token.getUser().codSoc,
      mat_pers: this.bultArriver.mat_pers,
      num_fam: this.bultArriver.num_fam,
      dat_soin: this.formatDate(this.bultArriver.dat_soin)
    };

    // Format dates, add context, and sanitize fields to avoid ORA-12899 (PRF_TYP max 1)
    const sanitizeDetail = (item: any, index: number) => {
      const sanitized = {
        ...item,
        mnt_net: item.mnt_net || item.mnt_remb,
        num_lig: item.num_lig || (index + 1), // Use explicit index
        ...bulletinContext,
        dat_act: this.formatDate(item.dat_act)
      };

      // Ensure prf_typ is at most 1 character to match database constraint (ORA-12899)
      if (sanitized.prf_typ && sanitized.prf_typ.length > 1) {
        sanitized.prf_typ = sanitized.prf_typ.substring(0, 1);
      }

      // Clean up empty strings, but keep critical codes as '' if they must not be null
      Object.keys(sanitized).forEach(k => {
        if (sanitized[k] === '' && !k.startsWith('abrv_') && !k.startsWith('cod_')) {
          sanitized[k] = null;
        }
      });

      return sanitized;
    };

    const acteData = this.acte.value
      .filter((item: any) => item.cod_act && item.cod_act !== '')
      .map((item: any, idx: number) => {
        const sanitized = sanitizeDetail(item, idx);
        // Ensure abrv_act is populated as it's a mandatory field
        if (!sanitized.abrv_act) {
          const ref = this.listActe.find(a => a.cod_act === sanitized.cod_act);
          sanitized.abrv_act = ref?.abrv_act || ref?.abrv_Act || 'A'; // Ultimate fallback to avoid ORA-01400
        }
        // Ensure date is set (fallback to treatment date if missing)
        if (!sanitized.dat_act) sanitized.dat_act = bulletinContext.dat_soin;
        return sanitized;
      });

    const visiteData = this.visite.value
      .filter((item: any) => item.cod_visit && item.cod_visit !== '')
      .map((item: any, idx: number) => {
        const sanitized = sanitizeDetail(item, idx);
        if (!sanitized.abrv_act) {
          const ref = this.listVisite.find(a => a.cod_Visit === sanitized.cod_visit);
          sanitized.abrv_act = ref?.abrv_act || ref?.abrv_Act || 'V';
        }
        if (!sanitized.dat_act) sanitized.dat_act = bulletinContext.dat_soin;
        return sanitized;
      });

    const pharData = this.phar.value
      .filter((item: any) => item.cod_med && item.cod_med !== '')
      .map((item: any, idx: number) => {
        const sanitized = sanitizeDetail(item, idx);
        if (!sanitized.abrv_act) sanitized.abrv_act = 'M'; // Typically static for drugs
        if (!sanitized.dat_act) sanitized.dat_act = bulletinContext.dat_soin;
        return sanitized;
      });

    const appareilData = this.appareil.value
      .filter((item: any) => item.cod_app && item.cod_app !== '')
      .map((item: any, idx: number) => {
        const sanitized = sanitizeDetail(item, idx);
        if (!sanitized.abrv_act) sanitized.abrv_act = 'P'; // typically P for prophylaxis/appareil
        if (!sanitized.dat_act) sanitized.dat_act = bulletinContext.dat_soin;
        return sanitized;
      });

    console.log('Saving details with context (Filtered & Guaranteed):', { bulletinContext, acteData, visiteData, pharData, appareilData });

    // Only proceed if there is at least something to save, or if you want to allow empty save (check backend requirement)
    this.servRemb.addAllLigBultArriver(visiteData, acteData, pharData, appareilData).subscribe({
      next: (response) => {
        Swal.fire('Succès', 'Bordereau enregistré avec succès', 'success');
        this.loadBulletins(this.cod_bord, this.codeAssur);
        this.getAllBordEnvoi();
        this.markAllPristine();
      },
      error: (err) => {
        console.error('Error saving details:', err);
        this.showServerError();
      }
    });
  }

  formatDate(d: any): string {
    if (!d) return '';
    if (typeof d === 'string') {
      if (d.includes('/')) return d;
      // Handle ddmmyyyy format
      if (d.length === 8 && /^\d{8}$/.test(d)) {
        return `${d.substring(0, 2)}/${d.substring(2, 4)}/${d.substring(4, 8)}`;
      }
      // Handle yyyy-mm-dd format
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        const [year, month, day] = d.split("-");
        return `${day}/${month}/${year}`;
      }
    }
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  search(item: any): void {
    this.onSelectedValueBordArriver(item);
  }

  // ===== ACTE METHODS =====
  addActe(): void {
    this.acte.push(this.createDetailGroup('acte'));
    this.ligActeForm.markAsDirty();
    const index = this.acte.length - 1;

    if (index > 0) {
      const prevDate = this.acte.at(index - 1).get('dat_act')?.value;
      if (prevDate) {
        this.acte.at(index).patchValue({ dat_act: prevDate });
      }
    }

    this.calculateTotals('acte');
  }

  // ===== MODAL METHODS =====
  confirm(index: any, content: any) {
    this.selectedIndex = index;
    this.modalService.open(content, { centered: true });
  }

  confirmMed(index: any, content: any) {
    this.selectedIndexMed = index;
    this.modalService.open(content, { centered: true });
  }

  confirmVisit(index: any, content: any) {
    this.selectedIndexVisit = index;
    this.modalService.open(content, { centered: true });
  }

  confirmApp(index: any, content: any) {
    this.selectedIndexApp = index;
    this.modalService.open(content, { centered: true });
  }

  ConfirmDelete(index: number): void {
    const ligne = this.acte.at(index).value;
    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
      num_lig: ligne.num_lig
    };

    this.serv.existeLigActArriver(cle).subscribe({
      next: (exists: boolean) => {
        if (exists) {
          this.serv.deleteLigActArriver(
            ligne.cod_soc, ligne.mat_pers, ligne.num_fam, ligne.dat_soin,
            ligne.abrv_act, ligne.num_lig, ligne.dat_act, ligne.cod_act
          ).subscribe({
            next: () => {
              this.acte.removeAt(index);
              this.ligActeForm.markAsDirty();
              this.actes.splice(index, 1);
              this.libAct.splice(index, 1);
              this.calculateTotals('acte');
              this.modalService.dismissAll();
            },
            error: (err) => console.error('Error deleting acte:', err)
          });
        } else {
          this.acte.removeAt(index);
          this.ligActeForm.markAsDirty();
          this.actes.splice(index, 1);
          this.libAct.splice(index, 1);
          this.calculateTotals('acte');
          this.modalService.dismissAll();
        }
      }
    });
  }

  onSelectedActe(selectedValue: any, index: number): void {
    if (!selectedValue) return;

    this.selectedAct = selectedValue;
    const selectedActe = this.listActe?.find(acte => acte?.cod_act === selectedValue?.cod_act);
    this.libAct[index] = selectedActe?.lib_act || '';
    this.actes[index] = selectedValue?.cod_act || '';

    const currentHonor = this.acte.at(index).get('mnt_honor')?.value;
    const currentRemb = this.acte.at(index).get('mnt_remb')?.value;

    this.acte.at(index).patchValue({
      abrv_act: selectedValue?.abrv_act || selectedValue?.abrv_Act || selectedActe?.abrv_act || selectedActe?.abrv_Act || '',
      cod_act: selectedValue?.cod_act || '',
      num_lig: (this.acte.at(index).get('num_lig')?.value) || (index + 1),
      mnt_honor: (currentHonor === '' || currentHonor === null || currentHonor === undefined) ? 0 : currentHonor,
      mnt_remb: (currentRemb === '' || currentRemb === null || currentRemb === undefined) ? 0 : currentRemb
    });
  }

  calcul_mnt_net(event: any, index: number): void {
    if (!event.target.value) {
      Swal.fire({
        title: 'Message',
        text: 'Mnt honor est obligatoire',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
    }
    this.calculateTotals('acte');
  }

  // ===== VISITE METHODS =====
  addLigneVisite(): void {
    this.visite.push(this.createDetailGroup('visite'));
    this.ligVisiteForm.markAsDirty();
    const index = this.visite.length - 1;

    if (index > 0) {
      const prevDate = this.visite.at(index - 1).get('dat_act')?.value;
      if (prevDate) {
        this.visite.at(index).patchValue({ dat_act: prevDate });
      }
    }

    this.calculateTotals('visite');
  }

  ConfirmDeleteVisit(index: number): void {
    const ligne = this.visite.at(index).value;
    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
      num_lig: ligne.num_lig
    };

    this.serv.existeLigVisitArriver(cle).subscribe({
      next: (exists: boolean) => {
        if (exists) {
          this.serv.deleteLigVisitArriver(
            ligne.cod_soc, ligne.mat_pers, ligne.num_fam, ligne.dat_soin,
            ligne.abrv_act, ligne.dat_act, ligne.cod_visit, ligne.num_lig
          ).subscribe({
            next: () => {
              this.visite.removeAt(index);
              this.ligVisiteForm.markAsDirty();
              this.visiteCode.splice(index, 1);
              this.libVisite.splice(index, 1);
              this.calculateTotals('visite');
              this.modalService.dismissAll();
            },
            error: (err) => console.error('Error deleting visite:', err)
          });
        } else {
          this.visite.removeAt(index);
          this.ligVisiteForm.markAsDirty();
          this.visiteCode.splice(index, 1);
          this.libVisite.splice(index, 1);
          this.calculateTotals('visite');
          this.modalService.dismissAll();
        }
      }
    });
  }

  onSelectedVisite(selectedValue: any, index: number): void {
    if (!selectedValue) return;

    this.selectedVisit = selectedValue;
    const selectedActe = this.listVisite?.find(acte => acte?.cod_Visit === selectedValue?.cod_Visit);
    this.libVisite[index] = selectedActe?.lib_Visit || '';
    this.visiteCode[index] = selectedValue?.cod_Visit || '';

    const currentHonor = this.visite.at(index).get('mnt_honor')?.value;
    const currentRemb = this.visite.at(index).get('mnt_remb')?.value;

    this.visite.at(index).patchValue({
      cod_visit: selectedValue?.cod_Visit || '',
      abrv_act: selectedValue?.abrv_act || selectedValue?.abrv_Act || selectedActe?.abrv_act || selectedActe?.abrv_Act || '',
      num_lig: (this.visite.at(index).get('num_lig')?.value) || (index + 1),
      mnt_honor: (currentHonor === '' || currentHonor === null || currentHonor === undefined) ? 0 : currentHonor,
      mnt_remb: (currentRemb === '' || currentRemb === null || currentRemb === undefined) ? 0 : currentRemb
    });
  }

  calcul_mnt_net_visite(event: any, index: number): void {
    if (!event.target.value) {
      Swal.fire({
        title: 'Message',
        text: 'Mnt honor est obligatoire',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
    }
    this.calculateTotals('visite');
  }

  calculateTotalsVisite(): void {
    this.calculateTotals('visite');
  }

  // ===== MEDICAMENT METHODS =====
  addLignePhar(): void {
    this.phar.push(this.createDetailGroup('phar'));
    this.ligPharForm.markAsDirty();
    const index = this.phar.length - 1;

    if (index > 0) {
      const prevDate = this.phar.at(index - 1).get('dat_act')?.value;
      if (prevDate) {
        this.phar.at(index).patchValue({ dat_act: prevDate });
      }
    }

    this.calculateTotals('phar');
  }

  ConfirmDeleteMed(index: number): void {
    const ligne = this.phar.at(index).value;
    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
      num_lig: ligne.num_lig
    };

    this.serv.existeLigMedArriver(cle).subscribe({
      next: (exists: boolean) => {
        if (exists) {
          this.serv.deleteLigMedArriver(
            ligne.cod_soc, ligne.mat_pers, ligne.num_fam, ligne.dat_soin,
            ligne.abrv_act, ligne.num_lig, ligne.cod_med
          ).subscribe({
            next: () => {
              this.phar.removeAt(index);
              this.ligPharForm.markAsDirty();
              this.Med.splice(index, 1);
              this.libMed.splice(index, 1);
              this.calculateTotals('phar');
              this.modalService.dismissAll();
            },
            error: (err) => console.error('Error deleting pharma:', err)
          });
        } else {
          this.phar.removeAt(index);
          this.ligPharForm.markAsDirty();
          this.Med.splice(index, 1);
          this.libMed.splice(index, 1);
          this.calculateTotals('phar');
          this.modalService.dismissAll();
        }
      }
    });
  }

  onSelectedMed(selectedValue: any, index: number): void {
    if (!selectedValue) return;

    this.selectedMed = selectedValue;
    const selectedMed = this.listMed?.find(acte => acte?.cod_med === selectedValue?.cod_med);
    this.libMed[index] = selectedMed?.lib_med || '';
    this.Med[index] = selectedValue?.cod_med || '';

    const currentHonor = this.phar.at(index).get('mnt_honor')?.value;
    const currentRemb = this.phar.at(index).get('mnt_remb')?.value;

    this.phar.at(index).patchValue({
      cod_med: selectedValue?.cod_med || '',
      abrv_act: selectedValue?.abrv_act || selectedValue?.abrv_Act || selectedMed?.abrv_act || selectedMed?.abrv_Act || '',
      num_lig: (this.phar.at(index).get('num_lig')?.value) || (index + 1),
      mdc_prix: selectedValue?.mdc_prix || null,
      mnt_honor: (currentHonor === '' || currentHonor === null || currentHonor === undefined) ? 0 : currentHonor,
      mnt_remb: (currentRemb === '' || currentRemb === null || currentRemb === undefined) ? 0 : currentRemb
    });
  }

  calcul_mnt_netPhar(event: any, index: number): void {
    if (!event.target.value) {
      Swal.fire({
        title: 'Message',
        text: 'Mnt honor est obligatoire',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
    }
    this.calculateTotals('phar');
  }

  calculateTotalsPhar(): void {
    this.calculateTotals('phar');
  }

  // ===== APPAREIL METHODS =====
  addLigneAppareil(): void {
    this.appareil.push(this.createDetailGroup('appareil'));
    this.ligAppareilForm.markAsDirty();
    const index = this.appareil.length - 1;

    if (index > 0) {
      const prevDate = this.appareil.at(index - 1).get('dat_act')?.value;
      if (prevDate) {
        this.appareil.at(index).patchValue({ dat_act: prevDate });
      }
    }

    this.calculateTotals('appareil');
  }

  ConfirmDeleteApp(index: number): void {
    const ligne = this.appareil.at(index).value;
    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
      num_lig: ligne.num_lig
    };

    this.serv.existeLigAppArriver(cle).subscribe({
      next: (exists: boolean) => {
        if (exists) {
          this.serv.deleteLigAppArriver(
            ligne.cod_soc, ligne.mat_pers, ligne.num_fam, ligne.dat_soin,
            ligne.abrv_act, ligne.num_lig, ligne.cod_app
          ).subscribe({
            next: () => {
              this.appareil.removeAt(index);
              this.ligAppareilForm.markAsDirty();
              this.appareilCode.splice(index, 1);
              this.libAppareil.splice(index, 1);
              this.calculateTotals('appareil');
              this.modalService.dismissAll();
            },
            error: (err) => console.error('Error deleting appareil:', err)
          });
        } else {
          this.appareil.removeAt(index);
          this.ligAppareilForm.markAsDirty();
          this.appareilCode.splice(index, 1);
          this.libAppareil.splice(index, 1);
          this.calculateTotals('appareil');
          this.modalService.dismissAll();
        }
      }
    });
  }

  ConfirmDeleteBulletin(index: number): void {
    const bult = this.lignes.at(index).value;

    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Voulez-vous vraiment supprimer ce bulletin et tous ses services associés ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.serv.deleteBultArrive(
          bult.cod_soc, bult.mat_pers, bult.num_fam, bult.dat_soin
        ).subscribe({
          next: () => {
            Swal.fire('Supprimé !', 'Le bulletin a été supprimé avec succès.', 'success');
            if (this.selectedRow === index) {
              this.selectedBulletinKey = '';
            }
            this.removeLocalRow(index);
          },
          error: (err) => {
            console.error("Erreur suppression bulletin:", err);
            Swal.fire('Erreur', 'Impossible de supprimer le bulletin. Il est peut-être déjà validé.', 'error');
          }
        });
      }
    });
  }

  removeLocalRow(index: number) {
    this.lignes.removeAt(index);

    // Remove from parallel arrays
    if (this.numRetr.length > index) this.numRetr.splice(index, 1);
    if (this.NumFam.length > index) this.NumFam.splice(index, 1);
    if (this.NomPrenom.length > index) this.NomPrenom.splice(index, 1);
    if (this.Nom.length > index) this.Nom.splice(index, 1);

    // Adjust selectedRow
    if (this.selectedRow === index) {
      this.selectedRow = null;
    } else if (this.selectedRow != null && this.selectedRow > index) {
      this.selectedRow--;
    }

    // Recalculate global totals for bordereau if needed
    // this.calculateGrandTotals();
  }

  onSelectedAppareil(selectedValue: any, index: number): void {
    if (!selectedValue) return;

    this.selectedApp = selectedValue;
    const selectedApp = this.listAppareil?.find(acte => acte?.cod_app === selectedValue?.cod_app);
    this.libAppareil[index] = selectedApp?.lib_app || '';
    this.appareilCode[index] = selectedValue?.cod_app || '';

    const currentHonor = this.appareil.at(index).get('mnt_honor')?.value;
    const currentRemb = this.appareil.at(index).get('mnt_remb')?.value;

    this.appareil.at(index).patchValue({
      cod_app: selectedValue?.cod_app || '',
      abrv_act: selectedValue?.abrv_act || selectedValue?.abrv_Act || selectedApp?.abrv_act || selectedApp?.abrv_Act || '',
      num_lig: (this.appareil.at(index).get('num_lig')?.value) || (index + 1),
      mnt_honor: (currentHonor === '' || currentHonor === null || currentHonor === undefined) ? 0 : currentHonor,
      mnt_remb: (currentRemb === '' || currentRemb === null || currentRemb === undefined) ? 0 : currentRemb
    });
  }

  calcul_mnt_net_app(event: any, index: number): void {
    if (!event.target.value) {
      Swal.fire({
        title: 'Message',
        text: 'Mnt honor est obligatoire',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
    }
    this.calculateTotals('appareil');
  }

  calculateTotalsAppareil(): void {
    this.calculateTotals('appareil');
  }

  getCalculateTotNet(): number {
    return (this.lignes.value || []).reduce((acc: number, curr: any) => {
      return acc + (parseFloat(curr.tot_net) || 0);
    }, 0);
  }

  private showServerError(): void {
    Swal.fire({
      icon: 'error',
      title: 'Erreur serveur',
      text: 'Une erreur est survenue lors de la sauvegarde',
      confirmButtonText: 'OK'
    });
  }

  GetAllRegimeRemb() {
    this.serv.GetAllRegimeRemb().subscribe({
      next: (data: any) => {
        this.ListeRegimeRemb = data;
      },
      error: (err) => {
        console.error("❌ Error fetching regime remb:", err);
      }
    });
  }

  // Custom sort for dates in format dd/MM/yyyy
  customDateSort(event: any) {
    event.data.sort((data1: any, data2: any) => {
      let value1 = data1.get(event.field.replace('value.', ''))?.value;
      let value2 = data2.get(event.field.replace('value.', ''))?.value;

      if (!value1 && !value2) return 0;
      if (!value1) return -1;
      if (!value2) return 1;

      let date1 = this.parseDate(value1);
      let date2 = this.parseDate(value2);

      return (date1.getTime() - date2.getTime()) * event.order;
    });
  }

  private parseDate(dateStr: string): Date {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(+parts[2], +parts[1] - 1, +parts[0]);
    }
    return new Date(0);
  }
}
