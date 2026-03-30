import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { AdherentService } from '../../Adherent/adherent.service';
import { CotisationService } from '../../Cotisation/cotisation.service';
import { CaisseRetrService } from '../caisse-retr.service';

@Component({
  selector: 'app-valid-cotis-prime-mut',
  templateUrl: './valid-cotis-prime-mut.component.html',
  styleUrl: './valid-cotis-prime-mut.component.scss'
})
export class ValidCotisPrimeMutComponent {  
  breadCrumbItems!: Array<{}>; 

  form!: FormGroup;
  listPrime:any[]=[]
  listPrimeFiltred:any[]=[]
  corpsList: any;
  p: any

  columnTitles: { [key: string]: string } = {
    mat_pers: "Matriucle",
    num_retr: "Num Retr",
    nom: "Nom & Prénom", 
    dat_deb: "Date début",
    mnt_payer: "Mnt payé",
    mod_pay: "Mode payement",
    etat: "Etat"
  };
  constructor(private cdr: ChangeDetectorRef, private servRetr: CaisseRetrService, public paginationService: PaginationService,
    private adherentServ: AdherentService, private cotisServ: CotisationService, private fb: FormBuilder, private saveService: SaveService,
    private modalService: NgbModal, private token: TokenStorage) {
    this.form = this.fb.group({
      mois:[''],
      corps: [''],
      mat:['']
     

    });
 

  }
  ngOnInit() {

 

    this.cotisServ.getCorps().subscribe(
      (response) => {
        this.corpsList = response;


      },
      (error) => {
        console.error('Error fetching corps list:', error);
      }
    );
 
 

  }

  getPrimeMutPers(){
     const formatDates = (form: any, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value);
        form.get(field)?.setValue(value);
        formatted.push(value);
        return formatted;
      }, []);

    const demConv = formatDates(this.form, [
      "mois", 
    ]);
    console.log("soc",this.token.getUser()?.codSoc)
     console.log("mois",this.form.get('mois')?.value)
      console.log("corps",this.form.get('corps')?.value)
      console.log("matricule",this.form.get('mat')?.value)

    this.servRetr.getPrimePersVal(this.token.getUser().codSoc,this.form.get('mois')?.value,this.form.get('corps')?.value,this.form.get('mat')?.value).subscribe((data:any)=>{
      this.listPrime=data
      this.calculerTotaux()
      console.log(this.listPrime)
    })
  }
ValidCotisPrime() {
  // Affiche le Swal de chargement
  Swal.fire({
    title: 'Traitement en cours...',
    text: 'Veuillez patienter',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  this.servRetr
    .chargement_pers_prime(
      this.token.getUser().codSoc,
      this.form.get('mois')?.value,
      this.form.get('mat')?.value
    )
    .subscribe({
      next: (data: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Les primes ont été chargées avec succès !',
          confirmButtonText: 'OK'
        });
        // Tu peux ici déclencher un rafraîchissement ou une mise à jour de la liste
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors du chargement des primes.',
          confirmButtonText: 'Fermer'
        });
      }
    });
}

  currentIndex: number = 0;
  listCotis: any[] = [];
  listDetailCotis: any[] = [];

 

 
  searchz: any = {
    mat_pers:'',
    num_retr: '',
    nom: '', 
    dat_deb: '',
    mnt_payer: '',
    mod_pay: '',
    etat: ''
  };

 

  showFilters: { [key: string]: boolean } = {};

  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }


  applyFilter() {
     this.listPrime = this.listPrimeFiltred.filter((row) => {
      return Object.keys(this.searchz).every((key) => {
        const searchValue = this.searchz[key]?.toString().toLowerCase();
        const rowValue = row[key]?.toString().toLowerCase();
        return !searchValue || rowValue.includes(searchValue);
      });
    });

  }
  onSort(column: any) {
     this.listPrime = this.paginationService.onSort(column, this.listPrime);
  }

 
 
  
  formatDate(dateString: any): string {
    // Ensure the string is in the format 'ddmmyyyy'
    if (dateString && dateString.length === 6) {
      const month = dateString.substring(0, 2);
       const year = dateString.substring(2, 6);
      return `${month}/${year}`;
    }
    return dateString;
  }
 
  getTotalPages(): number {
    return Math.ceil(this.listPrime.length / 9);
  }
  totalMnt: number = 0; 
  calculerTotaux(): void {
    this.totalMnt = this.listPrime.reduce((sum, item) => sum + (item.mnt_payer || 0), 0); 
   } 
}


