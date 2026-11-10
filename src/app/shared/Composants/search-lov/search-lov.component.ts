import { lovMatch } from 'src/app/shared/lov-match';
import { Component, EventEmitter, Input, OnChanges, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { SaveService } from 'src/app/shared/Service/save.service';

@Component({
  selector: 'app-search-lov',
  templateUrl: './search-lov.component.html',
  styleUrls: ['./search-lov.component.scss']
})
export class SearchLovComponent implements OnChanges {
  @Input() placeholder: string = 'Search...';
  @Input() listData: any[] = [];
  @Input() columns: any[] = [];
  /** Colonnes jamais montrées dans la fenêtre (ni champ de filtre, ni colonne du tableau) : le matricule administratif. */
  @Input() hiddenKeys: string[] = ['mat_int'];
  /** Affiche un filtre Sexe (Tous / Masculin / Féminin) ; les lignes doivent porter un champ `sexe` (M ou F). */
  @Input() filtreSexe = false;
  /** '' = tous, sinon 'M' ou 'F'. */
  sexeFiltre: '' | 'M' | 'F' = '';
  /** Colonnes réellement affichées = columns moins hiddenKeys. */
  visibleColumns: any[] = [];

  ngOnChanges(): void {
    this.visibleColumns = (this.columns || []).filter(c => !this.hiddenKeys.includes(c.key));
  }
  @Input() codeField: string = 'cod_tit';
  @Input() labelField: string = 'lib_tit';
  @Output() selectedValue = new EventEmitter<any>();

  /** Nombre de lignes créées dans le tableau : afficher des dizaines de milliers de lignes bloque le navigateur. */
  readonly taillePage = 100;
  private limiteAffichage = this.taillePage;
  /** Lignes réellement affichées (début de filteredData) ; la suite arrive au défilement. */
  affichees: any[] = [];

  private _filteredData: any[] = [];
  get filteredData(): any[] {
    return this._filteredData;
  }
  /** Chaque nouvelle liste (ouverture, recherche) repart des 100 premières lignes. */
  set filteredData(valeur: any[]) {
    this._filteredData = valeur || [];
    this.limiteAffichage = this.taillePage;
    this.affichees = this._filteredData.slice(0, this.limiteAffichage);
  }

  /** Largeur d'un champ de filtre selon le nombre de colonnes : 2 à 4 champs par ligne, jamais une longue pile. */
  get colClass(): string {
    const n = this.visibleColumns.length;
    if (n <= 2) return 'col-12 col-md-6';
    if (n === 3) return 'col-12 col-md-4';
    if (n === 4) return 'col-12 col-sm-6 col-lg-3';
    if (n <= 6) return 'col-12 col-sm-6 col-lg-4';
    return 'col-12 col-sm-6 col-lg-3';
  }

  hasQuery(): boolean {
    return Object.values(this.searchQueries).some(q => !!q && q.trim() !== '') || this.sexeFiltre !== '';
  }

  /** Effectifs affichés à côté de chaque option du filtre Sexe (calculés à l'ouverture sur toute la liste). */
  comptesSexe = { tous: 0, M: 0, F: 0 };

  private compterSexes(): void {
    const c = { tous: 0, M: 0, F: 0 };
    for (const item of this.listData || []) {
      c.tous++;
      const s = String(item?.sexe ?? '').trim().toUpperCase();
      if (s === 'M') c.M++;
      else if (s === 'F') c.F++;
    }
    this.comptesSexe = c;
  }

  /** Choix du filtre Sexe : un clic sur le même bouton ne le retire pas, « Tous » sert à ça. */
  choisirSexe(valeur: '' | 'M' | 'F'): void {
    this.sexeFiltre = valeur;
    this.filterData();
  }

  /** Défilement vers le bas du tableau : on ajoute les 100 lignes suivantes. */
  onScrollTableau(event: Event): void {
    const el = event.target as HTMLElement;
    if (this.affichees.length < this._filteredData.length && el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
      this.limiteAffichage += this.taillePage;
      this.affichees = this._filteredData.slice(0, this.limiteAffichage);
    }
  }

  searchQueries: { [key: string]: string } = {};  // This will store search queries for each column
  selectedCode: string = '';
  selectedLabel: string = '';
  searchSubject = new Subject<string>(); // Debounce subject
  @ViewChild('content') content!: TemplateRef<any>;
  private isSearchSubscription!: Subscription;
  private dateFormatCache = new Map<any, string>(); // Cache for formatted dates

  constructor(private modalService: NgbModal, private saveService: SaveService) { }

  ngOnInit(): void {
    this.filteredData = this.listData;

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
    // Clear search queries and show all data when modal opens
    this.searchQueries = {};
    this.sexeFiltre = '';
    if (this.filtreSexe) this.compterSexes();
    this.filteredData = [...this.listData]; // Show all data immediately
    this.modalService.open(this.content, { size: 'xl' }).result.finally(() => {
      this.isModalOpen = false; // Reset modal state
      this.saveService.setIsSearch(false); // Reset isSearch
    });
  }


  // Filter data based on individual column search
  filterData() {
    if (!this.columns || this.columns.length === 0) {
      // No columns defined: return empty
      this.filteredData = [];
      return;
    }

    // Check if there's at least one non-empty search query (champs texte ou filtre Sexe)
    const hasAnyQuery = this.hasQuery();

    // If no search queries, show all data (like app-lov)
    if (!hasAnyQuery) {
      this.filteredData = [...this.listData];
      return;
    }

    // Filter data based on search queries
    this.filteredData = this.listData.filter(item =>
      (!this.sexeFiltre || String(item?.sexe ?? '').trim().toUpperCase() === this.sexeFiltre) &&
      this.columns.every(col => {
        const query = this.searchQueries[col.key]?.toLowerCase() || '';
        if (!query) return true; // No query for this column means include the item
        const value = item[col.key]?.toString().toLowerCase() || '';
        return lovMatch(col.key, value, query);
      })
    );
  }


  // Trigger search for each column
  onSearch() {
    this.filterData(); // Call filter when user types in search fields
  }

  // Show all data (clear search)
  showAll() {
    this.searchQueries = {}; // Reset all search queries
    this.sexeFiltre = '';
    this.filteredData = this.listData; // Show all data
  }

  // Select an item and emit the selected value
  selectItem(item: any) {
    this.selectedCode = item[this.codeField] || '';
    this.selectedLabel = item[this.labelField] || '';
    this.selectedValue.emit(item);
  }

  // Open modal and load data
  openModal(content: any) {
    // Clear search queries and show all data when modal opens
    this.searchQueries = {};
    this.sexeFiltre = '';
    if (this.filtreSexe) this.compterSexes();
    this.filteredData = [...this.listData]; // Show all data immediately
    this.modalService.open(content, { size: 'xl' });
  }

  // Track by function for performance
  trackByFn(index: number, item: any): any {
    return item[this.codeField] || index;
  }

  // Load data (assume listData is already populated)
  loadData() {
    console.log('=== SEARCH-LOV loadData ===');
    console.log('listData length:', this.listData?.length);
    console.log('columns:', this.columns);

    if (this.listData && this.listData.length > 0) {
      console.log('First item:', this.listData[0]);
      console.log('mat_int:', this.listData[0].mat_int);
      console.log('dat_nais:', this.listData[0].dat_nais);
    }

    this.filteredData = [...this.listData]; // Copy initial data to filteredData
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

  // Format date value from Oracle timestamp string to dd/MM/yyyy
  formatDateValue(value: any): string {
    if (!value) {
      return '';
    }

    // Check cache first
    if (this.dateFormatCache.has(value)) {
      return this.dateFormatCache.get(value)!;
    }

    let formatted: string;

    // If it's already a Date object
    if (value instanceof Date) {
      const day = String(value.getDate()).padStart(2, '0');
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const year = value.getFullYear();
      formatted = `${day}/${month}/${year}`;
    }
    // If it's a string (Oracle timestamp format: "1968-08-04 00:00:00.0")
    else if (typeof value === 'string') {
      // Extract date part before the space
      const datePart = value.split(' ')[0];

      if (datePart && datePart.includes('-')) {
        const parts = datePart.split('-');
        if (parts.length === 3) {
          const year = parts[0];
          const month = parts[1];
          const day = parts[2];
          formatted = `${day}/${month}/${year}`;
        } else {
          formatted = value;
        }
      } else {
        formatted = value;
      }
    } else {
      formatted = value;
    }

    // Cache the result
    this.dateFormatCache.set(value, formatted);
    return formatted;
  }
}
