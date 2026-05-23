"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Strapi v5 policy — validates the X-Sync-Token header against
 * RENDER_SYNC_TOKEN before allowing the request to reach the controller.
 */
exports.default = async (ctx) => {
    const incoming = ctx.request.header['x-sync-token'];
    const expected = process.env.RENDER_SYNC_TOKEN;
    if (!incoming || !expected || incoming !== expected) {
        ctx.status = 401;
        ctx.body = { error: 'Unauthorized handshake token' };
        return false;
    }
    return true;
};
