import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, AbstractControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { BulletinSoinService } from '../bulletin-soin.service';
import { forkJoin, map, tap } from 'rxjs';

@Component({
  selector: 'app-cons-buletin-mutuelle',
  templateUrl: './cons-buletin-mutuelle.component.html',
  styleUrl: './cons-buletin-mutuelle.component.scss'
})
export class ConsBuletinMutuelleComponent {
  formBuletinSoin!: FormGroup
  ligPretForm!: FormGroup
  ligPharForm!: FormGroup

  pSusp: number = 1
  columnsMat: any[] = []
  breadCrumbItems!: Array<{}>;

  columnsAdherent: any[] = []
  columnsPEC: any[] = []
  columnsPerCons: any[] = []
  columnsBultSoin: any[] = []
  columnActe: any[] = []
  columnsRefEtablis: any[] = []
  columnsMed: any[] = []
  columnsRefEtablisMed: any[] = []

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
  listRefEtablisMed: any[] = []

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
  soldPlafondEstim: string = ''
  sexe: string = ''
  parente: string = ''
  acte: string[] = []
  Med: string[] = []
  mntNet: string = ''
  mntNetPhar: string = ''
  refEtablis: string[] = []
  refEtablisPhar: string[] = []
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
  constructor(private token: TokenStorageService, private serv: BulletinSoinService, private fb: FormBuilder, private saveService: SaveService, private modalService: NgbModal,
    public service: PaginationService) {
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
        this.ligPretForm.reset(); // Reset the form
        this.ligPharForm.reset(); // Reset the form
        this.formBuletinSoin.reset(); // Reset the form
        this.matricule = ''
        this.numFam = ''
        this.nomPers = ''
        this.lib_assur = ''
        this.lib_fill = ''
        this.nomAdherent = ''
        this.datNais = ''
        this.ageAn = ''
        this.ageMois = ''
        this.PEC = ''
        this.etabliss = ''
        this.datPec = ''
        this.matConj = ''
        this.nomPersCons = ''
        this.soldPlafond = ''
        this.soldPlafondEstim = ''
        this.acte = []
        this.libAct = []
        this.refEtablis = []
        this.etab_rsoc = []
        this.Med = []
        this.libMed = []
        this.lignes.clear()
        this.phar.clear()
        this.formBuletinSoin.patchValue({
          dat_saisie: new Date().toLocaleDateString().substring(0, 10),
          nat_bult: 'M',
          cod_soc: this.token.getUser().codSoc
        })
        this.addLigne();
        this.addLignePhar();
      }
    });
    this.addLigne();
    this.addLignePhar();
  }


  ngOnInit() {
    this.getPersonnel()
    this.getPersCons()
    this.getBultSoin()

    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch = canSearch
      console.log("is search valid", canSearch)

    })

    this.columnsBultSoin = [
      { key: "cod_bord", label: "Code bord" },

      { key: "mat_pers", label: "Matricule" },
      { key: "num_fam", label: "Num fam" },
      { key: "dat_soin", label: "Date soin" },
    ]
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

    console.log(this.formBuletinSoin.value)
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


        }
      });
      console.log("ligPret", this.ligPretForm.value.lignes)
      console.log("ligPhar", this.ligPharForm.value.phar)

      if (this.ligPretForm.valid) {
        this.serv.addLigBult(this.ligPretForm.value.lignes).subscribe((data: any) => {
          Swal.fire({
            title: 'Message',
            text: "Ajout avec succés",
            icon: 'success',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });
          console.log("Ok")
        })
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
        this.serv.addLigPhar(this.ligPharForm.value.phar).subscribe((data: any) => {
          Swal.fire({
            title: 'Message',
            text: "Ajout avec succés",
            icon: 'success',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });
        })
      } else {
        Swal.fire({
          title: 'Message',
          text: "Veuillez vérifier Date med ou Med",
          icon: 'error',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        });
      }
    })
  }
  getPersonnel() {
    this.serv.getPersonnelBultSoin(this.token.getUser().codSoc).subscribe((data: any) => {
      this.listPersonnel = data

      this.columnsMat = [
        { key: "num_retr", label: "Id CNRPS" },
        { key: "mat_pers", label: "Matricule" },
        { key: "nom", label: "Nom & Prénom" },

      ];
    })
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
    this.serv.getRefPhysique(event.target.value).subscribe((data: any) => {
      this.listRefEtablis = data

      this.columnsRefEtablis = [
        { key: "prf_cod", label: "Code" },
        { key: "etab_rsoc", label: "Nom & Prénom" },
        { key: "met_etab", label: "Etablis" },

      ];
    })
  }
  OnselectRefTypMed(event: any) {
    this.serv.getRefPhysique(event.target.value).subscribe((data: any) => {
      this.listRefEtablisMed = data

      this.columnsRefEtablisMed = [
        { key: "prf_cod", label: "Code" },
        { key: "etab_rsoc", label: "Nom & Prénom" },
        { key: "met_etab", label: "Etablis" },

      ];
    })
  }
  // onSelectedActe(item:any){
  //   this.for
  // }
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
    this.nomAdherent = item.nom_pren
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
      this.columnsAdherent = [
        { key: "num_fam", label: "Num fam" },
        { key: "nom_pren", label: "Nom & Prénom" },

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

    const selectedActe = this.listActe.find(acte => acte.abrv_act === selectedValue.abrv_act);
    this.libAct[index] = selectedActe.lib_act
    this.lignes.at(index).patchValue({ abrv_act: selectedValue.abrv_act });
  }

  libMed: string[] = []
  onSelectedMed(selectedValue: any, index: number): void {
    console.log('selectedValue', selectedValue);

    const selectedMed = this.listMed.find(acte => acte.cod_MED === selectedValue.cod_MED);
    this.libMed[index] = selectedMed.lib_MED
    this.phar.at(index).patchValue({
      cod_med: selectedValue.cod_MED,
      abrv_act: selectedValue.abrv_ACT
    });
  }
  etab_rsoc: string[] = []
  onSelectedEtablis(selectedValue: any, index: number): void {
    console.log('selectedValue', selectedValue);

    const selectedActe = this.listRefEtablis.find(etablis => etablis.etab_rsoc === selectedValue.etab_rsoc);
    this.etab_rsoc[index] = selectedActe.etab_rsoc
    this.lignes.at(index).patchValue({ prf_cod: selectedValue.prf_cod });
  }
  etab_rsoc_phar: string[] = []
  onSelectedEtablisPhar(selectedValue: any, index: number): void {
    console.log('selectedValue', selectedValue);

    const selectedActe = this.listRefEtablis.find(etablis => etablis.etab_rsoc === selectedValue.etab_rsoc);
    this.etab_rsoc_phar[index] = selectedActe.etab_rsoc
    this.phar.at(index).patchValue({ prf_cod: selectedValue.prf_cod });
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
    this.serv.getBultMut('01').subscribe((data: any) => {
      this.listBultSoin = Array.isArray(data) ? data : [];
      console.log("listBultSoin :", data)
      this.columnsBultSoin = [
        { key: "cod_bord", label: "Code bord" },
        { key: "mat_pers", label: "Matricule" },
        { key: "num_fam", label: "Num fam" },
        { key: "dat_soin", label: "Date soin" },
      ]
    })
  }
  search(item: any) {
    console.log('item.num_fam :', item);
    this.matricule = item.mat_pers;
    this.PEC = item.num_pec;
    this.matConj = item.mat_pers_conj;

    this.serv.getAdherent(this.token.getUser().codSoc, item.mat_pers).subscribe((data: any) => {
      this.listAdherent = data;
      this.numFam = item.num_fam;
    });

    this.nomPers = item.nom_complet_pers;
    this.lib_assur = item.lib_assur;
    this.lib_fill = item.lib_fill;
    this.nomAdherent = item.nom_adherent;

    this.serv.getDatNais(this.token.getUser().codSoc, item.mat_pers, item.num_fam).subscribe((data: any) => {
      this.datNais = data.dat_nais;
    });

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
    });

    // Load all reference data first, then load table data
    forkJoin({
      actes: this.serv.getAllActe(),
      meds: this.serv.getMed(item.cod_fil, item.cod_assur),
      ligBult: this.serv.getLigBult(item.cod_soc, item.mat_pers, item.num_fam, item.dat_soin),
      ligPhar: this.serv.getLigPhar(item.cod_soc, item.mat_pers, item.num_fam, item.dat_soin)
    }).subscribe(({ actes, meds, ligBult, ligPhar }) => {
      // Set the lists first
      this.listActe = actes;
      this.listMed = meds;

      console.log('listActe loaded:', this.listActe);
      console.log('listMed loaded:', this.listMed);

      // Now load the tables with the lists available
      this.loadDataIntoTable(ligBult);
      this.loadDataIntoTablePhar(ligPhar);
    });

    this.serv.get_plafond_mutuelle(
      this.token.getUser().codSoc,
      item.mat_pers,
      item.dat_soin,
      this.datNais,
      item.dat_saisie
    ).subscribe((data: any) => {
      this.ageAn = data.ageAn;
      this.ageMois = data.ageMois;
      this.soldPlafond = Number(data.soldPlafond).toFixed(3);
      this.soldPlafondEstim = Number(data.soldPlafondEstim).toFixed(3);
    });
  }

  loadDataIntoTable(data: any[]) {
    this.acte = [];
    this.libAct = [];
    this.etab_rsoc = [];
    this.refEtablis = [];

    console.log("=== loadDataIntoTable START ===");
    console.log("data acte:", data);
    console.log("listActe available:", this.listActe);

    if (!data || data.length === 0) {
      console.log("No data to load");
      return;
    }

    const observables = data.map((item: any) =>
      this.serv.getRefPhysiqueByCode(item.prf_cod, item.prf_typ).pipe(
        map((refData: any) => {
          // Ensure refData is always an array
          const normalizedRefData = Array.isArray(refData) ? refData : (refData ? [refData] : []);
          return { item, refData: normalizedRefData };
        })
      )
    );

    forkJoin(observables).subscribe((results: any) => {
      console.log("forkJoin results:", results);

      if (results.length > 0) {
        this.listRefEtablis = results[0].refData || [];
        this.columnsRefEtablis = [
          { key: "prf_cod", label: "Code" },
          { key: "etab_rsoc", label: "Nom & Prénom" },
          { key: "met_etab", label: "Etablis" },
        ];

        this.refEtablis = results.map(({ item }: any) => item.prf_cod || '');
        this.acte = results.map(({ item }: any) => item.abrv_act || '');

        console.log("acte codes:", this.acte);

        // Map libAct properly
        this.libAct = results.map(({ item }: any) => {
          console.log(`Looking for acte: ${item.abrv_act} in listActe`);
          const ref = this.listActe?.find((a: any) => a.abrv_act === item.abrv_act);
          console.log("Found ref:", ref);
          const libelle = ref?.lib_act || item.lib_act || '';
          console.log("Libelle:", libelle);
          return libelle;
        });

        console.log("libAct array:", this.libAct);

        // Map etab_rsoc with proper null checks
        this.etab_rsoc = results.map(({ item, refData }: any) => {
          console.log(`Looking for etablissement prf_cod: ${item.prf_cod}`);
          console.log("refData:", refData);
          console.log("lib_etablis from item:", item.lib_etablis);

          // If no prf_cod, use lib_etablis from item
          if (!item.prf_cod) {
            return item.lib_etablis || '';
          }

          // refData is now guaranteed to be an array (could be empty)
          if (!refData || refData.length === 0) {
            console.log("Using fallback lib_etablis:", item.lib_etablis);
            return item.lib_etablis || '';
          }

          const match = refData.find((r: any) => r.prf_cod === item.prf_cod);
          console.log("Found match:", match);

          const etablissement = match?.etab_rsoc || match?.met_etab || item.lib_etablis || '';
          console.log("Final etablissement:", etablissement);
          return etablissement;
        });

        console.log("etab_rsoc array:", this.etab_rsoc);
      }

      this.ligPretForm.setControl(
        'lignes',
        this.fb.array(
          results.map(({ item }: any) => this.fb.group({
            dat_act: [item.dat_act],
            abrv_act: [item.abrv_act],
            lib_act: [item.lib_act],
            indice: [item.indice],
            mnt_honor: [Number(item.mnt_honor).toFixed(3)],
            mnt_net: [Number(item.mnt_net).toFixed(3)],
            nbr_piece: [item.nbr_piece],
            nbr_vign: [item.nbr_vign],
            prf_typ: [item.prf_typ],
            prf_cod: [item.prf_cod],
            lib_etablis: [item.lib_etablis],
            obs: [item.obs],
            cod_soc: [item.cod_soc],
            mat_pers: [item.mat_pers],
            num_fam: [item.num_fam],
            dat_soin: [item.dat_soin],
            num_lig: [item.num_lig],
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
      console.log("=== loadDataIntoTable END ===");
    });
  }
  loadDataIntoTablePhar(data: any) {
    this.Med = [];
    this.libMed = [];
    this.refEtablisPhar = [];
    this.etab_rsoc_phar = [];

    if (!data || data.length === 0) {
      console.log("Aucune donnée à charger.");
      this.ligPharForm.reset();
      return;
    }

    const observables = data.map((item: any) =>
      this.serv.getRefPhysiqueByCode(item.prf_cod, item.prf_typ).pipe(
        map((refData: any) => {
          // Ensure refData is always an array
          const normalizedRefData = Array.isArray(refData) ? refData : (refData ? [refData] : []);
          return { item, refData: normalizedRefData };
        })
      )
    );

    forkJoin(observables).subscribe((results: any) => {
      if (results.length > 0) {
        this.listRefEtablisMed = results[0].refData || [];
        this.columnsRefEtablisMed = [
          { key: "prf_cod", label: "Code" },
          { key: "etab_rsoc", label: "Nom & Prénom" },
          { key: "met_etab", label: "Établissement" },
        ];

        this.refEtablisPhar = results.map(({ item }: any) => item.prf_cod || '');
        this.Med = results.map(({ item }: any) => item.cod_med || '');

        // Map libMed properly
        this.libMed = results.map(({ item }: any) => {
          const ref = this.listMed?.find((m: any) => m.cod_MED === item.cod_med);
          return ref?.lib_MED || item.lib_med || '';
        });

        // Map etab_rsoc_phar with proper null checks
        this.etab_rsoc_phar = results.map(({ item, refData }: any) => {
          // If no prf_cod, use lib_etablis from item
          if (!item.prf_cod) {
            return item.lib_etablis || '';
          }

          // refData is now guaranteed to be an array (could be empty)
          if (!refData || refData.length === 0) {
            return item.lib_etablis || '';
          }

          const match = refData.find((r: any) => r.prf_cod === item.prf_cod);
          return match?.etab_rsoc || match?.met_etab || item.lib_etablis || '';
        });
      }

      this.ligPharForm.setControl(
        "phar",
        this.fb.array(
          results.map(({ item }: any) =>
            this.fb.group({
              cod_soc: [this.token.getUser().codSoc],
              mat_pers: [item.mat_pers],
              num_fam: [item.num_fam],
              dat_soin: [item.dat_soin],
              cod_med: [item.cod_med],
              num_lig: [item.num_lig],
              indice: [item.indice],
              dat_act: [item.dat_act],
              prf_typ: [item.prf_typ],
              prf_cod: [item.prf_cod],
              lib_etablis: [item.lib_etablis],
              mnt_honor: [Number(item.mnt_honor).toFixed(3)],
              mnt_net: [Number(item.mnt_net).toFixed(3)],
              mnt_remb: [item.mnt_remb],
              mdc_prix: [item.mdc_prix],
              med_prix: [item.med_prix],
              prix_remb: [item.prix_remb],
              obs: [item.obs],
              obs_a: [item.obs_a],
              nbr_piece: [item.nbr_piece],
              nbr_vign: [item.nbr_vign],
              abrv_act: [item.abrv_act],
            })
          )
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
    this.serv.calculer_montant_net(this.formBuletinSoin.get("cod_soc")?.value, this.formBuletinSoin.get("mat_pers")?.value, this.formBuletinSoin.get("cod_fil")?.value,
      this.formBuletinSoin.get("cod_assur")?.value, ligBult.value[index].abrv_act, this.formBuletinSoin.get("dat_soin")?.value, event.target.value, ligBult.value[index].indice).subscribe((data: any) => {
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
    this.serv.calculer_montant_net(this.formBuletinSoin.get("cod_soc")?.value, this.formBuletinSoin.get("mat_pers")?.value, this.formBuletinSoin.get("cod_fil")?.value,
      this.formBuletinSoin.get("cod_assur")?.value, ligPhar.value[index].abrv_act, this.formBuletinSoin.get("dat_soin")?.value, event.target.value, ligPhar.value[index].indice).subscribe((data: any) => {
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
      prf_typ: [''],
      prf_cod: [''],
      dat_act: [''],
      indice: [''],
      mnt_honor: [0],
      mnt_net: [0],
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
    this.lignes.push(this.createLigne());
    this.calculateTotals(); // Met à jour les totaux

  }

  removeLigne(index: number): void {
    this.lignes.removeAt(index);
    this.calculateTotals(); // Met à jour les totaux



  }
  addLignePhar(): void {
    this.phar.push(this.createLignePhar());
    this.calculateTotalsPhar()
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
    this.totalHonoraires = this.lignes.controls.reduce((sum, ligne) => {
      const honor = parseFloat((ligne.get('mnt_honor')?.value || '0').replace(',', '.')) || 0;
      return sum + honor;
    }, 0);

    this.totalNet = this.lignes.controls.reduce((sum, ligne) => {
      const net = parseFloat((ligne.get('mnt_net')?.value || '0').replace(',', '.')) || 0;
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

  verif_indice(item: any, index: any) {
    const ligBult = this.ligPretForm.get('lignes') as FormArray;
    this.serv.verif_indice(ligBult.value[index].abrv_act, this.formBuletinSoin.get('cod_fil')?.value, this.formBuletinSoin.get('cod_assur')?.value, ligBult.value[index].abrv_act.indice).
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

  verif_vign(item: any, index: any) {

    const ligBult = this.ligPretForm.get('lignes') as FormArray;

    console.log("ligBult :", ligBult)
    this.serv.verif_vign(ligBult.value[index].abrv_act, this.formBuletinSoin.get('cod_fil')?.value, this.formBuletinSoin.get('cod_assur')?.value, ligBult.value[index].mnt_honor, ligBult.value[index].abrv_act.nbr_vign).
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

  verif_piece(item: any, index: any) {
    const ligBult = this.ligPretForm.get('lignes') as FormArray;
    console.log("ligBult :", ligBult)
    this.serv.verif_piece(ligBult.value[index].abrv_act, this.formBuletinSoin.get('cod_fil')?.value, this.formBuletinSoin.get('cod_assur')?.value, ligBult.value[index].abrv_act.mnt_honor, ligBult.value[index].abrv_act.nbr_piece).
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



  verif_indice_phar(item: any, index: any) {
    const ligPhar = this.ligPharForm.get('phar') as FormArray;
    this.serv.verif_indice(ligPhar.value[index].abrv_act, this.formBuletinSoin.get('cod_fil')?.value, this.formBuletinSoin.get('cod_assur')?.value, ligPhar.value[index].abrv_act.indice).
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
    this.serv.verif_vign(ligPhar.value[index].abrv_act, this.formBuletinSoin.get('cod_fil')?.value, this.formBuletinSoin.get('cod_assur')?.value, ligPhar.value[index].mnt_honor, ligPhar.value[index].abrv_act.nbr_vign).
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
    this.serv.verif_piece(ligPhar.value[index].abrv_act, this.formBuletinSoin.get('cod_fil')?.value, this.formBuletinSoin.get('cod_assur')?.value, ligPhar.value[index].abrv_act.mnt_honor, ligPhar.value[index].abrv_act.nbr_piece).
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
}



