# shell instructions

This repository owns Library navigation, layout, trusted remote configuration and remote loading. Keep movie-specific UI and domain data in mfe1. Align Angular singleton dependencies through Native Federation. Review remote-loading failures when changing federation or navigation.

## Working rules

Read README.md and best-practices.md before planning, implementing or reviewing changes. Read affected feature/component documentation and the relevant local skill.

Preserve public contracts unless the task changes them explicitly. Document breaking changes and verify affected consumers. Use the installed framework versions; distinguish implemented behavior from recommendations and future work.

Before declaring changes ready to merge, run `npm run check` and review the applicable checklist in best-practices.md. Report commands, results, manual checks and anything that could not run. Do not skip failed checks or weaken rules merely to obtain a passing result.

Prioritize behavioral regressions, contract compatibility, async failures and accessibility during review. Explain findings with a location, triggering scenario and impact. Formatting belongs to Prettier; automated code rules belong to ESLint.

Use the local merge workflow in README.md. There is no CI. Local validation does not enforce merges through other Git commands or GitHub. This instruction requires validation; it does not authorize an agent to commit, merge or push without a user request.

Use [.agents/skills/angular-frontend/SKILL.md](.agents/skills/angular-frontend/SKILL.md) for relevant implementation and review tasks.
