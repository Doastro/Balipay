from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle


OUT = Path("docs")
JADE = colors.HexColor("#14745f")
JADE_DARK = colors.HexColor("#0d4f42")
INK = colors.HexColor("#13201d")
MUTED = colors.HexColor("#5f6f69")
LINE = colors.HexColor("#dce5e0")
SOFT = colors.HexColor("#f5f8f6")


def get_styles():
    base = getSampleStyleSheet()
    return {
        "brand": ParagraphStyle(
            "brand",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=14,
            leading=18,
            textColor=JADE_DARK,
        ),
        "title": ParagraphStyle(
            "title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=28,
            leading=33,
            textColor=INK,
            alignment=TA_LEFT,
            spaceBefore=18,
            spaceAfter=8,
        ),
        "subtitle": ParagraphStyle(
            "subtitle",
            parent=base["Normal"],
            fontSize=11,
            leading=15,
            textColor=MUTED,
            spaceAfter=14,
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=JADE_DARK,
            spaceBefore=12,
            spaceAfter=7,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["BodyText"],
            fontSize=9.2,
            leading=12,
            textColor=INK,
            spaceAfter=5,
        ),
        "note": ParagraphStyle(
            "note",
            parent=base["BodyText"],
            fontSize=9.2,
            leading=12.5,
            textColor=INK,
            backColor=SOFT,
            borderColor=JADE,
            borderWidth=0.7,
            borderPadding=7,
            spaceAfter=10,
        ),
        "head": ParagraphStyle(
            "head",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=7.5,
            leading=9.2,
            textColor=JADE_DARK,
        ),
        "cell": ParagraphStyle(
            "cell",
            parent=base["BodyText"],
            fontSize=7.5,
            leading=9.4,
            textColor=INK,
        ),
    }


def p(text, style):
    return Paragraph(text, style)


