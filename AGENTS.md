# Repository Guidelines

## Project Overview
An Angular-based sorting algorithm visualizer that renders multiple algorithms side-by-side. Users can control visualization speed and data density and compare behaviors interactively.

## Main Technologies
- Framework: Angular 19
- Language: TypeScript
- Styling: SCSS, Bootstrap
- Build Tooling: Angular CLI via npm scripts

## Project Structure & Module Organization
- Source: `src/app` with `components`, `algorithms`, `services`, `utils`.
- Entry: `src/main.ts`, app shell in `src/app/app.component.*`.
- Assets: static files in `public/` (bundled) and `src/assets/`.
- Path aliases (from `tsconfig.json`): `@components/*`, `@services/*`, `@utils`, `@algorithms`.
- Example import: `import { SortingService } from '@services/sorting.service';`.

## Build, Test, and Development Commands
- `npm start`: Run dev server at `http://localhost:4200` with HMR. (Equivalent to `ng serve`)
- `npm run build`: Production build to `dist/sorting-visualiser/`. (Equivalent to `ng build`)
- `npm run watch`: Rebuild on file changes using development config. (Equivalent to `ng build --watch --configuration development`)
- `npm test`: Run unit tests via Karma/Jasmine. (Equivalent to `ng test`)

## Architecture Notes
- State & controls: Signals via `SortingService` for speed, size/density, and control synchronization.
- Algorithms: Implementations live in `src/app/algorithms/index.ts` with a simple factory `createAlgorithm` that selects an algorithm by key.
- Components:
  - `src/app/components/algorithm-card/algorithm-card.component.*`: Renders a single algorithm visualization.
  - `src/app/components/header/header.component.*`: Hosts global controls (speed, density, regenerate, start/stop).
- Services: `src/app/services/sorting.service.ts` holds shared UI state and orchestration.
- To add an algorithm: implement a class extending `SortingAlgorithm`, export it in `src/app/algorithms/index.ts`, wire it in `createAlgorithm`, then list its key in `AppComponent.algorithms`.

## Coding Style & Naming Conventions
- TypeScript: Strict mode; avoid `any`; use explicit types.
- Angular: Standalone components; prefer Inputs/Outputs; aim for pure presentation.
- Styles: SCSS by default for new components; keep existing `.css` unless refactoring intentionally.
- Formatting: 2‑space indentation; single quotes; trailing commas where valid.
- Naming: Files in kebab‑case (e.g., `algorithm-card.component.ts`); classes in PascalCase; functions/vars in camelCase.
- Imports: Prefer path aliases over relative paths (e.g., `@algorithms` not `../../algorithms`).

## Testing Guidelines
- Framework: Jasmine + Karma; place tests beside code as `*.spec.ts`.
- Tests: Keep fast and deterministic; mock DOM/canvas where appropriate.
- Coverage: Add specs for new algorithms and components.
- CI habit: Run `npm test` before pushing.

## Commit & Pull Request Guidelines
- Conventional Commits: Use `feat:`, `fix:`, `refactor:`, etc. Example: `refactor(header): simplify inputs`.
- PRs: Clear description, linked issues, and screenshots/GIFs for UI changes.
- Scope: Keep changes focused and small; include updated tests and call out any breaking changes.

## Notes for New Contributors
- Local dev: `npm start` then open `http://localhost:4200`.
- Where to begin: `src/app/app.component.ts` for app shell, `src/app/services/sorting.service.ts` for shared UI state, and `src/app/algorithms/index.ts` for algorithm entries.
