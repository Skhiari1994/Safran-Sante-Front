import { Component } from '@angular/core';
import { DebCreditService } from '../deb-credit.service';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-deb-pret',
  templateUrl: './deb-pret.component.html',
  styleUrl: './deb-pret.component.scss'
})
export class DebPretComponent {
  formPretPers!: FormGroup
  formattedAmount: string = '0,000';
  breadCrumbItems!: Array<{}>;

  errorMessageMat = "Champs obligatoire"
  listPersonnel: any[] = []
  listOrgPret: any[] = []
  listDetailPret: any[] = []
  listComm: any[] = []
  columnsMat: any[] = []
  columnsOrgPret: any[] = []
  columnsDetailPret: any[] = []
  columnsComm: any[] = []
  lisPrets: any[] = []
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
  constructor(private serv: DebCreditService, private token: TokenStorage, private fb: FormBuilder, private saveService: SaveService) {
    this.formPretPers = this.fb.group({
      cod_soc: [''],
      mat_pers: [''],
      cod_pret: [''],
      num_dem_pret: [''],
      prt_dat_dem: [''],
      prt_mnt_dem: [''],
      cod_grp_pret: [''],
      typ_pret: [''],
      cod_etat_pret: [''],
      typ_etat: [''],
      org_pret: [''],
      mod_remb: ['', { value: '', disabled: true }],
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

    })
  }

