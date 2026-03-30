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
import { map, forkJoin, tap } from "rxjs";

export interface BordArriver {
  dat_bord: string;
  tot_remb: string;
  valid: string;
  nbr_bult: string;
  cod_bord: string;
  cod_assur: string;
}

@Component({
  selector: "app-saisie-txt-bord-cnam",
  templateUrl: "./saisie-txt-bord-cnam.component.html",
  styleUrl: "./saisie-txt-bord-cnam.component.scss",
})
export class SaisieTxtBordCnamComponent {
  breadCrumbItems!: Array<{}>;
  BordEnvoiForm!: FormGroup;
  ligPretForm!: FormGroup
  ligPharForm!: FormGroup
  ligVisiteForm!: FormGroup
  ligAppareilForm!: FormGroup
  SaisieBordEnvoiForm!: FormGroup;
  SaisieBulletinForm!: FormGroup;
  AllBordEnvoi: any[] = [];
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
  NumFam: any[] = []
  ListeFamillePersonnelParLigne: Record<number, any[]> = {};

  DatSoin: string = "";
  datNaiss: string = "";
  codeAssur: string = "";
  mntNet: number = 0
  mntNetPhar: number = 0
  isDisabled!: boolean;
  isSearch: boolean = true;
  constructor(
    private serv: ReceptionRemboursementService,
    private servRemb: BulletinSoinService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private token: TokenStorage,
    private saveService: SaveService,
    private cdRef: ChangeDetectorRef
  ) {
    this.SaisieBulletinForm = this.fb.group({
      lignes: this.fb.array([]),
    });
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
      tot_honor: [""],
      tot_net: [""],
      tot_remb: [""],
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
    this.getAllAssurance();
    this.GetAllRegimeRemb();
    this.saveService.registerSaveCallback(() => this.addBultSoin());
    // this.saveService.setDisabled(false);

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
      tot_remb: [""],
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
      tot_remb: [""],
      valid: [""],
      clot_bord: [""],
      tot: [""],
      num_retr: [""],
      cod_bord_cnam: [""],
      seq_bord: [""],

    });

    this.breadCrumbItems = [
      /* { label: "Réception remboursement CNAM" },
      { label: "Saisie manuelle du bordereau arrivée CNAM", active: true }, */
    ];
    this.ligPretForm = this.fb.group({
      acte: this.fb.array([]) // Tableau dynamique des détails
    });
    this.ligPharForm = this.fb.group({
      phar: this.fb.array([]) // Tableau dynamique des détails
    });
    this.ligVisiteForm = this.fb.group({
      visite: this.fb.array([]) // Tableau dynamique des détails
    });
    this.ligAppareilForm = this.fb.group({
      appareil: this.fb.array([]) // Tableau dynamique des détails
    });

    // this.addActe(0);
    // this.addLignePhar(0);
    //this.addLigneVisite()
    // this.addLigneAppareil(0)
    this.getAllBordEnvoi();
  }
  ngOnDestroy() {
    // Clear the callback to avoid memory leaks
    //  this.saveService.clearSaveCallback();
    //this.saveService.setCanSave(false)
  }
  getAllBordEnvoi(): void {

    this.serv.getAllEnvoiBordEnvoi(this.token.getUser().codSoc).subscribe({
      next: (data) => {
        this.AllBordEnvoi = data;
        console.log("liste des bordereaux :", this.AllBordEnvoi);

        this.columnBordArriver = [
          { key: "cod_bord", label: "Code de bordereau" },
          { key: "dat_bord", label: "Date de bordereau" },
        ];
      },
      error: (err) => {
        this.error = "Erreur lors de la récupération des données";
      },
    });
  }

  onSelectedValueBordArriver(event: any): void {
    // console.log("event : ", event.);
    if (event) {
      this.cod_bord = event.cod_bord;
      this.dateBord = event.dat_bord;
      this.BordEnvoiForm.patchValue({
        cod_bord: event.cod_bord,
        tot_remb: event.tot_remb,
        valid: event.valid,
        nbr_bult: event.nbr_bult,
        dat_bord: event.dat_bord,
        cod_soc: this.token.getUser().codSoc
      });
      this.saveService.setDisabled(event.valid !== 'O'); // Enable ONLY if not validated
      console.log('🔧 Save button state:', event.valid !== 'O' ? 'ENABLED' : 'DISABLED');

      this.getListPersonnelBultSoin();
    }
  }
  loadBultArriver(data: any[]) {
    const observables = data.map((item: any) =>
      this.serv.getListPersonnelBultSoin(
        this.token.getUser().codSoc,
        item.num_assur,
        this.cod_bord
      ).pipe(
        map((refData: any) => ({ item, refData }))
      )
    );

    forkJoin(observables).subscribe((results) => {
      console.log('results:', results);

      this.numRetr = results.map(({ item }) => item.num_retr);

      const familleObservables = results.map(({ item }, index) =>
        this.serv.getListFamillePersonnelBultSoin(
          this.token.getUser().codSoc,
          item.mat_pers,
          this.cod_bord
        ).pipe(
          map((familleList: any[]) => ({ index, familleList }))
        )
      );

      forkJoin(familleObservables).subscribe((familleResults) => {
        this.ListeFamillePersonnelParLigne = {};
        this.NumFam = [];

        familleResults.forEach(({ index, familleList }) => {
          this.ListeFamillePersonnelParLigne[index] = familleList || [];
          this.NumFam[index] = familleList?.[0]?.num_fam || null;
        });

        // Construction du formulaire différée avec setTimeout pour éviter NG0100
        setTimeout(() => {
          const lignesFormArray = this.fb.array(
            results.map(({ item }, i) =>
              this.fb.group({
                cod_soc: [item.cod_soc],
                mat_pers: [item.mat_pers],
                num_fam: [this.NumFam[i]],
                dat_soin: [item.dat_soin],
                cod_bord: [item.cod_bord],
                cod_assur: [item.cod_assur],
                num_soin: [item.num_soin],
                ord_bult: [item.ord_bult],
                tot_honor: [item.tot_honor],
                tot_net: [item.tot_net],
                tot_remb: [item.tot_remb],
                reg_remb: [item.reg_remb],
                cod_malad: [item.cod_malad],
                num_pec: [item.num_pec],
                cod_fil: [item.cod_fil],
                num_assur: [item.num_assur],
                dat_prev_accouch: [item.dat_prev_accouch],
                nat_bult: [item.nat_bult],
                mat_pers_conj: [item.mat_pers_conj],
                num_ass_conj: [item.num_ass_conj],
                dat_saisie: [item.dat_saisie],
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
                dat_vir: [item.dat_vir]
              })
            )
          );

          this.SaisieBulletinForm.setControl('lignes', lignesFormArray);
          this.calculateTotals();

        });

      });
    });
  }



  loadDataIntoTable(data: any[]) {
    this.actes = [];

    const observables = data.map((item: any) =>
      this.servRemb.getRefPhysique(item.prf_typ).pipe(
        map((refData: any) => ({ item, refData }))
      )
    );

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
            mnt_honor: [Number(item.mnt_honor).toFixed(3)],
            mnt_remb: [Number(item.mnt_remb).toFixed(3)],
            mnt_net: [item.mnt_net],
            indice: [item.indice],
            dat_act: [item.dat_act],
            prf_typ: [item.prf_typ],
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

    const observables = data.map((item: any) =>
      this.servRemb.getRefPhysique(item.prf_typ).pipe(
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
        })
      )
    );

    forkJoin(observables).subscribe(() => {
      this.ligVisiteForm.setControl('visite', this.fb.array(data.map((item: any) => this.fb.group({
        cod_soc: [item.cod_soc],
        mat_pers: [item.mat_pers],
        num_fam: [item.num_fam],
        dat_soin: [item.dat_soin],
        abrv_act: [item.abrv_act],
        cod_visit: [item.cod_visit],
        mnt_honor: [Number(item.mnt_honor).toFixed(3)],
        mnt_remb: [Number(item.mnt_remb).toFixed(3)],
        mnt_net: [item.mnt_net],
        indice: [item.indice],
        dat_act: [item.dat_act],
        prf_typ: [item.prf_typ],
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

    const observables = data.map((item: any) =>
      this.servRemb.getRefPhysique(item.prf_typ).pipe(
        tap((response: any) => {
          this.listRefEtablisMed = response;
          this.columnsRefEtablisMed = [
            { key: "prf_cod", label: "Code" },
            { key: "etab_rsoc", label: "Nom & Prénom" },
            { key: "met_etab", label: "Etablis" },
          ];
          this.refEtablisPhar.push(item.prf_cod);
          this.Med.push(item.cod_med);
        })
      )
    );

    forkJoin(observables).subscribe(() => {
      this.ligPharForm.setControl('phar', this.fb.array(data.map((item: any) => this.fb.group({
        cod_soc: [item.cod_soc],
        mat_pers: [item.mat_pers],
        num_fam: [item.num_fam],
        dat_soin: [item.dat_soin],
        abrv_act: [item.abrv_act],
        cod_med: [item.cod_med],
        num_lig: [item.num_lig],
        mnt_honor: [Number(item.mnt_honor).toFixed(3)],
        mnt_remb: [Number(item.mnt_remb).toFixed(3)],
        mnt_net: [item.mnt_net],
        indice: [item.indice],
        dat_act: [item.dat_act],
        prf_typ: [item.prf_typ],
        prf_cod: [item.prf_cod],
        accord_med: [item.accord_med],
        num_pec_med: [item.num_pec_med],
        mdc_prix: [item.mdc_prix],
        med_prix: [item.med_prix],
        prix_remb: [item.prix_remb],
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

    const observables = data.map((item: any) =>
      this.servRemb.getRefPhysique(item.prf_typ).pipe(
        tap((response: any) => {
          this.listRefEtablisApp = response;
          this.columnsRefEtablisApp = [
            { key: "prf_cod", label: "Code" },
            { key: "etab_rsoc", label: "Nom & Prénom" },
            { key: "met_etab", label: "Etablis" },
          ];
          this.refEtablisApp.push(item.prf_cod);
          this.appareilCode.push(item.cod_app);
        })
      )
    );

    forkJoin(observables).subscribe(() => {
      this.ligAppareilForm.setControl('appareil', this.fb.array(data.map((item: any) => this.fb.group({
        cod_soc: [item.cod_soc],
        mat_pers: [item.mat_pers],
        num_fam: [item.num_fam],
        dat_soin: [item.dat_soin],
        abrv_act: [item.abrv_act],
        cod_app: [item.cod_app],
        num_lig: [item.num_lig],
        mnt_honor: [Number(item.mnt_honor).toFixed(3)],
        mnt_remb: [Number(item.mnt_remb).toFixed(3)],
        mnt_net: [item.mnt_net],
        indice: [item.indice],
        dat_act: [item.dat_act],
        prf_typ: [item.prf_typ],
        prf_cod: [item.prf_cod],
        accord_app: [item.accord_med],
        num_pec_app: [item.num_pec_app],
        mut_mnt_net: [item.mut_mnt_net],
      }))));
      this.calculateTotalsAppareil()
      console.log("this.ligAppareilForm :", this.ligAppareilForm.value);
    });
  }
  openModalTab(content1: any) {
    this.modalService.open(content1, { size: "xl", centered: true });
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
  addBultSoin() {
    // Vérifier si le formulaire principal est valide
    if (!this.BordEnvoiForm.valid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulaire invalide',
        text: 'Veuillez remplir correctement le formulaire principal avant de continuer.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const BulletinFormArray = this.SaisieBulletinForm.get('lignes') as FormArray;
    if (this.selectedRow === null || this.selectedRow === undefined) {
      Swal.fire({
        icon: 'warning',
        title: 'Aucune sélection',
        text: 'Veuillez sélectionner un bulletin à sauvegarder.'
      });
      return;
    }

    const formArrays = [
      this.ligVisiteForm.get('visite') as FormArray,
      this.ligPharForm.get('phar') as FormArray,
      this.ligPretForm.get('acte') as FormArray,
      this.ligAppareilForm.get('appareil') as FormArray
    ];

    // Robust Date Formatter
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

    const toNullIfEmpty = (v: any) => v === '' || v === undefined ? null : v;

    const bulletin = BulletinFormArray.at(this.selectedRow).value;
    const bulletinKeys = {
      cod_soc: this.token.getUser().codSoc,
      mat_pers: bulletin.mat_pers,
      num_fam: bulletin.num_fam,
      dat_soin: formatDate(bulletin.dat_soin)
    };

    // 1. Prepare Bordereau Data
    const bordData = {
      ...this.BordEnvoiForm.value,
      dat_bord: formatDate(this.BordEnvoiForm.value.dat_bord),
      dat_deb: formatDate(this.BordEnvoiForm.value.dat_deb),
      dat_fin: formatDate(this.BordEnvoiForm.value.dat_fin),
      typ_bord: 'C',
      cod_soc: this.token.getUser().codSoc
    };
    Object.keys(bordData).forEach(k => (bordData as any)[k] = toNullIfEmpty((bordData as any)[k]));

    // 2. Prepare Bulletins Data (Exclude num_retr)
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
      Object.keys(data).forEach(k => (data as any)[k] = toNullIfEmpty((data as any)[k]));
      return data;
    });

    // 3. Prepare Detail Data
    const clean = (obj: any) => {
      const o = { ...obj };
      Object.keys(o).forEach(k => o[k] = toNullIfEmpty(o[k]));
      return o;
    };

    const visites = formArrays[0].controls.filter(c => c.get('cod_visit')?.value).map(c => ({
      ...clean(c.value),
      mnt_net: c.get('mnt_net')?.value || c.get('mnt_remb')?.value,
      ...bulletinKeys,
      dat_act: formatDate(c.get('dat_act')?.value)
    }));

    const meds = formArrays[1].controls.filter(c => c.get('cod_med')?.value).map(c => ({
      ...clean(c.value),
      mnt_net: c.get('mnt_net')?.value || c.get('mnt_remb')?.value,
      ...bulletinKeys,
      dat_act: formatDate(c.get('dat_act')?.value)
    }));

    const acts = formArrays[2].controls.filter(c => c.get('abrv_act')?.value).map(c => ({
      ...clean(c.value),
      mnt_net: c.get('mnt_net')?.value || c.get('mnt_remb')?.value,
      ...bulletinKeys,
      dat_act: formatDate(c.get('dat_act')?.value)
    }));

    const apps = formArrays[3].controls.filter(c => c.get('cod_app')?.value).map(c => ({
      ...clean(c.value),
      mnt_net: c.get('mnt_net')?.value || c.get('mnt_remb')?.value,
      ...bulletinKeys,
      dat_act: formatDate(c.get('dat_act')?.value)
    }));

    Swal.showLoading();

    // Sequence Saves
    this.servRemb.addBBordArriver(bordData).subscribe({
      next: () => {
        this.servRemb.addBultArriver(bulletinsData).subscribe({
          next: () => {
            this.servRemb.addAllLigBultArriver(visites, acts, meds, apps).subscribe({
              next: (response) => {
                const errors = [];
                if (response.visit?.success === false) errors.push(`Visit: ${response.visit.message}`);
                if (response.act?.success === false) errors.push(`Act: ${response.act.message}`);
                if (response.med?.success === false) errors.push(`Med: ${response.med.message}`);
                if (response.app?.success === false) errors.push(`App: ${response.app.message}`);

                if (errors.length > 0) {
                  Swal.fire('Attention', 'Certains détails n\'ont pas pu être enregistrés :<br>' + errors.join('<br>'), 'warning');
                } else {
                  Swal.fire('Succès', 'Bordereau et bulletins enregistrés avec succès', 'success');
                }
              },
              error: () => this.showServerError()
            });
          },
          error: (err) => {
            console.error('Error saving bulletins:', err);
            this.showServerError();
          }
        });
      },
      error: () => this.showServerError()
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
    this.serv.GetAllAssurance().subscribe((data: any) => {
      this.ListeAssurance = data;
      this.columnAssuranc = [
        { key: "cod_assur", label: "Code Assurance" },
        { key: "lib_assur", label: "Libellé" },
      ];
    });
  }

  GetAllRegimeRemb() {
    this.serv.GetAllRegimeRemb().subscribe((data: any) => {
      this.ListeRegimeRemb = data;
      console.log("liste des regime remb", this.ListeRegimeRemb);
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
        this.getAllBordEnvoi();
      });
  }

  formatDate2(event: any) {
    let value = event.target.value.replace(/\D/g, "");

    if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + "/" + value.slice(5, 9);

    event.target.value = value;
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
      .getListPersonnelBultSoin(
        this.token.getUser().codSoc,
        "01",
        this.cod_bord
      )
      .subscribe({
        next: (data: any) => {
          this.ListePersonnel = data;
          console.log("Liste des personnels pour le cod_bord :", this.cod_bord, this.ListePersonnel);

          this.columnPersonnel = [
            { key: "num_retr", label: "Numéro assurance" },
            { key: "mat_pers", label: "Matricule" },
          ];
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

  get lignes(): FormArray {
    return this.SaisieBulletinForm.get("lignes") as FormArray;
  }


  Nom: string[] = [];
  onSelectedFamillePersonnel(selectedValue: any, index: number): void {
    // 🔄 Utiliser la liste spécifique à la ligne
    const selectedFamille = this.ListeFamillePersonnelParLigne[index]?.find(
      (famille) => famille.num_fam === selectedValue.num_fam
    );

    // 🔄 Mise à jour du tableau des noms
    this.num_fam = selectedValue.num_fam;
    this.Nom[index] = selectedFamille?.nom || '';

    // 🔄 Mise à jour du formulaire (patch du FormGroup de la ligne)
    this.lignes.at(index).patchValue({
      num_fam: selectedValue.num_fam,
      dat_soin: selectedValue.dat_soin,
    });

    // ✅ Mise à jour de la ligne sélectionnée pour surligner
    this.selectedRow = index;

    // ✅ Appel différé pour garantir que tout est à jour
    setTimeout(() => {
      this.logRowData(this.lignes.at(index).value, index);
    });
  }

  matPers: string[] = [];
  NomPrenom: string[] = [];
  Fill: string[] = [];
  onSelectedPersonnel(selectedValue: any, index: number): void {
    console.log("selectedValue", selectedValue);

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
        this.columneFamillePersonnel = [
          { key: "num_fam", label: "Préstataire" },
          { key: "nom", label: "Nom" },
        ];
        // Pré-sélectionner le premier membre de la famille s’il existe
        const defaultFamille = familleList?.[0];
        if (defaultFamille) {
          this.NumFam[index] = defaultFamille.num_fam;
          this.Nom[index] = defaultFamille.nom;

          this.lignes.at(index).patchValue({
            num_fam: defaultFamille.num_fam,
            dat_soin: defaultFamille.dat_soin
          });

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
        cod_fil: selectedValue.cod_fil,
        mat_pers: selectedValue.mat_pers
      });
    }
  }



  addLigne(): void {
    this.lignes.push(this.createLigne());
    const bultArriver = (this.SaisieBulletinForm.get("lignes") as FormArray);
    bultArriver.controls.forEach((control) => {
      control.get("cod_bord")?.patchValue(this.BordEnvoiForm.get('cod_bord')?.value);
      control.get("cod_assur")?.patchValue(this.BordEnvoiForm.get('cod_assur')?.value);
    });
    // this.calculateTotals(); Met à jour les totaux
    /*  this.serv
      .getNumLigAct(
        this.formBuletinSoin.get("cod_soc")?.value,
        this.formBuletinSoin.get("mat_pers")?.value,
        this.formBuletinSoin.get("num_fam")?.value,
        this.formBuletinSoin.get("dat_soin")?.value
      )
      .subscribe((data: any) => {
        this.lignes.at(index).patchValue({
          num_lig: data,
        });
      }); */
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
      accord_act: [''],
      // mnt_net: [''],
      indice: [''],
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
    this.calculateTotals(); // Met à jour les totaux
    // this.serv.getNumLigAct(this.formBuletinSoin.get('cod_soc')?.value, this.formBuletinSoin.get('mat_pers')?.value, this.formBuletinSoin.get('num_fam')?.value,
    //   this.formBuletinSoin.get('dat_soin')?.value).subscribe((data: any) => {
    //     this.lignes.at(index).patchValue({
    //       num_lig: data
    //     })
    //   })
  }

  // removeLigne(index: number): void {
  //   this.lignes.removeAt(index);
  //   this.calculateTotals(); // Met à jour les totaux

  // }
  selectedIndex: number | null = null;
  confirm(index: any, content: any, id: any) {
    this.selectedIndex = index
    console.log("this.selectedIndex:", this.selectedIndex);
    //this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDelete(index: number): void {
    const ligne = this.acte.at(index).value;
    console.log("ligne:", ligne);
    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
    };

    console.log("Clé à vérifier :", cle);

    this.serv.existeLigActArriver(cle).subscribe({
      next: (exists: boolean) => {
        console.log("Enregistrement existant :", exists);

        if (exists) {
          this.serv.deleteLigActArriver(
            ligne.cod_soc,
            ligne.mat_pers,
            ligne.num_fam,
            ligne.dat_soin,
            ligne.abrv_act,
            ligne.num_lig,
            ligne.dat_act,
            ligne.cod_act
          ).subscribe({
            next: () => {
              this.lignes.removeAt(index); // Suppression de la ligne dans le formulaire
              this.calculateTotals();
            },
            error: (error) => {
              console.error("Erreur lors de la suppression :", error);
            }
          });
        } else {
          // Si l'enregistrement n'existe pas, on supprime directement du formulaire
          this.acte.removeAt(index);
          this.calculateTotals();
        }
      },
      error: (error) => {
        console.error("Erreur lors de la vérification d'existence :", error);
        //alert("Une erreur est survenue lors de la vérification. Veuillez réessayer.");
      }
    });
  }
  totalHonoraires: number = 0;
  totalNet: number = 0;



  libAct: string[] = []
  selectedAct: any
  onSelectedActe(selectedValue: any, index: number): void {
    this.selectedAct = selectedValue
    const selectedActe = this.listActe.find(acte => acte.abrv_act === selectedValue.abrv_act);
    this.libAct[index] = selectedActe.lib_act
    this.acte.at(index).patchValue({
      abrv_act: selectedValue.abrv_act,
      cod_act: selectedValue.cod_act
    });

    console.log("ligne", this.lignes)

  }
  libVisite: string[] = []
  selectedVisit: any
  onSelectedVisite(selectedValue: any, index: number): void {
    this.selectedVisit = selectedValue

    const selectedActe = this.listVisite.find(acte => acte.cod_Visit === selectedValue.cod_Visit);
    this.libVisite[index] = selectedActe.lib_Visit
    this.visite.at(index).patchValue({
      cod_visit: selectedValue.cod_Visit,
      abrv_act: selectedValue.abrv_Act
    });


  }
  libAppareil: string[] = []
  onSelectedAppareil(selectedValue: any, index: number): void {
    console.log('selectedValue', selectedValue);



    const selectedActe = this.listAppareil.find(acte => acte.cod_app === selectedValue.cod_app);
    this.libAppareil[index] = selectedActe.lib_app
    this.appareil.at(index).patchValue({
      cod_app: selectedValue.cod_app,
      abrv_act: selectedValue.abrv_act
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
    console.log("ligBult :", ligBult.value[index].abrv_act)
    this.servRemb.calculer_montant_net_act(this.bultArriver.cod_soc, this.bultArriver.mat_pers, ligBult.value[index].cod_act, event.target.value,
      this.bultArriver.dat_soin, this.selectedAct.act_prix, this.selectedAct.taux_act, 0, 0).subscribe((data: any) => {


        this.mntNet = data.p_mnt_net ?? 0; // Assurez-vous que la valeur est 0 si null ou undefined

        this.mntNetArray[index] = this.mntNet === 0 ? 0 : data.p_mnt_net;
        this.lignes.at(index).patchValue({ mnt_remb: this.mntNetArray[index] });
        this.calculateTotals();
        console.log(this.mntNetArray)
      })
  }

  OnselectRefTyp(event: any) {
    this.servRemb.getRefPhysique(event.target.value).subscribe((data: any) => {
      this.listRefEtablis = data

      this.columnsRefEtablis = [
        { key: "prf_cod", label: "Code" },
        { key: "etab_rsoc", label: "Nom & Prénom" },
        { key: "met_etab", label: "Etablis" },

      ];
    })
  }
  OnselectRefTypVisite(event: any) {
    this.servRemb.getRefPhysique(event.target.value).subscribe((data: any) => {
      this.listRefEtablisVisit = data

      this.columnsRefEtablisVisit = [
        { key: "prf_cod", label: "Code" },
        { key: "etab_rsoc", label: "Nom & Prénom" },
        { key: "met_etab", label: "Etablis" },

      ];
    })
  }

  OnselectRefTypMed(event: any) {
    this.servRemb.getRefPhysique(event.target.value).subscribe((data: any) => {
      this.listRefEtablisMed = data

      this.columnsRefEtablisMed = [
        { key: "prf_cod", label: "Code" },
        { key: "etab_rsoc", label: "Nom & Prénom" },
        { key: "met_etab", label: "Etablis" },

      ];
    })
  }


  OnselectRefTypApp(event: any) {
    this.servRemb.getRefPhysique(event.target.value).subscribe((data: any) => {
      this.listRefEtablisApp = data

      this.columnsRefEtablisApp = [
        { key: "prf_cod", label: "Code" },
        { key: "etab_rsoc", label: "Nom & Prénom" },
        { key: "met_etab", label: "Etablis" },

      ];
    })
  }
  etab_rsoc: string[] = []
  onSelectedEtablis(selectedValue: any, index: number): void {
    console.log('selectedValue', selectedValue);

    const selectedActe = this.listRefEtablis.find(etablis => etablis.etab_rsoc === selectedValue.etab_rsoc);
    this.etab_rsoc[index] = selectedActe.etab_rsoc
    this.lignes.at(index).patchValue({ prf_cod: selectedValue.prf_cod });
  }
  calculateTotals() {

    this.totalHonoraires = this.lignes.controls.reduce((sum, ligne) => {
      console.log("ligne :", ligne.get('mnt_honor')?.value)
      const honor = parseFloat((ligne.get('mnt_honor')?.value || '0')) || 0;
      return sum + honor;
    }, 0);

    this.totalNet = this.lignes.controls.reduce((sum, ligne) => {
      const net = parseFloat((ligne.get('mnt_remb')?.value || '0')) || 0;
      return sum + net;
    }, 0);
  }

  //   /*   Traitement des medicaments*/

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
      indice: [''],
      mnt_honor: [''],
      mnt_remb: [''],
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
    this.calculateTotalsPhar()
    const ligPhar = this.ligPharForm.get('phar') as FormArray;
    this.serv.getNumLigMed(this.bultArriver.cod_soc, this.bultArriver.mat_pers, this.bultArriver.num_fam,
      this.bultArriver.dat_soin, ligPhar.value[index].abrv_act).subscribe((data: any) => {
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

  selectedIndexMed: number | null = null;
  confirmMed(index: any, content: any, id: any) {
    this.selectedIndexMed = index
    console.log("this.selectedIndex:", this.selectedIndex);
    //this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDeleteMed(index: number): void {
    const ligne = this.phar.at(index).value; // Récupérer les données de la ligne
    console.log("ligne:", ligne);
    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
    };

    console.log("Clé à vérifier med:", cle);

    this.serv.existeLigMedArriver(cle).subscribe({
      next: (exists: boolean) => {
        console.log("Enregistrement existant med:", exists);

        if (exists) {
          debugger
          // Si l'enregistrement existe, on appelle le service de suppression
          this.serv.deleteLigMedArriver(
            ligne.cod_soc,
            ligne.mat_pers,
            ligne.num_fam,
            ligne.dat_soin,
            ligne.abrv_act,
            ligne.num_lig,
            ligne.cod_med
          ).subscribe({
            next: () => {
              this.phar.removeAt(index); // Suppression de la ligne dans le formulaire
              this.calculateTotalsPhar();
            },
            error: (error) => {
              console.error("Erreur lors de la suppression :", error);
            }
          });
        } else {
          // Si l'enregistrement n'existe pas, on supprime directement du formulaire
          this.phar.removeAt(index);
          this.calculateTotalsPhar();
        }
      },
      error: (error) => {
        console.error("Erreur lors de la vérification d'existence :", error);
        //alert("Une erreur est survenue lors de la vérification. Veuillez réessayer.");
      }
    });
  }
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

    const selectedActe = this.listRefEtablisMed.find(etablis => etablis.etab_rsoc === selectedValue.etab_rsoc);
    this.etab_rsoc_phar[index] = selectedActe.etab_rsoc
    this.phar.at(index).patchValue({ prf_cod: selectedValue.prf_cod });
  }

  mntNetArrayPhar: number[] = [];
  calcul_mnt_netPhar(event: any, index: number) {
    const ligPhar = this.ligPharForm.get('phar') as FormArray;
    console.log("ligBult :", ligPhar)
    this.serv.calculer_montant_net_med(this.bultArriver.cod_soc, this.bultArriver.mat_pers, ligPhar.value[index].cod_med
      , event.target.value, this.bultArriver.dat_soin, this.selectedMed.prix_remb,
      ligPhar.value[index].indice, 0, 0).subscribe((data: any) => {
        this.mntNetPhar = data.p_mnt_net

        this.mntNetArrayPhar[index] = data.p_mnt_net;
        this.phar.at(index).patchValue({ mnt_remb: this.mntNetArrayPhar[index] });
        this.calculateTotalsPhar();
        console.log(this.mntNetArray)
      })
  }
  totalHonorairesPhar: number = 0;
  totalNetPhar: number = 0;
  calculateTotalsPhar() {
    console.log("this.phar :", this.phar)
    this.totalHonorairesPhar = this.phar.controls.reduce((sum, ligne) => {
      const honor = parseFloat((ligne.get('mnt_honor')?.value || '0')) || 0;
      return sum + honor;
    }, 0);

    this.totalNetPhar = this.phar.controls.reduce((sum, ligne) => {
      const net = parseFloat((ligne.get('mnt_remb')?.value || '0')) || 0;
      return sum + net;
    }, 0);
  }

  libMed: string[] = []
  selectedMed: any
  onSelectedMed(selectedValue: any, index: number): void {

    console.log('selectedValue', selectedValue);
    this.selectedMed = selectedValue
    const selectedMed = this.listMed.find(acte => acte.cod_med === selectedValue.cod_med);
    this.libMed[index] = selectedMed.lib_med
    this.phar.at(index).patchValue({
      cod_med: selectedValue.cod_med,
      abrv_act: selectedValue.abrv_act,
      mdc_prix: selectedValue.mdc_prix
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
      mnt_remb: [''],
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
    this.calculateTotalsVisite()
  }

  removeLigneVisite(index: number): void {
    this.visite.removeAt(index);
    this.calculateTotalsVisite()
  }

  selectedIndexVisit: number | null = null;
  confirmVisit(index: any, content: any, id: any) {
    this.selectedIndexVisit = index
    console.log("this.selectedIndex:", this.selectedIndexVisit);
    //this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDeleteVisit(index: number): void {
    const ligne = this.visite.at(index).value; // Récupérer les données de la ligne
    console.log("ligne:", ligne);
    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
    };

    console.log("Clé à vérifier :", cle);

    this.serv.existeLigVisitArriver(cle).subscribe({
      next: (exists: boolean) => {
        console.log("Enregistrement existant :", exists);

        if (exists) {
          // Si l'enregistrement existe, on appelle le service de suppression
          this.serv.deleteLigVisitArriver(
            ligne.cod_soc,
            ligne.mat_pers,
            ligne.num_fam,
            ligne.dat_soin,
            ligne.abrv_act,
            ligne.num_lig,
            ligne.dat_act,
            ligne.cod_visit
          ).subscribe({
            next: () => {
              this.visite.removeAt(index); // Suppression de la ligne dans le formulaire
              this.calculateTotalsVisite();
            },
            error: (error) => {
              console.error("Erreur lors de la suppression :", error);
            }
          });
        } else {
          // Si l'enregistrement n'existe pas, on supprime directement du formulaire
          this.visite.removeAt(index);
          this.calculateTotalsVisite();
        }
      },
      error: (error) => {
        console.error("Erreur lors de la vérification d'existence :", error);
        //alert("Une erreur est survenue lors de la vérification. Veuillez réessayer.");
      }
    });
  }
  etab_rsoc_visite: string[] = []

  onSelectedEtablisVisite(selectedValue: any, index: number): void {
    console.log('selectedValueVisit', selectedValue);

    const selectedActe = this.listRefEtablisVisit.find(etablis => etablis.etab_rsoc === selectedValue.etab_rsoc);
    this.etab_rsoc_visite[index] = selectedActe.etab_rsoc
    this.visite.at(index).patchValue({ prf_cod: selectedValue.prf_cod });
  }
  mntNetArrayVisite: number[] = [];
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
    console.log("ligBult :", ligBult.value[index].abrv_act)
    this.servRemb.calculer_montant_net_visit(this.bultArriver.cod_soc, this.bultArriver.mat_pers, ligBult.value[index].cod_visit,
      event.target.value, this.bultArriver.dat_soin, this.selectedVisit.prix_Visit, this.selectedVisit.taux_Remb, '0').subscribe((data: any) => {
        this.mntNet = data.p_mnt_net

        this.mntNetArrayVisite[index] = data.p_mnt_net;
        this.visite.at(index).patchValue({ mnt_remb: this.mntNetArrayVisite[index] });
        this.calculateTotalsVisite();
        console.log(this.mntNetArrayVisite)
      })
  }

  totalHonorairesVisite: number = 0;
  totalNetVisite: number = 0;
  calculateTotalsVisite() {
    this.totalHonorairesVisite = this.visite.controls.reduce((sum, ligne) => {
      const honor = parseFloat((ligne.get('mnt_honor')?.value || '0')) || 0;
      return sum + honor;
    }, 0);

    this.totalNetVisite = this.visite.controls.reduce((sum, ligne) => {
      const net = parseFloat((ligne.get('mnt_remb')?.value || '0')) || 0;
      return sum + net;
    }, 0);
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
      mnt_remb: [''],
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
    this.calculateTotalsVisite()
    console.log("ligBult.value ", ligBult.value)
    this.servRemb.getNumLigApp(this.bultArriver.cod_soc, this.bultArriver.mat_pers, this.bultArriver.num_fam,
      this.bultArriver.dat_soin, ligBult.value[index].cod_app).subscribe((data: any) => {
        this.appareil.at(index).patchValue({
          num_lig: data
        })
      })


  }



  removeLigneAppareil(index: number): void {
    this.appareil.removeAt(index);
    this.calculateTotalsAppareil()
  }

  selectedIndexApp: number | null = null;
  confirmApp(index: any, content: any, id: any) {
    this.selectedIndexApp = index
    console.log("this.selectedIndex:", this.selectedIndexApp);
    //this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDeleteApp(index: number): void {
    const ligne = this.appareil.at(index).value; // Récupérer les données de la ligne
    console.log("ligne:", ligne);
    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
    };

    console.log("Clé à vérifier :", cle);

    this.serv.existeLigAppArriver(cle).subscribe({
      next: (exists: boolean) => {
        console.log("Enregistrement existant :", exists);

        if (exists) {
          // Si l'enregistrement existe, on appelle le service de suppression
          this.serv.deleteLigAppArriver(
            ligne.cod_soc,
            ligne.mat_pers,
            ligne.num_fam,
            ligne.dat_soin,
            ligne.abrv_act,
            ligne.num_lig,
            ligne.cod_app
          ).subscribe({
            next: () => {
              this.appareil.removeAt(index); // Suppression de la ligne dans le formulaire
              this.calculateTotalsAppareil();
            },
            error: (error) => {
              console.error("Erreur lors de la suppression :", error);
            }
          });
        } else {
          // Si l'enregistrement n'existe pas, on supprime directement du formulaire
          this.appareil.removeAt(index);
          this.calculateTotalsAppareil();
        }
      },
      error: (error) => {
        console.error("Erreur lors de la vérification d'existence :", error);
        //alert("Une erreur est survenue lors de la vérification. Veuillez réessayer.");
      }
    });
  }
  etab_rsoc_appareil: string[] = []
  onSelectedEtablisApp(selectedValue: any, index: number): void {
    console.log('selectedValue', selectedValue);

    const selectedActe = this.listRefEtablisApp.find(etablis => etablis.etab_rsoc === selectedValue.etab_rsoc);
    this.etab_rsoc_appareil[index] = selectedActe.etab_rsoc
    this.appareil.at(index).patchValue({ prf_cod: selectedValue.prf_cod });
  }
  mntNetArrayAppareil: number[] = [];
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
    console.log("ligBult :", ligBult.value[index].abrv_act)
    this.servRemb.calculer_montant_net_app(this.bultArriver.cod_soc, this.bultArriver.mat_pers, this.bultArriver.num_fam,
      this.bultArriver.dat_soin, event.target.value, ligBult.value[index].cod_app, 0).subscribe((data: any) => {
        this.mntNet = data.p_mnt_net ?? 0

        this.mntNetArrayAppareil[index] = this.mntNet === 0 ? 0 : data.p_mnt_net;
        this.appareil.at(index).patchValue({ mnt_remb: this.mntNetArrayAppareil[index] });
        this.calculateTotalsAppareil();
        console.log(this.mntNetArrayVisite)
      })
  }

  totalHonorairesAppareil: number = 0;
  totalNetAppareil: number = 0;
  calculateTotalsAppareil() {
    this.totalHonorairesAppareil = this.appareil.controls.reduce((sum, ligne) => {
      const honor = parseFloat((ligne.get('mnt_honor')?.value || '0')) || 0;
      return sum + honor;
    }, 0);

    this.totalNetAppareil = this.appareil.controls.reduce((sum, ligne) => {
      const net = parseFloat((ligne.get('mnt_remb')?.value || '0')) || 0;
      return sum + net;
    }, 0);
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
    console.log("list :", item);
    this.saveService.setDisabled(false);

    // 1. Actes
    this.servRemb.getActesManuel(item.cod_fil, item.cod_assur).subscribe((acte: any) => {
      this.listActe = acte || [];

      this.serv.geLigActArriverById(item.cod_soc, item.mat_pers, item.num_fam, item.dat_soin).subscribe((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          this.listActe = data;
          console.log("data acte", data)

          this.loadDataIntoTable(data);
        } else {
          // this.listActe = [];
          this.clearTableData('acte'); // méthode que tu crées pour vider le formarray
          this.loadDataIntoTable(data);
        }
      });
    });

    // 2. Visites
    this.servRemb.getVisitManuel(item.cod_fil, item.cod_assur).subscribe((data: any) => {
      this.listVisite = data || [];

      this.serv.LigVisitArriverById(item.cod_soc, item.mat_pers, item.num_fam, item.dat_soin).subscribe((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          console.log("data visit", data)
          this.loadDataIntoTableVisite(data);
          this.calculateTotalsVisite();
        } else {
          this.clearTableData('visite');
          this.calculateTotalsVisite();
        }
      });
    });

    // 3. Médicaments
    this.serv.getMeds(item.cod_fil, item.cod_assur).subscribe((data: any) => {
      this.listMed = data || [];

      this.serv.LigMedArriverById(item.cod_soc, item.mat_pers, item.num_fam, item.dat_soin).subscribe((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          this.loadDataIntoTableMed(data);
          console.log("data med", data)
          this.calculateTotalsPhar();
        } else {
          this.clearTableData('phar');
          this.calculateTotalsPhar();
        }
      });
    });

    // 4. Appareils
    this.serv.getAppareil(item.cod_fil, item.cod_assur).subscribe((data: any) => {
      this.listAppareil = data || [];
      this.serv.LigAppArriverById(item.cod_soc, item.mat_pers, item.num_fam, item.dat_soin).subscribe((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          console.log("app", data)
          this.loadDataIntoTablApp(data);
          this.calculateTotalsAppareil();
        } else {
          this.clearTableData('appareil');
          this.calculateTotalsAppareil();
        }
      });
    });
  }

  clearTableData(type: 'acte' | 'visite' | 'phar' | 'appareil'): void {
    switch (type) {
      case 'acte':
        (this.ligPretForm.get('acte') as FormArray).clear();
        break;
      case 'visite':
        (this.ligVisiteForm.get('visite') as FormArray).clear();
        break;
      case 'phar':
        (this.ligPharForm.get('phar') as FormArray).clear();
        break;
      case 'appareil':
        (this.ligAppareilForm.get('appareil') as FormArray).clear();
        break;
    }
  }

  search(item: any) {

    console.log(item)
    this.codBord = item.cod_bord
    this.codeAssur = item.cod_assur
    this.BordEnvoiForm.patchValue({
      cod_bord: item.cod_bord,
      cod_assur: item.cod_assur,
      dat_bord: item.dat_bord,
      dat_deb: item.dat_deb,
      dat_fin: item.dat_fin,
      nbr_bult: item.nbr_bult,
      tot_honor: item.tot_honor,
      typ_bord: item.typ_bord,
      cod_soc: item.cod_soc,
      tot_net: item.tot_net,
      valid_bord: item.valid_bord,
      reg_bord: item.reg_bord,
      tot_remb: item.tot_remb,
      valid: item.valid,
      clot_bord: item.clot_bord,
      tot: item.tot,
      num_retr: item.num_retr,
      cod_bord_cnam: item.cod_bord_cnam,
      seq_bord: item.seq_bord,
    })
    // this.formBuletinSoin.patchValue({
    //   cod_soc: item.cod_soc,
    //   mat_pers: item.mat_pers,
    //   num_fam: item.num_fam,
    //   dat_soin: item.dat_soin,
    //   cod_bord: item.cod_bord,
    //   cod_assur: item.cod_assur,
    //   num_soin: item.num_soin,
    //   ord_bult: item.ord_bult,
    //   tot_honor: item.tot_honor,
    //   tot_net: item.tot_net,
    //   tot_remb: item.tot_remb,
    //   reg_remb: item.reg_remb,
    //   cod_malad: item.cod_malad,
    //   num_pec: item.num_pec,
    //   cod_fil: item.cod_fil,
    //   num_assur: item.num_assur,
    //   dat_prev_accouch: item.dat_prev_accouch,
    //   nat_bult: item.nat_bult,
    //   mat_pers_conj: item.mat_pers_conj,
    //   num_ass_conj: item.num_ass_conj,
    //   dat_saisie: item.dat_saisie,
    //   obs: item.obs,
    //   obs_a: item.obs_a,
    //   envoi: item.envoi,
    //   ann_plaf_imp: item.ann_plaf_imp,
    //   reg_adh: item.reg_adh,
    //   mod_pay: item.mod_pay,
    //   dat_vir: item.dat_vir,

    // })

    this.serv.getBultArriverByCodBord(item.cod_bord).subscribe((data: any) => {
      console.log("data bult test", data)
      this.loadBultArriver(data)
    })



  }
}