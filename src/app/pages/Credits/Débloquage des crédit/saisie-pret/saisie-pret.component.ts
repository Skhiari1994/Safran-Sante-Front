import { Component, ElementRef, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { DebCreditService } from '../deb-credit.service';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SaveService } from 'src/app/shared/Service/save.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { PretSearchComponent } from 'src/app/shared/Composants/pret-search/pret-search.component';

@Component({
  selector: 'app-saisie-pret',
  templateUrl: './saisie-pret.component.html',
  styleUrl: './saisie-pret.component.scss'
})
export class SaisiePretComponent {
  @ViewChild(PretSearchComponent) pretSearchComponent!: PretSearchComponent;

  formPretPers!: FormGroup
  formattedAmount: string = '0,000';
  errorMessageMat = "Champs obligatoire"
  listPersonnel: any[] = []
  listOrgPret: any[] = []
  listDetailPret: any[] = []
  listComm: any[] = []
  columnsMat: any[] = []
  columnsOrgPret: any[] = []
  columnsDetailPret: any[] = []
  columnsComm: any[] = []
  prets: any[] = []
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
  codEtatPret: string = "";
  datNais: string = "";
  anc: string = "";
  codAffect: string = "";
  breadCrumbItems!: Array<{}>;

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
  p: number = 1; // Pagination pour le premier tableau
  pCertif: number = 1;
  formAffectation!: FormGroup;
  listPiece: any[] = [];
  edit: boolean = true;
  formPiece!: FormGroup;
  @ViewChild('prtDatAcc') prtDatAcc!: ElementRef; // Référence vers l'élément DOM
  searchfield: boolean = false;
  constructor(private serv: DebCreditService, private token: TokenStorage, private fb: FormBuilder, private saveService: SaveService, public service: PaginationService,
    private modalService: NgbModal) {
    this.formPretPers = this.fb.group({
      cod_soc: [this.token.getUser().codSoc],
      mat_pers: ['', Validators.required],
      cod_pret: [''],
      num_dem_pret: [''],
      prt_dat_dem: [''],
      prt_mnt_dem: [''],
      cod_grp_pret: [''],
      typ_pret: [''],
      cod_etat_pret: this.fb.control({ value: 'S', disabled: true }),
      typ_etat: ['P'],
      org_pret: [''],
      mod_remb: ['V'],
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
      prt_dat_acc: ['', Validators.required],
      prt_dat_deb: ['', Validators.required],
      prt_dat_fin: [''],
      prt_ech: [''],
      prt_taux: [''],
      prt_mnt_glb: ['', Validators.required],
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
      dat_saisie: [new Date().toLocaleDateString().substring(0, 10)],
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

    })
    this.formPiece = this.fb.group({
      cod_soc: [this.token.getUser().codSoc],
      mat_pers: [''],
      cod_pret: [''],
      cod_piece_pret: [''],
      nbr_copie: [''],
      dat_piece: [''],
      obs_piece: [''],

    });
  }

