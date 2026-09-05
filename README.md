# BrightPath

Teaching web app: a teacher publishes lessons and practice test papers; students
read the lessons, download the materials, and take the papers.

Angular 21 (standalone components, signals, zoneless) deployed to Azure Static
Web Apps. **This repo is the frontend only.** The backend is already deployed and
is consumed purely over HTTPS APIs - you do not need to run, build, or have
access to it.

## Getting started

```bash
npm install
npm start          # http://localhost:4200
```

That's it. `npm start` runs against the **deployed** backend, so there is nothing
else to install and no API to spin up. You get real lessons, real subjects, and
real sign-in immediately.

To see the teacher area at `/teach` you need the `teacher` role on your account:

1. Sign in once on the site so your user record is created.
2. Ask the project owner to grant your account the role (a one-line database
   change - there is no self-service admin screen yet).

Without it, `/teach` redirects to the homepage by design, and the API rejects
writes with 403.

## What you can and can't change here

| | |
|---|---|
| **Yours** | Every page, component, style, route, and copy string. UI, UX, features, SEO metadata, responsive behaviour. |
| **Not in this repo** | The API, database, auth server, and file storage. Need a new field or endpoint? Ask the owner - backend changes are made in the separate eApp solution. |

## Backend endpoints in use

Base URL is `environment.apiBaseUrl`. All calls go through
`src/app/core/services/content.service.ts` - keep them there rather than
injecting `HttpClient` into components.

| Endpoint | Purpose |
|---|---|
| `GET /api/BrightPathSubjects` | subject list / detail |
| `GET /api/BrightPathLessons` | lesson list / detail by slug |
| `GET /api/BrightPathTestPapers` | practice papers, submit answers |
| `POST /api/BrightPathUploads` | upload a file (teacher only) |
| `POST /api/BrightPathUploads/lesson/{id}` | upload and attach to a lesson |
| `DELETE /api/BrightPathUploads/attachment/{id}` | remove an attachment |

Uploads accept PDF, PPT/PPTX, DOC/DOCX and images up to 100MB. Video is **not**
uploaded - lessons take a YouTube/Vimeo embed URL, because the size cap and
Azure's fixed 230-second request timeout make passthrough upload unworkable for
video files.

## Environments

`src/environments/` - swapped by `fileReplacements` in `angular.json`.

| File | Used by | Backend |
|---|---|---|
| `environment.ts` | `npm start` | deployed (default - use this) |
| `environment.prod.ts` | `npm run build` | deployed, analytics on |
| `environment.local-api.ts` | `npm run start:local-api` | `localhost:5001` - owner only, needs the eApp solution running |

## Deploying

The deployment token is a secret, so `swa-cli.config.json` is gitignored and is
**not** in a fresh clone. Create it once:

```bash
cp swa-cli.config.sample.json swa-cli.config.json
```

Then get a deployment token from the Azure Portal (Static Web App -> Overview ->
Manage deployment token) and paste it into that file. Generate your own rather
than reusing someone else's, and never commit it.

```bash
npm run deploy       # build + deploy
npm run deploy:only  # deploy the existing dist/
```

**Always verify the deploy by hash, not by the CLI's success message.** The SWA
CLI can print "deployed" while the old bundle is still being served:

```bash
grep -o 'main-[A-Z0-9]*\.js' dist/brightpath/browser/index.html
curl -sL https://calm-tree-0f5893110.3.azurestaticapps.net/ | grep -o 'main-[A-Z0-9]*\.js'
```

Same hash = deployed. Different = not deployed, whatever the CLI said.

## Conventions worth keeping

- **Routing is `/:lang/...`** (`/en/lessons`). The app is English-only today but
  every route and link goes through `LanguageService.localise()` so a second
  language is a translation file, not a refactor. Don't hardcode `/lessons`.
- **Images go through `imageUrl()`** in `src/app/shared/image-url.ts`. Legacy eApp
  images have `4_`/`12_` size-variant prefixes; files uploaded through BrightPath
  don't. That helper is the only place that knows the difference.
- **Standalone components, signals, `@if`/`@for`.** No NgModules, no `*ngIf`.
- Styles are a custom SCSS design system (`src/styles/`) - there is no UI library,
  so use the existing tokens and `bp-*` classes rather than one-off values.
- Mobile-first. Check 390px and 910px widths before shipping.

## Analytics

Google Tag Manager, sharing the owner's container. Disabled on localhost via
`enableAnalytics: false`, so local browsing never pollutes production stats.
