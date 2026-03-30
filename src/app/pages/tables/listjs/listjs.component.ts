import { ChangeDetectorRef, Component, HostListener, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators, FormGroup } from '@angular/forms';

// Sweet Alert
import Swal from 'sweetalert2';

import { ListJsModel } from './listjs.model';
import { paginationlist, dataattribute, existingList, FuzzyList } from './data';
import { OrdersService } from './listjs.service';
import { NgbdListSortableHeader, listSortEvent } from './listjs-sortable.directive';
import { AdherentService } from '../../Adherent/adherent.service';
import { TableConfig } from 'src/app/shared/Composants/tableau/table-config.model';
import { TableauComponent } from 'src/app/shared/Composants/tableau/tableau.component';
 
interface MyData {
  nom_pren: string;
  num_fam: number;
}
@Component({
  selector: 'app-listjs',
  templateUrl: './listjs.component.html',
  styleUrls: ['./listjs.component.scss'],
  providers: [OrdersService, DecimalPipe]

})

/**
 * Listjs table Component
 */
export class ListjsComponent {
  labelMap: { [rowId: string]: string } = {}; // Store labels per row
  rows = []; // Your initial rows data
  label='string'
  tableConfig = {
    columns: [
        { header: 'nom_pren', field: 'nomPren', editable: true, width: '200px', natureChamp: 'code' ,},
        { header: 'dat_naiss', field: 'datNaiss', editable: true, mask: '00/00/0000', format: 'date', width: '200px' },
        {
            header: 'Code',
            field: 'numFam',
            editable: true,
            isLov: true,  
            lovField: '',
            width: '80px',
            lovList: [],
             lovColumns: [{ key: 'numFam', label: 'num_fam' }, { key: 'nomPren', label: 'Name' }],
            updateFieldsOnSelect: { 'label': 'nomPren'}  
        },
        { header: 'label', field: 'label', editable: true, width: '200px', natureChamp: 'code' },
 
    ],
    rowsPerPage: 8,
};


  searchFields = {};
  dataRows: MyData[] = []; 
    constructor(private modalService: NgbModal, public service: OrdersService, private formBuilder: UntypedFormBuilder,private serv :AdherentService, private cdRef: ChangeDetectorRef) {
   
  }

  ngOnInit(): void {
 this. loadStatusOptions()
this.getCodeListData()
  }
  onFormChange(rowsForm: FormArray) {
    // Handle the form array received from the child component
    console.log('Form rows:', rowsForm.value.rows); // This will log the current state of the form
    // You can also do other actions, like saving to a server or processing the data further
    
  }
  @ViewChild('tableauComponentRef') tableauComponent!: TableauComponent<any>;
labelTest?:string
  // Example method to test access to rowsForm
  testAccessToRowsForm() {
    if (this.tableauComponent) {
      console.log(this.tableauComponent.rowsForm.value); // Log the current rowsForm value
      // You can manipulate or use rowsForm here as needed
    }
  }

  // Event handler for when a row is added
  handleRowAdded(event: any) {
    console.log('Row added:', event);
  }

  // Event handler for when a row is deleted
  deleteRow(id: any) {
    console.log("id",id)
   /* this.http.delete(`YOUR_API_ENDPOINT/${id}`).subscribe({
      next: () => {
        // Remove the row from the data array after successful deletion
        this.rows = this.rows.filter(row => row.id !== id);
      },
      error: (err) => {
        console.error('Error deleting row:', err);
      }
    });*/
  }

  loadStatusOptions() {

   /* this.serv.getStatusOptions('01', '998').subscribe(
      (options: any) => {  
        console.log("options",options)    // Update the table configuration with the fetched select options
      const statusColumn = this.tableConfig.columns.find(col => col.field === 'num_fam');
      if (statusColumn) {
        
      }
    });*/
  }
  getCodeListData() {
    this.serv.getEnfants('01', '998').subscribe(
        (data: any) => {
            this.dataRows = data;

            // Set the lovList for the column in tableConfig
            const codeColumn = this.tableConfig.columns.find(column => column.field === 'numFam');
            if (codeColumn) {
                codeColumn.lovList = data;
                 // Iterate over each item in the data array and assign it to selectOptions
               

                this.cdRef.markForCheck();
            }
        },
        error => {
            console.error('Error fetching data:', error);
        }
    );
}



handleLabelSelected(rowId:any) {
  console.log("rowId :",rowId.target.value)
  //console.log("label :",label)

  // this.labelMap[rowId] = label; // Update label for the specific row
  // console.log(`Label for row ${rowId}:`, label);
}
}