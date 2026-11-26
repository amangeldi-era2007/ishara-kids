"""Crop the publisher's Figure 1 and resize without changing the poses.

Usage (Python + Pillow): python scripts/export-qazsl-photos.py path/to/figure.png
See public/content/images/qazsl-attribution.txt for the original PNG URL.
"""

from argparse import ArgumentParser
from hashlib import sha256
from pathlib import Path

from PIL import Image


# Publisher's photo bounds, excluding the printed captions. Each tuple
# holds the photo key, left edge and right edge.
ROWS = [
    ((29, 269), [
        ('a', 34, 248), ('ae', 293, 503), ('b', 534, 742), ('v', 778, 986),
        ('g', 1017, 1226), ('gh', 1266, 1458), ('d', 1507, 1705), ('e', 1740, 1946),
    ]),
    ((319, 559), [
        ('yo', 34, 242), ('zh', 290, 503), ('z', 538, 745), ('i', 785, 980),
        ('j', 1016, 1225), ('k', 1266, 1461), ('q', 1500, 1708), ('l', 1740, 1946),
    ]),
    ((615, 854), [
        ('m', 32, 242), ('n', 299, 498), ('ng', 543, 736), ('o', 775, 982),
        ('oe', 1017, 1226), ('p', 1261, 1467), ('r', 1505, 1705), ('s', 1740, 1946),
    ]),
    ((904, 1144), [
        ('t', 32, 241), ('u', 290, 484), ('uq', 534, 736), ('ue', 775, 977),
        ('f', 1017, 1226), ('kh', 1256, 1469), ('h', 1507, 1705), ('ts', 1740, 1946),
    ]),
    ((1197, 1436), [
        ('ch', 34, 244), ('sh', 290, 489), ('shch', 541, 738), ('y', 778, 980),
        ('ii', 1017, 1226), ('eh', 1256, 1468), ('yu', 1507, 1705), ('ya', 1740, 1946),
    ]),
]
EXISTING_PNG = {'b', 'f', 'l', 'm', 'p'}
FIGURE_SHA256 = 'a63af69ddab368a6a20c27c097df84a3ef005fce80aaf13cfbcddbf7d8fbe631'


def main():
    parser = ArgumentParser(description=__doc__)
    parser.add_argument('figure', type=Path)
    path = parser.parse_args().figure
    if sha256(path.read_bytes()).hexdigest() != FIGURE_SHA256:
        parser.error('Use the original 1983 × 1501 PNG from the publisher')

    output = Path(__file__).resolve().parent.parent / 'public' / 'content' / 'images'
    output.mkdir(parents=True, exist_ok=True)
    with Image.open(path) as figure:
        for (top, bottom), row in ROWS:
            for key, left, right in row:
                photo = figure.crop((left, top, right, bottom))
                width = round(photo.width * 720 / photo.height)
                enlarged = photo.resize((width, 720), Image.Resampling.LANCZOS)
                if key in EXISTING_PNG:
                    enlarged.save(output / f'qazsl-{key}.png', optimize=True)
                else:
                    enlarged.save(output / f'qazsl-{key}.webp', lossless=True, method=6)

    print(f'Exported {sum(len(row) for _, row in ROWS)} photos at 720 px height.')


if __name__ == '__main__':
    main()
