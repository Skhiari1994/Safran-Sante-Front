import flatpickr from 'flatpickr';
import { French } from 'flatpickr/dist/l10n/fr';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect';

/**
 * Calendrier global : tout champ texte de date de l'application (jj/mm/aaaa) ouvre un calendrier
 * au clic. La saisie manuelle reste possible. Les champs « mois/année » (00/0000) ouvrent un
 * sélecteur de mois.
 *
 * Détection par le DOM : aucun import à faire dans les modules, ni de changement dans les pages.
 */
const DAY_SELECTOR =
  'input[mask="00/00/0000"], input[appdateformatter], input[placeholder*="jj/mm" i], input[placeholder*="dd/mm" i]';
const MONTH_SELECTOR = 'input[mask="00/0000"]';

function parseInputValue(fp: flatpickr.Instance, value: string, format: string): Date | undefined {
  if (!value) return undefined;
  let d = fp.parseDate(value, format);
  if (!d && /^\d{4}-\d{2}-\d{2}/.test(value)) d = fp.parseDate(value.substring(0, 10), 'Y-m-d');
  return d || undefined;
}

function isDateInput(el: any): el is HTMLInputElement {
  return el instanceof HTMLInputElement && (el.matches(MONTH_SELECTOR) || el.matches(DAY_SELECTOR));
}

function isDateDisabled(el: HTMLInputElement): boolean {
  if (el.readOnly || el.disabled) return true;
  const fcn = (el.getAttribute('formcontrolname') || '').toLowerCase();
  if (fcn === 'dat_pec' || fcn === 'dat_pec_mut') {
    const pecField = fcn === 'dat_pec' ? 'pec' : 'pec_mut';
    const container = el.closest('form, div[formgroup], div[formgroupname], .card, .row');
    const select = container?.querySelector(`select[formcontrolname="${pecField}"]`) as HTMLSelectElement;
    if (select && select.value !== 'O') return true;
  }
  return false;
}

export function initGlobalDatePicker(): void {
  // Le calendrier peut émettre un « change » alors que le champ n'a pas changé (ex. champ vide qui perd le focus) :
  // on le bloque pour ne pas déclencher les contrôles des pages (messages d'erreur sur une date vide).
  document.addEventListener(
    'focusin',
    (ev: Event) => {
      if (isDateInput(ev.target)) (ev.target as HTMLInputElement).dataset['fpPrev'] = (ev.target as HTMLInputElement).value;
    },
    true
  );
  document.addEventListener(
    'change',
    (ev: Event) => {
      const el = ev.target;
      if (!isDateInput(el)) return;
      if (el.dataset['fpPrev'] !== undefined && el.dataset['fpPrev'] === el.value) {
        ev.stopImmediatePropagation();
        return;
      }
      el.dataset['fpPrev'] = el.value;
    },
    true
  );

  document.addEventListener(
    'focusin',
    (ev: Event) => {
      const el = ev.target as HTMLInputElement;
      if (!(el instanceof HTMLInputElement) || (el.type !== 'text' && el.type !== '')) return;
      const isMonth = el.matches(MONTH_SELECTOR);
      if (!isMonth && !el.matches(DAY_SELECTOR)) return;
      if (isDateDisabled(el) || (el as any)._flatpickr) return;

      const format = isMonth ? 'm/Y' : 'd/m/Y';
      const fp = flatpickr(el, {
        locale: French,
        dateFormat: format,
        allowInput: true,
        disableMobile: true,
        maxDate: new Date(),
        plugins: isMonth ? [monthSelectPlugin({ shorthand: true, dateFormat: 'm/Y', altFormat: 'm/Y' })] : [],
        onOpen: (_selected, _str, inst) => {
          if (isDateDisabled(el)) {
            inst.close();
            return;
          }
          inst.set('maxDate', new Date());
          // la valeur du champ a pu être modifiée par le code (chargement) : on resynchronise le calendrier
          const d = parseInputValue(inst, el.value, format);
          if (d) inst.setDate(d, false);
        },
      }) as flatpickr.Instance;
      fp.open();
    },
    true
  );
}
