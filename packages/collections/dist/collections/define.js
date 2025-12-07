"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collection = void 0;
const fields_1 = require("../fields");
const extend_fields_1 = require("./extend-fields");
const collection = (config) => {
    return (0, extend_fields_1.extendFields)(config, {
        id: (0, fields_1.primary)((0, fields_1.field)({ type: (0, fields_1.serial)() })),
        createdAt: (0, fields_1.field)({ type: (0, fields_1.timestamp)() }),
        updatedAt: (0, fields_1.field)({ type: (0, fields_1.timestamp)() }),
    });
};
exports.collection = collection;
