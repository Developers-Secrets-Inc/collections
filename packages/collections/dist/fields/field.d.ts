import z from "zod";
import { FieldChain, FieldConfig, FieldKind, FieldTypeFinal } from "./types";
export declare const fieldType: <TOutput, TParams extends z.ZodType | undefined>(config: {
    schema?: TParams;
    dsl: {
        kind: FieldKind;
    };
    admin: {
        component: any;
    };
}) => (params?: TParams extends z.ZodType ? z.infer<TParams> : undefined) => {
    kind: FieldKind;
    params: unknown;
    dsl: {
        kind: FieldKind;
        isPrimary: boolean;
        isUnique: boolean;
        canBeNull: boolean;
    };
    admin: {
        component: any;
    };
};
export declare const field: <TType extends FieldTypeFinal>(config: FieldConfig<TType>) => FieldChain<TType>;
