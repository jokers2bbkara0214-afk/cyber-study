"""Generate PWA icons (hexagon mark) for CYBER STUDY."""
import math, sys
from PIL import Image, ImageDraw, ImageFont
out = sys.argv[1]
BG = (16, 26, 32); TEAL = (53, 201, 186); TEXT = (230, 242, 241)
def icon(size, maskable=False):
    s = size * 4
    im = Image.new('RGB', (s, s), BG); d = ImageDraw.Draw(im)
    scale = 0.30 if maskable else 0.38
    cx = cy = s / 2; r = s * scale
    pts = [(cx + r * math.cos(math.radians(60 * i - 90)), cy + r * math.sin(math.radians(60 * i - 90))) for i in range(6)]
    d.polygon(pts, outline=TEAL, width=max(4, int(s * 0.035)))
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', int(r * 0.78))
    t = 'CS'; bb = d.textbbox((0, 0), t, font=font)
    d.text((cx - (bb[2] - bb[0]) / 2 - bb[0], cy - (bb[3] - bb[1]) / 2 - bb[1]), t, font=font, fill=TEXT)
    return im.resize((size, size), Image.LANCZOS)
icon(192).save(f'{out}/icon-192.png'); icon(512).save(f'{out}/icon-512.png')
icon(512, True).save(f'{out}/icon-maskable-512.png'); icon(180).save(f'{out}/apple-touch-icon.png')
