import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { LovComponent } from 'src/app/shared/Composants/lov/lov.component';

import { BulletinSoinService } from '../bulletin-soin.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { SaveService } from 'src/app/shared/Service/save.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { forkJoin, map, Subject, takeUntil } from 'rxjs';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-buletin-mutuelle',
  templateUrl: './buletin-mutuelle.component.html',
  styleUrl: './buletin-mutuelle.component.scss'
})
export class BuletinMutuelleComponent implements OnInit, OnDestroy {
  @ViewChildren(LovComponent) lovs!: QueryList<LovComponent>;
  @ViewChild('dtActes') tableActes!: Table;
  @ViewChild('dtPhar') tablePhar!: Table;
  formBuletinSoin!: FormGroup
  ligPretForm!: FormGroup
  ligPharForm!: FormGroup

  pSusp: number = 1
  columnsMat: any[] = []
  columnsAdherent: any[] = []
  columnsPEC: any[] = []
  columnsPerCons: any[] = []
  breadCrumbItems!: Array<{}>;

  columnsBultSoin: any[] = []
  columnActe: any[] = []
  columnsRefEtablis: any[] = []
  columnsMed: any[] = []
  columnsRefEtablisPhar: any[] = []

  listPersonnel: any[] = []
  listAdherent: any[] = []
  listPEC: any[] = []
  listPerCons: any[] = []
  listLigBultFiltr: any[] = []
  listLigBult: any[] = []
  listBultSoin: any[] = []
  listActe: any[] = []
  listRefEtablis: any[] = []
  listMed: any[] = []
  listRefEtablisPhar: any[] = []


  matricule: string = ''
  numFam: string = ''
  numAssur: string = ''
  nomPers: string = ''
  codAssur: string = ''
  libAssur: string = ''
  cod_fil: string = ''
  lib_fill: string = ''
  lib_assur: string = ''
  num_retr: string = ''
  nomAdherent: string = ''
  datNais: string = ''
  ageAn: string = ''
  ageMois: string = ''
  PEC: string = ''
  etabliss: string = ''
  datPec: string = ''
  nomPersCons: string = ''
  matConj: string = ''
  soldPlafond: string = ''
  soldPlafondEstim: any
  sexe: string = ''
  parente: string = ''
  acte: string[] = []
  Med: string[] = []
  refEtablis: string[] = []
  refEtablisPhar: string[] = []
  mntNet: string = ''
  mntNetPhar: string = ''

  // Selection tracking for PrimeNG tables
  selectedActes: any[] = []
  selectedPhar: any[] = []
  currentEditingRowActes: any | null = null
  currentEditingRowPhar: any | null = null
  private destroy$ = new Subject<void>()
  
  editingActesIndex: number | null = null
  editingPharIndex: number | null = null
  showActeEditor: boolean[] = []
  showCodeEditor: boolean[] = []
  showMedEditor: boolean[] = []
  showCodeEditorPhar: boolean[] = []
  activeTabIndex: number = 0

  isSearch: boolean = true;
  isDisabled!: boolean;
  numFamSearch: string = ''
  deleteId: any;
  columnTitles: { [key: string]: string } = {
    cod_act: "Code acte",
    lib_act: "Libellé acte",
    let_cod: "Let",
    cot_act: "Cot act",
    act_prix: "Prix acte",
    taux_act: "Taux",
    nat_act: "Nature acte",
    abrv_act: "Acte"
  };
  constructor(
    private token: TokenStorageService,
    private serv: BulletinSoinService,
    private fb: FormBuilder,
    private saveService: SaveService,
    private modalService: NgbModal,
    public service: PaginationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.formBuletinSoin = this.fb.group({
      cod_soc: [this.token.getUser().codSoc],
      mat_pers: [''],
      num_fam: [''],
      dat_soin: [''],
      cod_bord: [''],
      cod_assur: [''],
      num_soin: [''],
      ord_bult: [''],
      tot_honor: [''],
      tot_net: [''],
      tot_remb: [''],
      reg_remb: [''],
      cod_malad: [''],
      num_pec: [''],
      cod_fil: [''],
      num_assur: [''],
      dat_prev_accouch: [''],
      nat_bult: ['M'],
      mat_pers_conj: [''],
      num_ass_conj: [''],
      dat_saisie: [new Date().toLocaleDateString().substring(0, 10)],
      obs: [''],
      obs_a: [''],
      envoi: [''],
      ann_plaf_imp: [''],
      reg_adh: [''],
      mod_pay: [''],
      dat_vir: [''],

    })

    this.ligPretForm = this.fb.group({
      lignes: this.fb.array([]) // Tableau dynamique des détails
    });
    this.ligPharForm = this.fb.group({
      phar: this.fb.array([]) // Tableau dynamique des détails
    });
    this.saveService.add$.subscribe((reset) => {
      if (reset) {
        this.lovs?.forEach(l => l.clear());
        this.ligPretForm.reset();
        this.ligPharForm.reset();
        this.formBuletinSoin.reset();

        this.matricule = '';
        this.numFam = '';
        this.nomPers = '';
        this.lib_assur = '';
        this.lib_fill = '';
        this.nomAdherent = '';
        this.datNais = '';
        this.ageAn = '';
        this.ageMois = '';
        this.PEC = '';
        this.etabliss = '';
        this.datPec = '';
        this.soldPlafond = '';
        this.soldPlafondEstim = '';
        this.num_retr = '';

        this.refEtablisPhar = [];
        this.etab_rsoc = [];
        this.etab_rsoc_phar = [];
        this.acte = [];
        this.libAct = [];
        this.Med = [];
        this.libMed = [];

        this.selectedActes = [];
        this.selectedPhar = [];
        this.showActeEditor = [];
        this.showCodeEditor = [];
        this.showMedEditor = [];
        this.showCodeEditorPhar = [];

        this.lignes.clear();
        this.phar.clear();

        this.formBuletinSoin.patchValue({
          dat_saisie: new Date().toLocaleDateString().substring(0, 10),
          nat_bult: 'M',
          cod_soc: this.token.getUser().codSoc
        });

        this.addLigne();
        this.addLignePhar();
        this.activeTabIndex = 0;
      }
    });
    this.addLigne();
    this.addLignePhar();
  }


  ngOnInit() {
    this.getPersonnel()
    this.getPersCons()
    this.getBultSoin()
    this.saveService.registerSaveCallback(() => this.addBultSoin());
    this.formBuletinSoin.valueChanges.subscribe(() => {
      this.saveService.setDisabled(!this.isDisabled);
    });
    this.saveService.isSearch$
      .pipe(takeUntil(this.destroy$))
      .subscribe((canSearch) => {
        this.isSearch = canSearch
        console.log("is search valid", canSearch)
      })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.saveService.clearSaveCallback();
  }

