import { Component, ElementRef, forwardRef, HostListener, Input, OnDestroy, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { iconeMenu } from '../../../layouts/sidebar/menu-icons';
import { ICONES_MENU, IconeMenuChoix } from '../gestion-menu/icones-menu';

function normaliser(texte: string): string {
  return (texte || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * Sélecteur d'icône (Remix Icon) utilisable avec formControlName. La valeur est le nom de classe (ex. « ri-team-line »),
 * ou une chaîne vide = « Automatique » (le menu choisit alors l'icône d'après le libellé).
 */
@Component({
  selector: 'app-icon-picker',
  templateUrl: './icon-picker.component.html',
  styleUrl: './icon-picker.component.scss',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => IconPickerComponent), multi: true }]
})
export class IconPickerComponent implements ControlValueAccessor, OnDestroy {

  /** Libellé de l'entrée de menu et son niveau (0 = module, 1 = groupe) : servent à montrer l'icône « Automatique ». */
  @Input() intitule = '';
  @Input() niveau: 0 | 1 = 0;

  readonly icones: IconeMenuChoix[] = ICONES_MENU;
  valeur = '';
  desactive = false;
  ouvert = false;
  recherche = '';
  haut = 0;
  gauche = 0;

  @ViewChild('declencheur') declencheur?: ElementRef<HTMLButtonElement>;
  @ViewChild('champRecherche') champRecherche?: ElementRef<HTMLInputElement>;

  private onChange: (v: string) => void = () => { };
  private onTouched: () => void = () => { };
  /** Le défilement de la page ou du tableau ferme le panneau (position fixe) ; celui de la grille d'icônes, non. */
  private readonly surDefilement = (event: Event) => {
    if (!this.hote.nativeElement.contains(event.target as Node)) this.fermer();
  };

  constructor(private hote: ElementRef<HTMLElement>) { }

  /** Icônes correspondant à la recherche (libellé, mots-clés ou nom de classe, sans accents ni casse). */
  get filtrees(): IconeMenuChoix[] {
    const q = normaliser(this.recherche).trim();
    if (!q) return this.icones;
    return this.icones.filter(i => normaliser(`${i.libelle} ${i.mots || ''} ${i.classe}`).includes(q));
  }

  /** Icône que le menu utilisera si aucune n'est choisie (déduite du libellé, comme dans le menu latéral). */
  get iconeAuto(): string {
    return iconeMenu('', this.intitule, this.niveau);
  }

  /** Nom courant de l'icône automatique (vide si elle n'est pas dans la liste). */
  get libelleAuto(): string {
    return this.icones.find(i => i.classe === this.iconeAuto)?.libelle || '';
  }

  /** Libellé affiché à côté de l'icône choisie. */
  get libelle(): string {
    if (!this.valeur) return 'Automatique';
    return this.icones.find(i => i.classe === this.valeur)?.libelle || this.valeur;
  }

  writeValue(valeur: string | null): void {
    this.valeur = valeur || '';
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(desactive: boolean): void {
    this.desactive = desactive;
    if (desactive) this.fermer();
  }

  basculer(event: Event): void {
    event.stopPropagation(); // ne pas sélectionner la ligne du tableau
    if (this.desactive) return;
    if (this.ouvert) {
      this.fermer();
      return;
    }
    const rect = this.declencheur?.nativeElement.getBoundingClientRect();
    if (rect) {
      const largeur = 320;
      const hauteur = 340;
      const place = window.innerHeight - rect.bottom;
      this.haut = place < hauteur && rect.top > place ? Math.max(8, rect.top - hauteur - 4) : rect.bottom + 4;
      this.gauche = Math.max(8, Math.min(rect.left, window.innerWidth - largeur - 8));
    }
    this.recherche = '';
    this.ouvert = true;
    // le panneau est en position fixe : on le ferme si la page ou le tableau défile
    document.addEventListener('scroll', this.surDefilement, true);
    setTimeout(() => this.champRecherche?.nativeElement.focus());
  }

  choisir(classe: string): void {
    this.valeur = classe;
    this.onChange(classe);
    this.onTouched();
    this.fermer(true);
  }

  fermer(redonnerLeFocus = false): void {
    if (!this.ouvert) return;
    this.ouvert = false;
    document.removeEventListener('scroll', this.surDefilement, true);
    if (redonnerLeFocus) this.declencheur?.nativeElement.focus();
  }

  @HostListener('document:click', ['$event'])
  clicExterieur(event: Event): void {
    if (this.ouvert && !this.hote.nativeElement.contains(event.target as Node)) this.fermer();
  }

  @HostListener('document:keydown.escape')
  echap(): void {
    this.fermer(true);
  }

  @HostListener('window:resize')
  redimension(): void {
    this.fermer();
  }

  ngOnDestroy(): void {
    document.removeEventListener('scroll', this.surDefilement, true);
  }
}
