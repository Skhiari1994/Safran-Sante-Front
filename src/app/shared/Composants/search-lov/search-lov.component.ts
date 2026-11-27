import { lovMatch } from 'src/app/shared/lov-match';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ActiviteHttpService } from 'src/app/shared/Service/activite-http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, debounceTime, finalize, switchMap } from 'rxjs/operators';
import { Subject, Subscription, of } from 'rxjs';
import { AVEC_SEXES, FILTRE_GLOBAL, FILTRE_SEXE, PageLov, SourceLovServeur } from 'src/app/shared/lov-serveur';
import { SaveService } from 'src/app/shared/Service/save.service';
import { DemandeNavigation, NavigationFicheService } from 'src/app/shared/Service/navigation-fiche.service';
import { cibleNavigation, clesDeNavigation, ContexteNavigation, identification, ordonner, positionCible, signature } from 'src/app/shared/navigation-liste';

@Component({
  selector: 'app-search-lov',
  templateUrl: './search-lov.component.html',
  styleUrls: ['./search-lov.component.scss']
})
export class SearchLovComponent implements OnChanges {
  @Input() placeholder: string = 'Search...';
  @Input() listData: any[] = [];
  @Input() columns: any[] = [];
  /** Colonnes jamais montrées dans la fenêtre (ni champ de filtre, ni colonne du tableau) : le matricule administratif. */
  @Input() hiddenKeys: string[] = ['mat_int'];
  /** Affiche un filtre Sexe (Tous / Masculin / Féminin) ; les lignes doivent porter un champ `sexe` (M ou F). */
  @Input() filtreSexe = false;
  /** '' = tous, sinon 'M' ou 'F'. */
  sexeFiltre: '' | 'M' | 'F' = '';
  /** Colonnes réellement affichées = columns moins hiddenKeys. */
  visibleColumns: any[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    this.visibleColumns = (this.columns || []).filter(c => !this.hiddenKeys.includes(c.key));
    const liste = changes['listData'];
    if (liste && !this.modeServeur) {
      // liste reçue de l'écran (une liste vide liée dès le départ ne compte pas : elle est souvent encore en route)
      if (!liste.firstChange || (Array.isArray(liste.currentValue) && liste.currentValue.length > 0)) this.listeRecue = true;
      if (!liste.firstChange) {
        // arrivée pendant que la fenêtre est ouverte : elle s'affiche aussitôt, avec la recherche déjà tapée
        if (this.filtreSexe) this.compterSexes();
        this.filterData();
      }
    }
  }

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
    this.limiteAttente = Date.now() + SearchLovComponent.ATTENTE_MAX_MS;
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
  @Input() codeField: string = 'cod_tit';
  @Input() labelField: string = 'lib_tit';
  @Output() selectedValue = new EventEmitter<any>();

  // ---------- mode serveur : la liste est lue page par page (grosses listes) ----------

  /**
   * Source serveur : si elle est donnée, listData n'est plus utilisé. Filtres, recherche unique et filtre Sexe partent
   * au serveur ; la fenêtre affiche une page à la fois ; les boutons fiche précédente / suivante demandent la fiche
   * voisine au serveur.
   */
  @Input() source: SourceLovServeur | null = null;
  get modeServeur(): boolean {
    return !!this.source;
  }
  /** Nombre de lignes correspondant aux filtres (toutes pages confondues). */
  totalServeur = 0;
  chargement = false;
  erreurChargement = '';
  /** true = demander aussi les effectifs du filtre Sexe. */
  private demandesPage = new Subject<boolean>();
  private abonnementPages?: Subscription;

  /** Filtres envoyés au serveur : colonnes remplies, recherche unique, sexe. */
  private filtresServeur(): Record<string, string> {
    const filtres: Record<string, string> = {};
    for (const [cle, valeur] of Object.entries(this.searchQueries)) {
      if (valeur && valeur.trim() !== '') filtres[cle] = valeur.trim();
    }
    if (this.rechercheGlobale.trim()) filtres[FILTRE_GLOBAL] = this.rechercheGlobale.trim();
    if (this.sexeFiltre) filtres[FILTRE_SEXE] = this.sexeFiltre;
    return filtres;
  }