  addBultSoin() {
    const formatDates = (form: FormGroup, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value);
        form.get(field)?.setValue(value);
        if (value) {
          formatted.push(value);
        }
        return formatted;
      }, []);

    //  FIX: Calculate totals BEFORE saving
    this.calculateTotals();
    this.calculateTotalsPhar();

    //  FIX: Update form with calculated totals
    const totalHonor = (this.totalHonoraires || 0) + (this.totalHonorairesPhar || 0);
    const totalNet = (this.totalNet || 0) + (this.totalNetPhar || 0);

    this.formBuletinSoin.patchValue({
      tot_honor: totalHonor,
      tot_net: totalNet
    });

    console.log('Totals before save:', { tot_honor: totalHonor, tot_net: totalNet });
    console.log(this.formBuletinSoin.value);
    this.serv.addBultSoin(this.formBuletinSoin.value).subscribe((data: any) => {
      const ligBult = this.ligPretForm.get('lignes') as FormArray;
      const ligPhar = this.ligPharForm.get('phar') as FormArray;

      // Loop through each FormGroup in the FormArray
      ligBult.controls.forEach((formGroup: AbstractControl) => {
        if (formGroup instanceof FormGroup) {
          formatDates(formGroup, [
            'dat_act',

          ]);
          formGroup.get('mat_pers')?.patchValue(this.formBuletinSoin.get('mat_pers')?.value);
          formGroup.get('num_fam')?.patchValue(this.formBuletinSoin.get('num_fam')?.value);
          formGroup.get('dat_soin')?.patchValue(this.formBuletinSoin.get('dat_soin')?.value);
          const da = formGroup.get('dat_act')?.value;
          const ds = formGroup.get('dat_soin')?.value;
          if (this.isBeforeDate(da, ds)) {
            formGroup.get('dat_act')?.setValue(ds);
            this.showMessage('warn', 'La date acte ne doit pas être inférieure à la date de soin');
          }


        }
      });
      ligPhar.controls.forEach((formGroup: AbstractControl) => {
        if (formGroup instanceof FormGroup) {
          formatDates(formGroup, [
            'dat_act',

          ]);
          formGroup.get('mat_pers')?.patchValue(this.formBuletinSoin.get('mat_pers')?.value);
          formGroup.get('num_fam')?.patchValue(this.formBuletinSoin.get('num_fam')?.value);
          formGroup.get('dat_soin')?.patchValue(this.formBuletinSoin.get('dat_soin')?.value);
          const da = formGroup.get('dat_act')?.value;
          const ds = formGroup.get('dat_soin')?.value;
          if (this.isBeforeDate(da, ds)) {
            formGroup.get('dat_act')?.setValue(ds);
            this.showMessage('warn', 'La date médicament ne doit pas être inférieure à la date de soin');
          }


        }
      });

      console.log("ligPret", this.ligPretForm.value.lignes);
      console.log("ligPhar", this.ligPharForm.value.phar);

      // Helper function to remove uniqueId from objects
      const removeUniqueId = (items: any[]) => {
        return items.map(item => {
          const { uniqueId, ...rest } = item;
          return rest;
        });
      };

      if (this.ligPretForm.valid) {
        // Remove uniqueId before sending to backend
        const cleanedLignes = removeUniqueId(this.ligPretForm.value.lignes);
        this.serv.addLigBult(cleanedLignes).subscribe((data: any) => {
          Swal.fire({
            title: 'Message',
            text: "Ajout avec succés",
            icon: 'success',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });
          console.log("Ok");
        });
      } else {
        Swal.fire({
          title: 'Message',
          text: "Veuillez vérifier date acte ou Acte",
          icon: 'error',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        });
      }

      if (this.ligPharForm.valid) {
        // Remove uniqueId before sending to backend
        const cleanedPhar = removeUniqueId(this.ligPharForm.value.phar);
        this.serv.addLigPhar(cleanedPhar).subscribe((data: any) => {
          Swal.fire({
            title: 'Message',
            text: "Ajout avec succés",
            icon: 'success',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });
        });
      } else {
        Swal.fire({
          title: 'Message',
          text: "Veuillez vérifier Date med ou Med",
          icon: 'error',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        });
      }
    });
  }
  getPersonnel() {
    this.serv.getPersonnelBultSoin(this.token.getUser().codSoc).subscribe((data: any) => {
      this.listPersonnel = data

      this.columnsMat = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "nom", label: "Nom & Prénom" },
        { key: "num_retr", label: "Id CNRPS" },
        { key: "lib_fill", label: "Filière" },
      ];
    })
  }

  ensureDatActNotAfterSoins(index: number) {
    const fg = this.lignes.at(index) as FormGroup;
    const da = fg.get('dat_act')?.value;
    const ds = this.formBuletinSoin.get('dat_soin')?.value;
    if (this.isBeforeDate(da, ds)) {
      fg.get('dat_act')?.setValue(ds);
      this.showMessage('warn', 'La date acte ne doit pas être inférieure à la date de soin');
    }
  }

  ensureDatActNotAfterSoinsPhar(index: number) {
    const fg = this.phar.at(index) as FormGroup;
    const da = fg.get('dat_act')?.value;
    const ds = this.formBuletinSoin.get('dat_soin')?.value;
    if (this.isBeforeDate(da, ds)) {
      fg.get('dat_act')?.setValue(ds);
      this.showMessage('warn', 'La date médicament ne doit pas être inférieure à la date de soin');
    }
  }

  private toComparableDate(str: any): number | null {
    if (!str || typeof str !== 'string') return null;
    // dd/mm/yyyy
    let m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return Number(`${m[3]}${m[2]}${m[1]}`);
    // yyyy-mm-dd
    m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return Number(`${m[1]}${m[2]}${m[3]}`);
    // ddmmyyyy
    m = str.match(/^(\d{2})(\d{2})(\d{4})$/);
    if (m) return Number(`${m[3]}${m[2]}${m[1]}`);
    return null;
  }

  private isAfterDate(a: any, b: any): boolean {
    const na = this.toComparableDate(a);
    const nb = this.toComparableDate(b);
    if (na == null || nb == null) return false;
    return na > nb;
  }
  private isBeforeDate(a: any, b: any): boolean {
    const na = this.toComparableDate(a);
    const nb = this.toComparableDate(b);
    if (na == null || nb == null) return false;
    return na < nb;
  }


  getPersCons() {
    this.serv.getPersCons(this.token.getUser().codSoc).subscribe((data: any) => {
      this.listPerCons = data

      this.columnsPerCons = [
        { key: "matricule", label: "Matricule" },
        { key: "nom", label: "Nom & Prénom" },
        { key: "num_fam", label: "Num fam" },

      ];
    })
  }

  OnselectRefTyp(event: any) {
    if (event?.originalEvent && typeof event.originalEvent.stopPropagation === 'function') {
      event.originalEvent.stopPropagation();
    }
    const selectedValue = event?.value !== undefined ? event.value : event?.target?.value;
    console.log('Selected type:', selectedValue);
    if (!selectedValue) { this.listRefEtablis = []; return; }

    this.serv.getRefPhysique(selectedValue).subscribe((data: any) => {
      this.listRefEtablis = data

      this.columnsRefEtablis = [
        { key: "prf_cod", label: "Code" },
        { key: "etab_rsoc", label: "Nom & Prénom" },
        { key: "met_etab", label: "Etablis" },

      ];
    })
  }

  onSelectedPersConj(item: any) {
    this.nomPersCons = item.nom
    this.formBuletinSoin.patchValue({
      mat_pers_conj: item.matricule,
      num_ass_conj: item.num_assur
    })
    this.serv.getDatNais(this.token.getUser().codSoc, this.formBuletinSoin.get('mat_pers')?.value, item.num_fam).subscribe((data: any) => {
      this.datNais = data.dat_nais
    })

  }
  onSelectedAdherent(item: any) {
    console.log("onSelectedAdherent :", item)
    this.nomAdherent = item.nom_PREN
    this.formBuletinSoin.patchValue({
      num_fam: item.num_fam
    })
    this.serv.getDatNais(this.token.getUser().codSoc, this.formBuletinSoin.get('mat_pers')?.value, item.num_fam).subscribe((data: any) => {
      this.datNais = data.dat_nais
    })


    this.serv.getSexe(this.token.getUser().codSoc, this.formBuletinSoin.get('mat_pers')?.value, item.num_fam).subscribe((data: any) => {
      this.sexe = data.sexe
      this.parente = data.parente
      this.serv.getActe(this.formBuletinSoin.get('cod_fil')?.value, this.formBuletinSoin.get('cod_assur')?.value, this.parente, this.sexe).subscribe((data: any) => {
        this.listActe = data

        this.columnActe = [
          { key: "abrv_act", label: "Abrv acte" },
          { key: "lib_act", label: "Libelle" },

        ];

      })
    })


  }
  onSelectedVMat(item: any) {
    console.log("item :", item)
    this.numAssur = item.numRetr,
      this.nomPers = item.nom,
      this.codAssur = item.codLieuGeog,
      this.libAssur = item.libLieu,
      this.cod_fil = item.datEmb,
      this.lib_fill = item.lib_fill,
      this.lib_assur = item.lib_assur,
      this.num_retr = item.num_retr
    this.formBuletinSoin.patchValue({
      mat_pers: item.mat_pers,
      cod_fil: item.cod_fil,
      num_assur: item.num_assur,
      cod_assur: item.cod_assur,

    })

    this.serv.getAdherent(this.token.getUser().codSoc, item.mat_pers).subscribe((data: any) => {
      this.listAdherent = data
      console.log("listAdherent :", this.listAdherent)
      this.columnsAdherent = [
        { key: "num_fam", label: "Num fam" },
        { key: "nom_PREN", label: "Nom & Prénom" },

      ];
    })

    this.serv.getMed(item.cod_fil, item.cod_assur).subscribe((data: any) => {
      this.listMed = data
      this.columnsMed = [
        { key: "cod_MED", label: "Code" },
        { key: "lib_MED", label: "Libelle" },

      ];
    })
  }
  onSelectedPEC(item: any) {
    this.etabliss = item.etablis
    this.datPec = item.dat_pec
    this.formBuletinSoin.patchValue({
      num_pec: item.num_pec
    })
  }
  libAct: string[] = []
  onSelectedActe(selectedValue: any, index: number): void {
    console.log('selectedValue', selectedValue);

    // Add null/undefined check
    if (!selectedValue || !selectedValue.abrv_act) {
      console.warn('Invalid acte selection');
      return;
    }

    // Check if this abrv_act already exists in another line
    const existingIndex = this.lignes.controls.findIndex((control, i) => {
      if (i === index) return false; // Skip the current line being edited
      return control.get('abrv_act')?.value === selectedValue.abrv_act;
    });

    if (existingIndex !== -1) {
      Swal.fire({
        title: 'Acte déjà existant',
        text: `L'acte "${selectedValue.abrv_act}" existe déjà à la ligne ${existingIndex + 1}. Vous ne pouvez pas ajouter le même acte deux fois dans le même bulletin.`,
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
      // Clear the selection
      this.lignes.at(index).patchValue({ abrv_act: '' });
      this.libAct[index] = '';
      return;
    }

    const selectedActe = this.listActe.find(acte => acte.abrv_act === selectedValue.abrv_act);

    if (selectedActe) {
      this.libAct[index] = selectedActe.lib_act;
      this.lignes.at(index).patchValue({ abrv_act: selectedValue.abrv_act });
    }
  }


  libMed: string[] = []
  onSelectedMed(selectedValue: any, index: number): void {
    console.log('selectedValue', selectedValue);

    // Add null/undefined check
    if (!selectedValue || !selectedValue.cod_MED) {
      console.warn('Invalid med selection');
      return;
    }

    const selectedMed = this.listMed.find(med => med.cod_MED === selectedValue.cod_MED);

    if (selectedMed) {
      this.libMed[index] = selectedMed.lib_MED;
      this.phar.at(index).patchValue({
        cod_med: selectedValue.cod_MED,
        abrv_act: selectedValue.abrv_ACT
      });
    }
  }
  etab_rsoc: string[] = []
  onSelectedEtablis(selectedValue: any, index: number): void {
    // Add null/undefined check
    if (!selectedValue || !selectedValue.prf_cod) {
      console.warn('Invalid etablissement selection');
      return;
    }

    const selectedActe = this.listRefEtablis.find(etablis => etablis.prf_cod === selectedValue.prf_cod);

    if (selectedActe) {
      this.etab_rsoc[index] = selectedActe.etab_rsoc;
      this.lignes.at(index).patchValue({ prf_cod: selectedValue.prf_cod });
      console.log('etab_rsoc', this.etab_rsoc);
    }
  }
  etab_rsoc_phar: string[] = []
  onSelectedEtablisPhar(selectedValue: any, index: number): void {
    // Add null/undefined check
    if (!selectedValue || !selectedValue.prf_cod) {
      console.warn('Invalid etablissement phar selection');
      return;
    }

    const selectedActe = this.listRefEtablisPhar.find(etablis => etablis.prf_cod === selectedValue.prf_cod);

    if (selectedActe) {
      this.etab_rsoc_phar[index] = selectedActe.etab_rsoc;
      this.phar.at(index).patchValue({ prf_cod: selectedValue.prf_cod });
    }
  }


  controleDatSoin(item: any) {
    const formatDates = (form: any, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value); // Assuming formatDate returns a string or null
        form.get(field)?.setValue(value);
        formatted.push(value); // Push value into the string[] array
        return formatted;
      }, []);

    const formBuletinSoin = formatDates(this.formBuletinSoin, [
      "dat_soin",

    ]);
    console.log(this.formBuletinSoin.get('dat_soin')?.value)
    this.serv.get_duree_bulletin(item.target.value, this.formBuletinSoin.get('cod_assur')?.value).subscribe((data: any) => {
      console.log("data :", data)
      if (data.reponse) {
        Swal.fire({
          title: 'Message',
          text: data.reponse,
          icon: data.reponse.includes('probléme') ? 'error' : 'info',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        });

        item.target.value = '';
      }
    })

    this.serv.get_plafond_mutuelle(this.token.getUser().codSoc, this.formBuletinSoin.get('mat_pers')?.value, item.target.value, this.datNais,
      this.formBuletinSoin.get('dat_saisie')?.value).subscribe((data: any) => {

        if (data.message) {
          Swal.fire({
            title: 'Message',
            text: data.message,
            icon: 'error',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });

          item.target.value = '';
        }
        this.ageAn = data.ageAn;
        this.ageMois = data.ageMois
        this.soldPlafond = Number(data.soldPlafond).toFixed(3)
        this.soldPlafondEstim = Number(data.soldPlafondEstim).toFixed(3)

      })
    // Enforce all line dates <= dat_soin after header change
    const ds = this.formBuletinSoin.get('dat_soin')?.value;
    this.lignes.controls.forEach((_, idx) => this.ensureDatActNotAfterSoins(idx));
    this.phar.controls.forEach((_, idx) => this.ensureDatActNotAfterSoinsPhar(idx));
  }
  controleNumSoin(event: any) {
    this.serv.getNbreBult(this.formBuletinSoin.get('cod_assur')?.value, event.target.value).subscribe((data: any) => {
      console.log("data :", data)
      if (data != 0) {
        Swal.fire({
          title: 'Message',
          text: "Numéro de soin existe déja Vérifier S.V.P",
          icon: 'error',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        });

        event.target.value = '';
      }
      this.serv.getListEtablisPec(this.token.getUser().codSoc, this.formBuletinSoin.get('mat_pers')?.value, this.formBuletinSoin.get('num_fam')?.value,
        this.formBuletinSoin.get('dat_soin')?.value).subscribe((data: any) => {
          this.listPEC = data

          this.columnsPEC = [
            { key: "num_pec", label: "Num pec" },
            { key: "etablis", label: "etablissement" },

          ];
        })
    })
  }
  getBultSoin() {
    this.serv.getBultSoin().subscribe((data: any) => {
      this.listBultSoin = data
      this.columnsBultSoin = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "num_fam", label: "Num fam" },
        { key: "dat_soin", label: "Date soin" },
      ]
    })
  }
  search(item: any) {

    console.log('item.num_fam :', item.num_fam)
    this.matricule = item.mat_pers
    this.PEC = item.num_pec
    this.matConj = item.mat_pers_conj
    this.serv.getAdherent(this.token.getUser().codSoc, item.mat_pers).subscribe((data: any) => {
      this.listAdherent = data
      this.numFam = item.num_fam

    })

    this.formBuletinSoin.patchValue({
      cod_soc: item.cod_soc,
      mat_pers: item.mat_pers,
      num_fam: item.num_fam,
      dat_soin: item.dat_soin,
      cod_bord: item.cod_bord,
      cod_assur: item.cod_assur,
      num_soin: item.num_soin,
      ord_bult: item.ord_bult,
      tot_honor: item.tot_honor,
      tot_net: item.tot_net,
      tot_remb: item.tot_remb,
      reg_remb: item.reg_remb,
      cod_malad: item.cod_malad,
      num_pec: item.num_pec,
      cod_fil: item.cod_fil,
      num_assur: item.num_assur,
      dat_prev_accouch: item.dat_prev_accouch,
      nat_bult: item.nat_bult,
      mat_pers_conj: item.mat_pers_conj,
      num_ass_conj: item.num_ass_conj,
      dat_saisie: item.dat_saisie,
      obs: item.obs,
      obs_a: item.obs_a,
      envoi: item.envoi,
      ann_plaf_imp: item.ann_plaf_imp,
      reg_adh: item.reg_adh,
      mod_pay: item.mod_pay,
      dat_vir: item.dat_vir,

    })

    this.serv.getAllActe().subscribe((acte: any) => {
      this.listActe = acte
      this.serv.getLigBult(item.cod_soc, item.mat_pers, item.num_fam, item.dat_soin).subscribe((data: any) => {
        this.loadDataIntoTable(data)
        console.log("data lig bult :", data)



      });
    })
    this.serv.getLigPhar(item.cod_soc, item.mat_pers, item.num_fam, item.dat_soin).subscribe((data: any) => {
      this.loadDataIntoTablePhar(data)
    })
    this.serv.get_plafond_mutuelle(this.token.getUser().codSoc, item.mat_pers, item.dat_soin, this.datNais,
      item.dat_saisie).subscribe((data: any) => {

        this.ageAn = data.ageAn;
        this.ageMois = data.ageMois
        this.soldPlafond = Number(data.soldPlafond).toFixed(3)
        this.soldPlafondEstim = Number(data.soldPlafondEstim).toFixed(3)

      })

  }
  loadDataIntoTable(data: any[]) {
    // Clear arrays before loading
    this.acte = [];
    this.libAct = [];
    this.etab_rsoc = [];
    this.refEtablis = [];

    const observables = data.map((item: any) =>
      this.serv.getRefPhysique(item.prf_typ).pipe(
        map((refData: any) => ({ item, refData }))
      )
    );

    forkJoin(observables).subscribe((results: { item: any; refData: any }[]) => {
      if (results.length > 0) {
        this.listRefEtablis = results[0].refData || [];
        this.columnsRefEtablis = [
          { key: "prf_cod", label: "Code" },
          { key: "etab_rsoc", label: "Nom & Prénom" },
          { key: "met_etab", label: "Etablis" },
        ];

        // Initialize arrays with proper values
        this.refEtablis = results.map(({ item }) => item.prf_cod || '');
        this.acte = results.map(({ item }) => item.abrv_act || '');

        // Map libAct with proper null checks
        this.libAct = results.map(({ item }) => {
          const match = this.listActe.find(a => a.abrv_act === item.abrv_act);
          return match ? match.lib_act : '';
        });

        // Map etab_rsoc with proper null checks
        this.etab_rsoc = results.map(({ item, refData }) => {
          if (!refData || !Array.isArray(refData)) return '';
          const match = refData.find((r: any) => r.prf_cod === item.prf_cod);
          return match ? match.etab_rsoc : '';
        });
      }

      this.ligPretForm.setControl(
        'lignes',
        this.fb.array(
          results.map(({ item }) => this.fb.group({
            dat_act: [item.dat_act],
            abrv_act: [item.abrv_act],
            indice: [item.indice],
            mnt_honor: [Number(item.mnt_honor).toFixed(3)],
            mnt_net: [Number(item.mnt_net).toFixed(3)],
            nbr_piece: [item.nbr_piece],
            nbr_vign: [item.nbr_vign],
            prf_typ: [item.prf_typ],
            prf_cod: [item.prf_cod],
            obs: [item.obs],
            cod_soc: [item.cod_soc],
            mat_pers: [item.mat_pers],
            num_fam: [item.num_fam],
            dat_soin: [item.dat_soin],
            num_lig: [item.num_lig],
            uniqueId: [Date.now() + Math.random()], // Add unique ID for selection
            mnt_remb: [item.mnt_remb],
            obs_a: [item.obs_a],
            nat_act: [item.nat_act],
            mtt_acte: [item.mtt_acte],
            taux_act: [item.taux_act],
            plafonne: [item.plafonne],
            plafond: [item.plafond],
            a_indice: [item.a_indice],
            ctr_duree: [item.ctr_duree],
            duree_act: [item.duree_act],
            imput_plaf: [item.imput_plaf],
          }))
        )
      );
      this.calculateTotals();
    });
  }

  loadDataIntoTablePhar(data: any[]) {
    // Clear arrays before loading
    this.Med = [];
    this.libMed = [];
    this.etab_rsoc_phar = [];
    this.refEtablisPhar = [];

    const observables = data.map((item: any) =>
      this.serv.getRefPhysique(item.prf_typ).pipe(
        map((refData: any) => ({ item, refData }))
      )
    );

    forkJoin(observables).subscribe((results: { item: any; refData: any }[]) => {
      if (results.length > 0) {
        this.listRefEtablisPhar = results[0].refData || [];
        this.columnsRefEtablisPhar = [
          { key: "prf_cod", label: "Code" },
          { key: "etab_rsoc", label: "Nom & Prénom" },
          { key: "met_etab", label: "Etablis" },
        ];

        this.refEtablisPhar = results.map(({ item }) => item.prf_cod || '');
        this.Med = results.map(({ item }) => item.cod_med || '');

        this.libMed = results.map(({ item }) => {
          const match = this.listMed.find(m => m.cod_MED === item.cod_med);
          return match ? match.lib_MED : '';
        });

        this.etab_rsoc_phar = results.map(({ item, refData }) => {
          if (!refData || !Array.isArray(refData)) return '';
          const match = refData.find((r: any) => r.prf_cod === item.prf_cod);
          return match ? match.etab_rsoc : '';
        });
      }

      this.ligPharForm.setControl(
        'phar',
        this.fb.array(
          results.map(({ item }) => this.fb.group({
            cod_soc: [this.token.getUser()?.codSoc || ''],
            mat_pers: [item.mat_pers],
            num_fam: [item.num_fam],
            dat_soin: [item.dat_soin],
            cod_med: [item.cod_med],
            num_lig: [item.num_lig],
            uniqueId: [Date.now() + Math.random()], // Add unique ID for selection
            indice: [item.indice],
            dat_act: [item.dat_act],
            prf_typ: [item.prf_typ],
            prf_cod: [item.prf_cod],
            mnt_honor: [Number(item.mnt_honor || 0).toFixed(3)],
            mnt_net: [Number(item.mnt_net || 0).toFixed(3)],
            mnt_remb: [item.mnt_remb],
            mdc_prix: [item.mdc_prix],
            med_prix: [item.med_prix],
            prix_remb: [item.prix_remb],
            obs: [item.obs],
            obs_a: [item.obs_a],
            nbr_piece: [item.nbr_piece],
            nbr_vign: [item.nbr_vign],
            abrv_act: [item.abrv_act],
          }))
        )
      );
      this.calculateTotalsPhar();
    });
  }

  formatDate(dateString: any): string {
    if (!dateString) {
      return dateString;
    }

    // Vérifier si la date est au format ddmmyyyy (ex: 25072024)
    if (dateString.length === 8 && /^\d{8}$/.test(dateString)) {
      const day = dateString.substring(0, 2);
      const month = dateString.substring(2, 4);
      const year = dateString.substring(4, 8);
      return `${day}/${month}/${year}`;
    }

    // Vérifier si la date est au format yyyy-mm-dd (ex: 2024-07-25)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    }

    // Retourner tel quel si aucun format reconnu
    return dateString;
  }


  mntNetArray: number[] = []; // Declare an array to store the amounts for each line
