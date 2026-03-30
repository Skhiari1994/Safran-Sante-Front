import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { AdherentService } from '../../Adherent/adherent.service';
import { CaisseRetrService } from '../caisse-retr.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-prime-retraite',
  templateUrl: './prime-retraite.component.html',
  styleUrl: './prime-retraite.component.scss'
})
export class PrimeRetraiteComponent {
  breadCrumbItems!: Array<{}>;


  pSusp2: any
  listPersonnel: any[] = []
  columnPersonnels: any[] = []
  listRemb: any[] = []
  columnRemb: any[] = []
  listBenef: any[] = []
  listFamille: any[] = []
  columnFamille: any[] = []
  listPrimeRetr: any[] = []
  columnsPrimeRetr: any[] = []
  nomPren: String = ''
  matPersVal: string = ''
  numVir: String = ''
  numRetr: String = ''
  numRemb: any
  libRemb: String = ''
  codRemb: String = ''
  numFam: String = ''
  libNomFam: String = ''
  formPrimeRetraite: FormGroup
  formBenef: FormGroup
  isDisabled!: boolean;
  isSearch: boolean = true;
  listVir: any[] = []
  columnsVir: any[] = []
  edit: boolean = true
  editCarteIndex: any
  // Report-related properties
  listCorps: any[] = [];
  columnTitles2: { [key: string]: string } = {
    num_fam: "Num fam",
    nom_benef: "Nom Benef",
    montant_benef: "Montant Benef",
    num_cheq: "Numéro chéque",
  };
  deleteId: any;
  constructor(private serv: CaisseRetrService, private adherentServ: AdherentService, private token: TokenStorageService, private fb: FormBuilder,
    private modalService: NgbModal, private saveService: SaveService) {
    this.formPrimeRetraite = this.fb.group({
      cod_soc: [this.token.getUser().codSoc],
      mat_pers: [''],
      num_remb: [''],
      num_retr: [''],
      cod_remb: [''],
      dat_remb: [''],
      benef_prime: [{ value: '', disabled: true }],
      benef_droi: [{ value: '', disabled: true }],
      taux_prime: [''],
      dat_deb_ret: [''],
      dat_fin_ret: [''],
      etat_prime: [{ value: 'S', disabled: false }],
      montant_cotis: [''],
      montant_prime: [''],
      montant_total: [''],
      mod_pay: ['C'],
      obs_retraite: [''],
      imput_cpt: [''],
      seq_ecrt: [''],
      cheq_remb: [''],
      // Report filter fields
      etat_cotis: [''],
      corps_report: [''],

    })

    this.formBenef = this.fb.group({
      Benef: this.fb.array([
        this.fb.group({
          cod_soc: ["01"],
          mat_pers: [""],
          num_remb: [""],
          num_fam: [""],
          nom_benef: [""],
          montant_benef: [""],
          num_cheq: [""],

        }),
      ]), // FormArray for dynamic children
    });
  }

  ngOnInit() {
    this.saveService.registerSaveCallback(() => this.savePrimeRetr());
    this.saveService.registerPrintCallback(() => this.printReport());
    this.saveService.registerDeletCallback(() => this.deletePrimeRetr());

    this.formPrimeRetraite.valueChanges.subscribe(() => {
      this.saveService.setDisabled(!this.isDisabled);
    });

    this.saveService.isSearch$.subscribe((canSearch) => {
      this.isSearch = true
      console.log("is search valid", canSearch)

    })
    this.getPersonnels()
    this.getRemb()
    this.getPrimeRetr()
    this.getCorps()

    //this.getAllVirAnticip()
  }

  ngOnDestroy() {
    // Clear the callback to avoid memory leaks
    this.saveService.clearSaveCallback();
    this.saveService.setCanSave(false)
  }