  /** Une seule requête à la fois : une demande plus récente (frappe, page suivante) annule la précédente. */
  private brancherSourceServeur(): void {
    this.abonnementPages = this.demandesPage
      .pipe(
        switchMap(avecSexes => {
          const source = this.source;
          if (!source) return of<PageLov | null>(null);
          this.chargement = true;
          this.erreurChargement = '';
          const filtres = this.filtresServeur();
          if (avecSexes) filtres[AVEC_SEXES] = 'oui';
          return source.page(filtres, this.pageCourante, this.taillePage).pipe(
            catchError(() => {
              this.erreurChargement = "La liste n'a pas pu être chargée.";
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
        if (resultat.sexes) {
          const { tous, M, F } = resultat.sexes;
          this.comptesSexe = { tous, M, F, autre: Math.max(0, tous - M - F) };
        }
        // les filtres ont réduit la liste pendant qu'on était sur une page lointaine : retour à la dernière page
        if (!resultat.content.length && resultat.total > 0 && this.pageCourante > 0) {
          this.pageCourante = this.nbPages - 1;
          this.demandesPage.next(false);
        }
      });
  }

  /** Recharge la page courante (bouton « Réessayer » après une erreur). */
  rechargerPage(): void {
    this.demandesPage.next(false);
  }

  /** Ouverture de la fenêtre en mode serveur : première page, et effectifs du filtre Sexe s'il est affiché. */
  private ouvrirServeur(): void {
    this.pageCourante = 0;
    this.totalServeur = 0;
    this.filteredData = [];
    this.demandesPage.next(this.filtreSexe);
  }

  // ---------- pagination (même barre que la fenêtre des champs, app-lov) ----------
  readonly taillesPage = [25, 50, 100];
  /** Lignes par page : afficher des dizaines de milliers de lignes d'un coup bloque le navigateur. */
  taillePage = 50;
  /** Page affichée, numérotée à partir de 0. */
  pageCourante = 0;
  /** Lignes de la page affichée dans le tableau. */
  affichees: any[] = [];

  private _filteredData: any[] = [];
  /** Liste filtrée complète (toutes pages) : elle sert aussi à la navigation entre fiches. */
  get filteredData(): any[] {
    return this._filteredData;
  }
  /** Chaque nouvelle liste (ouverture, recherche) repart de la première page. */
  set filteredData(valeur: any[]) {
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

  /** Nombre de lignes trouvées, toutes pages confondues. */
  get totalLignes(): number {
    return this.modeServeur ? this.totalServeur : this._filteredData.length;
  }

  get nbPages(): number {
    return Math.max(1, Math.ceil(this.totalLignes / this.taillePage));
  }

  /** Rang de la première et de la dernière ligne affichées (« 51–100 »). */
  get premiereLigne(): number {
    return this.totalLignes ? this.pageCourante * this.taillePage + 1 : 0;
  }
  get derniereLigne(): number {
    return Math.min(this.totalLignes, (this.pageCourante + 1) * this.taillePage);
  }

  allerPage(page: number): void {
    const cible = Math.min(Math.max(page, 0), this.nbPages - 1);
    if (cible === this.pageCourante || this.chargement) return;
    this.pageCourante = cible;
    if (this.modeServeur) this.demandesPage.next(false);
    else this.majAffichees();
  }

  changerTaillePage(taille: number): void {
    this.taillePage = Number(taille) || 50;
    this.pageCourante = 0;
    if (this.modeServeur) this.demandesPage.next(false);
    else this.majAffichees();
  }

  /** 6678 → « 6 678 ». */
  nombre(n: number): string {
    return (n ?? 0).toLocaleString('fr-FR');
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

  /** Recherche unique : chaque mot saisi doit se retrouver dans au moins une colonne (ET entre les mots). */
  rechercheGlobale = '';
  /** Les champs de filtre par colonne sont repliés : on les ouvre avec le bouton « Filtres ». */
  filtresOuverts = false;

  /** Nombre de champs de colonne remplis (pastille du bouton « Filtres »). */
  get nbFiltresColonnes(): number {
    return Object.values(this.searchQueries).filter(q => !!q && q.trim() !== '').length;
  }

  /** « Rechercher par matricule, nom, prénom… » d'après les colonnes réellement affichées. */
  get placeholderRecherche(): string {
    const noms = this.visibleColumns.slice(0, 4).map(c => String(c.label ?? '').toLowerCase()).filter(Boolean);
    return noms.length ? `Rechercher par ${noms.join(', ')}…` : 'Rechercher…';
  }

  hasQuery(): boolean {
    return this.nbFiltresColonnes > 0 || this.rechercheGlobale.trim() !== '' || this.sexeFiltre !== '';
  }

  /** Saisie dans la barre unique : légère attente pour ne pas filtrer 40 000 lignes à chaque lettre. */
  onSearchGlobal(): void {
    this.searchSubject.next(this.rechercheGlobale);
  }

  effacerRechercheGlobale(): void {
    this.rechercheGlobale = '';
    this.filterData();
  }

  /** Entrée dans la barre : s'il ne reste qu'un résultat, on le choisit directement. */
  entrerRecherche(modal: any): void {
    if (this.modeServeur ? this.totalServeur === 1 && this.affichees.length === 1 : this.filteredData.length === 1) {
      this.choisir(this.filteredData[0], modal);
    }
  }

  /**
   * Ligne choisie dans la fenêtre : si la fiche affichée a été modifiée sans être enregistrée, confirmation d'abord.
   * La fenêtre reste ouverte pendant la question (les écrans la retirent de la page dès qu'elle se ferme).
   */
  async choisir(item: any, modal: any): Promise<void> {
    if (!(await this.navFiche.confirmerAbandon())) return;
    this.selectItem(item);
    modal.close();
  }

  /** Un ou plusieurs mots de la barre unique retrouvés dans une des colonnes visibles de la ligne. */
  private correspondRechercheGlobale(item: any, mots: string[]): boolean {
    return mots.every(mot =>
      this.visibleColumns.some(col => {
        const brut = item[col.key];
        const valeur = col.key === 'dat_nais' ? this.formatDateValue(brut) : brut;
        return lovMatch(col.key, valeur, mot);
      })
    );
  }

  /** Effectifs affichés à côté de chaque option du filtre Sexe (calculés à l'ouverture sur toute la liste). */
  comptesSexe = { tous: 0, M: 0, F: 0, autre: 0 };

  private compterSexes(): void {
    const c = { tous: 0, M: 0, F: 0, autre: 0 };
    for (const item of this.listData || []) {
      c.tous++;
      const s = String(item?.sexe ?? '').trim().toUpperCase();
      if (s === 'M') c.M++;
      else if (s === 'F') c.F++;
      else c.autre++; // sexe absent ou invalide : compté dans « Tous » seulement
    }
    this.comptesSexe = c;
  }

  /** Part des hommes dans la barre de répartition (sur les seules personnes dont le sexe est connu). */
  get pctM(): number {
    const connus = this.comptesSexe.M + this.comptesSexe.F;
    return connus ? Math.round((this.comptesSexe.M * 100) / connus) : 0;
  }

  get pctF(): number {
    const connus = this.comptesSexe.M + this.comptesSexe.F;
    return connus ? 100 - this.pctM : 0;
  }

  /** Texte lu par les lecteurs d'écran pour la barre de répartition. */
  get libelleRepartition(): string {
    return `${this.pctM} % d'hommes, ${this.pctF} % de femmes`;
  }

  /** Choix du filtre Sexe : un clic sur le même bouton ne le retire pas, « Tous » sert à ça. */
  choisirSexe(valeur: '' | 'M' | 'F'): void {
    this.sexeFiltre = valeur;
    this.filterData();
  }

  searchQueries: { [key: string]: string } = {};  // This will store search queries for each column
  selectedCode: string = '';
  selectedLabel: string = '';
  searchSubject = new Subject<string>(); // Debounce subject
  @ViewChild('content') content!: TemplateRef<any>;
  private isSearchSubscription!: Subscription;
  private dateFormatCache = new Map<any, string>(); // Cache for formatted dates

  constructor(private modalService: NgbModal, private saveService: SaveService, private navFiche: NavigationFicheService,
    private activite: ActiviteHttpService) { }

  ngOnInit(): void {
    this.filteredData = this.modeServeur ? [] : this.listData;
    this.brancherSourceServeur();

    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.filterData();
    });

    // Subscribe to isSearch$
    this.isSearchSubscription = this.saveService.isSearch$.subscribe((value) => {
      if (value) {
        // un bouton première / précédente / suivante / dernière fiche de la barre d'outils a réveillé la recherche :
        // on se déplace sans ouvrir la fenêtre
        const demande = this.navFiche.prendreDemande();
        if (demande) {
          this.appliquerNavigation(demande);
          return;
        }
        this.loadDataAndOpenModal();
        console.log("search f");
      }
    });
  }

  ngOnDestroy(): void {
    this.arreterAttente();
    // Unsubscribe to prevent leaks
    if (this.isSearchSubscription) {
      this.isSearchSubscription.unsubscribe();
    }
    this.abonnementPages?.unsubscribe();
  }
  private isModalOpen = false;

  loadDataAndOpenModal() {
    if (this.isModalOpen || !this.content) {
      setTimeout(() => this.loadDataAndOpenModal(), 100);
      return;
    }
    this.isModalOpen = true;
    // Clear search queries and show all data when modal opens
    this.searchQueries = {};
    this.rechercheGlobale = '';
    this.filtresOuverts = false;
    this.sexeFiltre = '';
    if (this.modeServeur) {
      this.ouvrirServeur();
    } else {
      if (this.filtreSexe) this.compterSexes();
      this.filteredData = [...this.listData]; // Show all data immediately
    }
    this.surveillerAttente();
    this.modalService.open(this.content, { size: 'xl' }).result.finally(() => {
      this.arreterAttente();
      this.isModalOpen = false; // Reset modal state
      this.saveService.setIsSearch(false); // Reset isSearch
    });
  }


  // Filter data based on individual column search
  filterData() {
    if (this.modeServeur) {
      // nouveaux critères : le serveur renvoie la première page des lignes correspondantes
      this.pageCourante = 0;
      this.demandesPage.next(false);
      return;
    }
    if (!this.columns || this.columns.length === 0) {
      // No columns defined: return empty
      this.filteredData = [];
      return;
    }

    // Check if there's at least one non-empty search query (champs texte ou filtre Sexe)
    const hasAnyQuery = this.hasQuery();

    // If no search queries, show all data (like app-lov)
    if (!hasAnyQuery) {
      this.filteredData = [...this.listData];
      return;
    }

    // Filter data based on search queries
    const mots = this.rechercheGlobale.toLowerCase().split(/\s+/).filter(Boolean);
    this.filteredData = this.listData.filter(item =>
      (!this.sexeFiltre || String(item?.sexe ?? '').trim().toUpperCase() === this.sexeFiltre) &&
      (!mots.length || this.correspondRechercheGlobale(item, mots)) &&
      this.columns.every(col => {
        const query = this.searchQueries[col.key]?.toLowerCase() || '';
        if (!query) return true; // No query for this column means include the item
        const value = item[col.key]?.toString().toLowerCase() || '';
        return lovMatch(col.key, value, query);
      })
    );
  }


  // Trigger search for each column
  onSearch() {
    // mode serveur : une seule requête quand la frappe marque une pause
    if (this.modeServeur) this.searchSubject.next('');
    else this.filterData(); // Call filter when user types in search fields
  }

  // Show all data (clear search)
  showAll() {
    this.searchQueries = {}; // Reset all search queries
    this.rechercheGlobale = '';
    this.sexeFiltre = '';
    if (this.modeServeur) {
      this.filterData();
      return;
    }
    this.filteredData = this.listData; // Show all data
  }

  // Select an item and emit the selected value
  selectItem(item: any) {
    this.selectedCode = item[this.codeField] || '';
    this.selectedLabel = item[this.labelField] || '';
    this.selectedValue.emit(item);
    this.publierNavigation(item);
  }

  // ---------- navigation entre les fiches (boutons de la barre d'outils) ----------

  /**
   * Retient la liste affichée au moment du choix (filtrée ou non) et la fiche choisie. La position est gardée dans le
   * service : les écrans détruisent cette fenêtre dès qu'une ligne est choisie.
   */
  private publierNavigation(item: any): void {
    if (this.modeServeur) {
      this.publierNavigationServeur(item);
      return;
    }
    const cles = clesDeNavigation(this.visibleColumns);
    const filtre = this.hasQuery();
    const liste = ordonner(this.filteredData, cles);
    const index = liste.indexOf(item);
    if (index < 0) {
      this.navFiche.effacer();
      return;
    }
    const contexte: ContexteNavigation = {
      cles,
      signature: signature(item, this.visibleColumns),
      filtre,
      signaturesPortee: filtre ? liste.map(l => signature(l, this.visibleColumns)) : null,
    };
    const id = identification(item, liste, this.visibleColumns, (cle, valeur) => this.valeurAffichee(cle, valeur));
    this.navFiche.publier(contexte, { position: index + 1, total: liste.length, filtre, code: id.code, detail: id.detail });
  }

  /** Mode serveur : la position est celle de la ligne dans la liste du serveur (page affichée + rang dans la page). */
  private publierNavigationServeur(item: any): void {
    const rang = this.affichees.indexOf(item);
    if (rang < 0) {
      this.navFiche.effacer();
      return;
    }
    const filtre = this.hasQuery();
    const index = this.pageCourante * this.taillePage + rang;
    const contexte: ContexteNavigation = {
      cles: clesDeNavigation(this.visibleColumns),
      signature: signature(item, this.visibleColumns),
      filtre,
      signaturesPortee: null,
      serveur: { filtres: this.filtresServeur(), index, total: this.totalServeur },
    };
    const id = identification(item, this.affichees, this.visibleColumns, (cle, valeur) => this.valeurAffichee(cle, valeur));
    this.navFiche.publier(contexte, { position: index + 1, total: this.totalServeur, filtre, code: id.code, detail: id.detail });
  }

  /**
   * Mode serveur : fiche voisine demandée au serveur (page d'une ligne à la position voulue, mêmes filtres que lors du
   * choix). Le nombre de fiches est relu à chaque déplacement : une fiche ajoutée ou supprimée entre-temps est prise
   * en compte.
   */
  private naviguerServeur(demande: DemandeNavigation, serveur: NonNullable<ContexteNavigation['serveur']>): void {
    const cible = positionCible(serveur.index, serveur.total, demande.sens);
    if (cible < 0 || cible === serveur.index || !this.source) {
      // déjà à la première ou à la dernière fiche : on ne recharge pas la fiche affichée
      this.saveService.setIsSearch(false);
      return;
    }
    this.source.page(serveur.filtres, cible, 1).pipe(catchError(() => of<PageLov | null>(null))).subscribe(resultat => {
      const item = resultat?.content?.[0];
      if (!resultat || !item) {
        // la liste a changé (fiches supprimées) : la navigation s'arrête
        this.navFiche.effacer();
      } else {
        this.selectedCode = item[this.codeField] || '';
        this.selectedLabel = item[this.labelField] || '';
        this.selectedValue.emit(item);
        const contexte: ContexteNavigation = {
          ...demande.contexte,
          signature: signature(item, this.visibleColumns),
          serveur: { filtres: serveur.filtres, index: cible, total: resultat.total },
        };
        const id = identification(item, [item], this.visibleColumns, (cle, valeur) => this.valeurAffichee(cle, valeur));
        this.navFiche.publier(contexte, {
          position: cible + 1,
          total: resultat.total,
          filtre: demande.contexte.filtre,
          code: id.code,
          detail: id.detail,
        });
      }
      this.saveService.setIsSearch(false);
    });
  }

  /** Valeur d'une colonne telle que l'utilisateur la lit (les dates en jj/mm/aaaa). */
  private valeurAffichee(cle: string, valeur: unknown): string {
    return /^dat/i.test(cle) ? this.formatDateValue(valeur) : String(valeur ?? '');
  }

  /**
   * Va à la première, précédente, suivante ou dernière fiche : même sélection qu'un clic sur une ligne, sans fenêtre.
   * Fait en différé : cette fenêtre vient d'être créée au milieu d'un cycle de détection de changements, et l'écran
   * ne doit pas être modifié à cet instant.
   */
  private appliquerNavigation(demande: DemandeNavigation): void {
    setTimeout(() => {
      const serveur = demande.contexte.serveur;
      if (serveur) {
        this.naviguerServeur(demande, serveur);
        return;
      }
      const resultat = cibleNavigation(this.listData, this.visibleColumns, demande.contexte, demande.sens);
      if (resultat && resultat.index === resultat.courant) {
        // déjà à la première ou à la dernière fiche : on ne recharge pas la fiche affichée (une saisie en cours serait perdue)
      } else if (resultat) {
        const item: any = resultat.item;
        this.selectedCode = item[this.codeField] || '';
        this.selectedLabel = item[this.labelField] || '';
        this.selectedValue.emit(item);
        const contexte: ContexteNavigation = { ...demande.contexte, signature: signature(item, this.visibleColumns) };
        const id = identification(item, resultat.liste, this.visibleColumns, (cle, valeur) => this.valeurAffichee(cle, valeur));
        this.navFiche.publier(contexte, {
          position: resultat.index + 1,
          total: resultat.liste.length,
          filtre: demande.contexte.filtre,
          code: id.code,
          detail: id.detail,
        });
      } else {
        // la fiche affichée n'est plus dans la liste (supprimée, ou sortie du filtre) : la navigation s'arrête
        this.navFiche.effacer();
      }
      this.saveService.setIsSearch(false);
    });
  }

  // Open modal and load data
  openModal(content: any) {
    // Clear search queries and show all data when modal opens
    this.searchQueries = {};
    this.rechercheGlobale = '';
    this.filtresOuverts = false;
    this.sexeFiltre = '';
    if (this.modeServeur) {
      this.ouvrirServeur();
    } else {
      if (this.filtreSexe) this.compterSexes();
      this.filteredData = [...this.listData]; // Show all data immediately
    }
    this.modalService.open(content, { size: 'xl' }).result?.finally(() => this.arreterAttente()).catch(() => undefined);
    this.surveillerAttente();
  }

  // Track by function for performance
  trackByFn(index: number, item: any): any {
    return item[this.codeField] || index;
  }

  // Load data (assume listData is already populated)
  loadData() {
    console.log('=== SEARCH-LOV loadData ===');
    console.log('listData length:', this.listData?.length);
    console.log('columns:', this.columns);

    if (this.listData && this.listData.length > 0) {
      console.log('First item:', this.listData[0]);
      console.log('mat_int:', this.listData[0].mat_int);
      console.log('dat_nais:', this.listData[0].dat_nais);
    }

    this.filteredData = [...this.listData]; // Copy initial data to filteredData
  }

  // Handle changes to the selected code
  onCodeChange() {
    const foundItem = this.listData.find(
      (item) => item[this.codeField] === this.selectedCode
    );
    if (foundItem) {
      this.selectedLabel = foundItem[this.labelField];
    } else {
      this.selectedLabel = '';
    }
  }

  // Format date value from Oracle timestamp string to dd/MM/yyyy
  formatDateValue(value: any): string {
    if (!value) {
      return '';
    }

    // Check cache first
    if (this.dateFormatCache.has(value)) {
      return this.dateFormatCache.get(value)!;
    }

    let formatted: string;

    // If it's already a Date object
    if (value instanceof Date) {
      const day = String(value.getDate()).padStart(2, '0');
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const year = value.getFullYear();
      formatted = `${day}/${month}/${year}`;
    }
    // If it's a string (Oracle timestamp format: "1968-08-04 00:00:00.0")
    else if (typeof value === 'string') {
      // Extract date part before the space
      const datePart = value.split(' ')[0];

      if (datePart && datePart.includes('-')) {
        const parts = datePart.split('-');
        if (parts.length === 3) {
          const year = parts[0];
          const month = parts[1];
          const day = parts[2];
          formatted = `${day}/${month}/${year}`;
        } else {
          formatted = value;
        }
      } else {
        formatted = value;
      }
    } else {
      formatted = value;
    }

    // Cache the result
    this.dateFormatCache.set(value, formatted);
    return formatted;
  }
}
