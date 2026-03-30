import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appMontantMask]'
})
export class MontantMaskDirective {
  private regex = /^[0-9]*\.?[0-9]*$/; // Accepte uniquement les nombres et un seul point
  
  constructor(private el: ElementRef) {}

  @HostListener('blur', ['$event.target.value'])
  onBlur(value: string): void {
    // Remplace les virgules par des points et tente une conversion en float
    const numericValue = parseFloat(value.replace(/,/g, ''));
    
    if (!isNaN(numericValue)) {
      // Applique le format avec trois décimales sans ajouter des zéros inutiles
      this.el.nativeElement.value = numericValue.toFixed(3);
    } else {
      this.el.nativeElement.value = ''; // Réinitialise en cas de valeur invalide
    }
  }

  @HostListener('focus', ['$event.target.value'])
  onFocus(value: string): void {
    // Ne modifie pas la valeur pour éviter d'ajouter des zéros inutiles
    this.el.nativeElement.value = value;
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;
    
    // Vérifie que l'entrée est un nombre valide
    if (!this.regex.test(rawValue)) {
      input.value = rawValue.replace(/[^0-9.]/g, ''); // Supprime les caractères invalides
    }
  }
}
