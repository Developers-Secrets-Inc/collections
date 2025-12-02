import { Collection } from "../collections/types";
import { InferSchema } from "../fields/types"; // Importez le helper créé ci-dessus

export type CollectionsCrud<C extends Collection> = {
  [K in C["slug"]]: {
    // CORRECTION : Utilisez InferSchema<C["fields"]>
    create: (data: InferSchema<C["fields"]>) => Promise<any>;

    read: (id: string) => Promise<any>;

    // CORRECTION : Utilisez InferSchema ici aussi
    update: (
      id: string,
      data: Partial<InferSchema<C["fields"]>>,
    ) => Promise<any>;

    delete: (id: string) => Promise<void>;
  };
};
