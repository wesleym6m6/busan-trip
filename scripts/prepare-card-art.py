"""Import the approved illustration package without changing source pixels.

Run with the path to the approved busan-card-art-20260921 package. Requires Pillow.
Original generated PNGs stay in design/; the public build uses lossless copies.
"""
from pathlib import Path
import argparse
import hashlib
import json
import shutil
from PIL import Image

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('art_package', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
source = args.art_package.resolve()
originals = root / 'design/card-illustrations-2026-09-21/originals'
public = root / 'public/uploads/cards'
originals.mkdir(parents=True, exist_ok=True)
public.mkdir(parents=True, exist_ok=True)
manifest = json.loads((source / 'manifest.json').read_text())
reuse = {'pork-soup': 'pork-soup', 'sky-capsule': 'sky-capsule', 'coast': 'busan-coast'}
catalog, receipt = {}, []
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

for art in manifest:
    src = source / art['src']
    assert digest(src) == art['sha256'], f"Changed approved source: {art['id']}"
    with Image.open(src) as image:
        rgba = image.convert('RGBA')
        if art['id'] in reuse:
            image_path = f"uploads/{reuse[art['id']]}.png"
            dest = root / 'public' / image_path.replace('.png', '.lossless.webp')
            original = root / 'public' / image_path
        else:
            original = originals / f"{art['id']}.png"
            shutil.copy2(src, original)
            dest = public / f"{art['id']}.lossless.webp"
            image.save(dest, 'WEBP', lossless=True, quality=100, method=6, exact=True)
            image_path = dest.relative_to(root / 'public').as_posix()
        with Image.open(dest) as encoded:
            assert encoded.size == image.size
            assert encoded.convert('RGBA').tobytes() == rgba.tobytes(), f"Pixel mismatch: {art['id']}"
        catalog[art['id']] = {
            'src': image_path, 'width': image.width, 'height': image.height,
            'treatment': 'scene' if art['id'] in reuse else 'cutout',
        }
        receipt.append({
            'id': art['id'], 'label': art['label'], 'approval': art['source'],
            'approvedSourceSha256': digest(src),
            'original': original.relative_to(root).as_posix(), 'originalSha256': digest(original),
            'public': dest.relative_to(root).as_posix(), 'publicSha256': digest(dest),
            'sourceBytes': src.stat().st_size, 'publicBytes': dest.stat().st_size,
            'width': image.width, 'height': image.height, 'rgbaPixelsEqual': True,
        })

(root / 'src/data/card-illustrations.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
(originals.parent / 'manifest.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
for name in ['AUDIT.md', 'SOURCES.md', 'redraw-prompts.json', 'previous-prompts.json', 'card-mapping.json']:
    shutil.copy2(source / name, originals.parent / name)
print(json.dumps({'images': len(catalog), 'sourceBytes': sum(r['sourceBytes'] for r in receipt),
                  'publicBytes': sum(r['publicBytes'] for r in receipt), 'pixelVerification': 'PASS'}))
