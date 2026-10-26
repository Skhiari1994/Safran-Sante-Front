import { DatePipe } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit, OnChanges, SimpleChanges, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface TableColumn<T = any> {
  header: string;
  field: keyof T;
  editable?: boolean;
  type?: string;
  natureChamp?: string;
  dateChamp?: string;
  selectChamp?: string;
  placeholder?: string;
  width?: string;
  dateFormat?: string; // Add a date format string for formatting dates
  mask?:string
  format?: 'date';
  selectOptions?: { label: string; value: any }[];
  lovField?:string;
  lovList?: Array<any>;
  lovColumns?: Array<any>;
  isLov?:boolean
  value?:string
  ignoreInForm?: boolean;
  updateFieldsOnSelect?: { [targetField: string]: string }; 
  onChange?: (value: any, row: FormGroup) => void;
  searchable?: boolean;

}

interface TableConfig<T = any> {
  columns: TableColumn<T>[];
  //rowsPerPage?: number;
  ISDeleted?:boolean
  /** Consultation : masque le bouton d'ajout de ligne et la colonne de suppression. */
  readonly?: boolean

}

interface GenericRow {
  [key: string]: any;
  id?: number | string | null;
}

@Component({
  selector: 'app-tableau',
  templateUrl: './tableau.component.html',
  styleUrls: ['./tableau.component.scss']
})
export class TableauComponent<T extends GenericRow> implements OnInit, OnChanges {
  @Input() config!: TableConfig<T>;
  searchFields: { [key: string]: string } = {}; // Holds search values for each column
  @Input() initialRows: T[] = []; // Input for initial rows
  @Output() formChange = new EventEmitter<FormArray>();
  @Output() deleteRowEvent = new EventEmitter<any>(); // Emit delete event
  @Output() submitFormEvent = new EventEmitter<any>();
  @Output() valueChanged = new EventEmitter<{ value: any; field: string; row: FormGroup }>();
  rowsForm: FormGroup;
  isAddingNewRow: boolean = false;
  currentPage: number = 1;
  private resizingColumnIndex: number | null = null;
  private startX: number = 0;
  private startWidth: number = 0;
  currentSortField: any = '';
  currentSortDirection: 'asc' | 'desc' | null = null;
 
  constructor(private fb: FormBuilder,private datePipe:DatePipe) {
    this.rowsForm = this.fb.group({
      rows: this.fb.array([])
    });
  }

