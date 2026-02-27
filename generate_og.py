"""Generate OG social media image (1200x630)."""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630
img = Image.new("RGB", (W, H), "#2c3e50")
draw = ImageDraw.Draw(img)

# Gradient background
for y in range(H):
    r = int(44 + (52 - 44) * y / H)
    g = int(62 + (73 - 62) * y / H)
    b = int(80 + (94 - 80) * y / H)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

# Accent lines
draw.rectangle([0, 0, W, 6], fill="#3498db")
draw.rectangle([0, H - 4, W, H], fill="#3498db")

# Fonts
try:
    title_font = ImageFont.truetype("C:/Windows/Fonts/georgia.ttf", 52)
    subtitle_font = ImageFont.truetype("C:/Windows/Fonts/georgia.ttf", 26)
    small_font = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 20)
except Exception:
    title_font = ImageFont.load_default()
    subtitle_font = title_font
    small_font = title_font

# Title
draw.text((80, 180), "Truth & Artificial Intelligence", fill="#ffffff", font=title_font)

# Subtitle
draw.text(
    (80, 260),
    "Christian Theological and Technical Reflections on AI",
    fill="#bdc3c7",
    font=subtitle_font,
)

# Divider
draw.rectangle([80, 320, 300, 322], fill="#3498db")

# Scripture
draw.text(
    (80, 350),
    '\u201cI am the way, and the truth, and the life.\u201d',
    fill="#95a5a6",
    font=small_font,
)
draw.text((80, 380), "\u2014 John 14:6", fill="#7f8c8d", font=small_font)

# Author
draw.text((80, 450), "Paul Wever", fill="#bdc3c7", font=small_font)

os.makedirs("docs/images", exist_ok=True)
img.save("docs/images/og-default.png", "PNG", optimize=True)
size = os.path.getsize("docs/images/og-default.png")
print(f"Created: {size:,} bytes")
