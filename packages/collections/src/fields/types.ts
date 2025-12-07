import { z } from "zod";

export type FieldKind =
  | "integer"
  | "serial"
  | "boolean"
  | "text"
  | "varchar"
  | "char"
  | "numeric"
  | "decimal"
  | "json"
  | "uuid"
  | "timestamp";

export type FieldTypeConfig<TParams extends z.ZodType = z.ZodType> = {
  schema?: TParams;
  dsl: {
    kind: FieldKind;
  };
  admin: {
    component: any;
  };
};

export type FieldTypeFinal<
  TParams extends z.ZodType = z.ZodType,
  TOutput = any,
> = {
  kind: string;
  params: z.infer<TParams>;
  dsl: {
    kind: string;
    isPrimary: boolean;
    isUnique: boolean;
    canBeNull: boolean;
  };
  admin: {
    component: any;
  };
  _output?: TOutput; // Propriété fantôme pour le typage
};

export type FieldPermissions = {
  create: (ctx: any) => Promise<boolean>;
  read: (ctx: any) => Promise<boolean>;
  update: (ctx: any) => Promise<boolean>;
  delete: (ctx: any) => Promise<boolean>;
};

export type FieldConfig<TType extends FieldTypeFinal> = {
  type: TType;
  permissions?: Partial<FieldPermissions>;
};

export type Field<TType extends FieldTypeFinal = FieldTypeFinal> = {
  type: TType;
  permissions: FieldPermissions;
};

export type InferSchema<F extends Record<string, Field>> = {
  [K in keyof F]: F[K] extends Field<infer FT>
    ? FT extends FieldTypeFinal<any, infer TVal>
      ? TVal
      : never
    : never;
};

export type FieldChain<TType extends FieldTypeFinal> = Field<TType> & {
  unique(): FieldChain<TType>;
  required(): FieldChain<TType>;
  optional(): FieldChain<TType>;
  primary(): FieldChain<TType>;
};
