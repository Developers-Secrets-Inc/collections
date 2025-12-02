"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.field = exports.fieldType = void 0;
const constraints_1 = require("./constraints");
const fieldType = (config) => (params) => {
    const validated = config.schema && params !== undefined
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
exports.fieldType = fieldType;
const defaultPermissions = {
    create: async () => true,
    read: async () => true,
    update: async () => true,
    delete: async () => true,
};
const field = (config) => {
    const base = {
        type: config.type,
        permissions: {
            ...defaultPermissions,
            ...config.permissions,
        },
    };
    return (0, constraints_1.attachChain)(base);
};
exports.field = field;
