import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AssurService } from '../assur.service';

@Component({
  selector: 'app-mis-aj-cnam',
  templateUrl: './mis-aj-cnam.component.html',
  styleUrl: './mis-aj-cnam.component.scss'
})
export class MisAjCnamComponent {
chargement: any;
traitement!: FormGroup;
cheminFichier: any;

constructor(private fb: FormBuilder,private serv: AssurService,){
  this.traitement = this.fb.group({
    chemin:[''],
    action:['']


  })
}

ngOnInit(){
  this.traitement = this.fb.group({
    chemin:[''],
    action:['']


  })
}
// In your component.ts
selectedFile?: File;
  uploadStatus = '';

onFileSelected(event: any) {
  this.selectedFile = event.target.files[0];
}
onUpload() {
  if (this.selectedFile) {
    this.serv.uploadFile(this.selectedFile).subscribe({
      next: res => this.uploadStatus = '✅ Upload successful: ' + res,
      error: err => this.uploadStatus = '❌ Upload failed: ' + err.message
    });
  }
}
/* upload() {
  if (!this.selectedFile) return;
  
  const formData = new FormData();
  formData.append('file', this.selectedFile);

  this.serv.uploadFileRef(formData)
    .subscribe((response:any) => {
      console.log('Upload success', response);
    });
} */


}
