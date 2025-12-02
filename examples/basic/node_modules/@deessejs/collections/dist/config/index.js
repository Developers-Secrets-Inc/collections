"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineConfig = void 0;
const orchestrator_1 = require("./orchestrator");
const defineConfig = (config) => {
    config.provider.init(config.collections);
    const db = {};
    for (const col of config.collections) {
        db[col.slug] = {
            create: async (data) => {
                return (0, orchestrator_1.runOperation)("create", col, config.provider, { data });
            },
            read: async (id) => {
                return (0, orchestrator_1.runOperation)("read", col, config.provider, { id });
            },
            update: async (id, data) => {
                return (0, orchestrator_1.runOperation)("update", col, config.provider, { id, data });
            },
            delete: async (id) => {
                return (0, orchestrator_1.runOperation)("delete", col, config.provider, { id });
            },
        };
    }
    return db;
};
exports.defineConfig = defineConfig;
