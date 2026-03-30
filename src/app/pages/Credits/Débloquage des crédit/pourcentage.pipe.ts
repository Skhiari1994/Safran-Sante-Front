import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pourcentage',
  standalone: true
})
export class PourcentagePipe implements PipeTransform {

  transform(value: number | string, decimals: number = 2): string {
    if (value == null || value === '') {
      return '';
    }
    const parsedValue = typeof value === 'number' ? value : parseFloat(value);
    return `${(parsedValue * 100).toFixed(decimals)}%`; // Conversion en pourcentage
  }
}
