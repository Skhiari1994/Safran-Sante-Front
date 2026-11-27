import { lovMatch } from 'src/app/shared/lov-match';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  HostListener,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NavigationFicheService } from '../../Service/navigation-fiche.service';
import { ActiviteHttpService } from '../../Service/activite-http.service';
import { Subject, Subscription, of } from 'rxjs';
import { catchError, debounceTime, finalize, switchMap } from 'rxjs/operators';
import { PageLov, SourceLovServeur } from '../../lov-serveur';

interface ListDataItem {
  [key: string]: any;
}

@Component({
  selector: 'app-lov',
  templateUrl: './lov.component.html',
  styleUrls: ['./lov.component.scss'],
})
export class LovComponent implements OnInit, OnChanges, OnDestroy {
  @Input() placeholder: string = 'Search...';
  @Input() listData: ListDataItem[] = [];
  @Input() columns: { key: string; label: string }[] = [];
  @Input() codeField: string = '';
  @Input() selectedItem: ListDataItem | null = null;
  @Input() selectedCode: string = ''; // Input for patching code
  @Input() disabled: boolean = false; // Lecture seule : champ grisé et recherche masquée
  @Output() selectedValue = new EventEmitter<ListDataItem>();
  @Output() selectedCodeChange = new EventEmitter<string>(); // Two-way binding

  /** Colonnes jamais montrées dans la fenêtre (ni champ de filtre, ni colonne du tableau) : le matricule administratif. */
  @Input() hiddenKeys: string[] = ['mat_int'];
  /** Colonnes réellement affichées = columns moins hiddenKeys. */
  visibleColumns: { key: string; label: string }[] = [];

  // ---------- mode serveur : la liste est lue page par page (grosses listes) ----------

  /**
   * Source serveur : si elle est donnée, listData n'est plus utilisé. Les filtres partent au serveur et la fenêtre
   * affiche une page à la fois avec une pagination ; le code saisi dans le champ est vérifié par le serveur.
   */
  @Input() source: SourceLovServeur | null = null;
  get modeServeur(): boolean {
    return !!this.source;
  }
  readonly taillesPage = [25, 50, 100];
  /** Lignes par page (mode mémoire comme mode serveur). */
  taillePage = 50;
  /** Page affichée, numérotée à partir de 0. */
  pageCourante = 0;
  /** Nombre de lignes correspondant aux filtres (toutes pages confondues). */
  totalServeur = 0;
  chargement = false;
  erreurChargement = '';
  private demandesPage = new Subject<void>();
  private abonnements = new Subscription();
  /** Numéro de la dernière vérification de code : une réponse plus ancienne arrivée en retard est ignorée. */
  private verificationCode = 0;

  /** Nombre de lignes trouvées, toutes pages confondues. */
  get totalLignes(): number {
    return this.modeServeur ? this.totalServeur : this._filteredData.length;
  }

  get nbPages(): number {
    return Math.max(1, Math.ceil(this.totalLignes / this.taillePage));
  }

  /** Rang de la première et de la dernière ligne affichées (« 51–100 sur 6 678 »). */
  get premiereLigne(): number {
    return this.totalLignes ? this.pageCourante * this.taillePage + 1 : 0;
  }
  get derniereLigne(): number {
    return Math.min(this.totalLignes, (this.pageCourante + 1) * this.taillePage);
  }

  /** 6678 → « 6 678 » (séparateur de milliers français). */
  nombre(n: number): string {
    return (n ?? 0).toLocaleString('fr-FR');
  }

  allerPage(page: number): void {
    const cible = Math.min(Math.max(page, 0), this.nbPages - 1);
    if (cible === this.pageCourante || this.chargement) return;
    this.pageCourante = cible;
    if (this.modeServeur) this.demandesPage.next();
    else this.majAffichees();
  }

  changerTaillePage(taille: number | string): void {
    this.taillePage = Number(taille) || 50;
    this.pageCourante = 0;
    if (this.modeServeur) this.demandesPage.next();
    else this.majAffichees();
  }

  /** Recharge la page courante (bouton « Réessayer » après une erreur). */
  rechargerPage(): void {
    this.demandesPage.next();
  }

  /** Filtres non vides envoyés au serveur. */
  private filtresActifs(): Record<string, string> {
    const filtres: Record<string, string> = {};
    for (const [cle, valeur] of Object.entries(this.columnSearchQueries)) {
      if (valeur && valeur.trim() !== '') filtres[cle] = valeur.trim();
    }
    return filtres;
  }

