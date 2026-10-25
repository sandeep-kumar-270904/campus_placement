# PLACEearly Project & Git Workflow Guidelines

## 1. Frequent & Beautiful Git Commits (CRITICAL MANDATE)
- **Make Time-to-Time Commits**: Immediately after completing a new feature, fixing a bug, updating tests, or finishing a logical milestone, make a clean, atomic git commit.
- **Continuous Commit Cadence**: Never accumulate uncommitted code across multiple unrelated tasks. Keep working tree clean and progression traceable.
- **Commit Message Standard**:
  - `feat(<scope>): <concise descriptive message>`
  - `fix(<scope>): <concise descriptive message>`
  - `docs(<scope>): <concise descriptive message>`
  - `test(<scope>): <concise descriptive message>`
  - `refactor(<scope>): <concise descriptive message>`
- **Timely Pushing to GitHub**: Frequently push committed milestones directly to GitHub (`git push origin <branch>`) so remote repository history stays in sync, backup is secured, and team visibility is immediate.
- **Clear Commit History**: Maintain a beautifully visible repository history that makes debugging, audit trails, and progress reviews effortless.

---

## 2. Platform Engineering Standards
- **Zero Mock / Dead Code in Finished Pages**: Every page must be powered by live APIs, real MongoDB persistence, proper validation, and responsive feedback (loading, empty, error states).
- **Dark-First Responsive Design**: Uniform dark UI palette (`slate-950`, `slate-900`, with `emerald` / `sky` highlights), tested down to 360px mobile viewports.
- **Strict Multi-Tenant & RBAC Isolation**:
  - Gated by `permissions.js` and `requirePermission` middleware.
  - Department Coordinators are strictly isolated to students of their assigned department via `requireDeptScope`.
  - Refresh tokens rotated with reuse detection family invalidation.
- **Automated Verification**:
  - Run `npm test` in `server` and verify all tests pass prior to committing.
  - Run `npm run build` and `npm run lint` in `client` to guarantee zero syntax or bundling errors.
