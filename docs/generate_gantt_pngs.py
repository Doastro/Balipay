from datetime import date
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


OUT = Path("docs")
START = date(2026, 6, 1)
END = date(2029, 6, 30)
TOTAL_DAYS = (END - START).days

WIDTH = 1800
HEIGHT = 1050
LEFT = 360
RIGHT = 80
TOP = 140
ROW_H = 58
BAR_H = 28

COLORS = {
    "bg": "#f8faf7",
    "ink": "#13201d",
    "muted": "#5f6f69",
    "line": "#dce5e0",
    "jade": "#14745f",
    "jade_dark": "#0d4f42",
    "gold": "#bd8b2d",
    "blue": "#2f6f82",
    "red": "#a6403a",
    "panel": "#ffffff",
}


def font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


F_TITLE = font(42, True)
F_SUB = font(22)
F_LABEL = font(23, True)
F_SMALL = font(18)
F_AXIS = font(17, True)


def x_for(day):
    return LEFT + int(((day - START).days / TOTAL_DAYS) * (WIDTH - LEFT - RIGHT))


def draw_round(draw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def render(locale, title, subtitle, tasks, output):
    img = Image.new("RGB", (WIDTH, HEIGHT), COLORS["bg"])
    draw = ImageDraw.Draw(img)

    draw_round(draw, (36, 34, WIDTH - 36, HEIGHT - 34), 22, COLORS["panel"], COLORS["line"], 2)
    draw.text((68, 58), title, fill=COLORS["ink"], font=F_TITLE)
    draw.text((70, 108), subtitle, fill=COLORS["muted"], font=F_SUB)

    axis_y = TOP
    years = [date(2026, 6, 1), date(2027, 1, 1), date(2028, 1, 1), date(2029, 1, 1), date(2029, 6, 30)]
    for marker in years:
        x = x_for(marker)
        draw.line((x, axis_y, x, HEIGHT - 95), fill=COLORS["line"], width=2)
        label = marker.strftime("%Y") if marker.month == 1 else ("Jun 2026" if locale == "en" else "Juin 2026")
        draw.text((x - 34, axis_y - 32), label, fill=COLORS["muted"], font=F_AXIS)

    phase_colors = {
        "validation": COLORS["jade"],
        "mvp": COLORS["blue"],
        "growth": COLORS["gold"],
        "pro": COLORS["red"],
    }

    y = TOP + 40
    current_phase = None
    for task in tasks:
        phase, label, start, end = task
        if phase != current_phase:
            current_phase = phase
            draw.text((70, y + 8), phase.upper(), fill=phase_colors[phase], font=F_AXIS)
            y += 36

        draw.text((86, y + 7), label, fill=COLORS["ink"], font=F_LABEL)
        x1 = x_for(start)
        x2 = x_for(end)
        draw_round(draw, (x1, y + 8, max(x1 + 14, x2), y + 8 + BAR_H), 12, phase_colors[phase])
        draw.text((x2 + 10, y + 10), f"{start:%m/%Y} - {end:%m/%Y}", fill=COLORS["muted"], font=F_SMALL)
        y += ROW_H

    footer = "Balipay - Product & Technical Roadmap" if locale == "en" else "Balipay - Roadmap Produit et Technique"
    draw.text((70, HEIGHT - 72), footer, fill=COLORS["muted"], font=F_SMALL)
    img.save(OUT / output, "PNG")


fr_tasks = [
    ("validation", "Societe / marque / site", date(2026, 6, 1), date(2026, 6, 30)),
    ("validation", "Entretiens commercants", date(2026, 6, 15), date(2026, 7, 30)),
    ("validation", "Evaluation PSP/TPE", date(2026, 7, 1), date(2026, 8, 15)),
    ("mvp", "Prototype TPE", date(2026, 8, 1), date(2026, 9, 30)),
    ("mvp", "QR + integration PSP", date(2026, 8, 15), date(2026, 10, 30)),
    ("mvp", "Dashboard commercant", date(2026, 9, 1), date(2026, 11, 15)),
    ("mvp", "Cloture + IA", date(2026, 10, 1), date(2026, 11, 30)),
    ("mvp", "10 pilotes", date(2026, 11, 1), date(2026, 12, 31)),
    ("growth", "100 commercants", date(2027, 1, 1), date(2027, 5, 31)),
    ("growth", "Pay by Link", date(2027, 3, 1), date(2027, 4, 30)),
    ("growth", "API Online / plugins", date(2027, 6, 1), date(2027, 11, 30)),
    ("pro", "Balipay Pro", date(2028, 1, 1), date(2028, 8, 28)),
    ("pro", "Wallet / BaaS", date(2029, 1, 1), date(2029, 6, 30)),
]

en_tasks = [
    ("validation", "Company / brand / website", date(2026, 6, 1), date(2026, 6, 30)),
    ("validation", "Merchant interviews", date(2026, 6, 15), date(2026, 7, 30)),
    ("validation", "PSP/POS evaluation", date(2026, 7, 1), date(2026, 8, 15)),
    ("mvp", "POS prototype", date(2026, 8, 1), date(2026, 9, 30)),
    ("mvp", "QR + PSP integration", date(2026, 8, 15), date(2026, 10, 30)),
    ("mvp", "Merchant dashboard", date(2026, 9, 1), date(2026, 11, 15)),
    ("mvp", "Daily closing + AI", date(2026, 10, 1), date(2026, 11, 30)),
    ("mvp", "10 pilot merchants", date(2026, 11, 1), date(2026, 12, 31)),
    ("growth", "100 merchants", date(2027, 1, 1), date(2027, 5, 31)),
    ("growth", "Pay by Link", date(2027, 3, 1), date(2027, 4, 30)),
    ("growth", "Online API / plugins", date(2027, 6, 1), date(2027, 11, 30)),
    ("pro", "Balipay Pro", date(2028, 1, 1), date(2028, 8, 28)),
    ("pro", "Wallet / BaaS", date(2029, 1, 1), date(2029, 6, 30)),
]


render(
    "fr",
    "Balipay - Roadmap Produit et Technique",
    "Diagramme de Gantt | Version francaise",
    fr_tasks,
    "Balipay_Gantt_FR.png",
)
render(
    "en",
    "Balipay - Product and Technical Roadmap",
    "Gantt chart | English version",
    en_tasks,
    "Balipay_Gantt_EN.png",
)
