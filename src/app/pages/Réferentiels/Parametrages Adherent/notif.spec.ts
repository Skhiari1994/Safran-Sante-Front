import { echapperHtml } from './notif';

describe('echapperHtml', () => {
  it('neutralise le HTML venant de la base', () => {
    expect(echapperHtml('<img src=x onerror="alert(1)">')).toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
    expect(echapperHtml("L'été & l'hiver")).toBe('L&#39;été &amp; l&#39;hiver');
  });

  it('accepte les valeurs absentes ou non textuelles', () => {
    expect(echapperHtml(null)).toBe('');
    expect(echapperHtml(undefined)).toBe('');
    expect(echapperHtml(3200)).toBe('3200');
  });
});
