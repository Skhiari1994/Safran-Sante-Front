import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { SaveService } from 'src/app/shared/Service/save.service';

@Component({
  selector: 'app-search-lov',
  templateUrl: './search-lov.component.html',
  styleUrls: ['./search-lov.component.scss']
})
export class SearchLovComponent {
  @Input() placeholder: string = 'Search...';
  @Input() listData: any[] = [];
  @Input() columns: any[] = [];
  @Input() codeField: string = 'cod_tit';
  @Input() labelField: string = 'lib_tit';
  @Output() selectedValue = new EventEmitter<any>();

  filteredData: any[] = [];
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

    // Check if there's at least one non-empty search query
    const hasAnyQuery = Object.values(this.searchQueries).some(q => q && q.trim() !== '');

    // If no search queries, show all data (like app-lov)
    if (!hasAnyQuery) {
      this.filteredData = [...this.listData];
      return;
    }

    // Filter data based on search queries
    this.filteredData = this.listData.filter(item =>
      this.columns.every(col => {
        const query = this.searchQueries[col.key]?.toLowerCase() || '';
        if (!query) return true; // No query for this column means include the item
        const value = item[col.key]?.toString().toLowerCase() || '';
        return value.includes(query);
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