  /** Une seule requête à la fois : une demande plus récente (frappe, page suivante) annule la précédente. */
  private brancherSourceServeur(): void {
    this.abonnements.add(
      this.codesSaisis.pipe(debounceTime(250)).subscribe(code => {
        // le champ a encore changé ou a été vidé depuis : on ne vérifie que la valeur affichée
        if (String(code ?? '').trim() === String(this.selectedCode ?? '').trim()) this.interrogerCode(code, false);
      })
    );
    this.abonnements.add(
      this.demandesPage
        .pipe(
          switchMap(() => {
            const source = this.source;
            if (!source) return of<PageLov | null>(null);
            this.chargement = true;
            this.erreurChargement = '';
            return source.page(this.filtresActifs(), this.pageCourante, this.taillePage).pipe(
              catchError(() => {
                this.erreurChargement = 'La liste n\'a pas pu être chargée.';
                return of<PageLov | null>(null);
              }),
              finalize(() => (this.chargement = false))
            );
          })
        )
        .subscribe(resultat => {
          if (!resultat) {
            this.filteredData = [];
            return;
          }
          this.totalServeur = resultat.total;
          this.filteredData = resultat.content;
          // les filtres ont réduit la liste pendant qu'on était sur une page lointaine : retour à la dernière page
          if (!resultat.content.length && resultat.total > 0 && this.pageCourante > 0) {
            this.pageCourante = this.nbPages - 1;
            this.demandesPage.next();
          }
        })
    );
  }

  /**
   * Code saisi dans le champ (ou posé par l'écran) vérifié par le serveur.
   * depuisEcran = true : code posé par l'écran (patchValue) ; sinon : code tapé par l'utilisateur (sortie du champ).
   */
  private verifierCodeServeur(code: any, depuisEcran: boolean): void {
    const normalise = (v: any) => String(v ?? '').trim().toLowerCase();
    // la ligne déjà choisie porte ce code : inutile d'interroger le serveur
    if (this.selectedItem && normalise(this.selectedItem[this.codeField]) === normalise(code)) {
      ++this.verificationCode;
      this.appliquerTrouve(this.selectedItem, depuisEcran);
      return;
    }
    if (depuisEcran) {
      this.interrogerCode(code, true);
    } else {
      // saisie au clavier : une seule question au serveur quand la frappe marque une pause
      ++this.verificationCode;
      this.codesSaisis.next(code);
    }
  }

  private codesSaisis = new Subject<any>();

  private interrogerCode(code: any, depuisEcran: boolean): void {
    if (!this.source) return;
    const numero = ++this.verificationCode;
    this.source.parCode(String(code).trim())
      .pipe(catchError(() => of(undefined)))
      .subscribe(trouve => {
        if (numero !== this.verificationCode) return; // une autre saisie a eu lieu entre-temps
        if (trouve === undefined) {
          // serveur injoignable : on ne déclare pas le code faux, on garde la saisie
          this.errorMessage = '';
          if (depuisEcran) this.selectedValue.emit({ [this.codeField]: code });
          return;
        }
        if (trouve) {
          this.appliquerTrouve(trouve, depuisEcran);
        } else {
          this.errorMessage = 'Valeur introuvable.';
          this.selectedItem = null;
          if (depuisEcran) {
            this.selectedCode = code;
            this.selectedCodeChange.emit(this.selectedCode);
            this.selectedValue.emit({ [this.codeField]: code });
          } else {
            this.selectedValue.emit(undefined);
          }
        }
      });
  }

  /** Même effet qu'une ligne trouvée dans la liste en mémoire (patchValue / sortie du champ). */
  private appliquerTrouve(item: ListDataItem, depuisEcran: boolean): void {
    this.selectedItem = item;
    if (depuisEcran) {
      this.selectedCode = item[this.codeField];
      this.selectedCodeChange.emit(this.selectedCode);
    }
    this.selectedValue.emit(item);
    this.errorMessage = '';
  }

  ngOnDestroy(): void {
    this.arreterAttente();
    this.abonnements.unsubscribe();
  }

  /** Lignes de la page affichée dans le tableau (afficher des milliers de lignes d'un coup bloque le navigateur). */
  affichees: ListDataItem[] = [];

