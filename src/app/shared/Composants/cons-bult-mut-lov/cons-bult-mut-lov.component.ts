import { lovMatch } from 'src/app/shared/lov-match';
import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { SaveService } from '../../Service/save.service';
import { BulletinSoinService } from 'src/app/pages/Remboursement des frais médicaux/Bulletin de soins/bulletin-soin.service';

@Component({
  selector: 'app-cons-bult-mut-lov',
  templateUrl: './cons-bult-mut-lov.component.html',
  styleUrl: './cons-bult-mut-lov.component.scss'
})
export class ConsBultMutLovComponent {
  @Input() placeholder: string = 'Search...';
  @Input() listData: any[] = [];
  @Input() columns: any[] = [];
  @Input() codeField: string[] = ['mat_pers','num_fam','dat_soin'];  // Peut contenir plusieurs champs
  @Input() labelField: string = 'lib_tit';
  @Output() selectedValue = new EventEmitter<any>();

  filteredData: any[] = [];
  searchQueries: { [key: string]: string } = {};  // Recherche sur plusieurs colonnes
  selectedCode: string = '';
  selectedLabel: string = '';
  searchSubject = new Subject<string>(); // Débounce pour la recherche
  @ViewChild('content') content!: TemplateRef<any>;

  private isSearchSubscription!: Subscription;
  private isModalOpen = false;

  constructor(
    private modalService: NgbModal,
    private saveService: SaveService,
    private BultService: BulletinSoinService,
    private token: TokenStorageService
  ) {}

  ngOnInit(): void {
    this.filteredData = this.listData;

    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.filterData();
    });

    this.isSearchSubscription = this.saveService.isSearch$.subscribe((value) => {
      if (value) {
        this.loadDataAndOpenModal();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.isSearchSubscription) {
      this.isSearchSubscription.unsubscribe();
    }
  }

  loadDataAndOpenModal() {
    if (this.isModalOpen || !this.content) {
      setTimeout(() => this.loadDataAndOpenModal(), 100);
      return;
    }
    this.isModalOpen = true;
    this.loadData();
    this.modalService.open(this.content, { size: 'lg' }).result.finally(() => {
      this.isModalOpen = false;
      this.saveService.setIsSearch(false);
    });
  }
  filterData() {
    const params: { [key: string]: string } = {};
  
    // Récupérer les valeurs des champs `codeField`
    for (const field of this.codeField) {
      const query = this.searchQueries[field]?.trim();
      if (query) {
        params[field] = query;
      }
    }
  
    const hasSearchQuery = Object.keys(params).length > 0; // Vérifier si au moins un paramètre est rempli
  
    if (hasSearchQuery) {
      console.log("Params envoyés :", params);
  
      this.BultService.getBultSoinCons(
        params['mat_pers'] || '',
        params['num_fam'] || '',
        params['dat_soin'] || ''
      ).subscribe(
        (data) => {
          this.filteredData = data;
          this.applyLocalFilters();
        },
        (error) => {
          console.error('Erreur lors du chargement des données :', error);
        }
      );
    } else {
      this.filteredData = [...this.listData]; 
      this.applyLocalFilters();
    }
  }
  
  
  applyLocalFilters() {
    const searchQueries = this.searchQueries;
    const hasSearch = Object.values(searchQueries).some(query => query && query.trim() !== '');

    if (hasSearch) {
      this.filteredData = this.filteredData.filter(item => {
        return this.columns.some(col => {
          const key = col.key;
          const query = searchQueries[key]?.trim().toLowerCase();
          return query ? lovMatch(key, item[key], query) : true;
        });
      });
    }
  }

  onSearch() {
    this.filterData();
  }

  showAll() {
    this.searchQueries = {}; 
    this.filteredData = this.listData;
  }

  selectItem(item: any) {
    this.selectedCode = this.codeField.map(field => item[field] || '').join(' | ');
    this.selectedLabel = item[this.labelField] || '';
    this.selectedValue.emit(item);
  }

  openModal(content: any) {
    this.loadData();
    this.modalService.open(content, { size: 'lg' });
  }

  loadData() {
    this.filteredData = [...this.listData];
  }

  onCodeChange() {
    const foundItem = this.listData.find(item =>
      this.codeField.some(field => item[field] === this.selectedCode)
    );
    this.selectedLabel = foundItem ? foundItem[this.labelField] : '';
  }
}