#!/usr/bin/env python3
from pathlib import Path

root = Path(__file__).resolve().parent
index_html = (root / 'index.html').read_text(encoding='utf-8')
styles_css = (root / 'styles.css').read_text(encoding='utf-8')
app_js = (root / 'app.js').read_text(encoding='utf-8')

single = index_html.replace('<link rel="stylesheet" href="styles.css" />', f'<style>\n{styles_css}\n</style>')
single = single.replace('<script src="app.js" defer></script>', f'<script>\n{app_js}\n</script>')

out = root / 'cep-haberim.html'
out.write_text(single, encoding='utf-8')
print(f'Tek dosya üretildi: {out}')
