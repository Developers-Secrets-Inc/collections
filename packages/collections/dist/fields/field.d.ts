import z from "zod";
import { FieldChain, FieldConfig, FieldTypeFinal } from "./types";
export declare const fieldType: <TOutput, TParams extends z.ZodType | undefined>(config: {
    schema?: TParams;
    dsl: {
        kind: string;
    };
    admin: {
        component: any;
    };
}) => (params?: TParams extends z.ZodType ? z.infer<TParams> : undefined) => {
    kind: string;
    params: unknown;
    dsl: {
        kind: string;
        isPrimary: boolean;
        isUnique: boolean;
        canBeNull: boolean;
    };
    admin: {
        component: any;
    };
};
export declare const field: <TType extends FieldTypeFinal>(config: FieldConfig<TType>) => FieldChain<TType>;
