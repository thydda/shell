# Library shell

Angular 22 host for Library, using Native Federation. Owns navigation, layout and remote loading; movie screens and domain data belong to mfe1.

## Setup and development

Requires Node.js compatible with Angular 22 (22.22.3 or newer in the Node 22 line). Use a supported Node release and npm with the committed lockfile.

Install the published `@thydda` packages from GitHub Packages. Configure
`@thydda:registry=https://npm.pkg.github.com` in `.npmrc` and authenticate with
package read access before installing:

```sh
npm login --scope=@thydda --registry=https://npm.pkg.github.com --auth-type=legacy
npm ci
npm start
```

The shell consumes `@thydda/auth-contracts@0.1.0` and
`@thydda/movies-cart@0.1.1`. Sibling package source folders are not required to
install these releases. Publish and install new versions to consume library
changes, then restart development servers to regenerate federation artifacts.

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

The published `@thydda/auth-contracts` package owns the token and TypeScript
contract. Both applications share it as a federation singleton with matching
version `0.1.0` so the injected token has the same identity.

To verify integration, start mfe1 and shell, open `/login` on port 4200, sign in
as Ana, then open Movies. Both header and Movies must show Ana. Click Sign out
while on Movies: the application must return to login and remove Movies. Try a
direct visit to `/dashboard`, `/movies` and `/movies/edit` while signed out; all
must redirect to login. Sign in again to return to the requested screen. Reload
to verify the simulated session resets. Repeat on port 4201 to verify standalone
login and protected navigation with the remote's development provider.

## Shared movie cart in the header

The signed-in header displays `Cart (0)` and updates the count using
`Store.selectSignal(cartSelectors.selectCount)` from `@thydda/movies-cart`.
The shell registers `provideStore()` and
`provideState({ name: cartFeatureKey, reducer: cartReducer })` at startup, before
movie routes load. Movie selection in the remote dispatches the package's actions
against that same Store. The header does not maintain a second copy of cart state.

Keep compatible singleton Angular and `@ngrx/store` dependencies and matching
movie cart contracts across shell and remote. The remote's standalone
`app.config.ts` does not execute when hosted; the shell owns the hosted cart
registration. Separate application tabs have independent in-memory state.

The indicator is hidden while signed out. Signing out does not clear cart data;
signing back in shows its current count. Reloading resets the cart. The indicator
is currently text, not a checkout link or a cart details screen.

Development builds enable NgRx instrumentation through `provideStoreDevtools`.
Use the Redux DevTools browser extension to inspect actions and state changes.

Unit tests register the real shared cart reducer and verify empty, added and
removed counts plus visibility across login/logout. To verify hosted behavior,
start shell and mfe1, sign in, select/unselect movies and check the count. Navigate
to Home and back to verify retained selection, then reload to verify the reset.
This browser flow is manual and is not covered by the shell unit tests.

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
