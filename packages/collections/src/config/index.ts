import { InferSchema } from "../fields/types";
import { runOperation } from "./orchestrator";
import { Config } from "./types";

export const defineConfig = <C extends Config>(config: Exact<C, Config>) => {
  type Cols = C["collections"][number];

  // Définition du type de retour DB avec autocomplétion
  type Db = {
    [Col in Cols as Col["slug"]]: {
      create: (data: InferSchema<Col["fields"]>) => Promise<any>;
      read: (id: string) => Promise<any>;
      update: (
        id: string,
        data: Partial<InferSchema<Col["fields"]>>,
      ) => Promise<any>;
      delete: (id: string) => Promise<void>;
    };
  };

  config.provider.init(config.collections);

  const db = {} as Db;

  for (const col of config.collections) {
    (db as any)[col.slug] = {
      create: async (data: any) => {
        return runOperation("create", col, config.provider, { data });
      },

      read: async (id: string) => {
        return runOperation("read", col, config.provider, { id });
      },

      update: async (id: string, data: any) => {
        return runOperation("update", col, config.provider, { id, data });
      },

      delete: async (id: string) => {
        return runOperation("delete", col, config.provider, { id });
      },
    };
  }

  return db;
};
