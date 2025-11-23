# Mobile-first Date Range Picker

Custom mobile calendar built with **Next.js 16 (App Router)**, **React 19**, and **TypeScript**. The UI focuses on buttery vertical scrolling, quick range selection, and GH Pages–friendly static export.

## UX Decisions

- **Snap-to-month scroll** – the calendar only shows a single month at a time. Scroll gestures snap to the next/previous month, so the experience feels closer to Tinder/Instagram than a form input.
- **Gesture-friendly tap handling** – pointer capture with a small movement threshold filters out accidental taps while the user scrolls vertically. This fixes the common “calendar stops scrolling when I tap” bug on mobile.
- **Infinite context** – as you reach the top/bottom, new months are appended seamlessly. Current month can be recalled with the “Сегодня” control.
- **Range visualization** – selected nights fill the full-width pill behind the day buttons, while start/end dates animate into elevated chips.
- **GH Pages ready** – `next.config.ts` is tuned for `next export`, images are unoptimized, and a helper deploy script publishes to the `gh-pages` branch.

## Scripts

Install dependencies once:

```bash
yarn install
```

Useful commands:

| Command | Description |
| --- | --- |
| `yarn dev` | Start Next.js in development mode (http://localhost:3000). |
| `yarn lint` | Run ESLint with the Next.js core-web-vitals preset. |
| `yarn typecheck` | Validate TypeScript types without emitting files. |
| `yarn export:static` | Build + `next export` into the `out/` folder (used for GH Pages). |
| `yarn deploy` | Build, add `.nojekyll`, and push `out/` to the `gh-pages` branch. |

## Deploying to GitHub Pages

The deploy script needs to know the repository name to configure the base path. It tries to guess it (`DEPLOY_BASE_PATH` → `NEXT_PUBLIC_BASE_PATH` → `GITHUB_REPOSITORY` → package name), but you can override it explicitly:

```bash
# Example for https://username.github.io/swecor-test-task
DEPLOY_BASE_PATH=swecor-test-task yarn deploy
```

This command will:

1. Set `NEXT_PUBLIC_BASE_PATH` so routes/assets use `/<repo-name>`.
2. Run `next build && next export`.
3. Create `out/.nojekyll`.
4. Publish `out/` to the `gh-pages` branch via [`gh-pages`](https://www.npmjs.com/package/gh-pages).

If you only need the static bundle (for manual upload), run `yarn export:static` and deploy the `out/` folder however you prefer.

## Project Structure

- `src/components/mobile-range-picker.tsx` – high-level screen (hero, summary, controls, calendar).
- `src/components/range-calendar.tsx` – scrollable month view with pointer handling and selection logic.
- `src/lib/calendar.ts` – calendar generation, range helpers, and formatting utilities.
- `scripts/deploy.cjs` – GH Pages deployment helper used by `yarn deploy`.

Enjoy! 💛 Feel free to tweak the styling or the range behavior – the core logic is isolated inside `src/lib/calendar.ts` and `src/components/range-calendar.tsx`.
# swecor-test-task
