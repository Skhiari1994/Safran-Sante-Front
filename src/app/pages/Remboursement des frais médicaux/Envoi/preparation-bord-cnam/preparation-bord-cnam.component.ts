
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { CotisationService } from 'src/app/pages/Cotisation/cotisation.service';
import { EnvoiServiceService } from '../envoi-service.service';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { catchError, forkJoin, map, of, tap } from 'rxjs';
import { forEach } from 'lodash';


@Component({
  selector: 'app-preparation-bord-cnam',
  templateUrl: './preparation-bord-cnam.component.html',
  styleUrl: './preparation-bord-cnam.component.scss'
})
export class PreparationBordCnamComponent {

  listDem: any;
  selectedRows: any;
  listBord: any;
  pSusp: any;
  codAssur: any;
  requestData!: { pCodAssur: string; pCodSoc: string; pChoix: string; pDatSaisie: string; pTotNet: string; pDatSoin: string; pNumFam: string; pMatPers: string; };
  listBordValid: any;
  listBordBultS: any;
  codBordBs: any;


  getValueModPay(arg0: any) {
    throw new Error('Method not implemented.');
  }
  getValueEtatCot(arg0: any) {
    throw new Error('Method not implemented.');
  }
  onCorpsChange($event: any) {
    throw new Error('Method not implemented.');
  }
  ChargActInx() {
    throw new Error('Method not implemented.');
  }
  imageURL: string | undefined;
  isReadOnly: boolean = true;  // Set to 'true' to visually make it readonly
  rowActive: boolean = true;
  rowActiveT: boolean = true;
  dataRows!: any[];
  listDataFiltred!: any[];

  listActivite!: any[];
  CarteSoinList!: any[];
  filteredDataRows: any
  filteredDataCarteSoint: any
  codeField: string = "cod_natp";
  codLieu: string = "cod_lieu_geog";
  codAffect: string = "cod_affect";
  codTypDepart: string = "cod_typ_depart";
  codBanque: string = "cod_banq";
  codAgence: string = "cod_agc";
  codPost: string = "cod_poste";
  codGouv: string = "cod_gouv";
  codNatP?: String = "";
  codLieuVal?: string;
  codAffectVal?: string;
  codTypDepartVal?: string;
  codBanqueVal?: string;
  codAgenceVal?: string;
  codPostVal?: string;
  codGouvVal?: string;
  codMatVal?: string;
  codActiviteVal?: string;
  codBord: string = "";

  breadCrumbItems!: Array<{}>;

  ////////////////////////lib


  libNat: string = "";
  libLieu: string = "";
  libAffect: string = "";
  libTypDepart: string = "";
  libBanque: string = "";
  libAgence: string = "";
  libGouv: string = "";
  libPoste: string = "";
  libMatInt: string = "";
  libActivite: string = "";
  libNom: string = "";



  bordEnvoiForm!: FormGroup;
  bordEnvoiConsForm!: FormGroup;
  formAdherent!: FormGroup;
  save!: boolean;
  isDisabled!: boolean;
  sysdate: string = "";
  masterSelected!: boolean;

  file!: File;

  isSearch: boolean = true;

  errorMessageMat!: any;
  rows: any;
  searchResults: any;
  allcompany: any;
  searchTerm: any;
  company?: any[] | undefined;



  listCodBord: any[] = [];
  columnsBord: any[] = [];

  listCodAssur: any[] = [];
  columnsAssur: any[] = [];

  columnAffect!: { key: string; label: string; }[];
  listAffectation!: any[];
  listTypeDepart!: any[];
  columnsTypDepart!: { key: string; label: string; }[];
  checkedValGet!: any[];
  isRemoveActionsVisible!: boolean;
  columnsSearch!: { key: string; label: string; }[];
  listTypDon: any;
  columnsNat: any;
  typDonVal: any;
  libNatDon: any;
  concern: any;
  demandeDonsForm: any;
  formCotisMutPersForm: any;
  corpsList: any;


