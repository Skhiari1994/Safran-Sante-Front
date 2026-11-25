import { NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  cibleNavigation, clesDeNavigation, ContexteNavigation, identification, instantDe, ordonner, positionCible, signature
} from './navigation-liste';
import { NavigationFicheService } from './Service/navigation-fiche.service';
import { SaveService } from './Service/save.service';

describe('navigation entre les fiches : fonctions', () => {

  const lignes = ['1', '10', '1000', '10000', '1001', '1002', '1005', '2', '999'].map(m => ({ mat_pers: m }));
  const colonnes = [{ key: 'mat_pers' }];

  it('ordonne les matricules dans l\'ordre numérique, pas dans l\'ordre du texte', () => {
    const codes = ordonner(lignes, ['mat_pers']).map(l => l.mat_pers);
    expect(codes).toEqual(['1', '2', '10', '999', '1000', '1001', '1002', '1005', '10000']);
  });

  it('ordonne aussi les codes qui mêlent lettres et chiffres', () => {
    const codes = ordonner(['H30001', 'H30005', 'H3001', '30050'].map(c => ({ k: c })), ['k']).map(l => l.k);
    expect(codes).toEqual(['30050', 'H3001', 'H30001', 'H30005']);
  });

  it('ne modifie pas la liste d\'origine et garde l\'ordre reçu sans colonne', () => {
    const copie = ordonner(lignes, []);
    expect(copie.map(l => l.mat_pers)).toEqual(lignes.map(l => l.mat_pers));
    expect(copie).not.toBe(lignes);
    expect(ordonner(lignes, null).length).toBe(lignes.length);
    ordonner(lignes, ['mat_pers']);
    expect(lignes[0].mat_pers).toBe('1');
    expect(lignes[2].mat_pers).toBe('1000');
  });

  it('retient toutes les colonnes visibles dans l\'ordre d\'affichage', () => {
    expect(clesDeNavigation([{ key: 'cod_bord' }, { key: 'mat_pers' }, { key: 'num_fam' }, { key: 'dat_soin' }]))
      .toEqual(['cod_bord', 'mat_pers', 'num_fam', 'dat_soin']);
    expect(clesDeNavigation([])).toEqual([]);
    expect(clesDeNavigation(undefined)).toEqual([]);
  });

  it('départage les égalités avec les colonnes suivantes : bordereau, matricule, famille, date', () => {
    const cols = ['cod_bord', 'mat_pers', 'num_fam', 'dat_soin'];
    const bulletins = [
      { cod_bord: '202622', mat_pers: '1002', num_fam: '0', dat_soin: '2021-03-05 00:00:00.0' },
      { cod_bord: '202622', mat_pers: '999', num_fam: '1', dat_soin: '2021-01-10 00:00:00.0' },
      { cod_bord: '202621', mat_pers: '5000', num_fam: '0', dat_soin: '2021-02-01 00:00:00.0' },
      { cod_bord: '202622', mat_pers: '999', num_fam: '0', dat_soin: '2021-12-01 00:00:00.0' },
      { cod_bord: '202622', mat_pers: '999', num_fam: '0', dat_soin: '2021-02-15 00:00:00.0' },
    ];
    const ordre = ordonner(bulletins, cols).map(b => `${b.cod_bord}/${b.mat_pers}/${b.num_fam}/${b.dat_soin.slice(0, 10)}`);
    expect(ordre).toEqual([
      '202621/5000/0/2021-02-01',
      '202622/999/0/2021-02-15',
      '202622/999/0/2021-12-01',
      '202622/999/1/2021-01-10',
      '202622/1002/0/2021-03-05',
    ]);
  });

  it('compare les dates comme des dates, quel que soit leur format', () => {
    expect(instantDe('2021-11-09 00:00:00.0')).toBe(Date.UTC(2021, 10, 9));
    expect(instantDe('2021-11-09T10:30:00')).toBe(Date.UTC(2021, 10, 9));
    expect(instantDe('09/11/2021')).toBe(Date.UTC(2021, 10, 9));
    expect(instantDe(new Date(Date.UTC(2021, 10, 9)))).toBe(Date.UTC(2021, 10, 9));
    expect(instantDe('')).toBe(Number.NEGATIVE_INFINITY);
    expect(instantDe(null)).toBe(Number.NEGATIVE_INFINITY);
    const dates = ['10/01/2022', '09/11/2021', '25/02/2021', ''].map(d => ({ dat_soin: d }));
    expect(ordonner(dates, ['dat_soin']).map(d => d.dat_soin)).toEqual(['', '25/02/2021', '09/11/2021', '10/01/2022']);
  });

  it('calcule la position visée sans jamais sortir de la liste', () => {
    expect(positionCible(3, 10, 'premier')).toBe(0);
    expect(positionCible(3, 10, 'dernier')).toBe(9);
    expect(positionCible(3, 10, 'precedent')).toBe(2);
    expect(positionCible(3, 10, 'suivant')).toBe(4);
    expect(positionCible(0, 10, 'precedent')).toBe(0);
    expect(positionCible(9, 10, 'suivant')).toBe(9);
    expect(positionCible(0, 0, 'suivant')).toBe(-1);
    expect(positionCible(0, 1, 'dernier')).toBe(0);
  });

  it('distingue deux lignes du même matricule par leurs autres colonnes', () => {
    const cols = [{ key: 'mat' }, { key: 'bul' }];
    expect(signature({ mat: '1001', bul: 'A' }, cols)).not.toBe(signature({ mat: '1001', bul: 'B' }, cols));
    expect(signature({ mat: 1001, bul: 'A' }, cols)).toBe(signature({ mat: '1001', bul: 'A' }, cols));
  });

  function contexteDe(ligne: any, cols: any[], cles: string[], portee: any[] | null = null): ContexteNavigation {
    return {
      cles, signature: signature(ligne, cols), filtre: !!portee,
      signaturesPortee: portee ? portee.map(l => signature(l, cols)) : null,
    };
  }

  it('parcourt les matricules : après 1000 vient 1001', () => {
    const ctx = contexteDe({ mat_pers: '1000' }, colonnes, ['mat_pers']);
    expect(cibleNavigation(lignes, colonnes, ctx, 'suivant')!.item.mat_pers).toBe('1001');
    expect(cibleNavigation(lignes, colonnes, ctx, 'precedent')!.item.mat_pers).toBe('999');
    expect(cibleNavigation(lignes, colonnes, ctx, 'premier')!.item.mat_pers).toBe('1');
    expect(cibleNavigation(lignes, colonnes, ctx, 'dernier')!.item.mat_pers).toBe('10000');
  });

  it('ne reste pas bloqué quand plusieurs bulletins ont le même matricule', () => {
    const cols = [{ key: 'mat' }, { key: 'bul' }];
    const liste = [{ mat: '1002', bul: 'C' }, { mat: '1001', bul: 'A' }, { mat: '1001', bul: 'B' }];
    let ctx = contexteDe(liste[2], cols, ['mat', 'bul']);               // 1001 / B
    expect(cibleNavigation(liste, cols, ctx, 'suivant')!.item.bul).toBe('C');
    const precedent = cibleNavigation(liste, cols, ctx, 'precedent')!;
    expect(precedent.item.bul).toBe('A');                              // pas B de nouveau
    ctx = contexteDe(precedent.item, cols, ['mat', 'bul']);
    expect(cibleNavigation(liste, cols, ctx, 'suivant')!.item.bul).toBe('B');
  });

  it('retrouve la fiche dans une liste rechargée (nouveaux objets)', () => {
    const ctx = contexteDe({ mat_pers: '1000' }, colonnes, ['mat_pers']);
    const rechargee = lignes.map(l => ({ ...l }));
    expect(cibleNavigation(rechargee, colonnes, ctx, 'suivant')!.item.mat_pers).toBe('1001');
  });

  it('reste dans les résultats du filtre d\'origine', () => {
    const filtre = lignes.filter(l => ['1000', '1002', '1005'].includes(l.mat_pers));
    const ctx = contexteDe({ mat_pers: '1000' }, colonnes, ['mat_pers'], filtre);
    const r = cibleNavigation(lignes, colonnes, ctx, 'suivant')!;
    expect(r.item.mat_pers).toBe('1002');
    expect(r.liste.length).toBe(3);
    expect(cibleNavigation(lignes, colonnes, ctx, 'dernier')!.item.mat_pers).toBe('1005');
  });

  it('indique la fiche affichée, pour repérer qu\'on est déjà à la borne', () => {
    const premiere = contexteDe({ mat_pers: '1' }, colonnes, ['mat_pers']);
    const r = cibleNavigation(lignes, colonnes, premiere, 'precedent')!;
    expect(r.courant).toBe(0);
    expect(r.index).toBe(0);
    const milieu = contexteDe({ mat_pers: '1000' }, colonnes, ['mat_pers']);
    const s = cibleNavigation(lignes, colonnes, milieu, 'suivant')!;
    expect(s.courant).toBe(4);
    expect(s.index).toBe(5);
  });

  it('renvoie null si la fiche affichée n\'est plus dans la liste', () => {
    const ctx = contexteDe({ mat_pers: '1000' }, colonnes, ['mat_pers']);
    expect(cibleNavigation(lignes.filter(l => l.mat_pers !== '1000'), colonnes, ctx, 'suivant')).toBeNull();
    expect(cibleNavigation([], colonnes, ctx, 'suivant')).toBeNull();
    expect(cibleNavigation(undefined, colonnes, ctx, 'suivant')).toBeNull();
  });

  it('se déplace dans une liste triée de 40 000 lignes en moins d\'une seconde', () => {
    const grande = Array.from({ length: 40000 }, (_, i) => ({ mat_pers: String(40000 - i), nom: 'n' + i, pren: 'p' + i }));
    const cols = [{ key: 'mat_pers' }, { key: 'nom' }, { key: 'pren' }];
    const ctx = contexteDe(grande[20000], cols, ['mat_pers', 'nom', 'pren']);
    const debut = Date.now();
    const r = cibleNavigation(grande, cols, ctx, 'suivant')!;
    expect(Date.now() - debut).toBeLessThan(1000);
    expect(Number(r.item.mat_pers)).toBe(Number(grande[20000].mat_pers) + 1);
  });

  describe('identification de la fiche pour l\'indicateur', () => {
    const cols = [
      { key: 'cod_bord', label: 'Code bord' }, { key: 'mat_pers', label: 'Matricule' },
      { key: 'num_fam', label: 'Num fam' }, { key: 'dat_soin', label: 'Date soin' },
    ];
    const bulletins = [
      { cod_bord: '202622', mat_pers: '1234', num_fam: '0', dat_soin: '2021-11-09 00:00:00.0' },
      { cod_bord: '202622', mat_pers: '1234', num_fam: '0', dat_soin: '2021-12-01 00:00:00.0' },
      { cod_bord: '202622', mat_pers: '1234', num_fam: '1', dat_soin: '2021-11-09 00:00:00.0' },
      { cod_bord: '202622', mat_pers: '5678', num_fam: '0', dat_soin: '2021-11-09 00:00:00.0' },
      { cod_bord: '202700', mat_pers: '1', num_fam: '0', dat_soin: '2022-01-01 00:00:00.0' },
    ];
    const format = (cle: string, v: unknown) => (cle === 'dat_soin' ? String(v).slice(8, 10) + '/' + String(v).slice(5, 7) + '/' + String(v).slice(0, 4) : String(v ?? ''));

    it('se limite à la première colonne quand elle suffit', () => {
      expect(identification(bulletins[4], bulletins, cols, format).code).toBe('202700');
      expect(identification({ mat_pers: '1000' }, [{ mat_pers: '1000' }, { mat_pers: '1001' }], [{ key: 'mat_pers' }]).code).toBe('1000');
    });

    it('ajoute les colonnes suivantes tant que la fiche n\'est pas unique', () => {
      expect(identification(bulletins[3], bulletins, cols, format).code).toBe('202622 · 5678');
      expect(identification(bulletins[2], bulletins, cols, format).code).toBe('202622 · 1234 · 1');
    });

    it('limite l\'affichage à 3 valeurs et garde tout dans l\'infobulle, dates en jj/mm/aaaa', () => {
      const id = identification(bulletins[1], bulletins, cols, format);
      expect(id.code).toBe('202622 · 1234 · 0 …');
      expect(id.detail).toBe('Code bord 202622 · Matricule 1234 · Num fam 0 · Date soin 01/12/2021');
    });

    it('prend toutes les colonnes si deux lignes sont identiques, et ne plante pas sans colonne ni liste', () => {
      const doublons = [bulletins[0], { ...bulletins[0] }];
      expect(identification(doublons[0], doublons, cols, format).detail).toContain('Date soin 09/11/2021');
      expect(identification(bulletins[0], [], cols, format).code).toBe('202622');
      expect(identification(bulletins[0], bulletins, [], format)).toEqual({ code: '', detail: '' });
    });
  });
});

