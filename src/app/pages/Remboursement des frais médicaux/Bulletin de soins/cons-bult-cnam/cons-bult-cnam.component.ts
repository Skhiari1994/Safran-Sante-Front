import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, AbstractControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaginationService } from 'ngx-pagination';
import { map, forkJoin, tap } from 'rxjs';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { CarteCnamAlertService } from '../../../Adherent/carte-cnam-alert.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { BulletinSoinService } from '../bulletin-soin.service';

@Component({
  selector: 'app-cons-bult-cnam',
  templateUrl: './cons-bult-cnam.component.html',
  styleUrl: './cons-bult-cnam.component.scss'
})
export class ConsBultCnamComponent {
  formBuletinSoin!: FormGroup
  ligPretForm!: FormGroup
  ligPharForm!: FormGroup
  ligVisiteForm!: FormGroup
  ligAppareilForm!: FormGroup
  breadCrumbItems!: Array<{}>;
  listPersonnel: any[] = []
  listAdherent: any[] = []
  listBultSoin: any[] = []
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
  soldPlafond: string = ''
  soldPlafondEstim: string = ''
  sexe: string = ''
  parente: string = ''
  PEC: string = ''
  etabliss: string = ''
  datPec: string = ''
  acte: string[] = []
  visiteCode: string[] = []
  appareilCode: string[] = []
  Med: string[] = []
  refEtablisVisit: string[] = []
  refEtablis: string[] = []
  refEtablisPhar: string[] = []
  refEtablisApp: string[] = []
  mntNet: number = 0
  mntNetPhar: string = ''
  deleteId: any;
  isDisabled!: boolean;
  isSearch: boolean = true;


  reponseVerifModRemb: any
  showMsgMalad!: boolean
  showMsgDatAccouch!: boolean
  showMsgPriseCharge!: boolean

  constructor(private token: TokenStorageService, private serv: BulletinSoinService, private fb: FormBuilder, private saveService: SaveService, private modalService: NgbModal,
    public service: PaginationService, private carteCnamAlert: CarteCnamAlertService) {
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
      nat_bult: ['C'],
      mat_pers_conj: [''],
      num_ass_conj: [''],
      dat_saisie: [''],
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
    this.ligVisiteForm = this.fb.group({
      visite: this.fb.array([]) // Tableau dynamique des détails
    });
    this.ligAppareilForm = this.fb.group({
      appareil: this.fb.array([]) // Tableau dynamique des détails
    });

    this.addLigne(0);
    this.addLignePhar(0);
    this.addLigneVisite()
    this.addLigneAppareil(0)
  }
  ngOnInit() {
    this.getPersonnel()
    this.getRegimeRemb()
    this.getBultSoin();
    this.calculerTotaux()
    //this.getBultSoin()
    this.calculerTotaux();

    this.columnsBultSoin = [
      { key: "mat_pers", label: "Matricule" },
      { key: "num_fam", label: "Num fam" },
      { key: "dat_soin", label: "Date soin" },
    ];

  }
  checkBultSoinService() {
    console.log('Checking getBultCnam service...');

    this.serv.getBultCnam(this.token.getUser().codSoc).subscribe(
      (data: any) => {
        console.log('getBultCnam returned:', data);
        console.log('Data type:', typeof data);
        console.log('Is array:', Array.isArray(data));
        console.log('Length:', data?.length);
      },
      error => {
        console.error('getBultCnam error:', error);
      }
    );

    console.log('Checking getPersonnelBultSoin service...');

    this.serv.getPersonnelBultSoin(this.token.getUser().codSoc).subscribe(
      (data: any) => {
        console.log('getPersonnelBultSoin returned:', data);
        console.log('Data type:', typeof data);
        console.log('Is array:', Array.isArray(data));
        console.log('Length:', data?.length);
      },
      error => {
        console.error('getPersonnelBultSoin error:', error);
      }
    );
  }

