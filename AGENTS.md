# Repository Guidelines

## Project Structure & Module Organization
- Source: `src/app` with `components`, `algorithms`, `services`, `utils`.
- Entry: `src/main.ts`, app shell in `src/app/app.component.*`.
- Assets: static files in `public/` (bundled) and `src/assets/`.
- Path aliases (from `tsconfig.json`): `@components/*`, `@services/*`, `@utils`, `@algorithms`.
- Example import: `import { SortingService } from '@services/sorting.service';`.

## Build, Test, and Development Commands
- `npm start` — run dev server at `http://localhost:4200` with HMR.
- `npm run build` — production build to `dist/sorting-visualiser/`.
- `npm run watch` — rebuild on file changes (development config).
- `npm test` — run unit tests via Karma/Jasmine.

## Coding Style & Naming Conventions
- Language: TypeScript (strict mode). Avoid `any`; prefer explicit types.
- Angular: Standalone components; prefer inputs/outputs and pure presentation.
- Styles: SCSS is default for new components; keep existing `.css` files unless refactoring.
- Formatting: 2‑space indentation; single quotes; trailing commas where valid.
- Names: files in kebab‑case (`algorithm-card.component.ts`); classes in PascalCase; functions/vars in camelCase.
- Use aliases over relative imports (e.g., `@algorithms` not `../../algorithms`).

## Testing Guidelines
- Framework: Jasmine + Karma. Place tests beside code as `*.spec.ts`.
- Keep tests fast and deterministic; mock DOM/canvas where needed.
- Run `npm test` before pushing. Add specs for new algorithms and components.

## Commit & Pull Request Guidelines
- Prefer Conventional Commits (`feat:`, `fix:`, `refactor:`). Example: `refactor(header): simplify inputs`.
- PRs: include a clear description, linked issues, and screenshots/GIFs for UI changes.
- Keep PRs focused and small; include test updates and note any breaking changes.

## Architecture Notes
- Angular 19 app using signals for UI controls (`SortingService`).
- Sorting algorithms live in `src/app/algorithms/index.ts` with a simple factory (`createAlgorithm`).
- To add an algorithm: implement a class extending `SortingAlgorithm`, export it, and wire it in `createAlgorithm`; then list its key in `AppComponent.algorithms`.
