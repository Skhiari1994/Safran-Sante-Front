import { ChangeDetectorRef, Component } from "@angular/core";
import { ReceptionRemboursementService } from "../reception-remboursement.service";
import { AbstractControl, FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { TokenStorage } from "src/app/account/token-storage.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import Swal from "sweetalert2";
import { BulletinSoinService } from "../../Bulletin de soins/bulletin-soin.service";
import { SaveService } from "src/app/shared/Service/save.service";
import { map, forkJoin, finalize, catchError, of } from "rxjs";
import { EnvoiServiceService } from "../../Envoi/envoi-service.service";

@Component({
  selector: "app-saisie-auto-bord-cnam",
  templateUrl: "./saisie-auto-bord-cnam.component.html",
  styleUrl: "./saisie-auto-bord-cnam.component.scss",
})
export class SaisieAutoBordCnamComponent {
  breadCrumbItems!: Array<{}>;
  BordEnvoiForm!: FormGroup;
  ligPretForm!: FormGroup
  ligPharForm!: FormGroup
  ligVisiteForm!: FormGroup
  ligAppareilForm!: FormGroup
  SaisieBulletinForm!: FormGroup;
  ListePersonnel: any[] = [];
  selectedRow: any = null;
  columnBordArriver: any[] = [];
  error: string | null = null;
  codBord: string = "";
  dateBord: string = "";
  cod_bord: string = "";
  AllBordArriver: any[] = [];
  AllBordEnvoi: any[] = [];
  ListeAssurance: any[] = [];
  ListeRegimeRemb: any[] = [];
  columnPersonnel: any[] = [];
  listActe: any[] = []
  listMed: any[] = []
  listVisite: any[] = []
  listAppareil: any[] = []

  columnActe: any[] = []
  columnsMed: any[] = []
  columnVisite: any[] = []
  columnsAppareil: any[] = []
  columneFamillePersonnel: any[] = [];

  actes: string[] = []
  visiteCode: string[] = []
  appareilCode: string[] = []
  Med: string[] = []
  libAssur: string = "";
  numRetr: string[] = []
  NomPrenom: string[] = []
  Nom: string[] = []
  NumFam: any[] = []
  ListeFamillePersonnelParLigne: Record<number, any[]> = {};

  codeAssur: string = "";
  isLoading: boolean = false;
  isProcessingSearch: boolean = false;
  isParsingFile: boolean = false;

  totalNetTot: number = 0;
  totalHonoraires: number = 0;
  totalNet: number = 0;
  totalHonorairesVisite: number = 0;
  totalNetVisite: number = 0;
  totalHonorairesPhar: number = 0;
  totalNetPhar: number = 0;
  totalHonorairesAppareil: number = 0;
  totalNetAppareil: number = 0;

  // Cache for storing bulletin details
  bulletinDetailsCache: { [key: number]: any } = {};

  // Helper arrays used in LOV lookups and table displays
  libVisite: string[] = [];
  libAct: string[] = [];
  libMed: string[] = [];
  libAppareil: string[] = [];
  etab_rsoc_visite: string[] = [];
  etab_rsoc_phar: string[] = [];
  etab_rsoc_appareil: string[] = [];
  etab_rsoc: string[] = [];

  pageTitle: string = 'Saisie automatique du bordereau arrivés CNAM';
  isPrintButtonsDisabled: boolean = false;
  public isArriverMode: boolean = true;

  constructor(
    private serv: ReceptionRemboursementService,
    private servRemb: BulletinSoinService,
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
      lib_remb: [""],
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
    this.getAllAssurance();
    this.GetAllRegimeRemb();
    this.getAllBordArriverList();
    this.getAllBordEnvoiList();

    this.columnActe = [{ key: "cod_act", label: "Code" }, { key: "lib_act", label: "Libellé" }];
    this.columnsMed = [{ key: "cod_med", label: "Code" }, { key: "lib_med", label: "Libellé" }];
    this.columnVisite = [{ key: "cod_Visit", label: "Code" }, { key: "lib_Visit", label: "Libellé" }];
    this.columnsAppareil = [{ key: "cod_app", label: "Code" }, { key: "lib_app", label: "Libellé" }];
    this.columneFamillePersonnel = [{ key: "num_fam", label: "N°" }, { key: "nom", label: "Nom" }];

    this.saveService.registerSaveCallback(() => this.saveCurrentRow());
    this.saveService.setDisabled(true);

    this.BordEnvoiForm = this.fb.group({
      cod_bord: [""], cod_assur: [""], dat_bord: [""], dat_deb: [""], dat_fin: [""],
      nbr_bult: [""], tot_honor: [""], typ_bord: [""], cod_soc: [""], tot_net: [""],
      valid_bord: [""], reg_bord: [""], tot_remb: [0], valid: [""], clot_bord: [""],
      tot: [""], num_retr: [""], cod_bord_cnam: [""], seq_bord: [""],
    });

    this.ligPretForm = this.fb.group({ acte: this.fb.array([]) });
    this.ligPharForm = this.fb.group({ phar: this.fb.array([]) });
    this.ligVisiteForm = this.fb.group({ visite: this.fb.array([]) });
    this.ligAppareilForm = this.fb.group({ appareil: this.fb.array([]) });

    this.columnBordArriver = [
      { key: "cod_bord", label: "Code de bordereau" },
      { key: "dat_bord", label: "Date de bordereau" },
    ];

    this.libVisite[0] = '';
    this.libAct[0] = '';
    this.libAppareil[0] = '';
    this.etab_rsoc_visite[0] = '';
    this.libMed[0] = '';
    this.etab_rsoc_phar[0] = '';
    this.etab_rsoc_appareil[0] = '';
    this.etab_rsoc[0] = '';
  }

  ngOnDestroy() { this.saveService.clearSaveCallback(); }

  getAllBordArriverList() {
    this.serv.GetAllBordArriver(this.token.getUser().codSoc).subscribe(data => this.AllBordArriver = data);
  }

  getAllBordEnvoiList() {
    this.serv.getAllBordEnvoiCnam(this.token.getUser().codSoc).subscribe(data => this.AllBordEnvoi = data);
  }

  getAllAssurance() {
    this.serv.GetAllAssurance().subscribe((data: any) => this.ListeAssurance = data);
  }

  GetAllRegimeRemb() {
    this.serv.GetAllRegimeRemb().subscribe((data: any) => this.ListeRegimeRemb = data);
  }

  onSelectedValueBordArriverPage(event: any): void {
    if (this.isProcessingSearch || !event) return;
    this.isProcessingSearch = true;
    this.isArriverMode = true;
    this.pageTitle = 'Consultation Bordereaux Arrivés CNAM';
    const bord = this.AllBordArriver.find(b => b.cod_bord === event.cod_bord);
    if (bord) {
      this.codBord = bord.cod_bord; this.cod_bord = bord.cod_bord; this.dateBord = bord.dat_bord;
      this.codeAssur = bord.cod_assur; this.libAssur = bord.lib_assur;
      this.BordEnvoiForm.patchValue({ ...bord, tot_remb: (Number(bord.tot_remb) || 0).toFixed(3) });
      this.getListPersonnelBultSoin();
      this.searchArriver(bord);
    }
  }

  getListPersonnelBultSoin() {
    this.serv.getPersonnelBultSoinSaisieLibre(this.token.getUser().codSoc, this.codeAssur).subscribe((data: any[]) => {
      this.ListePersonnel = data;
      this.columnPersonnel = [{ key: "num_retr", label: "N° Retrait" }, { key: "mat_pers", label: "Matricule" }, { key: "nom", label: "Nom" }];
    });
  }

  searchArriver(item: any) {
    this.isLoading = true;
    this.serv.getBultArriverByCodBord2(item.cod_bord).pipe(finalize(() => { this.isLoading = false; this.isProcessingSearch = false; })).subscribe(data => {
      if (data && data.length > 0) this.loadBultArriver(data);
      else this.addLigne();
    });
  }

  search(event: any) {
    if (this.isProcessingSearch || !event) return;
    this.isProcessingSearch = true;
    this.isArriverMode = false;
    this.pageTitle = 'Saisie automatique (Mode Envoi)';
    this.serv.getBordEnvoiDetails(event.cod_bord, event.dat_bord).subscribe((details: any) => {
      details = Array.isArray(details) ? details[0] : details;
      if (details) {
        this.codBord = details.cod_bord; this.cod_bord = details.cod_bord; this.codeAssur = details.cod_assur;
        this.libAssur = details.lib_assur; this.dateBord = details.dat_bord;
        this.BordEnvoiForm.patchValue(details);
        this.serv.getBultArriverByCodBord(details.cod_bord).pipe(finalize(() => this.isProcessingSearch = false)).subscribe(data => {
          if (data && data.length > 0) this.loadBultArriver(data);
        });
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.parseCnamFile(e.target.result);
      reader.readAsText(file);
    }
  }

  private parseCnamFile(content: string): void {
    this.isParsingFile = true;
    const lines = content.split('\n');
    const headerLine = lines.find(l => l.startsWith('1'));
    if (!headerLine) { Swal.fire('Erreur', 'Fichier invalide type 1 manquant', 'error'); this.isParsingFile = false; return; }

    this.parseType1Bordereau(headerLine);
    if (!this.codeAssur) { Swal.fire('Erreur', 'Assurance introuvable', 'error'); this.isParsingFile = false; return; }

    this.prepareForModeSwitch('arriver');
    this.serv.getPersonnelBultSoinSaisieLibre(this.token.getUser().codSoc, this.codeAssur).subscribe(pers => {
      this.ListePersonnel = pers;
      let currentIdx = -1;
      lines.forEach(line => {
        if (!line.trim()) return;
        const type = line[0];
        if (type === '2') { currentIdx++; this.parseType2Bulletin(line, currentIdx); }
        else if (type === '3' && currentIdx >= 0) this.parseType3Visite(line, currentIdx);
        else if (type === '4' && currentIdx >= 0) this.parseType4Med(line, currentIdx);
        else if (type === '5' && currentIdx >= 0) this.parseType5Acte(line, currentIdx);
        else if (type === '6' && currentIdx >= 0) this.parseType6App(line, currentIdx);
      });
      this.isParsingFile = false;
      this.calculateTotalsTot();

      // Automatically load the first bulletin's details after parsing
      if (this.lignes.length > 0) {
        console.log('📋 Auto-loading first bulletin details after TXT parse');
        setTimeout(() => {
          this.load(this.lignes.at(0).value, 0);
          this.cdRef.detectChanges();
        }, 500);
      }
    });
  }

  private parseType1Bordereau(line: string) {
    const vnum_retr = line.substring(2, 10).trim();
    const vcod_bord = line.substring(18, 38).trim().replace(/^0+/, '');
    const vtot_remb = parseFloat(line.substring(63, 75).trim()) / 1000;
    const ass = this.ListeAssurance.find(a => a.num_retr === vnum_retr);
    this.codeAssur = ass?.cod_assur || ""; this.libAssur = ass?.lib_assur || "";
    this.codBord = vcod_bord; this.cod_bord = vcod_bord; this.dateBord = this.parseDate(line.substring(10, 18).trim());
    this.BordEnvoiForm.patchValue({ cod_bord: vcod_bord, cod_assur: this.codeAssur, dat_bord: this.dateBord, tot_remb: vtot_remb.toFixed(3) });
  }

  private parseType2Bulletin(line: string, idx: number) {
    const vnum_retr = line.substring(7, 15).trim().replace(/^0+/, '');
    const vnum_fam = parseInt(line.substring(18, 20).trim()) || 0;
    const pers = this.ListePersonnel.find(p => p.num_retr?.replace(/^0+/, '') === vnum_retr || p.num_assur?.replace(/^0+/, '') === vnum_retr);
    const reg_code = line.substring(110, 111).trim().padStart(2, '0');
    const reg = this.ListeRegimeRemb.find(r => r.reg_remb === reg_code);
    const tot = parseFloat(line.substring(46, 56).trim()) / 1000;
    this.numRetr[idx] = vnum_retr; this.NomPrenom[idx] = pers?.nom || ""; this.NumFam[idx] = vnum_fam;
    const g = this.createLigne();
    g.patchValue({ mat_pers: pers?.mat_pers || "", num_fam: vnum_fam, dat_soin: this.parseDate(line.substring(28, 36).trim()), cod_bord: this.cod_bord, cod_assur: this.codeAssur, tot_net: tot, reg_remb: reg?.reg_remb || "" });
    this.lignes.push(g);
    this.bulletinDetailsCache[idx] = { acte: [], visite: [], phar: [], appareil: [] };
  }

  private parseType3Visite(line: string, idx: number) {
    this.bulletinDetailsCache[idx].visite.push({ cod_visit: line.substring(46, 51).trim(), mnt_honor: (parseFloat(line.substring(18, 28).trim()) / 1000).toFixed(3), mnt_remb: (parseFloat(line.substring(28, 38).trim()) / 1000).toFixed(3), dat_act: this.parseDate(line.substring(38, 46).trim()) });
  }

  private parseType4Med(line: string, idx: number) {
    this.bulletinDetailsCache[idx].phar.push({ cod_med: line.substring(18, 26).trim().replace(/^0+/, ''), mnt_honor: (parseFloat(line.substring(38, 48).trim()) / 1000).toFixed(3), mnt_remb: (parseFloat(line.substring(48, 58).trim()) / 1000).toFixed(3), dat_act: this.parseDate(line.substring(26, 34).trim()), nbr_j: line.substring(58, 61).trim() });
  }

  private parseType5Acte(line: string, idx: number) {
    this.bulletinDetailsCache[idx].acte.push({ cod_act: line.substring(18, 28).trim(), mnt_honor: (parseFloat(line.substring(42, 52).trim()) / 1000).toFixed(3), mnt_remb: (parseFloat(line.substring(52, 62).trim()) / 1000).toFixed(3), dat_act: this.parseDate(line.substring(63, 71).trim()), indice: line.substring(38, 42).trim() });
  }

  private parseType6App(line: string, idx: number) {
    this.bulletinDetailsCache[idx].appareil.push({ cod_app: line.substring(18, 28).trim(), mnt_honor: (parseFloat(line.substring(36, 46).trim()) / 1000).toFixed(3), mnt_remb: (parseFloat(line.substring(46, 56).trim()) / 1000).toFixed(3), dat_act: this.parseDate(line.substring(28, 36).trim()) });
  }

  private parseDate(v: string) { return v && v.length === 8 ? `${v.substring(6, 8)}/${v.substring(4, 6)}/${v.substring(0, 4)}` : ""; }

  load(item: any, index: number) {
    if (this.isLoading) return;
    console.log('🔄 Loading bulletin details for index:', index, 'Item:', item);

    // Save current row state before switching
    if (this.selectedRow !== null && this.selectedRow !== index) {
      this.saveCurrentRowState(this.selectedRow);
    }

    this.selectedRow = index;
    const dat = this.convertToBackendDateFormat(this.formatDateToDDMMYYYY(item.dat_soin));
    if (!dat) {
      console.warn('⚠️ Invalid date format, cannot load details');
      return;
    }

    // Load reference lists and bulletin details
    this.servRemb.getActesManuel(item.cod_fil, item.cod_assur).subscribe(list => {
      this.listActe = list || [];
      console.log('📋 Loaded actes list:', this.listActe.length);

      const cache = this.bulletinDetailsCache[index]?.acte;
      if (cache && cache.length > 0) {
        console.log('✅ Restoring actes from cache:', cache.length);
        this.restoreFormArrayFromCache(this.acte, cache, () => this.createActe());
        this.updateLibelles('acte', index);
      } else {
        console.log('📥 Loading actes from database');
        this.serv.geLigActArriverById(item.cod_soc, item.mat_pers, item.num_fam, dat).subscribe(d => {
          console.log('✅ Loaded actes from DB:', d?.length || 0);
          this.loadDataTableGeneric(this.acte, d, 'cod_act', this.listActe, this.libAct);
        });
      }
    });

    this.servRemb.getVisitManuel(item.cod_fil, item.cod_assur).subscribe(list => {
      this.listVisite = list || [];
      console.log('📋 Loaded visites list:', this.listVisite.length);

      const cache = this.bulletinDetailsCache[index]?.visite;
      if (cache && cache.length > 0) {
        console.log('✅ Restoring visites from cache:', cache.length);
        this.restoreFormArrayFromCache(this.visite, cache, () => this.createLigneVisite());
        this.updateLibelles('visite', index);
      } else {
        console.log('📥 Loading visites from database');
        this.serv.LigVisitArriverById(item.cod_soc, item.mat_pers, item.num_fam, dat).subscribe(d => {
          console.log('✅ Loaded visites from DB:', d?.length || 0);
          this.loadDataTableGeneric(this.visite, d, 'cod_visit', this.listVisite, this.libVisite);
        });
      }
    });

    this.servRemb.getMeds(item.cod_fil, item.cod_assur).subscribe(list => {
      this.listMed = list || [];
      console.log('📋 Loaded meds list:', this.listMed.length);

      const cache = this.bulletinDetailsCache[index]?.phar;
      if (cache && cache.length > 0) {
        console.log('✅ Restoring meds from cache:', cache.length);
        this.restoreFormArrayFromCache(this.phar, cache, () => this.createLignePhar());
        this.updateLibelles('phar', index);
      } else {
        console.log('📥 Loading meds from database');
        this.serv.LigMedArriverById(item.cod_soc, item.mat_pers, item.num_fam, dat).subscribe(d => {
          console.log('✅ Loaded meds from DB:', d?.length || 0);
          this.loadDataTableGeneric(this.phar, d, 'cod_med', this.listMed, this.libMed);
        });
      }
    });

    this.servRemb.getAppareil(item.cod_fil, item.cod_assur).subscribe(list => {
      this.listAppareil = list || [];
      console.log('📋 Loaded appareils list:', this.listAppareil.length);

      const cache = this.bulletinDetailsCache[index]?.appareil;
      if (cache && cache.length > 0) {
        console.log('✅ Restoring appareils from cache:', cache.length);
        this.restoreFormArrayFromCache(this.appareil, cache, () => this.createLigneAppareil());
        this.updateLibelles('appareil', index);
      } else {
        console.log('📥 Loading appareils from database');
        this.serv.LigAppArriverById(item.cod_soc, item.mat_pers, item.num_fam, dat).subscribe(d => {
          console.log('✅ Loaded appareils from DB:', d?.length || 0);
          this.loadDataTableGeneric(this.appareil, d, 'cod_app', this.listAppareil, this.libAppareil);
        });
      }
    });
  }

  saveCurrentRow() { if (this.selectedRow !== null) this.addBultSoin(); }

  addBultSoin() {
    this.saveCurrentRowState(this.selectedRow);
    const formatDate = (d: any) => { if (!d) return null; if (typeof d === 'string' && d.includes('/')) return d; const date = new Date(d); return isNaN(date.getTime()) ? null : `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`; };
    const clean = (list: any[]) => list.map(item => { const c: any = {}; Object.keys(item).forEach(k => c[k] = (item[k] === '' ? null : item[k])); return c; });

    const allV: any[] = [], allA: any[] = [], allM: any[] = [], allAp: any[] = [];
    this.lignes.controls.forEach((ctrl, i) => {
      const b = ctrl.value; const c = this.bulletinDetailsCache[i];
      if (c) {
        const keys = { cod_soc: b.cod_soc, mat_pers: b.mat_pers, num_fam: b.num_fam, dat_soin: formatDate(b.dat_soin) };
        c.visite?.forEach((v: any) => allV.push({ ...v, ...keys, dat_act: formatDate(v.dat_act) }));
        c.acte?.forEach((a: any) => allA.push({ ...a, ...keys, dat_act: formatDate(a.dat_act) }));
        c.phar?.forEach((m: any) => allM.push({ ...m, ...keys, dat_act: formatDate(m.dat_act) }));
        c.appareil?.forEach((ap: any) => allAp.push({ ...ap, ...keys, dat_act: formatDate(ap.dat_act) }));
      }
    });

    const bordData = { ...this.BordEnvoiForm.value, dat_bord: formatDate(this.BordEnvoiForm.value.dat_bord), typ_bord: 'C', cod_soc: this.token.getUser().codSoc };
    const bultsData = this.lignes.value.map((b: any) => ({ ...b, dat_soin: formatDate(b.dat_soin), dat_saisie: formatDate(b.dat_saisie) }));

    Swal.fire({ title: 'Sauvegarde...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    this.servRemb.addBBordArriver(clean([bordData])[0]).subscribe(() => {
      this.servRemb.addBultArriver(clean(bultsData)).subscribe(() => {
        this.servRemb.addAllLigBultArriver(clean(allV), clean(allA), clean(allM), clean(allAp)).subscribe(() => {
          Swal.fire('Succès', 'Enregistrement réussi', 'success'); this.getAllBordArriverList();
        });
      });
    });
  }

  get visite() { return this.ligVisiteForm.get('visite') as FormArray; }
  get acte() { return this.ligPretForm.get('acte') as FormArray; }
  get phar() { return this.ligPharForm.get('phar') as FormArray; }
  get appareil() { return this.ligAppareilForm.get('appareil') as FormArray; }

  createLigneVisite() { return this.fb.group({ cod_soc: [""], mat_pers: [""], num_fam: [""], dat_soin: [""], cod_visit: [""], mnt_honor: [""], mnt_remb: [""], dat_act: [""] }); }
  createActe() { return this.fb.group({ cod_soc: [""], mat_pers: [""], num_fam: [""], dat_soin: [""], cod_act: [""], mnt_honor: [""], mnt_remb: [""], dat_act: [""], indice: [""] }); }
  createLignePhar() { return this.fb.group({ cod_soc: [""], mat_pers: [""], num_fam: [""], dat_soin: [""], cod_med: [""], mnt_honor: [""], mnt_remb: [""], dat_act: [""], nbr_j: [""], indice: [""] }); }
  createLigneAppareil() { return this.fb.group({ cod_soc: [""], mat_pers: [""], num_fam: [""], dat_soin: [""], cod_app: [""], mnt_honor: [""], mnt_remb: [""], dat_act: [""] }); }

  addLigneVisite() { this.visite.push(this.createLigneVisite()); }
  addActe() { this.acte.push(this.createActe()); }
  addLignePhar() { this.phar.push(this.createLignePhar()); }
  addLigneAppareil() { this.appareil.push(this.createLigneAppareil()); }

  onSelectedVisite(e: any, i: number) { if (e) { this.visiteCode[i] = e.cod_Visit; this.libVisite[i] = e.lib_Visit; this.visite.at(i).patchValue({ cod_visit: e.cod_Visit }); } }
  onSelectedActe(e: any, i: number) { if (e) { this.actes[i] = e.cod_act; this.libAct[i] = e.lib_act; this.acte.at(i).patchValue({ cod_act: e.cod_act }); } }
  onSelectedMed(e: any, i: number) { if (e) { this.Med[i] = e.cod_med; this.libMed[i] = e.lib_med; this.phar.at(i).patchValue({ cod_med: e.cod_med }); } }
  onSelectedAppareil(e: any, i: number) { if (e) { this.appareilCode[i] = e.cod_app; this.libAppareil[i] = e.lib_app; this.appareil.at(i).patchValue({ cod_app: e.cod_app }); } }

  onSelectedPersonnel(e: any, i: number) { if (e) { this.numRetr[i] = e.num_retr; this.NomPrenom[i] = e.nom; (this.lignes.at(i) as FormGroup).patchValue({ mat_pers: e.mat_pers, num_assur: e.num_retr, cod_fil: e.cod_fil }); this.serv.getListFamillePersonnelBultSoinLibre(this.token.getUser().codSoc, e.mat_pers).subscribe(d => this.ListeFamillePersonnelParLigne[i] = d); } }
  onSelectedFamillePersonnel(e: any, i: number) { if (e) { this.NumFam[i] = e.num_fam; this.Nom[i] = e.nom; (this.lignes.at(i) as FormGroup).patchValue({ num_fam: e.num_fam }); } }

  calculateTotalsTot() { this.totalNetTot = this.lignes.controls.reduce((s, c) => s + (parseFloat(c.value.tot_net) || 0), 0); }
  calculateTotals() { this.totalHonoraires = this.acte.controls.reduce((s, c) => s + (parseFloat(c.value.mnt_honor) || 0), 0); this.totalNet = this.acte.controls.reduce((s, c) => s + (parseFloat(c.value.mnt_remb) || 0), 0); this.recomputeCurrentLineNet(); }
  calculateTotalsVisite() { this.totalHonorairesVisite = this.visite.controls.reduce((s, c) => s + (parseFloat(c.value.mnt_honor) || 0), 0); this.totalNetVisite = this.visite.controls.reduce((s, c) => s + (parseFloat(c.value.mnt_remb) || 0), 0); this.recomputeCurrentLineNet(); }
  calculateTotalsPhar() { this.totalHonorairesPhar = this.phar.controls.reduce((s, c) => s + (parseFloat(c.value.mnt_honor) || 0), 0); this.totalNetPhar = this.phar.controls.reduce((s, c) => s + (parseFloat(c.value.mnt_remb) || 0), 0); this.recomputeCurrentLineNet(); }
  calculateTotalsAppareil() { this.totalHonorairesAppareil = this.appareil.controls.reduce((s, c) => s + (parseFloat(c.value.mnt_honor) || 0), 0); this.totalNetAppareil = this.appareil.controls.reduce((s, c) => s + (parseFloat(c.value.mnt_remb) || 0), 0); this.recomputeCurrentLineNet(); }
  recomputeCurrentLineNet() { if (this.selectedRow !== null) { this.lignes.at(this.selectedRow).get('tot_net')?.setValue((this.totalNet + this.totalNetVisite + this.totalNetPhar + this.totalNetAppareil).toFixed(3)); this.calculateTotalsTot(); } }

  addLigne() { const g = this.createLigne(); g.patchValue({ cod_bord: this.cod_bord, cod_assur: this.codeAssur, dat_saisie: new Date().toLocaleDateString('fr-FR') }); this.lignes.push(g); this.selectedRow = this.lignes.length - 1; this.cdRef.detectChanges(); }
  ConfirmDeleteBulletin(i: number) { this.lignes.removeAt(i); this.selectedRow = null; this.calculateTotalsTot(); }

  prepareForModeSwitch(mode: any) { this.lignes.clear(); this.selectedRow = null; this.bulletinDetailsCache = {}; this.saveService.setDisabled(mode === 'arriver' ? false : true); }
  private formatDateToDDMMYYYY(d: string) { if (!d) return ''; const date = new Date(d); return isNaN(date.getTime()) ? d : `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`; }
  private convertToBackendDateFormat(d: string) { const p = d.split('/'); return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : d; }

  saveCurrentRowState(i: number) {
    if (i !== null) {
      this.bulletinDetailsCache[i] = {
        acte: this.acte.value,
        visite: this.visite.value,
        phar: this.phar.value,
        appareil: this.appareil.value,
        acteHelpers: { actes: [...this.actes], libAct: [...this.libAct] },
        visiteHelpers: { visiteCode: [...this.visiteCode], libVisite: [...this.libVisite] },
        pharHelpers: { Med: [...this.Med], libMed: [...this.libMed] },
        appareilHelpers: { appareilCode: [...this.appareilCode], libAppareil: [...this.libAppareil] }
      };
    }
  }

  private restoreFormArrayFromCache(arr: FormArray, data: any[], create: () => FormGroup) { arr.clear(); data.forEach(d => { const g = create(); g.patchValue(d); arr.push(g); }); }

  loadBultArriver(data: any[]) {
    this.lignes.clear();
    const obs = data.map((item, i) => this.serv.getListPersonnelBultSoin(this.token.getUser().codSoc, this.codeAssur, this.cod_bord).pipe(map(p => ({ item, p: Array.isArray(p) ? p[0] : p }))));
    forkJoin(obs).subscribe(res => {
      res.forEach(({ item, p }, i) => {
        const nr = item.num_retr || item.num_assur;
        this.numRetr[i] = nr; this.NomPrenom[i] = item.nom_prenom || p?.nom || ""; this.NumFam[i] = item.num_fam;
        const g = this.createLigne(); g.patchValue({ ...item, dat_soin: this.formatDateToDDMMYYYY(item.dat_soin) }); this.lignes.push(g);
        this.serv.getListFamillePersonnelBultSoinLibre(this.token.getUser().codSoc, item.mat_pers).subscribe(fam => {
          this.ListeFamillePersonnelParLigne[i] = fam;
          if (Array.isArray(fam)) {
            const found = fam.find((f: any) => f.num_fam == item.num_fam);
            this.Nom[i] = found?.nom || "";
          }
        });
      });
      this.calculateTotalsTot();
    });
  }

  loadDataTableGeneric(arr: FormArray, data: any[], codeField: string, list: any[], libArr: string[]) {
    arr.clear(); data.forEach((d, i) => {
      const g = (arr === this.acte) ? this.createActe() : (arr === this.visite) ? this.createLigneVisite() : (arr === this.phar) ? this.createLignePhar() : this.createLigneAppareil();
      g.patchValue(d); arr.push(g);
      const code = d[codeField];
      if (arr === this.acte) { this.actes[i] = code; this.libAct[i] = list.find(x => x.cod_act === code)?.lib_act || ""; }
      else if (arr === this.visite) { this.visiteCode[i] = code; this.libVisite[i] = list.find(x => x.cod_Visit === code)?.lib_Visit || ""; }
      else if (arr === this.phar) { this.Med[i] = code; this.libMed[i] = list.find(x => x.cod_med === code)?.lib_med || ""; }
      else { this.appareilCode[i] = code; this.libAppareil[i] = list.find(x => x.cod_app === code)?.lib_app || ""; }
    });
    this.recomputeTotalsAll();
  }

  updateLibelles(type: string, idx: number) {
    const cache = this.bulletinDetailsCache[idx]; if (!cache) return;
    if (type === 'acte') cache.acte.forEach((d: any, i: number) => { this.actes[i] = d.cod_act; this.libAct[i] = this.listActe.find(x => x.cod_act === d.cod_act)?.lib_act || ""; });
    else if (type === 'visite') cache.visite.forEach((d: any, i: number) => { this.visiteCode[i] = d.cod_visit; this.libVisite[i] = this.listVisite.find(x => x.cod_Visit === d.cod_visit)?.lib_Visit || ""; });
    else if (type === 'phar') cache.phar.forEach((d: any, i: number) => { this.Med[i] = d.cod_med; this.libMed[i] = this.listMed.find(x => x.cod_med === d.cod_med)?.lib_med || ""; });
    else if (type === 'appareil') cache.appareil.forEach((d: any, i: number) => { this.appareilCode[i] = d.cod_app; this.libAppareil[i] = this.listAppareil.find(x => x.cod_app === d.cod_app)?.lib_app || ""; });
  }

  recomputeTotalsAll() { this.calculateTotals(); this.calculateTotalsVisite(); this.calculateTotalsPhar(); this.calculateTotalsAppareil(); }
  onNavChange(e: any) { this.recomputeTotalsAll(); }
  resetPage() { this.prepareForModeSwitch('envoi'); this.BordEnvoiForm.reset(); this.codBord = ""; this.dateBord = ""; this.codeAssur = ""; this.libAssur = ""; this.numRetr = []; this.NomPrenom = []; this.cdRef.detectChanges(); }

  printBordArrivGlobal() { if (!this.cod_bord) return; this.serv.imprimerBordArrivGlobal(this.token.getUser().codSoc, this.cod_bord).subscribe((data: any) => { const blob = new Blob([data], { type: 'application/pdf' }); window.open(URL.createObjectURL(blob)); }); }
  printBordArrivDetail() { if (!this.cod_bord) return; this.serv.imprimerBordArrivDetail(this.token.getUser().codSoc, this.cod_bord).subscribe((data: any) => { const blob = new Blob([data], { type: 'application/pdf' }); window.open(URL.createObjectURL(blob)); }); }

  clearTableData(table: string) {
    if (table === 'acte') { this.acte.clear(); this.actes = []; this.libAct = []; this.totalHonoraires = 0; this.totalNet = 0; }
    else if (table === 'visite') { this.visite.clear(); this.visiteCode = []; this.libVisite = []; this.totalHonorairesVisite = 0; this.totalNetVisite = 0; }
    else if (table === 'phar') { this.phar.clear(); this.Med = []; this.libMed = []; this.totalHonorairesPhar = 0; this.totalNetPhar = 0; }
    else if (table === 'appareil') { this.appareil.clear(); this.appareilCode = []; this.libAppareil = []; this.totalHonorairesAppareil = 0; this.totalNetAppareil = 0; }
    this.recomputeCurrentLineNet();
  }
}
