import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { erreurLogo, preparerLogo, tailleLisible } from './logo-societe';
import { FormGroup, FormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
 import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { notifSucces, notifErreur, confirmerSuppression, echapperHtml, MSG_AJOUT, MSG_MODIF, MSG_SUPPR, MSG_SUPPR_IMPOSSIBLE } from '../notif';
import { ParamAdherentService } from '../param-adherent.service';
@Component({
  selector: 'app-prm-societe',
  templateUrl: './prm-societe.component.html',
  styleUrl: './prm-societe.component.scss'
})
export class PrmSocieteComponent implements OnDestroy {
  /** Logos déjà enregistrés, par code société (adresse locale d'une image lue sur le serveur). */
  logos: { [codSoc: string]: string } = {};
  /** Logo choisi dans la fenêtre, pas encore envoyé. */
  logoFichier: File | null = null;
  private logoUrlLocale: string | null = null;
  /** La société modifiée avait un logo. */
  logoExistant = false;
  /** L'utilisateur a demandé de retirer le logo existant. */
  logoRetire = false;
  logoErreur = '';
  /** Information affichée sous l'aperçu quand l'image a été réduite automatiquement. */
  logoInfo = '';
  logoEnPreparation = false;

  p: number = 1; // Pagination pour le premier tableau
  pCertif: number = 1;
  formSociete!: FormGroup; 
  listSociete: any[] = [];
   
  save!: boolean;
  isDisabled!: boolean;
  breadCrumbItems!: Array<{}>;

  edit: boolean = true;
  constructor(
    private fb: FormBuilder,
    private serv: ParamAdherentService,
    public service: PaginationService,
    private modalService: NgbModal,
    private saveService: SaveService,
    private tokenStorage:TokenStorage,
    private cdr: ChangeDetectorRef
  ) {
    this.formSociete = this.fb.group({
      cod_soc: [""],
      lib_soc: [""],
      cod_retr: [""],
      adr_soc: [""],
      lib_soc_a: [""],
      adr_soc_a: [""],
      tel_soc: [""],
      fax_soc: [""],
      num_retr: [""],
      rep_web: [""],
      regime: [""],
      num_police: [""], 
    });

  }
  ngOnInit(): void {
 this.getSociete()
  }


  /////////////////////////////////////////////////////////////
  columnTitles: { [key: string]: string } = {
    cod_banq: "Code société",
    lib_banq: "Libellé société.",
    lib_banq_a: "Libellé société. arab", 
  };
 
  
  showFilters: { [key: string]: boolean } = {};
 
  toggleFilter(column: string): void {
    this.showFilters[column] = !this.showFilters[column];
  }
 
  searchz: any = {
    cod_banq: "",
    lib_banq: "",
    lib_banq_a: "", 
  };

  litSoc:any
  applyFilter() {
    this.litSoc = this.litSoc.filter((row:any) => {
     return Object.keys(this.searchz).every((key) => {
       const searchValue = this.searchz[key]?.toString().toLowerCase() || "";
       const rowValue = row[key]?.toString().toLowerCase() || "";
       return rowValue.includes(searchValue);
     });
   });
 }
 





//////////////////////////////////////////////////////
  AddSociete() {
    const codSoc = this.formSociete.value.cod_soc;
    const fichier = this.logoFichier;
    const retirer = this.logoRetire && !fichier;
    this.reinitialiserLogo();

    // la société d'abord ; son logo ensuite (envoi, ou retrait). Un échec du logo n'annule pas la société.
    this.serv.AddSociete(this.formSociete.value).pipe(
      switchMap(() => {
        if (fichier) {
          return this.serv.setLogoSociete(codSoc, fichier).pipe(map(() => null), catchError((err) => of(err)));
        }
        if (retirer) {
          return this.serv.deleteLogoSociete(codSoc).pipe(map(() => null), catchError((err) => of(err)));
        }
        return of(null);
      })
    ).subscribe({
      next: (erreurDuLogo) => {
        notifSucces(this.edit ? MSG_AJOUT : MSG_MODIF);
        if (erreurDuLogo) {
          notifErreur("Logo non enregistré", erreurDuLogo, "La société est enregistrée, mais son logo n'a pas pu l'être.");
        }
        this.getSociete();
      },
      error: (err) => notifErreur("Enregistrement impossible", err, "L'enregistrement a échoué."),
    });
  }

  /** Logo affiché dans la fenêtre : celui qui vient d'être choisi, sinon celui déjà enregistré (sauf s'il est retiré). */
  get logoAffiche(): string | null {
    if (this.logoUrlLocale) return this.logoUrlLocale;
    if (this.logoRetire || this.edit) return null; // edit = mode « Ajouter » dans ce composant
    return this.logos[this.formSociete.value.cod_soc] ?? null;
  }

  async choisirLogo(event: Event): Promise<void> {
    const champ = event.target as HTMLInputElement;
    const fichier = champ.files?.[0];
    if (!fichier) return;
    const erreur = erreurLogo(fichier);
    if (erreur) {
      this.logoErreur = erreur;
      this.logoInfo = '';
      champ.value = '';
      return;
    }
    // une grande image est réduite avant l'envoi (logo net et léger) ; une petite est envoyée telle quelle
    this.logoEnPreparation = true;
    this.logoErreur = '';
    try {
      const prepare = await preparerLogo(fichier);
      this.libererLogoLocal();
      this.logoFichier = prepare.fichier;
      this.logoUrlLocale = URL.createObjectURL(prepare.fichier);
      this.logoRetire = false;
      this.logoInfo = prepare.reduit
        ? `Image réduite automatiquement : ${prepare.largeurOrigine} × ${prepare.hauteurOrigine} px (${tailleLisible(fichier.size)}) devient ${prepare.largeur} × ${prepare.hauteur} px (${tailleLisible(prepare.fichier.size)}).`
        : '';
    } catch (e: any) {
      this.logoErreur = e?.message || "Cette image n'a pas pu être préparée.";
      this.logoInfo = '';
      champ.value = '';
    } finally {
      this.logoEnPreparation = false;
    }
  }

  retirerLogo(): void {
    this.libererLogoLocal();
    this.logoFichier = null;
    this.logoRetire = this.logoExistant;
    this.logoErreur = '';
    this.logoInfo = '';
  }

  private libererLogoLocal(): void {
    if (this.logoUrlLocale) {
      URL.revokeObjectURL(this.logoUrlLocale);
      this.logoUrlLocale = null;
    }
  }

  private reinitialiserLogo(): void {
    this.libererLogoLocal();
    this.logoFichier = null;
    this.logoExistant = false;
    this.logoRetire = false;
    this.logoErreur = '';
    this.logoInfo = '';
  }

  /** Lit le logo de chaque société qui en a un (indicateur a_logo renvoyé par la liste). */
  private chargerLogos(liste: any[]): void {
    Object.values(this.logos).forEach((url) => URL.revokeObjectURL(url));
    this.logos = {};
    (liste || []).filter((s) => s.a_logo === 1).forEach((s) => {
      this.serv.getLogoSociete(s.cod_soc).subscribe({
        next: (blob) => { this.logos[s.cod_soc] = URL.createObjectURL(blob); this.cdr.markForCheck(); },
        error: () => { /* pas de logo lisible : l'initiale reste affichée */ },
      });
    });
  }

  ngOnDestroy(): void {
    this.libererLogoLocal();
    Object.values(this.logos).forEach((url) => URL.revokeObjectURL(url));
  }
 
 
  onSort(column: any) {
    console.log("this.dataRows :", this.listSociete);
    this.listSociete = this.service.onSort(column, this.listSociete);
  }
  
  

 
  openModalTab(content: any) {
    this.edit = true;
    this.reinitialiserLogo();
    this.formSociete.reset({ cod_retr: '', rep_web: '' })
    //this.formCertif.reset()
    this.modalService.open(content, { size: "xl", centered: true });
  }

  editDataGet(id: any, data: any, content: any) {
    this.edit = false;
    this.reinitialiserLogo();
    this.logoExistant = data.a_logo === 1;
    this.modalService.open(content, { size: "xl", centered: true });

    this.formSociete.get("cod_soc")?.patchValue(data.cod_soc),
    this.formSociete.get("lib_soc")?.patchValue(data.lib_soc),
    this.formSociete.get("cod_retr")?.patchValue(data.cod_retr),
    this.formSociete.get("adr_soc")?.patchValue(data.adr_soc),
    this.formSociete.get("lib_soc_a")?.patchValue(data.lib_soc_a),
    this.formSociete.get("adr_soc_a")?.patchValue(data.adr_soc_a),
    this.formSociete.get("tel_soc")?.patchValue(data.tel_soc),
    this.formSociete.get("fax_soc")?.patchValue(data.fax_soc),
    this.formSociete.get("num_retr")?.patchValue(data.num_retr),
    this.formSociete.get("rep_web")?.patchValue(data.rep_web),
    this.formSociete.get("regime")?.patchValue(data.regime),
    this.formSociete.get("num_police")?.patchValue(data.num_police)

  }
  getSociete () {
 

    this.serv
      .getSociete()
      .subscribe((data) => {
        console.log("data", data);
        this.listSociete = data;
        this.chargerLogos(data);
      });
  }
  selectedRow: number | null = null;

  /** Suppression : le serveur refuse si le code société est lié à d'autres données. */
  supprimerSociete(row: any) {
    confirmerSuppression("Supprimer cette société ?",
      `Code <b>${echapperHtml(row.cod_soc)}</b> – ${echapperHtml(row.lib_soc)}`).then((confirme) => {
      if (!confirme) return;
      this.serv.deleteSociete(row.cod_soc).subscribe({
        next: () => {
          this.getSociete();
          notifSucces("Société supprimée avec succès !");
        },
        error: (err) => notifErreur("Suppression impossible", err, "Suppression impossible"),
      });
    });
  }


  deleteId: any;
  confirm(content: any, id: any) {
    console.log("annee:",id)
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }
  // ConfirmDelete(){
  //   this.serv.deleteCertifFamille(this.deleteId.cod_soc,this.deleteId.num_fam,this.deleteId.mat_pers,this.deleteId.annee_certif).subscribe(data=>{
  //     this.adherentServ
  //   .getCertifEnf(this.deleteId.mat_pers, this.deleteId.num_fam)
  //   .subscribe((data) => {
  //     console.log("data", data);
  //     this.listCertifFam = data;
  //   });
  //   })

   
  // }
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
 
  onPageChangeForGouv(page: number): void {
    console.log("Pagination pour le tableau 1 : ", page);

    this.p = page;
    this.cdr.detectChanges();

  }
  
  onPageChangeForPoste(page: number): void {
    console.log("Pagination pour le tableau 2 : ", page);
    this.pCertif = page;
    this.cdr.detectChanges();

  }

}

