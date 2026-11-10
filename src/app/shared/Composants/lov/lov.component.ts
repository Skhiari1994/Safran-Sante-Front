import { lovMatch } from 'src/app/shared/lov-match';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  HostListener,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

interface ListDataItem {
  [key: string]: any;
}

@Component({
  selector: 'app-lov',
  templateUrl: './lov.component.html',
  styleUrls: ['./lov.component.scss'],
})
export class LovComponent implements OnInit, OnChanges {
  @Input() placeholder: string = 'Search...';
  @Input() listData: ListDataItem[] = [];
  @Input() columns: { key: string; label: string }[] = [];
  @Input() codeField: string = '';
  @Input() selectedItem: ListDataItem | null = null;
  @Input() selectedCode: string = ''; // Input for patching code
  @Input() disabled: boolean = false; // Lecture seule : champ grisé et recherche masquée
  @Output() selectedValue = new EventEmitter<ListDataItem>();
  @Output() selectedCodeChange = new EventEmitter<string>(); // Two-way binding

  /** Colonnes jamais montrées dans la fenêtre (ni champ de filtre, ni colonne du tableau) : le matricule administratif. */
  @Input() hiddenKeys: string[] = ['mat_int'];
  /** Colonnes réellement affichées = columns moins hiddenKeys. */
  visibleColumns: { key: string; label: string }[] = [];

  /** Nombre de lignes créées dans le tableau : afficher des milliers de lignes d'un coup bloque le navigateur. */
  readonly taillePage = 100;
  private limiteAffichage = this.taillePage;
  /** Lignes réellement affichées (début de filteredData) ; la suite arrive au défilement. */
  affichees: ListDataItem[] = [];

  private _filteredData: ListDataItem[] = [];
  get filteredData(): ListDataItem[] {
    return this._filteredData;
  }
  /** Chaque nouvelle liste (ouverture, recherche) repart des 100 premières lignes. */
  set filteredData(valeur: ListDataItem[]) {
    this._filteredData = valeur || [];
    this.limiteAffichage = this.taillePage;
    this.affichees = this._filteredData.slice(0, this.limiteAffichage);
  }

