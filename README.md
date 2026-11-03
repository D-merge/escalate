# Escalate

Personal workout tracker. Installs on Android as an app (PWA), works offline, and keeps all data on your phone. No accounts, no servers, no AI, no cost.

## Put it on your phone
1. Create a GitHub repo (public — Pages is free for public repos) and push this folder to the `main` branch.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The "Deploy to GitHub Pages" action runs on each push. When it's green, open `https://<your-username>.github.io/<repo-name>/` in Chrome on your phone.
4. Chrome menu (⋮) → **Install app** / **Add to Home screen**.

If the repo is named `<your-username>.github.io`, change `BASE_PATH` in `.github/workflows/deploy.yml` to `/`.

## Your data
Stored in the browser's IndexedDB for that exact URL. Changing the URL (or clearing site data / uninstalling) gives you an empty app. **Profile → Export backup** regularly (the app nudges you); **Import backup** restores it, including on a new URL or phone.

## Edit the programme
Exercises, templates, goals and class rotation live in `src/program.js`. Progression rules (weight increases, easing, chin-up sets) are in `src/engine.js` (`prescribeExercise`). Quotes: `src/quotes.js`.

## Develop
```
npm install
npm run dev
npm run build   # set BASE_PATH=/repo-name/ for Pages
```
