import z from "zod";
import {
  Field,
  FieldChain,
  FieldConfig,
  FieldPermissions,
  FieldTypeConfig,
  FieldTypeFinal,
} from "./types";
import { attachChain } from "./constraints";

export const fieldType =
  <TOutput, TParams extends z.ZodType | undefined>(config: {
    schema?: TParams;
    dsl: { kind: string };
    admin: { component: any };
  }) =>
  (params?: TParams extends z.ZodType ? z.infer<TParams> : undefined) => {
    const validated =
      config.schema && params !== undefined
        ? config.schema.parse(params)
        : params;

    return {
      kind: config.dsl.kind,
      params: validated,
      dsl: {
        kind: config.dsl.kind,
        isPrimary: false,
        isUnique: false,
        canBeNull: true,
      },
      admin: config.admin,
    };
  };

const defaultPermissions: FieldPermissions = {
  create: async () => true,
  read: async () => true,
  update: async () => true,
  delete: async () => true,
};

export const field = <TType extends FieldTypeFinal>(
  config: FieldConfig<TType>,
): FieldChain<TType> => {
  const base: Field<TType> = {
    type: config.type,
    permissions: {
      ...defaultPermissions,
      ...config.permissions,
    },
  };

  return attachChain(base);
};