formatDateddmmyyyyy(date: any): string | null {
  if (!date) {
    return null;
  }

  // If already a string dd/MM/yyyy → return as is
  if (typeof date === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    return date;
  }

  const d = new Date(date);

  // Check invalid date
  if (isNaN(d.getTime())) {
    console.error('Invalid date value:', date);
    return null;
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}


  calcul_mnt_net(event: any, index: number) {
    const ligBult = this.ligPretForm.get('lignes') as FormArray;
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

    // Handle null or empty indice - convert to 0 or valid number
    const indice = ligBult.value[index].indice || 0;

    this.serv.calculer_montant_net(
      this.formBuletinSoin.get("cod_soc")?.value,
      this.formBuletinSoin.get("mat_pers")?.value,
      this.formBuletinSoin.get("cod_fil")?.value,
      this.formBuletinSoin.get("cod_assur")?.value,
      ligBult.value[index].abrv_act,
      this.formatDateddmmyyyyy(this.formBuletinSoin.get("dat_soin")?.value),
      event.target.value,
      indice
    ).subscribe((data: any) => {
      this.mntNet = data.p_mnt_net

      this.mntNetArray[index] = data.p_mnt_net;
      this.lignes.at(index).patchValue({ mnt_net: this.mntNetArray[index] });
      this.calculateTotals();
      console.log(this.mntNetArray)
    })
  }
  mntNetArrayPhar: number[] = [];
  calcul_mnt_netPhar(event: any, index: number) {
    const ligPhar = this.ligPharForm.get('phar') as FormArray;
    console.log("ligBult :", ligPhar)

    // Handle null or empty indice - convert to 0 or valid number
    const indice = ligPhar.value[index].indice || 0;

    this.serv.calculer_montant_net(
      this.formBuletinSoin.get("cod_soc")?.value,
      this.formBuletinSoin.get("mat_pers")?.value,
      this.formBuletinSoin.get("cod_fil")?.value,
      this.formBuletinSoin.get("cod_assur")?.value,
      ligPhar.value[index].abrv_act,
      this.formBuletinSoin.get("dat_soin")?.value,
      event.target.value,
      indice
    ).subscribe((data: any) => {
      this.mntNetPhar = data.p_mnt_net

      this.mntNetArrayPhar[index] = data.p_mnt_net;
      this.phar.at(index).patchValue({ mnt_net: this.mntNetArrayPhar[index] });
      this.calculateTotalsPhar();
      console.log(this.mntNetArray)
    })
  }
  get lignes(): FormArray {
    return this.ligPretForm.get('lignes') as FormArray;
  }

  // Création d'une ligne avec les champs nécessaires
  createLigne(): FormGroup {
    return this.fb.group({
      cod_soc: [this.token.getUser().codSoc],
      mat_pers: [''],
      num_fam: [''],
      dat_soin: ['', Validators.required],
      abrv_act: ['', Validators.required],
      num_lig: [this.lignes.length + 1],
      uniqueId: [Date.now() + Math.random()], // Add unique ID for selection
      prf_typ: [''],
      prf_cod: [''],
      dat_act: [''],
      indice: [''],
      mnt_honor: [''],
      mnt_net: [''],
      mnt_remb: [''],
      obs: [''],
      obs_a: [''],
      nbr_piece: [''],
      nbr_vign: [''],
      nat_act: [''],
      mtt_acte: [''],
      taux_act: [''],
      plafonne: [''],
      plafond: [''],
      a_indice: [''],
      ctr_duree: [''],
      duree_act: [''],
      imput_plaf: [''],
    });

  }
  get phar(): FormArray {
    return this.ligPharForm.get('phar') as FormArray;
  }

  // Création d'une ligne avec les champs nécessaires
  createLignePhar(): FormGroup {
    return this.fb.group({
      cod_soc: [this.token.getUser().codSoc],
      mat_pers: [''],
      num_fam: [''],
      dat_soin: ['', Validators.required],
      cod_med: ['', Validators.required],
      num_lig: [this.phar.length + 1],
      uniqueId: [Date.now() + Math.random()], // Add unique ID for selection
      indice: [''],
      dat_act: [''],
      prf_typ: [''],
      prf_cod: [''],
      mnt_honor: [''],
      mnt_net: [''],
      mnt_remb: [''],
      mdc_prix: [''],
      med_prix: [''],
      prix_remb: [''],
      obs: [''],
      obs_a: [''],
      nbr_piece: [''],
      nbr_vign: [''],
      abrv_act: [''],

    });

  }
  // Ajouter une ligne
  addLigne(): void {
    const newLigne = this.createLigne();
    this.lignes.push(newLigne);
    this.showActeEditor.push(false);
    this.showCodeEditor.push(false);

    // Auto-select the newly added row
    this.selectedActes = [newLigne];

    this.calculateTotals(); // Met à jour les totaux

    // Use a small delay to ensure the row is rendered in the DOM
    setTimeout(() => {
      this.startEditingNewRowActes(newLigne);
    }, 50);
  }

  private startEditingNewRowActes(row: any) {
    // Force change detection to ensure template is updated
    this.cdr.detectChanges();

    try {
      // Start editing the row using PrimeNG Table's initRowEdit
      this.tableActes?.initRowEdit(row);

      // One more change detection to ensure edit mode is active
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 50);
    } catch (error) {
      console.error('Error starting edit mode for Actes:', error);
      // Retry once if failed
      setTimeout(() => {
        this.tableActes?.initRowEdit(row);
        this.cdr.detectChanges();
      }, 100);
    }
  }

  removeLigne(index: number): void {
    this.lignes.removeAt(index);
    this.calculateTotals(); // Met à jour les totaux



  }
  addLignePhar(): void {
    const newLigne = this.createLignePhar();
    this.phar.push(newLigne);
    this.showMedEditor.push(false);
    this.showCodeEditorPhar.push(false);

    // Auto-select the newly added row
    this.selectedPhar = [newLigne];

    this.calculateTotalsPhar();

    // Use a small delay to ensure the row is rendered in the DOM
    setTimeout(() => {
      this.startEditingNewRowPhar(newLigne);
    }, 50);
  }

  private startEditingNewRowPhar(row: any) {
    // Force change detection to ensure template is updated
    this.cdr.detectChanges();

    try {
      // Start editing the row using PrimeNG Table's initRowEdit
      this.tablePhar?.initRowEdit(row);

      // One more change detection to ensure edit mode is active
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 50);
    } catch (error) {
      console.error('Error starting edit mode for Pharmacies:', error);
      // Retry once if failed
      setTimeout(() => {
        this.tablePhar?.initRowEdit(row);
        this.cdr.detectChanges();
      }, 100);
    }
  }

  removeLignePhar(index: number): void {
    this.phar.removeAt(index);
    this.calculateTotalsPhar()
  }
  // Soumettre le formulaire
  onSubmit(): void {
    this.lignes.controls.forEach((control: AbstractControl) => {
      const group = control as FormGroup; // Assurer que c'est bien un FormGroup
      const dateControl = group.get('dat_act');

      if (dateControl) {
        const formattedDate = this.formatDate(dateControl.value);
        dateControl.patchValue(formattedDate, { emitEvent: false }); // Mise à jour sans événement
      }
    });
    if (this.ligPretForm.valid) {
      console.log(this.ligPretForm.value);
      this.serv.addLigBult(this.ligPretForm.value.lignes).subscribe((data: any) => {
        console.log("Ok")
      })
    }
  }

  // Ajout d’une ligne en appuyant sur "Enter"
  onEnterPress(index: number, event: KeyboardEvent): void {
    if (event.key === 'Enter' && index === this.lignes.length - 1) {
      this.addLigne();
    }
  }

  copyLastLigne(): void {
    if (this.lignes.length > 0) {
      const lastLigne = this.lignes.at(this.lignes.length - 1).value;
      this.lignes.push(this.fb.group({ ...lastLigne })); // Clone la ligne
    }
  }

  totalHonoraires: number = 0;
  totalNet: number = 0;

  calculateTotals() {
    console.log("this.totalHonoraires ", this.totalHonoraires)
    this.totalHonoraires = this.lignes.controls.reduce((sum, ligne) => {
      console.log("this.totalHonoraires ", this.totalHonoraires)

      const honor = parseFloat((ligne.get('mnt_honor')?.value || '0')) || 0;
      return sum + honor;
    }, 0);

    this.totalNet = this.lignes.controls.reduce((sum, ligne) => {
      const net = parseFloat((ligne.get('mnt_net')?.value || '0')) || 0;
      return sum + net;
    }, 0);
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
      const net = parseFloat((ligne.get('mnt_net')?.value || '0')) || 0;
      return sum + net;
    }, 0);
  }

  // FIX 1: verif_indice - Extract string value, not object
  verif_indice(item: any, index: any) {
    const ligBult = this.ligPretForm.get('lignes') as FormArray;
    const ligne = ligBult.at(index);

    // Get the actual string value, not the object
    const abrv_act = ligne.get('abrv_act')?.value;
    const cod_fil = this.formBuletinSoin.get('cod_fil')?.value;
    const cod_assur = this.formBuletinSoin.get('cod_assur')?.value;
    const indice = ligne.get('indice')?.value;

    if (!abrv_act || !cod_fil || !cod_assur) {
      console.warn('Missing required fields for verif_indice');
      return;
    }

    console.log('verif_indice params:', { abrv_act, cod_fil, cod_assur, indice });

    this.serv.verif_indice(
      abrv_act,      // String, not object
      cod_fil,
      cod_assur,
      indice
    ).subscribe({
      next: (data: any) => {
        console.log('verif_indice response:', data);
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
      },
      error: (error) => {
        console.error('verif_indice error:', error);
      }
    });
  }

  // FIX 2: verif_vign - Pass correct values and types
  verif_vign(item: any, index: any) {
    const ligBult = this.ligPretForm.get('lignes') as FormArray;
    const ligne = ligBult.at(index);

    // Get actual values from form controls
    const abrv_act = ligne.get('abrv_act')?.value;
    const cod_fil = this.formBuletinSoin.get('cod_fil')?.value;
    const cod_assur = this.formBuletinSoin.get('cod_assur')?.value;
    const mnt_honor = ligne.get('mnt_honor')?.value;
    const nbr_vign = ligne.get('nbr_vign')?.value;

    if (!abrv_act || !cod_fil || !cod_assur || !mnt_honor) {
      console.warn('Missing required fields for verif_vign');
      return;
    }

    // Convert to proper types
    const mntHonorNumber = parseFloat(mnt_honor) || 0;
    const nbrVignString = nbr_vign ? nbr_vign.toString() : '0';

    console.log('verif_vign params:', {
      abrv_act,
      cod_fil,
      cod_assur,
      mntHonorNumber,
      nbrVignString
    });

    this.serv.verif_vign(
      abrv_act,           // String
      cod_fil,            // String
      cod_assur,          // String
      mntHonorNumber,     // Number (BigDecimal)
      nbrVignString       // String
    ).subscribe({
      next: (data: any) => {
        console.log('verif_vign response:', data);
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
      },
      error: (error) => {
        console.error('verif_vign error:', error);
      }
    });
  }

  // FIX 3: verif_piece - Pass correct values and types
  verif_piece(item: any, index: any) {
    const ligBult = this.ligPretForm.get('lignes') as FormArray;
    const ligne = ligBult.at(index);

    // Get actual values from form controls
    const abrv_act = ligne.get('abrv_act')?.value;
    const cod_fil = this.formBuletinSoin.get('cod_fil')?.value;
    const cod_assur = this.formBuletinSoin.get('cod_assur')?.value;
    const mnt_honor = ligne.get('mnt_honor')?.value;
    const nbr_piece = ligne.get('nbr_piece')?.value;

    if (!abrv_act || !cod_fil || !cod_assur || !mnt_honor) {
      console.warn('Missing required fields for verif_piece');
      return;
    }

    // Convert to proper types
    const mntHonorNumber = parseFloat(mnt_honor) || 0;
    const nbrPieceString = nbr_piece ? nbr_piece.toString() : '0';

    console.log('verif_piece params:', {
      abrv_act,
      cod_fil,
      cod_assur,
      mntHonorNumber,
      nbrPieceString
    });

    this.serv.verif_piece(
      abrv_act,           // String
      cod_fil,            // String
      cod_assur,          // String
      mntHonorNumber,     // Number (BigDecimal)
      nbrPieceString      // String
    ).subscribe({
      next: (data: any) => {
        console.log('verif_piece response:', data);
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
      },
      error: (error) => {
        console.error('verif_piece error:', error);
      }
    });
  }



  // FIX 4: verif_indice_phar - Same fixes for pharmacy
  verif_indice_phar(item: any, index: any) {
    const ligPhar = this.ligPharForm.get('phar') as FormArray;
    const ligne = ligPhar.at(index);

    const abrv_act = ligne.get('abrv_act')?.value;
    const cod_fil = this.formBuletinSoin.get('cod_fil')?.value;
    const cod_assur = this.formBuletinSoin.get('cod_assur')?.value;
    const indice = ligne.get('indice')?.value;

    if (!abrv_act || !cod_fil || !cod_assur) {
      console.warn('Missing required fields for verif_indice_phar');
      return;
    }

    this.serv.verif_indice(
      abrv_act,
      cod_fil,
      cod_assur,
      indice
    ).subscribe({
      next: (data: any) => {
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
      },
      error: (error) => {
        console.error('verif_indice_phar error:', error);
      }
    });
  }

  // FIX 5: verif_vign_pahr - Same fixes for pharmacy
  verif_vign_pahr(item: any, index: any) {
    const ligPhar = this.ligPharForm.get('phar') as FormArray;
    const ligne = ligPhar.at(index);

    const abrv_act = ligne.get('abrv_act')?.value;
    const cod_fil = this.formBuletinSoin.get('cod_fil')?.value;
    const cod_assur = this.formBuletinSoin.get('cod_assur')?.value;
    const mnt_honor = ligne.get('mnt_honor')?.value;
    const nbr_vign = ligne.get('nbr_vign')?.value;

    if (!abrv_act || !cod_fil || !cod_assur || !mnt_honor) {
      console.warn('Missing required fields for verif_vign_pahr');
      return;
    }

    const mntHonorNumber = parseFloat(mnt_honor) || 0;
    const nbrVignString = nbr_vign ? nbr_vign.toString() : '0';

    this.serv.verif_vign(
      abrv_act,
      cod_fil,
      cod_assur,
      mntHonorNumber,
      nbrVignString
    ).subscribe({
      next: (data: any) => {
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
      },
      error: (error) => {
        console.error('verif_vign_pahr error:', error);
      }
    });
  }

  // FIX 6: verif_piece_pahr - Same fixes for pharmacy
  verif_piece_pahr(item: any, index: any) {
    const ligPhar = this.ligPharForm.get('phar') as FormArray;
    const ligne = ligPhar.at(index);

    const abrv_act = ligne.get('abrv_act')?.value;
    const cod_fil = this.formBuletinSoin.get('cod_fil')?.value;
    const cod_assur = this.formBuletinSoin.get('cod_assur')?.value;
    const mnt_honor = ligne.get('mnt_honor')?.value;
    const nbr_piece = ligne.get('nbr_piece')?.value;

    if (!abrv_act || !cod_fil || !cod_assur || !mnt_honor) {
      console.warn('Missing required fields for verif_piece_pahr');
      return;
    }

    const mntHonorNumber = parseFloat(mnt_honor) || 0;
    const nbrPieceString = nbr_piece ? nbr_piece.toString() : '0';

    this.serv.verif_piece(
      abrv_act,
      cod_fil,
      cod_assur,
      mntHonorNumber,
      nbrPieceString
    ).subscribe({
      next: (data: any) => {
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
      },
      error: (error) => {
        console.error('verif_piece_pahr error:', error);
      }
    });
  }

  selectedIndex: number | null = null;
  confirm(index: any, content: any, id: any) {
    this.selectedIndex = index
    console.log("annee:", id);
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDelete(index: number): void {
    const ligne = this.lignes.at(index).value; // Récupérer les données de la ligne

    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
      abrv_act: ligne.abrv_act
    };

    console.log("Clé à vérifier :", cle);

    this.serv.existeLigBult(cle).subscribe({
      next: (exists: boolean) => {
        console.log("Enregistrement existant :", exists);

        if (exists) {
          // Si l'enregistrement existe, on appelle le service de suppression
          this.serv.deleteLigBult(
            ligne.cod_soc,
            ligne.mat_pers,
            ligne.num_fam,
            ligne.dat_soin,
            ligne.abrv_act,
            ligne.num_lig
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
          this.lignes.removeAt(index);
          this.calculateTotals();
        }
      },
      error: (error) => {
        console.error("Erreur lors de la vérification d'existence :", error);
        //alert("Une erreur est survenue lors de la vérification. Veuillez réessayer.");
      }
    });
  }


  selectedIndexPhar: number | null = null;
  confirmPhar(index: any, content: any, id: any) {
    this.selectedIndexPhar = index
    console.log("annee:", id);
    //this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  ConfirmDeletePhar(index: number): void {
    const phar = this.phar.at(index).value; // Récupérer les données de la ligne

    const cle = {
      cod_soc: phar.cod_soc,
      mat_pers: phar.mat_pers,
      num_fam: phar.num_fam,
      dat_soin: phar.dat_soin,
      cod_med: phar.cod_med,
      num_lig: phar.num_lig

    };

    console.log("Clé à vérifier :", cle);

    this.serv.existeLigPhar(cle).subscribe({
      next: (exists: boolean) => {
        console.log("Enregistrement existant :", exists);

        if (exists) {
          // Si l'enregistrement existe, on appelle le service de suppression
          this.serv.deleteLigPhar(
            phar.cod_soc,
            phar.mat_pers,
            phar.num_fam,
            phar.dat_soin,
            phar.cod_med,
            phar.num_lig
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
        //  alert("Une erreur est survenue lors de la vérification. Veuillez réessayer.");
      }
    });
  }

  // ==================== PRIMENG TABLE HELPER METHODS ====================

  // Show toast message
  showMessage(severity: string, detail: string) {
    this.messageService.add({ severity, summary: severity === 'success' ? 'Succès' : severity === 'error' ? 'Erreur' : 'Info', detail, life: 3000 });
  }

  // Selection change handler
  onSelectionChangeActes(event: any) {
    console.log('Selected Actes:', this.selectedActes);
  }

  onSelectionChangePhar(event: any) {
    console.log('Selected Phar:', this.selectedPhar);
  }

  // Row editing methods for Actes table
  startRowEditActes(rowData: any, index: number) {
    if (this.currentEditingRowActes && this.currentEditingRowActes !== rowData) {
      this.tableActes?.cancelRowEdit(this.currentEditingRowActes);
    }
    this.tableActes?.initRowEdit(rowData);
    this.currentEditingRowActes = rowData;
    this.editingActesIndex = index;
    this.cdr.detectChanges();
  }

  closeRowEditActes(rowData: any) {
    this.tableActes?.cancelRowEdit(rowData);
    if (this.currentEditingRowActes === rowData) {
      this.currentEditingRowActes = null;
    }
    this.editingActesIndex = null;
    this.cdr.detectChanges();
  }

  // Row editing methods for Phar table
  startRowEditPhar(rowData: any, index: number) {
    if (this.currentEditingRowPhar && this.currentEditingRowPhar !== rowData) {
      this.tablePhar?.cancelRowEdit(this.currentEditingRowPhar);
    }
    this.tablePhar?.initRowEdit(rowData);
    this.currentEditingRowPhar = rowData;
    this.editingPharIndex = index;
    this.cdr.detectChanges();
  }

  onTabChange(event: any) {
    this.activeTabIndex = event.index ?? 0;
  }

  closeRowEditPhar(rowData: any) {
    this.tablePhar?.cancelRowEdit(rowData);
    if (this.currentEditingRowPhar === rowData) {
      this.currentEditingRowPhar = null;
    }
    this.editingPharIndex = null;
    this.cdr.detectChanges();
  }

  // Get current date in DD/MM/YYYY format
  getCurrentDate(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  }
}


