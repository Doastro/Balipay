from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, Frame, PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle


OUT = Path("docs/Yavin_Checklist_Balipay_MVP.pdf")

JADE = colors.HexColor("#14745f")
JADE_DARK = colors.HexColor("#0d4f42")
INK = colors.HexColor("#13201d")
MUTED = colors.HexColor("#5f6f69")
LINE = colors.HexColor("#dce5e0")
SOFT = colors.HexColor("#f5f8f6")
HIGHLIGHT = colors.HexColor("#fff2b8")


def styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=25,
            leading=30,
            textColor=INK,
            spaceAfter=8,
        ),
        "subtitle": ParagraphStyle(
            "subtitle",
            parent=base["BodyText"],
            fontSize=10,
            leading=14,
            textColor=MUTED,
            spaceAfter=10,
        ),
        "section": ParagraphStyle(
            "section",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=17,
            textColor=JADE_DARK,
            spaceBefore=8,
            spaceAfter=4,
        ),
        "highlight": ParagraphStyle(
            "highlight",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12.5,
            leading=16,
            textColor=INK,
            backColor=HIGHLIGHT,
            borderColor=colors.HexColor("#e0c94c"),
            borderWidth=0.6,
            borderPadding=5,
            spaceBefore=8,
            spaceAfter=5,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["BodyText"],
            fontSize=9.3,
            leading=12.2,
            textColor=INK,
            leftIndent=4 * mm,
            bulletIndent=0,
            spaceAfter=2,
        ),
        "quote": ParagraphStyle(
            "quote",
            parent=base["BodyText"],
            fontSize=9.8,
            leading=13.2,
            textColor=INK,
            backColor=SOFT,
            borderColor=JADE,
            borderWidth=0.7,
            borderPadding=7,
            leftIndent=2 * mm,
            rightIndent=2 * mm,
            spaceAfter=7,
        ),
        "small": ParagraphStyle(
            "small",
            parent=base["BodyText"],
            fontSize=8,
            leading=10,
            textColor=MUTED,
        ),
    }


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(18 * mm, 12 * mm, 192 * mm, 12 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(18 * mm, 7 * mm, "Balipay - Checklist Yavin MVP")
    canvas.drawRightString(192 * mm, 7 * mm, f"Page {doc.page}")
    canvas.restoreState()


class ChecklistDoc(BaseDocTemplate):
    def __init__(self, filename):
        super().__init__(
            filename,
            pagesize=A4,
            leftMargin=18 * mm,
            rightMargin=18 * mm,
            topMargin=16 * mm,
            bottomMargin=18 * mm,
        )
        frame = Frame(self.leftMargin, self.bottomMargin + 5 * mm, self.width, self.height - 5 * mm, id="normal")
        self.addPageTemplates([PageTemplate(id="page", frames=[frame], onPage=footer)])


def p(text, style):
    return Paragraph(text, style)


def bullet(text, s):
    return Paragraph(text, s["body"], bulletText="-")


def add_section(story, title, items, s):
    story.append(p(title, s["section"]))
    for item in items:
        story.append(bullet(item, s))


def add_highlight(story, title, s):
    story.append(p(title, s["highlight"]))


sections = [
    (
        "1. Positionnement du partenariat",
        [
            "Est-ce que Balipay peut utiliser Yavin comme fournisseur TPE/API pour ses propres commercants ?",
            "Est-ce que Balipay peut avoir sa propre marque, son dashboard et son application ?",
            "Qui signe le contrat paiement avec le commercant : Yavin/eZyness, Balipay, ou les deux ?",
            "Est-ce que Balipay peut facturer ses propres services separement : abonnement, dashboard, support, IA, reporting ?",
        ],
    ),
    (
        "2. API Cloud Yavin",
        [
            "Est-ce que l'API Cloud permet de declencher un paiement sur un TPE precis ?",
            "Comment associer un TPE Yavin a un commercant Balipay ?",
            "Peut-on creer une transaction depuis le serveur Balipay avec un amount, currency, merchant_id, terminal_id, order_id ?",
            "Est-ce que Yavin renvoie un statut en temps reel ?",
            "Y a-t-il des webhooks pour paiement reussi, echoue, annule, rembourse ?",
            "Peut-on faire des remboursements via API ? Si oui, c'est combien le delai ?",
        ],
    ),
    (
        "3. Donnees et independance Balipay",
        [
            "Est-ce que Balipay peut stocker son propre identifiant de commande dans la transaction Yavin ?",
            "Peut-on envoyer un champ metadata ou external_reference ?",
            "Est-ce que Balipay peut recevoir toutes les donnees necessaires pour son dashboard ?",
            "Quelles donnees transactionnelles sont accessibles via API ?",
            "Est-ce que les donnees commercants/transactions restent exportables ?",
            "En cas de changement de fournisseur, Balipay garde-t-il son historique et ses references ?",
        ],
    ),
    (
        "4. Moyens de paiement activables",
        [
            "CB est-il active par defaut ?",
            "Visa et Mastercard sont-ils actives ?",
            "Apple Pay / Google Pay fonctionnent-ils via sans contact ?",
            "UnionPay carte est-il disponible ?",
            "UnionPay QuickPass est-il disponible ?",
            "Amex, JCB, Diners, Discover sont-ils possibles ?",
            "Quels moyens de paiement dependent du contrat acquereur ?",
            "Quels moyens necessitent une activation separee ?",
            "Quels sont les frais par moyen de paiement ?",
        ],
    ),
]

sections_2 = [
    (
        "5. Alipay / WeChat Pay",
        [
            "Yavin propose-t-il directement Alipay ou WeChat Pay ?",
            "Si non, peut-on les integrer separement dans l'application Balipay ?",
            "Est-ce qu'une application Balipay installee sur le TPE peut afficher un QR Alipay/WeChat Pay ?",
            "Peut-on utiliser la camera/scanner du TPE pour scanner un QR client ?",
            "Est-ce que Yavin autorise une app tierce Balipay sur le terminal ?",
            "Quel est le processus de validation/deploiement d'un APK Balipay sur TPE Yavin ?",
        ],
    ),
    (
        "6. Application sur TPE",
        [
            "Le TPE Yavin est-il Android ?",
            "Peut-on installer une application Balipay native ou hybride ?",
            "Quels SDK ou Intent APIs sont disponibles ?",
            "Peut-on lancer Yavin Pay depuis une app Balipay ?",
            "Peut-on revenir automatiquement vers l'app Balipay apres paiement ?",
            "Peut-on imprimer un recu personnalise Balipay ?",
            "Peut-on acceder au scanner, a l'imprimante, au NFC, a la camera ?",
        ],
    ),
    (
        "7. Reglement des fonds",
        [
            "Qui detient les fonds ?",
            "Qui regle le commercant ?",
            "Quel est le delai de reglement : J+1, J+2, hebdomadaire ?",
            "Est-ce que les frais sont deduits avant reglement ?",
            "Peut-on recuperer le detail des settlements via API ?",
            "Peut-on rapprocher transaction par transaction ?",
            "Y a-t-il un rapport de settlement exportable ?",
        ],
    ),
    (
        "8. Frais et modele economique",
        [
            "Frais transaction CB/Visa/Mastercard ?",
            "Frais fixes par transaction ?",
            "Abonnement mensuel TPE ?",
            "Location ou achat du terminal ?",
            "Frais d'installation ?",
            "Frais de remboursement ?",
            "Frais chargeback ?",
            "Commission possible pour Balipay ?",
            "Tarifs degressifs a 100, 300, 1000 commercants ?",
        ],
    ),
]

sections_3 = [
    (
        "9. Support et operations",
        [
            "Qui supporte le commercant en cas de panne TPE ?",
            "Qui supporte les problemes de paiement ?",
            "Remplacement TPE en combien de temps ?",
            "Gestion SIM / 4G / Wi-Fi ?",
            "Back-office pour voir l'etat des terminaux ?",
        ],
    ),
    (
        "10. Securite et conformite",
        [
            "Yavin/eZyness porte quel statut reglementaire ?",
            "Quelle est la responsabilite de Balipay ?",
            "Quel est le perimetre PCI-DSS de Balipay si on utilise API Cloud ?",
            "Balipay ne manipule-t-il jamais les donnees carte ?",
            "Comment sont signes les appels API ?",
            "Comment sont securises les webhooks ?",
            "Existe-t-il des logs d'audit ?",
            "Quelles exigences GDPR cote Balipay ?",
        ],
    ),
    (
        "11. Test pilote",
        [
            "2 a 5 TPE Yavin.",
            "2 a 3 commercants tests.",
            "Acces API production limitee.",
            "Declenchement paiement depuis serveur Balipay.",
            "Reception webhook.",
            "Remboursement test.",
            "Export transactions.",
            "Test cloture journaliere.",
            "Test recu imprime.",
            "Test reseau Wi-Fi/4G.",
        ],
    ),
]


def build():
    s = styles()
    doc = ChecklistDoc(str(OUT))
    story = [
        p("Checklist Yavin pour Balipay MVP", s["title"]),
        p(
            "Option MVP : Application Balipay Web/Caisse -> Serveur Balipay -> API Cloud Yavin -> TPE Yavin -> Paiement CB / Visa / Mastercard.",
            s["subtitle"],
        ),
    ]

    for title, items in sections:
        add_section(story, title, items, s)

    add_highlight(story, "Phrase exacte a demander", s)
    story.append(
        p(
            "Sur un TPE Yavin utilise par Balipay, quels reseaux sont activables : CB, Visa, Mastercard, Apple Pay, Google Pay, UnionPay, Amex, JCB ? Et lesquels sont inclus dans le contrat standard ?",
            s["quote"],
        )
    )

    story.append(PageBreak())
    for title, items in sections_2:
        add_section(story, title, items, s)

    story.append(PageBreak())
    for title, items in sections_3:
        add_section(story, title, items, s)

    add_highlight(story, "Question cle finale", s)
    story.append(
        p(
            "Si Balipay amene 100 a 300 commercants, pouvez-vous nous fournir une architecture ou Balipay garde son interface, son dashboard, ses donnees metier et sa relation commercant, tandis que Yavin gere le TPE, l'acquisition carte et le reglement des fonds ?",
            s["quote"],
        )
    )

    add_highlight(story, "Decision a obtenir apres l'appel", s)
    for item in [
        "L'API Cloud couvre-t-elle paiement, refund, webhook, transaction lookup ?",
        "Balipay peut-il garder son propre order_id ?",
        "UnionPay est-il activable ?",
        "Une app Balipay peut-elle etre installee sur TPE ?",
        "Quel est le cout par TPE et par transaction ?",
        "Qui signe le commercant ?",
        "Quel pilote peut demarrer sous 30 jours ?",
    ]:
        story.append(bullet(item, s))

    doc.build(story)


if __name__ == "__main__":
    build()
