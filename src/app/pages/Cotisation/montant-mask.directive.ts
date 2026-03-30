import { Directive, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[appMontantMask]'
})
export class MontantMaskDirective implements AfterViewInit {
    private regex = /^[0-9]*\.?[0-9]*$/; // Accepte uniquement les nombres et un seul point

    constructor(private el: ElementRef, private control: NgControl) { }

    ngAfterViewInit() {
        // Formatage initial après que la vue soit initialisée
        setTimeout(() => this.formatValue(), 0);

        // S'abonner aux changements de valeur du formulaire si disponible
        if (this.control && this.control.valueChanges) {
            this.control.valueChanges.subscribe(() => {
                this.formatValue();
            });
        }
    }

    private formatValue() {
        const value = this.el.nativeElement.value;
        if (value) {
            const numericValue = parseFloat(value.toString().replace(/,/g, ''));
            if (!isNaN(numericValue)) {

                // Vérifier si la valeur est déjà formatée pour éviter les boucles infinies
                // on ne formate que si ce n'est pas déjà bon (e.g. "17" -> "17.000")
                // Mais attention si l'utilisateur est en train de taper "17."
                // Cependant, ici on le fait programmatiquement via valueChanges (qui vient du modèle souvent)
                // Pour éviter de gêner la frappe, on peut vérifier le focus ?
                // Si l'élément a le focus, on évite peut-être de forcer le formatage DECIMAL complet, 
                // mais l'utilisateur a demandé d'afficher X.xxx.

                // Pour l'affichage initial c'est critique.

                const formatted = numericValue.toFixed(3);
                if (this.el.nativeElement.value !== formatted && document.activeElement !== this.el.nativeElement) {
                    this.el.nativeElement.value = formatted;
                } else if (this.el.nativeElement.value !== formatted && document.activeElement === this.el.nativeElement) {
                    // Si on a le focus, on ne touche pas, l'événement blur s'en chargera
                }
            }
        }
    }

    @HostListener('blur', ['$event.target.value'])
    onBlur(value: string): void {
        const numericValue = parseFloat(value.replace(/,/g, ''));
        if (!isNaN(numericValue)) {
            this.el.nativeElement.value = numericValue.toFixed(3);
            // On peut aussi mettre à jour le control si nécessaire, mais ngModel le fait déjà
        } else {
            this.el.nativeElement.value = '';
        }
    }

    @HostListener('focus', ['$event.target.value'])
    onFocus(value: string): void {
        // this.el.nativeElement.value = value;
    }

    @HostListener('input', ['$event'])
    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        const rawValue = input.value;
        if (!this.regex.test(rawValue)) {
            input.value = rawValue.replace(/[^0-9.]/g, '');
        }
    }
}
