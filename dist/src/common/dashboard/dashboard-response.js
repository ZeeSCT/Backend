"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.screenResponse = screenResponse;
exports.enumCountRows = enumCountRows;
function screenResponse(screenKey, title, payload) {
    return {
        screenKey,
        title,
        generatedAt: new Date().toISOString(),
        ...payload,
    };
}
function enumCountRows(grouped, key, label = 'count') {
    return grouped.map((item) => ({ key: item[key], [label]: item._count?.[key] ?? item._count ?? 0 }));
}
//# sourceMappingURL=dashboard-response.js.map