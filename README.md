# Library shell

Angular 22 host for Library, using Native Federation. Owns navigation, layout and remote loading; movie screens and domain data belong to mfe1.

## Setup and development

Requires Node.js compatible with Angular 22 (22.22.3 or newer in the Node 22 line). Use a supported Node release and npm with the committed lockfile.

Build the sibling library first, then install/start mfe1 on port 4201. In this repository:

The local `auth-contracts` dependency must be built before installation. From
`auth-contracts/`, run `npm ci` and `npm run check` to generate its `dist` files.

```sh
npm ci
npm start
```

The host runs at http://localhost:4200. Development remotes are configured in public/federation.manifest.json; use trusted environment-specific URLs for deployment. Start mfe1 before opening its routes through the host.

## Architecture

- src/federation.ts initializes the federation manifest; src/main.ts then bootstraps Angular.
- src/app/app.routes.ts loads the remote routes. Keep host navigation compatible with independently deployed remotes.
- federation.config.mjs deliberately shares Angular singleton dependencies. The shell does not depend on the web-components library.
- src/styles.css loads Bootstrap and shared styles from src/styles/ once. Global styles do not cross custom-element Shadow DOM.

Remote initialization errors are currently logged; no complete user-facing recovery flow is implemented. Review failure/fallback behavior when modifying remote loading.

## Simulated authentication

`/login` accepts a non-empty display name without a password. The shell provides
`AUTH_SERVICE` with `useExisting: SimulatedAuthService`, owning a read-only user
signal. Sign out in the header clears that signal; Movies in mfe1 observes the
same session immediately. State is in memory and resets when the page reloads.
Home (`/dashboard`), Movies and movie child routes require a session. Signed-out
navigation redirects to `/login`, and signing in returns to the requested page.
Signing out redirects to login and removes the protected screen. The shell's
guard runs before loading remote routes; the remote guards protect its screens
when it runs independently too. Backend authentication remains outside this demo.

The sibling `auth-contracts` package owns the token and TypeScript contract.
Both applications share it as a federation singleton with matching version
`0.1.0`. Keep that folder next to shell and mfe1 before running `npm ci`.
Project npm configuration uses `install-links=true` to install the local package
inside each application's node_modules, where its Angular peer can be resolved.
After editing the contract, run its `npm run check`, reinstall it in both applications and restart both
development servers so their federation metadata is regenerated.

To verify integration, start mfe1 and shell, open `/login` on port 4200, sign in
as Ana, then open Movies. Both header and Movies must show Ana. Click Sign out
while on Movies: the application must return to login and remove Movies. Try a
direct visit to `/dashboard`, `/movies` and `/movies/edit` while signed out; all
must redirect to login. Sign in again to return to the requested screen. Reload
to verify the simulated session resets. Repeat on port 4201 to verify standalone
login and protected navigation with the remote's development provider.

## Validation and local merges

```sh
npm run lint
npm run format:check
npm run test:unit
npm run check
```

`check` runs lint, format checking, unit tests without watch, tests of the merge script in temporary repositories, and a production build; the library also checks TypeScript and requires a test file per component. ESLint uses type-aware TypeScript rules; Angular repositories also lint inline/external templates and template accessibility. Formatting is checked separately with Prettier. Use `npm run format` to apply formatting deliberately.

Complete the applicable review checklist in [best-practices.md](best-practices.md) before merging. Automated checks do not certify architecture, usability or accessibility. Browser integration and keyboard/zoom/screen-reader checks are manual today; there is no automated e2e command.

From a clean `main` branch, after reviewing the feature:

```sh
npm run merge:main -- feature/my-change
```

This only accepts a local branch, prepares a merge with `--no-ff --no-commit`, validates the combined result, and commits locally only if checks pass. It does not push. If checks fail or conflicts occur, the merge stays uncommitted. Resolve and stage intended changes, then run:

```sh
npm run merge:main -- --continue
```

Or abort with `git merge --abort`. Failed commit hooks can also be corrected before continuing. Checks are repeated on every continuation; unstaged/untracked changes prevent completion. There is no CI or server-side merge enforcement. Other Git commands and GitHub can bypass this local flow; a pre-merge hook alone does not cover every merge mode.

When a library contract changes, validate web-components and its mfe1 consumer. When federation or routes change, verify navigation through shell in a browser. Do not merge other repositories automatically as part of a check.

## Agent guidance

Read [AGENTS.md](AGENTS.md), [best-practices.md](best-practices.md) and [angular-frontend](.agents/skills/angular-frontend/SKILL.md). Each repository keeps its own instructions so it can be used independently.

Tooling references: [angular-eslint](https://github.com/angular-eslint/angular-eslint), [type-aware linting](https://typescript-eslint.io/getting-started/typed-linting/) and [Git hooks](https://git-scm.com/docs/githooks).
