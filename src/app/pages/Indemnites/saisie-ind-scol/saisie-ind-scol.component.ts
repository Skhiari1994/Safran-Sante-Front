// ========== COMPLETELY REWRITTEN saisie-ind-scol.component.ts ==========
// Clean implementation with proper field clearing logic

import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { IndemnitesService } from '../indemnites.service';
import { TokenStorage } from 'src/app/account/token-storage.service';
import Swal from 'sweetalert2';
import { SaveService } from 'src/app/shared/Service/save.service';

interface ScolIndemnite {
  id?: number;
  mat_pers: string;
  nom_pers: string;
  num_fam: number | null;
  nom_fam: string;
  mnt_dem_don: number;
  mnt_livre: number;
  mode_payement: string;
  nat_don: string;
  cod_lieu_geog: string;
  cod_affect: string;
  corps?: string;
  typ_don?: string;
  cod_soc?: string;
  dat_dem_don?: string;
  _unsaved?: boolean;
  _isNew?: boolean;
  _famKey?: number;
  _original_num_fam?: number | null;
}

@Component({
  selector: 'app-saisie-ind-scol',
  templateUrl: './saisie-ind-scol.component.html',
  styleUrls: ['./saisie-ind-scol.component.scss']
})
export class SaisieIndScolComponent implements OnInit, OnDestroy {
  @ViewChild('dt') table!: Table;

  // Data lists
  listIndemnites: ScolIndemnite[] = [];
  listPersonnel: any[] = [];
  listTypDon: any[] = [];
  listLieu: any[] = [];
  
  // Per-row family lists (isolated per employee)
  private familyByRow = new Map<number, any[]>();
  private familyLoading = new Set<number>();

  // Selection and state
  selectedTypeOfIndemnite: string = '';
  selectedCodeLieu: string = '';
  libNatDon: string = '';
  libLieu: string = '';
  max_mnt_don: number = 0;
  codAffect: string = '';
  selectedRows: ScolIndemnite[] = [];
  
  // Column definitions
  columnsSearch: any[] = [];
  columnsNat: any[] = [];
  columnsLieu: any[] = [];
  columnFamille: any[] = [
    { key: 'num_fam', label: 'Num fam' },
    { key: 'nom_pren', label: 'Nom' },
    { key: 'dat_naiss', label: 'Date naissance' }
  ];

  modePayementOptions = [
    { label: 'Virement', value: 'V' },
    { label: 'Espèce', value: 'E' },
    { label: 'Chèque', value: 'C' }
  ];

  // Tracking changes
  private newRows: ScolIndemnite[] = [];
  private modifiedRows: ScolIndemnite[] = [];
  private newRowTempId = -1;
  private currentEditingRow: ScolIndemnite | null = null;
  private destroy$ = new Subject<void>();
  now() { return Date.now(); }

