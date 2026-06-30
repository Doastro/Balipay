from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle


OUT = Path("docs/Attestation_Creation_Balipay_Partenariat.pdf")

INK = colors.HexColor("#17201d")
MUTED = colors.HexColor("#5f6f69")
LINE = colors.HexColor("#d8e1dc")
JADE = colors.HexColor("#14745f")
SOFT = colors.HexColor("#f5f8f6")


def build_styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=17,
            leading=21,
            textColor=INK,
            alignment=1,
            spaceAfter=8,
        ),
        "subtitle": ParagraphStyle(
            "subtitle",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=13,
            textColor=JADE,
            alignment=1,
            spaceAfter=12,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["BodyText"],
            fontSize=9.4,
            leading=13,
            textColor=INK,
            spaceAfter=7,
        ),
        "small": ParagraphStyle(
            "small",
            parent=base["BodyText"],
            fontSize=8,
            leading=10,
            textColor=MUTED,
        ),
        "label": ParagraphStyle(
            "label",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=8.2,
            leading=10,
            textColor=INK,
        ),
        "cell": ParagraphStyle(
            "cell",
            parent=base["BodyText"],
            fontSize=8.2,
            leading=10,
            textColor=INK,
        ),
        "note": ParagraphStyle(
            "note",
            parent=base["BodyText"],
            fontSize=8.2,
            leading=10.6,
            textColor=INK,
            backColor=SOFT,
            borderColor=JADE,
            borderWidth=0.6,
            borderPadding=6,
            spaceBefore=2,
            spaceAfter=8,
        ),
    }


def p(text, style):
    return Paragraph(text, style)


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(18 * mm, 12 * mm, 192 * mm, 12 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(18 * mm, 7 * mm, "Attestation - Projet Balipay")
    canvas.drawRightString(192 * mm, 7 * mm, "Page 1/1")
    canvas.restoreState()


class OnePageDoc(BaseDocTemplate):
    def __init__(self, filename):
        super().__init__(
            filename,
            pagesize=A4,
            leftMargin=18 * mm,
            rightMargin=18 * mm,
            topMargin=15 * mm,
            bottomMargin=17 * mm,
        )
        frame = Frame(self.leftMargin, self.bottomMargin + 4 * mm, self.width, self.height - 4 * mm, id="normal")
        self.addPageTemplates([PageTemplate(id="page", frames=[frame], onPage=footer)])


def blank_table(rows, styles):
    data = []
    for label, value in rows:
        data.append([p(label, styles["label"]), p(value, styles["cell"])])
    table = Table(data, colWidths=[48 * mm, 126 * mm], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.45, LINE),
                ("BACKGROUND", (0, 0), (0, -1), SOFT),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return table


def build():
    styles = build_styles()
    doc = OnePageDoc(str(OUT))
    story = []

    story.append(p("ATTESTATION RELATIVE AU PROJET DE CREATION DE BALIPAY", styles["title"]))
    story.append(p("Document a completer, dater et signer par le partenaire", styles["subtitle"]))

    story.append(
        blank_table(
            [
                ("Signataire / partenaire", "Nom et prenom : ........................................................"),
                ("Qualite", "Cofondateur / associe / partenaire du projet : ........................................................"),
                ("Adresse", "........................................................................................................"),
                ("Piece d'identite", "Type et numero : ........................................................"),
                ("Porteur du projet", "Yueting JIANG"),
                ("Projet", "Balipay, societe en cours de creation"),
            ],
            styles,
        )
    )
    story.append(Spacer(1, 5 * mm))

    body = (
        "Je soussigne(e), <b>........................................................</b>, atteste par la presente "
        "que le projet <b>Balipay</b> est actuellement en cours de creation avec le porteur du projet "
        "<b>Yueting JIANG</b>."
    )
    story.append(p(body, styles["body"]))
    story.append(
        p(
            "Balipay a pour objet le developpement d'une solution de paiement et de services aux commercants, "
            "notamment une plateforme permettant d'accompagner les commercants dans l'acceptation, le suivi et "
            "la gestion de paiements, avec une orientation particuliere vers les echanges commerciaux entre la "
            "France, l'Europe et la Chine.",
            styles["body"],
        )
    )
    story.append(
        p(
            "J'atteste participer au projet Balipay en qualite de partenaire / associe pressenti, sous reserve "
            "de la finalisation des formalites juridiques, administratives, bancaires, contractuelles et "
            "reglementaires necessaires a la constitution et au lancement de l'activite.",
            styles["body"],
        )
    )
    story.append(
        p(
            "La presente attestation est etablie a la demande du porteur du projet afin de servir dans le cadre "
            "de ses demarches administratives, notamment aupres de la prefecture, relatives a son projet "
            "entrepreneurial en France.",
            styles["body"],
        )
    )
    story.append(
        p(
            "Cette attestation ne vaut pas immatriculation definitive de la societe, ni engagement bancaire, "
            "financier ou reglementaire. Elle confirme uniquement l'existence du projet Balipay en cours de "
            "creation et la participation du signataire audit projet.",
            styles["note"],
        )
    )

    story.append(Spacer(1, 4 * mm))
    story.append(
        blank_table(
            [
                ("Fait a", "........................................................"),
                ("Le", ".......... / .......... / 2026"),
                ("Mention manuscrite", "\"Lu et approuve, bon pour attestation\""),
                ("Signature du partenaire", "\n\n\n"),
            ],
            styles,
        )
    )

    doc.build(story)


if __name__ == "__main__":
    build()
