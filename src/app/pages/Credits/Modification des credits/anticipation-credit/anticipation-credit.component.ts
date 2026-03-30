import { Component } from '@angular/core';
import { ModifCreditService } from '../modif-credit.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { SaveService } from 'src/app/shared/Service/save.service';
import { PaginationService } from 'src/app/core/services/pagination.service';

@Component({
  selector: 'app-anticipation-credit',
  templateUrl: './anticipation-credit.component.html',
  styleUrl: './anticipation-credit.component.scss'
})
export class AnticipationCreditComponent {
  p: number = 1

  breadCrumbItems!: Array<{}>;

  formEtatPretPers!: FormGroup
  listPersonnel: any[] = []
  listPret: any[] = []
  columnsPers: any[] = []
  columnsEtatPretPErs: any[] = []
  columnPret: any[] = []
  listVir: any[] = []
  columnVir: any[] = []
  listEtatPretPErs: any[] = []
  listLigPret: any[] = []
  listPretAnticipByMat: any[] = []
  nomPers: string = ''
  libPret: string = ''
  datNais: string = ''
  mntRemb: string = ''
  prtRendu: string = ''
  remMen: string = ''
  prtEch: string = ''
  datDeb: string = ''
  datFin: string = ''
  datEffet: string = ''
  nbrRetenue: string = ''

