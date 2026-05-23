import type { LinkedInScraperPayload, SyncResult } from '../../../../../sync/src/sync-engine.service'

type SyncFn = (data: LinkedInScraperPayload) => Promise<SyncResult>

/**
 * Lazy loader for the sync engine. The `.fn` property is replaceable,
 * which lets tests inject a mock without mocking dynamic imports.
 */
export const syncLoader = {
  fn: null as SyncFn | null,

  async get(): Promise<SyncFn> {
    if (!this.fn) {
      // Dynamic import bridges the CJS (CMS) → ESM (sync/) boundary at runtime
      const mod = await import('../../../../../sync/src/sync-engine.service.js')
      this.fn = mod.syncLinkedInData
    }
    return this.fn
  },
}

export default {
  async syncLinkedIn(ctx: any) {
    try {
      const syncFn = await syncLoader.get()
      const result = await syncFn(ctx.request.body as LinkedInScraperPayload)
      ctx.status = 200
      ctx.body = { success: true, ...result }
    } catch (err) {
      ctx.status = 500
      ctx.body = { error: err instanceof Error ? err.message : 'Sync failed' }
    }
  },
}
