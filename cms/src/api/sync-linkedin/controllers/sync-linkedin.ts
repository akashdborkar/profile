// Types are defined locally to avoid cross-package rootDir violations in Strapi's TS build.
// The runtime sync engine (loaded via dynamic import) enforces the full shape.
interface LinkedInScraperPayload {
  certifications: unknown[]
  featuredPosts: unknown[]
}

interface SyncResult {
  activitiesSynced: number
  certsSynced: number
}

type SyncFn = (data: LinkedInScraperPayload) => Promise<SyncResult>

/**
 * Lazy loader for the sync engine. The `.fn` property is replaceable,
 * which lets tests inject a mock without mocking dynamic imports.
 */
export const syncLoader = {
  fn: null as SyncFn | null,

  async get(): Promise<SyncFn> {
    if (!this.fn) {
      // new Function() prevents TypeScript from statically resolving the cross-package
      // path during CMS compilation (rootDir constraint). At runtime Node.js loads it fine.
      const load = new Function('m', 'return import(m)') as (m: string) => Promise<Record<string, unknown>>
      const mod = await load('../../../../../sync/src/sync-engine.service.js')
      this.fn = mod.syncLinkedInData as SyncFn
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