  constructor(
    private adherentServ: AdherentService,
    private indemniteServ: IndemnitesService,
    private tokenStorage: TokenStorage,
    private messageService: MessageService,
    private saveService: SaveService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDependencies();
    this.saveService.registerSaveCallback(() => this.saveAllChanges());
    this.saveService.registerDeletCallback(() => this.deleteSelectedRows());
    this.saveService.setDisabled(true);
    this.saveService.setDisabledDelete(true);
    this.saveService.setIsDisabledSearch(true);

    this.saveService.add$
      .pipe(takeUntil(this.destroy$))
      .subscribe((add) => {
        if (add) {
          this.addNewRow();
          this.saveService.setAdded(false);
        }
      });

    this.saveService.isSearch$
      .pipe(takeUntil(this.destroy$))
      .subscribe((doSearch) => {
        if (doSearch) {
          this.searchIndemnites();
          this.saveService.setIsSearch(false);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== INITIALIZATION ====================

  loadDependencies() {
    // Load locations
    this.adherentServ.getLieu().subscribe({
      next: (data) => {
        this.listLieu = data;
        this.columnsLieu = [
          { key: 'cod_lieu_geog', label: 'Code' },
          { key: 'lib_lieu', label: 'Libellé' },
          { key: 'lib_lieu_a', label: 'Libellé arabe' }
        ];
      },
      error: (error) => this.handleError(error)
    });

    // Load donation types
    this.indemniteServ.getgetListNatDon().subscribe({
      next: (data) => {
        this.listTypDon = data;
        this.columnsNat = [
          { key: 'lib_nat_Don', label: 'Libellé' },
          { key: 'max_mnt_don', label: 'Plafond' },
          { key: 'concerne', label: 'Concerne' },
          { key: 'cod_affect', label: 'Affectation' }
        ];
      },
      error: (error) => this.handleError(error)
    });
  }

  onSelectedValueLieu(item: any) {
    this.selectedCodeLieu = item.cod_lieu_geog;
    this.libLieu = item.lib_lieu;
    this.loadPersonnel();
    this.updateButtonStates();
  }

  onSelectedValueTypDon(item: any) {
    this.selectedTypeOfIndemnite = item.nat_Don;
    this.libNatDon = item.lib_nat_Don;
    this.max_mnt_don = item.max_mnt_don;
    this.codAffect = item.cod_affect || '';
    this.updateButtonStates();
  }

  loadPersonnel() {
    this.indemniteServ.getPersIndAff(
      this.tokenStorage.getUser().codSoc, 
      this.selectedCodeLieu
    ).subscribe({
      next: (data) => {
        // Transform data to ensure mat_int is never null (replace null with empty string)
        this.listPersonnel = data.map(person => ({
          ...person,
          mat_int: person.mat_int || ''
        }));
        
        this.columnsSearch = [
          { key: 'mat_pers', label: 'Matricule' },
          { key: 'mat_int', label: 'Mat. Administratif' },
          { key: 'nom_pers', label: 'Nom' },
          { key: 'pren_pers', label: 'Prénom' },
          { key: 'dat_nais', label: 'Date Naissance' },
          { key: 'num_retr', label: 'Id unique' },
          { key: 'cin', label: 'CIN' }
        ];
      },
      error: (error) => this.handleError(error)
    });
  }

  // ==================== SEARCH ====================

  searchIndemnites() {
    if (!this.selectedCodeLieu || !this.selectedTypeOfIndemnite) {
      this.showMessage('warn', 'Sélectionnez Direction et Type don');
      return;
    }

    this.indemniteServ.PersIndValid(
      this.tokenStorage.getUser().codSoc,
      this.selectedCodeLieu,
      this.selectedTypeOfIndemnite
    ).subscribe({
      next: (data) => {
        this.listIndemnites = (data || []).map((r: any, idx: number) => ({
          id: idx + 1,
          mat_pers: r.mat_pers || '',
          nom_pers: r.nom_pers || '',
          num_fam: r.num_fam != null ? Number(r.num_fam) : null,
          nom_fam: r.num_fam != null && Number(r.num_fam) === 0 ? (r.nom_pers || '') : (r.nom_fam || ''),
          mnt_dem_don: Number(r.mnt_dem_don) || 0,
          mnt_livre: Number(r.mnt_livre) || 0,
          mode_payement: r.mode_payement || 'V',
          nat_don: r.nat_don || this.selectedTypeOfIndemnite,
          cod_lieu_geog: this.selectedCodeLieu,
          cod_affect: this.codAffect,
          typ_don: r.typ_don || 'I',
          cod_soc: r.cod_soc || this.tokenStorage.getUser().codSoc,
          dat_dem_don: r.dat_dem_don,
          corps: r.corps,
          _unsaved: false,
          _isNew: false,
          _famKey: 0,
          _original_num_fam: r.num_fam != null ? Number(r.num_fam) : null
        }));

        // Load family data for existing rows
        this.listIndemnites.forEach(row => {
          if (row.mat_pers && row.num_fam) {
            this.loadFamilyForRow(row);
          }
        });

        this.showMessage('success', `${this.listIndemnites.length} indemnités trouvées`);
      },
      error: (error) => this.handleError(error)
    });
  }

  // ==================== ROW MANAGEMENT ====================

  addNewRow() {
  if (!this.selectedTypeOfIndemnite) {
    this.showMessage('warn', 'Veuillez sélectionner un type de don');
    return;
  }
  if (!this.selectedCodeLieu) {
    this.showMessage('warn', 'Veuillez sélectionner une direction');
    return;
  }

  // Close any open editing row
  if (this.currentEditingRow) {
    this.table?.cancelRowEdit(this.currentEditingRow);
    this.currentEditingRow = null;
  }

  const newRow: ScolIndemnite = {
    id: this.newRowTempId--,
    mat_pers: '',
    nom_pers: '',
    num_fam: null,
    nom_fam: '',
    mnt_dem_don: 0,
    mnt_livre: 0,
    mode_payement: 'V',
    nat_don: this.selectedTypeOfIndemnite,
    cod_lieu_geog: this.selectedCodeLieu,
    cod_affect: this.codAffect,
    typ_don: 'I',
    cod_soc: this.tokenStorage.getUser().codSoc,
    _unsaved: true,
    _isNew: true,
    _famKey: 0,
    _original_num_fam: null
  };

  // Add the row and update arrays
  this.listIndemnites = [newRow, ...this.listIndemnites];
  this.newRows.push(newRow);
  this.selectedRows = [newRow];
  this.updateButtonStates();

  // Use a small delay to ensure the row is rendered in the DOM
  setTimeout(() => {
    this.startEditingNewRow(newRow);
  }, 50);
}

private startEditingNewRow(row: ScolIndemnite) {
  // Force change detection to ensure template is updated
  this.cdr.detectChanges();
  
  try {
    // Start editing the row
    this.table?.initRowEdit(row);
    this.currentEditingRow = row;
    
    // One more change detection to ensure edit mode is active
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 50);
  } catch (error) {
    console.error('Error starting edit mode:', error);
    // Retry once if failed
    setTimeout(() => {
      this.table?.initRowEdit(row);
      this.currentEditingRow = row;
      this.cdr.detectChanges();
    }, 100);
  }
}

closeRowEdit(rowData: ScolIndemnite) {
  this.table?.cancelRowEdit(rowData);
  if (this.currentEditingRow === rowData) {
    this.currentEditingRow = null;
  }
  this.cdr.detectChanges();
}

  markAsUnsaved(row: ScolIndemnite) {
    if (!row) return;
    
    row._unsaved = true;
    
    // Validate montant livré
    if (row.mnt_livre && row.mnt_dem_don && row.mnt_livre > row.mnt_dem_don) {
      row.mnt_livre = row.mnt_dem_don;
      this.showMessage('warn', 'Le montant livré ne doit pas dépasser le montant demandé');
    }
    
    // Track in modified rows if not new
    if (!row._isNew && !this.modifiedRows.includes(row)) {
      this.modifiedRows.push(row);
    }
    
    this.updateButtonStates();
  }

  // ==================== PERSONNEL SELECTION ====================
onPersonnelSelect(rowData: ScolIndemnite, personnel: any) {
  if (!personnel || !rowData) return;
  
  const previousMat = rowData.mat_pers;
  const isSamePersonnel = !!previousMat && previousMat === personnel.mat_pers;

  console.log('👤 Personnel selected:', personnel.mat_pers, personnel.nom_pers);
  
  // Update row with personnel info
  rowData.mat_pers = personnel.mat_pers;
  rowData.nom_pers = `${personnel.nom_pers || ''} ${personnel.pren_pers || ''}`.trim();
  rowData.corps = personnel.corps;
  
  // Only clear family fields when the personnel actually changes
  if (!isSamePersonnel) {
    this.clearFamilyFields(rowData);
  }
  
  // Load family list for this employee (synchronously)
  this.loadFamilyForRow(rowData);
  
  this.markAsUnsaved(rowData);
  
  // Force UI update
  this.cdr.detectChanges();
}
// Debug method to check LOV state
private debugLOVState(row: ScolIndemnite, mode: string) {
  console.log(`🔍 LOV Debug - ${mode}:`, {
    rowId: row.id,
    numFam: row.num_fam,
    hasFamilyList: this.familyByRow.has(row.id!),
    familyListSize: this.familyByRow.get(row.id!)?.length || 0,
    currentEditing: this.currentEditingRow?.id,
    inEditMode: this.currentEditingRow?.id === row.id
  });
}
  loadFamilyForRow(row: ScolIndemnite) {
    if (!row.mat_pers || !row.id) return;
    if (this.familyLoading.has(row.id)) return;
    this.familyLoading.add(row.id);

    this.indemniteServ.getFamilleEnfant(
      this.tokenStorage.getUser().codSoc,
      row.mat_pers
    ).subscribe({
      next: (data) => {
        let famList = (data || []).map((d: any) => ({
          num_fam: d?.num_fam != null ? String(d.num_fam) : '',
          nom_pren: d?.nom_pren ?? d?.NOM_PREN ?? d?.nom ?? d?.NOM ?? '',
          dat_naiss: d?.dat_naiss ?? d?.datNaiss ?? d?.dat_nais ?? ''
        }));

        // Fallback to general famille if enfants empty
        if (!famList.length) {
          this.indemniteServ.getFamille(
            this.tokenStorage.getUser().codSoc,
            row.mat_pers
          ).subscribe({
            next: (alt) => {
              famList = (alt || []).map((d: any) => ({
                num_fam: d?.num_fam != null ? String(d.num_fam) : '',
                nom_pren: d?.nom_pren ?? d?.NOM_PREN ?? d?.nom ?? d?.NOM ?? '',
                dat_naiss: d?.dat_naiss ?? d?.datNaiss ?? d?.dat_nais ?? ''
              }));
              const hasZeroAlt = famList.some((f: any) => f.num_fam === '0');
              if (!hasZeroAlt && row.nom_pers) {
                famList.unshift({ num_fam: '0', nom_pren: row.nom_pers, dat_naiss: '' });
              }
              this.familyByRow.set(row.id!, famList);
              this.familyLoading.delete(row.id!);
              this.cdr.detectChanges();
            },
            error: (error) => {
              this.familyLoading.delete(row.id!);
              this.handleError(error);
            }
          });
        } else {
          // Ensure adherent (num_fam '0') is present
          const hasZero = famList.some((f: any) => f.num_fam === '0');
          if (!hasZero && row.nom_pers) {
            famList.unshift({ num_fam: '0', nom_pren: row.nom_pers, dat_naiss: '' });
          }
          this.familyByRow.set(row.id!, famList);
          this.familyLoading.delete(row.id!);
          this.cdr.detectChanges();
        }

        if (row.num_fam != null && famList.length > 0) {
          const famille = famList.find((f: any) => String(f.num_fam) === String(row.num_fam));
          if (famille && !row.nom_fam) {
            row.nom_fam = String(famille.num_fam) === '0' ? (row.nom_pers || '') : famille.nom_pren;
          }
        }
      },
      error: (error) => {
        this.familyLoading.delete(row.id!);
        this.handleError(error);
      }
    });
  }
// ==================== LOV REFRESH FIX ====================

// Force refresh of LOV components when entering edit mode
  startRowEdit(rowData: ScolIndemnite) {
    this.debugLOVState(rowData, 'Before Edit');
    if (this.currentEditingRow && this.currentEditingRow !== rowData) {
      this.table?.cancelRowEdit(this.currentEditingRow);
    }

    if (!this.listPersonnel?.length && this.selectedCodeLieu) {
      this.loadPersonnel();
    }

    // Force change detection before starting edit
    this.cdr.detectChanges();
  
  if (rowData.mat_pers && !this.familyByRow.has(rowData.id!) && !this.familyLoading.has(rowData.id!)) {
    this.loadFamilyForRow(rowData);
  }
  
  // bump per-row key to force LOV refresh once per edit
  rowData._famKey = (rowData._famKey || 0) + 1;
  this.table?.initRowEdit(rowData);
  this.currentEditingRow = rowData;
  
  // Force another change detection after edit mode is activated
  setTimeout(() => {
    this.cdr.detectChanges();
  }, 50);
    setTimeout(() => {
    this.debugLOVState(rowData, 'After Edit');
  }, 100);
}
  getFamilleListForRow(row: ScolIndemnite): any[] {
    if (!row.id) return [];
    const cached = this.familyByRow.get(row.id) || [];
    if (cached.length > 0) return cached;
    // If not loaded yet, ensure we show at least the adherent option immediately
    if (row.mat_pers && !this.familyLoading.has(row.id)) {
      this.loadFamilyForRow(row);
    }
    if (row.nom_pers) {
      return [{ num_fam: '0', nom_pren: row.nom_pers, dat_naiss: '' }];
    }
    return [];
  }

  toSelectedCode(row: ScolIndemnite): string {
    return row.num_fam != null ? String(row.num_fam) : '';
  }

famKey(rowData: ScolIndemnite, editing: boolean): string {
  return `fam_${rowData.id}_${rowData._famKey || 0}_${editing ? 'edit' : 'view'}`;
}

  onFamilleSelect(rowData: ScolIndemnite, famille: any) {
  if (!famille || !rowData) {
    return;
  }

  console.log('👨‍👩‍👧 Family selected:', famille.num_fam, famille.nom_pren);

  // Find actual row in list
  const actualRow = this.listIndemnites.find(r => r.id === rowData.id);
  if (!actualRow) {
    console.error('Row not found!');
    return;
  }

  // If the same family is re-applied on an existing row (e.g. when entering edit mode),
  // skip validations to avoid popping errors just for opening edit.
  const originalNumFamForSkip = actualRow.num_fam ?? null;
  const selectedNumFamForSkip = famille?.num_fam != null ? Number(famille.num_fam) : null;
  if (originalNumFamForSkip != null && selectedNumFamForSkip != null && originalNumFamForSkip === selectedNumFamForSkip && !actualRow._isNew) {
    console.log('🔁 Same family re-selected for existing row (actualRow); skipping validation.');
    // Ensure UI stays consistent
    actualRow.num_fam = originalNumFamForSkip;
    // nom_fam is already the saved one
    this.cdr.detectChanges();
    return;
  }

  // Prevent double processing
  if ((actualRow as any)._processing) {
    console.log('⏳ Already processing...');
    return;
  }

  (actualRow as any)._processing = true;

  const tempNumFam = Number(famille.num_fam);
  const tempNomFam = tempNumFam === 0 ? (actualRow.nom_pers || '') : famille.nom_pren;
  const datSaisie = this.getCurrentDate();

  // Store the current state to revert if validation fails
  const originalNumFam = actualRow.num_fam;
  const originalNomFam = actualRow.nom_fam;

  // TEMPORARILY update the UI to show selection (will be reverted if validation fails)
  actualRow.num_fam = tempNumFam;
  actualRow.nom_fam = tempNomFam;

  // ✅ First validation: Check if family already benefited
  const dataFamProcScol = {
    codSoc: this.tokenStorage.getUser().codSoc,
    matPers: actualRow.mat_pers,
    numFam: Number(tempNumFam),
    natDon: this.selectedTypeOfIndemnite,
    datDemDon: datSaisie,
  };

  console.log('🔍 Step 1: Validating family (execProcFamScol)...', dataFamProcScol);

  this.indemniteServ.execProcFamScol(dataFamProcScol).subscribe({
    next: (resp) => {
      const valid = Number(resp.valid);
      console.log('✅ First validation result:', valid, 'Status:', resp.p_status);

      if (valid === 0) {
        // ✅ First validation PASSED - proceed to second validation
        const datProcTypDon = {
          natDon: this.selectedTypeOfIndemnite,
          codAffect: this.codAffect,
          typDon: 'I',
          codSoc: this.tokenStorage.getUser().codSoc,
          matPers: actualRow.mat_pers,
          numFam: Number(tempNumFam),
          datDemDon: datSaisie
        };

        console.log('🔍 Step 2: Validating donation type (execProcTypDon)...');

        this.indemniteServ.execProcTypDon(datProcTypDon).subscribe({
          next: (response) => {
            const valid2 = Number(response.valid);
            console.log('✅ Second validation result:', valid2, 'Status:', response.p_status);

            (actualRow as any)._processing = false;

            if (valid2 === 4) {
              // ✅✅ BOTH VALIDATIONS PASSED - KEEP THE UPDATED VALUES
              console.log('✅ All validations passed! Keeping valid data...');
              
              actualRow.mnt_dem_don = this.max_mnt_don;
              
              this.markAsUnsaved(actualRow);
              this.cdr.detectChanges();
              
              console.log('✅ SUCCESS! Row updated:', actualRow);
            } else {
              // ❌ Second validation FAILED - REVERT to original values
              console.log('❌ Second validation failed - Reverting row data');
              
              actualRow.num_fam = originalNumFam;
              actualRow.nom_fam = originalNomFam;
              actualRow.mnt_dem_don = 0;
              
              this.cdr.detectChanges();
              
              Swal.fire({
                icon: 'warning',
                title: 'Validation échouée',
                text: response.p_status || 'L\'adhérent a déjà bénéficié de cette indemnité',
                confirmButtonText: 'OK'
              });
            }
          },
          error: (error) => {
            console.error('❌ Second validation error:', error);
            (actualRow as any)._processing = false;
            
            // ❌ On error - REVERT to original values
            actualRow.num_fam = originalNumFam;
            actualRow.nom_fam = originalNomFam;
            actualRow.mnt_dem_don = 0;
            
            this.cdr.detectChanges();
            this.handleError(error);
          }
        });
      } else {
        // ❌ First validation FAILED - REVERT to original values
        console.log('❌ First validation failed - Reverting row data');
        (actualRow as any)._processing = false;
        
        actualRow.num_fam = originalNumFam;
        actualRow.nom_fam = originalNomFam;
        actualRow.mnt_dem_don = 0;
        
        this.cdr.detectChanges();
        
        Swal.fire({
          icon: 'warning',
          title: 'Validation échouée',
          text: resp.p_status || 'Veuillez vérifier si cet adhérent n\'a pas encore bénéficié de cette indemnité pour le même prestataire',
          confirmButtonText: 'OK'
        });
      }
    },
    error: (error) => {
      console.error('❌ First validation error:', error);
      (actualRow as any)._processing = false;
      
      // ❌ On error - REVERT to original values
      actualRow.num_fam = originalNumFam;
      actualRow.nom_fam = originalNomFam;
      actualRow.mnt_dem_don = 0;
      
      this.cdr.detectChanges();
      this.handleError(error);
    }
  });
}

  // ==================== CLEARING FIELDS ====================

  private clearFamilyFields(row: ScolIndemnite) {
    row.num_fam = null;
    row.nom_fam = '';
    row.mnt_dem_don = 0;
    row.mnt_livre = 0;
  }

  // ==================== SAVE ====================

  saveAllChanges() {
    if (this.currentEditingRow) {
      this.table?.cancelRowEdit(this.currentEditingRow);
      this.currentEditingRow = null;
    }

    const rowsToSave = [...this.newRows, ...this.modifiedRows];
    const validRows = rowsToSave.filter(r => this.validateRow(r));

    if (validRows.length === 0) {
      this.showMessage('info', 'Aucun changement à sauvegarder');
      return;
    }

    const datSaisie = this.getCurrentDate();
    const user = this.tokenStorage.getUser();
    const deleteCandidates = this.modifiedRows.filter(r => !r._isNew && r._original_num_fam != null && r._original_num_fam !== r.num_fam);
    const deletePayload = deleteCandidates.map(r => this.transformOriginalRowToDeleteDTO(r, datSaisie, user));
    const savePayload = validRows.map(r => this.transformRowToDTO(r, datSaisie, user));

    console.log('💾 Saving', validRows.length, 'rows:', savePayload);

    const proceedSave = () => {
      this.indemniteServ.saveDelocage(savePayload).subscribe({
        next: () => {
          Swal.fire('Enregistré !', 'Vos changements ont été enregistrés.', 'success');
          deleteCandidates.forEach(r => { r._original_num_fam = r.num_fam; });
          this.resetAndRefresh();
        },
        error: (error) => this.handleError(error)
      });
    };

    if (deletePayload.length > 0) {
      this.indemniteServ.deleteDelocage(deletePayload).subscribe({
        next: () => proceedSave(),
        error: (error) => this.handleError(error)
      });
    } else {
      proceedSave();
    }
  }

  private validateRow(row: ScolIndemnite): boolean {
    if (!row.mat_pers?.trim()) {
      this.showMessage('error', 'Le matricule est obligatoire');
      return false;
    }

    const isAdherent = row.num_fam === 0;

    if (row.num_fam == null && !isAdherent) {
      this.showMessage('error', `Le numéro de famille est obligatoire pour ${row.nom_pers}`);
      return false;
    }

    if (row.mnt_dem_don <= 0) {
      this.showMessage('error', 'Le montant doit être supérieur à zéro');
      return false;
    }

    if (row.mnt_dem_don > this.max_mnt_don) {
      this.showMessage('error', `Le montant ne doit pas dépasser ${this.max_mnt_don}`);
      return false;
    }

    return true;
  }

  private transformRowToDTO(row: ScolIndemnite, datSaisie: string, user: any): any {
    const numFamValue = row.num_fam ? Number(row.num_fam) : 0;
    const benef = numFamValue !== 0 ? 'E' : 'A';

    return {
      typ_don: row.typ_don || 'I',
      cod_soc: row.cod_soc || user.codSoc,
      mat_pers: row.mat_pers,
      num_fam: numFamValue,
      mnt_dem_don: row.mnt_dem_don,
      mnt_livre: row.mnt_livre || 0,
      mode_payement: row.mode_payement,
      nat_don: row.nat_don,
      cod_lieu_geog: row.cod_lieu_geog,
      cod_affect: row.cod_affect || '',
      mnt_acc_don: row.mnt_dem_don + (row.mnt_livre || 0),
      typ_benificiaire: benef,
      cod_fond: '01',
      corps: row.corps || '',
      etat_dem: 'I',
      dat_saisie: datSaisie,
      dat_dem_don: row.dat_dem_don || datSaisie
    };
  }

  private transformOriginalRowToDeleteDTO(row: ScolIndemnite, datSaisie: string, user: any) {
    const numFamValue = row._original_num_fam != null ? Number(row._original_num_fam) : 0;
    return {
      typ_don: row.typ_don || 'I',
      cod_soc: row.cod_soc || user.codSoc,
      mat_pers: row.mat_pers,
      num_fam: numFamValue,
      nat_don: row.nat_don,
      cod_lieu_geog: row.cod_lieu_geog,
      cod_affect: row.cod_affect || '',
      dat_dem_don: row.dat_dem_don || datSaisie,
      etat_dem: 'I'
    };
  }

  // ==================== DELETE ====================

  deleteSelectedRows() {
    if (!this.selectedRows || this.selectedRows.length === 0) {
      this.showMessage('warn', 'Veuillez sélectionner au moins une ligne');
      return;
    }

    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: `Vous allez supprimer ${this.selectedRows.length} ligne(s)`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        const datSaisie = this.getCurrentDate();
        const user = this.tokenStorage.getUser();

        const persistedRows = this.selectedRows.filter(r => !r._isNew);
        const newRowsToDelete = this.selectedRows.filter(r => r._isNew);

        // Remove from UI
        this.listIndemnites = this.listIndemnites.filter(
          r => !this.selectedRows.includes(r)
        );
        this.newRows = this.newRows.filter(r => !newRowsToDelete.includes(r));
        this.modifiedRows = this.modifiedRows.filter(r => !persistedRows.includes(r));

        if (persistedRows.length === 0) {
          this.selectedRows = [];
          this.showMessage('success', 'Lignes supprimées');
          this.updateButtonStates();
          return;
        }

        const payload = persistedRows.map((row) =>
          this.transformRowToDeleteDTO(row, datSaisie, user)
        );

        this.indemniteServ.deleteDelocage(payload).subscribe({
          next: () => {
            this.selectedRows = [];
            this.showMessage('success', 'Lignes supprimées');
            this.updateButtonStates();
          },
          error: (error) => this.handleError(error)
        });
      }
    });
  }

