import { Component, Input, Output,EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
 
@Component({
  selector: 'app-lov',
  templateUrl: './lov.component.html',
  styleUrl: './lov.component.scss'
})
export class LovComponent {
   @Input() placeholder: string = 'Search...';
  @Input() listData: any[] = []; // Liste dynamique de données
  @Input() columns: any[] = []; // Colonnes dynamiques
  @Input() codeField: string = 'cod_tit'; // Champ dynamique pour le code
  @Input() labelField: string = 'lib_tit'; // Champ dynamique pour le libellé
  @Input() dynamicFields: any[] = []; // Liste des champs d'entrée dynamiques
  @Output() selectedValue = new EventEmitter<any>(); // Émet la valeur sélectionnée

  filteredData: any[] = [];
  searchQuery: string = '';
  selectedCode: string = '';
  //selectedLabel: string = '';
  formData: any = {}; // Object pour stocker les valeurs des champs dynamiques

  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {
    this.filteredData = this.listData;
  }

  onSearch() {
    this.filteredData = this.listData.filter(item =>
      this.columns.some(col =>
        item[col.key]?.toString().toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    );
  }

  selectItem(item: any) {
    this.selectedCode = item[this.codeField] || ''; 
    //this.selectedLabel = item[this.labelField] || '';
    this.selectedValue.emit(item); // Émet l'élément sélectionné
  }

  openModal(content: any) {
    this.modalService.open(content, { size: 'lg' });
  }

  // onCodeChange() {
  //   const foundItem = this.listData.find(item => item[this.codeField] === this.selectedCode); 
  //   if (foundItem) {
  //     this.selectedLabel = foundItem[this.labelField];
  //   } else {
  //     this.selectedLabel = '';
  //   }
  // }
}