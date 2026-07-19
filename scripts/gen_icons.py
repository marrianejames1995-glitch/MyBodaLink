#!/usr/bin/env python3
"""Generate MyBodaLink PWA icons (PNG) with Pillow.

Icon concept (unique): a bold rounded badge with a stylized "M" road mark
that doubles as the routes connecting riders/taxis to clients. The "M" is
formed by a sweeping road that forks into two paths (boda + taxi) meeting
a client node at the top — i.e. it reads as both the letter M AND a road
network. Brand-green gradient, with a glowing client node (the "Link").

Run:  python3 scripts/gen_icons.py
Writes: public/pwa-192x192.png, public/pwa-512x512.png,
        public/apple-touch-icon.png (180), public/icon-512-maskable.png (512)
"""
from PIL import Image, ImageDraw


def lerp(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(len(c1)))


def gradient_bg(size):
    """Diagonal brand-green gradient (brighter top-left -> deeper bottom-right)."""
    top = (34, 197, 94, 255)    # #22c55e
    bot = (20, 83, 45, 255)     # #14532d
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    px = img.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size)
            px[x, y] = lerp(top, bot, t)
    mask = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, size - 1, size - 1],
                         radius=int(size * 0.23), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


def draw_icon(size: int) -> Image.Image:
    img = gradient_bg(size)
    draw = ImageDraw.Draw(img)
    s = size / 512.0
    def sc(v):
        return int(round(v * s))

    white = (255, 255, 255, 255)
    light = (187, 247, 208, 255)   # #bbf7d0
    road = (255, 255, 255, 255)

    def fat_line(p1, p2, w, fill=road, cap=True):
        # thick line with round caps
        draw.line([p1, p2], fill=fill, width=w)
        if cap:
            r = w // 2
            for c in (p1, p2):
                draw.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=fill)

    def circle(c, r, fill):
        draw.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=fill)

    def ring(c, r, w, fill):
        draw.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], outline=fill, width=w)

    # ---- The "M" as two sweeping road paths from a base node up to a fork ----
    base = (256, 392)          # bottom centre node (where the road starts)
    peak = (256, 150)          # top centre node (the client — the "Link")
    left_valley = (118, 232)   # left dip of the M
    right_valley = (394, 232)  # right dip of the M

    rw = sc(40)  # road thickness
    fat_line(base, left_valley, rw)
    fat_line(left_valley, peak, rw)
    fat_line(peak, right_valley, rw)
    fat_line(right_valley, base, rw)

    # ---- Centre dashed lane marking (subtle, gives it a "road" feel) --------
    lane = light
    lw = sc(8)
    dash = sc(20)
    gap = sc(16)
    import math
    def dashed_line(p1, p2, w, fill, dash, gap):
        dx, dy = p2[0] - p1[0], p2[1] - p1[1]
        length = math.hypot(dx, dy)
        if length == 0:
            return
        ux, uy = dx / length, dy / length
        travelled = 0.0
        while travelled < length:
            a = travelled
            b = min(travelled + dash, length)
            draw.line(
                [(p1[0] + ux * a, p1[1] + uy * a),
                 (p1[0] + ux * b, p1[1] + uy * b)],
                fill=fill, width=w)
            travelled += dash + gap

    dashed_line(left_valley, peak, lw, lane, dash, gap)
    dashed_line(peak, right_valley, lw, lane, dash, gap)

    # ---- Nodes: base (hub), peak (client glow) ------------------------------
    ring(base, sc(26), sc(7), white)
    circle(base, sc(10), white)

    # Client node at the top with a glow ring
    glow_r = sc(40)
    for i, alpha in enumerate((40, 70, 110)):
        rr = glow_r + sc(6) * (3 - i)
        ring(peak, rr, sc(8), (187, 247, 208, alpha))
    circle(peak, sc(30), white)
    circle(peak, sc(18), light)

    return img


if __name__ == "__main__":
    out = {
        "public/pwa-192x192.png": 192,
        "public/pwa-512x512.png": 512,
        "public/apple-touch-icon.png": 180,
        "public/icon-512-maskable.png": 512,
    }
    for path, size in out.items():
        draw_icon(size).save(path)
        print("wrote", path)
