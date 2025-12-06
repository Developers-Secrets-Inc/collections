"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendFields = exports.collection = void 0;
const fields_1 = require("../fields");
const collection = (config) => {
    return (0, exports.extendFields)(config, {
        id: (0, fields_1.field)({ type: (0, fields_1.uuid)() }),
        createdAt: (0, fields_1.field)({ type: (0, fields_1.timestamp)() }),
        updatedAt: (0, fields_1.field)({ type: (0, fields_1.timestamp)() }),
    });
};
exports.collection = collection;
const extendFields = (base, newFields) => {
    return {
        ...base,
        fields: {
            ...base.fields,
            ...newFields,
        },
    };
};
exports.extendFields = extendFields;
