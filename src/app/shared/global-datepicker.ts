import flatpickr from 'flatpickr';
import { French } from 'flatpickr/dist/l10n/fr';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect';

French.months.longhand = French.months.longhand.map(m => m.charAt(0).toUpperCase() + m.slice(1)) as any;
French.months.shorthand = French.months.shorthand.map(m => m.charAt(0).toUpperCase() + m.slice(1)) as any;

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

function setupYearSelect(fp: flatpickr.Instance): void {
  const container = fp.calendarContainer?.querySelector('.flatpickr-current-month');
  if (!container) return;

  const existingSelect = container.querySelector('select.flatpickr-year-select') as HTMLSelectElement;
  if (existingSelect) {
    if (existingSelect.value !== fp.currentYear.toString()) {
      existingSelect.value = fp.currentYear.toString();
    }
    return;
  }

  const numWrapper = container.querySelector('.numInputWrapper');
  if (!numWrapper) return;

  const sel = document.createElement('select');
  sel.className = 'flatpickr-monthDropdown-months flatpickr-year-select';
  sel.setAttribute('aria-label', 'Année');
  sel.setAttribute('tabindex', '-1');

  const curYear = new Date().getFullYear();
  const maxYear = Math.max(curYear, fp.currentYear || curYear);
  const minYear = Math.min(1940, fp.currentYear || 1940);
  for (let y = maxYear; y >= minYear; y--) {
    const opt = document.createElement('option');
    opt.className = 'flatpickr-monthDropdown-month';
    opt.value = y.toString();
    opt.textContent = y.toString();
    opt.style.color = '#212529';
    opt.style.backgroundColor = '#ffffff';
    sel.appendChild(opt);
  }

  sel.value = fp.currentYear.toString();

  const menu = document.createElement('div');
  menu.className = 'flatpickr-year-menu';
  menu.style.cssText =
    'display:none;position:absolute;box-sizing:border-box;max-height:298px;width:92px;padding:4px 0;overflow-y:auto;overflow-x:hidden;background:#fff;color:#212529;border:1px solid rgba(0,0,0,0.2);border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:99999;font-family:inherit;font-size:13.5px;';

  for (let y = maxYear; y >= minYear; y--) {
    const item = document.createElement('div');
    item.textContent = y.toString();
    item.style.cssText =
      'height:24px;line-height:24px;padding:0 12px;cursor:pointer;box-sizing:border-box;font-family:inherit;text-align:left;';
    item.onmouseenter = () => {
      item.style.backgroundColor = '#0078d7';
      item.style.color = '#ffffff';
    };
    item.onmouseleave = () => {
      if (y === fp.currentYear) {
        item.style.backgroundColor = '#e5f1fb';
        item.style.color = '#000000';
      } else {
        item.style.backgroundColor = 'transparent';
        item.style.color = '#212529';
      }
    };
    item.onclick = (e) => {
      e.stopPropagation();
      fp.changeYear(y);
      sel.value = y.toString();
      menu.style.display = 'none';
    };
    menu.appendChild(item);
  }

  const toggleMenu = () => {
    if (menu.style.display === 'block') {
      menu.style.display = 'none';
    } else {
      const rect = sel.getBoundingClientRect();
      const containerRect = fp.calendarContainer.getBoundingClientRect();
      menu.style.top = rect.bottom - containerRect.top + 2 + 'px';
      const left = rect.left - containerRect.left;
      const maxLeft = containerRect.width - 94;
      menu.style.left = Math.min(left, maxLeft) + 'px';
      menu.style.display = 'block';
      menu.querySelectorAll('div').forEach((d) => {
        d.style.backgroundColor = 'transparent';
        d.style.color = '#212529';
      });
      const active = Array.from(menu.children).find((c) => c.textContent === fp.currentYear.toString()) as HTMLElement;
      if (active) {
        active.style.backgroundColor = '#e5f1fb';
        active.style.color = '#000000';
        menu.scrollTop = active.offsetTop - 132;
      }
    }
  };

  sel.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });
  sel.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  sel.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      toggleMenu();
    }
  });

  fp.calendarContainer.appendChild(menu);
  document.addEventListener('click', () => {
    menu.style.display = 'none';
  });

  numWrapper.replaceWith(sel);
  fp.currentYearElement = sel as any;
  fp.yearElements[0] = sel as any;
}

export function initGlobalDatePicker(): void {
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
        onReady: (_d, _s, inst) => setupYearSelect(inst),
        onYearChange: (_selected, _str, inst) => {
          const yearSel = inst.calendarContainer?.querySelector('select.flatpickr-year-select') as HTMLSelectElement;
          if (yearSel) yearSel.value = inst.currentYear.toString();
        },
        onMonthChange: (_selected, _str, inst) => {
          const yearSel = inst.calendarContainer?.querySelector('select.flatpickr-year-select') as HTMLSelectElement;
          if (yearSel) yearSel.value = inst.currentYear.toString();
        },
        onOpen: (_selected, _str, inst) => {
          if (isDateDisabled(el)) {
            inst.close();
            return;
          }
          setupYearSelect(inst);
          const yearSel = inst.calendarContainer?.querySelector('select.flatpickr-year-select') as HTMLSelectElement;
          if (yearSel) yearSel.value = inst.currentYear.toString();
          inst.set('maxDate', new Date());
          const d = parseInputValue(inst, el.value, format);
          if (d) inst.setDate(d, false);
        },
        onClose: (_selected, _str, inst) => {
          const menu = inst.calendarContainer?.querySelector('.flatpickr-year-menu') as HTMLElement;
          if (menu) menu.style.display = 'none';
        },
      }) as flatpickr.Instance;
      fp.open();
    },
    true
  );
}
