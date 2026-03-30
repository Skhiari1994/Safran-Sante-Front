import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { AdminService } from '../Admin.service';
import { subModule } from '../subModule.model';

@Component({
  selector: 'app-gestion-menu',
  templateUrl: './gestion-menu.component.html',
  styleUrl: './gestion-menu.component.scss'
})
export class GestionMenuComponent {

  table1!: FormGroup;
  table2!: FormGroup;
  table3!: FormGroup;
  table4!: FormGroup;
  subModule!: subModule[]; // Assuming subModule is the correct type for your data
  selectedSumId: number | null = null;
  selectedEvtId : number | null = null;
  selectedEvtId2 : number | null = null;
  selectedRowIndex: number | null = null;
  breadCrumbItems!: Array<{}>;
  constructor(
    private fb: FormBuilder,
    private serv: AdminService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.fetchDataForTables();
  }

  initializeForms(): void {
    this.table1 = this.createTableForm();
    this.table2 = this.createTableForm();
    this.table3 = this.createTableForm();
    this.table4 = this.createTableForm();
  }

  createTableForm(): FormGroup {
    return this.fb.group({
      rows: this.fb.array([])
    });
  }

  createTable1Row(data: any = {}): FormGroup {
    return this.fb.group({
      sum_id:[data.sum_id || ''],
      sum_name: [data.sum_name || ''],
      sum_rout: [data.sum_rout || ''],
      sum_status: [data.sum_status || ''],
      sum_rank: [data.sum_rank || '']

    });
  }

  createTable2Row(data: any = {}): FormGroup {
    return this.fb.group({
      evt_id:[data.evt_id || ''],
      evt_name: [data.evt_name || ''],
      evt_action: [data.evt_action || ''],
      evt_rank: [data.evt_rank || ''],
      evt_maint:[data.evt_maint || '']

    });
  }

  createTable3Row(data: any = {}): FormGroup {
    return this.fb.group({
      evt_id:[data.evt_id || ''],
      evt_name: [data.evt_name || ''],
      evt_action: [data.evt_action || ''],
      evt_rank: [data.evt_rank || ''],
      evt_maint:[data.evt_maint || '']

    });
  }

  createTable4Row(data: any = {}): FormGroup {
    return this.fb.group({
      evt_id:[data.evt_id || ''],
      evt_name: [data.evt_name || ''],
      evt_action: [data.evt_action || ''],
      evt_rank: [data.evt_rank || ''],
      evt_maint:[data.evt_maint || '']

    });
  }

  fetchDataForTables(): void {
    this.serv.getAdmSubModule().subscribe(data => {
      this.subModule = data;
      this.populateTable(this.table1, data, this.createTable1Row.bind(this));
    });
  }

  populateTable(table: FormGroup, data: subModule[], createRowFn: (data: any) => FormGroup): void {
    const rows = this.getRows(table);
    rows.clear(); // Clear existing rows before populating new data
    data.forEach(rowData => rows.push(createRowFn(rowData)));
  }

  getRows(table: FormGroup): FormArray {
    return table.get('rows') as FormArray;
  }

  addRow(table: FormGroup, createRowFn: (data?: any) => FormGroup, data: any = {}): void {
    this.getRows(table).push(createRowFn(data));
  }

