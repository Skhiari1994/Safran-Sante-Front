import { iconeMenu } from './menu-icons';

describe('iconeMenu', () => {
  it('une icône enregistrée en base est prioritaire, à tous les niveaux', () => {
    expect(iconeMenu('ri-star-line', 'Référentiels', 0)).toBe('ri-star-line');
    expect(iconeMenu('  ri-star-line ', 'Edition', 1)).toBe('ri-star-line');
    expect(iconeMenu('bx bx-registered', 'Gestion de la caisse de retraite', 0)).toBe('bx bx-registered');
  });

  it('sans icône en base, elle est déduite du libellé (sans tenir compte des accents ni de la casse)', () => {
    expect(iconeMenu('', 'Référentiels', 0)).toBe('ri-database-2-line');
    expect(iconeMenu(null, 'REFERENTIELS', 0)).toBe('ri-database-2-line');
    expect(iconeMenu(undefined, 'Gestion des adhésions mutuelles', 0)).toBe('ri-team-line');
    expect(iconeMenu('', 'Gestion des remboursement des frais médicaux', 0)).toBe('ri-heart-pulse-line');
    expect(iconeMenu('', 'Edition', 1)).toBe('ri-printer-line');
    expect(iconeMenu('', 'Préparation fiche salarié', 1)).toBe('ri-file-edit-line');
    expect(iconeMenu('', 'Gestion des départs et des réintégrations', 1)).toBe('ri-logout-circle-r-line');
  });

  it('un libellé inconnu reçoit une icône par défaut selon le niveau', () => {
    expect(iconeMenu('', 'Zzz inconnu', 0)).toBe('ri-apps-2-line');
    expect(iconeMenu('', 'Zzz inconnu', 1)).toBe('ri-folder-2-line');
  });
});
