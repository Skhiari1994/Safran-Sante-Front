import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DebCreditService, VirCartePretRequest } from '../deb-credit.service';
import { EditionCreditService } from '../../Edition/edition-credit.service';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import { switchMap } from 'rxjs';
@Component({
  selector: 'app-prepare-disquette',
  templateUrl: './prepare-disquette.component.html',
  styleUrl: './prepare-disquette.component.scss'
})
export class PrepareDisquetteComponent {
  commissionForm!: FormGroup
  datDebl: string = ''
  bool: boolean = false
  listComm:any[]=[]
  columnsComm:any[]=[]
  breadCrumbItems!: Array<{}>;

  commission:String=''

    request: VirCartePretRequest = {
    soc: '',
    datDebloc: '',
    numComm: '',
    idFile:''
  };
  message: string = '';
  constructor(private fb: FormBuilder, private saveService :SaveService,private serv: DebCreditService,private token :TokenStorageService, private editionServ: EditionCreditService) {
    this.commissionForm = this.fb.group({
      cod_soc: ['01'],
      num_comm: [''],
      dat_comm: [''],
      ref_comm: [''],
      dat_deb_comm: [''],
      dat_fin_comm: [''],
      dat_real: [''],
      cod_etat_pret: [{value:'',disabled:true}],
      typ_etat: [''],
      observ: [''],
      datDebl: []
    })
  }


  ngOnInit() {
this.getComm()
 this.saveService.registerPrintCallback(() => this.printReport());
  }


  generateFile() {
     const requestS :VirCartePretRequest= {
    soc: this.token.getUser().codSoc,
    datDebloc: this.formatDate(this.commissionForm.get('datDebl')?.value),
    numComm: this.commissionForm.get('num_comm')?.value,
    idFile:"DCPRET"
  };
    console.log('Request:', requestS);
    this.serv.generateFile(requestS).subscribe({
      next: (response: { seq?: number; message: string; errorDetails?: string }) => {
        console.log('Generate response:', response);
        this.message = response.message;
        if (response.message.includes('Fichier Préparé') && typeof response.seq === 'number') {
          this.downloadFilePret(response.seq);
          this.bool==true
        } else {
          const errorDetails = response.errorDetails ? ` (${response.errorDetails})` : '';
          this.message = `Error: ${response.message}${errorDetails}`;
        }
      },
      error: (error) => {
        console.error('HTTP error:', error);
        this.message = 'Error: ' + (error.message || 'Failed to call generate endpoint');
      }
    });
  }

downloadFilePret(seq: number) {
  console.log('Downloading file for seq:', seq);
  this.serv.downloadFilePret(seq).subscribe({
    next: (response) => {
      if (response.body) {
        const blob = new Blob([response.body], { type: 'text/plain;charset=utf-8' });
        const contentDisposition = response.headers.get('content-disposition') || '';
        const matches = /filename="?(.+)"?/.exec(contentDisposition);
        const filename = matches && matches[1] ? matches[1] : `vir_carte_pret_${seq}.txt`;
        saveAs(blob, filename);
        console.log('File downloaded successfully:', filename);
      } else {
        this.message = 'Error: No file content received';
        console.error('No file content in response');
      }
    },
    error: (error) => {
      console.error('Download error:', error);
      this.message = 'Error downloading file: ' + (error.message || 'Failed to download file');
    }
  });
}


generateAndDownloadFile() {
    const requestS: VirCartePretRequest = {
      soc: '01', // replace with this.token.getUser().codSoc if using auth
      datDebloc: this.formatDate(this.commissionForm.get('datDebl')?.value),
      numComm: this.commissionForm.get('num_comm')?.value,
      idFile:"DC"+this.commissionForm.get('datDebl')?.value
    };

    this.serv.generateFile(requestS)
      .pipe(
        switchMap(response => {
          this.message = response.message;
          if (response.seq) {
            // automatically download file
            return this.serv.downloadFilePret(response.seq);
          } else {
            throw new Error('No seq returned from generate endpoint');
          }
        })
      )
      .subscribe({
        next: (res) => {
          if (res.body) {
            const blob = new Blob([res.body], { type: 'text/plain;charset=utf-8' });

            const contentDisposition = res.headers.get('content-disposition') || '';
            const matches = /filename="?(.+)"?/.exec(contentDisposition);
            const filename = matches && matches[1] ? matches[1] : `vir_carte_pret.txt`;

            saveAs(blob, filename);
            console.log('File downloaded successfully:', filename);
          }
        },
        error: (err) => {
          console.error('Error:', err);
          this.message = 'Error generating or downloading file: ' + err.message;
        }
      });
  }
ngOnDestroy(){
  this.saveService.setIsSearch(false)
}
  downloadFile() {
    this.serv.downloadFile().subscribe((response: any) => {
      const blob = new Blob([response as BlobPart], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);

      // Créer un lien temporaire pour déclencher le téléchargement
      const a = document.createElement('a');
      a.href = url;
      a.download = 'virements.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(url);
    }, (error: any) => {
      console.error('Erreur lors du téléchargement du fichier', error);
    });
  }

  vir_carte() {
    

     this.serv.vir_carte(this.commissionForm.get('cod_soc')?.value, this.commissionForm.get('num_comm')?.value, this.formatDate(this.commissionForm.get('datDebl')?.value)).subscribe((data: any) => {
      this.bool = true

      Swal.fire({
        title: 'Message',
        text: "Preparation avec succés",
        icon: 'success',
        confirmButtonColor: '#3085d6',
      });
      console.log(this.bool)
    })
  }

  formatDate(dateString: any): string {
    // Ensure the string is in the format 'ddmmyyyy'
    if (dateString && dateString.length === 8) {
      const day = dateString.substring(0, 2);
      const month = dateString.substring(2, 4);
      const year = dateString.substring(4, 8);
      return `${day}/${month}/${year}`;
    }
    return dateString;
  }

  printReport() {
    Swal.fire({
      title: 'Chargement en cours...',
      html: 'Veuillez patienter pendant la génération du rapport.',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    const soc = this.token.getUser().codSoc || this.commissionForm.get('cod_soc')?.value;
    const comm = this.commissionForm.get('num_comm')?.value;
    const ddat = this.formatDate(this.commissionForm.get('datDebl')?.value);
    const corps = null;

    if (!soc || !comm || !ddat) {
      Swal.fire({ icon: 'error', title: 'Paramètres manquants', text: 'Veuillez sélectionner la commission et saisir la date de déblocage.' });
      return;
    }

    this.editionServ.editionCommDeblocAuto(soc, comm, ddat, corps).subscribe({
      next: (data: any) => {
        const file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileURL;
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `p_edit_comm_debloc_${formattedDate}.pdf`;
        a.click();
        URL.revokeObjectURL(fileURL);
        Swal.close();
      },
      error: (error) => {
        console.error(error);
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Échec de la génération du rapport.' });
      }
    });
  }


  getComm() {
    this.serv.getValidCommission(this.token.getUser().codSoc).subscribe((data) => {
      this.listComm = data;
      // Définir les colonnes dynamiques du tableau
      this.columnsComm = [
        { key: "num_comm", label: "Num comm" },
        { key: "ref_comm", label: "Ref comm" },

      ];
    });
  }
  onSelectedComm(item: any) {
     this.commissionForm.patchValue({
      num_comm:item.num_comm,
      dat_comm:  item.dat_comm,
      ref_comm: item.ref_comm,
      dat_deb_comm: item.dat_deb_comm,
      dat_fin_comm: item.dat_fin_comm,
      cod_etat_pret:item.cod_etat_pret
        })

  }
}
