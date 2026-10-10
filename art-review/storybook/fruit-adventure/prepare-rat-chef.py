"""Optimize reviewed rat-chef art and update only Fruit Adventure's consumers."""
import json
import re
import shutil
import textwrap
from html import escape
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

folder = Path(__file__).resolve().parent
review = folder.parent
workspace = review.parent.parent
manifest = json.loads((folder / 'mouse-chef-prompts.json').read_text(encoding='utf-8'))
library_path = review / 'library.json'
library = json.loads(library_path.read_text(encoding='utf-8'))
story = next(item for item in library if item['id'] == 'fruit-adventure')
story['continuity'] = manifest['continuity']
story['cover'] = manifest['pages'][0]['image']
story['pages'] = [{key: page[key] for key in ('text', 'beat', 'alt', 'image')} for page in manifest['pages']]
library_path.write_text(json.dumps(library, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

shipping = workspace / 'public/assets/storybooks/fruit-adventure'
shipping.mkdir(parents=True, exist_ok=True)
for index, page in enumerate(manifest['pages'], 1):
    source = folder / page['source']
    selected = review / page['image']
    with Image.open(source) as art:
        assert abs(art.width / art.height - 1.5) < .005, source
        art.convert('RGB').resize((1200, 800), Image.Resampling.LANCZOS).save(selected, 'WEBP', quality=86, method=6)
    assert selected.stat().st_size < 240_000, selected
    # Replace the game's requested Fruit Adventure assets; preserve originals in review history.
    shutil.copyfile(selected, shipping / f'page-{index:02}.webp')
with Image.open(folder / 'page-02-rat.png') as art:
    art.convert('RGB').resize((384, 256), Image.Resampling.LANCZOS).save(
        workspace / 'public/assets/stories/fruit-adventure.webp', 'WEBP', quality=86, method=6)

# Reuse the existing review layout without rebuilding unrelated stories.
storyboard_path = folder / 'storyboard.html'
html = storyboard_path.read_text(encoding='utf-8')
cards = ''.join(f'<article class="card"><img src="../{page["image"]}" alt="{escape(page["alt"], quote=True)}"><div class="caption"><b class="label">PAGE {index:02}</b><p>{escape(page["text"])}</p></div></article>' for index, page in enumerate(story['pages'], 1))
html = re.sub(r'<main class="grid">.*?</main>', '<main class="grid">' + cards + '</main>', html, count=1, flags=re.S)
html = re.sub(r'<main><p>.*?</p><a href="../index.html">', '<main><p>' + escape(story['continuity']) + '</p><a href="../index.html">', html, count=1, flags=re.S)
storyboard_path.write_text(html, encoding='utf-8')
index_path = review / 'index.html'
menu = index_path.read_text(encoding='utf-8')
menu = re.sub(r'<article class="card"><img src="fruit-adventure/[^\"]+".*?</article>',
    '<article class="card"><img src="fruit-adventure/page-01-mouse.webp" alt="Fruit adventure opening scene"><div class="caption"><span class="label">4 ILLUSTRATED PAGES</span><h2>Fruit adventure</h2><p>A tiny rat chef makes a sunny fruit salad.</p><a href="preview.html?story=fruit-adventure">Try the mockup →</a><a class="secondary" href="fruit-adventure/storyboard.html">All pages</a></div></article>', menu, count=1, flags=re.S)
index_path.write_text(menu, encoding='utf-8')

prompts = '# Fruit adventure — tiny rat chef\n\nBuilt-in image generation. User-approved replacement: one rat chef, ordinary faceless fruit, no helpers. Page 1 is the approved opening image retained; pages 2–4 follow the updated story. See RAT-CHEF-PLAN.md for the plan and individual review notes. Original drafts remain as review history.\n\n## Continuity\n\n' + manifest['continuity'] + '\n\n## Exact generation prompts\n'
for page in manifest['pages']:
    prompts += f'\n### Page {page["index"]}\n\nTyping sentence: {page["text"]}\n\nSelected image: {page["image"]}\n\nReferences: ' + ', '.join(page['references']) + '\n\n' + page['prompt'] + '\n'
prompts += '\n### Page 4 targeted correction\n\n' + manifest['correction']['prompt'] + '\n'
(folder / 'PROMPTS.md').write_text(prompts, encoding='utf-8')

font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 19)
heading = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 28)
sheet = Image.new('RGB', (1240, 1010), '#211a2e')
draw = ImageDraw.Draw(sheet)
draw.text((18, 17), 'Fruit adventure — one tiny chef, four story pages', font=heading, fill='#fff1d8')
for index, page in enumerate(story['pages']):
    with Image.open(review / page['image']) as art:
        thumbnail = art.convert('RGB').resize((600, 400), Image.Resampling.LANCZOS)
    x, y = 12 + (index % 2) * 616, 65 + (index // 2) * 470
    sheet.paste(thumbnail, (x, y))
    for line_no, line in enumerate(textwrap.wrap(f'{index+1:02}  {page["text"]}', 54)):
        draw.text((x+3, y+408+line_no*23), line, font=font, fill='#fff1d8')
sheet.save(folder / 'rat-chef-contact-sheet.jpg', quality=94)
print('Updated Fruit Adventure: four 1200 x 800 pages, new story tile, story text metadata and selected-art contact sheet.')