  private _filteredData: ListDataItem[] = [];
  /** Liste filtrée complète (mode mémoire) ou lignes de la page reçue du serveur (mode serveur). */
  get filteredData(): ListDataItem[] {
    return this._filteredData;
  }
  /** Chaque nouvelle liste (ouverture, recherche) repart de la première page. */
  set filteredData(valeur: ListDataItem[]) {
    this._filteredData = valeur || [];
    if (!this.modeServeur) this.pageCourante = 0;
    this.majAffichees();
  }

  /** Mode mémoire : découpe la page courante dans la liste filtrée ; mode serveur : la page reçue telle quelle. */
  private majAffichees(): void {
    this.affichees = this.modeServeur
      ? this._filteredData
      : this._filteredData.slice(this.pageCourante * this.taillePage, (this.pageCourante + 1) * this.taillePage);
  }

  /** Largeur d'un champ de filtre selon le nombre de colonnes : 2 à 4 champs par ligne, jamais une longue pile. */
  get colClass(): string {
    const n = this.visibleColumns.length;
    if (n <= 2) return 'col-12 col-md-6';
    if (n === 3) return 'col-12 col-md-4';
    if (n === 4) return 'col-12 col-sm-6 col-lg-3';
    if (n <= 6) return 'col-12 col-sm-6 col-lg-4';
    return 'col-12 col-sm-6 col-lg-3';
  }

  hasQuery(): boolean {
    return Object.values(this.columnSearchQueries).some(q => !!q && q.trim() !== '');
  }
  columnSearchQueries: { [key: string]: string } = {}; // Individual column search queries
  searchSubject = new Subject<string>(); // Debounce subject
  errorMessage: string = ''; // Property to track errors

  constructor(private modalService: NgbModal, private hote: ElementRef<HTMLElement>, private navFiche: NavigationFicheService,
    private activite: ActiviteHttpService) { }

  /** true dès que l'écran a fourni sa liste (même vide). */
  private listeRecue = false;

  /**
   * Mode mémoire : la fenêtre est ouverte avant que l'écran ait reçu sa liste du serveur (lecture encore en route).
   * On affiche « Chargement de la liste… » plutôt que « Aucun résultat » ; la liste s'affiche dès son arrivée.
   */
  get attenteListe(): boolean {
    return !this.modeServeur && !this.listeRecue && !(this.listData?.length) && this.activite.actif
      && Date.now() < this.limiteAttente;
  }

  /**
   * Attente bornée : certains écrans lient une liste qu'ils ne remplissent jamais, et l'application fait d'autres
   * lectures en arrière-plan. Passé ce délai, une liste toujours vide affiche « Aucun résultat » (si elle arrive
   * plus tard, elle s'affiche quand même).
   */
  private limiteAttente = 0;
  private static readonly ATTENTE_MAX_MS = 6000;

  /** Pendant l'attente de la liste, la fenêtre se réévalue régulièrement (une liste vide n'est déclarée vide qu'au calme). */
  private minuterieAttente?: ReturnType<typeof setInterval>;

  private surveillerAttente(): void {
    this.arreterAttente();
    this.limiteAttente = Date.now() + LovComponent.ATTENTE_MAX_MS;
    if (!this.attenteListe) return;
    this.minuterieAttente = setInterval(() => {
      if (!this.attenteListe) this.arreterAttente();
    }, 300);
  }

  private arreterAttente(): void {
    if (this.minuterieAttente) {
      clearInterval(this.minuterieAttente);
      this.minuterieAttente = undefined;
    }
  }


  /** Une page (mode serveur) ou la liste de l'écran (mode mémoire) est en route. */
  get enChargement(): boolean {
    return this.chargement || this.attenteListe;
  }

