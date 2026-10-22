import { ChangeDetectorRef, Component } from "@angular/core";
import { ReceptionRemboursementService } from "../reception-remboursement.service";
import { HttpErrorResponse } from "@angular/common/http";
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PaginationService } from "src/app/core/services/pagination.service";
import { TokenStorage } from "src/app/account/token-storage.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import Swal from "sweetalert2";
import { BulletinSoinService } from "../../Bulletin de soins/bulletin-soin.service";
import { SaveService } from "src/app/shared/Service/save.service";
import { map, forkJoin, tap, finalize, catchError, of, switchMap } from "rxjs";
import { EnvoiServiceService } from "../../Envoi/envoi-service.service";

export interface BordArriver {
  dat_bord: string;
  tot_remb: string;
  valid: string;
  nbr_bult: string;
  cod_bord: string;
  cod_assur: string;
}

@Component({
  selector: "app-saisie-manu-bord-cnam",
  templateUrl: "./saisie-manu-bord-cnam.component.html",
  styleUrl: "./saisie-manu-bord-cnam.component.scss",
})
export class SaisieManuBordCnamComponent {
  breadCrumbItems!: Array<{}>;
  BordEnvoiForm!: FormGroup;
  ligPretForm!: FormGroup
  ligPharForm!: FormGroup
  ligVisiteForm!: FormGroup
  ligAppareilForm!: FormGroup
  SaisieBordEnvoiForm!: FormGroup;
  SaisieBulletinForm!: FormGroup;
  ListePersonnel: any[] = [];
  selectedRow: any
  ListeFamillePersonnel: any[] = [];
  columnBordArriver: any[] = [];
  bultArriver: any
  error: string | null = null;
  codBord: string = "";
  dateBord: string = "";
  cod_bord: string = "";
  num_fam: string = ""
  AllBordArriver: any[] = [];
  ListeAssurance: any[] = [];
  ListeRegimeRemb: any[] = [];
  columnAssuranc: any[] = [];
  columnPersonnel: any[] = [];
  listActe: any[] = []
  listMed: any[] = []
  listRegimeRemb: any[] = []
  listPEC: any[] = []
  listRefEtablis: any[] = []
  listRefEtablisVisit: any[] = []
  listRefEtablisMed: any[] = []
  listRefEtablisApp: any[] = []
  listVisite: any[] = []
  listAppareil: any[] = []
  ligBult: any[] = []

  columnsMat: any[] = []
  columnsAdherent: any[] = []
  columnsBultSoin: any[] = []
  columnActe: any[] = []
  columnsMed: any[] = []
  columnsPEC: any[] = []
  columnsRefEtablis: any[] = []
  columnsRefEtablisVisit: any[] = []
  columnsRefEtablisMed: any[] = []
  columnsRefEtablisApp: any[] = []
  columnVisite: any[] = []
  columnsAppareil: any[] = []
  columneFamillePersonnel: any[] = [];

  actes: string[] = []
  visiteCode: string[] = []
  appareilCode: string[] = []
  Med: string[] = []
  refEtablisVisit: string[] = []
  refEtablis: string[] = []
  refEtablisPhar: string[] = []
  refEtablisApp: string[] = []
  libAssur: string = "";
  numRetr: string[] = []
  matPers: string[] = []
  NomPrenom: string[] = []
  Fill: string[] = []
  Nom: string[] = []
  NumFam: any[] = []
  ListeFamillePersonnelParLigne: Record<number, any[]> = {};

  DatSoin: string = "";
  datNaiss: string = "";
  codeAssur: string = "";
  mntNet: number = 0
  mntNetPhar: number = 0
  isDisabled!: boolean;
  isSearch: boolean = true;
  isLoading: boolean = false;
  isProcessingSearch: boolean = false;
  isSaving: boolean = false;

  // Cache for storing bulletin details (Actes, Visites, etc.) when switching rows
  bulletinDetailsCache: { [key: number]: any } = {};

  // Separate lists for LOV to form a single source of truth for all tables
  listRef_Personne: any[] = [];
  listRef_Etab: any[] = [];
  pendingRestoreIndex: number | null = null; // To restore selection after auto-save redirect


  // Dynamic page title and print button logic
  pageTitle: string = 'Saisie manuelle du bordereau arrivés CNAM';
  isPrintButtonsDisabled: boolean = false;

  // Row completion tracking
  completedRows: Set<number> = new Set();

  // ✅ Dual Source Mode Flag (True = Arrive, False = Envoi/Initialization)
  public isArriverMode: boolean = true;
  isLoadingDetails: boolean = false; // ✅ FLAG: Prevents saving cleared state
  selectedIndex: number | null = null;
  selectedIndexMed: number | null = null;
  selectedIndexVisit: number | null = null;
  selectedIndexApp: number | null = null;

  constructor(
    private serv: ReceptionRemboursementService,
    private servRemb: BulletinSoinService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private token: TokenStorage,
    private saveService: SaveService,
    private cdRef: ChangeDetectorRef,
    private envoiServ: EnvoiServiceService
  ) {
    this.SaisieBulletinForm = this.fb.group({
      lignes: this.fb.array([]),
    });
  }


  get lignes(): FormArray {
    return this.SaisieBulletinForm.get("lignes") as FormArray;
  }


  createLigne(): FormGroup {
    return this.fb.group({
      cod_soc: [this.token.getUser().codSoc],
      mat_pers: [""],
      num_fam: [""],
      dat_soin: [""],
      cod_bord: [""],
      cod_assur: [""],
      num_soin: [""],
      ord_bult: [""],
      tot_honor: [0],
      tot_net: [0],
      tot_remb: [0],
      reg_remb: [""],
      cod_malad: [""],
      num_pec: [""],
      cod_fil: [""],
      num_assur: [""],
      dat_prev_accouch: [""],
      nat_bult: [""],
      mat_pers_conj: [""],
      num_ass_conj: [""],
      dat_saisie: [""],
      obs: [""],
      obs_a: [""],
      envoi: [""],
      reclam: [""],
      typ_bult: [""],
      ann_plaf_imp: [""],
      tot_remb_med: [""],
      num_soin_cnam: [""],
      decis_med: [""],
      reg_adh: [""],
      mod_pay: [""],
      dat_vir: [""],
    });
  }

  ngOnInit() {


    this.saveService.isSearch$.subscribe(isSearch => {
      // this.isSearch = isSearch;

      console.log("test : search", this.isSearch);
      // POTENTIAL BUG: This forces 'envoi' mode on every isSearch emission, which might override 'arriver'.
      // Commenting out to verify if this fixes the "Always Enabled" save button.
      // this.prepareForModeSwitch('envoi');

    });
    this.Nom[0] = '';
    this.libVisite[0] = '';
    this.libAct[0] = '';
    this.libAppareil[0] = '';
    this.etab_rsoc_visite[0] = '';
    this.libMed[0] = '';
    this.etab_rsoc_phar[0] = '';
    this.etab_rsoc_appareil[0] = '';
    this.etab_rsoc[0] = '';

    this.getAllAssurance();
    this.GetAllRegimeRemb();
    this.getAllBordArriverList();

    // Pre-load reference lists for All Tables (Actes, Visites, Pharmacies, Appareils)
    this.servRemb.getRefPhysique('1').subscribe((data: any) => {
      this.listRef_Personne = data;
    });
    this.servRemb.getRefPhysique('2').subscribe((data: any) => {
      this.listRef_Etab = data;
    });

    // Unify column definitions
    const commonCols = [
      { key: "prf_cod", label: "Code" },
      { key: "etab_rsoc", label: "Nom & Prénom" },
      { key: "met_etab", label: "Etablis" },
    ];
    this.columnsRefEtablis = commonCols;
    this.columnsRefEtablisVisit = commonCols;
    this.columnsRefEtablisMed = commonCols;
    this.columnsRefEtablisApp = commonCols;


    // ✅ CRITICAL: Register save callback for row-by-row save
    this.saveService.registerSaveCallback(() => this.saveCurrentRow());
    this.saveService.setDisabled(true); // Reversed logic: true = button ENABLED

    // ✅ SUBSCRIBE TO ADD NEW BUTTON (RESET PAGE)
    this.saveService.add$.subscribe((isAdded) => {
      if (isAdded) {
        console.log("🆕 'Add New' button clicked - Resetting Page");
        this.resetPage();
        this.saveService.setAdded(false); // Reset flag
      }
    });

    this.SaisieBordEnvoiForm = this.fb.group({
      cod_bord: [""],
      cod_assur: [""],
      dat_bord: [""],
      dat_deb: [""],
      dat_fin: [""],
      nbr_bult: [""],
      tot_honor: [""],
      typ_bord: [""],
      cod_soc: [""],
      tot_net: [""],
      valid_bord: [""],
      reg_bord: [""],
      tot_remb: [0],
      valid: [""],
      clot_bord: [""],
      tot: [""],
      num_retr: [""],
      cod_bord_cnam: [""],
      seq_bord: [""],
    });

    this.BordEnvoiForm = this.fb.group({
      cod_bord: [""],
      cod_assur: [""],
      dat_bord: [""],
      dat_deb: [""],
      dat_fin: [""],
      nbr_bult: [""],
      tot_honor: [""],
      typ_bord: [""],
      cod_soc: [""],
      tot_net: [""],
      valid_bord: [""],
      reg_bord: [""],
      tot_remb: [0],
      valid: [""],
      clot_bord: [""],
      tot: [""],
      num_retr: [""],
      cod_bord_cnam: [""],
      seq_bord: [""],
    });

    this.breadCrumbItems = [];

    this.ligPretForm = this.fb.group({
      acte: this.fb.array([])
    });

    this.ligPharForm = this.fb.group({
      phar: this.fb.array([])
    });

    this.ligVisiteForm = this.fb.group({
      visite: this.fb.array([])
    });

    this.ligAppareilForm = this.fb.group({
      appareil: this.fb.array([])
    });

    // Initialize columns for BOTH searches
    this.columnBordArriver = [
      { key: "cod_bord", label: "Code de bordereau" },
      { key: "dat_bord", label: "Date de bordereau" },
    ];
  }

  ngOnDestroy() {
    // Clear the callback to avoid memory leaks
    this.saveService.clearSaveCallback();
  }
  getAllBordArriverList(): void {
    this.serv.getAllBordEnvoi(this.token.getUser().codSoc).subscribe({
      next: (data) => {
        this.AllBordArriver = data;
        console.log("Liste des bordereaux arrivés (page search):", this.AllBordArriver);
      },
      error: (err) => {
        this.error = "Erreur lors de la récupération des bordereaux arrivés";
        console.error(err);
      },
    });
  }

