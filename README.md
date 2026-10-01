# Constellation Resume

Justin Tang's resume as an interactive star chart. Each job, project, school, and skill group is a named constellation; select one to read the real entry. A plain "Read as scroll" view is available for printing and screen readers.

Live site: https://j-ctang.github.io/constellation-resume/

## Editing content

All resume content lives in `src/sky.config.ts`. Add, remove, or edit entries there; components read it generically. An entry's `id` seeds its star layout, so renaming an id reshapes its constellation.

## Development

```bash
npm install
npm run dev      # http://localhost:5173/constellation-resume/
npm test
npm run lint
npm run build
```

Pushes to `main` deploy to GitHub Pages via `.github/workflows/deploy.yml`.

## Credits

- Visual design adapted from **Asterism — Draw Your Own Sky** by [MiaAI-Lab](https://github.com/MiaAI-Lab/Claude-Opus-5.5-100-HTML-Files).
- Build and deploy configuration derived from [clementbouly/interactive-resume-template](https://github.com/clementbouly/interactive-resume-template) (MIT licensed).
