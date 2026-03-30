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
  
  private processMenuData(menuData: any[], authorizations: any[] = []): any[] {
    return menuData.map(menuItem => {
        console.log("menuItem:", menuItem);

        // Check if the current menu item (main module) is authorized
        const isAuthorized = authorizations.some(auth => auth.admsubmodule && auth.admsubmodule.sum_id === menuItem.id);
        console.log("isAuthorized:", isAuthorized);

        // Process subItems recursively, ensuring that they are checked if authorized
        const processedSubItems = menuItem.subItems ? this.processMenuData(menuItem.subItems, authorizations) : [];

        // Check if the current menu item or any of its subItems is checked (because they are authorized)
        const isAnySubItemChecked = processedSubItems.some(subItem => subItem.checked);

        // If the item is authorized or any of its subItems are checked, mark it as checked
        const processedMenuItem = {
            ...menuItem,
            authorized: isAuthorized,
            checked: isAuthorized || isAnySubItemChecked,
            expanded: false,
            subItems: processedSubItems.map(subItem => ({
                ...subItem,
                checked: authorizations.some(auth => auth.admeventtype && auth.admeventtype.evt_id === subItem.id)
            }))
        };
        console.log("processedMenuItem:", processedMenuItem);

        return processedMenuItem;
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

  async handleCheckboxChange(event: any, sumId: number, evtId: number) {
    const checked = event.target.checked;
    console.log("Checkbox changed - sumId:", sumId, "evtId:", evtId);

     this.admstorageautorisationForm.patchValue({
        sumId: sumId,
        evtId: evtId,
        checked: checked
    });

    console.log("Form value after change:", this.admstorageautorisationForm.value);

     await this.updateChildItems(this.menuData, sumId, evtId, checked);

     this.onSubmit();
}

  
 async handleCheckboxChangeSub(event: any, sumId: number) {
    const checked = event.target.checked;
    console.log("Checkbox changed - sumId:", sumId);
    this.admstorageautorisationForm.patchValue({
      sumId: sumId,
      checked: checked
    });
    console.log("Form value after change:", this.admstorageautorisationForm.value);
  
   await  this.updateChildItems(this.menuData, sumId, null, checked);
     this.onSubmit()
  }
  
   updateChildItems(items: any[], sumId: number, evtId: number | null, checked: boolean) {
     items.forEach(item => {
      if (item.id === sumId) {
        item.checked = checked;
        if (item.subItems) {
          item.subItems.forEach((subItem: any)  => this.updateChildItems([subItem], sumId, evtId, checked));
        }
      } else if (item.subItems) {
        this.updateChildItems(item.subItems, sumId, evtId, checked);
      }
    });
  }
  
}
