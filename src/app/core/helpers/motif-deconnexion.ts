/**
 * Pourquoi l'utilisateur arrive sur l'écran de connexion : l'écran l'affiche une seule fois (message « Session
 * expirée… »). Mémorisé dans sessionStorage (propre à l'onglet, et conservé par un rechargement de page).
 *
 *  - 'inactivite' : déconnexion automatique après inactivité ;
 *  - 'expiree'    : jeton expiré ou refusé par le serveur (401).
 */
export type MotifDeconnexion = 'inactivite' | 'expiree';

const CLE = 'motifDeconnexion';

export function memoriserMotifDeconnexion(motif: MotifDeconnexion): void {
  try { sessionStorage.setItem(CLE, motif); } catch { /* stockage indisponible : pas de message */ }
}

/** Lit puis efface le motif (le message ne doit pas réapparaître à la prochaine visite de l'écran). */
export function consommerMotifDeconnexion(): MotifDeconnexion | null {
  try {
    const motif = sessionStorage.getItem(CLE);
    sessionStorage.removeItem(CLE);
    return motif === 'inactivite' || motif === 'expiree' ? motif : null;
  } catch {
    return null;
  }
}
