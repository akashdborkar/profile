export default {
  routes: [
    {
      method: 'POST',
      path: '/sync-linkedin',
      handler: 'api::sync-linkedin.sync-linkedin.syncLinkedIn',
      config: {
        // Token validated by the policy below — no JWT auth needed
        auth: false,
        policies: ['api::sync-linkedin.verify-sync-token'],
      },
    },
  ],
}