describe('NavigationFicheService', () => {

  const contexte: ContexteNavigation = { cles: ['mat_pers'], signature: '1000', filtre: false, signaturesPortee: null };
  const etat = { position: 3, total: 9, filtre: false, code: '1000', detail: 'Matricule 1000' };

  let ajout$: BehaviorSubject<boolean>;
  let evenements$: Subject<any>;
  let appelsRecherche: boolean[];
  let service: NavigationFicheService;

  beforeEach(() => {
    ajout$ = new BehaviorSubject<boolean>(false);
    evenements$ = new Subject<any>();
    appelsRecherche = [];
    const saveFactice = { add$: ajout$.asObservable(), setIsSearch: (v: boolean) => appelsRecherche.push(v) } as unknown as SaveService;
    service = new NavigationFicheService(saveFactice, { events: evenements$.asObservable() } as unknown as Router);
  });

  function saisie(cible: any, fiable = true): Event {
    return { isTrusted: fiable, target: cible } as unknown as Event;
  }
  const dansLaPage = { closest: (s: string) => (s === '.main-content' ? {} : null) };
  const dansUneModale = { closest: (_: string) => ({}) };
  const horsDeLaPage = { closest: (_: string) => null };

  it('publie et efface la position', () => {
    let dernier: any = 'rien';
    service.etat$.subscribe(e => (dernier = e));
    expect(dernier).toBeNull();
    service.publier(contexte, etat);
    expect(dernier).toEqual(etat);
    service.effacer();
    expect(dernier).toBeNull();
  });

  it('ignore une demande tant qu\'aucune fiche n\'a été choisie', () => {
    service.demander('suivant');
    expect(appelsRecherche).toEqual([]);
    expect(service.prendreDemande()).toBeNull();
  });

  it('réveille la recherche et remet la demande une seule fois', () => {
    service.publier(contexte, etat);
    service.demander('suivant');
    expect(appelsRecherche).toEqual([true]);
    const demande = service.prendreDemande()!;
    expect(demande.sens).toBe('suivant');
    expect(demande.contexte).toBe(contexte);
    expect(service.prendreDemande()).toBeNull();
  });

  it('abandonne une demande que personne n\'a prise et rend la recherche à son état normal', () => {
    jasmine.clock().install();
    try {
      service.publier(contexte, etat);
      service.demander('dernier');
      jasmine.clock().tick(3100);
      expect(appelsRecherche).toEqual([true, false]);
      expect(service.prendreDemande()).toBeNull();
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('ne touche pas à la recherche quand la demande a été prise à temps', () => {
    jasmine.clock().install();
    try {
      service.publier(contexte, etat);
      service.demander('dernier');
      service.prendreDemande();
      jasmine.clock().tick(3100);
      expect(appelsRecherche).toEqual([true]);
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('oublie la position quand on clique sur « Nouveau » ou « Retour »', () => {
    let dernier: any = 'rien';
    service.etat$.subscribe(e => (dernier = e));
    service.publier(contexte, etat);
    ajout$.next(true);
    expect(dernier).toBeNull();
  });

  it('oublie la position quand on change d\'écran', () => {
    let dernier: any = 'rien';
    service.etat$.subscribe(e => (dernier = e));
    service.publier(contexte, etat);
    evenements$.next(new NavigationStart(1, '/autre-ecran'));
    expect(dernier).toBeNull();
  });

  it('retient une vraie saisie dans la page, et elle disparaît au chargement d\'une fiche', () => {
    service.signalerSaisie(saisie(dansLaPage));
    expect(service.modifie).toBeTrue();
    service.publier(contexte, etat);
    expect(service.modifie).toBeFalse();
  });

  it('ne retient ni une saisie fabriquée par le programme, ni une saisie en modale, ni hors de la page', () => {
    service.signalerSaisie(saisie(dansLaPage, false));
    service.signalerSaisie(saisie(dansUneModale));
    service.signalerSaisie(saisie(horsDeLaPage));
    service.signalerSaisie({ isTrusted: true, target: null } as unknown as Event);
    expect(service.modifie).toBeFalse();
  });

  it('marquerEnregistre et effacer remettent les modifications à zéro', () => {
    service.signalerSaisie(saisie(dansLaPage));
    service.marquerEnregistre();
    expect(service.modifie).toBeFalse();
    service.signalerSaisie(saisie(dansLaPage));
    service.effacer();
    expect(service.modifie).toBeFalse();
  });
});
