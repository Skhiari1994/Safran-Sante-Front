import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AdherentService } from '../adherent.service';
import Swal from 'sweetalert2';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-dfl-pers-scg',
  templateUrl: './dfl-pers-scg.component.html',
  styleUrl: './dfl-pers-scg.component.scss'
})
export class DFlPersScgComponent {
  listAffectation: any[] = [];
  columnsSearch: any[] = [];
  columnsSearchPers: any[] = [];
  columnPers: any[] = [];
  listPers: any[] = [];

  matPersVal: string = ''
  codMatVal: string = ''
  nom: string = ''
  codAffect: string = ''
  nomFichier: string = ''
  etat: string = ''
  breadCrumbItems!: Array<{}>;

  listTrs: any[] = []
  listTrsSearch: any = []
  importedData: any[] = [];
  invalidMatricules: any[] = [];
  pSusp: any;
  trsFormPers!: FormGroup;
  trsFormAdd!: FormGroup;


  columnTitles: { [key: string]: string } = {
    mat_pers: "Matriucle",
    nom_complet_pers: "Nom & Prénom",
    cod_fil: "Filière",
    num_fam: "Préstataire",
    nom_pers: "Nom",
    dat_saisie: "Date saisie",
    dat_soin: "Date soin",
    solde: "Solde.",
    tot_honor: "Tot. Honor.",
    tot_net: "Tot. Net."
  };
  constructor(private adherentServ: AdherentService, private fb: FormBuilder, private http: HttpClient, private token: TokenStorage, private service: PaginationService, private modalService: NgbModal) {

    this.trsFormPers = this.fb.group({
      mat_pers: [''],
      cin: [''],
      nom: [''],
      num_retr: [''],
      tel: [''],
      typ: ['']
    })

    this.trsFormAdd = this.fb.group({
      mat: [''],
      cin: [''],
      nom: [''],
      retr: [''],
      tel: [''],
      typ: ['']
    })
  }
  ngOnInit() {
    this.trsFormPers = this.fb.group({
      mat_pers: [''],
      cin: [''],

      nom: [''],
      num_retr: [''],
      tel: [''],
      typ: ['']
    })
    this.getAffectation()

    this.getTrsPers()
    this.getPersonnels()
  }



  getAffectation() {
    this.adherentServ.getAffectation().subscribe((data) => {
      console.log("personnel", data);
      this.listAffectation = data;
      this.columnsSearch = [
        { key: "cod_affect", label: "Code" },
        { key: "lib_affect", label: "Libelle" },

      ];
    });
  }


  getAllPersonnel() {
    this.adherentServ.getAllPersonnel('01').subscribe((data) => {
      console.log("personnel ", data);
      this.listPers = data;
      this.columnsSearchPers = [
        { key: "mat_pers", label: "Matricule" },
        { key: "nom", label: "Nom & Prénom" },
        { key: "num_retr", label: "Id CNRPS" },

      ];
    });
  }

  onSelectedValue(item: any) {
    this.nom = item.lib_affect
  }
  nomPren: string = ''
  tel: any
  onSelectedValuePers(item: any) {

    this.nomPren = item.pren_pers + ' ' + item.nom_pers
    console.log("nom pren ", this.nomPren)
    this.trsFormPers.patchValue({
      mat_pers: item.mat_pers,
      cin: item.cin,
      num_retr: item.num_retr
    })
    this.trsFormAdd.patchValue({
      mat: item.mat_pers,
      cin: item.cin,
      retr: item.num_retr,
      nom: this.nomPren,
      typ: item.typ
    })


  }
  AddTrsPers() {
    const tel = this.trsFormPers.get('tel')?.value;
    this.trsFormAdd.get('tel')?.setValue(tel);
    const typ = this.trsFormPers.get('typ')?.value;
    this.trsFormAdd.get('typ')?.setValue(typ);

    console.log("data is load ", this.trsFormAdd.value)



    this.adherentServ.addTrsPers(this.trsFormAdd.value).subscribe((data: any) => {
      this.adherentServ.getTrsPers().subscribe((data: any) => {
        this.listTrs = data
        this.listTrsSearch = data
        console.log('prep fich', data)
      })
      console.log("data is saved ")
    })



  }
  openModalTab(content: any) {
    //this.edit = true;
    //this.formCertif.reset()
    this.modalService.open(content, { size: "xl", centered: true });
  }
  listPersonnel: any[] = [];

  getPersonnels() {
    this.adherentServ.getPersonnels().subscribe((data) => {
      console.log("personnel", data);
      this.listPersonnel = data;
      this.columnPers = [
        { key: "mat_pers", label: "Matricule" },
        { key: "nom_pers", label: "Nom" },
        { key: "pren_pers", label: "Prénom" },
        { key: "num_retr", label: "Id unique" },
        { key: "cin", label: "CIN" },
        { key: "cod_lieu_geog", label: "Service" },
      ];
    });
  }



