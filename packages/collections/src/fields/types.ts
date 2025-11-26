import { z } from "zod";
import { DeepPartial } from "../utils/deep-partial";

export type FieldTypeConfig<TParams extends z.ZodType = z.ZodType> = {
  schema: TParams;
  dsl: {
    kind: string;
    config?: Record<string, any>;
  };
  admin: {
    component: any;
  };
};

export type FieldTypeFinal<TParams extends z.ZodType = z.ZodType> = {
  kind: string;
  params: z.infer<TParams>;
  dsl: {
    kind: string;
    config?: Record<string, any>;
  };
  admin: {
    component: any;
  };
};

export type FieldPermissions = {
  create: (ctx: any) => Promise<boolean>;
  read: (ctx: any) => Promise<boolean>;
  update: (ctx: any) => Promise<boolean>;
  delete: (ctx: any) => Promise<boolean>;
};

export type FieldConfig<TType extends FieldTypeConfig> = {
  type: TType;
  permissions?: Partial<FieldPermissions>;
};

export type Field<TType extends FieldTypeConfig = FieldTypeConfig> = {
  type: TType;
  permissions: FieldPermissions;
};