  private patchBordEnvoiForm(item: any) {
    this.BordEnvoiForm.patchValue({
      cod_bord: item.cod_bord,
      cod_assur: item.cod_assur,
      dat_bord: item.dat_bord ? this.formatDate(item.dat_bord) : '',
      dat_deb: item.dat_deb ? this.formatDate(item.dat_deb) : '',
      dat_fin: item.dat_fin ? this.formatDate(item.dat_fin) : '',
      nbr_bult: item.nbr_bult,
      tot_honor: item.tot_honor ?? 0,
      typ_bord: item.typ_bord,
      cod_soc: item.cod_soc || this.token.getUser().codSoc,
      tot_net: item.tot_net ?? 0,
      valid_bord: item.valid_bord,
      reg_bord: item.reg_bord,
      tot_remb: Number(item.tot_remb) || 0,
      valid: item.valid || item.valid_bord || 'N',  // ✅ Map valid_bord to valid
      clot_bord: item.clot_bord,
      tot: item.tot ?? 0,
      num_retr: item.num_retr,
      cod_bord_cnam: item.cod_bord_cnam,
      seq_bord: item.seq_bord,
    });
  }
  searchArriver(item: any) {
    console.log('=== SEARCH DUAL SOURCE (Arrive vs Envoi) ===');
    console.log('Search item:', item);

    this.isLoading = true;
    this.isProcessingSearch = true;

    // 1️⃣ Try to find in ARRIVE table first
    this.serv.getBultArriverByCodBord2(item.cod_bord).pipe(
      catchError(err => {
        console.warn('Error checking Arrive table, falling back to empty?', err);
        return of([]); // If error, treat as empty? Or proceed to check Envoi?
      })
    ).subscribe((dataArrive: any[]) => {

      if (dataArrive && dataArrive.length > 0) {
        console.log('✅ Found in BORD_ARRIVE (Arrive Mode)');
        this.isArriverMode = true; // Set mode to Arrive
        this.pageTitle = 'Consultation et Modification des Bordereaux Arrivés CNAM';

        this.loadBultArriver(dataArrive);

        this.isLoading = false;
        this.isProcessingSearch = false;

      } else {
        console.log('⚠️ Not found in BORD_ARRIVE. Checking BORD_ENVOI...');

        // 2️⃣ If not found, check ENVOI table
        const codSoc = this.token.getUser().codSoc;
        // Assuming item has cod_assur, if not take from form
        const codAssur = item.cod_assur || this.BordEnvoiForm.value.cod_assur;

        this.envoiServ.findBultEnvoiByCodBord(codSoc, item.cod_bord, codAssur).pipe(
          finalize(() => {
            this.isLoading = false;
            this.isProcessingSearch = false;
          })
        ).subscribe({
          next: (dataEnvoi: any[]) => {
            if (dataEnvoi && dataEnvoi.length > 0) {
              console.log('✅ Found in BORD_ENVOI (Envoi/Init Mode)');
              this.isArriverMode = false; // Set mode to Envoi
              this.pageTitle = 'Initialisation depuis BORD_ENVOI';

              console.log('📦 Envoi Data:', dataEnvoi);
              this.loadBultArriver(dataEnvoi); // Reuse loader if structure matches

            } else {
              console.warn('❌ Not found in Envoi either.');
              this.isArriverMode = true; // Default to arrive (or handle as new?)

              (this.SaisieBulletinForm.get('lignes') as FormArray).clear();
              this.addLigne(); // Clean start

              Swal.fire({
                icon: 'info',
                title: 'Information',
                text: 'Aucun bulletin trouvé (ni Arrivé, ni Envoyé).'
              });
            }
          },
          error: (err) => {
            console.error('Error fetching Envoi data', err);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors de la récupération des données Envoi.'
            });
          }
        });
      }
    });
  }
  onSelectedValueBordArriverPage(event: any): void {
    // Skip if we're processing a top search (to avoid interference)
    if (this.isProcessingSearch) {
      console.log('=== SKIPPING PAGE SEARCH - Top search in progress ===');
      return;
    }

    console.log('=== PAGE SEARCH - ARRIVER MODE ===');
    console.log('Selected Bord Arriver:', event);

    // Set flag immediately to prevent search() from triggering
    this.isProcessingSearch = true;

    // Update page title
    this.pageTitle = 'Consultation et Modification des Bordereaux Arrivés CNAM';
    this.isPrintButtonsDisabled = false;  // Always enabled in arriver mode

    if (event) {
      // ✅ Find the complete bordereau object from AllBordArriver list
      const bordereauArriver = this.AllBordArriver.find(
        (bord: any) => bord.cod_bord === event.cod_bord
      );

      if (bordereauArriver) {
        console.log('📋 Found complete bordereau in arriver list:', bordereauArriver);
        console.log('📋 Bordereau fields:', {
          cod_bord: bordereauArriver.cod_bord,
          dat_bord: bordereauArriver.dat_bord,
          cod_assur: bordereauArriver.cod_assur,
          lib_assurance: bordereauArriver.lib_assurance,
          tot_remb: bordereauArriver.tot_remb,
          nbr_bult: bordereauArriver.nbr_bult,
          valid: bordereauArriver.valid
        });

        // ✅ Set component properties for UI binding
        this.codBord = bordereauArriver.cod_bord;
        this.cod_bord = bordereauArriver.cod_bord;
        this.dateBord = bordereauArriver.dat_bord;
        this.codeAssur = bordereauArriver.cod_assur;
        this.libAssur = bordereauArriver.lib_assurance;

        console.log('📝 Component properties set:', {
          codBord: this.codBord,
          dateBord: this.dateBord,
          codeAssur: this.codeAssur,
          libAssur: this.libAssur
        });

        // ✅ Patch the form with complete arriver data
        this.BordEnvoiForm.patchValue({
          cod_bord: bordereauArriver.cod_bord,
          dat_bord: bordereauArriver.dat_bord,
          cod_assur: bordereauArriver.cod_assur,
          tot_remb: Number(bordereauArriver.tot_remb) || 0,
          nbr_bult: bordereauArriver.nbr_bult ?? 0,
          valid: bordereauArriver.valid || 'N',
          cod_soc: this.token.getUser().codSoc
        });

        console.log('✅ Form patched with arriver data:', this.BordEnvoiForm.value);

        // ✅ Now load bulletins with complete data
        const mergedData = {
          ...this.BordEnvoiForm.value,
          ...bordereauArriver,
          cod_bord: bordereauArriver.cod_bord,
          dat_bord: bordereauArriver.dat_bord,
          num_retr: this.BordEnvoiForm.value.num_retr || event.num_retr,
          cod_assur: bordereauArriver.cod_assur,
        };

        console.log('Merged data for searchArriver:', mergedData);
        this.getListPersonnelBultSoin();
        this.searchArriver(mergedData);
      } else {
        console.error('❌ Bordereau not found in AllBordArriver list');
        console.log('Available bordereaux:', this.AllBordArriver.map((b: any) => b.cod_bord));
      }
    }
  }
  onSelectedValueBordArriver(event: any): void {
    console.log('=== TOP SEARCH - ENVOI MODE ===');
    console.log('Event:', event);

    if (event) {
      // Call the search method which properly loads bulletins from ENVOI mode
      this.search(event);
    }
  }

  printBordArrivGlobal() {
    if (!this.cod_bord) {
      Swal.fire('Avertissement', 'Veuillez sélectionner un bordereau.', 'warning');
      return;
    }
    Swal.fire({ title: 'Chargement en cours...', html: 'Veuillez patienter pendant la génération du rapport.', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
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
    Swal.fire({ title: 'Chargement en cours...', html: 'Veuillez patienter pendant la génération du rapport.', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
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
  loadBultArriver(data: any[]) {
    console.log('=== START loadBultArriver ===');
    console.log('Raw data from backend:', JSON.stringify(data, null, 2));

    if (!data || data.length === 0) {
      console.warn('No data received');
      return;
    }

    // ✅ Clear previous cache when loading a new bordereau
    this.bulletinDetailsCache = {};
    this.completedRows.clear();

    this.isLoading = true;

    // CRITICAL FIX: First, populate ListePersonnel if not already loaded
    if (!this.ListePersonnel || this.ListePersonnel.length === 0) {
      this.getListPersonnelBultSoin();
    }

    const observables = data.map((item: any, itemIndex: number) => {
      console.log(`Processing item ${itemIndex}:`, item);

      const numRetrValue = item.num_retr || item.num_assur;
      console.log(`Item ${itemIndex} - num_retr/num_assur:`, numRetrValue);

      return this.serv.getListPersonnelBultSoin(
        this.token.getUser().codSoc,
        numRetrValue,
        this.cod_bord
      ).pipe(
        map((refData: any) => {
          console.log(`Personnel data for item ${itemIndex}:`, refData);
          return { item, refData, numRetrValue };
        })
      );
    });

    forkJoin(observables).subscribe((results) => {
      console.log('=== Personnel lookup results ===', results);

      // CRITICAL FIX: Set numRetr array with actual values from data
      this.numRetr = results.map(({ item }) => item.num_retr || item.num_assur);
      console.log('numRetr array set to:', this.numRetr);

      // CRITICAL FIX: Also populate NomPrenom array here
      this.NomPrenom = results.map(({ item }) => item.nom_prenom || '');
      console.log('NomPrenom array set to:', this.NomPrenom);

      const familleObservables = results.map(({ item }, index) =>
        this.serv.getListFamillePersonnelBultSoinLibre(
          this.token.getUser().codSoc,
          item.mat_pers
        ).pipe(
          map((familleList: any[]) => ({ index, familleList, item }))
        )
      );

      forkJoin(familleObservables).subscribe((familleResults) => {
        this.ListeFamillePersonnelParLigne = {};
        this.NumFam = [];
        this.Nom = [];

        familleResults.forEach(({ index, familleList, item }) => {
          this.ListeFamillePersonnelParLigne[index] = familleList || [];
          this.NumFam[index] = (item.num_fam !== null && item.num_fam !== undefined) ? item.num_fam : (familleList?.[0]?.num_fam || null);
          this.Nom[index] = item.nom || familleList?.[0]?.nom || '';
        });

        // Construction du formulaire différée
        setTimeout(() => {
          const lignesFormArray = this.fb.array(
            results.map(({ item }, i) => {
              // ✅ Fallback: If lib_remb is missing, look it up from the list
              let libRemb = item.lib_remb;

              if (!libRemb && item.reg_remb && this.ListeRegimeRemb) {
                const found = this.ListeRegimeRemb.find(r => r.reg_remb === item.reg_remb);
                if (found) {
                  libRemb = found.lib_remb;
                }
              }

              // Convert dates to dd/MM/yyyy format
              const datSoin = this.formatDate(item.dat_soin);
              const datPrevAccouch = this.convertBackendDate(item.dat_prev_accouch);
              const datSaisie = this.convertBackendDate(item.dat_saisie);
              const datVir = this.formatDate(item.dat_vir);

              return this.fb.group({
                cod_soc: [item.cod_soc],
                mat_pers: [item.mat_pers],
                num_fam: [this.NumFam[i]],
                dat_soin: [datSoin],
                cod_bord: [item.cod_bord],
                cod_assur: [item.cod_assur],
                num_soin: [item.num_soin],
                ord_bult: [item.ord_bult],
                tot_honor: [item.tot_honor],
                tot_net: [item.tot_net],
                tot_remb: [item.tot_remb],
                reg_remb: [item.reg_remb ?? ''],
                lib_remb: [libRemb],  // ✅ USE LOOKUP VALUE
                cod_malad: [item.cod_malad],
                num_pec: [item.num_pec],
                cod_fil: [item.cod_fil],
                num_assur: [item.num_retr || item.num_assur],
                dat_prev_accouch: [datPrevAccouch],
                nat_bult: [item.nat_bult],
                mat_pers_conj: [item.mat_pers_conj],
                num_ass_conj: [item.num_ass_conj],
                dat_saisie: [datSaisie],
                obs: [item.obs],
                obs_a: [item.obs_a],
                envoi: [item.envoi],
                reclam: [item.reclam],
                typ_bult: [item.typ_bult],
                ann_plaf_imp: [item.ann_plaf_imp],
                tot_remb_med: [item.tot_remb_med],
                num_soin_cnam: [item.num_soin_cnam],
                decis_med: [item.decis_med],
                reg_adh: [item.reg_adh],
                mod_pay: [item.mod_pay],
                dat_vir: [datVir]
              });
            })
          );

          this.SaisieBulletinForm.setControl('lignes', lignesFormArray);

          // Force change detection MULTIPLE times to ensure LOV updates
          this.cdRef.detectChanges();
          setTimeout(() => this.cdRef.detectChanges(), 100);
          setTimeout(() => this.cdRef.detectChanges(), 300);

          console.log('Final numRetr array:', this.numRetr);
          console.log('Final NomPrenom array:', this.NomPrenom);
          console.log('Final form values:', this.SaisieBulletinForm.value);

          this.calculateTotalsTot();

          // ✅ Set loading to false after everything is ready
          this.isLoading = false;

          // ✅ RESTORE SELECTION IF PENDING (e.g. after auto-save)
          if (this.pendingRestoreIndex !== null && this.lignes.at(this.pendingRestoreIndex)) {
            console.log(`🔄 Restoring selection for index ${this.pendingRestoreIndex}`);
            const indexToRestore = this.pendingRestoreIndex;
            setTimeout(() => {
              if (this.lignes.at(indexToRestore)) {
                this.load(this.lignes.at(indexToRestore).value, indexToRestore);
              }
              this.pendingRestoreIndex = null; // Reset
            }, 500);
          }
        });
      }, (err) => {
        console.error('Error fetching families:', err);
        this.isLoading = false;
      });
    }, (err) => {
      console.error('Error fetching personnel:', err);
      this.isLoading = false;
    });
  }


  // New unified method to convert backend dates
  convertBackendDate(dateValue: any): string {
    console.log('convertBackendDate input:', dateValue, 'Type:', typeof dateValue);

    if (!dateValue) return '';

    // If it's a LocalDate array [year, month, day]
    if (Array.isArray(dateValue) && dateValue.length === 3) {
      const [year, month, day] = dateValue;
      const result = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      console.log('Converted from array:', result);
      return result;
    }

    // If it's a LocalDate object {year, month, day}
    if (typeof dateValue === 'object' && dateValue.year && dateValue.month && dateValue.day) {
      const result = `${String(dateValue.day).padStart(2, '0')}/${String(dateValue.month).padStart(2, '0')}/${dateValue.year}`;
      console.log('Converted from object:', result);
      return result;
    }

    // If it's a string, use formatDate
    if (typeof dateValue === 'string') {
      return this.formatDate(dateValue);
    }

    console.warn('Could not convert date:', dateValue);
    return String(dateValue);
  }



  loadDataIntoTable(data: any[]) {
    this.actes = [];
    this.libAct = []; // CRITICAL: Clear array
    this.etab_rsoc = []; // CRITICAL: Clear array to prevent stale data
    console.log('🔍 loadDataIntoTable (Actes) - Full data:', data);
    if (data && data.length > 0) {
      console.log('📋 Actes item 0:', data[0]);
      console.log('  - prf_cod:', data[0]?.prf_cod);
      console.log('  - lib_org:', data[0]?.lib_org);
      console.log('  - prf_type (String):', data[0]?.prf_type);
      console.log('  - type_etablis (NUMERIC):', data[0]?.type_etablis);
    }

    const observables = data.map((item: any) => {
      // Determine correct prf_typ from prf_type string
      const prfTyp = item.prf_type?.includes('Etablissement') ? 2 : 1;
      return this.servRemb.getRefPhysique(prfTyp).pipe(
        map((refData: any) => ({ item, refData }))
      );
    });

    forkJoin<{ item: any; refData: any; }[]>(observables).subscribe((results) => {
      if (results.length > 0) {
        this.listRefEtablis = results[0].refData || [];
        this.columnsRefEtablis = [
          { key: "prf_cod", label: "Code" },
          { key: "etab_rsoc", label: "Nom & Prénom" },
          { key: "met_etab", label: "Etablis" },
        ];
        this.refEtablis = results.map(({ item }) => item.prf_cod);
        this.actes = results.map(({ item }) => item.cod_act);
        // CRITICAL FIX: Extract lib_org from backend response
        this.etab_rsoc = results.map(({ item }) => item.lib_org || '');
        // CRITICAL FIX: Populate libAct
        this.libAct = results.map(({ item }) => {
          const found = this.listActe.find(x => x.cod_act === item.cod_act || x.abrv_act === item.abrv_act);
          return item.lib_act || found?.lib_act || '';
        });
        console.log('✅ Actes etab_rsoc array:', this.etab_rsoc);
      }

      this.ligPretForm.setControl(
        'acte',
        this.fb.array(
          results.map(({ item }) => this.fb.group({
            cod_soc: [item.cod_soc],
            mat_pers: [item.mat_pers],
            num_fam: [item.num_fam],
            dat_soin: [item.dat_soin],
            abrv_act: [item.abrv_act],
            cod_act: [item.cod_act],
            num_lig: [item.num_lig],
            let_cod: [item.let_cod],
            cot_act: [item.cot_act],
            act_prix: [item.act_prix],
            mnt_honor: [item.mnt_honor || 0],
            mnt_remb: [item.mnt_remb || 0],
            accord_act: [item.accord_act],
            indice: [item.indice],
            dat_act: [item.dat_act],
            // ✅ FIX: Use prf_type string to determine the dropdown value
            prf_typ: [
              item.prf_type?.includes('Etablissement')
                ? '2'
                : item.prf_type?.includes('Personne')
                  ? '1'
                  : '1'  // Default to Personne physique
            ],
            prf_cod: [item.prf_cod],
            mut_mnt_net: [item.mut_mnt_net],
            num_pec_act: [item.num_pec_act],
            decis_act: [item.decis_act],
          }))
        )
      );
      this.calculateTotals()
    });
  }

  loadDataIntoTableVisite(data: any) {
    this.visiteCode = [];
    this.libVisite = []; // CRITICAL: Clear array
    this.etab_rsoc_visite = []; // CRITICAL: Clear array to prevent stale data
    console.log('🔍 loadDataIntoTableVisite - Full data:', data);

    const observables = data.map((item: any, index: number) => {
      console.log(`📋 Visite item ${index}:`, item);
      console.log(`  - prf_cod: ${item.prf_cod}`);
      console.log(`  - lib_org: ${item.lib_org}`);
      console.log(`  - prf_type: ${item.prf_type}`);
      console.log(`  - prf_typ (NUMERIC): ${item.prf_typ}`);

      return this.servRemb.getRefPhysique(item.prf_typ).pipe(
        tap((response: any) => {
          this.listRefEtablisVisit = response;
          this.columnsRefEtablisVisit = [
            { key: "prf_cod", label: "Code" },
            { key: "etab_rsoc", label: "Nom & Prénom" },
            { key: "met_etab", label: "Etablis" },
          ];
          console.log('item.cod_visit :', item)
          this.visiteCode.push(item.cod_visit);
          this.refEtablisVisit.push(item.prf_cod);

          // CRITICAL FIX: Populate libVisite
          const found = this.listVisite.find(x => x.cod_Visit === item.cod_visit);
          const lib = item.lib_visit || item.lib_Visit || found?.lib_Visit || '';
          this.libVisite.push(lib);

          // CRITICAL FIX: Extract lib_org from backend response
          const libOrg = item.lib_org || '';
          console.log(`✅ Pushing to etab_rsoc_visite[${index}]: "${libOrg}"`);
          this.etab_rsoc_visite.push(libOrg);
        })
      );
    });

    forkJoin(observables).subscribe(() => {
      this.ligVisiteForm.setControl('visite', this.fb.array(data.map((item: any) => this.fb.group({
        cod_soc: [item.cod_soc],
        mat_pers: [item.mat_pers],
        num_fam: [item.num_fam],
        dat_soin: [item.dat_soin],
        abrv_act: [item.abrv_act],
        cod_visit: [item.cod_visit],
        num_lig: [item.num_lig],
        mnt_honor: [item.mnt_honor || 0],
        mnt_remb: [item.mnt_remb || 0],
        //: [Number(item.mnt_net).toFixed(3)],
        indice: [item.indice],
        dat_act: [item.dat_act],
        prf_typ: [item.prf_type?.includes('Etablissement') ? '2' : item.prf_type?.includes('Personne') ? '1' : item.prf_typ ? String(item.prf_typ) : '2'],
        prf_cod: [item.prf_cod],
        prix_visit: [item.prix_visit],
        taux_remb: [item.taux_remb],
        mut_mnt_net: [item.mut_mnt_net],
        decis_med: [item.decis_med],


      }))));

      this.calculateTotalsVisite()
    });
  }

  loadDataIntoTableMed(data: any) {
    this.Med = [];
    this.libMed = []; // CRITICAL: Clear array
    this.etab_rsoc_phar = []; // CRITICAL: Clear array to prevent stale data
    console.log('🔍 loadDataIntoTableMed - Full data:', data);

    const observables = data.map((item: any, index: number) => {
      console.log(`📋 Med item ${index}:`, item);
      console.log(`  - prf_cod: ${item.prf_cod}`);
      console.log(`  - lib_org: ${item.lib_org}`);
      console.log(`  - prf_type: ${item.prf_type}`);
      console.log(`  - prf_typ (NUMERIC): ${item.prf_typ}`);

      return this.servRemb.getRefPhysique(item.prf_typ).pipe(
        tap((response: any) => {
          this.listRefEtablisMed = response;
          this.columnsRefEtablisMed = [
            { key: "prf_cod", label: "Code" },
            { key: "etab_rsoc", label: "Nom & Prénom" },
            { key: "met_etab", label: "Etablis" },
          ];
          this.refEtablisPhar.push(item.prf_cod);
          this.Med.push(item.cod_med);

          // CRITICAL FIX: Populate libMed
          const found = this.listMed.find(x => x.cod_med === item.cod_med);
          const lib = item.lib_med || found?.lib_med || '';
          this.libMed.push(lib);

          // CRITICAL FIX: Extract lib_org from backend response
          const libOrg = item.lib_org || '';
          console.log(`✅ Pushing to etab_rsoc_phar[${index}]: "${libOrg}"`);
          this.etab_rsoc_phar.push(libOrg);
        })
      );
    });

    forkJoin(observables).subscribe(() => {
      this.ligPharForm.setControl('phar', this.fb.array(data.map((item: any) => this.fb.group({
        cod_soc: [item.cod_soc],
        mat_pers: [item.mat_pers],
        num_fam: [item.num_fam],
        dat_soin: [item.dat_soin],
        abrv_act: [item.abrv_act],
        cod_med: [item.cod_med],
        num_lig: [item.num_lig],
        mnt_honor: [item.mnt_honor || 0],
        mnt_remb: [item.mnt_remb || 0],
        indice: [item.indice],
        dat_act: [item.dat_act],
        prf_typ: [item.prf_type?.includes('Etablissement') ? '2' : item.prf_type?.includes('Personne') ? '1' : item.prf_typ ? String(item.prf_typ) : '2'],
        prf_cod: [item.prf_cod],
        accord_med: [item.accord_med],
        num_pec_med: [item.num_pec_med],
        mdc_prix: [item.mdc_prix],
        med_prix: [item.med_prix],
        prix_remb: [item.prix_remb],
        num_lig_med: [item.num_lig_med],
        mut_mnt_net: [item.mut_mnt_net],
        nbr_j: [item.nbr_j],
        decis_med: [item.decis_med],

      }))));
      this.calculateTotalsPhar()
      console.log("this.ligPharForm :", this.ligPharForm.value);
    });
  }

  loadDataIntoTablApp(data: any) {
    this.appareilCode = [];
    this.libAppareil = []; // CRITICAL: Clear array
    this.etab_rsoc_appareil = []; // CRITICAL: Clear array to prevent stale data
    console.log('🔍 loadDataIntoTablApp - Full data:', data);

    const observables = data.map((item: any, index: number) => {
      console.log(`📋 App item ${index}:`, item);
      console.log(`  - prf_cod: ${item.prf_cod}`);
      console.log(`  - lib_org: ${item.lib_org}`);
      console.log(`  - prf_type: ${item.prf_type}`);
      console.log(`  - prf_typ (NUMERIC): ${item.prf_typ}`);

      return this.servRemb.getRefPhysique(item.prf_typ).pipe(
        tap((response: any) => {
          this.listRefEtablisApp = response;
          this.columnsRefEtablisApp = [
            { key: "prf_cod", label: "Code" },
            { key: "etab_rsoc", label: "Nom & Prénom" },
            { key: "met_etab", label: "Etablis" },
          ];
          this.refEtablisApp.push(item.prf_cod);
          this.appareilCode.push(item.cod_app);

          // CRITICAL FIX: Populate libAppareil
          const found = this.listAppareil.find(x => x.cod_app === item.cod_app);
          const lib = item.lib_app || item.lib_ap || found?.lib_app || '';
          this.libAppareil.push(lib);

          // CRITICAL FIX: Extract lib_org from backend response
          const libOrg = item.lib_org || '';
          console.log(`✅ Pushing to etab_rsoc_appareil[${index}]: "${libOrg}"`);
          this.etab_rsoc_appareil.push(libOrg);
        })
      );
    });

    forkJoin(observables).subscribe(() => {
      this.ligAppareilForm.setControl('appareil', this.fb.array(data.map((item: any) => this.fb.group({
        cod_soc: [item.cod_soc],
        mat_pers: [item.mat_pers],
        num_fam: [item.num_fam],
        dat_soin: [item.dat_soin],
        abrv_act: [item.abrv_act],
        cod_app: [item.cod_app],
        num_lig: [item.num_lig],
        mnt_honor: [item.mnt_honor || 0],
        mnt_remb: [item.mnt_remb || 0],
        indice: [item.indice],
        dat_act: [item.dat_act],
        prf_typ: [item.prf_type?.includes('Etablissement') ? '2' : item.prf_type?.includes('Personne') ? '1' : item.prf_typ ? String(item.prf_typ) : '2'],
        prf_cod: [item.prf_cod],
        accord_app: [item.accord_app],
        num_pec_app: [item.num_pec_app],
        num_lig_app: [item.num_lig_app],
        mut_mnt_net: [item.mut_mnt_net],
      }))));
      this.calculateTotalsAppareil()
      console.log("this.ligAppareilForm :", this.ligAppareilForm.value);
    });
  }
  openModalTab(content1: any) {
    this.modalService.open(content1, { size: "xl", centered: true });
  }
  formatDate(dateString: any): string {
    console.log('formatDate INPUT:', dateString, 'Type:', typeof dateString);

    if (!dateString) {
      console.log('formatDate: Empty input, returning empty string');
      return '';
    }

    // If it's already in dd/MM/yyyy format, return as is
    if (typeof dateString === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      console.log('formatDate: Already in dd/MM/yyyy format');
      return dateString;
    }

    // If it's in dd-MM-yyyy format (from SQL), convert to dd/MM/yyyy
    if (typeof dateString === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      const result = dateString.replace(/-/g, '/');
      console.log('formatDate: Converted dd-MM-yyyy to dd/MM/yyyy:', result);
      return result;
    }

    // If it's in ddmmyyyy format (ex: 01122025)
    if (typeof dateString === 'string' && dateString.length === 8 && /^\d{8}$/.test(dateString)) {
      const day = dateString.substring(0, 2);
      const month = dateString.substring(2, 4);
      const year = dateString.substring(4, 8);
      const result = `${day}/${month}/${year}`;
      console.log('formatDate: Converted ddmmyyyy to dd/MM/yyyy:', result);
      return result;
    }

    // If it's in yyyy-MM-dd format (ISO format)
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split("-");
      const result = `${day}/${month}/${year}`;
      console.log('formatDate: Converted yyyy-MM-dd to dd/MM/yyyy:', result);
      return result;
    }

    // If it's a Date object or timestamp
    if (dateString instanceof Date || typeof dateString === 'number') {
      const d = new Date(dateString);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const result = `${day}/${month}/${year}`;
        console.log('formatDate: Converted Date object to dd/MM/yyyy:', result);
        return result;
      }
    }

    // If it's an object with year, month, day properties (LocalDate JSON format)
    if (typeof dateString === 'object' && dateString !== null) {
      console.log('formatDate: Object detected:', dateString);

      if (dateString.year && dateString.month && dateString.day) {
        const day = String(dateString.day).padStart(2, '0');
        const month = String(dateString.month).padStart(2, '0');
        const year = dateString.year;
        const result = `${day}/${month}/${year}`;
        console.log('formatDate: Converted LocalDate object to dd/MM/yyyy:', result);
        return result;
      }

      // Try to convert object to string and parse
      const objString = JSON.stringify(dateString);
      console.log('formatDate: Object as string:', objString);
    }

    // Last resort: try to parse as Date
    try {
      const d = new Date(dateString);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const result = `${day}/${month}/${year}`;
        console.log('formatDate: Last resort conversion successful:', result);
        return result;
      }
    } catch (e) {
      console.error('formatDate: Failed to parse date:', dateString, e);
    }

    // Return original if nothing worked
    console.warn('formatDate: No conversion matched, returning original:', dateString);
    return String(dateString);
  }



  // ✅ NEW METHOD: Validate current row details
  validateCurrentRowDetails(): boolean {
    const bulletin = this.lignes.at(this.selectedRow).value;

    // Calculate totals for current row only
    const totalVisites = this.visite.value.reduce((sum: number, v: any) => sum + (Number(v.mnt_remb) || 0), 0);
    const totalActes = this.acte.value.reduce((sum: number, a: any) => sum + (Number(a.mnt_remb) || 0), 0);
    const totalMeds = this.phar.value.reduce((sum: number, m: any) => sum + (Number(m.mnt_remb) || 0), 0);
    const totalApps = this.appareil.value.reduce((sum: number, a: any) => sum + (Number(a.mnt_remb) || 0), 0);

    const calculatedTotal = totalVisites + totalActes + totalMeds + totalApps;
    const bulletinTotal = Number(bulletin.tot_net) || 0;

    const TOLERANCE = 0.005; // Tolerance for floating point comparison

    // Check if totals match
    if (Math.abs(calculatedTotal - bulletinTotal) > TOLERANCE) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur de Validation',
        html: `Le total des détails (${calculatedTotal.toFixed(3)}) ne correspond pas au total du bulletin (${bulletinTotal.toFixed(3)}).<br><br>Veuillez corriger les montants.`,
        confirmButtonText: 'OK'
      });
      return false;
    }

    // Check if at least one detail line exists
    const hasDetails = this.visite.length > 0 || this.acte.length > 0 ||
      this.phar.length > 0 || this.appareil.length > 0;

    if (!hasDetails) {
      Swal.fire({
        icon: 'warning',
        title: 'Aucun détail',
        text: 'Veuillez ajouter au moins une ligne de détail (visite, acte, médicament ou appareil).',
        confirmButtonText: 'OK'
      });
      return false;
    }

    return true;
  }

  // ✅ NEW METHOD: Mark row as completed
  markRowAsCompleted(index: number) {
    this.completedRows.add(index);
    this.cdRef.detectChanges();
  }

  // ✅ NEW METHOD: Check if row is completed
  isRowCompleted(index: number): boolean {
    return this.completedRows.has(index);
  }

  // ✅ GLOBAL SAVE CALLBACK
  saveCurrentRow() {
    console.log("💾 Global Save Triggered for Row:", this.selectedRow);
    if (this.selectedRow === null || this.selectedRow === undefined) {
      Swal.fire({
        icon: 'warning',
        title: 'Aucune sélection',
        text: 'Veuillez sélectionner une ligne à sauvegarder.'
      });
      return;
    }
    this.addBultSoin();
  }

  addBultSoin() {
    if (this.isSaving) return;

    const BulletinFormArray = this.SaisieBulletinForm.get('lignes') as FormArray;

    if (this.selectedRow === null || this.selectedRow === undefined) {
      Swal.fire({
        icon: 'warning',
        title: 'Aucune ligne sélectionnée',
        text: 'Veuillez sélectionner une ligne de bulletin avant de continuer.',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.isSaving = true;
    Swal.showLoading();

    // ✅ SAVE CURRENT ROW STATE TO CACHE BEFORE SAVING
    if (this.selectedRow !== null && this.selectedRow !== undefined) {
      this.saveCurrentRowState(this.selectedRow);
    }

    const formArrays = [
      this.ligVisiteForm.get('visite') as FormArray,
      this.ligPharForm.get('phar') as FormArray,
      this.ligPretForm.get('acte') as FormArray,
      this.ligAppareilForm.get('appareil') as FormArray
    ];

    // Validation removed - allow saving even with empty arrays


    // Get bulletin data
    const bulletin = BulletinFormArray.at(this.selectedRow).value;

    // Helper functions (matching BultCnam)
    const toNullIfEmpty = (v: any) => v === '' || v === undefined ? null : v;

    const formatDate = (d: any): string | null => {
      if (!d) return null;
      if (typeof d === 'string') {
        if (d.includes('/')) return d;
        if (d.length === 8 && /^\d{8}$/.test(d)) {
          return `${d.substring(0, 2)}/${d.substring(2, 4)}/${d.substring(4, 8)}`;
        }
      }
      const date = new Date(d);
      if (isNaN(date.getTime())) return null;
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };

    // Update all form arrays with bulletin data
    formArrays.forEach(array => {
      array.controls.forEach((fg: AbstractControl) => {
        if (fg instanceof FormGroup) {
          fg.patchValue({
            cod_soc: this.token.getUser().codSoc,
            mat_pers: bulletin.mat_pers,
            num_fam: bulletin.num_fam,
            dat_soin: formatDate(bulletin.dat_soin),
            dat_act: formatDate(fg.get('dat_act')?.value)
          });
        }
      });
    });

    // Prepare bordereau data
    const bordEnvoiData = {
      cod_bord: this.BordEnvoiForm.value.cod_bord,
      cod_assur: this.BordEnvoiForm.value.cod_assur,
      dat_bord: formatDate(this.BordEnvoiForm.value.dat_bord),
      dat_deb: formatDate(this.BordEnvoiForm.value.dat_deb),
      dat_fin: formatDate(this.BordEnvoiForm.value.dat_fin),
      nbr_bult: this.BordEnvoiForm.value.nbr_bult,
      tot_honor: this.BordEnvoiForm.value.tot_honor || 0,
      typ_bord: 'C',
      cod_soc: this.token.getUser().codSoc,
      tot_net: this.BordEnvoiForm.value.tot_net || 0,
      valid_bord: this.BordEnvoiForm.value.valid_bord,
      reg_bord: this.BordEnvoiForm.value.reg_bord,
      tot_remb: this.BordEnvoiForm.value.tot_remb || 0,
      valid: this.BordEnvoiForm.value.valid || 'N',
      clot_bord: this.BordEnvoiForm.value.clot_bord,
      tot: this.BordEnvoiForm.value.tot || 0,
      num_retr: this.BordEnvoiForm.value.num_retr,
      cod_bord_cnam: this.BordEnvoiForm.value.cod_bord_cnam,
      seq_bord: this.BordEnvoiForm.value.seq_bord
    };

    // Convert empty strings to null
    Object.keys(bordEnvoiData).forEach(k => (bordEnvoiData as any)[k] = toNullIfEmpty((bordEnvoiData as any)[k]));

    // Prepare bulletins data
    const bulletinsData = BulletinFormArray.value.map((bult: any) => {
      const data = {
        cod_soc: this.token.getUser().codSoc,
        mat_pers: bult.mat_pers,
        num_fam: bult.num_fam,
        dat_soin: formatDate(bult.dat_soin),
        cod_bord: bult.cod_bord,
        cod_assur: bult.cod_assur,
        num_soin: bult.num_soin,
        ord_bult: bult.ord_bult,
        tot_honor: bult.tot_honor || 0,
        tot_net: bult.tot_net || 0,
        tot_remb: bult.tot_net || 0,
        reg_remb: bult.reg_remb,
        cod_malad: bult.cod_malad,
        num_pec: bult.num_pec,
        cod_fil: bult.cod_fil,
        num_assur: bult.num_assur,
        dat_prev_accouch: formatDate(bult.dat_prev_accouch),
        nat_bult: 'C',
        mat_pers_conj: bult.mat_pers_conj,
        num_ass_conj: bult.num_ass_conj,
        dat_saisie: formatDate(bult.dat_saisie),
        obs: bult.obs,
        obs_a: bult.obs_a,
        envoi: bult.envoi,
        reclam: bult.reclam,
        typ_bult: bult.typ_bult,
        ann_plaf_imp: bult.ann_plaf_imp,
        tot_remb_med: bult.tot_remb_med || 0,
        num_soin_cnam: bult.num_soin_cnam,
        decis_med: bult.decis_med,
        reg_adh: bult.reg_adh,
        mod_pay: bult.mod_pay,
        dat_vir: formatDate(bult.dat_vir)
      };
      // Convert empty strings to null
      Object.keys(data).forEach(k => (data as any)[k] = toNullIfEmpty((data as any)[k]));
      return data;
    });

    // Clean function to remove unwanted fields and convert empty to null
    const clean = (obj: any, remove: string[] = []) => {
      const o = { ...obj };
      remove.forEach(f => delete o[f]);
      Object.keys(o).forEach(k => o[k] = toNullIfEmpty(o[k]));
      return o;
    };

    // Prepare child records from CACHE (gathering all visited/loaded rows)
    const allVisites: any[] = [];
    const allMeds: any[] = [];
    const allActs: any[] = [];
    const allApps: any[] = [];

    // Iterate over all bulletins to gather their details from cache
    for (let i = 0; i < BulletinFormArray.length; i++) {
      const cache = this.bulletinDetailsCache[i];
      const bulletin = BulletinFormArray.at(i).value;
      const bulletinKeys = {
        cod_soc: this.token.getUser().codSoc,
        mat_pers: bulletin.mat_pers,
        num_fam: bulletin.num_fam,
        dat_soin: formatDate(bulletin.dat_soin)
      };

      if (cache) {
        if (cache.visite && cache.visite.length > 0) {
          const validVisites = cache.visite.filter((v: any) => v.cod_visit).map((v: any) => {
            const cleaned = clean(v);
            Object.assign(cleaned, bulletinKeys); // Overwrite keys
            cleaned.mnt_net = cleaned.mnt_net || cleaned.mnt_remb;
            cleaned.dat_act = formatDate(cleaned.dat_act);
            return cleaned;
          });
          allVisites.push(...validVisites);
        }
        if (cache.phar && cache.phar.length > 0) {
          const validMeds = cache.phar.filter((v: any) => v.cod_med).map((v: any) => {
            const cleaned = clean(v, ['nbr_piece', 'nbr_vign', 'obs']);
            Object.assign(cleaned, bulletinKeys); // Overwrite keys
            cleaned.mnt_net = cleaned.mnt_net || cleaned.mnt_remb;
            cleaned.dat_act = formatDate(cleaned.dat_act);
            return cleaned;
          });
          allMeds.push(...validMeds);
        }
        if (cache.acte && cache.acte.length > 0) {
          // Filter out acts without abrv_act (prevents ORA-01400)
          const validActs = cache.acte.filter((v: any) => v.abrv_act && v.cod_act).map((v: any) => {
            const cleaned = clean(v, ['nbr_piece', 'nbr_vign', 'obs']);
            Object.assign(cleaned, bulletinKeys); // Overwrite keys
            cleaned.mnt_net = cleaned.mnt_net || cleaned.mnt_remb;
            cleaned.dat_act = formatDate(cleaned.dat_act);
            return cleaned;
          });
          allActs.push(...validActs);
        }
        if (cache.appareil && cache.appareil.length > 0) {
          // Filter out appareils without cod_app or abrv_act
          const validApps = cache.appareil.filter((v: any) => v.cod_app && v.abrv_act).map((v: any) => {
            const cleaned = clean(v);
            Object.assign(cleaned, bulletinKeys); // Overwrite keys
            cleaned.mnt_net = cleaned.mnt_net || cleaned.mnt_remb;
            cleaned.dat_act = formatDate(cleaned.dat_act);
            return cleaned;
          });
          allApps.push(...validApps);
        }
      }
    }

    const visites = allVisites;
    const meds = allMeds;
    const acts = allActs;
    const apps = allApps;

    console.log("=== DATA TO SEND (dd/MM/yyyy format) ===");
    console.log("Bordereau:", JSON.stringify(bordEnvoiData, null, 2));
    console.log("Bulletins:", JSON.stringify(bulletinsData, null, 2));
    console.log("Visites:", JSON.stringify(visites, null, 2));
    console.log("Actes:", JSON.stringify(acts, null, 2));
    console.log("Meds:", JSON.stringify(meds, null, 2));
    console.log("Apps:", JSON.stringify(apps, null, 2));

    // Check if bordereau already exists in Arrivé list (only for envoi mode)
    const codBordToSave = bordEnvoiData.cod_bord;
    // Removed mode check - always use arriver logic
    const isEnvoiMode = false; // Always false now
    const alreadyExists = this.AllBordArriver?.some((bord: any) => bord.cod_bord === codBordToSave);

    /*  if (isEnvoiMode && alreadyExists) {
       Swal.fire({
         icon: 'warning',
         title: 'Bordereau existe déjà',
         text: 'Ce bordereau existe déjà dans les bordereaux arrivés. Veuillez le consulter dans "Bordereau Arrivé" pour le modifier.',
         confirmButtonText: 'OK'
       });
     } */

    // ✅ VALIDATION: CHECK IF MANUAL TOT. NET MATCHES SUM OF DETAILS
    const validationErrors: string[] = [];
    const TOLERANCE = 0.005; // Tolerance for floating point comparison

    for (let i = 0; i < BulletinFormArray.length; i++) {
      const bulletin = BulletinFormArray.at(i).value;

      // Skip validation if details are not loaded/cached (user hasn't touched the row)
      if (!this.bulletinDetailsCache[i]) {
        continue;
      }

      const manualTotNet = parseFloat(bulletin.tot_net || '0');
      const matPers = bulletin.mat_pers;
      const numFam = bulletin.num_fam;
      const datSoinFormatted = formatDate(bulletin.dat_soin);

      // Skip validation if critical keys are missing (incomplete row)
      if (!matPers || !datSoinFormatted) {
        continue;
      }

      // Calculate sum of details for THIS bulletin DIRECTLY from its cache entry
      let sumCalculated = 0;
      if (this.bulletinDetailsCache[i].visite) {
        sumCalculated += this.bulletinDetailsCache[i].visite.reduce((s: number, v: any) => s + (parseFloat(v.mnt_remb) || 0), 0);
      }
      if (this.bulletinDetailsCache[i].acte) {
        sumCalculated += this.bulletinDetailsCache[i].acte.reduce((s: number, a: any) => s + (parseFloat(a.mnt_remb) || 0), 0);
      }
      if (this.bulletinDetailsCache[i].phar) {
        sumCalculated += this.bulletinDetailsCache[i].phar.reduce((s: number, m: any) => s + (parseFloat(m.mnt_remb) || 0), 0);
      }
      if (this.bulletinDetailsCache[i].appareil) {
        sumCalculated += this.bulletinDetailsCache[i].appareil.reduce((s: number, a: any) => s + (parseFloat(a.mnt_remb) || 0), 0);
      }

      if (Math.abs(manualTotNet - sumCalculated) > TOLERANCE) {
        const bulletinName = this.NomPrenom[i] || this.Nom[i] || 'Inconnu';
        validationErrors.push(
          `Bulletin ${i + 1} (${bulletinName}): Tot. Net saisi (${manualTotNet.toFixed(3)}) ne correspond pas à la somme des détails (${sumCalculated.toFixed(3)})`
        );
      }
    }

    if (validationErrors.length > 0) {
      this.isSaving = false;
      Swal.fire({
        icon: 'error',
        title: 'Erreur de Validation',
        html: validationErrors.join('<br>'),
        confirmButtonText: 'Corriger'
      });
      return;
    }

    // Call services in sequence using switchMap
    this.servRemb.addBBordArriver(bordEnvoiData).pipe(
      switchMap((bordResponse: any) => {
        console.log("✅ Bordereau saved:", bordResponse);
        // Call service to add bulletins
        return this.servRemb.addBultArriver(bulletinsData);
      }),
      switchMap((bultResponse: any) => {
        console.log("✅ Bulletins saved:", bultResponse);
        // Call service to add child records (visit, act, med, app)
        return this.servRemb.addAllLigBultArriver(visites, acts, meds, apps);
      }),
      finalize(() => this.isSaving = false)
    ).subscribe({
      next: (response: any) => {
        console.log("✅ Child records response:", response);

        // Check if any response indicates failure (success: false)
        const errors = [];
        if (response.visit?.success === false) errors.push(`Visit: ${response.visit.message}`);
        if (response.act?.success === false) errors.push(`Act: ${response.act.message}`);
        if (response.med?.success === false) errors.push(`Med: ${response.med.message}`);
        if (response.app?.success === false) errors.push(`App: ${response.app.message}`);

        if (errors.length > 0) {
          Swal.fire({
            icon: 'error',
            title: 'Erreur lors de l\'ajout',
            html: errors.join('<br>'),
            showCancelButton: false
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Enregistrement réussi',
            text: 'Le bordereau et tous les services ont été enregistrés avec succès !',
            confirmButtonText: 'OK'
          });
          // Refresh data
          this.getAllBordArriverList();
        }
      },
      error: (error: any) => {
        console.error("❌ Error during save process:", error);
        this.showServerError();
      }
    });
  }

  private showServerError() {
    Swal.fire({
      icon: 'error',
      title: 'Erreur serveur',
      text: 'Une erreur inattendue est survenue lors de l\'ajout.',
      confirmButtonText: 'OK'
    });
  }
  getAllAssurance() {
    this.serv.GetAllAssurance().subscribe({
      next: (data: any) => {
        this.ListeAssurance = data;
        this.columnAssuranc = [
          { key: "cod_assur", label: "Code Assurance" },
          { key: "lib_assur", label: "Libellé" },
        ];
      },
      error: (err) => {
        console.error("❌ Error fetching assurances:", err);
      }
    });
  }

  GetAllRegimeRemb() {
    this.serv.GetAllRegimeRemb().subscribe({
      next: (data: any) => {
        this.ListeRegimeRemb = data;
        console.log("liste des regime remb", this.ListeRegimeRemb);
      },
      error: (err) => {
        console.error("❌ Error fetching regime remb:", err);
        // Fallback or user notification could go here
      }
    });
  }
  AjouterBordereau() {
    const formValue = this.SaisieBordEnvoiForm.value;

    this.SaisieBordEnvoiForm.patchValue({
      cod_soc: this.token.getUser().codSoc,
      cod_assur: this.token.getUser().codSoc,
    });

    this.serv
      .AjouterBordereau(this.SaisieBordEnvoiForm.value)
      .subscribe((data) => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouté avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        // this.getAllBordEnvoi(); // Removed - method no longer exists
      });
  }

  formatDate2(event: any) {
    let value = event.target.value.replace(/\D/g, "");

    if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + "/" + value.slice(5, 9);

    event.target.value = value;
  }
  // Convert dd/MM/yyyy to dd-MM-yyyy for backend
  // Convert any date format to ISO format (yyyy-MM-dd) for backend
  // Convert any date format to dd/MM/yyyy for backend (as expected by CustomLocalDateDeserializer)
  private convertToBackendDateFormat(dateValue: any): string | null {
    console.log('convertToBackendDateFormat input:', dateValue);

    if (!dateValue) return null;

    // If it's already in dd/MM/yyyy format, return as is
    if (typeof dateValue === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
      console.log('Already in dd/MM/yyyy format:', dateValue);
      return dateValue;
    }

    // If it's in dd-MM-yyyy format, convert to dd/MM/yyyy
    if (typeof dateValue === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(dateValue)) {
      const result = dateValue.replace(/-/g, '/');
      console.log('Converted dd-MM-yyyy to dd/MM/yyyy:', result);
      return result;
    }

    // If it's in yyyy-MM-dd format (ISO), convert to dd/MM/yyyy
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      const [year, month, day] = dateValue.split('-');
      const result = `${day}/${month}/${year}`;
      console.log('Converted yyyy-MM-dd to dd/MM/yyyy:', result);
      return result;
    }

    // If it's a LocalDate array [year, month, day]
    if (Array.isArray(dateValue) && dateValue.length === 3) {
      const [year, month, day] = dateValue;
      const result = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      console.log('Converted array to dd/MM/yyyy:', result);
      return result;
    }

    // If it's a LocalDate object {year, month, day}
    if (typeof dateValue === 'object' && dateValue !== null && dateValue.year && dateValue.month && dateValue.day) {
      const result = `${String(dateValue.day).padStart(2, '0')}/${String(dateValue.month).padStart(2, '0')}/${dateValue.year}`;
      console.log('Converted object to dd/MM/yyyy:', result);
      return result;
    }

    // If it's a Date object
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      const day = String(dateValue.getDate()).padStart(2, '0');
      const month = String(dateValue.getMonth() + 1).padStart(2, '0');
      const year = dateValue.getFullYear();
      const result = `${day}/${month}/${year}`;
      console.log('Converted Date object to dd/MM/yyyy:', result);
      return result;
    }

    console.warn('Could not convert date to dd/MM/yyyy format:', dateValue);
    return null;
  }
  onSelectedValueAssur(event: any) {
    console.log(event)
    this.libAssur = event.lib_assur;
    this.BordEnvoiForm.patchValue({
      cod_assur: event.cod_assur,
    });
    console.log(this.BordEnvoiForm.value)
  }

  getListPersonnelBultSoin(): void {
    this.serv
      .getListPersonnelBultSoinFil(
        this.token.getUser().codSoc
      )
      .subscribe({
        next: (data: any) => {
          this.ListePersonnel = data;
          console.log("Liste des personnels pour le cod_bord :", this.cod_bord, this.ListePersonnel);

          this.columnPersonnel = [
            { key: "num_retr", label: "Numéro assurance" },
            { key: "mat_pers", label: "Matricule" },
            { key: "nom", label: "Nom & prénom" },
          ];

          // Force change detection after loading personnel list
          this.cdRef.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.error = "Erreur lors de la récupération des données";
          console.error(err);
        },
      });
  }


  getListFamillePersonnelBultSoin(codBord: string, matPers: string): void {
    this.serv
      .getListFamillePersonnelBultSoin(
        this.token.getUser().codSoc,
        matPers,
        codBord
      )
      .subscribe({
        next: (data: any) => {
          this.ListeFamillePersonnel = data;
          console.log("liste des familles pour le cod_bord et mat_pers", this.ListeFamillePersonnel, codBord, matPers);

          this.columneFamillePersonnel = [
            { key: "num_fam", label: "Préstataire" },
            { key: "nom", label: "Nom" },
          ];
        },
        error: (err: HttpErrorResponse) => {
          this.error = "Erreur lors de la récupération des données";
          console.error(err);
        },
      });
  }




  onSelectedFamillePersonnel(selectedValue: any, index: number): void {

    console.log("onSelectedFamillePersonnel - START");
    console.log("Index:", index);
    console.log("SelectedValue (Event):", selectedValue);
    console.log("ListeFamille for this index:", this.ListeFamillePersonnelParLigne[index]);

    // 🔄 Utiliser la liste spécifique à la ligne
    const selectedFamille = this.ListeFamillePersonnelParLigne[index]?.find(
      (famille) => famille.num_fam === selectedValue.num_fam
    );

    console.log("Found selectedFamille:", selectedFamille);

    // 🔄 Mise à jour du tableau des noms
    this.NumFam[index] = selectedValue.num_fam;
    this.Nom[index] = selectedFamille?.nom || '';

    console.log("Updated NumFam[index]:", this.NumFam[index]);
    console.log("Updated Nom[index]:", this.Nom[index]);

    // 🔄 Mise à jour du formulaire (patch du FormGroup de la ligne)
    this.lignes.at(index).patchValue({
      num_fam: selectedValue.num_fam,
      dat_soin: selectedFamille?.dat_soin ?? this.lignes.at(index).get('dat_soin')?.value
    });

    // ✅ Mise à jour de la ligne sélectionnée pour surligner
    this.selectedRow = index;

    // ✅ Appel différé pour garantir que tout est à jour
    setTimeout(() => {
      this.logRowData(this.lignes.at(index).value, index);
    });
  }

  onSelectedPersonnel(selectedValue: any, index: number): void {
    console.log("selectedValue", selectedValue, this.cod_bord);

    const selectedPers = this.ListePersonnel.find(
      (listPers) => listPers.num_retr === selectedValue.num_retr
    );

    if (selectedPers) {
      this.NomPrenom[index] = selectedPers.nom || '';
      const matPers = selectedPers.mat_pers;
      this.matPers[index] = matPers;

      // 🧹 Réinitialise la famille précédente de cette ligne
      this.ListeFamillePersonnelParLigne[index] = [];
      this.NumFam[index] = null;
      this.Nom[index] = '';

      // 📥 Appel du service pour récupérer la liste des familles spécifiques à cette personne
      this.serv.getListFamillePersonnelBultSoin(
        this.token.getUser().codSoc,
        matPers,
        this.cod_bord
      ).subscribe((familleList: any[]) => {
        this.ListeFamillePersonnelParLigne[index] = familleList || [];
        console.log("data line", familleList)
        this.columneFamillePersonnel = [
          { key: "num_fam", label: "Préstataire" },
          { key: "nom", label: "Nom" },
        ];
        // Pré-sélectionner le premier membre de la famille s’il existe
        const defaultFamille = familleList?.[0];
        if (defaultFamille) {
          this.NumFam[index] = defaultFamille.num_fam;
          this.Nom[index] = defaultFamille.nom;

          const currentDatSoin = this.lignes.at(index).get('dat_soin')?.value;
          this.lignes.at(index).patchValue({
            num_fam: defaultFamille.num_fam,
            dat_soin: defaultFamille.dat_soin ?? currentDatSoin
          });

          console.log("Default Famille Set:", defaultFamille);

          // Marquer la ligne comme sélectionnée visuellement
          this.selectedRow = index;

          // Log les données après patch
          setTimeout(() => {
            this.logRowData(this.lignes.at(index).value, index);
          });
        }
      });

      // 🔄 Met à jour les champs du personnel sélectionné
      this.lignes.at(index).patchValue({
        num_retr: selectedValue.num_retr,
        num_assur: selectedValue.num_retr,
        cod_fil: selectedValue.cod_fil,
        mat_pers: selectedValue.mat_pers
      });
    }
  }



  addLigne(): void {
    // ✅ Clear previous details to prevent data leakage from previous selection
    this.visite.clear();
    this.acte.clear();
    this.phar.clear();
    this.appareil.clear();

    // ✅ Reset Helper Arrays
    this.visiteCode = [];
    this.libVisite = [];
    this.etab_rsoc_visite = []; // Reset Visite helpers

    this.Med = [];
    this.libMed = [];
    this.etab_rsoc_phar = []; // Reset Pharmacy helpers

    this.libAct = [];

    this.appareilCode = [];
    this.libAppareil = [];
    this.etab_rsoc_appareil = []; // Reset Appareil helpers

    // ✅ Reset Totals
    this.totalHonorairesVisite = 0;
    this.totalNetVisite = 0;
    this.totalHonoraires = 0;
    this.totalNet = 0;
    this.totalHonorairesPhar = 0;
    this.totalNetPhar = 0;
    this.totalHonorairesAppareil = 0;
    this.totalNetAppareil = 0;


    const bultArriver = (this.SaisieBulletinForm.get("lignes") as FormArray);
    const newRow = this.createLigne();

    // Set current bordereau values
    newRow.patchValue({
      cod_bord: this.BordEnvoiForm.get('cod_bord')?.value,
      cod_assur: this.BordEnvoiForm.get('cod_assur')?.value,
      dat_saisie: new Date().toLocaleDateString('fr-FR'),
      reg_remb: this.ListeRegimeRemb?.[0]?.reg_remb || '' // Default regime
    });

    this.lignes.push(newRow);
    const index = this.lignes.length - 1;

    // ✅ Initialize cache for new row
    this.bulletinDetailsCache[index] = { acte: [], visite: [], phar: [], appareil: [] };

    // Auto-select the new row for editing
    this.selectedRow = index;

    console.log("🆕 Added new bulletin row at index", index);
    this.cdRef.detectChanges();
  }



  get acte(): FormArray {
    return this.ligPretForm.get('acte') as FormArray;
  }

  // Création d'une ligne avec les champs nécessaires
  createActe(): FormGroup {
    return this.fb.group({
      cod_soc: [this.token.getUser().codSoc],
      mat_pers: [''],
      num_fam: [''],
      dat_soin: [''],
      abrv_act: ['', Validators.required],
      cod_act: ['', Validators.required],
      num_lig: [1],
      let_cod: [''],
      cot_act: [''],
      act_prix: [''],
      mnt_honor: [0],
      mnt_remb: [0],
      mnt_net: [0],
      accord_act: [''],
      // mnt_net: [''],
      indice: ['1'],
      dat_act: [''],
      prf_typ: [''],
      prf_cod: [''],
      mut_mnt_net: [''],
      num_pec_act: [''],
      decis_act: [''],


    });

  }

  addActe(): void {
    this.acte.push(this.createActe());
    const index = this.acte.length - 1;

    // ✅ Auto-fill date from previous line
    if (index > 0) {
      const prevDate = this.acte.at(index - 1).get('dat_act')?.value;
      if (prevDate) {
        this.acte.at(index).patchValue({ dat_act: prevDate });
      }
    }

    this.calculateTotals();

    // Check if bultArriver exists before calling service
    if (this.bultArriver && this.bultArriver.cod_soc) {
      // Use the same service method as buletin-cnam: getNumLigAct
      this.servRemb.getNumLigAct(
        this.bultArriver.cod_soc,
        this.bultArriver.mat_pers,
        this.bultArriver.num_fam,
        this.bultArriver.dat_soin
      ).subscribe((data: any) => {
        this.acte.at(index).patchValue({
          num_lig: data
        })
      })
    } else {
      // Set default value if no bulletin selected yet
      this.acte.at(index).patchValue({
        num_lig: index + 1
      })
    }
  }

  // removeLigne(index: number): void {
  //   this.lignes.removeAt(index);
  //   this.calculateTotals(); // Met à jour les totaux

  // }



  totalHonoraires: number = 0;
  totalNet: number = 0;



  libAct: string[] = []
  selectedAct: any
  onSelectedActe(selectedValue: any, index: number): void {
    this.selectedAct = selectedValue
    const selectedActe = this.listActe.find(acte => acte.abrv_act === selectedValue.abrv_act);
    this.libAct[index] = selectedActe.lib_act

    // Get current values - only initialize to 0 if they are empty/undefined (new row)
    const currentHonor = this.acte.at(index).get('mnt_honor')?.value;
    const currentRemb = this.acte.at(index).get('mnt_remb')?.value;

    this.acte.at(index).patchValue({
      abrv_act: selectedValue.abrv_act,
      cod_act: selectedValue.cod_act,
      let_cod: selectedValue.let_cod || null,
      cot_act: selectedValue.cot_act || null,
      act_prix: selectedValue.act_prix || null,
      mnt_honor: (currentHonor === '' || currentHonor === null || currentHonor === undefined) ? 0 : currentHonor,
      mnt_remb: (currentRemb === '' || currentRemb === null || currentRemb === undefined) ? 0 : currentRemb
    });

    console.log("ligne", this.lignes)

  }
  libVisite: string[] = []
  selectedVisit: any
  onSelectedVisite(selectedValue: any, index: number): void {
    this.selectedVisit = selectedValue

    const selectedActe = this.listVisite.find(acte => acte.cod_Visit === selectedValue.cod_Visit);
    this.libVisite[index] = selectedActe.lib_Visit

    // Get current values - only initialize to 0 if they are empty/undefined (new row)
    const currentHonor = this.visite.at(index).get('mnt_honor')?.value;
    const currentRemb = this.visite.at(index).get('mnt_remb')?.value;

    // Auto-generate num_lig if not set
    const currentNumLig = this.visite.at(index).get('num_lig')?.value;
    const numLig = (currentNumLig === '' || currentNumLig === null || currentNumLig === undefined) ? (index + 1) : currentNumLig;

    this.visite.at(index).patchValue({
      cod_visit: selectedValue.cod_Visit,
      abrv_act: selectedValue.abrv_Act,
      num_lig: numLig,
      prix_visit: selectedValue.prix_Visit || null,
      taux_remb: selectedValue.taux_Remb || null,
      mnt_honor: (currentHonor === '' || currentHonor === null || currentHonor === undefined) ? 0 : currentHonor,
      mnt_remb: (currentRemb === '' || currentRemb === null || currentRemb === undefined) ? 0 : currentRemb
    });
  }
  libAppareil: string[] = []
  onSelectedAppareil(selectedValue: any, index: number): void {
    console.log('selectedValue', selectedValue);


    const selectedActe = this.listAppareil.find(acte => acte.cod_app === selectedValue.cod_app);
    this.libAppareil[index] = selectedActe.lib_app

    // Get current values - only initialize to 0 if they are empty/undefined (new row)
    const currentHonor = this.appareil.at(index).get('mnt_honor')?.value;
    const currentRemb = this.appareil.at(index).get('mnt_remb')?.value;

    // Auto-generate num_lig if not set
    const currentNumLig = this.appareil.at(index).get('num_lig')?.value;
    const numLig = (currentNumLig === '' || currentNumLig === null || currentNumLig === undefined) ? (index + 1) : currentNumLig;

    this.appareil.at(index).patchValue({
      cod_app: selectedValue.cod_app,
      abrv_act: selectedValue.abrv_act,
      num_lig: numLig,
      mnt_honor: (currentHonor === '' || currentHonor === null || currentHonor === undefined) ? 0 : currentHonor,
      mnt_remb: (currentRemb === '' || currentRemb === null || currentRemb === undefined) ? 0 : currentRemb
    });


    console.log('listVisite', this.appareil);

  }
  mntNetArray: number[] = []; // Declare an array to store the amounts for each line

  calcul_mnt_net(event: any, index: number) {
    const ligBult = this.ligPretForm.get('acte') as FormArray;
    if (event.target.value == null) {
      Swal.fire({
        title: 'Message',
        text: 'Mnt honor est obligatoire',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
    }
    // Removed auto-calculation call
    this.calculateTotals();
  }

  OnselectRefTyp(event: any) {
    // Logic moved to HTML (conditional list binding)
  }
  OnselectRefTypVisite(event: any) {
    // Logic moved to HTML (conditional list binding)
  }

  OnselectRefTypMed(event: any) {
    // Logic moved to HTML (conditional list binding)
  }


  OnselectRefTypApp(event: any) {
    // No longer overwriting the shared list.
    // The selection logic is now handled in the HTML template by switching between
    // listRefEtablisApp_Personne and listRefEtablisApp_Etab based on row.prf_typ
  }
  etab_rsoc: string[] = []
  onSelectedEtablis(selectedValue: any, index: number): void {
    console.log('selectedValue', selectedValue);

    const listToSearch = (this.listRef_Personne.concat(this.listRef_Etab));
    const selectedEtablis = listToSearch.find(etablis => etablis.etab_rsoc === selectedValue.etab_rsoc);
    if (selectedEtablis) {
      this.etab_rsoc[index] = selectedEtablis.etab_rsoc;
    }
    this.acte.at(index).patchValue({
      prf_typ: selectedValue.prf_typ,
      prf_cod: selectedValue.prf_cod
    });
  }
  calculateTotals() {
    this.totalHonoraires = this.acte.controls.reduce((sum, ligne) => {
      const val = ligne.get('mnt_honor')?.value;
      const honor = parseFloat(val || '0') || 0;
      return sum + honor;
    }, 0);

    this.totalNet = this.acte.controls.reduce((sum, ligne) => {
      const val = ligne.get('mnt_remb')?.value;
      const net = parseFloat(val || '0') || 0;
      return sum + net;
    }, 0);

    if (this.selectedRow !== null && this.selectedRow !== undefined) {
      this.recomputeCurrentLineNet(this.selectedRow);
      this.calculateTotalsTot();
    }
  }


  get phar(): FormArray {
    return this.ligPharForm.get('phar') as FormArray;
  }

  createLignePhar(): FormGroup {
    return this.fb.group({


      cod_soc: [this.token.getUser().codSoc],
      mat_pers: [''],
      num_fam: [''],
      dat_soin: ['', Validators.required],
      abrv_act: ['', Validators.required],
      cod_med: [''],
      num_lig: [''],
      indice: ['1'],
      mnt_honor: [''],
      mnt_remb: [0],
      mnt_net: [0],
      accord_med: [''],
      dat_act: [''],
      prf_typ: [''],
      prf_cod: [''],
      num_pec_med: [''],
      mdc_prix: [''],
      med_prix: [''],
      prix_remb: [''],
      mut_mnt_net: [''],
      nbr_j: [''],
      decis_med: [''],

    });

  }
  addLignePhar(index: any): void {
    this.phar.push(this.createLignePhar());

    // ✅ Auto-fill date from previous line
    if (index > 0) {
      const prevDate = this.phar.at(index - 1).get('dat_act')?.value;
      if (prevDate) {
        this.phar.at(index).patchValue({ dat_act: prevDate });
      }
    }

    this.calculateTotalsPhar()
    const ligPhar = this.ligPharForm.get('phar') as FormArray;

    // Use the same service method as buletin-cnam: getNumLigMed
    this.servRemb.getNumLigMed(
      this.bultArriver.cod_soc,
      this.bultArriver.mat_pers,
      this.bultArriver.num_fam,
      this.bultArriver.dat_soin,
      ligPhar.value[index].abrv_act
    ).subscribe((data: any) => {
      this.phar.at(index).patchValue({
        num_lig: data
      })
    })
  }

  removeLignePhar(index: number): void {



    const ligne = this.phar.at(index).value; // Récupérer les données de la ligne

    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
      abrv_act: ligne.abrv_act,
    }

    this.serv.existeLigActArriver(cle).subscribe((exists: any) => {
      if (exists) {
        this.serv.deleteLigMedArriver(ligne.cod_soc, ligne.mat_pers, ligne.num_fam, ligne.dat_soin, ligne.abrv_act, ligne.num_lig, ligne.cod_med).subscribe(() => {
          this.phar.removeAt(index);
          this.calculateTotalsPhar();
        }, error => {
          console.error("Erreur lors de la suppression :", error);
        });
      }
    }, error => {

      console.error("Erreur lors de la vérification d'existence :", error);

      this.phar.removeAt(index);
      this.calculateTotalsPhar();

    });
  }

  // Detail delete methods continue below...
  verif_indice_phar(item: any, index: any) {
    const ligPhar = this.ligPharForm.get('phar') as FormArray;
    this.servRemb.verif_indice(ligPhar.value[index].abrv_act, this.bultArriver.cod_fil, this.bultArriver.cod_assur, ligPhar.value[index].abrv_act.indice).
      subscribe((data: any) => {
        console.log("data", data)
        if (data.reponse != null) {
          Swal.fire({
            title: 'Message',
            text: data.reponse,
            icon: 'error',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });

          item.target.value = '';
        }
      })
  }

  verif_vign_pahr(item: any, index: any) {

    const ligPhar = this.ligPharForm.get('phar') as FormArray;

    console.log("ligBult :", ligPhar)
    this.servRemb.verif_vign(ligPhar.value[index].abrv_act, this.bultArriver.cod_fil, this.bultArriver.cod_assur, ligPhar.value[index].mnt_honor, ligPhar.value[index].abrv_act.nbr_vign).
      subscribe((data: any) => {
        console.log("data", data)
        if (data.reponse != null) {
          Swal.fire({
            title: 'Message',
            text: data.reponse,
            icon: 'error',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });

          item.target.value = '';
        }
      })
  }

  verif_piece_pahr(item: any, index: any) {
    const ligPhar = this.ligPharForm.get('phar') as FormArray;
    console.log("ligBult :", ligPhar)
    this.servRemb.verif_piece(ligPhar.value[index].abrv_act, this.bultArriver.cod_fil, this.bultArriver.cod_assur, ligPhar.value[index].abrv_act.mnt_honor, ligPhar.value[index].abrv_act.nbr_piece).
      subscribe((data: any) => {
        console.log("data", data)
        if (data.reponse != null) {
          Swal.fire({
            title: 'Message',
            text: data.reponse,
            icon: 'error',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });

          item.target.value = '';
        }
      })
  }
  etab_rsoc_phar: string[] = []
  onSelectedEtablisPhar(selectedValue: any, index: number): void {
    console.log('selectedValue', selectedValue);

    const listToSearch = (this.listRef_Personne.concat(this.listRef_Etab));
    const selectedActe = listToSearch.find(etablis => etablis.etab_rsoc === selectedValue.etab_rsoc);
    if (selectedActe) {
      this.etab_rsoc_phar[index] = selectedActe.etab_rsoc;
    }
    this.phar.at(index).patchValue({ prf_cod: selectedValue.prf_cod });
  }

  calcul_mnt_netPhar(event: any, index: number) {
    const ligBult = this.ligPharForm.get('phar') as FormArray;
    if (event.target.value == null) {
      Swal.fire({
        title: 'Message',
        text: 'Mnt honor est obligatoire',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
    }
    // Removed auto-calculation call
    this.calculateTotalsPhar();
  }
  totalHonorairesPhar: number = 0;
  totalNetPhar: number = 0;
  calculateTotalsPhar() {
    this.totalHonorairesPhar = this.phar.controls.reduce((sum, ligne) => {
      const val = ligne.get('mnt_honor')?.value;
      const honor = parseFloat(val || '0') || 0;
      return sum + honor;
    }, 0);

    this.totalNetPhar = this.phar.controls.reduce((sum, ligne) => {
      const val = ligne.get('mnt_remb')?.value;
      const net = parseFloat(val || '0') || 0;
      return sum + net;
    }, 0);

    if (this.selectedRow !== null && this.selectedRow !== undefined) {
      this.recomputeCurrentLineNet(this.selectedRow);
      this.calculateTotalsTot();
    }
  }

  totalHonoraireTot: number = 0;
  totalNetTot: number = 0;
  calculateTotalsTot() {
    console.log("this.tot :", this.lignes)
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

  recomputeCurrentLineNet(index: number) {
    if (index === null || index === undefined) return;

    const actesNet = this.acte?.controls.reduce((sum, c) => sum + (parseFloat(c.get('mnt_remb')?.value) || 0), 0) || 0;
    const visitesNet = this.visite?.controls.reduce((sum, c) => sum + (parseFloat(c.get('mnt_remb')?.value) || 0), 0) || 0;
    const pharNet = this.phar?.controls.reduce((sum, c) => sum + (parseFloat(c.get('mnt_remb')?.value) || 0), 0) || 0;
    const appNet = this.appareil?.controls.reduce((sum, c) => sum + (parseFloat(c.get('mnt_remb')?.value) || 0), 0) || 0;

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
        tot_honor: newTotHonor
      }, { emitEvent: false }); // Avoid infinite loop if tot_net change triggers something
    }

    this.calculateTotalsTot(); // Propagate to total bordereau
  }


  libMed: string[] = []
  selectedMed: any
  onSelectedMed(selectedValue: any, index: number): void {

    console.log('selectedValue', selectedValue);
    this.selectedMed = selectedValue
    const selectedMed = this.listMed.find(acte => acte.cod_med === selectedValue.cod_med);
    this.libMed[index] = selectedMed.lib_med

    // Get current values - only initialize to 0 if they are empty/undefined (new row)
    const currentHonor = this.phar.at(index).get('mnt_honor')?.value;
    const currentRemb = this.phar.at(index).get('mnt_remb')?.value;

    // Auto-generate num_lig if not set
    const currentNumLig = this.phar.at(index).get('num_lig')?.value;
    const numLig = (currentNumLig === '' || currentNumLig === null || currentNumLig === undefined) ? (index + 1) : currentNumLig;

    this.phar.at(index).patchValue({
      cod_med: selectedValue.cod_med,
      abrv_act: selectedValue.abrv_act,
      mdc_prix: selectedValue.mdc_prix,
      num_lig: numLig,
      med_prix: selectedValue.med_prix || null,
      prix_remb: selectedValue.prix_remb || null,
      mnt_honor: (currentHonor === '' || currentHonor === null || currentHonor === undefined) ? 0 : currentHonor,
      mnt_remb: (currentRemb === '' || currentRemb === null || currentRemb === undefined) ? 0 : currentRemb
    });


  }
  /* Fin Traitement des medicaments*/


  /* Traitement des Visites*/

  get visite(): FormArray {
    return this.ligVisiteForm.get('visite') as FormArray;
  }

  createLigneVisite(): FormGroup {
    return this.fb.group({

      cod_soc: [this.token.getUser().codSoc],
      mat_pers: [''],
      num_fam: [''],
      dat_soin: ['', Validators.required],
      abrv_act: [''],
      cod_visit: ['', Validators.required],
      num_lig: [''],
      mnt_honor: [''],
      mnt_remb: [0],
      mnt_net: [0],
      indice: [''],
      dat_act: [''],
      prf_typ: [''],
      prf_cod: [''],
      prix_visit: [''],
      taux_remb: [''],
      mut_mnt_net: [''],
      decis_med: [''],


    });

  }

  addLigneVisite(): void {
    this.visite.push(this.createLigneVisite());

    // ✅ Auto-fill date from previous line
    const index = this.visite.length - 1;
    if (index > 0) {
      const prevDate = this.visite.at(index - 1).get('dat_act')?.value;
      if (prevDate) {
        this.visite.at(index).patchValue({ dat_act: prevDate });
      }
    }

    this.calculateTotalsVisite()
  }

  removeLigneVisite(index: number): void {
    this.visite.removeAt(index);
    this.calculateTotalsVisite()
  }


  etab_rsoc_visite: string[] = []

  onSelectedEtablisVisite(selectedValue: any, index: number): void {
    console.log('selectedValueVisit', selectedValue);

    const listToSearch = (this.listRef_Personne.concat(this.listRef_Etab));
    const selectedActe = listToSearch.find(etablis => etablis.etab_rsoc === selectedValue.etab_rsoc);
    if (selectedActe) {
      this.etab_rsoc_visite[index] = selectedActe.etab_rsoc;
    }
    this.visite.at(index).patchValue({ prf_cod: selectedValue.prf_cod });
  }
  calcul_mnt_net_visite(event: any, index: number) {
    const ligBult = this.ligVisiteForm.get('visite') as FormArray;
    if (event.target.value == null) {
      Swal.fire({
        title: 'Message',
        text: 'Mnt honor est obligatoire',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
    }
    // Removed auto-calculation call
    this.calculateTotalsVisite();
  }

  totalHonorairesVisite: number = 0;
  totalNetVisite: number = 0;
  calculateTotalsVisite() {
    this.totalHonorairesVisite = this.visite.controls.reduce((sum, ligne) => {
      const val = ligne.get('mnt_honor')?.value;
      const honor = parseFloat(val || '0') || 0;
      return sum + honor;
    }, 0);

    this.totalNetVisite = this.visite.controls.reduce((sum, ligne) => {
      const val = ligne.get('mnt_remb')?.value;
      const net = parseFloat(val || '0') || 0;
      return sum + net;
    }, 0);

    if (this.selectedRow !== null && this.selectedRow !== undefined) {
      this.recomputeCurrentLineNet(this.selectedRow);
      this.calculateTotalsTot();
    }
  }

  verif_indice_visite(item: any, index: any) {
    const ligPhar = this.ligVisiteForm.get('visite') as FormArray;
    this.servRemb.verif_indice(ligPhar.value[index].abrv_act, this.bultArriver.cod_fil, this.bultArriver.cod_assur, ligPhar.value[index].abrv_act.indice).
      subscribe((data: any) => {
        console.log("data", data)
        if (data.reponse != null) {
          Swal.fire({
            title: 'Message',
            text: data.reponse,
            icon: 'error',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });

          item.target.value = '';
        }
      })
  }


  /* Fin Traitement des Visites*/


  /*  Traitement des appareils*/

  get appareil(): FormArray {
    return this.ligAppareilForm.get('appareil') as FormArray;
  }

  createLigneAppareil(): FormGroup {
    return this.fb.group({


      cod_soc: [this.token.getUser().codSoc],
      mat_pers: [''],
      num_fam: [''],
      dat_soin: ['', Validators.required],
      abrv_act: [''],
      cod_app: ['', Validators.required],
      num_lig: [''],
      mnt_honor: [''],
      mnt_remb: [0],
      mnt_net: [0],
      accord_app: [''],
      indice: [''],
      dat_act: [''],
      prf_typ: [''],
      prf_cod: [''],
      num_pec_app: [''],
      mut_mnt_net: [''],


    });

  }
  addLigneAppareil(index: number): void {
    const ligBult = this.ligAppareilForm.get('appareil') as FormArray;
    this.appareil.push(this.createLigneAppareil());

    // ✅ Auto-fill date from previous line
    if (index > 0) {
      const prevDate = this.appareil.at(index - 1).get('dat_act')?.value;
      if (prevDate) {
        this.appareil.at(index).patchValue({ dat_act: prevDate });
      }
    }

    this.calculateTotalsVisite()
    console.log("ligBult.value ", ligBult.value)

    // Use the same service method as buletin-cnam: getNumLigApp
    this.servRemb.getNumLigApp(
      this.bultArriver.cod_soc,
      this.bultArriver.mat_pers,
      this.bultArriver.num_fam,
      this.bultArriver.dat_soin,
      ligBult.value[index].cod_app
    ).subscribe((data: any) => {
      this.appareil.at(index).patchValue({
        num_lig: data
      })
    })
  }



  removeLigneAppareil(index: number): void {
    this.appareil.removeAt(index);
    this.calculateTotalsAppareil()
  }



  etab_rsoc_appareil: string[] = []
  onSelectedEtablisApp(selectedValue: any, index: number): void {
    console.log('selectedValue', selectedValue);

    const listToSearch = (this.listRef_Personne.concat(this.listRef_Etab));
    const selectedActe = listToSearch.find(etablis => etablis.etab_rsoc === selectedValue.etab_rsoc);
    if (selectedActe) {
      this.etab_rsoc_appareil[index] = selectedActe.etab_rsoc;
    }
    this.appareil.at(index).patchValue({ prf_cod: selectedValue.prf_cod });
  }
  calcul_mnt_net_app(event: any, index: number) {
    const ligBult = this.ligAppareilForm.get('appareil') as FormArray;
    if (event.target.value == null) {
      Swal.fire({
        title: 'Message',
        text: 'Mnt honor est obligatoire',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
    }
    // Removed auto-calculation call
    this.calculateTotalsAppareil();
  }

  totalHonorairesAppareil: number = 0;
  totalNetAppareil: number = 0;
  calculateTotalsAppareil() {
    this.totalHonorairesAppareil = this.appareil.controls.reduce((sum, ligne) => {
      const val = ligne.get('mnt_honor')?.value;
      const honor = parseFloat(val || '0') || 0;
      return sum + honor;
    }, 0);

    this.totalNetAppareil = this.appareil.controls.reduce((sum, ligne) => {
      const val = ligne.get('mnt_remb')?.value;
      const net = parseFloat(val || '0') || 0;
      return sum + net;
    }, 0);

    if (this.selectedRow !== null && this.selectedRow !== undefined) {
      this.recomputeCurrentLineNet(this.selectedRow);
      this.calculateTotalsTot();
    }
  }

  verif_indice_app(item: any, index: any) {
    const ligPhar = this.ligAppareilForm.get('appareil') as FormArray;
    this.servRemb.verif_indice(ligPhar.value[index].abrv_act, this.bultArriver.cod_fil, this.bultArriver.cod_assur, ligPhar.value[index].abrv_act.indice).
      subscribe((data: any) => {
        console.log("data", data)
        if (data.reponse != null) {
          Swal.fire({
            title: 'Message',
            text: data.reponse,
            icon: 'error',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });

          item.target.value = '';
        }
      })
  }


  /* Fin Traitement des appareils*/


  totalHonorairesLigBult: number = 0;
  totalNetLigBult: number = 0;



  calculerTotaux() {
    if (this.ligBult && this.ligBult.length) {
      this.totalHonorairesLigBult = this.ligBult.reduce((sum, item) => sum + (item.mnt_honor || 0), 0);
      this.totalNetLigBult = this.ligBult.reduce((sum, item) => sum + (item.mnt_remb || 0), 0);
    }
  }


  logRowData(rowData: any, index: number): void {
    this.selectedRow = index;
    this.bultArriver = rowData
    if (rowData.num_fam) {
      this.selectedRow = index;
      this.servRemb.getVisitManuel(rowData.cod_fil, rowData.cod_assur).subscribe((data: any) => {
        this.listVisite = data
        this.columnVisite = [
          { key: "cod_Visit", label: "Abrv acte" },
          { key: "lib_Visit", label: "Libelle" },

        ];
        //this.addLigneVisite()
      })
      this.servRemb.getActesManuel(rowData.cod_fil, rowData.cod_assur).subscribe((data: any) => {
        this.listActe = data
        this.columnActe = [
          { key: "abrv_act", label: "Abrv acte" },
          { key: "lib_act", label: "Libelle" },

        ];
        // this.addActe()
      })
      this.serv.getMeds(rowData.cod_fil, rowData.cod_assur).subscribe((data: any) => {

        this.listMed = data
        this.columnsMed = [
          { key: "cod_med", label: "Code" },
          { key: "lib_med", label: "Libelle" },
          { key: "med_prix", label: "Mdc Prix" },

        ];
        //this.addLignePhar(index)
      })
      this.serv.getAppareil(rowData.cod_fil, rowData.cod_assur).subscribe((data: any) => {
        this.listAppareil = data

        this.columnsAppareil = [
          { key: "cod_app", label: "Code" },
          { key: "lib_app", label: "Libelle" },

        ];
        //this.addLigneAppareil(index)
      })
      console.log('Ligne sélectionnée :', rowData);
    } else {
      // Optionnel : alerte ou log
      console.warn(`La ligne ${index + 1} ne peut pas être sélectionnée : num_fam vide`);
    }
  }

  load(item: any, index: number) {
    if (this.isLoading) {
      return;
    }
    console.log("=== LOAD METHOD - CHECKING SEARCH MODE ===");

    // ✅ SAVE PREVIOUS ROW STATE BEFORE SWITCHING
    if (this.selectedRow !== null && this.selectedRow !== undefined && this.selectedRow !== index) {
      this.saveCurrentRowState(this.selectedRow);
    }
    console.log("Loading bulletin details for row:", index);
    console.log("list item:", item);

    // ✅ CRITICAL: Clear forms immediately to prevent stale data validation errors
    this.clearTableData('acte');
    this.clearTableData('visite');
    this.clearTableData('phar');
    this.clearTableData('appareil');
    this.isLoadingDetails = true; // ✅ START LOADING SIGNAL

    this.selectedRow = index;
    this.bultArriver = item;

    let dat_soin = this.formatDateToDDMMYYYY(item.dat_soin);

    if (!dat_soin && this.ListeFamillePersonnelParLigne[index] && item.num_fam) {
      const fam = this.ListeFamillePersonnelParLigne[index].find((f: any) => f.num_fam === item.num_fam);
      if (fam && fam.dat_soin) {
        dat_soin = this.formatDateToDDMMYYYY(fam.dat_soin);
      }
    }

    const oracleDatSoin = this.convertToBackendDateFormat(dat_soin) || dat_soin || '';
    console.log('Oracle format dat_soin for backend calls:', oracleDatSoin);

    if (!oracleDatSoin) {
      console.error('❌ Cannot load data: no valid dat_soin');
      return;
    }

    // Use class property mode
    const isArriverMode = this.isArriverMode;
    console.log(`🔍 Loading data in ${isArriverMode ? 'ARRIVER' : 'ENVOI'} mode (will ${!isArriverMode ? 'ZERO OUT' : 'KEEP'} monetary values)`);

    // Use forkJoin to load all reference lists in parallel
    forkJoin({
      listActe: this.servRemb.getActesManuel(item.cod_fil, item.cod_assur),
      listVisite: this.servRemb.getVisitManuel(item.cod_fil, item.cod_assur),
      listMed: this.servRemb.getMeds(item.cod_fil, item.cod_assur),
      listApp: this.servRemb.getAppareil(item.cod_fil, item.cod_assur)
    }).subscribe({
      next: (refs: any) => {
        if (this.selectedRow !== index) return;

        this.listActe = refs.listActe || [];
        this.listVisite = refs.listVisite || [];
        this.listMed = refs.listMed || [];
        this.listAppareil = refs.listApp || [];

        // Setup columns
        this.columnActe = [{ key: "abrv_act", label: "Abrv acte" }, { key: "lib_act", label: "Libelle" }];
        this.columnVisite = [{ key: "cod_Visit", label: "Abrv acte" }, { key: "lib_Visit", label: "Libelle" }];
        this.columnsMed = [{ key: "cod_med", label: "Code" }, { key: "lib_med", label: "Libelle" }, { key: "med_prix", label: "Mdc Prix" }];
        this.columnsAppareil = [{ key: "cod_app", label: "Code" }, { key: "lib_app", label: "Libelle" }];

        // Check cache for ALL detail types
        const cache = this.bulletinDetailsCache[index];
        if (cache) {
          console.log('Restoring from cache for index', index);
          if (cache.acte) this.restoreFormArrayFromCache(this.acte, cache.acte, () => this.createActe());
          if (cache.visite) this.restoreFormArrayFromCache(this.visite, cache.visite, () => this.createLigneVisite());
          if (cache.phar) this.restoreFormArrayFromCache(this.phar, cache.phar, () => this.createLignePhar());
          if (cache.appareil) this.restoreFormArrayFromCache(this.appareil, cache.appareil, () => this.createLigneAppareil());

          // Restore helpers
          if (cache.acteHelpers) {
            this.actes = [...cache.acteHelpers.actes];
            this.libAct = [...cache.acteHelpers.libAct];
            this.refEtablis = [...cache.acteHelpers.refEtablis];
            this.etab_rsoc = [...cache.acteHelpers.etab_rsoc];
          }
          if (cache.visiteHelpers) {
            this.visiteCode = [...cache.visiteHelpers.visiteCode];
            this.libVisite = [...cache.visiteHelpers.libVisite];
            this.refEtablisVisit = [...cache.visiteHelpers.refEtablisVisit];
            this.etab_rsoc_visite = [...cache.visiteHelpers.etab_rsoc_visite];
          }
          if (cache.pharHelpers) {
            this.Med = [...cache.pharHelpers.Med];
            this.libMed = [...cache.pharHelpers.libMed];
            this.refEtablisPhar = [...cache.pharHelpers.refEtablisPhar];
            this.etab_rsoc_phar = [...cache.pharHelpers.etab_rsoc_phar];
          }
          if (cache.appareilHelpers) {
            this.appareilCode = [...cache.appareilHelpers.appareilCode];
            this.libAppareil = [...cache.appareilHelpers.libAppareil];
            this.refEtablisApp = [...cache.appareilHelpers.refEtablisApp];
            this.etab_rsoc_appareil = [...cache.appareilHelpers.etab_rsoc_appareil];
          }

          this.calculateTotals();
          this.calculateTotalsVisite();
          this.calculateTotalsPhar();
          this.calculateTotalsAppareil();
          if (!isArriverMode) this.recomputeCurrentLineNet(index);
          this.isLoadingDetails = false;
        } else {
          // No cache? Load details from backend
          forkJoin({
            actes: isArriverMode ? this.serv.geLigActArriverById(item.cod_soc, item.mat_pers, item.num_fam, oracleDatSoin) : this.serv.geLigActArriverById(item.cod_soc, item.mat_pers, item.num_fam, oracleDatSoin),
            visites: isArriverMode ? this.serv.LigVisitArriverById(item.cod_soc, item.mat_pers, item.num_fam, oracleDatSoin) : this.servRemb.getLigBultVisit(item.cod_soc, item.mat_pers, item.num_fam, oracleDatSoin),
            meds: isArriverMode ? this.serv.LigMedArriverById(item.cod_soc, item.mat_pers, item.num_fam, oracleDatSoin) : this.servRemb.getLigBultMed(item.cod_soc, item.mat_pers, item.num_fam, oracleDatSoin),
            apps: isArriverMode ? this.serv.LigAppArriverById(item.cod_soc, item.mat_pers, item.num_fam, oracleDatSoin) : this.servRemb.getLigBultApp(item.cod_soc, item.mat_pers, item.num_fam, oracleDatSoin)
          }).pipe(
            finalize(() => {
              if (this.selectedRow === index) this.isLoadingDetails = false;
            })
          ).subscribe((res: any) => {
            if (this.selectedRow !== index) return;

            // Load Actes
            if (res.actes && res.actes.length > 0) {
              let data = res.actes;
              if (!isArriverMode) data = data.map((d: any) => ({ ...d, mnt_honor: '0.000', mnt_remb: '0.000', mnt_net: '0.000' }));
              this.loadDataIntoTable(data);
            } else { this.clearTableData('acte'); }

            // Load Visites
            if (res.visites && res.visites.length > 0) {
              let data = res.visites;
              if (!isArriverMode) data = data.map((d: any) => ({ ...d, mnt_honor: '0.000', mnt_remb: '0.000', mnt_net: '0.000' }));
              this.loadDataIntoTableVisite(data);
            } else { this.clearTableData('visite'); }

            // Load Meds
            if (res.meds && res.meds.length > 0) {
              let data = res.meds;
              if (!isArriverMode) data = data.map((d: any) => ({ ...d, mnt_honor: '0.000', mnt_remb: '0.000', mnt_net: '0.000' }));
              this.loadDataIntoTableMed(data);
            } else { this.clearTableData('phar'); }

            // Load Apps
            if (res.apps && res.apps.length > 0) {
              let data = res.apps;
              if (!isArriverMode) data = data.map((d: any) => ({ ...d, mnt_honor: '0.000', mnt_remb: '0.000', mnt_net: '0.000' }));
              this.loadDataIntoTablApp(data);
            } else { this.clearTableData('appareil'); }

            // Common logic after all detail loads
            this.calculateTotals();
            this.calculateTotalsVisite();
            this.calculateTotalsPhar();
            this.calculateTotalsAppareil();

            if (!isArriverMode) {
              this.recomputeCurrentLineNet(index);
            } else {
              (this.SaisieBulletinForm.get('lignes') as FormArray).at(index).get('tot_net')?.setValue(item.tot_net);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error loading Master data:', err);
        this.isLoadingDetails = false;
      }
    });
  } // End load method




  // Add this method to your component
  private convertToOracleFormat(dateValue: any): string {
    console.log('convertToOracleFormat input:', dateValue);

    if (!dateValue) return '';

    // If already in dd/MM/yyyy format
    if (typeof dateValue === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
      return dateValue;
    }

    // If in yyyy-MM-dd format (ISO)
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      const [year, month, day] = dateValue.split('-');
      return `${day}/${month}/${year}`;
    }

    // If it's a LocalDate array [year, month, day]
    if (Array.isArray(dateValue) && dateValue.length === 3) {
      const [year, month, day] = dateValue;
      return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    }

    // If it's a Date object
    if (dateValue instanceof Date) {
      const day = String(dateValue.getDate()).padStart(2, '0');
      const month = String(dateValue.getMonth() + 1).padStart(2, '0');
      const year = dateValue.getFullYear();
      return `${day}/${month}/${year}`;
    }

    return String(dateValue);
  }
  formatDateToDDMMYYYY(dateStr: string) {
    if (!dateStr) return '';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      return dateStr;
    }
    if (/^\d{8}$/.test(dateStr)) {
      return dateStr.replace(/^(\d{2})(\d{2})(\d{4})$/, '$1/$2/$3');
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return '';
  }

  clearTableData(type: 'acte' | 'visite' | 'phar' | 'appareil'): void {
    switch (type) {

      case 'acte':
        (this.ligPretForm.get('acte') as FormArray).clear();
        this.actes = [];
        this.libAct = [];
        this.refEtablis = [];
        this.etab_rsoc = [];
        break;
      case 'visite':
        (this.ligVisiteForm.get('visite') as FormArray).clear();
        this.visiteCode = [];
        this.libVisite = [];
        this.refEtablisVisit = [];
        this.etab_rsoc_visite = [];
        break;
      case 'phar':
        (this.ligPharForm.get('phar') as FormArray).clear();
        this.Med = [];
        this.libMed = [];
        this.refEtablisPhar = [];
        this.etab_rsoc_phar = [];
        break;
      case 'appareil':
        (this.ligAppareilForm.get('appareil') as FormArray).clear();
        this.appareilCode = [];
        this.libAppareil = [];
        this.refEtablisApp = [];
        this.etab_rsoc_appareil = [];
        break;
    }
  }


  private prepareForModeSwitch(mode: 'envoi' | 'arriver') {
    this.isLoading = true;
    // Removed mode switching - no longer needed
    // this.searchMode = mode;
    // this.linesMode = mode;
    this.selectedRow = null;

    // Clear cache when mode changes
    this.bulletinDetailsCache = {};

    // Manage Save Button State
    console.log('=== prepareForModeSwitch ===', mode);
    if (mode === 'arriver') {
      console.log('>>> DISABLING Save Button (setDisabled(false))');
      this.saveService.setDisabled(false); // Mode Arriver => Button Disabled
    } else if (mode === 'envoi') {
      console.log('>>> ENABLING Save Button (setDisabled(true))');
      this.saveService.setDisabled(true);  // Mode Envoi => Button Enabled
    } else {
      console.warn('>>> UNKNOWN MODE in prepareForModeSwitch:', mode);
    }

    try { (this.ligPretForm.get('acte') as FormArray)?.clear(); } catch { }
    try { (this.ligVisiteForm.get('visite') as FormArray)?.clear(); } catch { }
    try { (this.ligPharForm.get('phar') as FormArray)?.clear(); } catch { }
    try { (this.ligAppareilForm.get('appareil') as FormArray)?.clear(); } catch { }
    this.SaisieBulletinForm.setControl('lignes', this.fb.array([]));
    this.listActe = [];
    this.listVisite = [];
    this.listMed = [];
    this.listAppareil = [];
    this.columnActe = [];
    this.columnVisite = [];
    this.columnsMed = [];
    this.columnsAppareil = [];
    this.ligBult = [];
    this.totalHonorairesLigBult = 0;
    this.totalNetLigBult = 0;
    this.totalHonorairesVisite = 0;
    this.totalNetVisite = 0;
    this.totalNetTot = 0;
    this.ListePersonnel = [];
    this.ListeFamillePersonnelParLigne = {};
    this.NumFam = [];
    this.Nom = [];
    this.NomPrenom = [];
    this.numRetr = [];

    this.isLoading = false;
    // Note: detectChanges() removed - it was causing FormGroup errors during form clearing
    // Change detection will happen naturally after forms are re-initialized
  }



  search(item: any) {
    // Prevent this method from running if page search (arriver) is already in progress
    // OR if we are currently enjoying 'arriver' mode (e.g. after auto-redirect)
    // Removed mode check - search method no longer used
    if (this.isProcessingSearch) {
      console.log('=== SKIPPING TOP SEARCH - Page search (arriver) in progress or active ===');
      return;
    }

    console.log('=== SEARCH METHOD (TOP - ENVOI) ===');
    console.log('Search item:', item);

    // ✅ Check if item is valid
    if (!item || !item.cod_bord) {
      console.warn('⚠️ Invalid item or missing cod_bord');
      return;
    }

    // ✅ VALIDATION: Check if bordereau already exists in bord arrivé
    const existsInArriver = this.AllBordArriver.some(
      (bord: any) => bord.cod_bord === item.cod_bord
    );



    this.isProcessingSearch = true;  // Prevent page LOV from triggering
    this.prepareForModeSwitch('envoi');

    // Set envoi mode and update page title
    // this.currentSearchMode = 'envoi'; // Removed - property no longer exists
    this.pageTitle = 'Consultation des Bordereaux d\'Envoi et Saisie Manuelle des Bordereaux Arrivés CNAM';
    this.isPrintButtonsDisabled = false;  // Will be set based on validation

    // First, fetch complete bordereau details
    this.serv.getBordEnvoiDetails(item.cod_bord, item.dat_bord).subscribe({
      next: (bordDetails: any) => {
        console.log('Complete bordereau details:', bordDetails);

        // If the response is an array, take the first element
        const details = Array.isArray(bordDetails) ? bordDetails[0] : bordDetails;

        console.log('📋 Details object:', details);
        console.log('📋 Details keys:', details ? Object.keys(details) : 'null');

        if (details) {
          this.codBord = details.cod_bord;  // ✅ For LOV display
          this.cod_bord = details.cod_bord;  // ✅ For print methods
          this.codeAssur = details.cod_assur;
          this.libAssur = details.lib_assur;  // ✅ Set Libellé for UI display
          this.dateBord = details.dat_bord;  // ✅ Update dateBord property for UI binding

          console.log('📝 About to patch form with:', details);
          this.patchBordEnvoiForm(details);  // ✅ Patch form with complete data
          console.log('📝 Form values after patch:', this.BordEnvoiForm.value);

          // Then load the bulletins
          this.serv.getBultArriverByCodBord(details.cod_bord).pipe(finalize(() => {
            this.isLoading = false;
            this.isProcessingSearch = false;  // Reset flag after loading
          })).subscribe({
            next: (data: any) => {
              console.log('Bulletins loaded:', data);
              if (data && data.length > 0) {
                this.loadBultArriver(data);

                // ✅ Check if bordereau exists in arriver (only in envoi mode)
                // Always use arriver mode now
                if (false) {  // Disabled mode check
                  const existsInArriver = this.AllBordArriver.some(
                    (bord: any) => bord.cod_bord === this.codBord
                  );

                  if (!existsInArriver) {
                    console.warn('⚠️ Bordereau not found in arriver list - disabling print buttons');
                    this.isPrintButtonsDisabled = true;
                  } else {
                    console.log('✅ Bordereau found in arriver list - enabling print buttons');
                    this.isPrintButtonsDisabled = false;
                  }
                }
              } else {
                console.log('No arriver data found');
                // If no data found in envoi mode, disable print buttons
                // Always use arriver mode now
                if (false) {  // Disabled mode check
                  this.isPrintButtonsDisabled = true;
                }
              }
            },
            error: (error) => {
              console.error('Error loading bulletins:', error);
              this.isProcessingSearch = false;  // Reset flag on error
            }
          });
        }
      },
      error: (error) => {
        console.error('Error fetching bordereau details:', error);
        this.isProcessingSearch = false;
        this.isLoading = false;
      }
    });
  }

  saveCurrentRowState(index: number) {
    if (index === null || index === undefined || index < 0) return;
    if (this.isLoadingDetails) {
      console.warn(`⏳ saveCurrentRowState skipped for index ${index} - still loading.`);
      return;
    }
    this.bulletinDetailsCache[index] = {
      acte: this.acte.value,
      visite: this.visite.value,
      phar: this.phar.value,
      appareil: this.appareil.value,

      // ✅ Cache Helper Arrays (Critical for persistence)
      acteHelpers: {
        actes: [...this.actes],
        libAct: [...this.libAct],
        refEtablis: [...this.refEtablis],
        etab_rsoc: [...this.etab_rsoc]
      },
      visiteHelpers: {
        visiteCode: [...this.visiteCode],
        libVisite: [...this.libVisite],
        refEtablisVisit: [...this.refEtablisVisit],
        etab_rsoc_visite: [...this.etab_rsoc_visite]
      },
      pharHelpers: {
        Med: [...this.Med],
        libMed: [...this.libMed],
        refEtablisPhar: [...this.refEtablisPhar],
        etab_rsoc_phar: [...this.etab_rsoc_phar]
      },
      appareilHelpers: {
        appareilCode: [...this.appareilCode],
        libAppareil: [...this.libAppareil],
        refEtablisApp: [...this.refEtablisApp],
        etab_rsoc_appareil: [...this.etab_rsoc_appareil]
      }
    };
    console.log('✅ Saved cache for index', index, this.bulletinDetailsCache[index]);
  }

  restoreFormArrayFromCache(targetArray: FormArray, data: any[], createFn: () => FormGroup) {
    targetArray.clear();
    if (data && data.length) {
      data.forEach(item => {
        const group = createFn();
        group.patchValue(item);
        targetArray.push(group);
      });
    }
  }

  onNavChange(event: any) {
    // Recalculate totals immediately before potential DOM destruction affects anything
    this.calculateTotals();         // For Actes
    this.calculateTotalsVisite();   // For Visites
    this.calculateTotalsPhar();     // For Pharmacies
    this.calculateTotalsAppareil(); // For Appareils
  }
  // ✅ NEW METHOD: RESET PAGE (Triggered by 'Add New' button)
  resetPage() {
    console.log("🧹 Resetting all forms and state variables...");

    // 1. Reset Forms
    if (this.BordEnvoiForm) this.BordEnvoiForm.reset();
    if (this.SaisieBordEnvoiForm) this.SaisieBordEnvoiForm.reset();

    // Clear FormArrays
    if (this.lignes) this.lignes.clear();
    if (this.visite) this.visite.clear();
    if (this.acte) this.acte.clear();
    if (this.phar) this.phar.clear();
    if (this.appareil) this.appareil.clear();

    // 2. Reset State Variables
    this.codBord = "";
    this.dateBord = "";
    this.cod_bord = "";
    this.codeAssur = "";
    this.libAssur = "";
    this.num_fam = "";

    // Reset Mode and UI
    // Removed mode reset
    // this.currentSearchMode = 'envoi';
    // this.searchMode = 'envoi';
    this.pageTitle = 'Saisie manulles du bordereau arrivés CNAM';
    this.isPrintButtonsDisabled = false;
    this.isLoading = false;
    this.isProcessingSearch = false;
    this.selectedRow = -1; // Deselect row

    // 3. Clear Data Arrays
    this.numRetr = [];
    this.NumFam = [];
    this.NomPrenom = [];
    this.Nom = [];
    this.actes = [];
    this.visiteCode = [];
    this.appareilCode = [];
    this.Med = [];
    this.libAct = [];
    this.libVisite = [];
    this.libAppareil = [];
    this.libMed = [];

    // Reset Totals and Arrays
    this.totalHonoraires = 0;
    this.totalNet = 0;
    this.totalHonorairesVisite = 0;
    this.totalNetVisite = 0;
    this.totalHonorairesPhar = 0;
    this.totalNetPhar = 0;
    this.totalHonorairesAppareil = 0;
    this.totalNetAppareil = 0;
    this.totalHonoraireTot = 0;
    this.totalNetTot = 0;
    this.bulletinDetailsCache = {};


    // Force UI Refresh
    this.cdRef.detectChanges();
    console.log("✅ Page reset complete.");
  }



  removeLocalRow(index: number) {
    this.lignes.removeAt(index);

    // Remove from parallel arrays
    if (this.numRetr.length > index) this.numRetr.splice(index, 1);
    if (this.matPers.length > index) this.matPers.splice(index, 1);
    if (this.NomPrenom.length > index) this.NomPrenom.splice(index, 1);
    if (this.Fill.length > index) this.Fill.splice(index, 1);
    if (this.Nom.length > index) this.Nom.splice(index, 1);
    if (this.NumFam.length > index) this.NumFam.splice(index, 1);

    // Helper to shift object keys down
    const shiftObjectKeys = (obj: Record<number, any>, startIndex: number) => {
      const keys = Object.keys(obj).map(Number).sort((a, b) => a - b);
      for (const key of keys) {
        if (key > startIndex) {
          obj[key - 1] = obj[key];
          delete obj[key];
        } else if (key === startIndex) {
          delete obj[key];
        }
      }
    };

    shiftObjectKeys(this.ListeFamillePersonnelParLigne, index);
    shiftObjectKeys(this.bulletinDetailsCache, index);

    // Adjust selectedRow
    if (this.selectedRow === index) {
      this.selectedRow = null;
    } else if (this.selectedRow != null && this.selectedRow > index) {
      this.selectedRow--;
    }

    this.calculateTotalsTot();
  }

  confirm(index: any, content: any, id: any) {
    this.selectedIndex = index;
    this.selectedIndexApp = index; // Reuse if needed
    console.log("this.selectedIndex:", this.selectedIndex);
    this.modalService.open(content, { centered: true });
  }

  confirmMed(index: any, content: any, id: any) {
    this.selectedIndexMed = index;
    this.modalService.open(content, { centered: true });
  }

  confirmVisit(index: any, content: any, id: any) {
    this.selectedIndexVisit = index;
    this.modalService.open(content, { centered: true });
  }

  confirmApp(index: any, content: any, id: any) {
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
              this.actes.splice(index, 1);
              this.libAct.splice(index, 1);
              this.refEtablis.splice(index, 1);
              this.etab_rsoc.splice(index, 1);
              this.calculateTotals();
            },
            error: (error) => console.error("Erreur suppression acte:", error)
          });
        } else {
          this.acte.removeAt(index);
          this.actes.splice(index, 1);
          this.libAct.splice(index, 1);
          this.refEtablis.splice(index, 1);
          this.etab_rsoc.splice(index, 1);
          this.calculateTotals();
        }
      }
    });
  }

  ConfirmDeleteMed(index: number): void {
    const ligne = this.phar.at(index).value;
    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
    };

    this.serv.existeLigMedArriver(cle).subscribe({
      next: (exists: boolean) => {
        if (exists) {
          this.serv.deleteLigMedArriver(
            ligne.cod_soc, ligne.mat_pers, ligne.num_fam, ligne.dat_soin,
            ligne.abrv_act, ligne.num_lig_med || ligne.num_lig, ligne.cod_med
          ).subscribe({
            next: () => {
              this.phar.removeAt(index);
              this.libMed.splice(index, 1);
              this.Med.splice(index, 1);
              this.refEtablisPhar.splice(index, 1);
              this.etab_rsoc_phar.splice(index, 1);
              this.calculateTotalsPhar();
            },
            error: (error) => console.error("Erreur suppression med:", error)
          });
        } else {
          this.phar.removeAt(index);
          this.libMed.splice(index, 1);
          this.Med.splice(index, 1);
          this.refEtablisPhar.splice(index, 1);
          this.etab_rsoc_phar.splice(index, 1);
          this.calculateTotalsPhar();
        }
      }
    });
  }

  ConfirmDeleteVisit(index: number): void {
    const ligne = this.visite.at(index).value;
    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
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
              this.visiteCode.splice(index, 1);
              this.libVisite.splice(index, 1);
              this.refEtablisVisit.splice(index, 1);
              this.etab_rsoc_visite.splice(index, 1);
              this.calculateTotalsVisite();
            },
            error: (error) => console.error("Erreur suppression visite:", error)
          });
        } else {
          this.visite.removeAt(index);
          this.visiteCode.splice(index, 1);
          this.libVisite.splice(index, 1);
          this.refEtablisVisit.splice(index, 1);
          this.etab_rsoc_visite.splice(index, 1);
          this.calculateTotalsVisite();
        }
      }
    });
  }

  ConfirmDeleteApp(index: number): void {
    const ligne = this.appareil.at(index).value;
    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
    };

    this.serv.existeLigAppArriver(cle).subscribe({
      next: (exists: boolean) => {
        if (exists) {
          this.serv.deleteLigAppArriver(
            ligne.cod_soc, ligne.mat_pers, ligne.num_fam, ligne.dat_soin,
            ligne.abrv_act, ligne.num_lig_app || ligne.num_lig, ligne.cod_app
          ).subscribe({
            next: () => {
              this.appareil.removeAt(index);
              this.appareilCode.splice(index, 1);
              this.libAppareil.splice(index, 1);
              this.refEtablisApp.splice(index, 1);
              this.etab_rsoc_appareil.splice(index, 1);
              this.calculateTotalsAppareil();
            },
            error: (error) => console.error("Erreur suppression appareil:", error)
          });
        } else {
          this.appareil.removeAt(index);
          this.appareilCode.splice(index, 1);
          this.libAppareil.splice(index, 1);
          this.refEtablisApp.splice(index, 1);
          this.etab_rsoc_appareil.splice(index, 1);
          this.calculateTotalsAppareil();
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
}
