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
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
const API_URL = environment.urlServer;
interface ListDataItem {
  [key: string]: any;
}

//;

@Component({
  selector: 'app-matricule-lov',
  templateUrl: './matricule-lov.component.html',
  styleUrl: './matricule-lov.component.scss',
})
export class MatriculeLovComponent implements OnInit, OnChanges {
  @Input() placeholder: string = 'Search...';
  @Input() columns: { key: string; label: string }[] = [];
  @Input() codeField: string = '';
  @Input() selectedItem: ListDataItem | null = null;
  @Input() selectedCode: string = '';
  @Output() selectedValue = new EventEmitter<ListDataItem>();
  @Output() selectedCodeChange = new EventEmitter<string>();

  filteredData: ListDataItem[] = [];
  columnSearchQueries: { [key: string]: string } = {};
  searchSubject = new Subject<void>();
  errorMessage: string = '';

  constructor(private modalService: NgbModal, private http: HttpClient) {}

  ngOnInit(): void {
    this.initializeColumnSearchQueries();
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => this.filterData());

    if (this.selectedCode) {
      this.fetchData(this.selectedCode);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCode'] && changes['selectedCode'].currentValue) {
      this.fetchData(changes['selectedCode'].currentValue);
    }
  }

  initializeColumnSearchQueries(): void {
    this.columnSearchQueries = {};
    this.columns.forEach((column) => {
      this.columnSearchQueries[column.key] = '';
    });
  }

  fetchData(inputValue: string): void {
    const normalizedValue = inputValue.trim().toLowerCase();
    if (!normalizedValue) return;

    // Determine if a column search value exists
    const searchValues = Object.values(this.columnSearchQueries).filter((val) => val.trim() !== '');
    const searchString = searchValues.length > 0 ? searchValues[0].trim().toLowerCase() : normalizedValue;

    const foundItem = this.filteredData?.find((item) =>
      Object.values(item).some((value) => value?.toString().trim().toLowerCase() === searchString)
    );

    if (foundItem) {
      this.selectItem(foundItem);
    } else {
      this.getPersonnelsByMat(searchString).subscribe(
        (data) => {
          this.filteredData = data;
          this.patchValue(searchString);
        },
        () => {
          this.errorMessage = 'Valeur introuvable';
         // this.resetSelection();
        }
      );
    }
  }

  getPersonnelsByMat(mat: string): Observable<any[]> {
    return this.http.get<any[]>(API_URL+`adherent/Personnel/getPersonnelles/${mat}`);
  }

  filterData(): void {
    if (!this.filteredData) return;

    this.filteredData = this.filteredData.filter((item) =>
      Object.keys(this.columnSearchQueries).every((key) => {
        const query = this.columnSearchQueries[key].toLowerCase();
        return item[key]?.toString().toLowerCase().includes(query);
      })
    );
  }

  onColumnSearch(): void {
    this.searchSubject.next();
    const searchValue = Object.values(this.columnSearchQueries).find((val) => val.trim() !== '');
    if (searchValue) {
      this.fetchData(searchValue);
    }
  }

  showAll(): void {
    this.initializeColumnSearchQueries();
  }

  selectItem(item: ListDataItem): void {
    this.selectedItem = item;
    //this.selectedCode = item[this.codeField] || '';
    this.selectedValue.emit(item);
    this.selectedCodeChange.emit(this.selectedCode);
    this.errorMessage = '';
  }

  openModal(content: any): void {
    this.modalService.open(content, { size: 'lg' });
  }

  patchValue(patchedCode: string): void {
    const normalizedCode = patchedCode.trim().toLowerCase();
    const foundItem = this.filteredData.find((item) =>
      Object.values(item).some((value) => value?.toString().trim().toLowerCase() === normalizedCode)
    );

    if (foundItem) {
      this.selectItem(foundItem);
    } else {
      this.errorMessage = 'Valeur introuvable';
      //this.resetSelection();
    }
  }

  resetSelection(): void {
    this.selectedItem = null;
    this.selectedCode = '';
    this.selectedCodeChange.emit(this.selectedCode);
  }

  @HostListener('focusout')
  onCodeChange(): void {
    const normalizedCode = this.selectedCode?.trim().toLowerCase();
    if (normalizedCode) {
      this.fetchData(normalizedCode);
    } else {
      this.errorMessage = 'Code vide ou invalide';
      this.selectedValue.emit(undefined);
    }
  }

  trackByFn(index: number, item: ListDataItem): any {
    return item[this.codeField];
  }
}
