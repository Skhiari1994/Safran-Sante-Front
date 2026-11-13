import Swal from 'sweetalert2';

/** Message de réussite en haut à droite (ajout, modification, suppression). */
export function notifSucces(titre: string): void {
  Swal.fire({
    position: 'top-end',
    icon: 'success',
    title: titre,
    showConfirmButton: false,
    timer: 2000,
  });
}

/** Message d'erreur : reprend le texte renvoyé par le serveur s'il y en a un. */
export function notifErreur(titre: string, err: any, messageParDefaut: string): void {
  const message = typeof err?.error === 'string' && err.error ? err.error : messageParDefaut;
  Swal.fire({ icon: 'error', title: titre, text: message });
}

export const MSG_AJOUT = 'Ajouté avec succès !';
export const MSG_MODIF = 'Modifié avec succès !';
export const MSG_SUPPR = 'Supprimé avec succès !';
export const MSG_SUPPR_IMPOSSIBLE = 'Cet élément est utilisé ailleurs et ne peut pas être supprimé.';