  ngOnInit() {
    this.formPretPers = this.fb.group({
      cod_soc: [this.token.getUser().codSoc],
      mat_pers: ['', Validators.required],
      cod_pret: [''],
      num_dem_pret: [''],
      prt_dat_dem: [''],
      prt_mnt_dem: [''],
      cod_grp_pret: [''],
      typ_pret: [''],
      cod_etat_pret: this.fb.control({ value: 'S', disabled: true }),
      typ_etat: ['P'],
      org_pret: [''],
      mod_remb: ['V'],
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
      prt_dat_acc: ['', Validators.required],
      prt_dat_deb: ['', Validators.required],
      prt_dat_fin: [''],
      prt_ech: [''],
      prt_taux: [''],
      prt_mnt_glb: ['', Validators.required],
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
      dat_saisie: [new Date().toLocaleDateString().substring(0, 10)],
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
    })

    this.breadCrumbItems = [
      { label: 'Crédits' },
      { label: 'Saisie des crédits', active: true }
    ];

    this.getMatInt()
    this.getOrgPret()
    this.getDetailPret()
    this.getComm()

    this.fetchPretEnCoursData()

    this.saveService.registerSaveCallback(() => this.addCredit());


    this.formPretPers.valueChanges.subscribe(() => {
      this.saveService.setDisabled(!this.isDisabled);
    });

    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch = true
      console.log("is search valid", canSearch)

    })


    this.saveService.add$.subscribe((reset) => {

      if (reset) {
        this.saveService.registerSaveCallback(() => this.addCredit());
        this.formPretPers.reset(); // Reset the form
        this.searchfield = false
        this.matricule = "";
        this.commission = "";
        this.anc = ""
        this.commission = "";
        this.grpPret = "";
        this.orgPret = "";
        this.libPret = "";
        this.mntPrev = 0;
        this.cnrps = "";
        this.nomPers = "";
        this.codLieuGeog = "";
        this.LibLieuGeog = "";
        this.datEmb = "";
        this.DatRetr = "";
        this.codTypDep = "";
        this.libDeprt = "";
        this.codEtatPret = ""
        this.datNais = "";
        this.codAffect = "";
        this.libAffect = "";
        this.codSit = "";
        this.nbrEnf = "";
        this.libRefComm = ""
        this.libOrg = ""
        this.persCarte = ""
        this.saveService.setAdded(false); // Reset the observable to false
        this.formPretPers.patchValue({
          dat_saisie: new Date().toLocaleDateString().substring(0, 10),
          cod_soc: this.token.getUser().codSoc,
          mod_remb: 'V',
          typ_etat: 'P',
          cod_etat_pret: 'S',

        })
      }
    });

    this.getEtatPret()
  }
  ngOnDestroy() {
    // Clear the callback to avoid memory leaks
    this.saveService.clearSaveCallback();
    //this.saveService.setCanSave(false)
  }

  etatPret: any[] = []

  getEtatPret() {
    this.serv.getEtatPret().subscribe((data: any) => {
      this.etatPret = data
    })
  }

  etatDem: String = ""
  datDebloc: String = ""
  search(item: any) {
    //this.formPretPers.get("cod_etat_pret")?.enable()

    console.log("item :123", item);
    this.searchfield = true
    // Mise à jour initiale des champs avec l'élément sélectionné
    this.formPretPers.patchValue({
      cod_soc: item.cod_soc,
      mat_pers: item.mat_pers,
      cod_pret: item.cod_pret,
      num_dem_pret: item.num_dem_pret,
      prt_dat_dem: item.prt_dat_dem,
      prt_mnt_dem: Number(item.prt_mnt_dem).toFixed(3),
      cod_grp_pret: item.cod_grp_pret,
      typ_pret: item.typ_pret,
      cod_etat_pret: item.cod_etat_pret,
      typ_etat: item.typ_etat,
      org_pret: item.org_pret,
      mod_remb: item.mod_remb,
      methode_calc: item.methode_calc,
      cod_dept_pers: item.cod_dept_pers,
      cod_serv_pers: item.cod_serv_pers,
      cod_motif_pers: item.cod_motif_pers,
      cod_categ_pers: item.cod_categ_pers,
      cod_cat_pers: item.cod_cat_pers,
      cod_grad_pers: item.cod_grad_pers,
      adm_tech: item.adm_tech,
      cod_affect: item.cod_affect,
      cod_lieu_geog: item.cod_lieu_geog,
      cod_typ_depart: item.cod_typ_depart,
      nbr_enf: item.nbr_enf,
      prt_dat_acc: item.prt_dat_acc,
      prt_dat_deb: item.prt_dat_deb,
      prt_dat_fin: item.prt_dat_fin,
      prt_ech: item.prt_ech,
      prt_taux: Number(item.prt_taux).toFixed(3),
      prt_mnt_glb: Number(item.prt_mnt_glb).toFixed(3),
      prt_mnt_prm: Number(item.prt_mnt_prm).toFixed(3),
      delai_grace: item.delai_grace,
      prt_int_grace: item.prt_int_grace,
      prt_mnt_rem: Number(item.prt_mnt_rem).toFixed(3),
      rem_men: Number(item.rem_men).toFixed(3),
      dern_rem_men: Number(item.dern_rem_men).toFixed(3),
      prt_rendu: Number(item.prt_rendu).toFixed(3),
      prt_rendu_int: Number(item.prt_rendu_int).toFixed(3),
      nbr_retenue: item.nbr_retenue,
      dat_deblocage: item.dat_deblocage,
      dat_comptable: item.dat_comptable,
      mode_reglement: item.mode_reglement,
      piece_reglement: item.piece_reglement,
      mnt_report: Number(item.mnt_report).toFixed(3),
      cod_pret_ant: item.cod_pret_ant,
      ass_pret: item.ass_pret,
      objet_pret: item.objet_pret,
      dat_saisie: item.dat_saisie,
      cod_user: item.cod_user,
      cod_motif_susp: item.cod_motif_susp,
      cod_pret_ref: item.cod_pret_ref,
      num_etat_pret: item.num_etat_pret,
      amort_pret: item.amort_pret,
      nbr_tranche: item.nbr_tranche,
      dat_effet: item.dat_effet,
      prt_mnt_debloque: Number(item.prt_mnt_debloque).toFixed(3),
      prt_int_tranch: item.prt_int_tranch,
      num_lig_dem_pret: item.num_lig_dem_pret,
      prt_interet: Number(item.prt_interet).toFixed(3),
      seq_ecrt: item.seq_ecrt,
      num_vir: item.num_vir,
    });
    this.matricule = item.mat_pers
    this.commission = item.num_comm
    this.orgPret = item.org_pret
    this.grpPret = item.cod_grp_pret
    this.etatDem = item.cod_etat_pret
    this.datDebloc = item.dat_deblocage



    this.formPretPers.get("cod_etat_pret")?.enable()

    console.log("this.formPretPers :", this.formPretPers.value)
    // Récupérer les données à partir du service et filtrer par `mat_pers`
    this.serv.getPersonnelCreditByMat(this.token.getUser().codSoc, item.mat_pers).subscribe(
      (data: any) => {
        // Trouver l'élément où `mat_pers` correspond
        console.log("matchedItem :", data)
        if (data) {
          // Mise à jour des champs avec l'élément correspondant
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
          this.persCarte = data.persCarte;

          if (this.persCarte === 'N' && this.formPretPers.get('mod_remb')?.value === 'V') {
            this.formPretPers.patchValue({ mod_remb: 'E' });
          }

          // Mise à jour des champs dans le formulaire
          this.formPretPers.patchValue({
            mat_pers: data.matPers,
            cod_lieu_geog: data.codLieuGeog,
            cod_typ_depart: data.codTypDepart,
            cod_affect: data.codAffect,
            cod_sit: data.codSit,
            nbr_enf: data.nbrEnf,
            corps: data.corps
          });
        } else {
          console.warn('Aucun élément correspondant trouvé pour mat_pers :', item.mat_pers);
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des données :', error);
      }
    );

    this.serv.getOrgPret().subscribe((data) => {
      const org = data.find((org) => org.org_pret === item.org_pret);
      this.libOrg = org.lib_organisme
    });

    this.serv.getDetailPret(this.token.getUser().codSoc).subscribe((data) => {

      const pret = data.find(
        (org) => org.codGrpPret === item.cod_grp_pret && org.typPret === item.typ_pret
      );
      console.log("pret :", pret)
      this.libPret = pret.libPret
    });

    this.serv.getValidCommission(this.token.getUser().codSoc).subscribe((data) => {
      const comm = data.find((comm) => comm.num_comm === item.num_comm);
      this.libRefComm = comm.ref_comm
    });
    this.serv.getPiecePretPers(this.token.getUser().codSoc, item.mat_pers, item.cod_pret).subscribe((data: any) => {
      this.listPiece = data
    })
    if ((item.dat_deblocage !== null && item.dat_deblocage !== '') || item.cod_etat_pret === 'D') {
      this.formPretPers.disable();
      this.searchfield = true
    }
    //this.formPretPers.get("cod_etat_pret")?.enable()
  }
  addCredit() {
    console.log("Pret pers", this.formPretPers.value)
    if (this.formPretPers.valid) {
      const mntTranche = this.formPretPers.get('prt_mnt_rem')?.value.replace('.', ',')
      this.serv.AjoutCredit(this.formPretPers.getRawValue()).subscribe((data: any) => {
        this.serv.insertRembTranch(this.token.getUser().codSoc, this.formPretPers.get('mat_pers')?.value, this.formPretPers.get('cod_pret')?.value, this.formPretPers.get('cod_etat_pret')?.value,
          this.formPretPers.get('prt_dat_acc')?.value, mntTranche, this.formPretPers.get('nbr_tranche')?.value).subscribe((data: any) => {

          })
        this.serv.AjoutPiece(this.formPiece.value).subscribe((data: any) => {

        })
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Crédit ajouté avec succés",
          showConfirmButton: false,
          timer: 2000,
        });
        // Reset form to clean state
        this.formPretPers.reset(); // Reset the form
        this.searchfield = false
        this.matricule = "";
        this.commission = "";
        this.anc = ""
        this.commission = "";
        this.grpPret = "";
        this.orgPret = "";
        this.libPret = "";
        this.mntPrev = 0;
        this.cnrps = "";
        this.nomPers = "";
        this.codLieuGeog = "";
        this.LibLieuGeog = "";
        this.datEmb = "";
        this.DatRetr = "";
        this.codTypDep = "";
        this.libDeprt = "";
        this.codEtatPret = ""
        this.datNais = "";
        this.codAffect = "";
        this.libAffect = "";
        this.codSit = "";
        this.nbrEnf = "";
        this.libRefComm = ""
        this.libOrg = ""
        this.persCarte = ""
        this.saveService.setAdded(false); // Reset the observable to false
        this.formPretPers.patchValue({
          dat_saisie: new Date().toLocaleDateString().substring(0, 10),
          cod_soc: this.token.getUser().codSoc,
          mod_remb: 'V',
          typ_etat: 'P',
          cod_etat_pret: 'S',

        })


        // Refresh the list
        this.fetchPretEnCoursData();

        // Re-register the save callback for next operation
        this.saveService.registerSaveCallback(() => this.addCredit());


        console.log("data :", data)
      })
    } else {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Veuiller verifier tous champs",
        showConfirmButton: false,
        timer: 2000,
      });
    }
  }
  getMatInt() {
    this.serv.getPersonnelCredit(this.token.getUser().codSoc).subscribe((data) => {
      this.listPersonnel = data;
      console.log(this.listPersonnel);
      // Définir les colonnes dynamiques du tableau
      this.columnsMat = [
        { key: "numRetr", label: "Id CNRPS" },
        { key: "matPers", label: "Matricule" },
        { key: "nom", label: "Nom & Prénom" },

      ];
    });
  }
  getOrgPret() {
    this.serv.getOrgPret().subscribe((data) => {
      this.listOrgPret = data;
      // Définir les colonnes dynamiques du tableau
      this.columnsOrgPret = [
        { key: "org_pret", label: "Code" },
        { key: "lib_organisme", label: "Libelle" },

      ];
    });
  }
  getDetailPret() {
    this.serv.getDetailPret(this.token.getUser().codSoc).subscribe((data) => {
      this.listDetailPret = data;
      console.log("pret typ", data)
      // Définir les colonnes dynamiques du tableau
      this.columnsDetailPret = [
        { key: "codGrpPret", label: "Groupe prêt" },
        { key: "typPret", label: "Type prêt" },

        { key: "libPret", label: "Libelle" },

      ];
    });
  }
  getComm() {
    this.serv.getValidCommission(this.token.getUser().codSoc).subscribe((data) => {
      this.listComm = data;
      // Définir les colonnes dynamiques du tableau
      this.columnsComm = [
        { key: "num_comm", label: "Num comm" },
        { key: "ref_comm", label: "Ref comm" },

      ];
    });
  }

  onChangePersCarte(value: any) {
    this.persCarte = value;

    if (this.persCarte === 'N' && this.formPretPers.get('mod_remb')?.value === 'V' || this.persCarte === null) {
      this.formPretPers.patchValue({ mod_remb: 'E' });
    }
  }

  persCarte: string = '';
  onSelectedVMat(item: any) {
    this.formPretPers.enable();
    this.formPretPers.patchValue({ mod_remb: 'V' });
    console.log("item :", item)
    this.cnrps = item.numRetr,
      this.nomPers = item.nom,
      this.codLieuGeog = item.codLieuGeog,
      this.LibLieuGeog = item.libLieu,
      this.datEmb = item.datEmb,
      this.DatRetr = item.datRetraite,
      this.codTypDep = item.codTypDepart,
      this.libDeprt = item.libTypDepart,
      this.datNais = item.dateNaissance,
      //this.anc:item.,
      this.codAffect = item.codAffect,
      this.libAffect = item.libAffect,
      this.codSit = item.codSit,
      this.nbrEnf = item.nbrEnf,
      this.persCarte = item.persCarte

    if (this.persCarte === 'N' && this.formPretPers.get('mod_remb')?.value === 'V') {
      this.formPretPers.patchValue({ mod_remb: 'E' });
    }

    console.log("persCarte", this.persCarte)

    this.formPretPers.patchValue({
      mat_pers: item.matPers,
      cod_lieu_geog: item.codLieuGeog,
      cod_typ_depart: item.codTypDepart,
      cod_affect: item.codAffect,

      cod_sit: item.codSit,
      nbr_enf: this.nbrEnf,
      corps: item.corps
    })

    this.serv.getMaxPret(this.token.getUser().codSoc, this.formPretPers.get('mat_pers')?.value).subscribe((data: any) => {
      this.formPretPers.patchValue({
        cod_pret: data
      })
    })
  }
  onSelectedOrgPret(item: any) {
    this.libOrg = item.lib_organisme
    this.formPretPers.patchValue({
      org_pret: item.org_pret
    })

  }
  onSelectedComm(item: any) {
    this.libRefComm = item.ref_comm
    this.formPretPers.patchValue({
      num_comm: item.num_comm
    })

  }
  onSelectedDetailPret(item: any) {
    console.log("typ preet", item)

    this.typPret = item.typPret
    this.libPret = item.libPret
    this.mntPrev = item.plafond
    this.tauxInt = item.tauxInt

    this.formPretPers.patchValue({
      cod_grp_pret: item.codGrpPret,
      typ_pret: item.typPret,
      delai_grace: item.delaiGrace,
      nbr_tranche: item.nbrTranche,
      prt_ech: item.dureeRemb,
      prt_taux: item.tauxInt
    })

    this.serv.checkPret(this.formPretPers.get('mat_pers')?.value, this.formPretPers.get('cod_grp_pret')?.value).subscribe(result => {
      if (result) {
        Swal.fire({
          icon: 'warning',
          title: 'Prêt existant',
          html: `
    Un prêt existe déjà pour cet agent avec l’un des états suivants :
    <ul style="text-align:left">
      <li><b>S</b> : Saisi</li>
      <li><b>V</b> : Validé</li>
    </ul>
  `,
          confirmButtonText: 'Fermer'
        });

      }
    });


    console.log(this.formPretPers.get('mat_pers')?.value, this.formPretPers.get('cod_grp_pret')?.value, this.formPretPers.get('typ_pret')?.value)

    console.log("this.formPretPers", this.formPretPers.value)

  }
  VerifMntDem(event: any) {
    const inputValue = parseFloat(event.target.value);
    if (inputValue > this.mntPrev) {
      event.target.value = '';
      // Alerte de confirmation avant la suppression
      Swal.fire({
        title: 'Montant demandé dépasse le plafond ! ',
        text: "Veuiller resaisir le montant !",
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'D\'accord',
      })
    }

  }

  VerifTauxInt(event: any) {
    const inputValue = parseFloat(event.target.value);

    if (inputValue > this.tauxInt) {
      // Réinitialiser la valeur du champ si elle est invalide
      event.target.value = '';

      // Alerte avec SweetAlert
      Swal.fire({
        title: 'Vérifiez le taux d\'intérêt !',
        text: 'Le taux saisi dépasse la limite autorisée. Veuillez ressaisir.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'D\'accord',
      });
    }
  }


  VerifPrtEch(event: any) {
    if (event.target.value > this.formPretPers.get('prt_ech')?.value) {
      // Alerte de confirmation avant la suppression
      Swal.fire({
        title: 'Vérifier le nombre d\'écheance ! ',
        text: "Veuiller resaisir le nombre d\'écheance !",
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'D\'accord',
      })
    }

  }
  VerifDatAccord(event: any) {
    this.serv
      .verif_dat_acc(
        this.token.getUser().codSoc,
        this.formPretPers.get('mat_pers')?.value,
        this.formPretPers.get('cod_grp_pret')?.value,
        this.formPretPers.get('typ_pret')?.value,
        this.datEmb,
        event?.target.value
      )
      .subscribe((data: any) => {
        this.anc = data.anc;
        if (data.nbre > 0) {
          Swal.fire({
            title: 'Ce prêt existe déjà. Veuillez accéder via la modification. ! ',
            icon: 'warning',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'D\'accord',
          }).then(() => {
            // Effacez la valeur du champ
            this.formPretPers.get('prt_dat_acc')?.patchValue('');
            // Remet le focus sur le champ
            this.prtDatAcc.nativeElement.focus();
          });
        }
      });
  }

  VerifDatDebut(event: any) {
    const formatDates = (form: any, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value); // Assuming formatDate returns a string or null
        form.get(field)?.setValue(value);
        formatted.push(value); // Push value into the string[] array
        return formatted;
      }, []);

    const adherentDates = formatDates(this.formPretPers, [
      "prt_dat_acc",
      "prt_dat_deb",

    ]);



    this.serv.verif_dat_deb(this.token.getUser().codSoc, this.formPretPers.get('prt_ech')?.value, this.formPretPers.get('prt_dat_acc')?.value,
      event.target.value, this.DatRetr).subscribe((data: any) => {
        this.datFin = data.datFin
        console.log(data.datFin)

        this.formPretPers.patchValue({
          prt_dat_fin: data.datFin,

        })



        if (data.message) {
          Swal.fire({
            title: 'Message',
            text: data.message,
            icon: data.message.includes('probléme') ? 'error' : 'info',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });

          event.target.value = '';
          this.formPretPers.get('prt_dat_fin')?.patchValue('')
        } else {
          console.log(this.formPretPers.get('mat_pers')?.value, this.formPretPers.get('cod_grp_pret')?.value, this.formPretPers.get('typ_pret')?.value)
          this.serv.verif_pret_cours(this.token.getUser().codSoc, this.formPretPers.get('mat_pers')?.value,
            this.formPretPers.get('cod_grp_pret')?.value, this.formPretPers.get('typ_pret')?.value, this.formPretPers.get('prt_dat_deb')?.value).subscribe(
              (response: any) => {
                this.formPretPers.patchValue({
                  cod_pret_ant: response.codPretAnt,
                  mnt_report: response.mntReport
                })
                console.log("dat test ", response.message)
                if (response.message) {
                  Swal.fire({
                    title: 'Message',
                    text: response.message,
                    icon: response.message.includes('probléme') ? 'error' : 'info',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK',
                  });
                  //  this.formPretPers.disable();

                }
              },
              (error) => {
                console.error('Error:', error);
                Swal.fire({
                  title: 'Erreur',
                  text: 'Une erreur est survenue lors de la vérification du prêt.',
                  icon: 'error',
                  confirmButtonColor: '#d33',
                  confirmButtonText: 'OK',
                });
              }
            );
        }
      })

    console.log(this.formPretPers.value)
  }

  VerifDelaiGrace(event: any) {
    if (event.target.value > this.formPretPers.get('delai_grace')?.value) {
      event.target.value = '';
      // Alerte de confirmation avant la suppression
      Swal.fire({
        title: 'Vérifier delai de grace ',
        text: "Veuiller resaisir le delai de grace !",
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'D\'accord',
      })
    }

  }

  verifyPretCours(event: any) {

    console.log(this.formPretPers.get('mat_pers')?.value, this.formPretPers.get('cod_grp_pret')?.value, this.formPretPers.get('typ_pret')?.value)
    this.serv.verif_pret_cours(this.token.getUser().codSoc, this.formPretPers.get('mat_pers')?.value, this.formPretPers.get('cod_grp_pret')?.value, event.target.value, this.formPretPers.get('prt_dat_deb')?.value).subscribe(
      (response: any) => {
        this.formPretPers.patchValue({
          cod_pret_ant: response.codPretAnt,
          mnt_report: response.mntReport
        })
        if (response.message) {
          Swal.fire({
            title: 'Message',
            text: response.message,
            icon: response.message.includes('probléme') ? 'error' : 'info',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });
        }
      },
      (error) => {
        console.error('Error:', error);
        Swal.fire({
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la vérification du prêt.',
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK',
        });
      }
    );
  }
  resetCalculatedFields() {
    this.formPretPers.patchValue({
      prt_interet: '',
      prt_mnt_rem: '',
      rem_men: '',
      dern_rem_men: '',
      prt_rendu: '',
      nbr_retenue: ''
    });
  }

  CalculDetailCredit() {

    const mnt_report = this.formPretPers.get('mnt_report')?.value || 0;
    console.log("this.formPretPers.get('cod_grp_pret')?.value :", this.DatRetr)
    this.serv.calcul_detail_credit(this.token.getUser().codSoc, this.formPretPers.get('prt_dat_fin')?.value, this.DatRetr, this.formPretPers.get('prt_mnt_glb')?.value,
      this.formPretPers.get('prt_ech')?.value, this.formPretPers.get('prt_taux')?.value, mnt_report, this.formPretPers.get('cod_grp_pret')?.value).subscribe((data: any) => {
        console.log("data :", data)


        this.formPretPers.patchValue({
          prt_interet: data.wprInteret,
          prt_mnt_rem: data.wprtMntRem,
          rem_men: data.wremMen,
          dern_rem_men: data.wdernRemMen,
          prt_rendu: data.wprtRendu,
          nbr_retenue: data.wnbrRetenue


        })

        console.log("value  :", this.formPretPers.value)
      })
  }

  onCalculClick() {
    this.resetCalculatedFields();   // ✅ first
    this.CalculDetailCredit();  // ✅ then
  }

  formatDate(dateString: any): string {
    // Ensure the string is in the format 'ddmmyyyy'
    if (dateString && dateString.length === 8) {
      const day = dateString.substring(0, 2);
      const month = dateString.substring(2, 4);
      const year = dateString.substring(4, 8);
      return `${day}/${month}/${year}`;
    }
    return dateString;
  }


  formatInputValue(value: string): number {
    const parsedValue = parseFloat(value);
    return isNaN(parsedValue) ? 0 : parseFloat(parsedValue.toFixed(3));
  }
  updateFormattedAmount(inputValue: any): string {
    const value = inputValue || 0; // Handle empty or undefined input
    // Format value with three decimals and comma as decimal separator
    return this.formattedAmount = value
      .toFixed(3) // Ensure three decimal places
      .replace(',', '.') // Replace dot with comma
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // Add thousand separators
  }


  fetchPretEnCoursData(): void {
    this.serv.getPretEnCours(this.token.getUser().codSoc, '5199').subscribe(
      (data) => {
        this.prets = data;  // Stockez les données récupérées
        console.log('this.prets:', this.prets);
        this.columnsPret = [
          { key: "num_retr", label: "Id CNRPS" },
          { key: "mat_pers", label: "Matricule" },
          { key: "nomPers", label: "Nom & Prenom" },
          { key: "num_comm", label: "Numéro de commission" },
          { key: "cod_etat_pret", label: "Code etat pret" },
          { key: "cod_pret", label: "Code prêt" },
          { key: 'mod_remb', label: 'Mode de remboursement' },
        ];


      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }
  onSort(column: any) {
    console.log("this.dataRows :", this.listPiece);
    this.listPiece = this.service.onSort(column, this.listPiece);
  }




  openModalTab(content: any) {
    this.edit = true;
    this.formPiece.reset()
    //this.formCertif.reset()
    this.modalService.open(content, { size: "xl", centered: true });
  }

  editDataGet(id: any, data: any, content: any) {
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });

    this.formPiece.get("cod_piece_pret")?.patchValue(data.cod_piece_pret),
      this.formPiece.get("nbr_copie")?.patchValue(data.nbr_copie),
      this.formPiece.get("dat_piece")?.patchValue(data.dat_piece)


  }

  onPageChangeForGouv(page: number): void {
    console.log("Pagination pour le tableau 1 : ", page);

    this.p = page;

  }

  onPageChangeForPoste(page: number): void {
    console.log("Pagination pour le tableau 2 : ", page);
    this.pCertif = page;

  }


  validatePiece(): void {
    // Fonction pour formater les dates d'un FormGroup donné
    const formatDates = (form: FormGroup, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value); // Appel de votre méthode pour formater la date
        form.get(field)?.setValue(value); // Met à jour la valeur formatée dans le champ
        if (value) {
          formatted.push(value); // Ajoute la valeur formatée au tableau

        }
        return formatted;
      }, []);

    // Récupère le FormArray 'enfants'

    const adherentDates = formatDates(this.formPiece, [
      "dat_piece",

    ]);




  }

  currentIndex: number = 0;
  listCotis: any[] = [];
  listDetailCotis: any[] = [];


  navigate(direction: number): void {

    this.currentIndex += direction;
    this.loadData(this.currentIndex);
    console.log("this.currentIndex", this.currentIndex)

  }
  goToFirst() {
    this.currentIndex = 0;
    console.log("this.currentIndex", this.currentIndex)
    this.loadData(this.currentIndex);

  }

  goToLast() {
    this.currentIndex = this.prets.length - 1;
    console.log("this.currentIndex", this.currentIndex)
    this.loadData(this.currentIndex);

  }

  loadData(index: number): void {
    this.formPretPers.enable();
    const currentData = this.prets[index];

    console.log("currentData :", currentData);
    this.searchfield = true
    // Mise à jour initiale des champs avec l'élément sélectionné
    this.formPretPers.patchValue({
      cod_soc: currentData.cod_soc,
      mat_pers: currentData.mat_pers,
      cod_pret: currentData.cod_pret,
      num_dem_pret: currentData.num_dem_pret,
      prt_dat_dem: currentData.prt_dat_dem,
      prt_mnt_dem: Number(currentData.prt_mnt_dem).toFixed(3),
      cod_grp_pret: currentData.cod_grp_pret,
      typ_pret: currentData.typ_pret,
      cod_etat_pret: currentData.cod_etat_pret,
      typ_etat: currentData.typ_etat,
      org_pret: currentData.org_pret,
      mod_remb: currentData.mod_remb,
      methode_calc: currentData.methode_calc,
      cod_dept_pers: currentData.cod_dept_pers,
      cod_serv_pers: currentData.cod_serv_pers,
      cod_motif_pers: currentData.cod_motif_pers,
      cod_categ_pers: currentData.cod_categ_pers,
      cod_cat_pers: currentData.cod_cat_pers,
      cod_grad_pers: currentData.cod_grad_pers,
      adm_tech: currentData.adm_tech,
      cod_affect: currentData.cod_affect,
      cod_lieu_geog: currentData.cod_lieu_geog,
      cod_typ_depart: currentData.cod_typ_depart,
      nbr_enf: currentData.nbr_enf,
      prt_dat_acc: currentData.prt_dat_acc,
      prt_dat_deb: currentData.prt_dat_deb,
      prt_dat_fin: currentData.prt_dat_fin,
      prt_ech: currentData.prt_ech,
      prt_taux: Number(currentData.prt_taux).toFixed(3),
      prt_mnt_glb: Number(currentData.prt_mnt_glb).toFixed(3),
      prt_mnt_prm: Number(currentData.prt_mnt_prm).toFixed(3),
      delai_grace: currentData.delai_grace,
      prt_int_grace: currentData.prt_int_grace,
      prt_mnt_rem: Number(currentData.prt_mnt_rem).toFixed(3),
      rem_men: Number(currentData.rem_men).toFixed(3),
      dern_rem_men: Number(currentData.dern_rem_men).toFixed(3),
      prt_rendu: Number(currentData.prt_rendu).toFixed(3),
      prt_rendu_int: Number(currentData.prt_rendu_int).toFixed(3),
      nbr_retenue: currentData.nbr_retenue,
      dat_deblocage: currentData.dat_deblocage,
      dat_comptable: currentData.dat_comptable,
      mode_reglement: currentData.mode_reglement,
      piece_reglement: currentData.piece_reglement,
      mnt_report: Number(currentData.mnt_report).toFixed(3),
      cod_pret_ant: currentData.cod_pret_ant,
      ass_pret: currentData.ass_pret,
      objet_pret: currentData.objet_pret,
      dat_saisie: currentData.dat_saisie,
      cod_user: currentData.cod_user,
      cod_motif_susp: currentData.cod_motif_susp,
      cod_pret_ref: currentData.cod_pret_ref,
      num_etat_pret: currentData.num_etat_pret,
      amort_pret: currentData.amort_pret,
      nbr_tranche: currentData.nbr_tranche,
      dat_effet: currentData.dat_effet,
      prt_mnt_debloque: Number(currentData.prt_mnt_debloque).toFixed(3),
      prt_int_tranch: currentData.prt_int_tranch,
      num_lig_dem_pret: currentData.num_lig_dem_pret,
      prt_interet: Number(currentData.prt_interet).toFixed(3),
      seq_ecrt: currentData.seq_ecrt,
      num_vir: currentData.num_vir,
    });
    this.matricule = currentData.mat_pers
    this.commission = currentData.num_comm
    this.orgPret = currentData.org_pret
    this.grpPret = currentData.cod_grp_pret
    console.log("this.formPretPers :", this.formPretPers.value)
    // Récupérer les données à partir du service et filtrer par `mat_pers`
    this.serv.getPersonnelCreditByMat(this.token.getUser().codSoc, currentData.mat_pers).subscribe(
      (data: any) => {
        // Trouver l'élément où `mat_pers` correspond
        console.log("matchedcurrentData :", data)
        if (data) {
          // Mise à jour des champs avec l'élément correspondant
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
          this.persCarte = data.persCarte;

          if (this.persCarte === 'N' && this.formPretPers.get('mod_remb')?.value === 'V') {
            this.formPretPers.patchValue({ mod_remb: 'E' });
          }

          // Mise à jour des champs dans le formulaire
          this.formPretPers.patchValue({
            mat_pers: data.matPers,
            cod_lieu_geog: data.codLieuGeog,
            cod_typ_depart: data.codTypDepart,
            cod_affect: data.codAffect,
            cod_sit: data.codSit,
            nbr_enf: data.nbrEnf,
            corps: data.corps
          });
        } else {
          console.warn('Aucun élément correspondant trouvé pour mat_pers :', currentData.mat_pers);
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des données :', error);
      }
    );

    this.serv.getOrgPret().subscribe((data) => {
      const org = data.find((org) => org.org_pret === currentData.org_pret);
      this.libOrg = org.lib_organisme
    });

    this.serv.getDetailPret(this.token.getUser().codSoc).subscribe((data) => {

      const pret = data.find(
        (org) => org.codGrpPret === currentData.cod_grp_pret && org.typPret === currentData.typ_pret
      );
      console.log("pret :", pret)
      this.libPret = pret.libPret
    });

    this.serv.getValidCommission(this.token.getUser().codSoc).subscribe((data) => {
      const comm = data.find((comm) => comm.num_comm === currentData.num_comm);
      this.libRefComm = comm.ref_comm
    });
    this.serv.getPiecePretPers(this.token.getUser().codSoc, currentData.mat_pers, currentData.cod_pret).subscribe((data: any) => {
      this.listPiece = data
    })
    if ((currentData.dat_deblocage !== null && currentData.dat_deblocage !== '') || currentData.cod_etat_pret === 'D') {
      // this.formPretPers.disable();
    }
  }
}
