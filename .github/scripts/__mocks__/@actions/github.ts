// ABOUTME: Jest manual mock for @actions/github.
// ABOUTME: Provides stub context for GitHub Actions event payload.

export const context = {
  repo: { owner: 'test-owner', repo: 'test-repo' },
  payload: {
    pull_request: {
      number: 1,
      title: 'Test PR',
      body: 'Test body',
      labels: [],
      head: { repo: { fork: false } },
    },
  },
};
