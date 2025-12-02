import { Field } from "../fields";
import { Collection } from "./types";
export declare const collection: <const Slug extends string, const Fields extends Record<string, Field>>(config: Collection<Slug, Fields>) => Collection<Slug, Fields & {
    readonly id: import("../fields").FieldChain<{
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
    }>;
    readonly createdAt: import("../fields").FieldChain<{
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
    }>;
    readonly updatedAt: import("../fields").FieldChain<{
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
    }>;
}>;
export declare const extendFields: <const Slug extends string, const Fields extends Record<string, Field>, const NewFields extends Record<string, Field>>(base: Collection<Slug, Fields>, newFields: NewFields) => Collection<Slug, Fields & NewFields>;
