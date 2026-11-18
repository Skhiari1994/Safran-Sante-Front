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

/** Échappe un texte venant de la base avant de l'insérer dans une fenêtre HTML. */
export function echapperHtml(texte: unknown): string {
  const remplacements: { [c: string]: string } = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(texte ?? '').replace(/[&<>"']/g, c => remplacements[c]);
}

/**
 * Fenêtre de confirmation de suppression, identique sur tous les écrans : corbeille animée dans un cercle,
 * carte « élément concerné » (HTML déjà échappé avec echapperHtml), rappel que l'action est définitive,
 * boutons « Annuler » / « Oui, supprimer ». Le focus est sur « Annuler » : une touche Entrée ne supprime rien.
 * Renvoie true si l'utilisateur confirme.
 */
export function confirmerSuppression(titre: string, detailHtml = '', message = 'Cette action est définitive et ne pourra pas être annulée.'): Promise<boolean> {
  return Swal.fire({
    title: titre,
    html: `<div class="supp">
             <div class="supp__icone" aria-hidden="true">
               <lord-icon src="https://cdn.lordicon.com/gsqxdxog.json" trigger="loop" colors="primary:#f7b84b,secondary:#f06548" style="width: 64px; height: 64px"></lord-icon>
             </div>`
      + (detailHtml ? `<div class="supp__element">${detailHtml}</div>` : '')
      + `<p class="supp__message">${message}</p>
           </div>`,
    showCancelButton: true,
    reverseButtons: true,
    focusCancel: true,
    buttonsStyling: false,
    confirmButtonText: '<i class="ri-delete-bin-line align-bottom me-1" aria-hidden="true"></i>Oui, supprimer',
    cancelButtonText: 'Annuler',
    customClass: {
      popup: 'popup-suppression',
      title: 'supp-titre',
      htmlContainer: 'supp-contenu',
      actions: 'supp-actions',
      confirmButton: 'btn btn-danger btn-lg px-4',
      cancelButton: 'btn btn-light btn-lg px-4',
    },
  }).then(resultat => resultat.isConfirmed);
}