  addBultSoin() {
    // Vérifier si le formulaire principal est valide
    if (!this.formBuletinSoin.valid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulaire invalide',
        text: 'Veuillez remplir correctement le formulaire principal avant de continuer.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const formArrays = [
      this.ligVisiteForm.get('visite') as FormArray,
      this.ligPharForm.get('phar') as FormArray,
      this.ligPretForm.get('lignes') as FormArray,
      this.ligAppareilForm.get('appareil') as FormArray
    ];

    // Vérifier si au moins un FormArray contient AU MOINS UN champ valide
    const hasValidData = formArrays.some(array =>
      array.controls.length > 0 && array.controls.some(control => control.valid)
    );



    // Fonction pour formater les dates
    const formatDates = (form: FormGroup, fields: string[]): void => {
      fields.forEach(field => {
        const value = this.formatDate(form.get(field)?.value);
        form.get(field)?.setValue(value);
      });
    };

    // Appliquer le formatage et mettre à jour les champs des FormArray
    formArrays.forEach(array => {
      array.controls.forEach((formGroup: AbstractControl) => {
        if (formGroup instanceof FormGroup) {
          formatDates(formGroup, ['dat_act']);
          formGroup.patchValue({
            mat_pers: this.formBuletinSoin.get('mat_pers')?.value,
            num_fam: this.formBuletinSoin.get('num_fam')?.value,
            dat_soin: this.formBuletinSoin.get('dat_soin')?.value
          });
        }
      });
    });

    // Appel du service pour ajouter le bulletin de soin
    this.serv.addBultSoin(this.formBuletinSoin.value).subscribe(
      (data: any) => {
        // Filtrer uniquement les valeurs valides des FormArrays
        const validArrays = formArrays.map(array =>
          array.controls.filter(control => control.valid).map(control => control.value)
        );
        console.log("visite : ,act :,med : ,app : ", validArrays)
        this.serv.addAllLigBult(validArrays[0], validArrays[2], validArrays[1], validArrays[3]).subscribe(
          response => {
            const errors = [];
            if (response.visit?.error) errors.push(`Visit: ${response.visit.message}`);
            if (response.act?.error) errors.push(`Act: ${response.act.message}`);
            if (response.med?.error) errors.push(`Med: ${response.med.message}`);
            if (response.app?.error) errors.push(`App: ${response.app.message}`);

            if (errors.length > 0) {
              Swal.fire({
                icon: 'error',
                title: 'Erreur lors de l\'ajout',
                html: errors.join('<br>'),
                confirmButtonText: 'OK'
              });
            } else {
              Swal.fire({
                icon: 'success',
                title: 'Ajout réussi',
                text: 'Tous les services valides ont été ajoutés avec succès !',
                confirmButtonText: 'OK'
              });
            }
          },
          error => this.showServerError()
        );
      },
      error => this.showServerError()
    );
  }



  // Fonction pour afficher une erreur en cas d'échec de l'appel API
  private showServerError() {
    Swal.fire({
      icon: 'error',
      title: 'Erreur serveur',
      text: 'Une erreur inattendue est survenue lors de l\'ajout.',
      confirmButtonText: 'OK'
    });
  }
  getBultSoin() {
    this.serv.getBultCnamCons(this.token.getUser().codSoc).subscribe(
      (data: any) => {
        this.listBultSoin = Array.isArray(data) ? data : [];
        this.columnsBultSoin = [
          { key: "cod_bord", label: "Code bord" },

          { key: "mat_pers", label: "Matricule" },
          { key: "num_fam", label: "Num fam" },
          { key: "dat_soin", label: "Date soin" },

        ];
      },
      error => {
        console.error('Error loading bulletin records:', error);
        this.listBultSoin = [];
      }
    );
  }
  getBultSoinRecords() {
    this.serv.getBultCnam(this.token.getUser().codSoc).subscribe(
      (data: any) => {
        console.log('Bulletin data:', data); // Check what's being returned

        if (!data || data.length === 0) {
          console.warn('No bulletin records found');
          // Fall back to personnel list if no bulletins exist
          this.getBultSoin();
          return;
        }

        this.listBultSoin = Array.isArray(data) ? data : [];

        this.columnsBultSoin = [
          { key: "mat_pers", label: "Matricule" },
          { key: "num_fam", label: "Num fam" },
          { key: "dat_soin", label: "Date soin" },
        ];
      },
      error => {
        console.error('Error loading bulletin records:', error);
        // Fall back to personnel list on error
        this.getBultSoin();
      }
    );
  }