  /** Défilement vers le bas du tableau : on ajoute les 100 lignes suivantes. */
  onScrollTableau(event: Event): void {
    const el = event.target as HTMLElement;
    if (this.affichees.length < this._filteredData.length && el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
      this.limiteAffichage += this.taillePage;
      this.affichees = this._filteredData.slice(0, this.limiteAffichage);
    }
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
    return Object.values(this.columnSearchQueries).some(q => !!q && q.trim() !== '');
  }
  columnSearchQueries: { [key: string]: string } = {}; // Individual column search queries
  searchSubject = new Subject<string>(); // Debounce subject
  errorMessage: string = ''; // Property to track errors

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
    this.visibleColumns = (this.columns || []).filter(c => !this.hiddenKeys.includes(c.key));
    this.filteredData = [...this.listData];
    this.initializeColumnSearchQueries();

    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.filterData();
    });

    if (this.selectedItem) {
      this.selectedCode = this.selectedItem[this.codeField] ?? '';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.visibleColumns = (this.columns || []).filter(c => !this.hiddenKeys.includes(c.key));

    if (changes['listData']) {
      this.filteredData = Array.isArray(this.listData) ? [...this.listData] : [];
      if (this.listData && this.listData.length > 0 && this.hasCode(this.selectedCode)) {
        this.patchValue(this.selectedCode);
      }
    }

    if (changes['selectedItem'] && this.selectedItem) {
      this.selectedCode = this.selectedItem[this.codeField] ?? '';
    }

    if (changes['selectedCode'] && this.hasCode(changes['selectedCode'].currentValue)) {
      this.patchValue(changes['selectedCode'].currentValue);
    }
  }
  /** Un code est présent même s'il vaut 0 (ex. numéro de famille 0 = adhérent). */
  private hasCode(code: any): boolean {
    return code !== null && code !== undefined && String(code).trim() !== '';
  }

  initializeColumnSearchQueries(): void {
    this.columnSearchQueries = {};
    if (this.columns) {
      this.columns.forEach((column) => {
        this.columnSearchQueries[column.key] = '';
      });
    }
  }

  filterData(): void {
    // Check if there's at least one non-empty search query
    const hasAnyQuery = Object.values(this.columnSearchQueries).some(q => q && q.trim() !== '');

    // If no search queries, show empty list
    if (!hasAnyQuery) {
      this.filteredData = [];
      return;
    }

    // Filter data based on search queries
    this.filteredData = this.listData.filter((item) => {
      return Object.keys(this.columnSearchQueries).every((key) => {
        const query = this.columnSearchQueries[key]?.toLowerCase().trim();

        // Skip empty queries - don't filter on empty fields
        if (!query) {
          return true;
        }

        // Get the field value, handle null/undefined
        const fieldValue = item[key];

        // If field is null/undefined and query is not empty, don't match
        if (fieldValue == null) {
          return false;
        }

        // Convert to string and check if it includes the query
        return lovMatch(key, fieldValue, query);
      });
    });
  }

  onColumnSearch(): void {
    this.searchSubject.next('');
  }

  showAll(): void {
    this.initializeColumnSearchQueries();
    this.filteredData = [...this.listData];
  }

  /** Vide le champ code (utilisé par « Retour » / « Nouveau » des pages de saisie). */
  clear(): void {
    this.selectedItem = null;
    this.selectedCode = '';
    this.errorMessage = '';
  }

  selectItem(item: ListDataItem): void {
    this.selectedItem = item;
    this.selectedCode = item[this.codeField] ?? '';
    this.selectedValue.emit(item);
    this.errorMessage = ''; // Clear error on selection
  }

  openModal(content: any): void {
    // champs de filtre vidés à l'ouverture : on repart donc de la liste complète (100 premières lignes)
    this.initializeColumnSearchQueries();
    this.filteredData = [...this.listData];
    this.modalService.open(content, { size: 'xl' });
  }
  patchValue(patchedCode: any): void {
    if (patchedCode == null) return;
    const normalizedCode = patchedCode.toString().trim().toLowerCase();
    const foundItem = this.listData.find(
      (item) =>
        item[this.codeField]?.toString().trim().toLowerCase() === normalizedCode
    );

    // if (foundItem) {
    //   this.selectedItem = foundItem;
    //   this.selectedCode = foundItem[this.codeField];
    //   this.selectedCodeChange.emit(this.selectedCode);
    //   this.selectedValue.emit(foundItem);
    //   this.errorMessage = '';
    // } else {
    //   this.errorMessage = this.listData && this.listData.length > 0 ? 'Valeur introuvable.' : '';
    //   this.selectedItem = null;
    //   if (this.listData && this.listData.length > 0) {
    //     this.selectedCode = '';
    //     this.selectedCodeChange.emit(this.selectedCode);
    //   }
    // }

    if (foundItem) {
      this.selectedItem = foundItem;
      this.selectedCode = foundItem[this.codeField];
      this.selectedCodeChange.emit(this.selectedCode);
      this.selectedValue.emit(foundItem);
      this.errorMessage = '';
    } else {
      this.errorMessage = this.listData && this.listData.length > 0 ? 'Valeur introuvable.' : '';
      this.selectedItem = null;
      this.selectedCode = patchedCode;
      this.selectedCodeChange.emit(this.selectedCode);
      this.selectedValue.emit({ [this.codeField]: patchedCode });
    }

  }
  @HostListener('focusout', ['$event'])
  onCodeChange(): void {
    const normalizedCode = String(this.selectedCode ?? '').trim().toLowerCase();

    if (normalizedCode) {
      const foundItem = this.listData.find(
        (item) =>
          item[this.codeField]?.toString().trim().toLowerCase() === normalizedCode
      );

      if (foundItem) {
        this.selectedItem = foundItem;
        this.selectedValue.emit(foundItem);
        this.errorMessage = '';
      } else {
        this.errorMessage = this.listData && this.listData.length > 0 ? 'Valeur introuvable.' : '';
        this.selectedValue.emit(undefined);
      }
    } else {
      this.errorMessage = this.listData && this.listData.length > 0 ? 'Code vide ou invalide.' : '';
      this.selectedValue.emit(undefined);
    }
  }

  trackByFn(index: number, item: ListDataItem): any {
    return item[this.codeField];
  }

  // Format date value from Oracle timestamp string to dd/MM/yyyy
  formatDateValue(value: any): string {
    if (!value) {
      return '';
    }

    // If it's already a Date object
    if (value instanceof Date) {
      const day = String(value.getDate()).padStart(2, '0');
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const year = value.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // If it's a string (Oracle timestamp format: "1968-08-04 00:00:00.0")
    if (typeof value === 'string') {
      // Extract date part before the space
      const datePart = value.split(' ')[0];

      if (datePart && datePart.includes('-')) {
        const parts = datePart.split('-');
        if (parts.length === 3) {
          const year = parts[0];
          const month = parts[1];
          const day = parts[2];
          return `${day}/${month}/${year}`;
        }
      }
    }

    return value;
  }
}
