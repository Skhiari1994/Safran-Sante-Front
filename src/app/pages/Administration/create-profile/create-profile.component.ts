import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { AdminService } from '../Admin.service';
 
@Component({
  selector: 'app-create-profile',
  templateUrl: './create-profile.component.html',
  styleUrl: './create-profile.component.scss'
})
export class CreateProfileComponent {

  RoleForm!: FormGroup
  ListRole: any
  term!: string
  p: any
  isEdit = false;
  showFilters: { [key: string]: boolean } = {};
  searchz: { [key: string]: string } = {};
  private sortAsc = true;
  private sortField = '';
  constructor(private adminServ: AdminService, private modalService: NgbModal, private formBuilder: FormBuilder) {  
    this.RoleForm = this.formBuilder.group({
    roleId: [''],
    id: [null],
    name: [''],
    created_date: [''],
    last_modified_date: [(new Date()).toLocaleDateString()],


  }); }

  ngOnInit(): void {
    this.GetRole()

  
  }

  AddRole() {
    console.log("this.RoleForm.value", this.RoleForm.value)
    this.adminServ.AddRole(this.RoleForm.value).subscribe((res) => {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Ajouter avec succées !',
        showConfirmButton: false,
        timer: 2000
      });
      this.RoleForm.reset()
      this.GetRole()
      this.modalService.dismissAll()
    })


  }
  DeleteRole(id: number) {
    Swal.fire({
      title: 'Es-tu sûr?',
      text: 'Tu ne pourras pas revenir en arrière!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#34c38f',
      cancelButtonColor: '#f46a6a',
      confirmButtonText: 'Oui, Supprimer le!'
    }).then(result => {
      console.log("result.value", result.value)
      if (result.value) {
        this.adminServ.DeleteRole(id).subscribe(
          (data: any[]) => {
            console.log("data delete", data)
            Swal.fire('Supprimer!', 'La demande à été bien supprimer.', 'success');
            this.GetRole()
          },
          (error) => {
            Swal.fire('Supprimer!', 'Le profile est référencé  par d\'autres valeurs', 'error');

          });

      }
    });
  }

  toggleFilter(key: string) {
    this.showFilters[key] = !this.showFilters[key];
    if (!this.showFilters[key]) { this.searchz[key] = ''; this.p = 1; }
  }

  onSort(column: string) {
    this.sortAsc = this.sortField === column ? !this.sortAsc : true;
    this.sortField = column;
    const dir = this.sortAsc ? 1 : -1;
    this.ListRole = [...(this.ListRole || [])].sort((a: any, b: any) =>
      String(a[column] ?? '').localeCompare(String(b[column] ?? ''), 'fr', { numeric: true }) * dir
    );
  }

  filteredRoles(): any[] {
    const keys = Object.keys(this.searchz).filter(k => this.searchz[k]);
    const list: any[] = this.ListRole || [];
    if (!keys.length) return list;
    return list.filter(r => keys.every(k => String(r[k] ?? '').toLowerCase().includes(this.searchz[k].toLowerCase())));
  }

  openModalRole(targetModal:any) {
    this.isEdit = false;

    this.modalService.open(targetModal, {
      windowClass: "my-class-personnel",
      centered: true,
    });
    this.RoleForm.reset({ roleId: '', id: null, name: '', created_date: null, last_modified_date: null })
  }

  GetRole() {
    this.adminServ.getRole().subscribe(
      (data: any) => {
        this.ListRole = data;
      },
      (error) => {

      }
    );
  }

  openModalAjout(targetModal:any) {
    this.modalService.open(targetModal, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
    this.RoleForm.reset()
  }

  openModal(targetModal:any, pers:any) {
    this.modalService.open(targetModal, {
      centered: true,
      backdrop: 'static',
    });

    this.isEdit = true;
    this.RoleForm.patchValue({
      id: pers.id,
      name: pers.name,
      created_date: pers.created_date,
      last_modified_date: null,
    });

  }
}
