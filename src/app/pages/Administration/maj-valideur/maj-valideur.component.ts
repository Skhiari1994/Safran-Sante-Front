import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../Admin.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import Swal from 'sweetalert2';
 
@Component({
  selector: 'app-maj-valideur',
  templateUrl: './maj-valideur.component.html',
  styleUrl: './maj-valideur.component.scss'
})
export class MajValideurComponent {
  listValues: any[] = [];
  columns: any[] = [];
  selectedCode: string = '';
  selectedLabel: string = '';
  listPersValid: any
  p: any
  searchQuery: string = '';
  filteredData: any[] = [];

  term!: string
  gridApi: any
  gridColumnApi: any
  listinfopers: any
  persValidForm!: FormGroup
  gridOpen!: boolean
  rowSelection
  codeField: string = 'matPers';
  constructor(private adminServ: AdminService, private formBuilder: FormBuilder, private modalService: NgbModal,
      private tokenService: TokenStorage) {
    this.rowSelection = "single";
  }

  ngOnInit(): void {
    this.persValidForm = this.formBuilder.group({
      cod_soc: [this.tokenService.getUser().cod_soc],
      mat_pers: ['', Validators.required],
      mat_resp: ['', Validators.required],
      niveau: ['', Validators.required],
      nom_pers: [''],
      nom_resp: [''],

    });
    this.adminServ.getPersonnels().subscribe(data => {
      this.listValues = data;
      console.log(this.listValues)
      // Définir les colonnes dynamiques du tableau
      this.columns = [
        { key: 'matPers', label: 'Matricule' },
        { key: 'fullName', label: 'Nom & prénom' },

       // { key: 'lib_tit_a', label: 'Libellé 2éme langue' }
      ];
      console.log("this.columns",this.columns)

    });
    this.GetPersValid()
    this.getmatriculeetnom()
  }

  onSelectedValue(item: any) {
    this.selectedCode = item.matPers; // Mise à jour du champ code
    this.selectedLabel = item.fullName; // Mise à jour du champ libellé
    this.persValidForm.patchValue({
      mat_pers:item.matPers,
      nom_pers: item.fullName  
    });
  }
  onSelectedValueResp(item: any) {
    this.selectedCode = item.matPers; // Mise à jour du champ code
    this.selectedLabel = item.fullName; // Mise à jour du champ libellé
    this.persValidForm.patchValue({
      mat_resp:item.matPers,
      nom_resp: item.fullName  
    });
  }
  openModal(targetModal :any, pers :any) {
    this.modalService.open(targetModal, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });

