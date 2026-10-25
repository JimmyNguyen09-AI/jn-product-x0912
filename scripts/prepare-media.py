"""Derive web media without modifying supplied originals. Requires imageio-ffmpeg, Pillow, OpenCV."""
from pathlib import Path
import subprocess, urllib.request, cv2
import imageio_ffmpeg
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'media'
OUT.mkdir(exist_ok=True)
FF = imageio_ffmpeg.get_ffmpeg_exe()
clips = [('walk', 'F37C29AE.mov', False, 1), ('trust', '61CF4A4C.mp4', True, 2.6), ('noise', '9A5EC2D2.mp4', False, 3), ('bloom', '9D528D2D.mp4', True, 9.5)]
for name, source, scrub, poster in clips:
    original = ROOT / 'public' / ('gemini_generated_video_' + source)
    subprocess.run([FF, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(original), '-an', '-vf', 'fps=24', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-g', '6' if scrub else '48', '-keyint_min', '6' if scrub else '48', '-sc_threshold', '0', '-movflags', '+faststart', str(OUT / (name + '.mp4'))], check=True)
    subprocess.run([FF, '-hide_banner', '-loglevel', 'error', '-y', '-ss', str(poster), '-i', str(original), '-frames:v', '1', str(OUT / (name + '.webp'))], check=True)
    if scrub:
        subprocess.run([FF, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(original), '-frames:v', '1', str(OUT / (name + '-start.webp'))], check=True)
fonts = ROOT / 'public' / 'fonts'
fonts.mkdir(exist_ok=True)
for family, filename in [('caveat', 'Caveat[wght].ttf'), ('permanentmarker', 'PermanentMarker-Regular.ttf'), ('knewave', 'Knewave-Regular.ttf')]:
    license_name = 'LICENSE.txt' if family == 'permanentmarker' else 'OFL.txt'
    base = 'https://raw.githubusercontent.com/google/fonts/main/' + ('apache/' if family == 'permanentmarker' else 'ofl/') + family + '/'
    for remote, local in [(filename, family + '.ttf'), (license_name, family + '-' + license_name)]:
        urllib.request.urlretrieve(base + urllib.parse.quote(remote), fonts / local)
print('Media and licensed local fonts ready.')