  columnTitles: { [key: string]: string } = {
    mat_pers: "Matricule",
    nom_prenom: "Nom et prénom",  // ✅ Correct
    cod_fil: "Fill",
    num_fam: "Prést",
    nom: "Nom",  // ✅ Correct
    dat_saisie: "Date saisie",
    dat_soin: "Date Soin",
    sold: "Solde",
    mnt_honor: "Totale Hr",
    mnt_tot: "Totale CNAM",
    mnt_tot_mut: "Totale Mut",
    choix: "Choix"
  };
  constructor(private changeDetector: ChangeDetectorRef, private tokenStorage: TokenStorage, public service: PaginationService, private adherentServ: AdherentService, private envoiServ: EnvoiServiceService, private fb: FormBuilder, private saveService: SaveService, private modalService: NgbModal) {





  }
  ngOnInit() {
    // Initialize arrays to prevent forEach errors
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    this.sysdate = `${dd}/${mm}/${yyyy}`;

    this.bordEnvoiForm = this.fb.group({

      cod_bord: [''],
      dat_bord: [this.sysdate],
      cod_assur: [''],
      lib_assur: [''],
      dat_deb: [''],
      dat_fin: [''],
      nbr_bult: [''],
      tot_honor: [''],
      tot_net: ['']
    });

    this.bordEnvoiConsForm = this.fb.group({
      cod_assur: [''],
      lib_assur: [''],
      dat_deb: [''],
      dat_fin: ['']
    });





    this.saveService.canSave$.subscribe((canSave) => {
      this.save = canSave;
      if (this.save) {
        // this.submit();
        //   this.onSubmit()
      }
    });

    /*  this.formCotisMutPersForm.valueChanges.subscribe(() => {
      // this.isDisabled = this.formCotisMutPersForm.pristine;
       this.saveService.setDisabled(this.isDisabled);
     }); */

    ///////////////////////////save
    this.saveService.registerSaveCallback(() => this.saveUpdates());

    this.saveService.add$.subscribe((addBord) => {

      this.rowActive = addBord
    })

    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch = canSearch

      console.log("is search valid", canSearch)

    })

    this.getCodBord()
    this.getCodAssur()
  }

  ngOnDestroy() {
    // Clear the callback to avoid memory leaks
    this.saveService.clearSaveCallback();
    this.saveService.setIsSearch(false)

  }

  getCodBord() {
    // Initialize FIRST to prevent undefined errors
    this.columnsSearch = [
      { key: "cod_bord", label: "Code Borderau" },
      { key: "dat_bord", label: "Date Bord" },
    ];

    this.envoiServ.getCodBord('01').subscribe((data) => {
      console.log("getCodBord", data);
      this.listCodBord = data;
    });
  }

  onSelectedValueCodAssur(item: any) {
    console.log("item:", item);
    this.rowActiveT = false;
    this.codAssur = item.cod_assur;

    this.bordEnvoiConsForm.patchValue({
      lib_assur: item.lib_assur
    });

    const datDeb = this.formatDate(this.bordEnvoiConsForm.get("dat_deb")?.value);
    const datFin = this.formatDate(this.bordEnvoiConsForm.get("dat_fin")?.value);

    console.log("datDeb:", datDeb, "datFin:", datFin);

    this.envoiServ.consultationBultSoin(
      this.tokenStorage.getUser().codSoc,
      item.cod_assur,
      datDeb,
      datFin
    ).subscribe({
      next: (data) => {
        console.log("Initial data from consultationBultSoin:", data);

        // Clear previous data
        this.listBordValid = [];
        this.listBordBultS = [];

        if (!data || data.length === 0) {
          this.listBord = [];
          console.warn("No data returned from consultationBultSoin");
          return;
        }

        this.listBord = data;

        // Use forkJoin to fetch additional data for each bulletin
        forkJoin(
          this.listBord.map((row: any) =>
            this.envoiServ.totauCnam(
              this.tokenStorage.getUser().codSoc,
              row.mat_pers,
              row.num_fam,
              row.dat_soin
            ).pipe(
              map((apiData) => ({
                ...row, // Keep all existing properties
                sold: apiData.asold || 0,
                mnt_honor: apiData.xmnt_honor || 0,
                mnt_tot: apiData.ymnt_tot || 0,
                mnt_tot_mut: apiData.zMNT_TOT_MUT || 0,
                choix: 'O' // Default selection
              })),
              catchError((error) => {
                console.error('Error fetching totals for row:', row, error);
                return of({
                  ...row,
                  sold: 0,
                  mnt_honor: 0,
                  mnt_tot: 0,
                  mnt_tot_mut: 0,
                  choix: 'O'
                });
              })
            )
          )
        ).subscribe({
          next: (updatedList) => {
            this.listBord = updatedList;
            console.log('Updated list with calculated totals:', this.listBord);

            // Build the valid bulletins list
            this.listBordValid = this.listBord.filter((row: any) => row.choix === 'O');

            // Build the request data list
            this.listBordBultS = this.listBordValid.map((row: any) => ({
              pCodAssur: item.cod_assur,
              pCodSoc: this.tokenStorage.getUser().codSoc,
              pChoix: 'O',
              pDatSaisie: row.dat_saisie,
              pTotNet: row.tot_net,
              pDatSoin: row.dat_soin,
              pNumFam: row.num_fam,
              pMatPers: row.mat_pers
            }));

            console.log('Valid bulletins:', this.listBordValid);
            console.log('Request data list:', this.listBordBultS);
          },
          error: (error) => {
            console.error('Error in forkJoin:', error);
            this.listBord = [];
          }
        });
      },
      error: (error) => {
        console.error('Error calling consultationBultSoin:', error);
        this.listBord = [];
      }
    });
  }
  updateChoix(data: any) {
    console.log(`Updated choix for ${data.mat_pers}:`, data.choix);
    console.log("data list  :", this.listBord)
    this.saveService.setDisabled(true)
  }


  getCodAssur() {
    this.envoiServ.getAssur().subscribe((data) => {
      console.log("getAssur", data);
      this.listCodAssur = data;
      this.columnsAssur = [
        { key: "cod_assur", label: "Code Assurance" },
        { key: "lib_assur", label: "Libéllé" },
      ];
    });

  }

  CreationBord() {
    const selectedBults = this.listBord.filter((row: { choix: string }) => row.choix === 'O');
    const nbrBult = selectedBults.length;

    if (nbrBult === 0) {
      Swal.fire('Avertissement', 'Aucun bulletin sélectionné.', 'warning');
      return;
    }

    if (!this.codAssur) {
      Swal.fire('Avertissement', 'Veuillez sélectionner une assurance.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Traitement...',
      text: 'Génération du code bordereau et affectation aux bulletins...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    // Enhanced date formatting function
    const formatToFR = (dateInput: any): string => {
      if (!dateInput) return '';
      if (dateInput.year && dateInput.month && dateInput.day) {
        return `${String(dateInput.day).padStart(2, '0')}/${String(dateInput.month).padStart(2, '0')}/${dateInput.year}`;
      }
      if (typeof dateInput === 'string') {
        if (dateInput.length === 8 && /^\d{8}$/.test(dateInput)) {
          const dd = dateInput.substring(0, 2), mm = dateInput.substring(2, 4), yyyy = dateInput.substring(4, 8);
          return `${dd}/${mm}/${yyyy}`;
        }
        const parts = dateInput.split('/');
        if (parts.length === 3) return dateInput;
        if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [yyyy, mm, dd] = dateInput.split('-');
          return `${dd}/${mm}/${yyyy}`;
        }
      }
      if (dateInput instanceof Date) {
        const year = dateInput.getFullYear(), month = String(dateInput.getMonth() + 1).padStart(2, '0'), day = String(dateInput.getDate()).padStart(2, '0');
        return `${day}/${month}/${year}`;
      }
      return '';
    };

    const formatToISO = (dateInput: any): string => {
      if (!dateInput) return '';
      if (dateInput.year && dateInput.month && dateInput.day) {
        return `${dateInput.year}-${String(dateInput.month).padStart(2, '0')}-${String(dateInput.day).padStart(2, '0')}`;
      }
      if (typeof dateInput === 'string') {
        if (dateInput.length === 8 && /^\d{8}$/.test(dateInput)) {
          const dd = dateInput.substring(0, 2), mm = dateInput.substring(2, 4), yyyy = dateInput.substring(4, 8);
          return `${yyyy}-${mm}-${dd}`;
        }
        const parts = dateInput.split('/');
        if (parts.length === 3) {
          const [dd, mm, yyyy] = parts;
          return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
        }
        if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) return dateInput;
      }
      if (dateInput instanceof Date) {
        const year = dateInput.getFullYear(), month = String(dateInput.getMonth() + 1).padStart(2, '0'), day = String(dateInput.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      return '';
    };

    const datDebRaw = this.bordEnvoiConsForm.get('dat_deb')?.value || '';
    const datFinRaw = this.bordEnvoiConsForm.get('dat_fin')?.value || '';

    const datDeb = formatToFR(datDebRaw);
    const datFin = formatToFR(datFinRaw);

    console.log('➡ Generation Debug:', { datDebRaw, datFinRaw, datDeb, datFin, codAssur: this.codAssur });

    const totHonor = this.getTotalHonor();
    const totNet = this.getTotalTot();

    this.envoiServ.generateCodeBord(
      this.codAssur,
      this.tokenStorage.getUser().codSoc,
      datDeb,
      datFin,
      nbrBult,
      totHonor,
      totNet
    ).subscribe({
      next: (codBord) => {
        this.codBordBs = codBord;
        console.log('✔ Code Bord généré :', codBord);

        let ordBult = 1;
        const calls = selectedBults.map((bulletin: any) => {
          console.log('🔄 Processing bulletin:', bulletin.mat_pers, 'datSoin (ISO):', formatToISO(bulletin.dat_soin));
          return this.envoiServ.processBulletins(
            codBord,
            bulletin.mat_pers,
            this.tokenStorage.getUser().codSoc,
            formatToISO(bulletin.dat_soin),  // Handle LocalDate object
            bulletin.num_fam,
            ordBult++,
            bulletin.mnt_honor,
            bulletin.mnt_tot
          );
        });

        forkJoin(calls).subscribe({
          next: (results) => {
            console.log('✅ Tous les bulletins traités avec succès:', results);
            Swal.fire({
              title: 'Succès !',
              text: `Traitement de ${nbrBult} bulletin(s) terminé.`,
              icon: 'success',
              confirmButtonText: 'OK'
            });

            this.listBord = this.listBord.map((row: { choix: string }) =>
              row.choix === 'O' ? { ...row, cod_bord: codBord } : row
            );

            this.codBord = codBord;
            this.bordEnvoiForm.patchValue({ cod_bord: codBord });
            this.getCodBord();

            this.envoiServ.findBultEnvoiByCodBord(
              this.tokenStorage.getUser().codSoc,
              codBord,
              this.codAssur
            ).subscribe((data) => {
              const normalized = (data || []).map((row: any) => ({
                ...row,
                nom_prenom: row.nom_prenom ?? row.nom_complet_pers ?? row.nom_prenom,
                nom: row.nom ?? row.nom_adherent ?? row.nom
              }));
              this.listBord = normalized;

              forkJoin(
                this.listBord.map((row: any) =>
                  this.envoiServ.totauCnam(
                    this.tokenStorage.getUser().codSoc,
                    row.mat_pers,
                    row.num_fam,
                    row.dat_soin
                  ).pipe(
                    map((apiData) => ({
                      ...row,
                      sold: apiData.asold || 0,
                      mnt_honor: apiData.xmnt_honor || 0,
                      mnt_tot: apiData.ymnt_tot || 0,
                      mnt_tot_mut: apiData.zMNT_TOT_MUT || 0,
                      choix: row.choix || 'O'
                    }))
                  )
                )
              ).subscribe((updatedList) => {
                this.listBord = updatedList;
              });
            });
          },
          error: (err) => {
            console.error('❌ Erreur lors du traitement des bulletins :', err);
            Swal.fire('Erreur', 'Erreur lors du traitement des bulletins.', 'error');
            this.getCodBord();
          }
        });
      },
      error: (err) => {
        console.error('❌ Erreur génération code bordereau :', err);
        Swal.fire('Erreur', 'Erreur lors de la génération du code bordereau.', 'error');
      }
    });
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


  openModal(targetModal: any, adr: any): void {
    this.modalService.open(targetModal, {
      windowClass: "my-class",
      centered: true,
    });

  }

  openModalAdd(targetModal: any): void {

    this.modalService.open(targetModal, {
      windowClass: "my-class",
      centered: true,
      size: "xl"
    });


  }
  fileChange(event: any) {
    let fileList: any = event.target as HTMLInputElement;
    this.file = fileList.files[0];
    document.getElementById("");

    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
      (document.getElementById("product-img") as HTMLImageElement).src =
        this.imageURL;
    };
    reader.readAsDataURL(this.file);
    console.log("file", this.file);
  }

  onSelectedValueAffect(item: any) {
    //   this.codAffect = item.cod_affect; // Mise à jour du champ code
    if (item.cod_affect) {
      this.libAffect = item.lib_affect; // Mise à jour du champ libellé
    }
    this.formAdherent.patchValue({
      cod_affect: item.cod_affect,
    });
  }
  onSelectedValueTypDepart(item: any) {
    //  this.codTypDepart = item.cod_typ_depart; // Mise à jour du champ code
    this.libTypDepart = item.lib_typ_depart; // Mise à jour du champ libellé
    this.formAdherent.patchValue({
      cod_typ_depart: item.cod_typ_depart,
    });
  }
  deletBord() {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Vous êtes sûr de bien vouloir supprimer le bordereau ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.envoiServ.callDeletBord(this.tokenStorage.getUser().codSoc, this.codBord).subscribe(
          (data) => {
            console.log("Bordereau supprimé :", data);
            this.getCodBord()
            this.bordEnvoiForm.reset()
            Swal.fire('Supprimé !', 'Le bordereau a été supprimé avec succès.', 'success');

          },
          (error) => {
            console.error("Erreur lors de la suppression :", error);
            Swal.fire('Erreur !', 'Impossible de supprimer le bordereau.', 'error');
          }
        );
      } else {
        console.log("Suppression annulée");
      }
    });
  }

  printBordereauCnamGlobal() {
    if (!this.codBord) {
      Swal.fire('Avertissement', 'Veuillez sélectionner un bordereau.', 'warning');
      return;
    }
    Swal.fire({
      title: 'Chargement en cours...',
      html: 'Veuillez patienter pendant la génération du rapport.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
    this.envoiServ.imprimerBordCnamGlobal(this.tokenStorage.getUser().codSoc, this.codBord).subscribe({
      next: (data: any) => {
        const file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileURL;
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `Bordereau_CNAM_Global_${this.codBord}_${formattedDate}.pdf`;
        a.click();
        URL.revokeObjectURL(fileURL);
        Swal.close();
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Échec de la génération du rapport global.' });
      }
    });
  }

  printBordereauCnamDetail() {
    if (!this.codBord) {
      Swal.fire('Avertissement', 'Veuillez sélectionner un bordereau.', 'warning');
      return;
    }
    Swal.fire({
      title: 'Chargement en cours...',
      html: 'Veuillez patienter pendant la génération du rapport.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
    this.envoiServ.imprimerBordCnamDetail(this.tokenStorage.getUser().codSoc, this.codBord).subscribe({
      next: (data: any) => {
        const file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileURL;
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `Bordereau_CNAM_Detail_${this.codBord}_${formattedDate}.pdf`;
        a.click();
        URL.revokeObjectURL(fileURL);
        Swal.close();
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Échec de la génération du rapport détaillé.' });
      }
    });
  }

  search(item: any) {
    this.rowActive = false;
    this.saveService.setAdded(false);
    console.log("this.rowActive", this.rowActive);

    if (!item || !item.cod_bord) {
      this.codBord = '';
      this.bordEnvoiForm.patchValue({
        cod_bord: '',
        dat_bord: this.sysdate
      });
      this.listBord = [];
      return;
    }

    this.codBord = item.cod_bord;
    this.bordEnvoiForm.patchValue({
      cod_bord: item.cod_bord,
      dat_bord: item.dat_bord
    }, { emitEvent: false }); // Avoid triggering extra changes

    // Don't call getBord if dat_bord is missing - it will cause 400 error
    if (!item.dat_bord) {
      console.warn('⚠ Skipping getBord search: dat_bord is missing');
      return;
    }

    this.envoiServ.getBord(item.cod_bord, item.dat_bord).subscribe({
      next: (data: BordEnvoi[]) => {
        if (data && data.length > 0) {
          let bord = data[0];
          this.bordEnvoiForm.patchValue({
            cod_bord: bord.cod_bord,
            dat_bord: bord.dat_bord,
            cod_assur: bord.cod_assur || '',
            lib_assur: bord.lib_assur || '',
            dat_deb: bord.dat_deb || '',
            dat_fin: bord.dat_fin || '',
            nbr_bult: bord.nbr_bult || '',
            tot_honor: bord.tot_honor || '',
            tot_net: bord.tot_net || ''
          });
          this.codAssur = bord.cod_assur;

          this.envoiServ.findBultEnvoiByCodBord(
            this.tokenStorage.getUser().codSoc,
            bord.cod_bord,
            bord.cod_assur
          ).subscribe({
            next: (data) => {
              console.log("data from findBultEnvoiByCodBord:", data);

              if (!data || data.length === 0) {
                this.listBord = [];
                return;
              }

              this.listBord = data;

              forkJoin(
                this.listBord.map((row: any) =>
                  this.envoiServ.totauCnam(
                    this.tokenStorage.getUser().codSoc,
                    row.mat_pers,
                    row.num_fam,
                    row.dat_soin
                  ).pipe(
                    map((apiData) => ({
                      ...row,
                      sold: apiData.asold || 0,
                      mnt_honor: apiData.xmnt_honor || 0,
                      mnt_tot: apiData.ymnt_tot || 0,
                      mnt_tot_mut: apiData.zMNT_TOT_MUT || 0,
                      choix: 'O'
                    })),
                    catchError((error) => {
                      console.error('Error fetching totals:', error);
                      return of({
                        ...row,
                        sold: 0,
                        mnt_honor: 0,
                        mnt_tot: 0,
                        mnt_tot_mut: 0,
                        choix: 'O'
                      });
                    })
                  )
                )
              ).subscribe({
                next: (updatedList) => {
                  this.listBord = updatedList;
                  console.log('Updated list with calculated totals:', this.listBord);
                },
                error: (error) => {
                  console.error('Error in forkJoin:', error);
                }
              });
            },
            error: (error) => {
              console.error('Error calling findBultEnvoiByCodBord:', error);
              this.listBord = [];
            }
          });
        } else {
          console.warn("No bordereau found for the given parameters.");
        }
      },
      error: (error) => {
        console.error('Error calling getBord:', error);
      }
    });
  }


  onSelectedValue(item: any) {
    this.formAdherent.patchValue({
      mat_pers: item.mat_pers,
      num_retr: item.num_retr,
      nom_pers: item.nom_pers,
      pren_pers: item.pren_pers
    });
  }


  getAffectation() {
    this.adherentServ.getAffectation().subscribe((data) => {
      this.listAffectation = data;
      console.log("affectation", data)
      this.columnAffect = [
        { key: "cod_affect", label: "Code" },
        { key: "lib_affect", label: "Libelle" },
        { key: "lib_affect_a", label: "Libelle arabe" },
      ];
    });
  }
  getTypeDepart() {
    this.adherentServ.getTypeDepart().subscribe((data) => {
      this.listTypeDepart = data;
      // Définir les colonnes dynamiques du tableau
      this.columnsTypDepart = [
        { key: "cod_typ_depart", label: "Code" },
        { key: "lib_typ_depart", label: "Libelle" },
        { key: "etat_act", label: "Etat" },

        // { key: 'lib_tit_a', label: 'Libellé 2éme langue' }
      ];
    });
  }
  convertDateFormatToMounth(dateString: string): string {
    // Ensure the input string is in the format dd/mm/yyyy
    const [day, month, year] = dateString.split('/');
    return `${day}/${month}/${year}`;
  }

  onSubmit(data: any[]): void {

  }





  transformDate(input: string): string {
    const regexWithMonthSlash = /^\d{2}\/\d{4}$/; // Matches "mm/yyyy" or "01/yyyy"
    const regexWithoutSlash = /^\d{6}$/;         // Matches "mmyyyy"

    let month: string, year: string;

    if (regexWithMonthSlash.test(input)) {
      [month, year] = input.split('/');
      if (month === "01" && year.length === 4) {
        return `${month}/${year}`;
      }
    } else if (regexWithoutSlash.test(input)) {
      month = input.substring(0, 2);
      year = input.substring(2);
    } else {
      throw new Error('Invalid date format. Expected "mm/yyyy", "mmyyyy", or "01/yyyy".');
    }

    return `${month}/${year}`;
  }


  getCurrentDate(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Mois basé sur 0
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year}`; // Format: DD/MM/YYYY HH:mm:ss
  }

  formatDateToMonthYear(date: string): string {
    if (typeof date !== "string" || !date.trim()) {
      console.error("Invalid input: The date must be a non-empty string.");
      return "";
    }

    const parts = date.split("/");
    if (parts.length !== 3) {
      console.error("Invalid date format: Expected 'dd/mm/yyyy', received:", date);
      return "";
    }

    const [day, month, year] = parts;

    if (!day || !month || !year) {
      console.error("Invalid date components: Missing day, month, or year in:", date);
      return "";
    }

    return `${month}/${year}`;
  }


  changePage() {
    this.filteredDataRows = this.service.changePage(this.filteredDataRows);
  }

  searchz: any = {
    mat_pers: '',
    num_retr: '',
    nom_pers: '',
    dat_deb: '',
    mnt_payer: '',
    mod_pay: '',
    etat_cot: ''
  };

  applyFilter() {
    console.log('this.filteredDataRows :', this.filteredDataRows)
    this.filteredDataRows = this.dataRows.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase();
        const rowValue = row[key]?.toString().toLowerCase();
        return !searchValue || rowValue.includes(searchValue);
      });
    });

  }
  showFilters: { [key: string]: boolean } = {};

  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }

  onSort(column: any) {
    this.listBord = this.service.onSort(
      column,
      this.listBord
    );
  }
  // The master checkbox will check/ uncheck all items

  // Delete Data
  deleteData(id: any) {
    // if (id) {
    //   this.store.dispatch(deleteCompany({ id: this.deleteId.toString() }));
    // } else {
    //   this.store.dispatch(deleteCompany({ id: this.checkedValGet.toString() }));
    // }
    // this.deleteId = '';
    this.masterSelected = false;
  }
  // Search Data
  performSearch(): void {
    this.searchResults = this.allcompany.filter((item: any) => {
      return item.name.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
    this.company = this.service.changePage(this.searchResults);
  }
  fetchLigCotis(codSoc: string, matPers: string, datDeb: string, datFin: string): void {

  }

  deleteId: any;

  confirm(content: any, id: any) {
    console.log("ID to delete:", id);
    this.deleteId = id; // Store the ID for deletion confirmation
    this.modalService.open(content, { centered: true });
  }
  ConfirmDelete() {
    if (!this.deleteId) {
      console.log("deleteId is null");
      return; // If deleteId is null, exit the function
    }

    const data = {
      cod_soc: this.tokenStorage.getUser().codSoc,
      mat_pers: this.deleteId.mat_pers,
      num_fam: this.deleteId.num_fam,
      dat_soin: this.deleteId.dat_soin
    };

    console.log(this.deleteId, "Suppression du bulletin");

    this.envoiServ.deletBultin(data).subscribe({
      next: (response) => {
        console.log("Réponse du serveur:", response);
        if (response.message) {
          console.log(response.message); // "Item deleted successfully"
          // Display success message
          Swal.fire({
            icon: 'success',
            title: 'Suppression réussie',
            text: 'Le bulletin a été supprimé avec succès.',
            confirmButtonText: 'OK'
          });
          this.envoiServ.getBsoinBordCnam(this.tokenStorage.getUser().codSoc, this.codBord, this.codAssur).subscribe((data) => {

            console.log("data table ", data)
            this.listBord = data

            forkJoin(
              this.listBord.map((row: any) =>
                this.envoiServ.totauCnam(
                  this.tokenStorage.getUser().codSoc,
                  row.mat_pers,
                  row.num_fam,
                  row.dat_soin
                ).pipe(
                  map((data) => ({
                    ...row, // Keep existing properties
                    sold: data.asold, // Store API result in a new property
                    mnt_honor: data.xmnt_honor,
                    mnt_tot: data.ymnt_tot,
                    mnt_tot_mut: data.zMNT_TOT_MUT,
                    choix: 'O'
                  }))

                )

              )
            ).subscribe((updatedList) => {
              this.listBord = updatedList; // Update the list with computed values
              console.log('Updated list with calculated totals:', this.listBord);
            });
          })



        }

        // Update the list after successful deletion
        this.listBord = this.listBord.filter((item: CleBulletin) =>
          item.cod_soc !== this.tokenStorage.getUser().codSoc ||
          item.mat_pers !== this.deleteId.mat_pers ||
          item.num_fam !== this.deleteId.num_fam ||
          item.dat_soin !== this.deleteId.dat_soin
        );
        console.log("Bulletin supprimé et liste mise à jour avec succès");



        // Close the modal
        this.modalService.dismissAll();
      },
      error: (error) => {
        console.error("Erreur lors de la suppression:", error);

        // Display error message
        Swal.fire({
          icon: 'error',
          title: 'Échec de la suppression',
          text: 'Une erreur s\'est produite lors de la suppression du bulletin. Veuillez réessayer.',
          confirmButtonText: 'Fermer'
        });
      }
    });

    // Reset deleteId to prevent issues
    this.deleteId = null;
  }


  onSelectedValueCodBord(item: any) {

  }


  onCheckboxChange(): void {
    this.saveService.setDisabled(true);
    const totalRows: number = this.listDem.length;
    const selectedCount: number = this.listDem.filter((row: any) => row.state).length;

    this.masterSelected = totalRows > 0 && selectedCount === totalRows;

    // Update selected rows list
    this.selectedRows = this.listDem.filter((row: any) => row.state);

    console.log("Updated Selected Rows:", this.selectedRows);
  }
  deleteInd() {
    this.listDem = this.listDem.filter((row: any) => !this.selectedRows.includes(row));
    console.log("list after delete:", this.listDem);
  }

  checkUncheckAll(event: any): void {
    const isChecked: boolean = event.target.checked;

    this.listDem.forEach((row: any) => {
      row.state = isChecked;
    });
  }
  getTotalHonor(): number {
    return this.listBord ? this.listBord.reduce((sum: any, item: { mnt_honor: any; }) => sum + (item.mnt_honor || 0), 0) : 0;
  }

  getTotalTot(): number {
    return this.listBord ? this.listBord.reduce((sum: any, item: { mnt_tot: any; }) => sum + (item.mnt_tot || 0), 0) : 0;
  }

  getTotalTotMut(): number {
    return this.listBord ? this.listBord.reduce((sum: any, item: { mnt_tot_mut: any; }) => sum + (item.mnt_tot_mut || 0), 0) : 0;
  }
  saveUpdates() {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Voulez-vous enregistrer les mises à jour ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, enregistrez-le !'
    }).then((result) => {
      if (result.isConfirmed) {
        // ✅ Transform the list to match UpdateBultSoinDTO
        const formattedList = this.listBord.map((item: any) => ({
          cod_soc: item.cod_soc,
          mat_pers: item.mat_pers,
          num_fam: item.num_fam,
          dat_soin: item.dat_soin,  // Format LocalDate
          envoi: item.choix  // Ensure it's included
        }));

        console.log("Formatted list before sending:", this.listBord);

        // Send the transformed list
        this.envoiServ.updateBultinCnam(formattedList).subscribe(
          (data: any) => {
            if (data && data.length > 0) {
              console.log("Données enregistrées :", data);
              Swal.fire('Enregistré !', 'Vos changements ont été enregistrés.', 'success');

              // Fetch updated list after saving
              this.envoiServ.getBsoinBordCnam(
                this.tokenStorage.getUser().codSoc,
                this.codBord,
                this.codAssur
              ).subscribe(
                (data) => {
                  console.log("Data received for table update:", data);
                  this.listBord = data;

                  // Compute totals for each row
                  forkJoin(
                    this.listBord.map((row: any) =>
                      this.envoiServ.totauCnam(
                        this.tokenStorage.getUser().codSoc,
                        row.mat_pers,
                        row.num_fam,
                        row.dat_soin
                      ).pipe(
                        map((apiData) => ({
                          ...row, // Keep existing properties
                          sold: apiData.asold, // Store API result in a new property
                          mnt_honor: apiData.xmnt_honor,
                          mnt_tot: apiData.ymnt_tot,
                          mnt_tot_mut: apiData.zMNT_TOT_MUT,
                          choix: row.envoi
                        })),
                        catchError((error) => {
                          console.error("Erreur lors du calcul du total pour:", row, error);
                          return of({ ...row, sold: null, mnt_honor: null, mnt_tot: null, mnt_tot_mut: null }); // Provide default values on error
                        })
                      )
                    )
                  ).subscribe(
                    (updatedList) => {
                      this.listBord = updatedList; // Update the list with computed values
                      console.log('Updated list with calculated totals:', this.listBord);
                    },
                    (error) => {
                      console.error('Erreur dans le traitement des totaux:', error);
                    }
                  );
                },
                (error) => {
                  console.error("Erreur lors de la récupération des données:", error);
                }
              );

              this.saveService.setDisabled(false);
            } else {
              console.error("Réponse vide ou erronée de l'API :", data);
              Swal.fire('Erreur !', 'Il y a eu une erreur lors de l\'enregistrement des mises à jour.', 'error');
              this.saveService.setDisabled(true);
            }
          },
          (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            Swal.fire('Erreur !', 'Une erreur s\'est produite lors de l\'enregistrement.', 'error');
            this.saveService.setDisabled(true);
          }
        );
      } else {
        console.log("Mise à jour annulée");
      }
    });
  }




}

export interface BordEnvoi {
  cod_bord: string;
  dat_bord: string;
  cod_assur: string;
  lib_assur: string;
  dat_deb: string;
  dat_fin: string;
  nbr_bult: string;
  tot_honor: string;
  tot_net: string;
}
export interface CleBulletin {
  cod_soc: string;
  mat_pers: string;
  num_fam: string;
  dat_soin: string;
}

export interface Bulletin {
  matPers: string;
  numFam: number;
  datSoin: string;  // ISO date string like "2025-07-10"
  choix: string;    // typically 'O' or 'N'
  mntHonor: number;
  mntNet: number;
}
export interface BordereauRequest {
  codBord: string;
  codSoc: string;
  bulletins: Bulletin[];
}
