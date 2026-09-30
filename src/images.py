"""Export project images: full gallery images plus cover crops for slides and cards."""
import os, sys
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from data import PROJECTS, SRC

OUT = os.path.join(os.path.dirname(__file__), '..', 'images', 'work')


def crop(im, ratio, cx, cy):
    W, H = im.size
    w = min(W, H * ratio); h = w / ratio
    x0 = min(max(cx * W - w / 2, 0), W - w); y0 = min(max(cy * H - h / 2, 0), H - h)
    return im.crop((round(x0), round(y0), round(x0 + w), round(y0 + h)))


def save(im, path, maxw):
    if im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    im.save(path, quality=80, method=6)


for p in PROJECTS:
    cx, cy = p['feature']
    for i, n in enumerate(p['imgs'], 1):
        im = Image.open(f"{SRC}{n}.png").convert('RGB')
        save(im, f"{OUT}/{p['slug']}-{i:02d}.webp", 1800)
        if i == 1:
            save(crop(im, 16 / 9, cx, cy), f"{OUT}/{p['slug']}-slide.webp", 1920)
            save(crop(im, 4 / 3, cx, cy), f"{OUT}/{p['slug']}-card.webp", 1100)
print('done')
