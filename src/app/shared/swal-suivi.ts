import Swal from 'sweetalert2';

/**
 * Suivi de toutes les fenêtres SweetAlert de l'application (Swal.fire n'est intercepté qu'une fois) :
 * - `dernierAffichageSwal()` : heure de la dernière fenêtre affichée, pour savoir si un écran a déjà annoncé
 *   lui-même le résultat d'une opération (pas de second message) ;
 * - écouteurs : NavigationFicheService y repère les fenêtres de succès d'enregistrement ;
 * - présentation commune : une fenêtre sans style propre (customClass) reçoit le style de l'application.
 */
type Ecouteur = (args: any[]) => void;

const ecouteurs = new Set<Ecouteur>();
let derniere = 0;
let installe = false;

export function dernierAffichageSwal(): number {
  return derniere;
}

/** Ajoute un écouteur des fenêtres affichées ; renvoie la fonction qui le retire. */
export function suivreSwal(ecouteur: Ecouteur): () => void {
  installer();
  ecouteurs.add(ecouteur);
  return () => ecouteurs.delete(ecouteur);
}

function installer(): void {
  const swal = Swal as any;
  if (installe || swal.__suivi) return;
  installe = true;
  swal.__suivi = true;
  const origine = swal.fire;
  swal.fire = function (...args: any[]) {
    derniere = Date.now();
    ecouteurs.forEach(e => {
      try { e(args); } catch { /* un écouteur ne doit jamais empêcher l'affichage */ }
    });
    return origine.apply(this, habiller(args));
  };
}

/** Style commun de l'application pour les fenêtres qui n'en ont pas (même aspect partout). */
function habiller(args: any[]): any[] {
  let options: any;
  if (args[0] && typeof args[0] === 'object') {
    options = { ...args[0] };
  } else if (typeof args[0] === 'string' || typeof args[1] === 'string') {
    // forme courte Swal.fire(titre, texte, icône)
    options = { title: args[0], text: args[1], icon: args[2] };
  } else {
    return args;
  }
  if (options.customClass) return [options];
  options.customClass = options.toast
    ? { popup: 'toast-app' + (options.icon ? ' toast-app--' + options.icon : '') }
    : { popup: 'popup-app' + (options.icon ? ' popup-app--' + options.icon : '') };
  return [options];
}
