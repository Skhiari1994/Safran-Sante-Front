import { libelleDe } from './lov-libelle';

describe('libelleDe', () => {
  const nationalites = [
    { cod_natp: 'TUN', lib_nat: 'Tunisienne' },
    { cod_natp: 'FRA ', lib_nat: 'Française' },
  ];

  it('donne le libellé du code', () => {
    expect(libelleDe(nationalites, 'cod_natp', 'TUN', 'lib_nat')).toBe('Tunisienne');
  });

  it('ignore la casse et les espaces autour du code', () => {
    expect(libelleDe(nationalites, 'cod_natp', ' tun ', 'lib_nat')).toBe('Tunisienne');
    expect(libelleDe(nationalites, 'cod_natp', 'fra', 'lib_nat')).toBe('Française');
  });

  it('est vide quand la fiche n\'a pas de code, pour ne pas garder le libellé de la fiche précédente', () => {
    expect(libelleDe(nationalites, 'cod_natp', null, 'lib_nat')).toBe('');
    expect(libelleDe(nationalites, 'cod_natp', undefined, 'lib_nat')).toBe('');
    expect(libelleDe(nationalites, 'cod_natp', '', 'lib_nat')).toBe('');
    expect(libelleDe(nationalites, 'cod_natp', '   ', 'lib_nat')).toBe('');
  });

  it('est vide quand le code n\'est pas dans la liste, jamais « undefined »', () => {
    expect(libelleDe(nationalites, 'cod_natp', 'XXX', 'lib_nat')).toBe('');
    expect(libelleDe([{ cod_natp: 'TUN' }], 'cod_natp', 'TUN', 'lib_nat')).toBe('');
  });

  it('ne plante pas sans liste', () => {
    expect(libelleDe(undefined, 'cod_natp', 'TUN', 'lib_nat')).toBe('');
    expect(libelleDe(null, 'cod_natp', 'TUN', 'lib_nat')).toBe('');
    expect(libelleDe([], 'cod_natp', 'TUN', 'lib_nat')).toBe('');
  });

  it('accepte un code numérique, 0 compris', () => {
    const familles = [{ num_fam: 0, lib: 'Adhérent' }, { num_fam: 1, lib: 'Enfant' }];
    expect(libelleDe(familles, 'num_fam', 0, 'lib')).toBe('Adhérent');
    expect(libelleDe(familles, 'num_fam', '1', 'lib')).toBe('Enfant');
  });
});