  removeRow(table: FormGroup, rowIndex: number): void {
    const rows = this.getRows(table);
    const row = rows.at(rowIndex) as FormGroup;
    const rowId = row.get('sum_id')?.value; // Assuming 'sum_id' is the unique identifier in your row form

    if (rowId) {    
      Swal.fire({
      title: 'Es-tu sûr?',
      text: 'Tu ne pourras pas revenir en arrière!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#34c38f',
      cancelButtonColor: '#f46a6a',
      confirmButtonText: 'Oui, Supprimer le!'
    }).then(result => {
      if (result.value) {
        this.serv.DeleteSubModule(rowId).subscribe(() => {
        
          rows.removeAt(rowIndex); // Remove row from form array if deletion is successful
        }, error => {
          Swal.fire('Supprimer!', error, 'warning');
        });

        Swal.fire('Supprimer!', 'Opération éffectuer avec succés.', 'success');
        
      }
    });

    } else {
      rows.removeAt(rowIndex); // If there is no 'sum_id', simply remove the form group from form array
    }
  }
  removeRowEvt(table: FormGroup, rowIndex: number): void {
    const rows = this.getRows(table);
    const row = rows.at(rowIndex) as FormGroup;
    const rowId = row.get('evt_id')?.value; 

    if (rowId) {

      Swal.fire({
        title: 'Es-tu sûr?',
        text: 'Tu ne pourras pas revenir en arrière!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#34c38f',
        cancelButtonColor: '#f46a6a',
        confirmButtonText: 'Oui, Supprimer le!'
      }).then(result => {
        if (result.value) {
          this.serv.DeleteEvt(rowId).subscribe(() => {
            rows.removeAt(rowIndex); 
          }, error => {
            Swal.fire('Supprimer!', error, 'warning');
          });
  
          Swal.fire('Supprimer!', 'Opération éffectuer avec succés.', 'success');
          
        }
      });
      
    } else {
      rows.removeAt(rowIndex); 
    }
  }
  saveRow(table: FormGroup, rowIndex: number): void {
    const row = this.getRows(table).at(rowIndex) as FormGroup;

    const formData = row.value;

   this.serv.saveSubModule(formData).subscribe((response:any) => {

        Object.keys(row.controls).forEach(key => {
          row.get(key)?.disable();
        });
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Opération éffectuer avec succés',
          showConfirmButton: false,
          timer: 2000
        });
      });
      this.fetchSubModule()
  }
  saveRowNiv1(table: FormGroup, rowIndex: number): void {
    const row = this.getRows(table).at(rowIndex) as FormGroup;
    const formData = row.value;

    if (this.selectedSumId !== null) {
      formData['sum_id'] = this.selectedSumId; // Add selected sum_id to formData

      this.serv.saveAdmeventtype(formData).subscribe(response => {
        console.log('Data saved successfully:', response);

        Object.keys(row.controls).forEach(key => {
          row.get(key)?.disable();
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Opération éffectuer avec succés',
            showConfirmButton: false,
            timer: 2000
          });
        });
      }, error => {
        console.error('Error saving row to database:', error);
      });
    } else {
      console.error('No sum_id selected from table1');
    }
  }
  saveRowNiv2(table: FormGroup, rowIndex: number): void {
    const row = this.getRows(table).at(rowIndex) as FormGroup;
    const formData = row.value;

    if (this.selectedSumId !== null) {
      formData['sum_id'] = this.selectedSumId; // Add selected sum_id to formData
      formData['evt_evt_id'] = this.selectedEvtId; // Add selected evt_id to formData

      this.serv.saveAdmeventtype(formData).subscribe(response => {
        console.log('Data saved successfully:', response);

        Object.keys(row.controls).forEach(key => {
          row.get(key)?.disable();
        });
      }, error => {
        console.error('Error saving row to database:', error);
      });
    } else {
      console.error('No sum_id selected from table1');
    }
  }

  saveRowNiv3(table: FormGroup, rowIndex: number): void {
    const row = this.getRows(table).at(rowIndex) as FormGroup;
    const formData = row.value;

    if (this.selectedSumId !== null) {
      formData['sum_id'] = this.selectedSumId; // Add selected sum_id to formData
      formData['evt_evt_id'] = this.selectedEvtId2; // Add selected evt_id to formData

      this.serv.saveAdmeventtype(formData).subscribe(response => {
        console.log('Data saved successfully:', response);

        Object.keys(row.controls).forEach(key => {
          row.get(key)?.disable();
        });
      }, error => {
        console.error('Error saving row to database:', error);
      });
    } else {
      console.error('No sum_id selected from table1');
    }
  }
  editRow(table: FormGroup, rowIndex: number): void {
    const row = this.getRows(table).at(rowIndex) as FormGroup;
    Object.keys(row.controls).forEach(key => {
      row.get(key)?.enable();
    });
  }

  onRowClick(sum_id: number): void {
    this.selectedSumId = sum_id;
    //console.log("this.subModule"+this.subModule.sum_id)
    this.serv.getAdmEvntType(sum_id).subscribe(otherData => {
      this.populateTable(this.table2, otherData, this.createTable2Row.bind(this));
    });
  }

  onRowClickNiv1(evt: number): void {
    this.selectedEvtId=evt
    //console.log("this.subModule"+this.subModule.sum_id)
    this.serv.getAdmEvntType2(evt).subscribe(otherData => {
      this.populateTable(this.table3, otherData, this.createTable3Row.bind(this));
    });
  }

  onRowClickNiv2(evt: number): void {
    this.selectedEvtId2=evt
    //console.log("this.subModule"+this.subModule.sum_id)
    this.serv.getAdmEvntType2(evt).subscribe(otherData => {
      this.populateTable(this.table4, otherData, this.createTable4Row.bind(this));
    });
  }

  fetchSubModule(){
    this.serv.getAdmSubModule().subscribe(data =>{

    })
  }
}
