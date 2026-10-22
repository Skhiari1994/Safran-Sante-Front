import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { AdminService } from '../Admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-profile',
  templateUrl: './gestion-profile.component.html',
  styleUrl: './gestion-profile.component.scss'
})
export class GestionProfileComponent {

  roles: any[] = [];
  modules: any[] = [];
  selectedRole: any;
  selectedModules: any[] = [];
  expandedModules: Set<number> = new Set();
  /** Sous-modules cochés dans la colonne « Sélection » (clé « idModule:idSousModule »). */
  selected = new Set<string>();
  busy = false;
  menuData: any[] = [];
  admstorageautorisationForm!: FormGroup;
  breadCrumbItems!: Array<{}>;

  constructor(
    private roleModuleService: AdminService, 
    private token: TokenStorage, 
    public translatee: TranslateService, 
    private fb: FormBuilder
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadModules();
    this.roleModuleService.getMenu().subscribe(data => {
      this.menuData = this.processMenuData(data);
      console.log("this.menuData :", this.menuData);
    });

    const currentLang = this.translatee.getBrowserLang();
  }

  loadRoles(): void {
    this.roleModuleService.getRole().subscribe((data:any) => {
      this.roles = data;
    });
  }

  loadModules(): void {
    this.roleModuleService.getAdmSubModule().subscribe(data => {
      this.modules = data;
    });
  }

  onRoleChange(roleId: any): void {
    this.selectedRole = roleId.target.value;
    this.selected.clear();
    this.combineMenuWithAuthorizations();
  }

  combineMenuWithAuthorizations(): void {
    if (!this.selectedRole) {
      return;
    }
  
    forkJoin([
      this.roleModuleService.getMenu(),
      this.roleModuleService.getRoleModules(this.selectedRole)
    ]).subscribe(([menuData, authorizations]) => {
      this.menuData = this.processMenuData(menuData, authorizations);
      console.log("Processed Menu Data:", this.menuData);
      console.log("Authorizations:", authorizations);
    });
  }
  
  /**
   * Construit l'arbre des pages avec l'état « coché » à tous les niveaux :
   * un sous-module est coché si une autorisation existe pour son evt_id ;
   * un module est coché s'il a sa propre ligne d'autorisation ou si un de ses sous-modules l'est.
   */
  private processMenuData(menuData: any[], authorizations: any[] = []): any[] {
    const markItems = (items: any[] | null | undefined): any[] =>
      (items || []).map(item => ({
        ...item,
        checked: authorizations.some(auth => auth.admeventtype && auth.admeventtype.evt_id === item.id),
        expanded: false,
        subItems: markItems(item.subItems)
      }));

    return menuData.map(mod => {
      const authorized = authorizations.some(auth =>
        auth.admsubmodule && auth.admsubmodule.sum_id === mod.id && !auth.admeventtype);
      const subItems = markItems(mod.subItems);
      return {
        ...mod,
        authorized,
        checked: authorized || this.descendants({ subItems }).some(c => c.checked),
        expanded: false,
        subItems
      };
    });
  }

  createForm() {
    this.admstorageautorisationForm = this.fb.group({
      id: ['', Validators.required],
      sumId: ['', Validators.required],
      evtId: ['', Validators.required],
      checked: [false]
    });
  }

  toggleChildren(item: any): void {
    item.expanded = !item.expanded;
    console.log(`Item ${item.label} expanded state: ${item.expanded}`);
  }

  // handleCheckboxChange(event: any, sumId: number, evtId: number) {
  //   console.log("Checkbox changed - sumId:", sumId, "evtId:", evtId);
  //   this.admstorageautorisationForm.patchValue({
  //     sumId: sumId,
  //     evtId: evtId,
  //     checked: event.target.checked
  //   });
  //   console.log("Form value after change:", this.admstorageautorisationForm.value);
  // }

  // handleCheckboxChangeSub(event: any, sumId: number) {
  //   console.log("Checkbox changed - sumId:", sumId);
  //   this.admstorageautorisationForm.patchValue({
  //     sumId: sumId,
  //     checked: event.target.checked
  //   });
  //   console.log("Form value after change:", this.admstorageautorisationForm.value);
  // }

