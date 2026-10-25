# Supplied media

The new love clip, mobile framing, encoding checks, family image mapping and reproduction script are documented in [CHAPTERS.md](CHAPTERS.md).

Originals in `public/` are preserved. Visual contact sheets and browser captures are in `artifacts/`.

| Source suffix | Scene | Container duration | Dimensions | Content verified visually |
| --- | --- | --- | --- | --- |
| F37C29AE.mov | Walking alone | 8.27 s | 1280 × 720 | Hooded figure walking through clouds, pale background |
| 61CF4A4C.mp4 | Reaching out | 10.01 s | 1280 × 720 | Hands enter, reach at 2–4 s, right hand changes to a raised middle finger around 4.5 s, hands leave near 9–10 s; warm paper |
| 9A5EC2D2.mp4 | The noise within | 10.01 s | 1280 × 720 | Curled-up figure stays still while surrounding graphite marks move |
| 9D528D2D.mp4 | Becoming | 10.01 s | 1280 × 720 | Wilted monochrome flower, recovery and color around the middle, full yellow bloom and green foliage |

All originals have audio; web derivatives omit it. OpenCV reported misleading MOV frame-count timing (~11 s); FFmpeg container timing and browser decoded duration confirm ~8.3 s. Web files use H.264, yuv420p, 24 fps, original 720p dimensions, CRF 18 and faststart. Scrub clips have a keyframe every six frames (250 ms); ambient clips every 48 frames. No subject cropping or color desaturation is applied. CSS feathers the perimeter only; no blend mode is applied to the sunflower.

SSIM against decoded original frames: trust **0.996247**, bloom **0.997625**. Derivative sizes: walk 2.13 MB, trust 3.68 MB, noise 2.28 MB, bloom 3.00 MB. Short GOPs trade additional bytes for predictable seeking.

Posters are extracted from the actual supplied videos. Start-frame posters for Trust and Becoming prevent premature action/color while scrub videos load; static reading mode uses representative stills. Logo SVG traces the provided JN silhouette with graphite hatch fills.

The cloud transition uses a new AI-generated alpha texture, with the walking poster used only as its visual reference. `public/media/cloud-bank.webp` is 1400 × 788, approximately 214 KB. Three CSS layers use one shared resource. Transform and opacity depend only on scroll; no canvas, WebGL or continuous render loop is used. If the texture cannot load, normal sequential scenes remain available. See [ASSETS.md](ASSETS.md) for provenance and rights status.

Fonts are locally hosted from the Google Fonts repository: Caveat (SIL OFL), Permanent Marker (Apache 2.0), Knewave (SIL OFL). License files accompany them in `public/fonts/`. Knewave provides the closing brush lettering as selectable, semantic text.

To regenerate derivatives and fonts: install Python `imageio-ffmpeg`, `opencv-python`, and `Pillow`, then run `python scripts/prepare-media.py`. Runtime and normal builds do not require Python or FFmpeg.
