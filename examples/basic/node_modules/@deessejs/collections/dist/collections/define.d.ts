import { Field } from "../fields";
import { Collection } from "./types";
export declare const collection: <const Slug extends string, const Fields extends Record<string, Field>>(config: Collection<Slug, Fields>) => Collection<Slug, Fields & {
    readonly id: Field<{
        kind: import("../fields").FieldKind;
        params: unknown;
        dsl: {
            kind: import("../fields").FieldKind;
            isPrimary: boolean;
            isUnique: boolean;
            canBeNull: boolean;
        };
        admin: {
            component: any;
        };
    }>;
    readonly createdAt: import("../fields").FieldChain<{
        kind: import("../fields").FieldKind;
        params: unknown;
        dsl: {
            kind: import("../fields").FieldKind;
            isPrimary: boolean;
            isUnique: boolean;
            canBeNull: boolean;
        };
        admin: {
            component: any;
        };
    }>;
    readonly updatedAt: import("../fields").FieldChain<{
        kind: import("../fields").FieldKind;
        params: unknown;
        dsl: {
            kind: import("../fields").FieldKind;
            isPrimary: boolean;
            isUnique: boolean;
            canBeNull: boolean;
        };
        admin: {
            component: any;
        };
    }>;
}>;
