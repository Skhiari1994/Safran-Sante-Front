import { Directive, ElementRef, HostListener, Renderer2, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
@Directive({
  selector: '[appDateFormatter]'
})
export class DateFormatterDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  // Listener for when the user focuses out of the input
  @HostListener('blur') onBlur() {
    const inputValue = this.el.nativeElement.value;
    if (inputValue) {
      const formattedDate = this.formatDate(inputValue);
      if (formattedDate) {
        this.renderer.setProperty(this.el.nativeElement, 'value', formattedDate);
      }
    }
  }

  // Helper function to format yyyy-MM-dd to dd/MM/yyyy
  private formatDate(value: string): string | null {
    const dateParts = value.split('-');
    if (dateParts.length === 3) {
      return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
    }
    return null;
  }
}