  search(item: any) {
    console.log('item.num_fam :', item);
    this.matricule = item.mat_pers;
    this.PEC = item.num_pec;
    this.carteCnamAlert.verifierExpirationMatricule(item.mat_pers, this.token.getUser().codSoc, item.nom_adherent || item.nom_complet_pers);

    this.serv.getAdherent(this.token.getUser().codSoc, item.mat_pers).subscribe((data: any) => {
      this.listAdherent = data;
      this.numFam = item.num_fam;
    });

    this.nomPers = item.nom_complet_pers;
    this.nomAdherent = item.nom_adherent;
    this.lib_assur = item.lib_assur;
    this.lib_fill = item.lib_fill;

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

    this.serv.getMeds(item.cod_fil, item.cod_assur).subscribe((medData: any) => {
      this.listMed = medData;
      this.columnsMed = [
        { key: "cod_med", label: "Code" },
        { key: "lib_med", label: "Libelle" },
        { key: "med_prix", label: "Mdc Prix" },
      ];

      this.serv.getLigBultMed(item.cod_soc, item.mat_pers, item.num_fam, item.dat_soin).subscribe((data: any) => {
        this.loadDataIntoTableMed(data);
        this.calculateTotalsPhar();
      });
    });

    this.serv.getActes(this.parente, this.sexe, item.cod_fil, item.num_assur).subscribe((acteList: any) => {
      this.listActe = acteList;
      this.columnActe = [
        { key: "abrv_act", label: "Abrv acte" },
        { key: "lib_act", label: "Libelle" },
      ];

      this.serv.getLigBultAct(item.cod_soc, item.mat_pers, item.num_fam, item.dat_soin).subscribe((data: any) => {
        this.loadDataIntoTable(data);
      });
    });

    this.serv.getSexe(this.token.getUser().codSoc, item.mat_pers, item.num_fam).subscribe((sx: any) => {
      this.sexe = sx.sexe;
      this.parente = sx.parente;
      this.serv.getVisite(this.parente, this.sexe, item.cod_fil, item.cod_assur).subscribe((visList: any) => {
        this.listVisite = visList;
        this.columnVisite = [
          { key: "cod_Visit", label: "Abrv acte" },
          { key: "lib_Visit", label: "Libelle" },
        ];

        this.serv.getLigBultVisit(item.cod_soc, item.mat_pers, item.num_fam, item.dat_soin).subscribe((data: any) => {
          this.loadDataIntoTableVisite(data);
          this.calculateTotalsVisite();
        });
      });
    });

    this.serv.getLigBultApp(item.cod_soc, item.mat_pers, item.num_fam, item.dat_soin).subscribe((data: any) => {
      this.loadDataIntoTablApp(data);
      this.calculateTotalsAppareil();
    });

    this.serv.get_plafond_cnam(this.token.getUser().codSoc, item.mat_pers, item.dat_soin, this.datNais,
      item.cod_assur, item.dat_saisie).subscribe((data: any) => {
        this.ageAn = data.ageAn;
        this.ageMois = data.ageMois;
        this.soldPlafond = Number(data.soldPlafond).toFixed(3);
        this.soldPlafondEstim = Number(data.soldPlafondEstim).toFixed(3);
      });
  }

