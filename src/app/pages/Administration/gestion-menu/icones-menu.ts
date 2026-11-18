/** Icône proposée dans le sélecteur de l'écran « Gestion Menu » (nom de classe Remix Icon). */
export interface IconeMenuChoix {
  classe: string;
  libelle: string;
  /** mots-clés supplémentaires pour la recherche */
  mots?: string;
}

export const ICONES_MENU: IconeMenuChoix[] = [
  // Personnes
  { classe: 'ri-team-line', libelle: 'Équipe', mots: 'adhérents groupe' },
  { classe: 'ri-user-heart-line', libelle: 'Adhérent mutuelle', mots: 'personne coeur' },
  { classe: 'ri-user-line', libelle: 'Utilisateur', mots: 'personne' },
  { classe: 'ri-user-add-line', libelle: 'Ajouter un utilisateur', mots: 'créer' },
  { classe: 'ri-user-settings-line', libelle: 'Gestion des utilisateurs', mots: 'profil compte' },
  { classe: 'ri-group-line', libelle: 'Groupe', mots: 'collectif' },
  { classe: 'ri-profile-line', libelle: 'Fiche', mots: 'profil adhérent' },
  { classe: 'ri-parent-line', libelle: 'Famille', mots: 'enfants parents' },
  { classe: 'ri-contacts-book-line', libelle: 'Annuaire', mots: 'contacts' },
  { classe: 'ri-shield-user-line', libelle: 'Administration', mots: 'admin sécurité' },
  { classe: 'ri-shield-check-line', libelle: 'Protection', mots: 'assurance mutuelle sécurité' },

  // Santé
  { classe: 'ri-heart-pulse-line', libelle: 'Santé', mots: 'remboursement médical' },
  { classe: 'ri-stethoscope-line', libelle: 'Soins', mots: 'maladie médecin' },
  { classe: 'ri-hospital-line', libelle: 'Hôpital', mots: 'clinique établissement' },
  { classe: 'ri-first-aid-kit-line', libelle: 'Trousse de secours', mots: 'urgence' },
  { classe: 'ri-medicine-bottle-line', libelle: 'Médicaments', mots: 'pharmacie' },
  { classe: 'ri-nurse-line', libelle: 'Personnel soignant', mots: 'infirmier' },
  { classe: 'ri-hand-heart-line', libelle: 'Solidarité', mots: 'aide don' },

  // Finances
  { classe: 'ri-wallet-3-line', libelle: 'Cotisations', mots: 'portefeuille' },
  { classe: 'ri-bank-line', libelle: 'Crédits', mots: 'banque prêt' },
  { classe: 'ri-hand-coin-line', libelle: 'Indemnités', mots: 'argent' },
  { classe: 'ri-money-dollar-circle-line', libelle: 'Montant', mots: 'argent prix' },
  { classe: 'ri-coins-line', libelle: 'Pièces', mots: 'argent' },
  { classe: 'ri-secure-payment-line', libelle: 'Règlement', mots: 'paiement' },
  { classe: 'ri-bill-line', libelle: 'Facture', mots: 'paie' },
  { classe: 'ri-percent-line', libelle: 'Commission', mots: 'taux pourcentage' },
  { classe: 'ri-calculator-line', libelle: 'Calcul', mots: 'barème' },
  { classe: 'ri-exchange-line', libelle: 'Virement', mots: 'échange transfert' },
  { classe: 'ri-award-line', libelle: 'Prime', mots: 'récompense' },
  { classe: 'ri-gift-line', libelle: 'Cadeau', mots: 'avantage' },

  // Documents
  { classe: 'ri-file-list-2-line', libelle: 'Convention', mots: 'contrat liste' },
  { classe: 'ri-file-list-3-line', libelle: 'Bulletin', mots: 'liste' },
  { classe: 'ri-file-text-line', libelle: 'Demande', mots: 'document texte' },
  { classe: 'ri-file-edit-line', libelle: 'Préparation', mots: 'modifier document' },
  { classe: 'ri-file-chart-line', libelle: 'Rapport', mots: 'état statistique' },
  { classe: 'ri-file-copy-2-line', libelle: 'Copie', mots: 'duplicata' },
  { classe: 'ri-article-line', libelle: 'Article', mots: 'texte' },
  { classe: 'ri-draft-line', libelle: 'Brouillon', mots: 'document' },
  { classe: 'ri-archive-line', libelle: 'Archive', mots: 'classement' },
  { classe: 'ri-folder-2-line', libelle: 'Dossier', mots: 'groupe' },
  { classe: 'ri-folder-user-line', libelle: 'Dossier personnel', mots: 'adhérent' },
  { classe: 'ri-book-open-line', libelle: 'Guide', mots: 'livre' },
  { classe: 'ri-printer-line', libelle: 'Édition', mots: 'imprimer état' },
  { classe: 'ri-todo-line', libelle: 'Liste de tâches', mots: 'contrôle' },

  // Actions
  { classe: 'ri-edit-box-line', libelle: 'Saisie', mots: 'écrire' },
  { classe: 'ri-pencil-line', libelle: 'Modification', mots: 'éditer' },
  { classe: 'ri-checkbox-circle-line', libelle: 'Validation', mots: 'valider approuver' },
  { classe: 'ri-search-eye-line', libelle: 'Consultation', mots: 'rechercher voir' },
  { classe: 'ri-send-plane-line', libelle: 'Envoi', mots: 'envoyer' },
  { classe: 'ri-inbox-archive-line', libelle: 'Réception', mots: 'recevoir' },
  { classe: 'ri-upload-cloud-2-line', libelle: 'Chargement', mots: 'import téléverser' },
  { classe: 'ri-download-cloud-2-line', libelle: 'Téléchargement', mots: 'export' },
  { classe: 'ri-lock-unlock-line', libelle: 'Déblocage', mots: 'ouvrir' },
  { classe: 'ri-lock-line', libelle: 'Blocage', mots: 'clôture cadenas' },
  { classe: 'ri-key-2-line', libelle: 'Autorisations', mots: 'clé accès droits' },
  { classe: 'ri-pause-circle-line', libelle: 'Suspension', mots: 'pause' },
  { classe: 'ri-refresh-line', libelle: 'Renouvellement', mots: 'actualiser' },
  { classe: 'ri-history-line', libelle: 'Historique', mots: 'journal' },
  { classe: 'ri-logout-circle-r-line', libelle: 'Départ', mots: 'sortie' },
  { classe: 'ri-door-open-line', libelle: 'Réintégration', mots: 'entrée' },

  // Temps et lieux
  { classe: 'ri-calendar-2-line', libelle: 'Calendrier', mots: 'date congé' },
  { classe: 'ri-calendar-check-line', libelle: 'Échéancier', mots: 'planning mensuel' },
  { classe: 'ri-timer-line', libelle: 'Retraite', mots: 'durée temps' },
  { classe: 'ri-building-2-line', libelle: 'Société', mots: 'entreprise' },
  { classe: 'ri-map-pin-line', libelle: 'Lieu', mots: 'agence gouvernorat' },

  // Système
  { classe: 'ri-settings-3-line', libelle: 'Paramétrage', mots: 'réglages configuration' },
  { classe: 'ri-list-settings-line', libelle: 'Paramètres de liste', mots: 'configuration' },
  { classe: 'ri-database-2-line', libelle: 'Référentiels', mots: 'données base' },
  { classe: 'ri-dashboard-2-line', libelle: 'Tableau de bord', mots: 'accueil' },
  { classe: 'ri-apps-2-line', libelle: 'Applications', mots: 'modules' },
  { classe: 'ri-menu-line', libelle: 'Menu', mots: 'navigation' },
  { classe: 'ri-bar-chart-2-line', libelle: 'Statistiques', mots: 'graphique' },
  { classe: 'ri-chat-3-line', libelle: 'Messagerie', mots: 'chat discussion' },
  { classe: 'ri-book-2-line', libelle: 'Scolarité', mots: 'formation études' },
  { classe: 'ri-scales-3-line', libelle: 'Opposition', mots: 'justice balance' },
  { classe: 'ri-shield-star-line', libelle: 'Certifié', mots: 'vérifié' },
  { classe: 'ri-stack-line', libelle: 'Niveaux', mots: 'empiler' },
];
