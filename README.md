# JN — A story, still unfolding

Latest addition: [Love and family chapters](CHAPTERS.md), including the supplied scrub video and interactive four-photo album. Run `npm run test:family` against the local server to check these chapters.

A personal storytelling and reading website in **jn-product-x0912**. Nothing has been deployed. The interface is Vietnamese. See [MOTION-VI.md](MOTION-VI.md) for the latest chapter, thread, fog and localization changes.

## Run locally

Use Node.js **24.12+** (native SQLite and TypeScript support), or a compatible newer version. Tests here ran on Node 26.1 and Chrome on Windows.

```sh
npm ci
npm run admin:setup
npm run dev
```

Open the URL printed by Next.js (normally http://localhost:3000). The setup command privately prompts for an email and a password of at least 14 characters; there is no default account or public registration. Sign in at `/admin/login`. Running setup again can reset the admin and invalidate all sessions after an explicit REPLACE confirmation. It never stores a plaintext password.

## Reading and writing

- `/`: original four video scenes, scroll-driven text, graphite clouds, expandable margin notes, thematic reading links and a live reading-room index. The closing statement remains typography only.
- `/stories`: published stories, search by title/introduction, theme filters and pagination.
- `/stories/[slug]`: Markdown article, section links, related reading, text size, local bookmark, sharing and an optional resume prompt. Reading preferences are saved on the current device only.
- `/admin`: write or import `.md`/`.txt`, upload cover/inline images, preview, save drafts, publish, unpublish, archive and restore. Concurrent changes produce a conflict instead of overwriting another edit.

Four editable opening pages expand the themes in the supplied brief. They are labelled as part of the opening story; no extra life events or client projects are invented. Edit or archive these through the writing desk. New stories appear automatically in the reading room.

Animate UI supplies Fade reveals, button feedback and shared motion tokens; the mobile menu uses its menu timing. The original video scrubbing remains directly scroll-driven. Reduced motion shows static, unpinned scenes with every line visible. Server-rendered reading content remains available without JavaScript. Video errors retain posters and release sticky scenes. Original media files remain unchanged; see MEDIA.md.

## Persistent data and production configuration

This backend uses Next.js Route Handlers and native SQLite, with uploads on disk. It targets **one Node service with persistent local storage**. An ephemeral/serverless filesystem or multiple independent replicas requires a different database/object-storage adapter.

Copy `.env.example` to `.env.local` and configure:

- `DATA_DIR`: absolute persistent writable directory (default `./data`). Contains `journal.sqlite`, WAL files and `uploads/`.
- `SITE_URL`: exact public **HTTPS origin**, required for production admin mutations and canonical metadata.
- `BACKUP_DIR`: private backup location, default `./backups`.

```sh
npm run build
npm start
```

Place the service behind an HTTPS reverse proxy. Sessions are opaque, hashed in the database, HTTP-only, SameSite Strict and Secure in production, expiring after eight hours. Mutations verify Origin and authentication. Login has a shared attempt limit. Markdown HTML is disabled; upload types/signatures, sizes and decoded dimensions are checked, and accepted images are re-encoded to WebP with metadata removed. Draft-only uploaded images are not publicly served. Security headers are set in next.config.ts.

Dockerfile and compose.yaml provide a non-root standalone Node service with persistent data/backup volumes and loopback-only port binding. They have not been executed: the Docker Linux daemon is unavailable in this environment. When using Docker, initialize the account with `docker compose exec journal node scripts/admin-setup.mjs`. Configure TLS/proxy and SITE_URL before use. No container, remote service or domain has been deployed.

## Backup and restore

```sh
npm run backup
```

This uses SQLite's online backup API and copies uploads into a timestamped private directory. Avoid concurrent publishing/uploading during backup for a consistent database-plus-media snapshot. Keep an off-host copy. Restore with the service stopped: preserve the current data directory, then copy the backup's `journal.sqlite` and `uploads/` into a fresh DATA_DIR (do not carry old WAL/SHM files over). Start with the same environment and verify the reading room and admin. Backup creation and SQLite integrity were checked locally; infrastructure disaster recovery remains deployment-specific.

## Checks and main files

```sh
npm run lint
npm run build
npm run test:journal
# In another terminal: npm run dev -- --port 3012
npm run test:story
```

Journal tests start an isolated server on 3014 and use a separate disposable database under artifacts; they never create a real admin account. Both suites use installed Chrome via Playwright. Story tests accept TEST_URL and CHROME_PATH overrides.

Checks cover 390, 768 and 1440px; scroll seeking forward/backward/rapid/idle; navigation and reload synchronization; reduced motion; no-JavaScript reading; video/texture failure; keyboard navigation; draft and upload privacy; publishing lifecycle; stale-edit rejection; unsafe Markdown; origin protection and login limits. Screenshots and results are in ignored `artifacts/`. Physical iPhone/Safari, real TLS hosting, email recovery and load testing are not verified; recovery uses the local setup command, not an email service.

| Area | Files |
| --- | --- |
| Story, scene copy and media | app/story.tsx, app/content.ts, app/use-story-motion.ts |
| Reading and administration | app/stories/, app/admin/, app/api/admin/ |
| Storage, authentication and validation | lib/ |
| Motion primitives | app/components/motion-system.tsx |
| Visual styles | app/globals.css, app/theme.css, app/journey.css, app/reading.css |
| Assets and encoding | ASSETS.md, MEDIA.md |


### Motion implementation note

Animate UI path C, subtle level: catalog Fade + Button, transition.reveal / transition.swap, spring.press, and the 220ms menu ease-out token. Native disclosure content remains immediately available; no stagger delays reading or keyboard focus. Browser checks include reverse/idle scroll, menu keyboard use and reduced motion. Deliberate style exceptions: strict reduced motion removes fades too (the original accessibility brief), while video and cloud progress remain direct scroll mappings rather than time-based springs. Type checking passed before integration and in the final production build.
