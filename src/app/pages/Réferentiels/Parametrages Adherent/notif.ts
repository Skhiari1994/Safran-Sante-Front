import Swal from 'sweetalert2';

/** Message de réussite en haut à droite (ajout, modification, suppression). */
export function notifSucces(titre: string): void {
  // même notification que les messages automatiques de l'application (voir MessagesResultatService)
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: titre,
    showConfirmButton: false,
    showCloseButton: true,
    timer: 3000,
    timerProgressBar: true,
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

/** Échappe un texte venant de la base avant de l'insérer dans une fenêtre HTML. */
export function echapperHtml(texte: unknown): string {
  const remplacements: { [c: string]: string } = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(texte ?? '').replace(/[&<>"']/g, c => remplacements[c]);
}

/**
 * Fenêtre de confirmation de suppression, identique sur tous les écrans : corbeille dans un cercle rouge au-dessus
 * du titre, carte « élément concerné » (HTML déjà échappé avec echapperHtml), avertissement « définitif »,
 * boutons « Annuler » / « Supprimer ». Le focus est sur « Annuler » : Entrée ou Échap ne suppriment rien.
 * Renvoie true si l'utilisateur confirme.
 */
export function confirmerSuppression(titre: string, detailHtml = '', message = 'Cette action est définitive et ne pourra pas être annulée.'): Promise<boolean> {
  return Swal.fire({
    title: titre,
    icon: 'warning',
    iconHtml: '<i class="ri-delete-bin-6-line" aria-hidden="true"></i>',
    html: `<div class="supp">`
      + (detailHtml
        ? `<div class="supp__element"><span class="supp__etiquette">Élément concerné</span><span class="supp__valeur">${detailHtml}</span></div>`
        : '')
      + `<p class="supp__message"><i class="ri-error-warning-line" aria-hidden="true"></i><span>${message}</span></p>
           </div>`,
    showCancelButton: true,
    reverseButtons: true,
    focusCancel: true,
    buttonsStyling: false,
    confirmButtonText: '<i class="ri-delete-bin-line align-bottom me-1" aria-hidden="true"></i>Supprimer',
    cancelButtonText: 'Annuler',
    customClass: {
      popup: 'popup-suppression',
      icon: 'supp-icone',
      title: 'supp-titre',
      htmlContainer: 'supp-contenu',
      actions: 'supp-actions',
      confirmButton: 'btn btn-danger px-4',
      cancelButton: 'btn btn-light px-4',
    },
  }).then(resultat => resultat.isConfirmed);
}
