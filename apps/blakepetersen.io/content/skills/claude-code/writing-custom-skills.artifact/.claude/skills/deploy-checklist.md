# Deploy Checklist

Execute a structured deployment process that prevents common mistakes and ensures rollback capability.

## When to Use

Activate this skill before any production deployment. Follow every step in order. Do not skip steps even if they seem unnecessary for a particular release.

## Process

### Phase 1: Pre-Deploy Verification

- [ ] All CI checks pass on the deployment branch
- [ ] No pending dependency security advisories (`npm audit` or equivalent)
- [ ] Database migrations are backward-compatible (can roll back without data loss)
- [ ] Environment variables are set in the target environment
- [ ] Feature flags are configured for gradual rollout if applicable
- [ ] Load testing has been run for performance-sensitive changes

### Phase 2: Prepare the Release

- [ ] Create a tagged release with semantic version bump
- [ ] Generate changelog from conventional commits since last release
- [ ] Notify the team in the deployment channel with a summary of changes
- [ ] Confirm the deployment window avoids peak traffic hours
- [ ] Verify the rollback procedure is documented and tested

### Phase 3: Execute Deployment

- [ ] Deploy to staging environment first
- [ ] Run smoke tests against staging (health check, critical user flows)
- [ ] Verify monitoring dashboards show no anomalies on staging
- [ ] Promote staging build to production (do not rebuild)
- [ ] Watch error rates and latency for the first 15 minutes

### Phase 4: Post-Deploy Verification

- [ ] Health check endpoints return 200
- [ ] Critical user flows work end-to-end (login, core feature, payment if applicable)
- [ ] Error tracking shows no new error spikes
- [ ] Performance metrics are within acceptable thresholds
- [ ] Database connection pool is stable
- [ ] CDN cache invalidation completed if static assets changed

### Phase 5: Finalize

- [ ] Update deployment log with version, timestamp, and deployer
- [ ] Close related tickets and mark the release as complete
- [ ] If issues found, execute rollback procedure and create incident report

## Rollback Procedure

1. Revert to the previous tagged release
2. Run database migration rollback if schema changed
3. Invalidate CDN cache
4. Verify health checks pass on the rolled-back version
5. Notify the team with rollback reason

## Success Criteria

- Every checklist item is explicitly verified, not assumed
- Staging deployment happens before production, always
- Rollback can be executed within 5 minutes
- Post-deploy monitoring runs for at least 15 minutes before marking complete
