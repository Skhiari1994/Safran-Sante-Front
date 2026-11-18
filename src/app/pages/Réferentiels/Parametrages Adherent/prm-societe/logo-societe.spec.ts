import {
  COTE_MAX_LOGO, dimensionsCible, erreurLogo, preparerLogo, tailleLisible, TAILLE_MAX_LOGO, TAILLE_MAX_SOURCE_LOGO
} from './logo-societe';

describe('erreurLogo (fichier choisi)', () => {
  it('accepte PNG, JPEG et WebP, y compris plus lourds que le logo final', () => {
    expect(erreurLogo({ type: 'image/png', size: 20_000 })).toBeNull();
    expect(erreurLogo({ type: 'image/jpeg', size: 12 * 1024 * 1024 })).toBeNull();
    expect(erreurLogo({ type: 'image/webp', size: TAILLE_MAX_SOURCE_LOGO })).toBeNull();
  });

  it('refuse les autres formats, dont le SVG et le GIF', () => {
    for (const type of ['image/svg+xml', 'image/gif', '', 'application/pdf']) {
      expect(erreurLogo({ type, size: 1000 })).toContain('Format non pris en charge');
    }
  });

  it('refuse un fichier vide ou de plus de 20 Mo', () => {
    expect(erreurLogo({ type: 'image/png', size: TAILLE_MAX_SOURCE_LOGO + 1 })).toContain('20 Mo');
    expect(erreurLogo({ type: 'image/png', size: 0 })).toContain('vide');
  });
});

describe('dimensionsCible', () => {
  it('réduit en gardant les proportions', () => {
    expect(dimensionsCible(2400, 1200)).toEqual({ largeur: 600, hauteur: 300 });
    expect(dimensionsCible(1000, 4000)).toEqual({ largeur: 150, hauteur: 600 });
  });

  it('n\'agrandit jamais une petite image', () => {
    expect(dimensionsCible(300, 120)).toEqual({ largeur: 300, hauteur: 120 });
    expect(dimensionsCible(COTE_MAX_LOGO, 10)).toEqual({ largeur: COTE_MAX_LOGO, hauteur: 10 });
  });

  it('garde au moins 1 pixel', () => {
    expect(dimensionsCible(100000, 10).hauteur).toBe(1);
  });
});

describe('preparerLogo', () => {
  async function creerImage(largeur: number, hauteur: number, type: string): Promise<File> {
    const toile = document.createElement('canvas');
    toile.width = largeur;
    toile.height = hauteur;
    const ctx = toile.getContext('2d')!;
    // dégradé : une image unie se compresse trop bien pour tester une réduction
    const degrade = ctx.createLinearGradient(0, 0, largeur, hauteur);
    degrade.addColorStop(0, '#0a3c8c');
    degrade.addColorStop(1, '#f5a000');
    ctx.fillStyle = degrade;
    ctx.fillRect(0, 0, largeur, hauteur);
    const blob: Blob = await new Promise((resolve) => toile.toBlob((b) => resolve(b!), type, 0.95));
    return new File([blob], 'mon logo.' + (type === 'image/jpeg' ? 'jpg' : 'png'), { type });
  }

  it('envoie telle quelle une petite image', async () => {
    const source = await creerImage(300, 100, 'image/png');
    const resultat = await preparerLogo(source);
    expect(resultat.reduit).toBeFalse();
    expect(resultat.fichier).toBe(source);
  });

  it('réduit une grande image PNG à 600 px en gardant le format', async () => {
    const source = await creerImage(2400, 1200, 'image/png');
    const resultat = await preparerLogo(source);
    expect(resultat.reduit).toBeTrue();
    expect(resultat.largeur).toBe(600);
    expect(resultat.hauteur).toBe(300);
    expect(resultat.fichier.type).toBe('image/png');
    expect(resultat.fichier.name).toBe('mon logo.png');
    const verif = await createImageBitmap(resultat.fichier);
    expect(verif.width).toBe(600);
    expect(verif.height).toBe(300);
    expect(resultat.fichier.size).toBeLessThanOrEqual(TAILLE_MAX_LOGO);
  });

  it('un JPEG réduit reste un JPEG', async () => {
    const source = await creerImage(1800, 900, 'image/jpeg');
    const resultat = await preparerLogo(source);
    expect(resultat.reduit).toBeTrue();
    expect(resultat.fichier.type).toBe('image/jpeg');
    expect(resultat.fichier.name).toBe('mon logo.jpg');
    expect(resultat.fichier.size).toBeLessThan(source.size);
  });

  it('refuse un fichier qui n\'est pas une image lisible', async () => {
    const faux = new File([new Uint8Array([1, 2, 3, 4])], 'faux.png', { type: 'image/png' });
    await expectAsync(preparerLogo(faux)).toBeRejectedWithError(/illisible/);
  });
});

describe('tailleLisible', () => {
  it('affiche des Ko ou des Mo', () => {
    expect(tailleLisible(85 * 1024)).toBe('85 Ko');
    expect(tailleLisible(1.5 * 1024 * 1024)).toBe('1,5 Mo');
    expect(tailleLisible(10)).toBe('1 Ko');
  });
});
