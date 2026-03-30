import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appFormatMonthYear]'
})
export class FormatMonthYearDirective {

  constructor(private ngControl: NgControl) {}

  @HostListener('input', ['$event.target.value'])
  onInput(value: string): void {
    // Supprimer tous les caractères non numériques
    const numericValue = value.replace(/\D/g, '');

    // Ajouter le séparateur "/" après 2 chiffres
    if (numericValue.length <= 2) {
      this.ngControl.control?.setValue(numericValue);
    } else {
      const formattedValue =
        numericValue.substring(0, 2) + '/' + numericValue.substring(2, 6);
      this.ngControl.control?.setValue(formattedValue);
    }
  }

}
