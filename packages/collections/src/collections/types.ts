import { Field } from "../fields";

export type CollectionHooks = {
  beforeCreate?: (data: any) => Promise<any>;
  afterCreate?: (data: any) => Promise<any>;
  beforeUpdate?: (data: any) => Promise<any>;
  afterUpdate?: (data: any) => Promise<any>;
  beforeDelete?: (data: any) => Promise<any>;
  afterDelete?: (data: any) => Promise<any>;

  beforeOperation?: (data: any) => Promise<any>;
  afterOperation?: (data: any) => Promise<any>;

  afterError?: (error: Error) => Promise<any>;
  afterSuccess?: (data: any) => Promise<any>;
};

export type Collection<
  Slug extends string = string,
  Fields extends Record<string, Field> = Record<string, Field>,
> = {
  slug: Slug;
  name?: string;
  admin?: {
    title?: string;
    group?: string;
  };
  fields: Fields;
  hooks?: CollectionHooks;
  permissions?: {
    create?: (ctx: any) => Promise<boolean>;
    read?: (ctx: any) => Promise<boolean>;
    update?: (ctx: any) => Promise<boolean>;
    delete?: (ctx: any) => Promise<boolean>;
  };
};