  getPrimeRetr() {
    this.serv.getPrimeRetr().subscribe((data: any) => {
      this.listPrimeRetr = data.map((item: any) => {
        let datRembSearch = '';
        if (item.dat_remb) {
          if (item.dat_remb.includes('-')) {
            const parts = item.dat_remb.split('-');
            datRembSearch = parts.length >= 2 ? `${parts[1]}/${parts[0]}` : item.dat_remb;
          } else if (item.dat_remb.includes('/')) {
            const parts = item.dat_remb.split('/');
            datRembSearch = parts.length >= 3 ? `${parts[1]}/${parts[2]}` : item.dat_remb;
          } else if (item.dat_remb.length === 8) {
            datRembSearch = `${item.dat_remb.substring(2, 4)}/${item.dat_remb.substring(4, 8)}`;
          } else {
            datRembSearch = item.dat_remb;
          }
        }
        return { ...item, dat_remb_search: datRembSearch };
      });
      console.log("this.listPrimeRetr", this.listPrimeRetr)
      this.columnsPrimeRetr = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "nom", label: "Nom & Prénom" },
        { key: "num_retr", label: "Num Retr" },
        { key: "dat_remb_search", label: "Date Remb" },
        { key: "etat_prime", label: "Etat" },
      ];
    })
  }

  getPersonnels() {
    this.serv.getPersonnel().subscribe(data => {
      this.listPersonnel = data

      this.columnPersonnels = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "dat_nais", label: "Date naissance" },
        { key: "num_retr", label: "Num Retr" },
        { key: "nom", label: "Nom & Prénom" },
      ];
    })
  }

  getRemb() {
    this.serv.getMotifRembour().subscribe(data => {
      this.listRemb = data

      this.columnRemb = [
        { key: "cod_remb", label: "Code" },
        { key: "lib_remb", label: "Libelle" },
      ];
    })
  }

  getCorps() {
    this.adherentServ.getCorps().subscribe((data) => {
      this.listCorps = data;
    });
  }

  printReport() {
    Swal.fire({
      title: 'Choisir le format',
      input: 'radio',
      inputOptions: {
        'PDF': 'PDF',
        'Excel': 'Excel'
      },
      inputValue: 'PDF',
      showCancelButton: true,
      confirmButtonText: 'Imprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      inputValidator: (value) => {
        if (!value) {
          return 'Vous devez choisir un format!'
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value === 'PDF') {
          this.printReportPDF();
        } else {
          this.printReportExcel();
        }
      }
    });
  }

  printReportPDF() {
    // Show loading Swal
    Swal.fire({
      title: 'Chargement en cours...',
      html: 'Veuillez patienter pendant la génération du rapport PDF.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Use the main form's mat_pers for both début and fin
    const matPers = this.formPrimeRetraite.get('mat_pers')?.value || '';

    // Pass empty string for month to get all available data
    this.serv.printPrimeRetraite(
      this.token.getUser().codSoc,
      matPers,
    ).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);

        const a = document.createElement('a');
        a.href = fileURL;

        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `prime_retraite${formattedDate}.pdf`;

        a.click();

        // Cleanup
        URL.revokeObjectURL(fileURL);

        Swal.close();
      },
      (error: any) => {
        console.log(error);

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Échec de la génération du rapport PDF.'
        });
      }
    );
  }

  printReportExcel() {
    // Show loading Swal
    Swal.fire({
      title: 'Chargement en cours...',
      html: 'Veuillez patienter pendant la génération du fichier Excel.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Use the main form's mat_pers for both début and fin
    const matPers = this.formPrimeRetraite.get('mat_pers')?.value || '';

    // Pass empty string for month to get all available data
    this.serv.printPrimeRetraiteExcel(
      this.token.getUser().codSoc,
      matPers,
    ).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileURL = URL.createObjectURL(file);

        const a = document.createElement('a');
        a.href = fileURL;

        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `prime_retraite${formattedDate}.xlsx`;

        a.click();

        // Cleanup
        URL.revokeObjectURL(fileURL);

        Swal.close();
      },
      (error: any) => {
        console.log(error);

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Échec de la génération du fichier Excel.'
        });
      }
    );
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
  calcul_prime_retraite() {
    const formatDates = (form: any, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value);
        form.get(field)?.setValue(value);
        formatted.push(value);
        return formatted;
      }, []);

    const demConv = formatDates(this.formPrimeRetraite, [
      "dat_remb",
    ]);
    console.log(this.formPrimeRetraite.value)
    this.serv.calcul_prime_retraite(this.formPrimeRetraite.get('benef_prime')?.value, this.formPrimeRetraite.get('benef_droi')?.value, this.formPrimeRetraite.get('taux_prime')?.value,
      this.formPrimeRetraite.get('dat_remb')?.value, this.formPrimeRetraite.get('mat_pers')?.value, this.token.getUser().codSoc).subscribe((data: any) => {
        console.log("data", data)
        this.formPrimeRetraite.patchValue({
          dat_deb_ret: data.p_dat_deb_ret,
          dat_fin_ret: data.p_dat_fin_ret,
          montant_cotis: Number(data.p_montant_cotis).toFixed(3),
          montant_prime: Number(data.p_montant_prime).toFixed(3),
          montant_total: Number(data.p_montant_total).toFixed(3),
        })
      })
  }
  onSelectedValuePers(item: any) {
    console.log("item :", item)
    this.nomPren = item.nom;
    this.serv.getNumRemb(this.token.getUser().codSoc, item.mat_pers).subscribe((data: any) => {
      this.formPrimeRetraite.patchValue({
        num_remb: data,
        mat_pers: item.mat_pers,
        num_retr: item.num_retr
      })
    })
    this.serv.getFamille(this.token.getUser().codSoc, this.formPrimeRetraite.get('mat_pers')?.value, this.nomPren).subscribe((data) => {
      this.listFamille = data

      this.columnFamille = [
        { key: "num_fam", label: "Num fam" },
        { key: "nom_pren", label: "Prénom" },
      ];
    })
    this.calcul_prime_retraite()
  }

  onSelectedValueRemb(item: any) {
    console.log("item :", item)
    this.libRemb = item.lib_remb
    this.formPrimeRetraite.patchValue({
      cod_remb: item.cod_remb,
      benef_prime: item.benef_prime,
      benef_droi: item.benef_droi,
      taux_prime: item.taux_prime
    })

  }
  onSelectedValueFamille(item: any) {
    const enfantsArray = this.formBenef.get('Benef') as FormArray;

    const selectedFormGroup = enfantsArray.at(0) as FormGroup;


    if (selectedFormGroup) {
      if (selectedFormGroup.get('num_fam')) {
        selectedFormGroup.patchValue({
          num_fam: item.num_fam,
          nom_benef: item.nom_pren
        });
        console.log("selectedFormGroup", selectedFormGroup);

        console.log(`Patched values: num_fam = ${item.num_fam}, libNom = ${item.nom_pren}`);
      } else {
        console.error(`num_fam control is missing in the FormGroup at index `);
      }
    } else {
      console.error(`FormGroup is missing at index `);
    }

  }
  MontRest() {
    this.formPrimeRetraite.patchValue({
      rest_vir: this.formPrimeRetraite.get('mont_vir')?.value - this.formPrimeRetraite.get('mont_antic')?.value
    })

  }

  search(item: any) {
    console.log("item :1", item);
    this.matPersVal = item.mat_pers
    this.codRemb = item.cod_remb
    this.numRemb = item.num_remb
    this.numFam = item.num_fam
    // Mise à jour initiale des champs avec l'élément sélectionné
    this.formPrimeRetraite.patchValue({
      cod_soc: item.cod_soc,
      mat_pers: item.mat_pers,
      num_remb: item.num_remb,
      num_retr: item.num_retr,
      cod_remb: item.cod_remb,
      dat_remb: item.dat_remb,
      benef_prime: item.benef_prime,
      benef_droi: item.benef_droi,
      taux_prime: Number(item.taux_prime).toFixed(3),
      dat_deb_ret: item.dat_deb_ret,
      dat_fin_ret: item.dat_fin_ret,
      etat_prime: item.etat_prime,
      montant_cotis: Number(item.montant_cotis).toFixed(3),
      montant_prime: Number(item.montant_prime).toFixed(3),
      montant_total: Number(item.montant_total).toFixed(3),
      mod_pay: item.mod_pay,
      obs_retraite: item.obs_retraite,
      imput_cpt: item.imput_cpt,
      seq_ecrt: item.seq_ecrt,
      cheq_remb: item.cheq_remb,


    });
    this.serv.getBenefPrime(item.cod_soc, item.mat_pers, item.num_remb).subscribe((data) => {

      this.listBenef = data
      console.log("this.listBenef", this.listBenef)
      this.numFam = data[0].num_fam
    })
    console.log("this.formPretPers :", this.formPrimeRetraite.value)
    // Récupérer les données à partir du service et filtrer par `mat_pers`

  }

  getBenefPrime() {
    this.serv.getBenefPrime(this.token.getUser().codSoc, this.formPrimeRetraite.get('mat_pers')?.value, this.formPrimeRetraite.get('num_remb')?.value).subscribe((data) => {
      this.listBenef = data
    })
  }

  openModalTab(content: any) {
    this.edit = true;
    this.editCarteIndex = null

    //this.formCertif.reset()
    this.modalService.open(content, { size: "xl", centered: true });
  }

  get Benef(): FormArray {
    return this.formBenef.get("Benef") as FormArray;
  }
  addBenef() {
    this.Benef.push(
      this.fb.group({
        cod_soc: [""],
        mat_pers: [""],
        num_remb: [""],
        num_fam: [""],
        nom_benef: [""],
        montant_benef: [""],
        num_cheq: [""],
      })
    );
  }
  removeBenef(index: number) {
    this.Benef.removeAt(index);
  }
  validateFamille(): void {
    const carteArray = this.formBenef.get('Benef') as FormArray;


    carteArray.controls.forEach((formGroup: AbstractControl) => {
      if (formGroup instanceof FormGroup) {
        console.log("Before patch:", formGroup.value); // Debug

        formGroup.patchValue({
          mat_pers: this.matPersVal,
          cod_soc: this.token.getUser().codSoc,
          num_remb: this.formPrimeRetraite.get('num_remb')?.value,
        });

        console.log("After patch:", formGroup.value); // Debug
      }

      if (this.editCarteIndex !== null) {
        this.listBenef[this.editCarteIndex] = formGroup.value;
      }
    });

    if (this.editCarteIndex === null) {
      if (!this.listBenef) {
        this.listBenef = [];
      }
      this.listBenef.push(...carteArray.value);
    }

    this.editCarteIndex = null;
    console.log("this.listBenef:", this.listBenef);

  }



  savePrimeRetr() {
    const benefFormArray = (this.formBenef.get("Benef") as FormArray);
    console.log("benefFormArray", benefFormArray.value)

    // Get raw form values (includes disabled fields)
    const formData = this.formPrimeRetraite.getRawValue();

    // Remove report-only fields that don't exist in PrimeRetraite entity
    const { etat_cotis, corps_report, ...primeRetraiteData } = formData;

    // Increment num_remb by 1 (getNumRemb returns max value, we need max + 1)
    if (primeRetraiteData.num_remb !== null && primeRetraiteData.num_remb !== undefined) {
      primeRetraiteData.num_remb = Number(primeRetraiteData.num_remb) + 1;
    } else {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Numéro de remboursement invalide. Veuillez sélectionner un personnel.",
      });
      return;
    }

    // Convert numeric string fields to proper numbers (use 0 instead of null for BigDecimal fields)
    primeRetraiteData.taux_prime = primeRetraiteData.taux_prime ? Number(primeRetraiteData.taux_prime) : 0;
    primeRetraiteData.montant_cotis = primeRetraiteData.montant_cotis ? Number(primeRetraiteData.montant_cotis) : 0;
    primeRetraiteData.montant_prime = primeRetraiteData.montant_prime ? Number(primeRetraiteData.montant_prime) : 0;
    primeRetraiteData.montant_total = primeRetraiteData.montant_total ? Number(primeRetraiteData.montant_total) : 0;

    // Convert date strings to proper format if needed
    if (primeRetraiteData.dat_remb && typeof primeRetraiteData.dat_remb === 'string') {
      primeRetraiteData.dat_remb = this.convertToBackendDate(primeRetraiteData.dat_remb);
    }
    if (primeRetraiteData.dat_deb_ret && typeof primeRetraiteData.dat_deb_ret === 'string') {
      primeRetraiteData.dat_deb_ret = this.convertToBackendDate(primeRetraiteData.dat_deb_ret);
    }
    if (primeRetraiteData.dat_fin_ret && typeof primeRetraiteData.dat_fin_ret === 'string') {
      primeRetraiteData.dat_fin_ret = this.convertToBackendDate(primeRetraiteData.dat_fin_ret);
    }

    console.log("Sending primeRetraiteData:", primeRetraiteData);

    this.serv.addPrimeRetr(primeRetraiteData).subscribe((data) => {
      console.log("data :", data);

      // Update beneficiary data with the new num_remb
      const benefData = benefFormArray.value.map((benef: any) => ({
        ...benef,
        cod_soc: primeRetraiteData.cod_soc,
        mat_pers: primeRetraiteData.mat_pers,
        num_remb: primeRetraiteData.num_remb,
        num_fam: benef.num_fam ? Number(benef.num_fam) : 0,
        montant_benef: benef.montant_benef ? Number(benef.montant_benef) : 0
      }));

      console.log("Sending benefData:", benefData);

      this.serv.addBenefPrimeRetr(benefData).subscribe((data) => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Ajouter avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        // Refresh the list and reset form
        this.getPrimeRetr();
        this.formPrimeRetraite.reset({
          cod_soc: this.token.getUser().codSoc,
          etat_prime: 'S',
          mod_pay: 'C'
        });
      }, (error) => {
        console.error("Error saving beneficiaries:", error);
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Erreur lors de l'enregistrement des bénéficiaires",
        });
      });
    }, (error) => {
      console.error("Error saving prime:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: error.error?.message || "Erreur lors de l'enregistrement de la prime",
      });
    });
  }

  // Helper method to convert date from dd/MM/yyyy or ddMMyyyy to yyyy-MM-dd
  convertToBackendDate(dateString: any): string | null {
    if (!dateString) return null;

    // If already in yyyy-MM-dd format, return as is
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }

    // Handle dd/MM/yyyy format
    if (typeof dateString === 'string' && dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
      }
    }

    // Handle ddMMyyyy format
    if (typeof dateString === 'string' && dateString.length === 8 && !dateString.includes('/')) {
      const day = dateString.substring(0, 2);
      const month = dateString.substring(2, 4);
      const year = dateString.substring(4, 8);
      return `${year}-${month}-${day}`;
    }

    return dateString;
  }
  confirm(content: any, id: any) {
    console.log("annee:", id)
    this.deleteId = id.cod_param
    this.modalService.open(content, { centered: true });
    console.log("annee:", id.cod_natp)
  }
  editDataGet(id: any, data: any, content: any) {
    this.edit = false;
    this.modalService.open(content, { size: "xl", centered: true });

    (this.formBenef.get("Benef") as FormArray).controls[0]
      .get("cod_soc")
      ?.patchValue(data.cod_soc),
      (this.formBenef.get("Benef") as FormArray).controls[0]
        .get("mat_pers")
        ?.patchValue(data.mat_pers),
      (this.formBenef.get("Benef") as FormArray).controls[0]
        .get("num_remb")
        ?.patchValue(data.num_remb),
      (this.formBenef.get("Benef") as FormArray).controls[0]
        .get("num_fam")
        ?.patchValue(data.num_fam),
      (this.formBenef.get("Benef") as FormArray).controls[0]
        .get("nom_benef")
        ?.patchValue(data.nom_benef),
      (this.formBenef.get("Benef") as FormArray).controls[0]
        .get("montant_benef")
        ?.patchValue(data.montant_benef),
      (this.formBenef.get("Benef") as FormArray).controls[0]
        .get("num_cheq")
        ?.patchValue(data.num_cheq)
    console.log("data.num_fam", data.num_fam)
    this.numFam = data.num_fam
  }

  deletePrimeRetr() {
    const etatPrime = this.formPrimeRetraite.get('etat_prime')?.value;
    if (etatPrime !== 'S') {
      Swal.fire({
        icon: 'error',
        title: 'Suppression impossible',
        text: 'Seules les primes à l\'état "Saisie" peuvent être supprimées.'
      });
      return;
    }

    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !'
    }).then((result) => {
      if (result.isConfirmed) {
        this.serv.deletePrimeRetr(this.token.getUser().codSoc, this.matPersVal, this.numRemb, Number(this.numFam)).subscribe(
          (data) => {
            Swal.fire(
              'Supprimé !',
              'La prime a été supprimée.',
              'success'
            );
            this.listBenef = [];
            this.matPersVal = ''
            this.numRemb = 0
            this.codRemb = ''
            this.libRemb = ''
            this.nomPren = ''
            this.getPrimeRetr();
            this.formPrimeRetraite.reset({
              cod_soc: this.token.getUser().codSoc,
              etat_prime: 'S',
              mod_pay: 'C'
            });
          },
          (error) => {
            Swal.fire(
              'Erreur !',
              'Une erreur est survenue lors de la suppression.',
              'error'
            );
          }
        )
      }
    })
  }
}

