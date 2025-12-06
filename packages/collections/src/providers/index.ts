import { Provider } from "./types";

export const inAppProvider = (): Provider => {
  // Stockage en mémoire : { "posts": { "id_1": { ...data }, "id_2": { ...data } } }
  const storage: Record<string, Record<string, any>> = {};

  return {
    // L'init reçoit maintenant la liste des collections pour préparer le "schéma"
    init: (collections) => {
      console.log("Initializing in-app provider");
      
      for (const col of collections) {
        // On initialise un "bucket" vide pour chaque collection si pas déjà fait
        if (!storage[col.slug]) {
          storage[col.slug] = {};
        }
      }
    },

    create: async (collectionSlug, data) => {
      // Simulation d'un ID (dans une vraie DB, c'est géré par le moteur ou UUID)
      const id = Math.random().toString(36).substring(2, 15);
      
      const record = { ...data, id };

      // Sécurité au cas où on écrit dans une collection non initialisée
      if (!storage[collectionSlug]) storage[collectionSlug] = {};

      storage[collectionSlug][id] = record;

      return record;
    },

    read: async (collectionSlug, id) => {
      const record = storage[collectionSlug]?.[id];
      
      if (!record) {
        throw new Error(`Record with ID "${id}" not found in "${collectionSlug}".`);
      }

      return record;
    },

    update: async (collectionSlug, id, data) => {
      const existing = storage[collectionSlug]?.[id];

      if (!existing) {
        throw new Error(`Cannot update: Record with ID "${id}" not found in "${collectionSlug}".`);
      }

      // Fusion des données (Partial update)
      const updated = { ...existing, ...data };
      storage[collectionSlug][id] = updated;

      return updated;
    },

    delete: async (collectionSlug, id) => {
      if (storage[collectionSlug] && storage[collectionSlug][id]) {
        delete storage[collectionSlug][id];
      } else {
        // Optionnel : Throw une erreur si l'item n'existe pas, 
        // ou juste ignorer comme le ferait une requête SQL "DELETE WHERE ID=..."
        console.warn(`Attempted to delete non-existent record "${id}" in "${collectionSlug}"`);
      }
    }
  };
}