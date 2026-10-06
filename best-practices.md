# Angular best practices

## TypeScript and components

- Keep strict TypeScript and strict template checks enabled. Prefer inference; use unknown instead of any and handle asynchronous failures.
- Use standalone components with focused imports. Follow the installed Angular 22 defaults rather than adding redundant standalone or change-detection settings.
- Prefer inject(), input() and output() for new code. Use model() only for intentional two-way state, and host metadata for host bindings/listeners.
- Keep components focused. Prefer inline templates/styles here; keep shared styles under src/styles/. For external files, use paths relative to the component.
- Use signals for local state, computed() for derivations and linkedSignal() only when writable derived state is needed. Keep transformations predictable and update state with set()/update().
- Choose initialization according to dependencies: ngOnInit is appropriate for initial view-independent requests; view-dependent work needs the appropriate lifecycle. Clean up subscriptions with takeUntilDestroyed where appropriate.
- An Observable does not automatically update a separate signal. After mutations, refresh the query or update a deliberately shared state source.
- Use @Service for automatic service registration when appropriate in this Angular version. Use @Injectable with explicit providers when scoped or configured provisioning is required.
- Prefer Signal Forms for new forms when suitable for the installed version; Reactive Forms remain appropriate for existing integrations. Avoid mixing form paradigms without a reason.

## Templates and integration

- Prefer native control flow and direct class/style bindings. Import only needed pipes/directives. Keep complex logic outside templates.
- Use the async pipe when consuming streams directly in templates; use explicit subscriptions when updating owned state.
- Apply Angular image tooling where appropriate in Angular templates. Angular directives do not apply inside a custom element's Shadow DOM.
- Register custom elements before rendering; scope CUSTOM_ELEMENTS_SCHEMA to consuming components. Bind complex data as properties and consume documented typed CustomEvents.
- Lazy-load feature routes and preserve public remote contracts. Do not import other repositories' internal source files.
- Share singleton framework dependencies deliberately and keep versions compatible. Do not implicitly share domain state between host and remote.
- Treat remote URLs as trusted environment configuration. Review loading, failure and fallback behavior; do not claim a fallback exists without implementing it.
- Guard browser-only APIs when supporting SSR. Browser-global guards alone do not prove hydration or SSR correctness.

## Styles and accessibility

- Load Bootstrap once through src/styles.css before application styles. Preserve Angular style encapsulation and do not introduce ::ng-deep.
- Keep tokens, typography, layout and shared controls in focused stylesheets. Add files only when actual shared rules exist; avoid duplicate imports and competing tokens.
- Prefer established Bootstrap classes, short scoped selectors and logical properties. Avoid !important unless a narrow external constraint is documented.
- Use responsive Grid/Flexbox and content-driven dimensions. Avoid clipped text and fixed heights for text containers. Respect reduced motion and preserve visible focus.
- Meet applicable WCAG A/AA requirements: semantic controls, accessible names/errors, keyboard operation, focus, contrast and text alternatives.
- Check affected flows at narrow widths and enlarged text, with keyboard navigation and relevant screen-reader behavior. Run axe when a reproducible browser check is available; automated checks alone do not prove conformance.

## Before merge: review checklist

Run npm run check (lint, format, unit tests and production build). Review these items where the change affects them:

- State ownership, subscription cleanup and loading/empty/error behavior.
- Route and public contract compatibility, shared runtimes and independently runnable remotes.
- Accessible names, keyboard focus, zoom/reflow and responsive behavior.
- Meaningful tests for changed behavior and relevant failure paths, rather than assertions that copy implementation.
- Browser integration through shell when federation, routes or custom-element contracts change.

Record evidence and checks that could not run. Browser checks are currently manual; no automated e2e command or CI is configured. Do not describe this checklist as fully enforced by ESLint.

## Repository responsibility

This repository owns Library navigation, layout, trusted remote configuration and remote loading. Keep movie-specific UI and domain data in mfe1. Align Angular singleton dependencies through Native Federation. Review remote-loading failures when changing federation or navigation.
