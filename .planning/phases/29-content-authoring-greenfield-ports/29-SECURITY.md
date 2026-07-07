---
phase: 29
slug: content-authoring-greenfield-ports
status: verified
threats_open: 0
threats_total: 30
threats_closed: 30
asvs_level: 1
created: 2026-05-14
audited: 2026-05-14
---

# Phase 29 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.
> Built from PLAN.md threat models (29-01 through 29-07) and verified by gsd-security-auditor on 2026-05-14.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Repo → npm registry | `pnpm add @playwright/test playwright` and other dev-dep installs | Source packages, version pins; supply-chain surface |
| Local FS → ~/Monodex (Obsidian vault) | `blink port stage` reads vault prose for porting | User-authored MDX content with personal frontmatter |
| Repo → committed lint-baseline.txt / lint-final.txt | Static text artifacts | Lint counts, no execution surface |
| Repo → readers via `blink apply` | Artifact bodies (`.artifact.md`) get written into reader's project | Config files, shell scripts, skill markdown |
| Hooks at reader's machine | Shell scripts execute with reader's full privileges | git events trigger hook execution |
| MDX content → `pnpm build` | Velite + Next.js render content into static pages | Frontmatter, body, cross-refs, voice primitives |
| Reader browser → /install/[type]/[slug] | Static read-only route renders frozen artifact JSON | Artifact source content, no user input |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation / Evidence | Status |
|-----------|----------|-----------|-------------|------------------------|--------|
| T-29-01-01 | Tampering | @playwright/test, playwright npm packages | mitigate | Pinned to `^1.59.1` — `apps/blakepetersen.io/package.json:41,47`; pnpm-lock.yaml records resolved versions | closed |
| T-29-01-02 | Information Disclosure | Monodex shortlist (committed to .planning/) | accept | Vault note titles/paths only; notes themselves never committed; Blake reviews | closed |
| T-29-01-03 | DoS | playwright install chromium (~150 MB) | accept | Standard install on local dev machine; CI/Docker handled separately if it ships there | closed |
| T-29-01-04 | Tampering | `.obsidian-port-staging/` leaking into commits | mitigate | `.gitignore:64-65` — `# obsidian port staging directory` + `.obsidian-port-staging` | closed |
| T-29-02-01 | Information Disclosure | Personal Obsidian frontmatter (aliases, vault IDs) leaking into MDX | mitigate | Grep `^aliases:|cssclass:|publish:|vault-id|obsidian-vault://` across `content/**/*.mdx` returns 0; "Obsidian meta (review + delete)" comments returns 0 | closed |
| T-29-02-02 | Tampering | Destructive shell (`rm -rf`, `curl\|sh`) in artifact bodies | mitigate | Grep `rm -rf|curl\|sh|wget\|sh|fork-bomb` across `content/**/*.artifact.md` returns 0 | closed |
| T-29-02-03 | Information Disclosure | Skill entries referencing private endpoints / secrets / PII | mitigate | Grep `sk-|AKIA|ghp_|gho_|xoxb-|BEGIN PRIVATE KEY` across `content/skills/*` returns 0 | closed |
| T-29-02-04 | Spoofing | Wikilink TODO comments masking broken cross-refs | mitigate | Grep `TODO: resolve wikilink` across `content/**/*.mdx` returns 0 | closed |
| T-29-02-05 | Tampering | Spec slug-mismatch silently passing on a 404 page | mitigate | `tests/visual/voice-primitives.spec.ts:25-27` asserts `expect(authorNote).toBeVisible()` BEFORE `toHaveScreenshot` at line 30-33 | closed |
| T-29-02-06 | DoS | First-run snapshot timeout if dev cold-start > 120s | accept | 120s default sufficient for cold start; retry on hit | closed |
| T-29-03-01 | Information Disclosure | Obsidian metadata leaks into `content/skills/` | mitigate | Same grep as T-29-02-01 scoped to skills — clean | closed |
| T-29-03-02 | Tampering | Destructive shell in skill artifacts | mitigate | Same grep as T-29-02-02 scoped to `content/skills/*.artifact.md` — clean | closed |
| T-29-03-03 | Spoofing | Cross-ref to nonexistent skill | mitigate | `validateCrossReferences` in `apps/blakepetersen.io/src/lib/velite-prepare.ts:95-150`; build green per 29-07-SUMMARY.md | closed |
| T-29-03-04 | Tampering | Voice frontmatter ↔ body primitive mismatch | mitigate | Spot-check: `convex-patterns.mdx`, `tmux-power-workflows.mdx` both match; lint-warning-delta.md confirms 100% across 5 skills | closed |
| T-29-04-01 | Tampering | Slug collision with existing entries | mitigate | `tmux-power-workflows`, `tmux-poweruser`, `tmux-popup-workflows` all unique; `uniq -d` across 31 non-post slugs returns empty | closed |
| T-29-04-02 | Tampering | `blink apply` overwrites reader's `~/.config/...` files | accept | Explicit value proposition; opt-in via `blink apply`; `merge: section` for additive layers, `merge: replace` for clean destinations | closed |
| T-29-04-03 | Information Disclosure | Vulnerable devDependency pin in config artifacts | mitigate | `@commitlint/cli ^19.6.0`, `eslint ^9.0.0`, `turbo ^2.5.0`, `typescript ^5.7.0` — current stable; consistent with root `pnpm.overrides`; no overlap with advisories | closed |
| T-29-04-04 | Spoofing | Voice frontmatter declares primitive not invoked in body | mitigate | Spot-check `eslint-flat-config.mdx`, `zed-editor.mdx` — match; lint-warning-delta.md 100% rate | closed |
| T-29-04-05 | Tampering | tmux-popup-workflows duplicates tmux-poweruser content | mitigate | tmux-popup-workflows scoped to `display-popup -E` overlay layer with `dependencies: [configs/tmux-poweruser]`; tmux-poweruser scoped to status-bar/theme/plugins/sessions; tmux-poweruser file unmodified per 29-04-SUMMARY.md | closed |
| T-29-05-01 | Tampering | Destructive shell in hook artifact bodies | mitigate | Grep `rm -rf|curl\|sh|wget\|sh|fork-bomb` across `content/hooks/*.artifact.md` returns 0 | closed |
| T-29-05-02 | Elevation of Privilege | Hook executes with reader's full shell privileges | accept | Inherent contract of git hooks; opt-in via `blink apply`; `# ABOUTME:` two-line headers help audit before applying | closed |
| T-29-05-03 | Tampering | Bad shebang or unportable shell across OSes | mitigate | `sh -n` against all 4 hook artifact bodies passes; husky v9 invokes via `sh` directly so artifacts deliberately omit shebang; bodies use POSIX-portable constructs | closed |
| T-29-05-04 | Spoofing | commit-msg-ai-assist hook hardcodes hijackable AI endpoint | mitigate | `content/hooks/commit-msg-ai-assist.artifact.md:44` — `ai_cmd="${AI_COMMIT_CMD:-claude}"` env-var configurable; no hardcoded URL anywhere in body | closed |
| T-29-05-05 | Tampering | Voice frontmatter ↔ body mismatch in hooks | mitigate | `branch-name-enforcement.mdx` declares `voice: [decision-rationale]`, body invokes `<DecisionRationale>`; lint-warning-delta.md 100% rate | closed |
| T-29-06-01 | Spoofing | External link in guide pointing to malicious URL | mitigate | All external link domains in `content/guides/*.mdx` are canonical: `blakepetersen.io`, `docs.claude.com`, `docs.github.com`, `github.com`, `vercel.com` | closed |
| T-29-06-02 | Spoofing | Broken cross-ref to deferred/cancelled entry in guides | mitigate | `validateCrossReferences` (velite-prepare.ts:95-150) ran clean per 29-07-SUMMARY.md "build green throughout" | closed |
| T-29-06-03 | Tampering | Guide includes `<ArtifactBody>` referencing nonexistent artifact | mitigate | Grep `<ArtifactBody` across `content/guides/*.mdx` returns 0 | closed |
| T-29-06-04 | Information Disclosure | Hardcoded secret or PII in guide code fence | mitigate | Grep `sk-|AKIA|ghp_|password=|api_key=` across `content/guides/*.mdx` returns 0 | closed |
| T-29-06-05 | Tampering | Voice frontmatter ↔ body mismatch in guides | mitigate | All 4 guides declare `voice: [author-note, decision-rationale]` and invoke both primitives (8 invocations across 4 files) | closed |
| T-29-07-01 | Tampering | lint-final.txt counts misreporting actual lint state | mitigate | `lint-baseline.txt` (76 lines, 24/5) and `lint-final.txt` (76 lines, 24/5) consistent; zero net delta | closed |
| T-29-07-02 | Repudiation | DEBT-05 recommendation in warning-delta not traceable to source counts | mitigate | `lint-warning-delta.md:22-26` breaks down 5 warnings (1 LINT-03 zero, 3 LINT-02 orphans, 2 LINT-02 sibling) and 24 pre-existing errors; recommendation at lines 42-56 cites the 20-entry organic-pass sample | closed |
| T-29-07-03 | DoS | Phase ships with perf regression that bites readers/CI | mitigate | `29-07-SUMMARY.md:139-149` "Perf delta" documents fullBuild +2.85%, velite +54.55%, decision: "no caching layer needed" — recorded at checkpoint, all gates PASS | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-29-01 | T-29-01-02 | Monodex shortlist contains vault-note titles/paths only — notes themselves never committed; selection metadata is low-sensitivity | Blake | 2026-05-13 |
| AR-29-02 | T-29-01-03 | Standard playwright chromium download (~150 MB) on local dev machine; CI/Docker context handled separately | Blake | 2026-05-13 |
| AR-29-03 | T-29-02-06 | First-run snapshot 120s timeout sufficient for cold dev start; retry on rare hit | Blake | 2026-05-13 |
| AR-29-04 | T-29-04-02 | `blink apply` overwriting reader's `~/.config/...` files is the explicit product behavior — readers opt in; merge strategies (`section`/`replace`) selected per artifact | Blake | 2026-05-13 |
| AR-29-05 | T-29-05-02 | Hook execution privilege is the inherent contract of git hooks — readers opt in via `blink apply`; mitigation lives in keeping artifacts simple, transparent, and well-commented | Blake | 2026-05-13 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-14 | 30 | 30 | 0 | gsd-security-auditor (sonnet) — initial verification |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-14
