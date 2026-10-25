"""Reproduce only the new chapters' derivatives; preserve supplied originals."""
from pathlib import Path
import subprocess
from PIL import Image
import imageio_ffmpeg

PUBLIC = Path(__file__).resolve().parents[1] / 'public'
OUT = PUBLIC / 'media'
PHOTOS = {
    'home': 'd9371ef0-545a-4181-8207-bac1175a6b12',
    'mums-side': '3bab7d7f-e10a-4b9a-80b6-8e39e60b9f86',
    'growing-up': '2ceea3e0-3e54-4bf9-9075-b64ff69ca8cc',
    'dads-side': '1ed7e378-0f4d-47a3-890a-c504acf8b2d0',
}
(OUT / 'family').mkdir(exist_ok=True)
for name, source in PHOTOS.items():
    image = Image.open(PUBLIC / (source + '.png')).convert('RGB')
    for width, quality in [(640, 88), (960, 91)]:
        image.resize((width, width * 3 // 4), Image.Resampling.LANCZOS).save(
            OUT / 'family' / f'{name}-{width}.webp', quality=quality, method=6)

ff = imageio_ffmpeg.get_ffmpeg_exe()
source = str(PUBLIC / 'gemini_generated_video_4d06bcf4.mp4')
for name, crop in [('love', None), ('love-mobile', 'crop=680:720:240:0')]:
    filters = ','.join(filter(None, [crop, 'fps=24']))
    subprocess.run([ff, '-hide_banner', '-loglevel', 'error', '-y', '-i', source,
                    '-an', '-vf', filters, '-c:v', 'libx264', '-preset', 'medium',
                    '-crf', '18', '-pix_fmt', 'yuv420p', '-g', '6', '-keyint_min',
                    '6', '-sc_threshold', '0', '-movflags', '+faststart',
                    str(OUT / (name + '.mp4'))], check=True)
    for seconds, suffix in [(0, '-start'), (7, '')]:
        command = [ff, '-hide_banner', '-loglevel', 'error', '-y', '-ss', str(seconds), '-i', source]
        if crop:
            command += ['-vf', crop]
        subprocess.run(command + ['-frames:v', '1', str(OUT / (name + suffix + '.webp'))], check=True)
