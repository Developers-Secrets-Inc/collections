import { Collection } from "../collections/types";

export type Provider = {
  init: (collections: readonly Collection[]) => Promise<void> | void;

  create: (collectionSlug: string, data: any) => Promise<any>;
  read: (collectionSlug: string, id: string) => Promise<any>;
  update: (collectionSlug: string, id: string, data: any) => Promise<any>;
  delete: (collectionSlug: string, id: string) => Promise<void>;
};