  typePret: string = ''
  matricule: string = ''
  numVir: string = ''
  numVirControle: string = ''
  nbrMois: string = ''
  restVir: string = ''
  natEtat: string = ''
  valueToggl: number = 0
  isSearch: boolean = true;
  searchfield: boolean = false;
  constructor(private serv: ModifCreditService, private token: TokenStorageService, private fb: FormBuilder, private saveService: SaveService,
    private service: PaginationService
  ) {
    this.formEtatPretPers = this.fb.group({
      cod_soc: [this.token.getUser().codSoc],
      mat_pers: [''],
      cod_pret: [''],
      num_etat_pret: [''],
      dat_effet: [''],
      nat_etat_pret: [''],
      type_anticip: ['P'],
      dat_debut_etat: [''],
      dat_fin_etat: [''],
      mnt_anticipe: [''],
      mnt_capital: [''],
      mnt_interet: [''],
      int_grace: [''],
      mode_payement: ['P'],
      num_piece: [''],
      dat_piece: [''],
      cod_banq: [''],
      cod_agc: [''],
      nom_emet_piece: [''],
      obs_etat: [''],
      cod_etat_pret: [''],
      typ_etat: [''],
      inject: [''],
      num_mvt: [''],
      dat_mvt: [''],
      dat_saisie: [''],
      cod_user: [''],
      cod_grp_pret: [''],
      num_vir: [''],

    })

  }
  ngOnInit() {
    this.getPersonnels()
    this.getEtatPretPers()

    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch = canSearch
      console.log("is search valid", canSearch)

    })
  }
  getEtatPretPers() {
    this.serv.getEtatPretPers().subscribe((data: any) => {
      this.listEtatPretPErs = data
      console.log("this.listEtatPretPErs :", this.listEtatPretPErs)
      this.columnsEtatPretPErs = [
        { key: "cod_pret", label: "Code pêt" },
        { key: "mat_pers", label: "Matricule" },
        { key: "nom", label: "Nom & Prénom" },

      ];
    })
  }
  search(item: any) {
    console.log("item :", item);
    this.searchfield = true
    const datDeb = item.dat_debut_etat.substring(3)
    const datFin = item.dat_fin_etat.substring(3)

    // Mise à jour initiale des champs avec l'élément sélectionné
    this.formEtatPretPers.patchValue({
      cod_soc: item.cod_soc,
      mat_pers: item.mat_pers,
      cod_pret: item.cod_pret,
      num_etat_pret: item.num_etat_pret,
      dat_effet: item.dat_effet,
      nat_etat_pret: item.nat_etat_pret,
      type_anticip: item.type_anticip,
      dat_debut_etat: datDeb,
      dat_fin_etat: datFin,
      mnt_anticipe: item.mnt_anticipe,
      mnt_capital: item.mnt_capital,
      mnt_interet: item.mnt_interet,
      int_grace: item.int_grace,
      mode_payement: item.mode_payement,
      num_piece: item.num_piece,
      dat_piece: item.dat_piece,
      cod_banq: item.cod_banq,
      cod_agc: item.cod_agc,
      nom_emet_piece: item.nom_emet_piece,
      obs_etat: item.obs_etat,
      cod_etat_pret: item.cod_etat_pret,
      typ_etat: item.typ_etat,
      inject: item.inject,
      num_mvt: item.num_mvt,
      dat_mvt: item.dat_mvt,
      dat_saisie: item.dat_saisie,
      cod_user: item.cod_user,
      cod_grp_pret: item.cod_grp_pret,
      num_vir: item.num_vir,

    });
    this.matricule = item.mat_pers
    const [moisDeb, anneeDeb] = datDeb.split('/').map(Number);
    const [moisFin, anneeFin] = datFin.split('/').map(Number);

    // Calcul de la différence en mois
    const diffMois = (anneeFin - anneeDeb) * 12 + (moisFin - moisDeb);

    console.log("Nombre de mois:", diffMois);
    this.nbrMois = diffMois.toString()
    if (item.cod_etat_pret == 'AT') {
      this.natEtat = 'AT'
    } else if (item.cod_etat_pret == 'AM') {
      this.natEtat = 'AP'
    }
    this.serv.getPersonnelAnticipByMat(item.cod_soc, item.mat_pers).subscribe((data: any) => {
      this.nomPers = data.nom
      this.datNais = data.dat_nais
    })


    this.serv.getPretAnticipByPret(item.cod_soc, item.mat_pers, item.cod_pret).subscribe((response: any) => {

      this.listPretAnticipByMat = response
      console.log(this.listPretAnticipByMat)
      this.typePret = response.typ_pret
      this.libPret = response.lib_pret
      this.mntRemb = Number(response.prt_mnt_rem).toFixed(3);
      this.prtRendu = Number(response.prt_rendu).toFixed(3);
      this.remMen = Number(response.rem_men).toFixed(3);
      this.prtEch = response.prt_ech
      this.datDeb = response.prt_dat_deb;
      this.datFin = response.prt_dat_fin;
      this.nbrRetenue = response.nbr_retenue;
    })
    this.serv.getLigPRet(item.cod_soc, item.mat_pers, item.cod_pret).subscribe((data: any) => {
      this.listLigPret = data
    })


  }
  getPersonnels() {
    this.serv.getPersonnelAnticip(this.token.getUser().codSoc).subscribe((data: any) => {
      this.listPersonnel = data
      this.columnsPers = [
        { key: "mat_pers", label: "Matricule" },
        { key: "nom", label: "Nom & Prénom" },

      ];
    })
  }

  onSelectedVMat(item: any) {
    console.log("item :", item)

    this.nomPers = item.nom,
      this.datNais = item.dat_nais
    this.formEtatPretPers.patchValue({
      mat_pers: item.mat_pers
    })
    this.serv.getPretAnticip(this.token.getUser().codSoc, item.mat_pers).subscribe((data: any) => {
      this.listPret = data
      this.columnPret = [
        { key: "cod_pret", label: "Code prêt" },
        { key: "typ_pret", label: "Type prêt" },
        { key: "lib_pret", label: "Lib prêt" }
      ]
    })
    this.serv.getVirAnticipByMat(item.mat_pers).subscribe((data: any) => {
      this.listVir = data
      console.log(' get lis num vir', this.listVir)
      this.columnVir = [
        { key: "num_vir", label: "Numéro" },
        { key: "ref_metier", label: "Ref metier" },

      ];
    })
  }

  //   onSelectTypPret(item:any){
  // this.libPret=item.lib_pret
  // this.datDeb=item.prt_dat_deb
  // this.datFin=item.prt_dat_fin
  // this.datEffet=item.dat_effet
  // this.mntRemb=parseFloat(Number(item.prt_mnt_rem).toFixed(3));
  // this.prtEch=item.prt_ech
  // this.prtRendu=item.prt_rendu
  // this.remMen=item.rem_men
  //   }

  onSelectTypPret(item: any) {
    this.libPret = item.lib_pret;
    this.datDeb = item.prt_dat_deb;
    this.datFin = item.prt_dat_fin;
    this.nbrRetenue = item.nbr_retenue;

    this.datEffet = item.dat_effet;
    this.prtEch = item.prt_ech;

    // Assigner sous forme de string avec format 3 décimales
    this.mntRemb = Number(item.prt_mnt_rem).toFixed(3);
    this.prtRendu = Number(item.prt_rendu).toFixed(3);
    this.remMen = Number(item.rem_men).toFixed(3);
    this.formEtatPretPers.patchValue({
      cod_pret: item.cod_pret,
      dat_effet: item.dat_effet,
      cod_grp_pret: item.cod_grp_pret
    })
  }
  onSelectedNumVir(item: any) {
    this.restVir = item.rest_vir
    this.numVirControle = item.num_vir
    this.formEtatPretPers.patchValue({
      num_vir: item.num_vir
    })
  }
  OnchangeDatFin() {
    const datFin = this.formEtatPretPers.get('dat_fin_etat')?.value;
    const datDebEtat = this.formEtatPretPers.get('dat_debut_etat')?.value;
    const typeAnticip = this.formEtatPretPers.get('type_anticip')?.value;

    console.log("OnchangeDatFin debug:", { datFin, datDebEtat, typeAnticip, datDeb: this.datDeb });

    if (!datFin || !datDebEtat) return;

    const parseMMYYYY = (val: string) => {
      if (!val) return { m: NaN, y: NaN };
      const clean = val.replace(/\D/g, '');
      if (clean.length === 6) {
        return { m: Number(clean.substring(0, 2)), y: Number(clean.substring(2)) };
      }
      if (clean.length === 8) {
        return { m: Number(clean.substring(2, 4)), y: Number(clean.substring(4)) };
      }
      if (val.includes('/')) {
        const parts = val.split('/');
        if (parts.length === 3) return { m: Number(parts[1]), y: Number(parts[2]) };
        if (parts.length === 2) return { m: Number(parts[0]), y: Number(parts[1]) };
      }
      return { m: NaN, y: NaN };
    };

    const parsedFin = parseMMYYYY(datFin);
    const mFin = parsedFin.m;
    const yFin = parsedFin.y;

    const parsedDebEtat = parseMMYYYY(datDebEtat);
    const mDebEtat = parsedDebEtat.m;
    const yDebEtat = parsedDebEtat.y;

    if (isNaN(mFin) || isNaN(yFin) || isNaN(mDebEtat) || isNaN(yDebEtat)) {
      console.warn("Invalid date parts detected:", { datFin, datDebEtat });
      this.nbrMois = '';
      return;
    }

    console.log("Parsed months clean:", { mFin, yFin, mDebEtat, yDebEtat });

    // Parse prt_dat_deb
    const parsedPrtDeb = parseMMYYYY(this.datDeb || '');
    const mPrtDeb = parsedPrtDeb.m || 0;
    const yPrtDeb = parsedPrtDeb.y || 0;

    const dateFinVal = yFin * 12 + mFin;
    const dateDebEtatVal = yDebEtat * 12 + mDebEtat;
    const datePrtDebVal = yPrtDeb * 12 + mPrtDeb;

    const today = new Date();
    const todayVal = today.getFullYear() * 12 + (today.getMonth() + 1);

    // 1. Check Mois Invalide (dat_fin_etat < prt_dat_deb or dat_fin_etat < dat_debut_etat)
    if (dateFinVal < datePrtDebVal || dateFinVal < dateDebEtatVal) {
      if (datePrtDebVal > 0) { // Only show if we actually have loan start date
        Swal.fire({
          title: 'Message',
          text: 'Mois Invalide ..!!!',
          icon: 'error'
        });
        this.formEtatPretPers.get('dat_fin_etat')?.setValue('');
        this.nbrMois = '';
        return;
      }
    }

    // 2. Date fin >= Date en cours
    if (dateFinVal < todayVal) {
      Swal.fire({
        title: 'Message',
        text: 'Date fin doit être >= à Date en cours',
        icon: 'warning'
      });
    }

    // 3. Date fin >= Date debut
    if (dateFinVal < dateDebEtatVal) {
      Swal.fire({
        title: 'Message',
        text: 'Date fin doit être >= à Date début',
        icon: 'error'
      });
      this.formEtatPretPers.get('dat_fin_etat')?.setValue('');
      this.nbrMois = '';
      return;
    }

    // Side effects logic
    if (typeAnticip !== 'M') {
      // Calculate nbr_mois
      const diffMois = (yFin - yDebEtat) * 12 + (mFin - mDebEtat) + 1;
      console.log("Calculated diffMois:", diffMois);
      this.nbrMois = isNaN(diffMois) ? '' : diffMois.toString();

      // Call controller
      this.serv.Controller(this.token.getUser().codSoc, this.formEtatPretPers.get('mat_pers')?.value,
        this.formEtatPretPers.get('cod_pret')?.value, this.datDeb, this.datFin).subscribe((data: any) => {
          if (data.message) {
            Swal.fire('Message', data.message, data.message.includes('probléme') ? 'error' : 'info');
          }
        });

      // Call calcul_ant_part
      this.serv.calcul_ant_part(
        this.token.getUser().codSoc,
        this.formEtatPretPers.get('mat_pers')?.value,
        this.formEtatPretPers.get('cod_pret')?.value,
        this.formEtatPretPers.get('dat_debut_etat')?.value,
        this.formEtatPretPers.get('dat_fin_etat')?.value,
        this.formEtatPretPers.get('type_anticip')?.value
      ).subscribe((data: any) => {
        if (data) {
          const safeNum = (val: any) => {
            const n = Number((val + '').replace(',', '.'));
            return isNaN(n) ? '0.000' : n.toFixed(3);
          };
          this.formEtatPretPers.patchValue({
            mnt_anticipe: safeNum(data.mnt_anticipe),
            mnt_capital: safeNum(data.mnt_capital),
            mnt_interet: safeNum(data.mnt_interet),
            int_grace: safeNum(data.int_grace),
          });
        }
      });
    }
  }

  OnchangeEtatPret(event: any) {
    this.getNatEtat(event)
    if (this.formEtatPretPers.get('type_anticip')?.value == 'P') {
      this.serv.Controller(this.token.getUser().codSoc, this.formEtatPretPers.get('mat_pers')?.value,
        this.formEtatPretPers.get('cod_pret')?.value, this.datDeb, this.datFin).subscribe((data: any) => {
          if (data.message) {
            Swal.fire({
              title: 'Message',
              text: data.message,
              icon: data.message.includes('probléme') ? 'error' : 'info',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'OK',
            });
          }
        });

      this.serv.periode_ant_tot(this.token.getUser().codSoc, this.formEtatPretPers.get('mat_pers')?.value,
        this.formEtatPretPers.get('cod_pret')?.value).subscribe((data: any) => {
          this.formEtatPretPers.patchValue({
            dat_debut_etat: data.dat_deb_etat_,
            dat_fin_etat: data.dat_fin_etat_,
          })
          this.nbrMois = data.nbr_mois_
          if (data.message) {
            Swal.fire({
              title: 'Message',
              text: data.message,
              icon: 'info',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'OK',
            });
          }

          this.serv.calcul_ant_part(
            this.token.getUser().codSoc,
            this.formEtatPretPers.get('mat_pers')?.value,
            this.formEtatPretPers.get('cod_pret')?.value,
            this.formEtatPretPers.get('dat_debut_etat')?.value,
            this.formEtatPretPers.get('dat_fin_etat')?.value,
            this.formEtatPretPers.get('type_anticip')?.value
          ).subscribe((data: any) => {
            console.log('Résultat de calcul_ant_part:', data);

            const safeNum = (val: any) => {
              const n = Number((val + '').replace(',', '.'));
              return isNaN(n) ? '0.000' : n.toFixed(3);
            };
            this.formEtatPretPers.patchValue({
              mnt_anticipe: safeNum(data.mnt_anticipe),
              mnt_capital: safeNum(data.mnt_capital),
              mnt_interet: safeNum(data.mnt_interet),
              int_grace: safeNum(data.int_grace),
            });
          });

        });


    }
  }

  onToggleChange(event: Event) {
    const toggle = event.target as HTMLInputElement;
    const value = toggle.checked ? 2 : 1;
    this.valueToggl = value
    console.log('Valeur sélectionnée :', value);
    if (value == 1) {
      this.serv.periode_ant_tot(this.token.getUser().codSoc, this.formEtatPretPers.get('mat_pers')?.value,
        this.formEtatPretPers.get('cod_pret')?.value).subscribe((data: any) => {
          this.formEtatPretPers.patchValue({
            dat_debut_etat: data.dat_deb_etat_,
            dat_fin_etat: data.dat_fin_etat_,
          })
          this.nbrMois = data.nbr_mois_
          if (data.message) {
            Swal.fire({
              title: 'Message',
              text: data.message,
              icon: 'info',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'OK',
            });
          }

          this.serv.calcul_ant_part(this.token.getUser().codSoc, this.formEtatPretPers.get('mat_pers')?.value,
            this.formEtatPretPers.get('cod_pret')?.value, this.formEtatPretPers.get('dat_debut_etat')?.value, this.formEtatPretPers.get('dat_fin_etat')?.value, this.formEtatPretPers.get('type_anticip')?.value).subscribe((data: any) => {
              const safeNum = (val: any) => {
                const n = Number((val + '').replace(',', '.'));
                return isNaN(n) ? '0.000' : n.toFixed(3);
              };
              this.formEtatPretPers.patchValue({
                mnt_anticipe: safeNum(data.mnt_anticipe),
                mnt_capital: safeNum(data.mnt_capital),
                mnt_interet: safeNum(data.mnt_interet),
                int_grace: safeNum(data.int_grace),
              })
            });
        });
    } else if (value == 2 && this.formEtatPretPers.get('cod_etat_pret')?.value != 'AT') {
      this.formEtatPretPers.patchValue({
        dat_debut_etat: '',
        dat_fin_etat: '',
        mnt_anticipe: '',
        mnt_capital: '',
        mnt_interet: '',

      })
      this.nbrMois = ''
      this.formEtatPretPers.get('dat_debut_etat')?.enable();
      this.formEtatPretPers.get('dat_fin_etat')?.enable();

    }
    else if (value == 2 && this.formEtatPretPers.get('cod_etat_pret')?.value == 'AT') {
      this.formEtatPretPers.patchValue({
        dat_debut_etat: '',
        mnt_anticipe: '',
        mnt_capital: '',
        mnt_interet: '',

      })
      this.formEtatPretPers.get('dat_debut_etat')?.enable();
      this.nbrMois = ''
    }
  }
  getNatEtat(item: any) {
    if (item.target.value == 'AT') {
      this.natEtat = 'AT'
    } else if (item.target.value == 'AM') {
      this.natEtat = 'AP'
    }
  }
  valider() {


    console.log(this.formEtatPretPers.getRawValue())
    this.serv.Valider(this.formEtatPretPers.get("cod_soc")?.value, this.formEtatPretPers.get("mat_pers")?.value, this.formEtatPretPers.get("cod_pret")?.value, this.formEtatPretPers.get("mode_payement")?.value,
      this.natEtat, this.formEtatPretPers.get("type_anticip")?.value, this.formEtatPretPers.get("dat_debut_etat")?.value, this.formEtatPretPers.get("dat_fin_etat")?.value,
      this.formEtatPretPers.get("mnt_capital")?.value, this.formEtatPretPers.get("mnt_anticipe")?.value, this.formEtatPretPers.get("mnt_interet")?.value, this.prtRendu).subscribe((data: any) => {
        console.log("data :", data)
        if (data.message) {
          Swal.fire({
            title: 'Message',
            text: data.message,
            icon: 'info',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });
        }
        this.serv.getLigPRet(this.formEtatPretPers.get("cod_soc")?.value, this.formEtatPretPers.get("mat_pers")?.value, this.formEtatPretPers.get("cod_pret")?.value).subscribe((data: any) => {
          this.listLigPret = data
        })
      })
  }

  AddEtatPretPers() {

    if (this.formEtatPretPers.get('mode_payement')?.value == 'P' && this.numVirControle == '') {
      Swal.fire({
        title: 'Message',
        text: 'Pour ce Mode de payement il faut saisir le N° de Virement',
        icon: 'info',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
    }
    else if (this.formEtatPretPers.get('num_piece')?.value == '' && this.formEtatPretPers.get('mode_payement')?.value == 'C') {
      Swal.fire({
        title: 'Message',
        text: 'N° DE CHEQUE EST OBLIGATOIRE !!!',
        icon: 'info',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
    } else {
      const prefixDate = (val: string) => {
        if (!val) return '';
        const cleaned = val.replace(/\//g, '').trim();

        if (cleaned.length === 6) { // MMYYYY
          const mm = cleaned.substring(0, 2);
          const yyyy = cleaned.substring(2, 6);
          return `01/${mm}/${yyyy}`;
        }

        if (cleaned.length === 8) { // DDMMYYYY
          const dd = cleaned.substring(0, 2);
          const mm = cleaned.substring(2, 4);
          const yyyy = cleaned.substring(4, 8);
          return `${dd}/${mm}/${yyyy}`;
        }

        // If it already looks like it has slashes, try to preserve it but ensure it's not a broken format
        if (val.includes('/') && val.split('/').length === 2) { // MM/YYYY
          return '01/' + val.trim();
        }

        return val;
      };

      this.formEtatPretPers.patchValue({
        nat_etat_pret: this.natEtat
      });
      this.serv.getnuEtatPret(this.token.getUser().codSoc).subscribe((data: any) => {
        this.formEtatPretPers.patchValue({
          num_etat_pret: data
        })
        const rawValues = this.formEtatPretPers.getRawValue();
        const dataToSend: any = {};


        const numericFields = ['mnt_anticipe', 'mnt_capital', 'mnt_interet', 'int_grace', 'num_etat_pret', 'num_vir', 'inject', 'num_mvt', 'cod_grp_pret', 'cod_pret'];

        Object.keys(rawValues).forEach(key => {
          let val = rawValues[key];

          // 1. Trim strings
          if (typeof val === 'string') val = val.trim();

          // 2. Handle Empty / NaN
          if (val === '' || val === 'NaN' || val === undefined) {
            val = null;
          }

          // 3. Numeric conversion
          if (numericFields.includes(key)) {
            if (val !== null) {
              const num = Number((val + '').replace(',', '.'));
              val = isNaN(num) ? 0 : num;
            } else {
              val = 0;
            }
          }

          // 4. Date Prefixing (Only for the request payload)
          if ((key === 'dat_debut_etat' || key === 'dat_fin_etat') && val !== null) {
            val = prefixDate(val);
          }

          dataToSend[key] = val;
        });

        console.log("Final payload (dd/MM/yyyy):", JSON.stringify(dataToSend, null, 2));

        this.serv.AddEtatPretPers(dataToSend).subscribe((data => {
          console.log("Response from AddEtatPretPers:", data)
          this.formEtatPretPers.patchValue({
            dat_debut_etat: this.formatToMonthYear(data.dat_debut_etat),
            dat_fin_etat: this.formatToMonthYear(data.dat_fin_etat)
          })
          Swal.fire({
            title: 'Message',
            text: "Ajout Effectuer avec succés",
            icon: 'success',
            confirmButtonColor: '#3085d6',
            position: 'top-right'
          });
        }))
        console.log("Add data :", this.formEtatPretPers.getRawValue())

      })

    }
  }
  formatToMonthYear(dateStr: any): string {
    if (!dateStr) return '';
    try {
      let date: Date;
      if (typeof dateStr === 'string' && dateStr.includes('/')) {
        const parts = dateStr.split('/');
        // Expecting [dd, mm, yyyy]
        if (parts.length === 3) {
          date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        } else if (parts.length === 2) {
          // mm/yyyy
          date = new Date(Number(parts[1]), Number(parts[0]) - 1, 1);
        } else {
          date = new Date(dateStr);
        }
      } else {
        date = new Date(dateStr);
      }

      if (isNaN(date.getTime())) return '';

      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const y = date.getFullYear();
      return `${m}/${y}`;
    } catch (e) {
      console.error("formatToMonthYear error:", e, dateStr);
      return '';
    }
  }


  onPageChangeForGouv(page: number): void {
    console.log("Pagination pour le tableau 1 : ", page);

    this.p = page;

  }
  onSort(column: any) {
    this.listLigPret = this.service.onSort(column, this.listLigPret);
  }
}
