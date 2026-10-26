import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
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


  /** Vrai si seuls certains sous-éléments sont affichés (case en état « partiel »). */
  partiel(item: any): boolean {
    const enfants = this.descendants(item);
    const coches = enfants.filter((c: any) => c.checked).length;
    return coches > 0 && coches < enfants.length;
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
      // cocher un module affiche aussi tous ses sous-modules (à tous les niveaux) ; seuls ceux qui ne le sont pas encore sont enregistrés
      const aCocher: any[] = this.descendants(mod).filter((c: any) => !c.checked);
      const appels = [
        ...(mod.authorized ? [] : [this.saveAuth(sumId, null)]),
        ...aCocher.map(c => this.saveAuth(sumId, c.id))
      ];
      this.busy = true;
      forkJoin(appels.length ? appels : [of(null)]).subscribe({
        next: () => {
          mod.authorized = true;
          aCocher.forEach(c => { c.checked = true; });
          this.refreshModuleState(mod);
          this.busy = false;
          this.toast('success', aCocher.length ? `Module et ${aCocher.length} sous-module(s) affichés` : 'Ajout avec succès');
        },
        error: () => {
          event.target.checked = false;
          this.busy = false;
          this.toast('error', 'Enregistrement impossible');
          this.combineMenuWithAuthorizations();
        }
      });
      return;
    }

    const children: any[] = this.descendants(mod).filter((c: any) => c.checked);
    this.busy = true;
    forkJoin([this.deleteAuth(sumId, null), ...children.map(c => this.deleteAuth(sumId, c.id))]).subscribe({
      next: () => {
        mod.authorized = false;
        this.descendants(mod).forEach((c: any) => { c.checked = false; });
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
      // même logique qu'un module : cocher un sous-module coche aussi ses propres sous-éléments
      const aCocher: any[] = [item, ...this.descendants(item)].filter(c => !c.checked);
      this.busy = true;
      forkJoin(aCocher.length ? aCocher.map(c => this.saveAuth(sumId, c.id)) : [of(null)]).subscribe({
        next: () => {
          aCocher.forEach(c => { c.checked = true; });
          this.refreshModuleState(mod);
          this.busy = false;
          this.toast('success', aCocher.length > 1 ? `Sous-module et ${aCocher.length - 1} sous-élément(s) affichés` : 'Ajout avec succès');
        },
        error: () => {
          event.target.checked = false;
          this.busy = false;
          this.toast('error', 'Enregistrement impossible');
          this.combineMenuWithAuthorizations();
        }
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
}
