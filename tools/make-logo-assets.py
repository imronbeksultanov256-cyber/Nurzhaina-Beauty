# -*- coding: utf-8 -*-
"""
NURZHANA BEAUTY — подготовка производных логотипа.

Берёт оригинал assets/img/logo.png (чёрная монограмма на белом фоне)
и делает из него набор файлов с прозрачным фоном:

  logo-mark.png        монограмма NB, тёмная      (шапка, светлый фон)
  logo-mark-light.png  монограмма NB, светлая     (тёмный фон)
  logo-full.png        полный логотип, тёмный     (светлый фон)
  logo-full-light.png  полный логотип, светлый    (подвал, тёмный фон)
  favicon-32.png       иконка вкладки
  apple-touch-icon.png иконка для iOS
  og.jpg               картинка для соцсетей 1200×630

Оригинал не изменяется. Запуск:  python tools/make-logo-assets.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

SRC = 'assets/img/logo.png'
OUT = 'assets/img'
INK = (20, 18, 16)
LIGHT = (247, 244, 239)
IVORY = (251, 249, 245)

os.makedirs(OUT, exist_ok=True)
base = Image.open(SRC).convert('L')


def cut(box, color, target_h=None, target_w=None):
    """Вырезает область, делает белый фон прозрачным, красит арт в нужный цвет."""
    g = base.crop(box)
    alpha = g.point(lambda v: 255 - v)          # белое -> прозрачное, чёрное -> плотное
    out = Image.new('RGBA', g.size, color + (0,))
    out.putalpha(alpha)
    w, h = out.size
    if target_h:
        target_w = round(w * target_h / h)
    elif target_w:
        target_h = round(h * target_w / w)
    if target_h:
        out = out.resize((target_w, target_h), Image.LANCZOS)
    return out


# границы найдены анализом исходника
MARK = (178, 273, 1060, 872)     # монограмма NB
FULL = (177, 273, 1098, 985)     # монограмма + подпись

cut(MARK, INK,   target_h=200).save(f'{OUT}/logo-mark.png', optimize=True)
cut(MARK, LIGHT, target_h=200).save(f'{OUT}/logo-mark-light.png', optimize=True)
cut(FULL, INK,   target_w=380).save(f'{OUT}/logo-full.png', optimize=True)
cut(FULL, LIGHT, target_w=380).save(f'{OUT}/logo-full-light.png', optimize=True)

# --- иконки ---
for size, name in ((32, 'favicon-32.png'), (180, 'apple-touch-icon.png')):
    icon = Image.new('RGBA', (size, size), IVORY + (255,))
    mark = cut(MARK, INK, target_h=round(size * 0.62))
    icon.alpha_composite(mark, ((size - mark.width) // 2, (size - mark.height) // 2))
    icon.convert('RGB').save(f'{OUT}/{name}', optimize=True)

# --- Open Graph 1200×630 ---
og = Image.new('RGB', (1200, 630), IVORY)
d = ImageDraw.Draw(og)
for y in range(630):                                  # мягкий тёплый градиент
    t = y / 629
    d.line([(0, y), (1200, y)],
           fill=(round(251 - 15 * t), round(249 - 24 * t), round(245 - 36 * t)))
d.rectangle([60, 60, 1139, 569], outline=(20, 18, 16, 30))

logo = cut(FULL, INK, target_w=330)
og.paste(logo, ((1200 - logo.width) // 2, 95), logo)


def font(paths, size):
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    return ImageFont.load_default()


serif = font([r'C:\Windows\Fonts\times.ttf', '/System/Library/Fonts/Times.ttc'], 44)
sans = font([r'C:\Windows\Fonts\arial.ttf', '/System/Library/Fonts/Helvetica.ttc'], 19)


def centered(text, f, y, fill, tracking=0):
    if tracking:
        widths = [d.textlength(ch, font=f) + tracking for ch in text]
        x = (1200 - (sum(widths) - tracking)) / 2
        for ch, w in zip(text, widths):
            d.text((x, y), ch, font=f, fill=fill)
            x += w
    else:
        d.text((600, y), text, font=f, fill=fill, anchor='ma')


d.line([(520, 400), (680, 400)], fill=(165, 145, 124), width=1)
centered('Омоложение без операций', serif, 432, (43, 40, 37))
centered('АППАРАТНАЯ КОСМЕТОЛОГИЯ · БИШКЕК', sans, 512, (140, 131, 121), tracking=6)

og.save(f'{OUT}/og.jpg', quality=88, optimize=True, progressive=True)

for f in ('logo-mark.png', 'logo-mark-light.png', 'logo-full.png',
          'logo-full-light.png', 'favicon-32.png', 'apple-touch-icon.png', 'og.jpg'):
    p = f'{OUT}/{f}'
    print(f'{f:<22} {Image.open(p).size}  {os.path.getsize(p) // 1024} КБ')