  ngOnInit() {
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
      this.isSearch = canSearch
      console.log("is search valid", canSearch)

    })

    // Initialize dat_deblocage with today's date (ddMMyyyy for the mask)
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    this.formPretPers.get('dat_deblocage')?.setValue(`${dd}${mm}${yyyy}`);
  }
  ngOnDestroy() {
    // Clear the callback to avoid memory leaks
    this.saveService.clearSaveCallback();
    //this.saveService.setCanSave(false)
  }
  search(item: any) {
    console.log("item :", item);

    // Mise à jour initiale des champs avec l'élément sélectionné
    this.formPretPers.patchValue({
      cod_soc: item.cod_soc,
      mat_pers: item.mat_pers,
      cod_pret: item.cod_pret,
      num_dem_pret: item.num_dem_pret,
      prt_dat_dem: item.prt_dat_dem,
      prt_mnt_dem: item.prt_mnt_dem,
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
      corps: item.corps,
      cod_typ_depart: item.cod_typ_depart,
      nbr_enf: item.nbr_enf,
      prt_dat_acc: item.prt_dat_acc,
      prt_dat_deb: item.prt_dat_deb,
      prt_dat_fin: item.prt_dat_fin,
      prt_ech: item.prt_ech,
      prt_taux: item.prt_taux,
      prt_mnt_glb: item.prt_mnt_glb,
      prt_mnt_prm: item.prt_mnt_prm,
      delai_grace: item.delai_grace,
      prt_int_grace: item.prt_int_grace,
      prt_mnt_rem: item.prt_mnt_rem,
      rem_men: item.rem_men,
      dern_rem_men: item.dern_rem_men,
      prt_rendu: item.prt_rendu,
      prt_rendu_int: item.prt_rendu_int,
      nbr_retenue: item.nbr_retenue,
      dat_deblocage: item.dat_deblocage ? item.dat_deblocage.replace(/\//g, '') : '',
      dat_comptable: item.dat_comptable,
      mode_reglement: item.mode_reglement,
      piece_reglement: item.piece_reglement,
      mnt_report: item.mnt_report,
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
      prt_mnt_debloque: item.prt_mnt_debloque,
      prt_int_tranch: item.prt_int_tranch,
      num_lig_dem_pret: item.num_lig_dem_pret,
      prt_interet: item.prt_interet,
      num_comm: item.num_comm,
      seq_ecrt: item.seq_ecrt,
      num_vir: item.num_vir,
    });




    console.log("this.formPretPers :", this.formPretPers.value)
    if (!item) {
      return;
    }

    // Récupérer les données à partir du service et filtrer par `mat_pers`
    this.serv.getPersonnelCreditByMat(this.token.getUser()?.codSoc, item.mat_pers).subscribe(
      (data: any) => {
        // Trouver l'élément où `mat_pers` correspond
        if (item.dat_deblocage !== "" && item.dat_deblocage !== null) {
          this.formPretPers.get('mod_remb')?.disable();
        } else {
          this.formPretPers.get('mod_remb')?.enable();
        }
        console.log("data :", data)
        if (data) {
          const person = data;
          // Mise à jour des champs avec l'élément correspondant
          this.cnrps = person.numRetr;
          this.nomPers = person.nom;
          this.codLieuGeog = person.codLieuGeog;
          this.LibLieuGeog = person.libLieu;
          this.datEmb = person.datEmb;
          this.DatRetr = person.datRetraite;
          this.codTypDep = person.codTypDepart;
          this.libDeprt = person.libTypDepart;
          this.datNais = person.dateNaissance;
          this.codAffect = person.codAffect;
          this.libAffect = person.libAffect;
          this.codSit = person.codSit;
          this.nbrEnf = person.nbrEnf;

          // Mise à jour des champs dans le formulaire
          this.formPretPers.patchValue({
            mat_pers: person.matPers,
            cod_lieu_geog: person.codLieuGeog,
            cod_typ_depart: person.codTypDepart,
            cod_affect: person.codAffect,
            cod_sit: person.codSit,
            nbr_enf: person.nbrEnf,
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
      if (org) {
        this.libOrg = org.lib_organisme
      }
    });

    this.serv.getDetailPret(this.token.getUser().codSoc).subscribe((data) => {

      const pret = data.find(
        (org) => org.codGrpPret === item.cod_grp_pret && org.typPret === item.typ_pret
      );
      if (pret) {
        console.log("pret :", pret)
        this.libPret = pret.libPret
      }
    });

    this.serv.getValidCommission(this.token.getUser().codSoc).subscribe((data) => {
      const comm = data.find((comm) => comm.num_comm === item.num_comm);
      if (comm) {
        this.libRefComm = comm.ref_comm
      }
    });
  }

  addCredit() {

    // --- Format Dates ---
    const formatDates = (form: any, fields: string[]): void => {
      fields.forEach(field => {
        const ctrl = form.get(field);
        if (ctrl) {
          const formatted = this.formatDate(ctrl.value);
          ctrl.setValue(formatted);
        }
      });
    };

    // Format required dates
    formatDates(this.formPretPers, [
      "dat_deblocage"
    ]);

    console.log("Pret pers", this.formPretPers.value);

    // --- Form validation ---
    if (!this.formPretPers.valid) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Veuillez vérifier tous les champs",
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    // --- Verify dat_deblocage matches sysdate ---
    const todayStr = this.getTodayDDMMYYYYui();
    const enteredDate = this.formPretPers.get('dat_deblocage')?.value;

    // The value in the control is now 'dd/MM/yyyy' because formatDates was called
    if (enteredDate !== todayStr) {
      Swal.fire({
        icon: 'error',
        title: 'Date invalide',
        text: 'La date de déblocage doit être égale à la date système.',
      });
      return;
    }

    // --- Add Credit ---
    this.serv.AjoutCredit(this.formPretPers.value).subscribe(() => {


      const codPretAnt = this.formPretPers.get('cod_pret_ant')?.value;

      if (this.formPretPers.get('mod_remb')?.value !== 'V') {
        if (codPretAnt) {
          this.serv.anticipPret(
            this.token.getUser().codSoc,
            this.formPretPers.get('mat_pers')?.value,
            this.formPretPers.get('cod_pret')?.value,
            codPretAnt
          ).subscribe();
        }
        // Insert line
        this.serv.insertLigPret(
          this.token.getUser().codSoc,
          this.formPretPers.get('mat_pers')?.value,
          this.formPretPers.get('cod_pret')?.value,
          this.formPretPers.get('prt_dat_deb')?.value,
          this.formPretPers.get('prt_dat_fin')?.value,
          this.formPretPers.get('prt_interet')?.value,
          this.formPretPers.get('prt_ech')?.value,
          this.formPretPers.get('prt_mnt_rem')?.value,
          this.formPretPers.get('rem_men')?.value,
          this.formPretPers.get('dern_rem_men')?.value
        ).subscribe(() => {
          this.fetchPretEnCoursData();
        });
      }

      this.fetchPretEnCoursData();

      // Success message
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Crédit ajouté avec succès",
        showConfirmButton: false,
        timer: 2000,
      });

      // Reset form to clean state
      this.formPretPers.reset();

      // Re-initialize dat_deblocage with today's date
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      this.formPretPers.get('dat_deblocage')?.setValue(`${dd}${mm}${yyyy}`);

      // Clear display variables
      this.cnrps = "";
      this.nomPers = "";
      this.libOrg = "";
      this.libPret = "";
      this.libRefComm = "";

      // Re-register the save callback for next operation
      this.saveService.registerSaveCallback(() => this.addCredit());
    });
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
  onSelectedVMat(item: any) {
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
      this.nbrEnf = item.nbrEnf
    this.formPretPers.patchValue({
      mat_pers: item.matPers,
      cod_lieu_geog: item.codLieuGeog,
      cod_typ_depart: item.codTypDepart,
      cod_affect: item.codAffect,

      cod_sit: item.codSit,
      nbr_enf: this.nbrEnf

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



    console.log(this.formPretPers.get('mat_pers')?.value, this.formPretPers.get('cod_grp_pret')?.value, this.formPretPers.get('typ_pret')?.value)
    this.serv.verif_pret_cours(this.token.getUser().codSoc, this.formPretPers.get('mat_pers')?.value, this.formPretPers.get('cod_grp_pret')?.value, this.formPretPers.get('typ_pret')?.value, this.formPretPers.get('prt_dat_deb')?.value).subscribe(
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
    this.serv.verif_dat_acc(this.token.getUser().codSoc, this.formPretPers.get('mat_pers')?.value, this.formPretPers.get('cod_grp_pret')?.value,
      this.formPretPers.get('typ_pret')?.value, this.datEmb, event?.target.value).subscribe((data: any) => {
        this.anc = data.anc
        if (data.nbre > 0) {
          Swal.fire({
            title: 'Ce prêt existe déjà. Veuillez accéder via la modification. ! ',
            icon: 'warning',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'D\'accord',
          })
        }

      })
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

  CalculDetailCredit() {

    const mnt_report = this.formPretPers.get('mnt_report')?.value || 0;
    console.log("mnt_report :", mnt_report)
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
    this.serv.getPretDebl(this.token.getUser().codSoc).subscribe(
      (data: any[]) => {

        // Always reset the list to avoid duplicates on reload
        this.lisPrets = [];

        // Filter only non-débloqués prets
        data.forEach((pret) => {
          if (pret.dat_deblocage === null || pret.dat_deblocage === '') {
            this.lisPrets.push(pret);
          }
        });

        console.log('this.prets:', this.lisPrets);

        this.columnsPret = [
          { key: 'mat_pers', label: 'Matricule' },
          { key: 'nomPers', label: 'Nom & Prénom' },
          { key: 'cod_pret', label: 'Code prêt' },
          { key: 'mod_remb', label: 'Mode de remboursement' },

        ];
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
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
    this.currentIndex = this.lisPrets.length - 1;
    console.log("this.currentIndex", this.currentIndex)
    this.loadData(this.currentIndex);

  }

  loadData(index: number): void {
    const currentData = this.lisPrets[index];
    if (!currentData) {
      return;
    }
    console.log("currentData :", currentData);

    // Mise à jour initiale des champs avec l'élément sélectionné
    this.formPretPers.patchValue({
      cod_soc: currentData.cod_soc,
      mat_pers: currentData.mat_pers,
      cod_pret: currentData.cod_pret,
      num_dem_pret: currentData.num_dem_pret,
      prt_dat_dem: currentData.prt_dat_dem,
      prt_mnt_dem: currentData.prt_mnt_dem,
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
      corps: currentData.corps,
      cod_typ_depart: currentData.cod_typ_depart,
      nbr_enf: currentData.nbr_enf,
      prt_dat_acc: currentData.prt_dat_acc,
      prt_dat_deb: currentData.prt_dat_deb,
      prt_dat_fin: currentData.prt_dat_fin,
      prt_ech: currentData.prt_ech,
      prt_taux: currentData.prt_taux,
      prt_mnt_glb: currentData.prt_mnt_glb,
      prt_mnt_prm: currentData.prt_mnt_prm,
      delai_grace: currentData.delai_grace,
      prt_int_grace: currentData.prt_int_grace,
      prt_mnt_rem: currentData.prt_mnt_rem,
      rem_men: currentData.rem_men,
      dern_rem_men: currentData.dern_rem_men,
      prt_rendu: currentData.prt_rendu,
      prt_rendu_int: currentData.prt_rendu_int,
      nbr_retenue: currentData.nbr_retenue,
      dat_deblocage: currentData.dat_deblocage ? currentData.dat_deblocage.replace(/\//g, '') : '',
      dat_comptable: currentData.dat_comptable,
      mode_reglement: currentData.mode_reglement,
      piece_reglement: currentData.piece_reglement,
      mnt_report: currentData.mnt_report,
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
      prt_mnt_debloque: currentData.prt_mnt_debloque,
      prt_int_tranch: currentData.prt_int_tranch,
      num_lig_dem_pret: currentData.num_lig_dem_pret,
      prt_interet: currentData.prt_interet,
      num_comm: currentData.num_comm,
      seq_ecrt: currentData.seq_ecrt,
      num_vir: currentData.num_vir,
    });
    console.log("this.formPretPers :", this.formPretPers.value)
    // Récupérer les données à partir du service et filtrer par `mat_pers`
    this.serv.getPersonnelCreditByMat(this.token.getUser()?.codSoc, currentData.mat_pers).subscribe(
      (data: any) => {
        // Trouver l'élément où `mat_pers` correspond
        if (currentData.dat_deblocage !== "" && currentData.dat_deblocage !== null) {
          this.formPretPers.get('mod_remb')?.disable();
        } else {
          this.formPretPers.get('mod_remb')?.enable();
        }
        console.log("data :", data)
        if (data && data.length > 0) {
          const person = data[0];
          // Mise à jour des champs avec l'élément correspondant
          this.cnrps = person.numRetr;
          this.nomPers = person.nom;
          this.codLieuGeog = person.codLieuGeog;
          this.LibLieuGeog = person.libLieu;
          this.datEmb = person.datEmb;
          this.DatRetr = person.datRetraite;
          this.codTypDep = person.codTypDepart;
          this.libDeprt = person.libTypDepart;
          this.datNais = person.dateNaissance;
          this.codAffect = person.codAffect;
          this.libAffect = person.libAffect;
          this.codSit = person.codSit;
          this.nbrEnf = person.nbrEnf;

          // Mise à jour des champs dans le formulaire
          this.formPretPers.patchValue({
            mat_pers: person.matPers,
            cod_lieu_geog: person.codLieuGeog,
            cod_typ_depart: person.codTypDepart,
            cod_affect: person.codAffect,
            cod_sit: person.codSit,
            nbr_enf: person.nbrEnf,
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
      if (org) {
        this.libOrg = org.lib_organisme
      }
    });

    this.serv.getDetailPret(this.token.getUser()?.codSoc).subscribe((data) => {

      const pret = data.find(
        (org) => org.codGrpPret === currentData.cod_grp_pret && org.typPret === currentData.typ_pret
      );
      if (pret) {
        console.log("pret :", pret)
        this.libPret = pret.libPret
      }
    });

    this.serv.getValidCommission(this.token.getUser()?.codSoc).subscribe((data) => {
      const comm = data.find((comm) => comm.num_comm === currentData.num_comm);
      if (comm) {
        this.libRefComm = comm.ref_comm
      }
    });
  }

  private getTodayDDMMYYYYui(): string {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
}