  ngOnInit() {
    this.populateRows(this.initialRows); // Populate initial rows if available
    this.config.columns.forEach((column) => {
      if (column.searchable) {
        this.searchFields[column.field as string] = ''; // Default empty value
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialRows'] && changes['initialRows'].currentValue) {
      this.populateRows(changes['initialRows'].currentValue); // Re-populate when initialRows changes
    }
  }

  get rowsArray(): FormArray {
    return this.rowsForm.get('rows') as FormArray;
  }
  addRowToForm(rowData: T = {} as T, prepend: boolean = true) {
    const rowGroup = this.fb.group({}) as FormGroup;
  
    // Dynamically add controls based on the columns configuration
    this.config.columns.forEach(column => {
      let value = rowData[column.field] || '';
  
      if (column.ignoreInForm) {
        // Add a display-only control (not part of the reactive form)
        rowGroup.addControl(
          column.field as string, 
          this.fb.control({ value, disabled: true }) // Mark it as disabled
        );
        return; // Skip further processing for reactive form logic
      }
  
      // Apply date formatting if necessary
      if (column.format === 'date' && value) {
        value = this.formatDate(value);
      }
  
      // Add the control to the form group as a reactive form field
      const control = this.fb.control(
        value,
        // column.editable ? [Validators.required] : []
      );
  
      // Add formatting logic for editable fields (e.g., date)
      if (column.format === 'date') {
        control.valueChanges.subscribe(inputValue => {
          if (inputValue) {
            const formattedValue = this.formatDate(inputValue);
            if (formattedValue !== inputValue) {
              control.setValue(formattedValue, { emitEvent: false });
            }
          }
        });
      }
  
      rowGroup.addControl(column.field as string, control);
    });
  
    // Add the row group to the rows array
    if (prepend) {
      this.rowsArray.insert(0, rowGroup);
    } else {
      this.rowsArray.push(rowGroup);
    }
  }
  
  
  populateRows(initialRows: any[]) {
    this.rowsArray.clear(); // Clear existing rows before adding new ones
  
    if (!initialRows || initialRows.length === 0) {
      console.warn('No initial rows provided');
      return;
    }
  
    initialRows.forEach(rowData => {
      const rowGroup = this.fb.group({}); // Create a new form group
  
      // Dynamically add controls based on the column configuration
      this.config.columns.forEach((column: any) => {
        // Skip this field if `ignoreInForm` is set to `true`
        if (column.ignoreInForm) {
          // Store the value for non-form fields in the row (for display)
          //rowGroup.addControl(column.field as string, this.fb.control(rowData[column.field] || null));
          return;
        }
  
        const value = rowData[column.field] !== undefined ? rowData[column.field] : null;
  
        // Apply date formatting if column format is 'date'
        if (column.format === 'date' && value) {
          const formattedValue = this.datePipe.transform(value, 'dd/MM/yyyy');
          rowGroup.addControl(column.field as string, this.fb.control(formattedValue, column.editable ? [Validators.required] : []));
        } else {
          rowGroup.addControl(column.field as string, this.fb.control(value, column.editable ? [Validators.required] : []));
        }
      });
  
      this.rowsArray.push(rowGroup); // Add the new row group to the rows array
    });
  
    // Ensure all controls are updated
    this.rowsArray.controls.forEach(control => control.updateValueAndValidity());
  
    console.log('Populated rows:', this.rowsArray.value); // Log the populated rows for debugging
  }
  
  get filteredRows() {
    return this.rowsArray.controls.filter((row) => {
      return Object.keys(this.searchFields).every((field) => {
        const searchValue = this.searchFields[field]?.toLowerCase();
        const cellValue = row.get(field)?.value?.toString().toLowerCase();
        return !searchValue || cellValue.includes(searchValue);
      });
    });
  }
 
  deleteRow(index: number) {
    const rowId = this.rowsArray.at(index).value;
    console.log("rowId",rowId)
    if (rowId) {
      this.deleteRowEvent.emit(rowId); // Emit the row ID for deletion
    }
    this.rowsArray.removeAt(index);
  }

  editRow(row: FormGroup) {
    row.get('isEditing')?.setValue(true);
  }

  addNewEmptyRow() {
    this.isAddingNewRow = true;
    this.addRowToForm();
   // this.submitFormData()
   }

  saveRow(row: FormGroup) {
    row.get('isEditing')?.setValue(false);
    this.isAddingNewRow = false;
    this.emitFormChange();

  }

  handleEnterKey(event: KeyboardEvent) {
    event.preventDefault();

    if (this.isAddingNewRow) {
      const firstRow = this.rowsArray.at(0) as FormGroup;
      if (firstRow && firstRow.valid) {
        this.saveRow(firstRow);
        this.addNewEmptyRow();
      }
    } else if (this.rowsArray.length === 0 || !this.isAddingNewRow) {
      this.addNewEmptyRow();
    }
  }

  // get filteredRows() {
  //   return this.rowsArray.controls.filter((row: any) => {
  //     return Object.keys(this.searchFields).every(field => {
  //       const value = this.searchFields[field];
  //       if (value === null || value === '') return true;
  //       return row.get(field).value.toString().toLowerCase().includes(value.toString().toLowerCase());
  //     });
  //   });
  // }

  get paginatedRows() {
    const start = (this.currentPage - 1) * (/*this.config.rowsPerPage  ||*/ 1000);
    return this.filteredRows.slice(start, start + (/*this.config.rowsPerPage ||*/ 10003));
  }

  get totalPages() {
    return Math.ceil(this.filteredRows.length / (/*this.config.rowsPerPage ||*/ 300000));
  }

  changePage(page: number) {
    this.currentPage = page;
  }
  isDateField(column: TableColumn): boolean {
    return !!column.dateFormat; // Returns true if dateFormat is defined
  }
  emitFormChange() {
    this.formChange.emit(this.rowsArray); // Emit the FormArray
  }
  formatDate(dateString: string): string {
    // Ensure the string is in the format 'ddmmyyyy'
    if (dateString && dateString.length === 8) {
      const day = dateString.substring(0, 2);
      const month = dateString.substring(2, 4);
      const year = dateString.substring(4, 8);
      return `${day}/${month}/${year}`;
    }
    return dateString; 
  }

  formatInputDate(row: FormGroup, field: string): void {
    const value = row.get(field)?.value;
    if (value) {
      const formattedDate = this.datePipe.transform(value, 'dd/MM/yyyy');
      row.get(field)?.setValue(formattedDate, { emitEvent: false });
    }
   }
  onDateChange(value: string, row: FormGroup, field: string) {
    
      // Automatically format the date as 'dd/mm/yyyy'
      const formattedDate = this.formatDate(value);
      row.get(field)?.setValue(formattedDate);
    
  }
  submitFormData() {
    const formData = this.rowsArray.value.map((row:any) => {
      const serializedRow: any = {};
      this.config.columns.forEach(column => {
        if (!column.ignoreInForm) {
          serializedRow[column.field] = row[column.field];
        }
      });
      return serializedRow;
    });
    console.log('Submitting data:', formData);
    this.submitFormEvent.emit(formData); // Emit the data for submission
  }

  onLovSelected(selectedItem: any, row: FormGroup, field: string) {
  // Update the control in the row based on the selected item
  row.get(field)?.setValue(selectedItem?.[field]);

  // Handle additional field updates based on the LOV selection
  const column = this.config.columns.find(col => col.field === field);
  const updateFields = column?.updateFieldsOnSelect || {};

  Object.keys(updateFields).forEach(targetField => {
    const sourceField = updateFields[targetField];
    const valueToSet = selectedItem?.[sourceField];
    row.get(targetField)?.setValue(valueToSet);
  });
  console.log("column",column)

console.log("updateFields",updateFields)
  this.emitFormChange(); // Emit form change if necessary
}
  onChange(value: any, row: FormGroup, field: string) {
    console.log(`Field ${field} changed to ${value}`);
    this.valueChanged.emit({ value, field, row }); // Émet l'événement avec les détails du changement
  }
  toggleColumn(column: any) {
    column.isVisible = !column.isVisible;
  }

  onColumnResizeStart(event: MouseEvent, columnIndex: number): void {
    this.resizingColumnIndex = columnIndex;
    this.startX = event.pageX;
  
    // Access the specific column element and use getBoundingClientRect for precise width
    const target = (event.target as HTMLElement).parentElement as HTMLElement;
    this.startWidth = target.getBoundingClientRect().width;
  
    document.addEventListener('mousemove', this.onColumnResizeMove);
    document.addEventListener('mouseup', this.onColumnResizeEnd);
  }
  
  onColumnResizeMove = (event: MouseEvent): void => {
    if (this.resizingColumnIndex === null) return;
  
    const offset = event.pageX - this.startX;
    const newWidth = Math.max(this.startWidth + offset, 50); // Minimum width of 50px
  
    // Update the width dynamically
    this.config.columns[this.resizingColumnIndex].width = `${newWidth}px`;
  };
  
  onColumnResizeEnd = (): void => {
    this.resizingColumnIndex = null;
    document.removeEventListener('mousemove', this.onColumnResizeMove);
    document.removeEventListener('mouseup', this.onColumnResizeEnd);
  };

 

  // Sort rows based on a column
  sortData(column: TableColumn) {
    if (this.currentSortField === column.field) {
      // Toggle sorting direction
      this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new column to sort and default to ascending
      this.currentSortField = column.field;
      this.currentSortDirection = 'asc';
    }
  
    if (this.currentSortField) {
      // Perform sorting only if `currentSortField` is not null
      this.rowsArray.controls.sort((a, b) => {
        const valueA = a.get(this.currentSortField)?.value;
        const valueB = b.get(this.currentSortField)?.value;
  
        if (valueA < valueB) return this.currentSortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return this.currentSortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
  }

  
  
}