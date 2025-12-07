import { Collection } from "../collections/types";
import { CollectionsCrud } from "../database/types";
import { Field, FieldTypeFinal } from "../fields";
import { Plugin } from "../plugins/types";
import { Provider } from "../providers/types";
import { UnionToIntersection } from "../utils/union-intersection";

export type Config = {
  databaseUrl: string;
  readonly collections: Collection[];
  plugins?: Plugin[];
};

export type DbFromConfig<C extends Config> = UnionToIntersection<
  CollectionsCrud<C["collections"][number]>
>;

export type InferSchema<F extends Record<string, Field>> = {
  [K in keyof F]: F[K] extends Field<infer FT>
    ? FT extends FieldTypeFinal<any, infer TVal>
      ? TVal
      : never
    : never;
};
