import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/pages/Administration/Admin.service';

@Component({
  selector: 'app-parentlov',
  templateUrl: './parentlov.component.html',
  styleUrl: './parentlov.component.scss'
})
export class ParentlovComponent {

  listValues: any[] = [];
  columns: any[] = [];
  selectedCode: string = '';
  selectedLabel: string = '';
  form!:FormGroup
  // Propriétés dynamiques pour le code et le libellé
  codeField: string = 'matPers';  // Nom du champ pour le code (à changer selon le contexte)
  labelField: string = 'fullName'; // Nom du champ pour le libellé (à changer selon le contexte)
  constructor(private adminServ:AdminService,private modalService: NgbModal,private fb:FormBuilder) {} // Injectez votre service

  ngOnInit(): void {
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
    this.form=this.fb.group({
      code:[''],
      libelle:[''],
      autre:['']
      
    })
  }

  // Cette méthode est appelée lorsque l'utilisateur sélectionne un élément dans la LOV
  onSelectedValue(item: any) {
    this.selectedCode = item.matPers; // Mise à jour du champ code
    this.selectedLabel = item.fullName; // Mise à jour du champ libellé
    console.log("item :",item)
    this.form.patchValue({
      code: item.matPers,   // Correspond au champ codeField
      libelle: item.fullName // Correspond au champ labelField
    });
  }
  openModal(content: any) {
    this.modalService.open(content, { size: 'lg' });
  }
  submit(){
    console.log("test :",this.form.value)
  }
}