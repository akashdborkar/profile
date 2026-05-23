"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncLoader = void 0;
/**
 * Lazy loader for the sync engine. The `.fn` property is replaceable,
 * which lets tests inject a mock without mocking dynamic imports.
 */
exports.syncLoader = {
    fn: null,
    async get() {
        if (!this.fn) {
            // new Function() prevents TypeScript from statically resolving the cross-package
            // path during CMS compilation (rootDir constraint). At runtime Node.js loads it fine.
            const load = new Function('m', 'return import(m)');
            const mod = await load('../../../../../sync/src/sync-engine.service.js');
            this.fn = mod.syncLinkedInData;
        }
        return this.fn;
    },
};
exports.default = {
    async syncLinkedIn(ctx) {
        try {
            const syncFn = await exports.syncLoader.get();
            const result = await syncFn(ctx.request.body);
            ctx.status = 200;
            ctx.body = { success: true, ...result };
        }
        catch (err) {
            ctx.status = 500;
            ctx.body = { error: err instanceof Error ? err.message : 'Sync failed' };
        }
    },
};