    this.persValidForm.patchValue({
      mat_pers: pers.mat_pers,
      cod_soc: pers.cod_soc,
      mat_resp: pers.mat_resp,
      niveau: pers.niveau,
      nom_pers: pers.nom,
      nom_resp: pers.nomResp

    });
    console.log("perss", pers)
  }

  openModalAjout(targetModal:any) {
    this.modalService.open(targetModal, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
    this.persValidForm.reset()

  }
  // onSelectionChangedmat(event: SelectionChangedEvent, targetModal) {
  //   var nom_pers: any
  //   var pren_pers: any

  //   var selectedRows = this.gridApi.getSelectedRows();
  //   var selectedRowsString = "";


  //   console.log(this.gridApi)
  //   console.log(this.gridColumnApi)
  //   selectedRows.forEach(function (selectedRow, index) {
  //     if (index !== 0) {
  //       selectedRowsString += ", ";

  //     }
  //     selectedRowsString += selectedRow.mat_pers;
  //   });
  //   console.log("seles", selectedRows);

  //   nom_pers = selectedRows[0].nom_pers + " " + selectedRows[0].pren_pers
  //   console.log("nommmm", nom_pers)


  //   this.persValidForm.get("mat_pers").patchValue(selectedRows[0].mat_pers),

  //     this.persValidForm.get("nom_pers").patchValue(nom_pers),

  //     document.querySelector("#selectedRows").innerHTML = selectedRowsString;
  //   this.gridOpen = !this.gridOpen;



  // }
  // onSelectionChangedmatResp(event: SelectionChangedEvent, targetModal) {
  //   var nom_pers: any
  //   var pren_pers: any

  //   var selectedRows = this.gridApi.getSelectedRows();
  //   var selectedRowsString = "";


  //   console.log(this.gridApi)
  //   console.log(this.gridColumnApi)
  //   selectedRows.forEach(function (selectedRow, index) {
  //     if (index !== 0) {
  //       selectedRowsString += ", ";

  //     }
  //     selectedRowsString += selectedRow.mat_pers;
  //   });
  //   console.log("seles", selectedRows);


  //   nom_pers = selectedRows[0].nom_pers + " " + selectedRows[0].pren_pers
  //   console.log("nommmm", nom_pers)
  //   this.persValidForm.get("mat_resp").patchValue(selectedRows[0].mat_pers),
  //     this.persValidForm.get("cod_soc").patchValue(selectedRows[0].cod_soc),

  //     this.persValidForm.get("nom_resp").patchValue(nom_pers),

  //     document.querySelector("#selectedRows").innerHTML = selectedRowsString;
  //   this.gridOpen = !this.gridOpen;

  // }
  openModalPersonnel(targetModal:any) {

    this.modalService.open(targetModal, {
      windowClass: "my-class-personnel",
      centered: true,
    });
  }

  columnnompersmaricule = [
    {
      headerName: "Matricule",
      field: "mat_pers",
      editable: true,
      filter: true,
      floatingFilter: true,

    },
    {
      headerName: "Nom Personnel",
      field: "nom_pers",
      filter: true,
      sortable: true,
      floatingFilter: true,

      editable: true,
      cellEditor: "primeCellEditor",
    },
    {
      headerName: "Prenom Personnel",
      field: "pren_pers",
      filter: true,
      sortable: true,
      floatingFilter: true,

      editable: true,
      cellEditor: "primeCellEditor",
    }



  ];
  getmatriculeetnom() {


    this.adminServ.getPersonllesdiffmymat(this.tokenService.getUser().codSoc, this.tokenService.getUser().matpers).subscribe(
      (data: any) => {
        this.listinfopers = data;

        console.log(data);
      },
      (error: any) => {
        console.log(error);
      }
    );
  }
  updatePersValid() {
    console.log("this.persValidForm.value", this.persValidForm.value)
    this.adminServ.UpdatePers(this.persValidForm.value).subscribe((res) => {

      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Mise à jour succées !',
        showConfirmButton: false,
        timer: 2000
      });

      this.GetPersValid()
      this.modalService.dismissAll();
      this.persValidForm.reset()

    })

  }

  addPersValid() {
    console.log("this.persValidForm.value", this.persValidForm.value)
    debugger
    this.adminServ.AddPers(this.persValidForm.value).subscribe((res) => {
      console.log("ress", res)
      if (this.persValidForm.valid) {
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Ajouter avec succées !',
          showConfirmButton: false,
          timer: 2000
        });

        this.GetPersValid()
        this.modalService.dismissAll();

        this.persValidForm.reset()
      }
    })

  }
  GetPersValid() {
    this.adminServ.GetPersValid().subscribe(
      (data: any[]) => {
        this.listPersValid = data;

        console.log(data);
      },
      (error) => {
        console.log(error);
      }
    );
  }


  DeletePersValideur(cod_soc: string, mat_pers: string, mat_resp: string) {

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
          this.adminServ.deletePersValideur(cod_soc,mat_pers,mat_resp).subscribe(
            (data: any ) => {
                   
            },
            (error) => {
             
       
            });
          
     
      Swal.fire('Supprimer!', 'Intérim à été bien supprimer.', 'success');
      this.GetPersValid()            

    }
    });

}
});
  }

  // modules: Module[] = [ClientSideRowModelModule];

  defaultColDef = {
    sortable: true,
    filter: true,
  };

  onSearch() {
    // Filtrage générique qui filtre sur toutes les colonnes définies
    this.filteredData = this.listPersValid.filter((item:any) =>
      this.columns.some(col =>
        item[col.key]?.toString().toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    );
  }

}
