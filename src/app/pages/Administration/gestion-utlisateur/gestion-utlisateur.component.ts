import { Component } from '@angular/core';
import { AdminService } from '../Admin.service';
import { AbstractControl, FormBuilder, FormGroup, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { RoleModel } from '../Models/Role.model';
import { AuthenticationService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-gestion-utlisateur',
  templateUrl: './gestion-utlisateur.component.html',
  styleUrl: './gestion-utlisateur.component.scss'
})
export class GestionUtlisateurComponent {
  listValues: any[] = [];
  columns: any[] = [];
  selectedCode: string = '';
  selectedLabel: string = '';

  // Propriétés dynamiques pour le code et le libellé
  codeField: string = 'matPers';  // Nom du champ pour le code (à changer selon le contexte)
  labelField: string = 'fullName';
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  submitted = false;
  utilisateurForm!: FormGroup;
  listRole!: RoleModel

  userForm: FormGroup;
  showPassword = false;


  constructor(private formBuilder: FormBuilder, private adminServ: AdminService, private authService: AuthenticationService) {

    this.userForm = this.formBuilder.group({
      items: this.formBuilder.array([
        this.formBuilder.control(null)
      ])
    })

    /**
     * Form Validation
     */
    this.utilisateurForm = this.formBuilder.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      useLogin: ['', [Validators.required]],
      roles: ['', [Validators.required]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]

    }, { validators: this.passwordMatchValidator });

  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */

    this.adminServ.getPersonnels().subscribe(data => {
      this.listValues = data;
      console.log(this.listValues)
      // Définir les colonnes dynamiques du tableau
      this.columns = [
        { key: 'mat_pers', label: 'Matricule' },
        { key: 'mat_int', label: 'Mat. Administratif' },
        { key: 'dat_nais', label: 'Date naissance' },
        { key: 'full_name', label: 'Nom & prénom' },

        // { key: 'lib_tit_a', label: 'Libellé 2éme langue' }
      ];
      console.log("this.columns", this.columns)

    });
    this.getRoles()

  }
  onSelectedValue(item: any) {

    this.selectedCode = item.mat_pers; // Mise à jour du champ code
    this.selectedLabel = item.full_name; // Mise à jour du champ libellé
    this.utilisateurForm.patchValue({
      useLogin: item.mat_pers,
      firstname: item.pren_pers,
      lastname: item.nom_pers
    });
  }

  // onSelectedValue(item: any) {
  //   this.selectedCode = item.matPers; // Mise à jour du champ code
  //   this.selectedLabel = item.fullName; // Mise à jour du champ libellé
  //   console.log("item :",item)

  // }
  getRoles() {
    this.adminServ.getRole().subscribe((data: any) => {
      this.listRole = data

    })
  }
  passwordMatchValidator(form: AbstractControl) {
    return form.get('password')?.value === form.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  resetForm() {
    this.submitted = false;
    this.selectedCode = '';
    this.selectedLabel = '';
    this.utilisateurForm.reset({ firstname: '', lastname: '', email: '', useLogin: '', roles: '', password: '', confirmPassword: '' });
  }

  AddUser() {
    this.submitted = true;
    if (this.utilisateurForm.invalid) {
      return;
    }
    // le champ de confirmation n'est pas envoyé au serveur
    const { confirmPassword, ...payload } = this.utilisateurForm.value;

    Swal.fire({
      title: 'Veuillez patienter...',
      text: 'Enregistrement en cours...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.authService.register(payload).subscribe({
      next: (data) => {
        Swal.fire('Succès', 'Utilisateur enregistré avec succès', 'success');
        this.resetForm();
      },
      error: (error) => {
        console.error(error);
        let message = 'Erreur lors de l\'enregistrement';
        if (error.error && error.error.message) {
          message = error.error.message;
        }
        Swal.fire('Erreur', message, 'error');
      }
    });
  }


  /**
   * Form data get
   */
  get form() {
    return this.utilisateurForm.controls;
  }


  /**
 * Save user
 */
  saveUser() {
    this.submitted = true
  }

  // Default
  counter = 0;






  // Add Item
  addItem(): void {
    (this.userForm.get('items') as UntypedFormArray).push(
      this.formBuilder.control(null)
    );
  }

  // Get Item Data 
  getItemFormControls(): AbstractControl[] {
    return (<UntypedFormArray>this.userForm.get('items')).controls
  }

  // Remove Item
  removeItem(index: any) {
    (this.userForm.get('items') as UntypedFormArray).removeAt(index);
  }

}