  transformRowToDeleteDTO(row: any, datSaisie: string, user: any) {
    const numFamValue = row.num_fam ? Number(row.num_fam) : 0;
    return {
      typ_don: row.typ_don || 'I',
      cod_soc: row.cod_soc || user.codSoc,
      mat_pers: row.mat_pers,
      num_fam: numFamValue,
      nat_don: row.nat_don,
      cod_lieu_geog: row.cod_lieu_geog,
      cod_affect: row.cod_affect || '',
      dat_dem_don: row.dat_dem_don || datSaisie,
      etat_dem: 'I'
    };
  }

  onSelectionChange(rows: ScolIndemnite[]) {
    const current = rows || [];
    this.selectedRows = current.filter(r => this.listIndemnites.includes(r));
    this.updateButtonStates();
  }

  cancelAllNewRows() {
    this.listIndemnites = this.listIndemnites.filter(r => !r._isNew);
    this.newRows = [];
    this.modifiedRows = [];
    this.newRowTempId = -1;
    this.selectedRows = this.selectedRows.filter(r => this.listIndemnites.includes(r) && !r._isNew);
    this.showMessage('info', 'Opération annulée');
    this.updateButtonStates();
  }

  // ==================== UTILITIES ====================

  applyThreeDecimalsMask(rowData: ScolIndemnite, field: 'mnt_dem_don' | 'mnt_livre', ev: any) {
    const raw = ev?.target?.value ?? (rowData as any)[field];
    const clean = String(raw).replace(/,/g, '.').replace(/[^0-9.]/g, '');
    let num = Number(clean);
    if (isNaN(num)) num = 0;
    const fixed = Number(num.toFixed(3));
    (rowData as any)[field] = fixed;

    if (field === 'mnt_livre' && rowData.mnt_livre > rowData.mnt_dem_don) {
      rowData.mnt_livre = rowData.mnt_dem_don;
      this.showMessage('warn', 'Le montant livré ne doit pas dépasser le montant demandé');
    }

    this.markAsUnsaved(rowData);
  }

  private resetAndRefresh() {
    this.newRows = [];
    this.modifiedRows = [];
    this.newRowTempId = -1;
    this.listIndemnites = [];
    this.familyByRow.clear();
    this.updateButtonStates();
  }

  private updateButtonStates() {
    const hasChanges = this.newRows.length > 0 || this.modifiedRows.length > 0;
    const hasSelection = this.selectedRows.length > 0;
    const canSearch = !!this.selectedCodeLieu && !!this.selectedTypeOfIndemnite;

    this.saveService.setDisabled(true);
    this.saveService.setDisabledDelete(true);
    this.saveService.setIsDisabledSearch(true);
  }

  private getCurrentDate(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private showMessage(severity: string, detail: string) {
    this.messageService.add({
      severity,
      summary: severity.toUpperCase(),
      detail,
      life: severity === 'error' ? 5000 : 3000
    });
  }

  private handleError(error: any) {
    const message = error?.error?.messageException || 'Une erreur est survenue';
    this.showMessage('error', message);
  }
}
