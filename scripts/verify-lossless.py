"""Verify shipped image derivatives without resizing or discarding any RGBA values.

Development-only check: Python 3 + Pillow with WebP support. Original PNG files
remain byte-for-byte intact, including their original provenance metadata.
"""
from pathlib import Path
import hashlib
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
records = json.loads((ROOT / 'docs/performance/lossless-candidates.json').read_text())
for record in records:
    name = record['name']
    original = ROOT / 'public/uploads' / f'{name}.png'
    optimized = ROOT / 'public/uploads' / f'{name}.lossless.webp'
    assert hashlib.sha256(original.read_bytes()).hexdigest() == record['original_sha256'], f'{name}: original bytes changed'
    assert hashlib.sha256(optimized.read_bytes()).hexdigest() == record['webp_sha256'], f'{name}: derivative bytes changed'
    with Image.open(original) as source, Image.open(optimized) as derivative:
        original_pixels = source.convert('RGBA').tobytes()
        assert source.size == derivative.size, f'{name}: dimensions changed'
        assert original_pixels == derivative.convert('RGBA').tobytes(), f'{name}: pixels changed'
        assert hashlib.sha256(original_pixels).hexdigest() == record['rgba_sha256'], f'{name}: source changed'
        assert source.info.get('icc_profile') == derivative.info.get('icc_profile'), f'{name}: color profile changed'
        assert original.stat().st_size == record['original'], f'{name}: original file changed'
        assert optimized.stat().st_size == record['webp'] < original.stat().st_size, f'{name}: size mismatch'
    print(f'PASS {name}: identical dimensions, RGBA and color profile; {original.stat().st_size} -> {optimized.stat().st_size} bytes')
