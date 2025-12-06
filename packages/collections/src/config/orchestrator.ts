// src/core/orchestrator.ts (ou à l'intérieur de defineConfig)
import { Collection } from "../collections/types";
import { Provider } from "../providers/types";

// Type des actions possibles
type Action = 'create' | 'read' | 'update' | 'delete';

export const runOperation = async (
  action: Action,
  collection: Collection,
  provider: Provider,
  payload: { id?: string; data?: any }
) => {
  const { hooks } = collection;
  let currentData = payload.data;
  const id = payload.id;

  try {
    // 1. Hook Global: beforeOperation
    if (hooks?.beforeOperation) {
      await hooks.beforeOperation({ action, collection: collection.slug, data: currentData, id });
    }

    // 2. Hook Spécifique: before[Action]
    // Note: TypeScript peut être strict ici, on simplifie pour la demo
    if (action === 'create' && hooks?.beforeCreate) currentData = await hooks.beforeCreate(currentData);
    if (action === 'update' && hooks?.beforeUpdate) currentData = await hooks.beforeUpdate(currentData);
    if (action === 'delete' && hooks?.beforeDelete) await hooks.beforeDelete({ id });

    // 3. APPEL AU PROVIDER (Le vrai travail DB)
    let result;
    switch (action) {
      case 'create':
        result = await provider.create(collection.slug, currentData);
        break;
      case 'read':
        if (!id) throw new Error("ID required for read");
        result = await provider.read(collection.slug, id);
        break;
      case 'update':
        if (!id) throw new Error("ID required for update");
        result = await provider.update(collection.slug, id, currentData);
        break;
      case 'delete':
        if (!id) throw new Error("ID required for delete");
        await provider.delete(collection.slug, id);
        result = { success: true, id };
        break;
    }

    // 4. Hook Spécifique: after[Action]
    if (action === 'create' && hooks?.afterCreate) result = await hooks.afterCreate(result);
    if (action === 'update' && hooks?.afterUpdate) result = await hooks.afterUpdate(result);
    if (action === 'delete' && hooks?.afterDelete) result = await hooks.afterDelete(result);

    // 5. Hook Global: afterOperation
    if (hooks?.afterOperation) {
      await hooks.afterOperation({ action, result });
    }
    
    // 6. Hook Global: afterSuccess (spécifique à ta liste)
    if (hooks?.afterSuccess) {
        await hooks.afterSuccess(result);
    }

    return result;

  } catch (error: any) {
    // Gestion des erreurs via les hooks
    if (hooks?.afterError) {
      // Le hook peut transformer l'erreur ou la logger
      await hooks.afterError(error);
    }
    throw error; // On relance l'erreur pour que l'appelant sache que ça a échoué
  }
};