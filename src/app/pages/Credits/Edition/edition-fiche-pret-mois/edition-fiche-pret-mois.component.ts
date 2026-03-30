import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { Personnel, AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { EditionCreditService } from '../edition-credit.service';

@Component({
  selector: 'app-edition-fiche-pret-mois',
  templateUrl: './edition-fiche-pret-mois.component.html',
  styleUrl: './edition-fiche-pret-mois.component.scss'
})
export class EditionFichePretMoisComponent {
personnelList: Personnel[] = [];
  formAdherent: FormGroup;
  columnsSearch: any[] = [];
  currentMonth: any
  listCorps: any[] = [];
  mois: any
  moisList: string[] = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  typPretList:any[]=[]
  columnstypPret:any[]=[]
   constructor(
    private personnelService: AdherentService,
    private token: TokenStorage,
    private fb: FormBuilder,
    private saveService: SaveService,
    private serv: EditionCreditService
  ) {
    this.formAdherent = this.fb.group({ 
      datDeb: [''], 
      typ_pret:[''],
      grp_pret:[''],
      libPret:[''], 
      corps:['']
    });
  }

  ngOnInit() {
     this.saveService.registerPrintCallback(() => this.printReport());

    const currentDate = new Date();
    const currentMonth = this.moisList[currentDate.getMonth()];
    this.mois = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear();

    this.formAdherent.patchValue({
      mois: currentMonth,
      annee: currentYear
    });
     this.getTypePret()
     this.getCorps() 
  }
 
  getCorps() {
    this.personnelService.getCorps().subscribe((data) => {
      this.listCorps = data;
    });
  }
 
  onSelectedTyp(item: any) {
    this.formAdherent.patchValue({
      grp_pret: item.cod_grp_pret,
      typ_pret:item.typ_pret,
      libPret: item.lib_pret, 
    });
  }
 
  getTypePret() {
    this.serv.getTypePret().subscribe((data) => {
      this.typPretList = data;
      this.columnstypPret = [
        { key: "typ_pret", label: "Code" },
        { key: "lib_pret", label: "Libelle" }, 
      ];
    });
  }
 

  formatDate(dateString: any): string {
    // Ensure the string is in the format 'ddmmyyyy'
    if (dateString && dateString.length === 6) {
      const month = dateString.substring(0, 2);
      const year = dateString.substring(2, 6); 
      return `${month}/${year}`;
    }
    return dateString;
  }

 
  printReport() {
    // Show the loading Swal before starting the request
    Swal.fire({
      title: 'Chargement en cours...',
      html: 'Veuillez patienter pendant la génération du rapport.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
     const formatDates = (form: any, fields: string[]): string[] =>
      fields.reduce<string[]>((formatted, field) => {
        const value = this.formatDate(form.get(field)?.value);
        form.get(field)?.setValue(value);
        formatted.push(value);
        return formatted;
      }, []);

    const demConv = formatDates(this.formAdherent, [
      "datDeb",
     ]);
    this.serv.genererFich( 
      this.token.getUser().codSoc,
      this.formAdherent.get('datDeb')?.value,  
      this.formAdherent.get('corps')?.value, 
      this.formAdherent.get('grp_pret')?.value,
      this.formAdherent.get('typ_pret')?.value
    ).subscribe(
      (data: any) => {
        this.serv.telechargerFichier(data.fileName)

        Swal.close();
      },
      (error) => {
        console.log(error);

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Échec de la génération du rapport.'
        });
      }
    );

  }



}