  onSubmit() {
    console.log("Form submitted - Form value:", this.admstorageautorisationForm.value);
    const admstorageautorisation: any = {
      role: { id: this.selectedRole },
      admsubmodule: { sum_id: this.admstorageautorisationForm.value.sumId },
      admeventtype: this.admstorageautorisationForm.value.evtId ? 
                    { evt_id: this.admstorageautorisationForm.value.evtId } : null
    };
    const isChecked = this.admstorageautorisationForm.value.checked;
  
    if (isChecked) {
      console.log("admstorageautorisation object to save:", admstorageautorisation);
      this.roleModuleService.saveAutorisation(admstorageautorisation)
        .subscribe(response => {
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Ajout avec succés',
            showConfirmButton: false,
            timer: 2000
          });
        }, error => {
          console.error('Error saving:', error);
        });
    } else {
      console.log("Deleting authorization:", admstorageautorisation);
      this.roleModuleService.deleteAdmAutorisation(admstorageautorisation.admsubmodule.sum_id, admstorageautorisation.role.id, admstorageautorisation.admeventtype ? admstorageautorisation.admeventtype.evt_id : null)
        .subscribe(response => {
          Swal.fire({
            position: 'top-end',
            icon: 'info',
            title: 'Deleted successfully',
            showConfirmButton: false,
            timer: 2000
          });
          console.log('Deleted successfully:', response);
        }, error => {
          console.error('Error deleting:', error);
        });
    }
  }

  getIndentationLevel(level: number): number {
    return 20 * level;
  }

  // ------------------------------------------------------------------ enregistrement
  private saveAuth(sumId: number, evtId: number | null) {
    const auth: any = {
      role: { id: this.selectedRole },
      admsubmodule: { sum_id: sumId },
      admeventtype: evtId ? { evt_id: evtId } : null
    };
    return this.roleModuleService.saveAutorisation(auth);
  }

  private deleteAuth(sumId: number, evtId: number | null) {
    return this.roleModuleService.deleteAdmAutorisation(sumId, Number(this.selectedRole), evtId);
  }

  private toast(icon: 'success' | 'info' | 'warning' | 'error', title: string): void {
    Swal.fire({ position: 'top-end', icon, title, showConfirmButton: false, timer: 2000 });
  }

  private findModule(sumId: number): any {
    return this.menuData.find(m => m.id === sumId);
  }

  /** Tous les sous-éléments d'un élément, à tous les niveaux. */
  private descendants(item: any): any[] {
    return (item.subItems || []).reduce((all: any[], c: any) => [...all, c, ...this.descendants(c)], []);
  }

  private findItem(mod: any, evtId: number): any {
    return this.descendants(mod).find(c => c.id === evtId);
  }

  /** Un module est affiché s'il est autorisé lui-même ou si au moins un de ses sous-modules l'est. */
  private refreshModuleState(mod: any): void {
    mod.checked = !!mod.authorized || this.descendants(mod).some((c: any) => c.checked);
  }

  private hasRole(event?: any): boolean {
    if (this.selectedRole) {
      return true;
    }
    if (event?.target) {
      event.target.checked = !event.target.checked;
    }
    this.toast('warning', 'Sélectionnez d\'abord un profil');
    return false;
  }

  /** Case d'un module : décocher le module décoche aussi tous ses sous-modules, à tous les niveaux. */
  handleCheckboxChangeSub(event: any, sumId: number) {
    if (!this.hasRole(event)) { return; }
    const checked: boolean = event.target.checked;
    const mod = this.findModule(sumId);
    if (!mod) { return; }

    if (checked) {
      this.saveAuth(sumId, null).subscribe({
        next: () => {
          mod.authorized = true;
          this.refreshModuleState(mod);
          this.toast('success', 'Ajout avec succès');
        },
        error: () => { event.target.checked = false; this.toast('error', 'Enregistrement impossible'); }
      });
      return;
    }

    const children: any[] = this.descendants(mod).filter((c: any) => c.checked);
    this.busy = true;
    forkJoin([this.deleteAuth(sumId, null), ...children.map(c => this.deleteAuth(sumId, c.id))]).subscribe({
      next: () => {
        mod.authorized = false;
        this.descendants(mod).forEach((c: any) => { c.checked = false; this.selected.delete(this.key(sumId, c.id)); });
        this.refreshModuleState(mod);
        this.busy = false;
        this.toast('info', children.length ? 'Module et sous-modules masqués' : 'Module masqué');
      },
      error: () => {
        this.busy = false;
        this.toast('error', 'Suppression impossible');
        this.combineMenuWithAuthorizations();
      }
    });
  }

  /** Case d'un sous-module (n'importe quel niveau) : le décocher décoche aussi ses propres sous-éléments. */
  handleCheckboxChange(event: any, sumId: number, evtId: number) {
    if (!this.hasRole(event)) { return; }
    const checked: boolean = event.target.checked;
    const mod = this.findModule(sumId);
    const item = mod ? this.findItem(mod, evtId) : undefined;
    if (!mod || !item) { return; }

    if (checked) {
      this.saveAuth(sumId, evtId).subscribe({
        next: () => {
          item.checked = true;
          this.refreshModuleState(mod);
          this.toast('success', 'Ajout avec succès');
        },
        error: () => { event.target.checked = false; this.toast('error', 'Enregistrement impossible'); }
      });
      return;
    }

    const toRemove: any[] = [item, ...this.descendants(item)].filter(c => c.checked);
    forkJoin(toRemove.length ? toRemove.map(c => this.deleteAuth(sumId, c.id)) : [this.deleteAuth(sumId, evtId)]).subscribe({
      next: () => {
        [item, ...this.descendants(item)].forEach(c => { c.checked = false; });
        this.refreshModuleState(mod);
        this.toast('info', toRemove.length > 1 ? 'Sous-module et ses sous-éléments masqués' : 'Sous-module masqué');
      },
      error: () => {
        event.target.checked = true;
        this.toast('error', 'Suppression impossible');
        this.combineMenuWithAuthorizations();
      }
    });
  }

  // ------------------------------------------------------------------ sélection multiple
  private key(sumId: number, evtId: number): string {
    return `${sumId}:${evtId}`;
  }

  isSelected(sumId: number, evtId: number): boolean {
    return this.selected.has(this.key(sumId, evtId));
  }

  toggleSelect(sumId: number, evtId: number, event: any): void {
    event.target.checked ? this.selected.add(this.key(sumId, evtId)) : this.selected.delete(this.key(sumId, evtId));
  }

  private selectedCount(mod: any): number {
    return this.descendants(mod).filter((c: any) => this.isSelected(mod.id, c.id)).length;
  }

  isModuleFullySelected(mod: any): boolean {
    const n = this.descendants(mod).length;
    return n > 0 && this.selectedCount(mod) === n;
  }

  isModulePartlySelected(mod: any): boolean {
    const n = this.selectedCount(mod);
    return n > 0 && n < this.descendants(mod).length;
  }

  /** Coche / décoche la sélection de tous les sous-modules d'un module. */
  toggleSelectModule(mod: any, event: any): void {
    this.descendants(mod).forEach((c: any) => {
      event.target.checked ? this.selected.add(this.key(mod.id, c.id)) : this.selected.delete(this.key(mod.id, c.id));
    });
  }

  get totalSubItems(): number {
    return this.menuData.reduce((n, m) => n + this.descendants(m).length, 0);
  }

  toggleSelectAll(event: any): void {
    this.menuData.forEach(m => this.toggleSelectModule(m, event));
  }

  clearSelection(): void {
    this.selected.clear();
  }

  /** Affiche ou masque d'un coup tous les sous-modules sélectionnés. */
  applySelection(show: boolean): void {
    if (this.busy || !this.selected.size) { return; }
    if (!this.hasRole()) { return; }

    const calls: any[] = [];
    const changed: { mod: any; child: any }[] = [];
    this.menuData.forEach(mod => this.descendants(mod).forEach((child: any) => {
      if (this.isSelected(mod.id, child.id) && !!child.checked !== show) {
        calls.push(show ? this.saveAuth(mod.id, child.id) : this.deleteAuth(mod.id, child.id));
        changed.push({ mod, child });
      }
    }));

    if (!calls.length) {
      this.toast('info', show ? 'Déjà tous affichés' : 'Déjà tous masqués');
      this.selected.clear();
      return;
    }

    this.busy = true;
    forkJoin(calls).subscribe({
      next: () => {
        changed.forEach(({ mod, child }) => { child.checked = show; this.refreshModuleState(mod); });
        this.selected.clear();
        this.busy = false;
        this.toast('success', `${changed.length} sous-module(s) ${show ? 'affiché(s)' : 'masqué(s)'}`);
      },
      error: () => {
        this.busy = false;
        this.toast('error', 'Une partie des modifications a échoué');
        this.combineMenuWithAuthorizations();
      }
    });
  }
}
