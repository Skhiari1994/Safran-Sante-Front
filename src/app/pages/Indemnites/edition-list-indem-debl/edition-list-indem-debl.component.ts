import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { Personnel, AdherentService } from '../../Adherent/adherent.service';
import { IndemnitesService } from '../indemnites.service';

@Component({
  selector: 'app-edition-list-indem-debl',
  templateUrl: './edition-list-indem-debl.component.html',
  styleUrl: './edition-list-indem-debl.component.scss'
})
export class EditionListIndemDeblComponent {
personnelList: Personnel[] = [];
  formAdherent: FormGroup;
  columnsSearch: any[] = [];
  currentMonth:any
  listCorps: any[] = [];
  mois:any
  natDontList: any[] = [];
  columnsNatDon: any[] = [];
  listLieu: any[] = [];
  columnsLieu: any[] = [];
  constructor(
    private personnelService: AdherentService,
    private token: TokenStorage,
    private fb: FormBuilder,
    private saveService: SaveService,
    private serv:IndemnitesService
  ) {
    this.formAdherent = this.fb.group({
      mat_pers_deb: [''],
       nom_deb: [''],
       mat_pers_fin: [''],
       nom_fin: [''],
      nat_don:[''],
      lib_don:[''],
      dat_deb:[''],
      dat_fin:[''],
      cod_lieu_geog:[''],
      lib_lieu:[''],
      etat_dem:[''],
      dat_deblc_deb:[''],
      dat_deblc_fin:[''],
      mod_pay:['']
    });
  }

  ngOnInit() {
    this.getAllPersonnel(this.token.getUser().codSoc);
    this.saveService.registerPrintCallback(() => this.printReport());

   
 
this.getNatDon()
this.getAllLieu()
  }
 
  onSelectedVMat(item: Personnel) {
    this.formAdherent.patchValue({
      mat_pers_deb: item.mat_pers,
       nom_deb: item.nom
    });
  }

  onSelectedVMat2(item: Personnel) {
    this.formAdherent.patchValue({
      mat_pers_fin: item.mat_pers,
      
      nom_fin: item.nom
    });
  }

  onSelectedNatDon(item:any){
    this.formAdherent.patchValue({
      nat_don: item.nat_don,
      
      lib_don: item.lib_nat_don
    }); 
  }

  onSelectedLieu(item:any){
    this.formAdherent.patchValue({
      cod_lieu_geog: item.cod_lieu_geog,
      
      lib_lieu: item.lib_lieu
    }); 
  }
  getAllPersonnel(soc: string) {
    this.personnelService.getAllPersonnel(soc).subscribe((data) => {
      this.personnelList = data;
      this.columnsSearch = [
        { key: "mat_pers", label: "Matricule" },
        { key: "mat_int", label: "Mat. Administratif" },
        { key: "nom", label: "Nom & Prénom" },
        { key: "dat_nais", label: "Date Naissance" },
        { key: "num_retr", label: "N° CNRPS" },
      ];
    });
  }
  getNatDon() {
    this.serv.getNatDon().subscribe((data) => {
      this.natDontList = data;
      this.columnsNatDon = [
        { key: "nat_don", label: "Code" },
        { key: "lib_nat_don", label: "Libelle" },
       ];
    });
  }

  getAllLieu() {
    this.serv.getAllLieu().subscribe((data) => {
      this.listLieu = data;
      this.columnsLieu = [
        { key: "cod_lieu_geog", label: "Code" },
        { key: "lib_lieu", label: "Libelle" },
       ];
    });
  }
  getPersonnelByMatPers(soc: string, matPers: string) {
    this.personnelService
      .getPersonnelByMatPers(soc, matPers)
      .subscribe((data) => {
        this.personnelList = data;
      });
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
      "dat_deb",
      "dat_fin",
      "dat_deblc_deb",
      "dat_deblc_fin"
    ]);
 
    this.serv.editionListIndemniteDeblc(
      '88',
      this.token.getUser().codSoc,
      this.formAdherent.get('mat_pers_deb')?.value,
      this.formAdherent.get('mat_pers_fin')?.value,
      this.formAdherent.get('dat_deb')?.value,
      this.formAdherent.get('dat_fin')?.value,
      this.formAdherent.get('nat_don')?.value,
       this.formAdherent.get('etat_dem')?.value,
      this.formAdherent.get('mod_pay')?.value,
      this.formAdherent.get('dat_deblc_deb')?.value,
      this.formAdherent.get('dat_deblc_fin')?.value,
    ).subscribe(
      (data: any) => {
        let file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
  
        const a = document.createElement('a');
        a.href = fileURL;
  
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        a.download = `Rapport_List_Indemnité_deblc${formattedDate}.pdf`;
  
        a.click();
  
        // Nettoyage
        URL.revokeObjectURL(fileURL);
  
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



