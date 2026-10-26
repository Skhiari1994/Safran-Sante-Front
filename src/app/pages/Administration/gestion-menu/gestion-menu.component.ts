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
  selectedModuleName = '';
  selectedNiv1Name = '';
  selectedNiv2Name = '';
  private persistedRows = new WeakSet<FormGroup>(); // lignes issues de la base (identifiant non modifiable)
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
    data.forEach(rowData => {
      const group = createRowFn(rowData);
      group.disable({ emitEvent: false }); // lecture seule jusqu'au clic sur Modifier
      this.persistedRows.add(group);
      rows.push(group);
    });
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
          rows.removeAt(rowIndex);
          Swal.fire('Supprimer!', 'Opération éffectuer avec succés.', 'success');
        }, error => {
          Swal.fire('Suppression impossible', typeof error?.error === 'string' && error.error ? error.error : 'Une erreur est survenue.', 'warning');
        });
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

    // une ligne jamais enregistrée (Evt id seulement pré-rempli) n'existe pas en base : simple retrait de l'écran
    if (rowId && this.persistedRows.has(row)) {

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
            Swal.fire('Supprimer!', 'Opération éffectuer avec succés.', 'success');
          }, error => {
            if (error?.status === 404) {
              rows.removeAt(rowIndex); // déjà absent de la base
              return;
            }
            Swal.fire('Suppression impossible', typeof error?.error === 'string' && error.error ? error.error : 'Une erreur est survenue.', 'warning');
          });
        }
      });
      
    } else {
      rows.removeAt(rowIndex); 
    }
  }
  saveRow(table: FormGroup, rowIndex: number): void {
    const row = this.getRows(table).at(rowIndex) as FormGroup;

    if (row.disabled) return;
    const formData = row.getRawValue();

    // Nouveau module : la séquence des identifiants est en retard sur la base, la création passe par un endpoint dédié.
    // Module existant : on conserve les colonnes que le tableau n'affiche pas (icône, collapseid...).
    const original = (this.subModule || []).find(m => m.sum_id === formData.sum_id);
    const appel = formData.sum_id
      ? this.serv.saveSubModule({ ...original, ...formData } as any)
      : this.serv.creerModule(formData);

    appel.subscribe((response: any) => {
        if (response?.sum_id) {
          row.get('sum_id')?.setValue(response.sum_id);
        }
        this.persistedRows.add(row);
        row.disable();
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Opération éffectuer avec succés',
          showConfirmButton: false,
          timer: 2000
        });
        this.fetchSubModule();
      }, () => {
        Swal.fire({ icon: 'error', title: 'Enregistrement impossible' });
      });
  }
  saveRowNiv1(table: FormGroup, rowIndex: number): void {
    const row = this.getRows(table).at(rowIndex) as FormGroup;
    if (row.disabled) return;
    const formData = row.getRawValue();

    if (this.selectedSumId !== null) {
      formData['sum_id'] = this.selectedSumId; // Add selected sum_id to formData

      this.serv.saveAdmeventtype(formData).subscribe(response => {
        console.log('Data saved successfully:', response);

        this.persistedRows.add(row);
        row.disable();
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Opération éffectuer avec succés',
          showConfirmButton: false,
          timer: 2000
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
    if (row.disabled) return;
    const formData = row.getRawValue();

    if (this.selectedSumId !== null) {
      formData['sum_id'] = this.selectedSumId; // Add selected sum_id to formData
      formData['evt_evt_id'] = this.selectedEvtId; // Add selected evt_id to formData

      this.serv.saveAdmeventtype(formData).subscribe(response => {
        console.log('Data saved successfully:', response);

        this.persistedRows.add(row);
        row.disable();
      }, error => {
        console.error('Error saving row to database:', error);
      });
    } else {
      console.error('No sum_id selected from table1');
    }
  }

  saveRowNiv3(table: FormGroup, rowIndex: number): void {
    const row = this.getRows(table).at(rowIndex) as FormGroup;
    if (row.disabled) return;
    const formData = row.getRawValue();

    if (this.selectedSumId !== null) {
      formData['sum_id'] = this.selectedSumId; // Add selected sum_id to formData
      formData['evt_evt_id'] = this.selectedEvtId2; // Add selected evt_id to formData

      this.serv.saveAdmeventtype(formData).subscribe(response => {
        console.log('Data saved successfully:', response);

        this.persistedRows.add(row);
        row.disable();
      }, error => {
        console.error('Error saving row to database:', error);
      });
    } else {
      console.error('No sum_id selected from table1');
    }
  }
  editRow(table: FormGroup, rowIndex: number): void {
    const row = this.getRows(table).at(rowIndex) as FormGroup;
    row.enable();
    if (this.persistedRows.has(row)) {
      // l'identifiant d'une ligne existante ne se modifie pas
      row.get('sum_id')?.disable();
      row.get('evt_id')?.disable();
    }
  }

  onRowClick(sum_id: number, name: string = ''): void {
    if (!sum_id || sum_id === this.selectedSumId) return; // ligne non enregistrée ou déjà sélectionnée
    this.selectedSumId = sum_id;
    this.selectedModuleName = name;
    this.selectedEvtId = null;
    this.selectedEvtId2 = null;
    this.selectedNiv1Name = '';
    this.selectedNiv2Name = '';
    this.getRows(this.table3).clear();
    this.getRows(this.table4).clear();
    this.serv.getAdmEvntType(sum_id).subscribe(otherData => {
      this.populateTable(this.table2, otherData, this.createTable2Row.bind(this));
    });
  }

  onRowClickNiv1(evt: number, name: string = ''): void {
    if (!evt || evt === this.selectedEvtId) return;
    this.selectedEvtId = evt;
    this.selectedNiv1Name = name;
    this.selectedEvtId2 = null;
    this.selectedNiv2Name = '';
    this.getRows(this.table4).clear();
    this.serv.getAdmEvntType2(evt).subscribe(otherData => {
      this.populateTable(this.table3, otherData, this.createTable3Row.bind(this));
    });
  }

  onRowClickNiv2(evt: number, name: string = ''): void {
    if (!evt || evt === this.selectedEvtId2) return;
    this.selectedEvtId2 = evt;
    this.selectedNiv2Name = name;
    this.serv.getAdmEvntType2(evt).subscribe(otherData => {
      this.populateTable(this.table4, otherData, this.createTable4Row.bind(this));
    });
  }

  private ajoutEnCours = false;

  /** Rang suivant parmi les lignes du tableau (donc parmi les enfants du parent sélectionné) : dernier + 1. */
  private prochainRang(table: FormGroup, champ: 'sum_rank' | 'evt_rank'): number {
    const rangs = this.getRows(table).controls
      .map(r => Number((r as FormGroup).getRawValue()[champ]))
      .filter(n => Number.isFinite(n) && n > 0);
    return rangs.length ? Math.max(...rangs) + 1 : 1;
  }

  /** Ajoute un module avec le rang suivant (dernier + 1). */
  addRowModule(): void {
    this.addRow(this.table1, this.createTable1Row.bind(this), { sum_rank: this.prochainRang(this.table1, 'sum_rank') });
  }

  /**
   * Ajoute une ligne de sous-module (niveau 1, 2 ou 3) : le parent doit être sélectionné
   * et l'Evt id est pré-rempli avec le prochain identifiant libre.
   */
  addRowNiv(table: FormGroup, createRowFn: (data?: any) => FormGroup, niveau: 1 | 2 | 3): void {
    const parent = niveau === 1 ? this.selectedSumId : niveau === 2 ? this.selectedEvtId : this.selectedEvtId2;
    if (parent === null) {
      const consigne = niveau === 1
        ? 'Sélectionnez d\'abord un module.'
        : niveau === 2
          ? 'Sélectionnez d\'abord un sous-module de niveau 1.'
          : 'Sélectionnez d\'abord un sous-module de niveau 2.';
      Swal.fire({ icon: 'info', title: consigne, confirmButtonColor: '#405189' });
      return;
    }
    if (this.ajoutEnCours) return;

    const rang = this.prochainRang(table, 'evt_rank');
    const idsDe = (t: FormGroup) => this.getRows(t).controls
      .map(r => Number((r as FormGroup).getRawValue().evt_id))
      .filter(id => Number.isFinite(id) && id > 0);
    const ids = idsDe(table);
    // identifiants des autres tableaux affichés (y compris non enregistrés) à ne pas réutiliser
    const autres = new Set([this.table2, this.table3, this.table4].filter(t => t !== table).flatMap(idsDe));
    // Niveau 1 vide : aucun repère pour deviner l'identifiant, on laisse le champ à saisir.
    const base = ids.length ? Math.max(...ids) : (niveau === 1 ? null : Number(parent));
    if (base === null) {
      this.addRow(table, createRowFn, { evt_rank: rang });
      return;
    }

    this.ajoutEnCours = true;
    const proposer = (from: number): void => {
      this.serv.getNextEvtId(from).subscribe({
        next: (res: any) => {
          const next = res?.nextId;
          if (next && autres.has(next)) {
            proposer(next);
            return;
          }
          this.ajoutEnCours = false;
          this.addRow(table, createRowFn, { evt_id: next ?? '', evt_rank: rang });
        },
        error: () => {
          this.ajoutEnCours = false;
          this.addRow(table, createRowFn, { evt_rank: rang });
        }
      });
    };
    proposer(base);
  }



  fetchSubModule(){
    this.serv.getAdmSubModule().subscribe(data => {
      this.subModule = data; // données de référence pour conserver les colonnes non affichées
    })
  }
}
