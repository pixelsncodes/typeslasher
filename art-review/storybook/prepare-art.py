"""Optimize generated originals and make review contact sheets; no creative edits."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import textwrap

root = Path(__file__).resolve().parent
library = json.loads((root / 'library.json').read_text(encoding='utf-8'))
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 16)
heading = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 24)
total = 0
for story in library:
    if story['id'] != 'little-kindness':
        for page in story['pages']:
            target = root / page['image']
            original = target.with_suffix('.png')
            if not original.exists():
                raise FileNotFoundError(original)
            with Image.open(original) as art:
                if abs(art.width / art.height - 1.5) > .005:
                    raise ValueError(f'Wrong source aspect ratio: {original}')
                art.convert('RGB').resize((1200,800), Image.Resampling.LANCZOS).save(target, 'WEBP', quality=86, method=6)
    cols = 3
    rows = (len(story['pages']) + cols - 1) // cols
    sheet = Image.new('RGB', (1260, 65 + rows * 345), '#211a2e')
    draw = ImageDraw.Draw(sheet)
    draw.text((18,18), story['title'], font=heading, fill='#fff1d8')
    for index, page in enumerate(story['pages']):
        image_path = root / page['image']
        with Image.open(image_path) as art:
            assert art.size == (1200,800), image_path
            thumbnail = art.convert('RGB').resize((402,268), Image.Resampling.LANCZOS)
        x = 12 + (index % cols) * 420
        y = 65 + (index // cols) * 345
        sheet.paste(thumbnail,(x,y))
        for line_no, line in enumerate(textwrap.wrap(f'{index+1:02}  {page["text"]}', 47)):
            draw.text((x+3,y+275+line_no*18),line,font=font,fill='#fff1d8')
        total += image_path.stat().st_size
    sheet.save(root / story['id'] / 'contact-sheet.jpg', quality=92)
print(f'All 30 illustrations verified at 1200 x 800. Optimized total: {total/1024/1024:.2f} MiB.')
