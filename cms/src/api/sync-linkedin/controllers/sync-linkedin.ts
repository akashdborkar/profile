import type { LinkedInScraperPayload, SyncResult } from '../../../sync/sync-engine.service'

type SyncFn = (data: LinkedInScraperPayload) => Promise<SyncResult>

/**
 * Lazy loader — `.fn` is replaceable so tests can inject a mock directly
 * without needing to mock the dynamic import.
 */
export const syncLoader = {
  fn: null as SyncFn | null,

  async get(): Promise<SyncFn> {
    if (!this.fn) {
      const mod = await import('../../../sync/sync-engine.service')
      this.fn = (mod as unknown as { syncLinkedInData: SyncFn }).syncLinkedInData
    }
    return this.fn
  },
}

export default {
  async syncLinkedIn(ctx: any) {
    try {
      const syncFn = await syncLoader.get()
      const body = ctx.request.body as Partial<LinkedInScraperPayload>
      const payload: LinkedInScraperPayload = {
        certifications: body?.certifications ?? [],
        featuredPosts: body?.featuredPosts ?? [],
      }
      const result = await syncFn(payload)
      ctx.status = 200
      ctx.body = { success: true, ...result }
    } catch (err) {
      ctx.status = 500
      ctx.body = { error: err instanceof Error ? err.message : 'Sync failed' }
    }
  },
}