  loadDataIntoTable(data: any[]) {
    this.acte = [];
    this.libAct = [];
    this.refEtablis = [];
    this.etab_rsoc = [];
    this.mntNetArray = [];

    console.log("=== loadDataIntoTable START ===");
    console.log("data:", data);
    console.log("listActe available:", this.listActe);

    if (!data || data.length === 0) {
      this.ligPretForm.setControl('lignes', this.fb.array([]));
      this.addLigne(0);
      return;
    }

    const observables = data.map((item: any) =>
      this.serv.getRefPhysiqueByCode(item.prf_cod, item.prf_typ).pipe(
        map((refData: any) => {
          const normalizedRefData = Array.isArray(refData) ? refData : (refData ? [refData] : []);
          return { item, refData: normalizedRefData };
        })
      )
    );

    forkJoin<{ item: any; refData: any; }[]>(observables).subscribe((results) => {
      console.log("forkJoin results:", results);

      if (results.length > 0) {
        this.listRefEtablis = results[0].refData || [];
        this.columnsRefEtablis = [
          { key: "prf_cod", label: "Code" },
          { key: "etab_rsoc", label: "Nom & Prénom" },
          { key: "met_etab", label: "Etablis" },
        ];

        // Populate arrays properly
        results.forEach(({ item, refData }) => {
          // Add acte code
          this.acte.push(item.abrv_act);

          // Find and add libelle
          const selectedActe = this.listActe.find(a => a.abrv_act === item.abrv_act);
          this.libAct.push(selectedActe?.lib_act || item.lib_act || '');
          console.log(`Acte: ${item.abrv_act}, Libelle: ${selectedActe?.lib_act || item.lib_act}`);

          // Add reference code
          this.refEtablis.push(item.prf_cod);

          // Find and add etablissement
          if (!item.prf_cod) {
            this.etab_rsoc.push(item.lib_etablis || '');
          } else if (!refData || refData.length === 0) {
            this.etab_rsoc.push(item.lib_etablis || '');
          } else {
            const selectedEtab = refData.find((e: any) => e.prf_cod === item.prf_cod);
            this.etab_rsoc.push(selectedEtab?.etab_rsoc || selectedEtab?.met_etab || item.lib_etablis || '');
          }
          console.log(`Etablissement: ${this.etab_rsoc[this.etab_rsoc.length - 1]}`);

          // Add amount
          this.mntNetArray.push(Number(item.mnt_net));
        });

        console.log("Final libAct array:", this.libAct);
        console.log("Final etab_rsoc array:", this.etab_rsoc);
      }

      this.ligPretForm.setControl(
        'lignes',
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
            accord_act: [item.accord_act],
            mnt_net: [Number(item.mnt_net).toFixed(3)],
            indice: [item.indice],
            dat_act: [item.dat_act],
            prf_typ: [item.prf_typ],
            prf_cod: [item.prf_cod],
            mut_mnt_net: [item.mut_mnt_net],
            num_pec_act: [item.num_pec_act],
            taux_act: [item.taux_act],
            typ_prf: [item.typ_prf],
          }))
        )
      );
      this.calculateTotals();
      console.log("=== loadDataIntoTable END ===");
    });
  }



  loadDataIntoTableVisite(data: any) {
    this.visiteCode = [];
    this.libVisite = [];
    this.refEtablisVisit = [];
    this.etab_rsoc_visite = [];
    console.log("data visite", data)
    const observables = data.map((item: any) =>
      this.serv.getRefPhysiqueByCode(item.prf_cod, item.prf_typ).pipe(
        map((refData: any) => {
          const normalizedRefData = Array.isArray(refData) ? refData : (refData ? [refData] : []);
          return { item, refData: normalizedRefData };
        })
      )
    );

    forkJoin<{ item: any; refData: any; }[]>(observables).subscribe((results) => {
      if (results.length > 0) {
        this.listRefEtablisVisit = results[0].refData || [];
        this.columnsRefEtablisVisit = [
          { key: "prf_cod", label: "Code" },
          { key: "etab_rsoc", label: "Nom & Prénom" },
          { key: "met_etab", label: "Etablis" },
        ];
      }

      results.forEach(({ item, refData }) => {
        const selectedVisite = this.listVisite.find((v: any) => v.cod_Visit === item.cod_visit);
        const libelle = selectedVisite?.lib_Visit || item.lib_Visit || item.lib_visit || item.libelle || '';
        this.libVisite.push(libelle);

        this.visiteCode.push(item.cod_visit);
        this.refEtablisVisit.push(item.prf_cod);

        const selectedEtab = refData.find((e: any) => e.prf_cod === item.prf_cod);
        this.etab_rsoc_visite.push(selectedEtab?.etab_rsoc || selectedEtab?.met_etab || item.lib_etablis || '');
      });
      this.ligVisiteForm.setControl('visite', this.fb.array(data.map((item: any) => this.fb.group({
        cod_soc: [item.cod_soc],
        mat_pers: [item.mat_pers],
        num_fam: [item.num_fam],
        dat_soin: [item.dat_soin],
        abrv_act: [item.abrv_act],
        cod_visit: [item.cod_visit],
        num_lig: [item.num_lig],
        mnt_honor: [Number(item.mnt_honor).toFixed(3)],
        mnt_remb: [Number(item.mnt_remb).toFixed(3)],
        mnt_net: [Number(item.mnt_net).toFixed(3)],
        indice: [item.indice],
        dat_act: [item.dat_act],
        prf_typ: [item.prf_typ],
        prf_cod: [item.prf_cod],
        prix_visit: [item.prix_visit],
        taux_remb: [item.taux_remb],
        mut_mnt_net: [item.mut_mnt_net],
      }))));

      this.calculateTotalsVisite()
    });
  }

  loadDataIntoTableMed(data: any) {
    this.Med = [];
    this.libMed = [];
    this.refEtablisPhar = [];
    this.etab_rsoc_phar = [];
    this.mntNetArrayPhar = [];

    if (!data || data.length === 0) {
      this.ligPharForm.setControl('phar', this.fb.array([]));
      this.addLignePhar(0);
      return;
    }
    const observables = data.map((item: any) =>
      this.serv.getRefPhysique(item.prf_typ).pipe(
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
      data.forEach((item: any) => {
        const selectedMed = this.listMed.find(med => med.cod_med === item.cod_med);
        this.libMed.push(selectedMed?.lib_med || item.lib_med || item.libelle || '');

        const selectedEtab = this.listRefEtablisMed.find(e => e.prf_cod === item.prf_cod);
        this.etab_rsoc_phar.push(selectedEtab?.etab_rsoc || selectedEtab?.met_etab || item.lib_etablis || '');

        this.mntNetArrayPhar.push(Number(item.mnt_net));
      });

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
        mnt_net: [Number(item.mnt_net).toFixed(3)],
        indice: [item.indice],
        dat_act: [item.dat_act],
        prf_typ: [item.prf_typ],
        prf_cod: [item.prf_cod],
        accord_med: [item.accord_med],
        num_pec_med: [item.num_pec_med],
        mdc_prix: [item.mdc_prix],
        med_prix: [item.med_prix],
        prix_remb: [item.prix_remb],
        num_lig_med: [item.num_lig_med],
        mut_mnt_net: [item.mut_mnt_net],
        nbr_j: [item.nbr_j],
      }))));
      this.calculateTotalsPhar()
      console.log("this.ligPharForm :", this.ligPharForm.value);
    });
  }

  loadDataIntoTablApp(data: any) {
    this.appareilCode = [];
    this.libAppareil = [];
    this.refEtablisApp = [];
    this.etab_rsoc_appareil = [];
    this.mntNetArrayAppareil = [];

    if (!data || data.length === 0) {
      this.ligAppareilForm.setControl('appareil', this.fb.array([]));
      this.addLigneAppareil(0);
      return;
    }

    const observables = data.map((item: any) =>
      this.serv.getRefPhysique(item.prf_typ).pipe(
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
      data.forEach((item: any) => {
        const selectedAppareil = this.listAppareil.find(app => app.cod_app === item.cod_app);
        this.libAppareil.push(selectedAppareil?.lib_app || item.lib_app || item.libelle || '');

        const selectedEtab = this.listRefEtablisApp.find(e => e.prf_cod === item.prf_cod);
        this.etab_rsoc_appareil.push(selectedEtab?.etab_rsoc || selectedEtab?.met_etab || item.lib_etablis || '');

        this.mntNetArrayAppareil.push(Number(item.mnt_net));
      });

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
        mnt_net: [Number(item.mnt_net).toFixed(3)],
        indice: [item.indice],
        dat_act: [item.dat_act],
        prf_typ: [item.prf_typ],
        prf_cod: [item.prf_cod],
        accord_app: [item.accord_med],
        num_pec_app: [item.num_pec_app],
        num_lig_app: [item.num_lig_app],
        mut_mnt_net: [item.mut_mnt_net],
      }))));
      this.calculateTotalsAppareil();
      console.log("this.ligAppareilForm :", this.ligAppareilForm.value);
    });
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
      this.serv.getActes(this.sexe, this.parente, this.formBuletinSoin.get('cod_fil')?.value, this.formBuletinSoin.get('cod_assur')?.value).subscribe((data: any) => {
        this.listActe = data

        this.columnActe = [
          { key: "abrv_act", label: "Abrv acte" },
          { key: "lib_act", label: "Libelle" },

        ];

      })

      console.log("this.parente", this.parente)
      console.log("this.sexe", this.sexe)
      this.serv.getVisite(this.parente, this.sexe, this.formBuletinSoin.get('cod_fil')?.value, this.formBuletinSoin.get('cod_assur')?.value).subscribe((data: any) => {
        this.listVisite = data
        console.log("listVisite :", this.listVisite)
        this.columnVisite = [
          { key: "cod_Visit", label: "Abrv acte" },
          { key: "lib_Visit", label: "Libelle" },

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

    this.serv.getMeds(item.cod_fil, item.cod_assur).subscribe((data: any) => {
      this.listMed = data
      this.columnsMed = [
        { key: "cod_med", label: "Code" },
        { key: "lib_med", label: "Libelle" },
        { key: "med_prix", label: "Mdc Prix" },

      ];
    })
    this.serv.getAppareil(item.cod_fil, item.cod_assur).subscribe((data: any) => {
      this.listAppareil = data
      this.columnsAppareil = [
        { key: "cod_app", label: "Code" },
        { key: "lib_app", label: "Libelle" },

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

    this.serv.get_plafond_cnam(this.token.getUser().codSoc, this.formBuletinSoin.get('mat_pers')?.value, item.target.value, this.datNais,
      this.formBuletinSoin.get('cod_assur')?.value, this.formBuletinSoin.get('dat_saisie')?.value).subscribe((data: any) => {

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

    this.serv.getListEtablisPec(this.token.getUser().codSoc, this.formBuletinSoin.get('mat_pers')?.value, this.formBuletinSoin.get('num_fam')?.value,
      this.formBuletinSoin.get('dat_soin')?.value).subscribe((data: any) => {
        this.listPEC = data

        this.columnsPEC = [
          { key: "num_pec", label: "Num pec" },
          { key: "etablis", label: "etablissement" },

        ];
      })

    this.serv.getLigBult(this.formBuletinSoin.get('cod_soc')?.value, this.formBuletinSoin.get('mat_pers')?.value,
      this.formBuletinSoin.get('num_fam')?.value, this.formBuletinSoin.get('dat_soin')?.value).subscribe((data: any) => {
        this.ligBult = data
        this.calculerTotaux()
      })
  }

  getRegimeRemb() {
    this.serv.getRegimeRemb().subscribe((data: any) => {
      this.listRegimeRemb = data
    })
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

  verif_mod_remb(event: any) {
    this.serv.vetif_mod_remb(
      this.token.getUser().codSoc,
      this.formBuletinSoin.get('mat_pers')?.value,
      this.formBuletinSoin.get('num_fam')?.value,
      this.formBuletinSoin.get('dat_soin')?.value,
      event.target.value, this.parente, this.sexe
    ).subscribe((data: any) => {
      this.reponseVerifModRemb = data;
      console.log("this.showMsgMalad :", this.reponseVerifModRemb);
      // Vérification des valeurs retournées
      this.showMsgMalad = data.msg_malad === "true";
      this.showMsgDatAccouch = data.msg_dat_accouch === "true";
      this.showMsgPriseCharge = data.msg_prise_charge === "true";

      console.log("this.showMsgMalad :", this.showMsgMalad);
      console.log("this.showMsgDatAccouch :", this.showMsgDatAccouch);
      console.log("this.showMsgPriseCharge :", this.showMsgPriseCharge);

      if (data.message) {
        Swal.fire({
          title: 'Message',
          text: data.message,
          icon: 'error',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        });
        event.target.value = '';
      }
    });
  }

  // confirm(content: any, id: any) {
  //   console.log("annee:", id);
  //   this.deleteId = id;
  //   this.modalService.open(content, { centered: true });
  // }
  /* Traitement des actes*/

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
      cod_act: [''],
      num_lig: ['1'],
      let_cod: [''],
      cot_act: [''],
      act_prix: [''],
      mnt_honor: [0],
      mnt_remb: [0],
      accord_act: [''],
      mnt_net: [''],
      indice: [''],
      dat_act: [''],
      prf_typ: [''],
      prf_cod: [''],
      mut_mnt_net: [''],
      num_pec_act: [''],
      taux_act: [''],
      typ_prf: [''],

    });

  }

  addLigne(index: any): void {
    this.lignes.push(this.createLigne());
    this.calculateTotals(); // Met à jour les totaux
    this.serv.getNumLigAct(this.formBuletinSoin.get('cod_soc')?.value, this.formBuletinSoin.get('mat_pers')?.value, this.formBuletinSoin.get('num_fam')?.value,
      this.formBuletinSoin.get('dat_soin')?.value).subscribe((data: any) => {
        this.lignes.at(index).patchValue({
          num_lig: data
        })
      })
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
    const ligne = this.lignes.at(index).value; // Récupérer les données de la ligne
    console.log("ligne:", ligne);
    const cle = {
      cod_soc: ligne.cod_soc,
      mat_pers: ligne.mat_pers,
      num_fam: ligne.num_fam,
      dat_soin: ligne.dat_soin,
      abrv_act: ligne.abrv_act,
      cod_act: ligne.cod_act,
      num_lig: ligne.num_lig,
      dat_act: ligne.dat_act
    };

    console.log("Clé à vérifier :", cle);

    this.serv.existeLigBultAct(cle).subscribe({
      next: (exists: boolean) => {
        console.log("Enregistrement existant :", exists);

        if (exists) {
          // Si l'enregistrement existe, on appelle le service de suppression
          this.serv.deleteLigBultAct(
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
  totalHonoraires: number = 0;
  totalNet: number = 0;



  libAct: string[] = []
  selectedAct: any
  onSelectedActe(selectedValue: any, index: number): void {
    this.selectedAct = selectedValue
    const selectedActe = this.listActe.find(acte => acte.abrv_act === selectedValue.abrv_act);
    this.libAct[index] = selectedActe.lib_act
    this.lignes.at(index).patchValue({
      abrv_act: selectedValue.abrv_act,
      cod_act: selectedValue.cod_act
    });



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
    this.serv.calculer_montant_net_act(this.formBuletinSoin.get("cod_soc")?.value, this.formBuletinSoin.get("mat_pers")?.value, ligBult.value[index].cod_act, event.target.value,
      this.formBuletinSoin.get("dat_soin")?.value, this.selectedAct.act_prix, this.selectedAct.taux_act, 0, 0).subscribe((data: any) => {


        this.mntNet = data.p_mnt_net ?? 0; // Assurez-vous que la valeur est 0 si null ou undefined

        this.mntNetArray[index] = this.mntNet === 0 ? 0 : data.p_mnt_net;
        this.lignes.at(index).patchValue({ mnt_net: this.mntNetArray[index] });
        this.calculateTotals();
        console.log(this.mntNetArray)
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
  OnselectRefTypVisite(event: any) {
    this.serv.getRefPhysique(event.target.value).subscribe((data: any) => {
      this.listRefEtablisVisit = data

      this.columnsRefEtablisVisit = [
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


  OnselectRefTypApp(event: any) {
    this.serv.getRefPhysique(event.target.value).subscribe((data: any) => {
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
      const net = parseFloat((ligne.get('mnt_net')?.value || '0')) || 0;
      return sum + net;
    }, 0);
  }

  /*   Traitement des medicaments*/

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
      mnt_net: [''],
      mnt_remb: [''],
      accord_med: [''],
      dat_act: [''],
      prf_typ: [''],
      prf_cod: [''],
      num_pec_med: [''],
      mdc_prix: [''],
      med_prix: [''],
      prix_remb: [''],
      num_lig_med: ['1'],
      mut_mnt_net: [''],
      nbr_j: [''],


    });

  }
  addLignePhar(index: any): void {
    this.phar.push(this.createLignePhar());
    this.calculateTotalsPhar()
    const ligPhar = this.ligPharForm.get('phar') as FormArray;
    this.serv.getNumLigMed(this.formBuletinSoin.get('cod_soc')?.value, this.formBuletinSoin.get('mat_pers')?.value, this.formBuletinSoin.get('num_fam')?.value,
      this.formBuletinSoin.get('dat_soin')?.value, ligPhar.value[index].abrv_act).subscribe((data: any) => {
        this.phar.at(index).patchValue({
          num_lig_med: data
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

    this.serv.existeLigBultMed(cle).subscribe((exists: any) => {
      if (exists) {
        this.serv.deleteLigBultMed(ligne.cod_soc, ligne.mat_pers, ligne.num_fam, ligne.dat_soin, ligne.abrv_act, ligne.num_lig, ligne.cod_med).subscribe(() => {
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
      cod_med: ligne.cod_med,
      num_lig_med: ligne.num_lig_med,
    };

    console.log("Clé à vérifier :", cle);

    this.serv.existeLigBultMed(cle).subscribe({
      next: (exists: boolean) => {
        console.log("Enregistrement existant :", exists);

        if (exists) {
          // Si l'enregistrement existe, on appelle le service de suppression
          this.serv.deleteLigBultMed(
            ligne.cod_soc,
            ligne.mat_pers,
            ligne.num_fam,
            ligne.dat_soin,
            ligne.abrv_act,
            ligne.num_lig_med,
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
    this.serv.calculer_montant_net_med(this.formBuletinSoin.get("cod_soc")?.value, this.formBuletinSoin.get("mat_pers")?.value, ligPhar.value[index].cod_med
      , event.target.value, this.formBuletinSoin.get("dat_soin")?.value, this.selectedMed.prix_remb,
      ligPhar.value[index].indice, 0, 0).subscribe((data: any) => {
        this.mntNetPhar = data.p_mnt_net

        this.mntNetArrayPhar[index] = data.p_mnt_net;
        this.phar.at(index).patchValue({ mnt_net: this.mntNetArrayPhar[index] });
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
      const net = parseFloat((ligne.get('mnt_net')?.value || '0')) || 0;
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
      mnt_net: [''],
      indice: [''],
      dat_act: [''],
      prf_typ: [''],
      prf_cod: [''],
      prix_visit: [''],
      taux_remb: [''],
      mut_mnt_net: [''],



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
      abrv_act: ligne.abrv_act,
      cod_visit: ligne.cod_visit,
      dat_act: ligne.dat_act,
    };

    console.log("Clé à vérifier :", cle);

    this.serv.existeLigBultVisit(cle).subscribe({
      next: (exists: boolean) => {
        console.log("Enregistrement existant :", exists);

        if (exists) {
          // Si l'enregistrement existe, on appelle le service de suppression
          this.serv.deleteLigBultVisit(
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
    this.serv.calculer_montant_net_visit(this.formBuletinSoin.get("cod_soc")?.value, this.formBuletinSoin.get("mat_pers")?.value, ligBult.value[index].cod_visit,
      event.target.value, this.formBuletinSoin.get("dat_soin")?.value, this.selectedVisit.prix_Visit, this.selectedVisit.taux_Remb, '0').subscribe((data: any) => {
        this.mntNet = data.p_mnt_net

        this.mntNetArrayVisite[index] = data.p_mnt_net;
        this.visite.at(index).patchValue({ mnt_net: this.mntNetArrayVisite[index] });
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
      const net = parseFloat((ligne.get('mnt_net')?.value || '0')) || 0;
      return sum + net;
    }, 0);
  }

  verif_indice_visite(item: any, index: any) {
    const ligPhar = this.ligVisiteForm.get('visite') as FormArray;
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
      mnt_net: [''],
      mnt_remb: [''],
      accord_app: [''],
      indice: [''],
      dat_act: [''],
      prf_typ: [''],
      prf_cod: [''],
      num_pec_app: [''],
      num_lig_app: ['1'],
      mut_mnt_net: [''],


    });

  }
  addLigneAppareil(index: number): void {
    const ligBult = this.ligAppareilForm.get('appareil') as FormArray;
    this.appareil.push(this.createLigneAppareil());
    this.calculateTotalsVisite()
    console.log("ligBult.value ", ligBult.value)
    this.serv.getNumLigApp(this.formBuletinSoin.get('cod_soc')?.value, this.formBuletinSoin.get('mat_pers')?.value, this.formBuletinSoin.get('num_fam')?.value,
      this.formBuletinSoin.get('dat_soin')?.value, ligBult.value[index].cod_app).subscribe((data: any) => {
        this.appareil.at(index).patchValue({
          num_lig_app: data
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
      abrv_act: ligne.abrv_act,
      cod_app: ligne.cod_app,
      num_lig_app: ligne.num_lig_app,
    };

    console.log("Clé à vérifier :", cle);

    this.serv.existeLigBultApp(cle).subscribe({
      next: (exists: boolean) => {
        console.log("Enregistrement existant :", exists);

        if (exists) {
          // Si l'enregistrement existe, on appelle le service de suppression
          this.serv.deleteLigBultApp(
            ligne.cod_soc,
            ligne.mat_pers,
            ligne.num_fam,
            ligne.dat_soin,
            ligne.abrv_act,
            ligne.num_lig_app,
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
    this.serv.calculer_montant_net_app(this.formBuletinSoin.get("cod_soc")?.value, this.formBuletinSoin.get("mat_pers")?.value, this.formBuletinSoin.get("num_fam")?.value,
      this.formBuletinSoin.get("dat_soin")?.value, event.target.value, ligBult.value[index].cod_app, 0).subscribe((data: any) => {
        this.mntNet = data.p_mnt_net ?? 0

        this.mntNetArrayAppareil[index] = this.mntNet === 0 ? 0 : data.p_mnt_net;
        this.appareil.at(index).patchValue({ mnt_net: this.mntNetArrayAppareil[index] });
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
      const net = parseFloat((ligne.get('mnt_net')?.value || '0')) || 0;
      return sum + net;
    }, 0);
  }

  verif_indice_app(item: any, index: any) {
    const ligPhar = this.ligAppareilForm.get('appareil') as FormArray;
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


  /* Fin Traitement des appareils*/


  totalHonorairesLigBult: number = 0;
  totalNetLigBult: number = 0;



  calculerTotaux() {
    if (this.ligBult && this.ligBult.length) {
      this.totalHonorairesLigBult = this.ligBult.reduce((sum, item) => sum + (item.mnt_honor || 0), 0);
      this.totalNetLigBult = this.ligBult.reduce((sum, item) => sum + (item.mnt_net || 0), 0);
    }
  }
}

