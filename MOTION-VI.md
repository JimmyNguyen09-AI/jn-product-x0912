# Story motion and video fog

The decorative graphite thread and the quiet-pause section have been removed throughout the website at the author's request.

The six chapters, scroll-controlled videos, family album, cloud transition and walking-video loop fog remain active. See CHAPTERS.md for the love and family scenes.

- app/video-fog.ts defines loop fog timing: lead 0.85 seconds, hold 0.12 seconds and clear 0.7 seconds.
- app/story-details.css styles the loop fog and the remaining NewPages section.
- app/use-story-motion.ts controls scroll seeking and visible ambient playback without a decorative thread timeline.
- Reduced motion uses static posters and readable text; the fog is hidden.

Run npm run test:story and npm run test:family against the local server. Both accept TEST_URL. The obsolete thread test command has been removed.