  ngOnInit(): void {
    this.visibleColumns = (this.columns || []).filter(c => !this.hiddenKeys.includes(c.key));
    this.filteredData = [...this.listData];
    this.initializeColumnSearchQueries();

    this.brancherSourceServeur();
    this.abonnements.add(this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      if (this.modeServeur) {
        // nouveaux filtres : le serveur renvoie la première page des lignes correspondantes
        this.pageCourante = 0;
        this.demandesPage.next();
      } else {
        this.filterData();
      }
    }));

    if (this.selectedItem) {
      this.selectedCode = this.selectedItem[this.codeField] ?? '';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.visibleColumns = (this.columns || []).filter(c => !this.hiddenKeys.includes(c.key));

    if (changes['listData']) {
      // liste reçue de l'écran (une liste vide liée dès le départ ne compte pas : elle est souvent encore en route)
      const liste = changes['listData'];
      if (!liste.firstChange || (Array.isArray(liste.currentValue) && liste.currentValue.length > 0)) this.listeRecue = true;
      // arrivée pendant que la fenêtre est ouverte : elle s'affiche aussitôt, avec les filtres déjà tapés
      if (this.hasQuery()) this.filterData();
      else this.filteredData = Array.isArray(this.listData) ? [...this.listData] : [];
      if (this.listData && this.listData.length > 0 && this.hasCode(this.selectedCode)) {
        this.patchValue(this.selectedCode);
      }
    }

    if (changes['selectedItem'] && this.selectedItem) {
      this.selectedCode = this.selectedItem[this.codeField] ?? '';
    }

    if (changes['selectedCode'] && this.hasCode(changes['selectedCode'].currentValue)) {
      this.patchValue(changes['selectedCode'].currentValue);
    }

    // l'écran a vidé le code (autre fiche, sans valeur) : on efface aussi l'état de la valeur précédente
    // (message « Valeur introuvable. » et valeur choisie), sinon il resterait affiché sous un champ vide
    if (changes['selectedCode'] && !changes['selectedCode'].firstChange && !this.hasCode(changes['selectedCode'].currentValue)) {
      this.selectedItem = null;
      this.errorMessage = '';
    }
  }
  /** Un code est présent même s'il vaut 0 (ex. numéro de famille 0 = adhérent). */
  private hasCode(code: any): boolean {
    return code !== null && code !== undefined && String(code).trim() !== '';
  }

  initializeColumnSearchQueries(): void {
    this.columnSearchQueries = {};
    if (this.columns) {
      this.columns.forEach((column) => {
        this.columnSearchQueries[column.key] = '';
      });
    }
  }

  filterData(): void {
    // Check if there's at least one non-empty search query
    const hasAnyQuery = Object.values(this.columnSearchQueries).some(q => q && q.trim() !== '');

    // recherche effacée : toute la liste réapparaît (comme à l'ouverture de la fenêtre)
    if (!hasAnyQuery) {
      this.filteredData = Array.isArray(this.listData) ? [...this.listData] : [];
      return;
    }

    // Filter data based on search queries
    this.filteredData = this.listData.filter((item) => {
      return Object.keys(this.columnSearchQueries).every((key) => {
        const query = this.columnSearchQueries[key]?.toLowerCase().trim();

        // Skip empty queries - don't filter on empty fields
        if (!query) {
          return true;
        }

        // Get the field value, handle null/undefined
        const fieldValue = item[key];

        // If field is null/undefined and query is not empty, don't match
        if (fieldValue == null) {
          return false;
        }

        // Convert to string and check if it includes the query
        return lovMatch(key, fieldValue, query);
      });
    });
  }

  onColumnSearch(): void {
    this.searchSubject.next('');
  }

  showAll(): void {
    this.initializeColumnSearchQueries();
    if (this.modeServeur) {
      this.pageCourante = 0;
      this.demandesPage.next();
      return;
    }
    this.filteredData = [...this.listData];
  }

  /** Vide le champ code (utilisé par « Retour » / « Nouveau » des pages de saisie). */
  clear(): void {
    ++this.verificationCode;
    this.selectedItem = null;
    this.selectedCode = '';
    this.errorMessage = '';
  }

  selectItem(item: ListDataItem): void {
    this.selectedItem = item;
    this.selectedCode = item[this.codeField] ?? '';
    this.selectedValue.emit(item);
    this.errorMessage = ''; // Clear error on selection
    // valeur choisie par l'utilisateur dans la fenêtre : la fiche est modifiée (avertissement avant de la quitter)
    this.navFiche.signalerChoix(this.hote.nativeElement);
  }

  openModal(content: any): void {
    // champs de filtre vidés à l'ouverture : on repart donc de la liste complète (100 premières lignes)
    this.initializeColumnSearchQueries();
    if (this.modeServeur) {
      // première page demandée au serveur à chaque ouverture : la liste est toujours à jour
      this.pageCourante = 0;
      this.totalServeur = 0;
      this.filteredData = [];
      this.demandesPage.next();
    } else {
      this.filteredData = [...this.listData];
    }
    this.modalService.open(content, { size: 'xl' }).result?.finally(() => this.arreterAttente()).catch(() => undefined);
    this.surveillerAttente();
  }
  /**
   * Ligne correspondant au code. Plusieurs lignes peuvent partager le même code (ex. « BP » : 996 actes dans REF_ACT) :
   * si la ligne déjà choisie (selectedItem) a ce code, c'est elle qui est gardée, pas la première trouvée.
   */
  private trouverParCode(code: any): ListDataItem | undefined {
    const normalise = (v: any) => String(v ?? '').trim().toLowerCase();
    const cherche = normalise(code);
    if (this.selectedItem && normalise(this.selectedItem[this.codeField]) === cherche) {
      return this.selectedItem;
    }
    return (this.listData || []).find(item => normalise(item[this.codeField]) === cherche);
  }

  patchValue(patchedCode: any): void {
    if (patchedCode == null) return;
    if (this.modeServeur) {
      this.verifierCodeServeur(patchedCode, true);
      return;
    }
    const foundItem = this.trouverParCode(patchedCode);

    // if (foundItem) {
    //   this.selectedItem = foundItem;
    //   this.selectedCode = foundItem[this.codeField];
    //   this.selectedCodeChange.emit(this.selectedCode);
    //   this.selectedValue.emit(foundItem);
    //   this.errorMessage = '';
    // } else {
    //   this.errorMessage = this.listData && this.listData.length > 0 ? 'Valeur introuvable.' : '';
    //   this.selectedItem = null;
    //   if (this.listData && this.listData.length > 0) {
    //     this.selectedCode = '';
    //     this.selectedCodeChange.emit(this.selectedCode);
    //   }
    // }

    if (foundItem) {
      this.selectedItem = foundItem;
      this.selectedCode = foundItem[this.codeField];
      this.selectedCodeChange.emit(this.selectedCode);
      this.selectedValue.emit(foundItem);
      this.errorMessage = '';
    } else {
      this.errorMessage = this.listData && this.listData.length > 0 ? 'Valeur introuvable.' : '';
      this.selectedItem = null;
      this.selectedCode = patchedCode;
      this.selectedCodeChange.emit(this.selectedCode);
      this.selectedValue.emit({ [this.codeField]: patchedCode });
    }

  }
  @HostListener('focusout', ['$event'])
  onCodeChange(): void {
    const normalizedCode = String(this.selectedCode ?? '').trim().toLowerCase();

    if (normalizedCode && this.modeServeur) {
      this.verifierCodeServeur(this.selectedCode, false);
    } else if (normalizedCode) {
      const foundItem = this.trouverParCode(normalizedCode);

      if (foundItem) {
        this.selectedItem = foundItem;
        this.selectedValue.emit(foundItem);
        this.errorMessage = '';
      } else {
        this.errorMessage = this.listData && this.listData.length > 0 ? 'Valeur introuvable.' : '';
        this.selectedValue.emit(undefined);
      }
    } else {
      // champ vide : pas d'erreur affichée (le curseur y est souvent placé automatiquement, ex. Matricule après
      // « Nouveau » ; le quitter sans rien saisir n'est pas une faute). Un code introuvable reste signalé ci-dessus.
      ++this.verificationCode; // une vérification serveur encore en route ne doit plus rien afficher
      this.errorMessage = '';
      this.selectedValue.emit(undefined);
    }
  }

  trackByFn(index: number, item: ListDataItem): any {
    return item[this.codeField];
  }

  // Format date value from Oracle timestamp string to dd/MM/yyyy
  formatDateValue(value: any): string {
    if (!value) {
      return '';
    }

    // If it's already a Date object
    if (value instanceof Date) {
      const day = String(value.getDate()).padStart(2, '0');
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const year = value.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // If it's a string (Oracle timestamp format: "1968-08-04 00:00:00.0")
    if (typeof value === 'string') {
      // Extract date part before the space
      const datePart = value.split(' ')[0];

      if (datePart && datePart.includes('-')) {
        const parts = datePart.split('-');
        if (parts.length === 3) {
          const year = parts[0];
          const month = parts[1];
          const day = parts[2];
          return `${day}/${month}/${year}`;
        }
      }
    }

    return value;
  }
}
