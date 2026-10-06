---
name: angular-frontend
description: Implement and review Angular routes, components, services and custom-element integrations in this host or microfrontend repository.
---

Read AGENTS.md, best-practices.md and README.md. Determine host/remote ownership before choosing where code belongs.

Use the installed Angular 22 APIs and strict compiler settings. Review state ownership, async errors, route contracts and subscription cleanup. MoviesService is an in-memory mock; a GET stored in a signal does not automatically react to later mutations.

For custom elements, verify explicit registration, complex property bindings, typed events and a schema scoped to the consuming component. Do not depend on shadow-root internals or imports from another repository's source.

Test observable changes and relevant failures. For federation or navigation changes, verify the remote independently and through shell. Browser checks are manual unless an actual executable test is added.

Run npm run check and report evidence. Apply the relevant manual accessibility and architecture checklist; never describe lint as proving complete best-practice compliance. The merge script is a local workflow, not remote protection or permission to merge.