def make_table(headers, rows, styles, widths):
    data = [[p(item, styles["head"]) for item in headers]]
    for row in rows:
        data.append([p(str(item), styles["cell"]) for item in row])
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#edf5f1")),
                ("GRID", (0, 0), (-1, -1), 0.45, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(18 * mm, 12 * mm, 192 * mm, 12 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(18 * mm, 7 * mm, doc.footer_text)
    canvas.drawRightString(192 * mm, 7 * mm, f"Page {doc.page}")
    canvas.restoreState()


class BalipayDoc(BaseDocTemplate):
    def __init__(self, filename, footer_text):
        super().__init__(
            filename,
            pagesize=A4,
            leftMargin=18 * mm,
            rightMargin=18 * mm,
            topMargin=17 * mm,
            bottomMargin=18 * mm,
        )
        self.footer_text = footer_text
        frame = Frame(self.leftMargin, self.bottomMargin + 5 * mm, self.width, self.height - 5 * mm, id="normal")
        self.addPageTemplates([PageTemplate(id="page", frames=[frame], onPage=footer)])


FR = {
    "file": OUT / "Balipay_Roadmap_Produit_Jalons_FR.pdf",
    "footer": "Balipay - Roadmap Produit et Jalons - Juin 2026",
    "title": "Roadmap Produit et Jalons",
    "subtitle": "Version francaise synthetique pour cadrer le lancement Balipay : produit, phases, objectifs et jalons d'execution.",
    "note": "Priorite annee 1 : ne pas construire une banque, mais prouver que 100 commercants chinois en France peuvent encaisser, suivre et rapprocher leurs paiements avec Balipay.",
    "roadmap_title": "1. Roadmap Produit",
    "roadmap_headers": ["Phase", "Periode", "Produit", "Objectif"],
    "roadmap_rows": [
        ["Phase 0", "0-2 mois", "Societe, site, etude marche, choix PSP/TPE", "20 LOI et partenaires identifies"],
        ["Phase 1", "2-6 mois", "MVP Merchant : TPE, QR, dashboard, cloture", "10 commercants pilotes"],
        ["Phase 2", "6-12 mois", "Stabilisation, Pay by Link, IA, multi-boutiques", "100 commercants actifs"],
        ["Phase 3", "12-24 mois", "Balipay Online : API, Shopify, WooCommerce", "Vendeurs e-commerce"],
        ["Phase 4", "24-36 mois", "Balipay Pro : factures, CRM, fidelite", "Plateforme commercant"],
        ["Phase 5", "36+ mois", "Wallet, carte virtuelle, IBAN, multi-devises", "Via partenaire BaaS/EMI"],
    ],
    "milestones_title": "2. Jalons",
    "milestones_headers": ["Date", "Jalon", "Critere de validation"],
    "milestones_rows": [
        ["M1", "SAS, marque, site, script d'entretiens", "Balipay peut presenter son offre et collecter des leads"],
        ["M2", "50 entretiens, 20 LOI, shortlist PSP/TPE", "Demande marche confirmee et partenaires compares"],
        ["M3", "Prototype TPE, QR payment, sandbox PSP", "Premier parcours paiement testable"],
        ["M4", "Webhooks, refunds, dashboard alpha", "Transactions consultables et refund testable"],
        ["M5", "Rapprochement journalier, IA, 10 pilotes", "Ecarts expliques et premiers commercants pilotes"],
        ["M6", "Securite, GDPR, support, bilan pilote", "Pret pour extension controlee"],
        ["M9", "30 commercants actifs, Pay by Link", "Usage recurrent et premier canal distant"],
        ["M12", "100 commercants, processus de deploiement", "Installation, formation et support standardises"],
        ["M18", "API Online + premier plugin", "Premier canal e-commerce operationnel"],
        ["M24", "Balipay Pro", "Facturation, CRM, fidelite et analytics disponibles"],
        ["M36", "Preparation Wallet / carte virtuelle", "BaaS/EMI selectionne, beta cadrable"],
    ],
}


EN = {
    "file": OUT / "Balipay_Product_Roadmap_Milestones_EN.pdf",
    "footer": "Balipay - Product Roadmap and Milestones - June 2026",
    "title": "Product Roadmap and Milestones",
    "subtitle": "English summary to frame Balipay's launch: product phases, goals and execution milestones.",
    "note": "Year-one priority: do not build a bank. Prove that 100 Chinese merchants in France can accept, monitor and reconcile payments through Balipay.",
    "roadmap_title": "1. Product Roadmap",
    "roadmap_headers": ["Phase", "Timeline", "Product Focus", "Goal"],
    "roadmap_rows": [
        ["Phase 0", "0-2 months", "Company, website, market research, PSP/POS selection", "20 LOIs and partner shortlist"],
        ["Phase 1", "2-6 months", "Merchant MVP: POS, QR, dashboard, reconciliation", "10 pilot merchants"],
        ["Phase 2", "6-12 months", "Stabilization, Pay by Link, AI, multi-store", "100 active merchants"],
        ["Phase 3", "12-24 months", "Balipay Online: API, Shopify, WooCommerce", "E-commerce sellers"],
        ["Phase 4", "24-36 months", "Balipay Pro: invoices, CRM, loyalty", "Merchant operating platform"],
        ["Phase 5", "36+ months", "Wallet, virtual card, IBAN, multi-currency", "Via BaaS/EMI partner"],
    ],
    "milestones_title": "2. Milestones",
    "milestones_headers": ["Time", "Milestone", "Validation Criteria"],
    "milestones_rows": [
        ["M1", "SAS, brand, website, interview script", "Balipay can present the offer and collect leads"],
        ["M2", "50 interviews, 20 LOIs, PSP/POS shortlist", "Market demand confirmed and partners compared"],
        ["M3", "POS prototype, QR payment, PSP sandbox", "First payment journey testable"],
        ["M4", "Webhooks, refunds, dashboard alpha", "Transactions visible and refunds testable"],
        ["M5", "Daily reconciliation, AI, 10 pilots", "Discrepancies explained and first pilot merchants live"],
        ["M6", "Security, GDPR, support, pilot review", "Ready for controlled expansion"],
        ["M9", "30 active merchants, Pay by Link", "Recurring usage and first remote payment channel"],
        ["M12", "100 merchants, deployment process", "Installation, training and support standardized"],
        ["M18", "Online API + first plugin", "First e-commerce channel operational"],
        ["M24", "Balipay Pro", "Invoicing, CRM, loyalty and analytics available"],
        ["M36", "Wallet / virtual card preparation", "BaaS/EMI selected, beta scope ready"],
    ],
}


def build(config):
    s = get_styles()
    doc = BalipayDoc(str(config["file"]), config["footer"])
    story = [
        p("Balipay", s["brand"]),
        p(config["title"], s["title"]),
        p(config["subtitle"], s["subtitle"]),
        p(config["note"], s["note"]),
        Spacer(1, 5 * mm),
        p(config["roadmap_title"], s["h2"]),
        make_table(config["roadmap_headers"], config["roadmap_rows"], s, [26 * mm, 26 * mm, 88 * mm, 34 * mm]),
        Spacer(1, 6 * mm),
        p(config["milestones_title"], s["h2"]),
        make_table(config["milestones_headers"], config["milestones_rows"], s, [24 * mm, 68 * mm, 82 * mm]),
    ]
    doc.build(story)


if __name__ == "__main__":
    build(FR)
    build(EN)
