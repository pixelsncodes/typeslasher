"""Encode the approved menu renders as lossless WebP for the playable build."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent / 'design' / 'ui-v2' / 'trays'
for source in sorted(root.glob('*.png')):
    target = source.with_suffix('.webp')
    with Image.open(source) as image:
        image.save(target, 'WEBP', lossless=True, method=6)
    print(f'{source.name}: {source.stat().st_size} -> {target.stat().st_size} bytes')