  chargerEtTelecharger() {
    if (!this.nomFichier || !this.etat) {
      Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Veuillez remplir le type de personnel et le nom du fichier.',
      });
      return;
    }

    // Afficher le loader pendant le traitement
    Swal.fire({
      title: 'Traitement en cours...',
      html: 'Génération du fichier salarié...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // 1. Appeler la génération du fichier sur le serveur (Charger)
    this.adherentServ.fichier_salarie(this.token.getUser().codSoc, this.nomFichier, this.etat).subscribe({
      next: (data: any) => {
        // 2. Si succès, appeler le téléchargement (Télécharger)
        this.adherentServ.downloadFile(this.nomFichier).subscribe({
          next: (response: any) => {
            const blob = new Blob([response], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = this.nomFichier.endsWith('.txt') ? this.nomFichier : this.nomFichier + '.txt';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Traitement et Téléchargement terminés !',
              showConfirmButton: false,
              timer: 2000
            });
          },
          error: (error) => {
            console.error('Erreur lors du téléchargement du fichier', error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Échec du téléchargement du fichier.',
            });
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors de la génération du fichier', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la génération du fichier.',
        });
      }
    });
  }


  getTrsPers() {
    this.adherentServ.getTrsPers().subscribe((data: any) => {
      this.listTrs = data
      this.listTrsSearch = data
      console.log('prep fich', data)
    })
  }

  showFilters: { [key: string]: boolean } = {};

  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }

  onSort(column: any) {
    this.listTrs = this.service.onSort(column, this.listTrs);
  }
  searchz: any = {

    mat: "",
    nom: "",
    retr: "",
    cin: "",
    tel: "",
    typ: "",

  };

  applyFilter() {
    this.listTrs = this.listTrsSearch.filter((row: any) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(searchValue);
      });
    });
  }

  getTotalPages(): number {
    return Math.ceil(this.listTrs.length / 9);
  }

  vidageTableau() {
    this.adherentServ.deleteTrsPers().subscribe((data: any) => {

      this.getTrsPers()
    })
  }

  confirmPhar(content: any) {
    this.modalService.open(content, { centered: true });
  }

  onExcelFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
          Swal.fire('Erreur', 'Le fichier est vide.', 'error');
          return;
        }

        // Detect if first row is a header
        let dataToProcess = jsonData;
        const firstCell = String(jsonData[0][0] || '').toLowerCase().trim();
        if (firstCell === 'matricule' || firstCell === 'mat' || firstCell === 'mat_pers') {
          dataToProcess = jsonData.slice(1);
        }

        const processedData = dataToProcess
          .map(row => {
            const mat = String(row[0] || '').trim();
            if (!mat) return null;

            const person = this.listPersonnel.find(p => {
              const pMat = String(p.mat_pers).trim();
              const excelMat = mat.trim();
              return pMat === excelMat || pMat.replace(/^0+/, '') === excelMat.replace(/^0+/, '');
            });

            return {
              mat: person ? person.mat_pers : mat,
              nom: person ? `${person.pren_pers} ${person.nom_pers}` : 'Matricule inexistant',
              cin: person?.cin || '',
              retr: person?.num_retr || '',
              tel: person?.tel || '', // Assuming tel is available in listPersonnel
              typ: this.etat || 'C',
              isValid: !!person
            };
          })
          .filter(row => row !== null);

        this.importedData = processedData.filter(row => row && row.isValid);
        this.invalidMatricules = processedData.filter(row => row && !row.isValid);

        if (this.importedData.length > 0 || this.invalidMatricules.length > 0) {
          Swal.fire({
            title: 'Fichier analysé',
            text: `${this.importedData.length} valides, ${this.invalidMatricules.length} inexistants. Voulez-vous les afficher dans le tableau ?`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Oui',
            cancelButtonText: 'Non'
          }).then(result => {
            if (result.isConfirmed) {
              // Merge imported valid data into listTrs for preview, or just replace it if that's the preferred workflow
              // To match the user's "work like this component" request, we should probably just show them.
              this.listTrs = [...this.importedData];
              this.listTrsSearch = [...this.importedData];
            }
          });
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }

  async saveAll() {
    if (this.importedData.length === 0) {
      Swal.fire('Attention', 'Aucune donnée à enregistrer. Veuillez d\'abord charger un fichier Excel.', 'warning');
      return;
    }

    const result = await Swal.fire({
      title: 'Confirmation',
      text: `Voulez-vous enregistrer ces ${this.importedData.length} records ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, enregistrer',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Enregistrement...',
        text: 'Veuillez patienter...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        // Since there's no bulk API, we'll have to do it sequentially but we can optimize with Promise.all if the server handles it
        // Or just one by one with a progress bar. Let's do it sequentially for safety as in the original code but better.
        for (const row of this.importedData) {
          const trsData = {
            mat: row.mat,
            cin: row.cin,
            retr: row.retr,
            nom: row.nom,
            tel: row.tel,
            typ: row.typ
          };
          await this.adherentServ.addTrsPers(trsData).toPromise();
        }

        Swal.close();
        Swal.fire('Succès', 'Toutes les données ont été enregistrées.', 'success');
        this.getTrsPers(); // Refresh from DB
        this.importedData = [];
      } catch (error) {
        Swal.close();
        console.error('Save all error', error);
        Swal.fire('Erreur', 'Une erreur est survenue lors de l\'enregistrement.', 'error');
      }
    }
  }
}

