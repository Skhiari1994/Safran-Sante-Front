import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { SaveService } from '../../Service/save.service';
import { DebCreditService } from 'src/app/pages/Credits/Débloquage des crédit/deb-credit.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';

@Component({
  selector: 'app-pret-search',
  templateUrl: './pret-search.component.html',
  styleUrl: './pret-search.component.scss'
})
export class PretSearchComponent {
  @Input() placeholder: string = 'Search...';
  @Input() listData: any[] = [];
  @Input() columns: any[] = [
    { key: "num_retr", label: "Id CNRPS" },
    { key: "mat_pers", label: "Matricule" },
    { key: "nomPers", label: "Nom & Prenom" },
    { key: "num_comm", label: "Numéro de commission" },
    { key: "cod_etat_pret", label: "Code etat pret" },
    { key: "cod_pret", label: "Code prêt" },
    { key: "mod_remb", label: "Mode de remboursement" },
    { key: "dat_saisie", label: "Date de saisie" }

  ];
  @Input() codeField: string = 'mat_pers';
  @Input() labelField: string = 'nomPers';
  @Output() selectedValue = new EventEmitter<any>();

  filteredData: any[] = [];
  etatPret: any[] = [];
  searchQueries: { [key: string]: string } = {};  // This will store search queries for each column
  selectedCode: string = '';
  selectedLabel: string = '';
  searchSubject = new Subject<string>(); // Debounce subject
  @ViewChild('content') content!: TemplateRef<any>;
  private isSearchSubscription!: Subscription;
  constructor(private modalService: NgbModal, private saveService: SaveService, private pretService: DebCreditService, private token: TokenStorageService) { }

  ngOnInit(): void {
    this.filteredData = this.listData;
    this.getEtatPret();

    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.filterData();
    });

    // Subscribe to isSearch$
    this.isSearchSubscription = this.saveService.isSearch$.subscribe((value) => {
      if (value) {
        this.loadDataAndOpenModal();
        console.log("search f");
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent leaks
    if (this.isSearchSubscription) {
      this.isSearchSubscription.unsubscribe();
    }
  }
  private isModalOpen = false;

  loadDataAndOpenModal() {
    if (this.isModalOpen || !this.content) {
      setTimeout(() => this.loadDataAndOpenModal(), 100);
      return;
    }
    this.isModalOpen = true;
    this.loadData();
    this.modalService.open(this.content, { size: 'lg' }).result.finally(() => {
      this.isModalOpen = false; // Reset modal state
      this.saveService.setIsSearch(false); // Reset isSearch
    });
  }


  // Filter data based on individual column search
  filterData() {
    const hasAnyLocalQuery = Object.values(this.searchQueries).some(q => q && q.trim() !== '');
    console.log('hasAnyLocalQuery :', this.searchQueries);

    // 1. Local Filtering (if listData is provided)
    if (this.listData && this.listData.length > 0) {
      if (!hasAnyLocalQuery) {
        this.filteredData = [...this.listData];
        return;
      }

      this.filteredData = this.listData.filter(item =>
        this.columns.every(col => {
          const query = this.searchQueries[col.key]?.toLowerCase().trim();
          if (!query) return true;
          return String(item[col.key] || '').toLowerCase().includes(query);
        })
      );
      return;
    }

    // 2. Remote Search (if listData is empty)
    // We call the server even if some fields are empty (the backend handles nulls)
    if (hasAnyLocalQuery) {
      this.pretService.getPretEnCoursLov(
        this.token.getUser().codSoc,
        this.searchQueries['mat_pers'],
        this.searchQueries['nomPers'],
        this.searchQueries['num_comm'],
        this.searchQueries['cod_etat_pret'],
        this.searchQueries['cod_pret'],
        this.searchQueries['mod_remb'],
        this.searchQueries['dat_saisie'],
        this.searchQueries['num_retr']
      ).subscribe(
        (data) => {
          this.filteredData = data;
          console.log('✅ Matches from server :', this.filteredData.length);
        },
        (error) => {
          console.error('Erreur lors du chargement des données :', error);
        }
      );
    } else {
      this.filteredData = [];
    }
  }

  // Trigger search for each column
  onSearch() {
    this.filterData(); // Call filter when user types in search fields
  }

  // Show all data (clear search)
  showAll() {
    this.searchQueries = {}; // Reset all search queries
    this.filteredData = this.listData; // Show all data
  }

  // Select an item and emit the selected value
  selectItem(item: any) {
    this.selectedCode = item[this.codeField] || '';
    this.selectedLabel = item[this.labelField] || '';
    console.log('data item :', item);
    this.selectedValue.emit(item);
  }

  // Open modal and load data
  openModal(content: any) {
    this.loadData(); // Load data when modal is opened
    this.modalService.open(content, { size: 'lg' });
  }

  // Load data (assume listData is already populated)
  loadData() {
    this.filteredData = [...this.listData]; // Copy initial data to filteredData
  }

  getEtatPret() {
    this.pretService.getEtatPret().subscribe(data => this.etatPret = data);
  }

  // Handle changes to the selected code
  onCodeChange() {
    const foundItem = this.listData.find(
      (item) => item[this.codeField] === this.selectedCode
    );
    if (foundItem) {
      this.selectedLabel = foundItem[this.labelField];
    } else {
      this.selectedLabel = '';
    }
  }
}
