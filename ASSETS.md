# Asset and dependency inventory

The supplied love video and four family PNGs are mapped in [CHAPTERS.md](CHAPTERS.md). They are used directly or as resize/encoding derivatives, with no generated replacements or edits to people. Originals remain unchanged.

This is a provenance inventory, not a blanket assertion that every resource is cleared for commercial template redistribution.

| Resource | Source | Recorded license / status |
| --- | --- | --- |
| Four original videos, JN PNG logo | Supplied by the project owner in `public/` | Ownership, third-party rights and resale permissions were not supplied or independently verified. Originals remain unchanged. |
| MP4 derivatives and WebP posters | Derived from those supplied videos | Same unresolved source-rights status; encoding does not establish new clearance. |
| `jn-sketch.svg`, app icon | Code-drawn trace of supplied JN mark | Depends on rights to the supplied mark. |
| `media/cloud-bank.webp` | Generated with the built-in image tool on 2026-10-24, using the walking still as style reference | AI-generated asset, optimized with alpha preserved. No stock cloud pack used. Applicable service terms and reference-asset rights must be reviewed before resale; no exclusive or blanket commercial rights are asserted here. |
| `app/opengraph-image.png` | Browser-rendered typography composition using local fonts and the JN SVG | Inherits font and logo source conditions. Regenerate with `scripts/create-social-preview.mjs`. |
| Caveat, Knewave | Google Fonts repository, `ofl/caveat`, `ofl/knewave` | SIL Open Font License 1.1; local copies in `public/fonts/*-OFL.txt`. |
| Permanent Marker | Google Fonts repository, `apache/permanentmarker` | Apache 2.0; local copy in `public/fonts/permanentmarker-LICENSE.txt`. |
| Next.js, React, React DOM | Installed npm packages | MIT; retain package notices and inspect exact locked versions before distribution. |
| Playwright | Installed npm dev dependency | Apache 2.0; test tooling, not part of the browser bundle. |

No Three.js, external analytics, remote font CDN, paid asset pack or third-party project screenshot was added. `package-lock.json` records dependency versions; package license files remain in `node_modules` after installation.

The generated cloud original remains at the image tool's output location. The complete runtime asset is copied into this project; the site has no dependency on that external local path.

Animate UI, Motion, Zod, react-markdown, remark-gfm and Sharp are recorded in package-lock.json. The four initial reading pages extend only the themes supplied in the original brief; they are editable opening chapters, not claims of additional life events.

Patrick Hand and Pangolin are now the locally hosted Vietnamese interface fonts, obtained from the Google Fonts repository (ofl/patrickhand and ofl/pangolin). Both include OFL license files in public/fonts; complete Vietnamese glyph coverage was checked from their font character maps.
