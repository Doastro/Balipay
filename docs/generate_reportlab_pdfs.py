from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


JADE = colors.HexColor("#14745f")
JADE_DARK = colors.HexColor("#0d4f42")
INK = colors.HexColor("#13201d")
MUTED = colors.HexColor("#5f6f69")
LINE = colors.HexColor("#dce5e0")
SOFT = colors.HexColor("#f5f8f6")
RED = colors.HexColor("#a6403a")


def styles():
    base = getSampleStyleSheet()
    return {
        "cover_brand": ParagraphStyle(
            "cover_brand",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=JADE_DARK,
        ),
        "cover_title": ParagraphStyle(
            "cover_title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=31,
            leading=36,
            textColor=INK,
            alignment=TA_LEFT,
            spaceBefore=45,
            spaceAfter=18,
        ),
        "subtitle": ParagraphStyle(
            "subtitle",
            parent=base["Normal"],
            fontSize=14,
            leading=20,
            textColor=MUTED,
            spaceAfter=18,
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=17,
            leading=22,
            textColor=JADE_DARK,
            spaceBefore=8,
            spaceAfter=8,
        ),
        "h3": ParagraphStyle(
            "h3",
            parent=base["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=15,
            textColor=INK,
            spaceBefore=7,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["BodyText"],
            fontSize=9.6,
            leading=13,
            textColor=INK,
            spaceAfter=6,
        ),
        "note": ParagraphStyle(
            "note",
            parent=base["BodyText"],
            fontSize=9.4,
            leading=13,
            textColor=INK,
            backColor=SOFT,
            borderColor=JADE,
            borderWidth=0.8,
            borderPadding=7,
            spaceAfter=8,
        ),
        "small": ParagraphStyle(
            "small",
            parent=base["Normal"],
            fontSize=8,
            leading=10,
            textColor=MUTED,
            alignment=TA_CENTER,
        ),
        "cell": ParagraphStyle(
            "cell",
            parent=base["BodyText"],
            fontSize=7.6,
            leading=9.5,
            textColor=INK,
        ),
        "head": ParagraphStyle(
            "head",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=7.2,
            leading=9,
            textColor=JADE_DARK,
        ),
    }


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(18 * mm, 12 * mm, 192 * mm, 12 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(18 * mm, 7 * mm, doc.footer_text)
    canvas.drawRightString(192 * mm, 7 * mm, f"Page {doc.page}")
    canvas.restoreState()


class RoadmapDoc(BaseDocTemplate):
    def __init__(self, filename, footer_text):
        super().__init__(
            filename,
            pagesize=A4,
            leftMargin=18 * mm,
            rightMargin=18 * mm,
            topMargin=18 * mm,
            bottomMargin=18 * mm,
        )
        self.footer_text = footer_text
        frame = Frame(
            self.leftMargin,
            self.bottomMargin + 5 * mm,
            self.width,
            self.height - 5 * mm,
            id="normal",
        )
        self.addPageTemplates([PageTemplate(id="page", frames=[frame], onPage=footer)])


def p(text, style):
    return Paragraph(text.replace("\n", "<br/>"), style)


def make_table(headers, rows, s, widths=None):
    data = [[p(h, s["head"]) for h in headers]]
    for row in rows:
        data.append([p(str(cell), s["cell"]) for cell in row])
    if widths is None:
        widths = [38 * mm, 24 * mm, 72 * mm, 40 * mm]
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


def section(story, title, body, s):
    story.append(p(title, s["h2"]))
    if body:
        story.append(p(body, s["body"]))


FR = {
    "file": "docs/Balipay_Roadmap_Technique_CTO_FR.pdf",
    "footer": "Balipay - Roadmap Technique CTO - Juin 2026",
    "title": "Roadmap Technique CTO",
    "subtitle": "Plateforme d'agregation de paiements transfrontaliers pour les commercants chinois en France et les entreprises Chine-Europe.",
    "meta": [
        "Version : Juin 2026",
        "Positionnement : Balipay comme couche commerciale, TPE/POS, QR, dashboard, IA et integration PSP, sans detention directe des fonds au lancement.",
        "Slogan : Balipay - Votre passerelle entre la Chine et l'Europe.",
    ],
    "principles": "Balipay ne doit pas se comporter comme une banque au demarrage. Le produit doit d'abord devenir un systeme operationnel pour les commercants : TPE, QR code, paiement, tableau de bord, rapprochement, reporting et support bilingue.",
    "flow": "Flux recommande : Client -> TPE / QR Balipay -> API Balipay -> Partenaire PSP -> Alipay / WeChat Pay / CB / UnionPay -> Compte commercant. Le PSP agree gere collecte, safeguarding, conformite, litiges, remboursements et settlement. Balipay gere l'experience commercant, les connecteurs, les rapports, l'IA et la distribution terrain.",
    "sections": [
        (
            "1. Passerelle de Paiement / PSP Gateway",
            "Objectif : construire une passerelle Balipay capable d'accepter des paiements via TPE, QR code et partenaire PSP. Duree realiste : 8 a 12 semaines. Un prototype visuel peut etre realise en 4 semaines, mais une version testable avec securite, callbacks, remboursements et logs demande plus de temps.",
            ["Etape", "Duree", "Contenu", "Livrable"],
            [
                ["Architecture paiement", "1 semaine", "Definir les flux commande, paiement, remboursement, settlement et webhook.", "Schema technique et flux de fonds"],
                ["Evaluation PSP", "1 a 2 semaines", "Comparer Silkpay, Worldline, YabandPay, 2PayNow, Adyen, Checkout.com.", "Matrice API, cout, conformite"],
                ["Choix TPE", "1 semaine", "Comparer Sunmi, PAX, Newland : Android SDK, imprimante, scanner, securite.", "Shortlist fournisseur"],
                ["Prototype TPE", "2 semaines", "Saisie montant, creation ordre, QR, statut, recu.", "Application TPE alpha"],
                ["Integration API PSP", "2 a 3 semaines", "Paiement, webhook, refund, transaction lookup, sandbox.", "Connecteur PSP MVP"],
                ["Alipay / WeChat Pay indirect", "1 semaine", "Passer par le PSP partenaire plutot que par un contrat direct.", "Transactions test"],
                ["Securite et observabilite", "1 a 2 semaines", "Signature API, idempotence, validation webhook, logs, alertes.", "Baseline securite"],
                ["Tests terrain", "1 a 2 semaines", "Echecs, coupure reseau, doublons, refund, cloture journee.", "Rapport de tests"],
            ],
        ),
        (
            "2. Etude Marche, Tarification et Services",
            "Objectif : identifier les prix et services que les commercants chinois sont reellement prets a acheter. Duree : 4 a 6 semaines, en parallele de la construction technique.",
            ["Etape", "Duree", "Contenu", "Livrable"],
            [
                ["Questionnaire commercants", "2 jours", "Restaurants, epiceries, salons, agences, boutiques, grossistes.", "Script d'entretien"],
                ["50 entretiens terrain", "2 a 3 semaines", "Paris 13e, Belleville, Aubervilliers.", "Base besoins/prix"],
                ["Tests de prix", "1 semaine", "Commission, abonnement, location TPE, frais d'installation.", "Grille tarifaire"],
                ["Packages services", "1 semaine", "Basic, TPE, Pro, Premium.", "Offres commerciales"],
                ["Intentions pilotes", "1 a 2 semaines", "Obtenir 20 lettres d'intention.", "Liste pilotes"],
            ],
        ),
        (
            "3. Site Web et Application Commercant",
            "Objectif : creer un site comparable a Silkpay en clarte, avec une application commercant simple et bilingue. Duree : 4 a 6 semaines.",
            ["Etape", "Duree", "Contenu", "Livrable"],
            [
                ["Landing page", "1 semaine", "Expliquer la valeur : accepter Alipay, WeChat Pay et CB, recevoir des euros.", "Page d'accueil"],
                ["Pages sectorielles", "1 semaine", "Restaurant, retail, tourisme, grossiste, e-commerce.", "Pages conversion"],
                ["FAQ et tarifs", "3 a 5 jours", "Frais, settlement, refund, installation, conformite.", "FAQ bilingue"],
                ["Formulaire commercant", "1 semaine", "SIRET, adresse, contact, besoin, volume estime.", "Lead funnel"],
                ["Chatbot", "1 semaine", "Reponses francais/chinois sur tarifs, installation, TPE, paiement.", "Chatbot MVP"],
                ["Application commercant", "2 semaines", "Connexion, transactions, cloture, refund, support.", "App commercant MVP"],
            ],
        ),
        (
            "4. Espace de Gestion Boutique",
            "Objectif : donner au commercant un controle en temps reel sur ses paiements, ventes, remboursements, frais et anomalies. Duree : 6 a 8 semaines.",
            ["Etape", "Duree", "Contenu", "Livrable"],
            [
                ["Dashboard", "1 a 2 semaines", "Chiffre du jour, nombre de transactions, moyens de paiement.", "Tableau de bord"],
                ["Gestion transactions", "1 semaine", "Recherche, filtres, details, statut, reference PSP.", "Transaction table"],
                ["Cloture et rapprochement", "2 semaines", "Comparer TPE, QR, remboursements, frais, settlement.", "Daily closing"],
                ["Exports financiers", "1 semaine", "CSV, PDF, TVA, synthese comptable.", "Exports comptables"],
                ["Assistant IA", "1 a 2 semaines", "Expliquer anomalies, resumer journee, traduire, preparer message comptable.", "AI Copilot"],
                ["Multi-boutiques", "1 semaine", "Un proprietaire peut suivre plusieurs etablissements.", "Multi-store MVP"],
            ],
        ),
        (
            "5. Conformite Reglementaire",
            "Objectif : limiter le risque reglementaire en France, en Europe et cote Chine. Duree initiale : 4 a 6 semaines, puis suivi continu.",
            ["Etape", "Duree", "Contenu", "Livrable"],
            [
                ["Positionnement legal", "1 semaine", "Determiner si Balipay est prestataire technique, distributeur, agent PSP ou autre.", "Legal memo"],
                ["Contrat PSP", "1 a 2 semaines", "Responsabilites KYC, AML, fonds, remboursements, litiges.", "Checklist contrat"],
                ["KYC / AML", "1 semaine", "Documents, UBO, risque secteur, sanctions.", "Process KYB"],
                ["GDPR", "1 semaine", "Donnees, consentement, conservation, DPA, politique confidentialite.", "Pack privacy"],
                ["Conformite Chine", "1 a 2 semaines", "Regles Alipay/WeChat Pay, change, marketing, settlement transfrontalier.", "China memo"],
                ["Securite paiement", "1 a 2 semaines", "PCI-DSS scope, gestion cles, acces, logs, incidents.", "Security checklist"],
            ],
        ),
        (
            "6. Partenaires de Paiement",
            "Objectif : choisir un partenaire initial capable de servir les commercants chinois et touristiques en France. Duree : 4 a 8 semaines.",
            ["Etape", "Duree", "Contenu", "Livrable"],
            [
                ["Longlist", "3 jours", "Silkpay, Worldline, YabandPay, 2PayNow, Adyen, Checkout.com.", "Liste partenaires"],
                ["Evaluation API", "1 semaine", "QR, TPE, refund, reporting, sandbox, webhooks.", "Scorecard API"],
                ["Evaluation business", "1 semaine", "Frais, settlement, minimums, marque blanche, support.", "Scorecard business"],
                ["Evaluation conformite", "1 semaine", "Qui fait KYC, AML, detention de fonds, litiges.", "Matrice conformite"],
                ["Negociation pilote", "2 a 4 semaines", "Conditions pour 10 a 20 commercants pilotes.", "Contrat pilote"],
            ],
        ),
        (
            "7. Administration et Operations",
            "Objectif : rendre Balipay capable de signer, facturer, installer, former et supporter des commercants. Duree : 4 a 6 semaines.",
            ["Etape", "Duree", "Contenu", "Livrable"],
            [
                ["Creation SAS", "1 a 2 semaines", "Societe, banque, comptable, assurance.", "Balipay SAS"],
                ["Marque et domaine", "2 a 3 jours", "Nom, logo, domaine, emails.", "Brand assets"],
                ["Contrat commercant", "1 semaine", "Tarifs, TPE, responsabilites, refund, resiliation.", "Merchant agreement"],
                ["Documents legaux", "1 semaine", "CGU, privacy policy, DPA, mentions legales.", "Legal pack"],
                ["Support", "1 semaine", "WeChat, email, telephone, tickets, SLA.", "Support playbook"],
                ["Installation terrain", "1 semaine", "Livraison TPE, formation, check de paiement, suivi J+7.", "Onboarding checklist"],
            ],
        ),
        (
            "8. Methodes d'Integration",
            "Objectif : transformer Balipay en infrastructure multi-canal, pas seulement en terminal de paiement. Duree globale : 12 a 18 mois.",
            ["Integration", "Duree", "Priorite", "Usage"],
            [
                ["QR statique", "2 semaines", "P0", "Demarrage rapide petits commercants"],
                ["QR dynamique", "3 a 4 semaines", "P0", "Montant genere par caisse ou TPE"],
                ["TPE Android", "8 a 12 semaines", "P0", "Restaurants, epiceries, boutiques, tourisme"],
                ["Pay by Link", "3 a 4 semaines", "P1", "Acompte, vente a distance, WeChat"],
                ["Hosted checkout", "4 a 6 semaines", "P1", "Page de paiement web"],
                ["API paiement", "6 a 8 semaines", "P1", "Marchands plus avances"],
                ["Plugins e-commerce", "8 a 10 semaines chacun", "P2", "Shopify, WooCommerce, PrestaShop"],
                ["Mini-programme WeChat", "8 a 12 semaines", "P3", "Experience client chinois"],
                ["In-app payment", "8 a 12 semaines", "P3", "Future application client Balipay"],
            ],
        ),
        (
            "9. Banking-as-a-Service, Wallet et Cartes",
            "Objectif : preparer le futur wallet, les cartes virtuelles, l'IBAN et le cashback, sans les lancer trop tot. Recherche initiale : 8 a 12 semaines. Produit reel : 6 a 12 mois apres validation commerciale.",
            ["Etape", "Duree", "Contenu", "Livrable"],
            [
                ["Evaluation BaaS", "2 a 3 semaines", "Treezor, Swan, Solaris et autres EMI.", "BaaS matrix"],
                ["Frontieres produit", "1 a 2 semaines", "Wallet, carte, IBAN, cashback : dependances legales et techniques.", "Compliance map"],
                ["KYC / KYB", "2 semaines", "Particuliers, commercants, societes.", "Parcours onboarding"],
                ["Ledger", "2 a 3 semaines", "Soldes, cashback, remboursements, gel, ajustements.", "Architecture ledger"],
                ["PoC carte virtuelle", "4 a 8 semaines", "Emission, limites, notifications, transactions.", "PoC issuing"],
                ["Wallet beta", "3 a 6 mois", "Test limite avec utilisateurs controles.", "Beta fermee"],
            ],
        ),
    ],
    "plan_title": "Planning Technique 12 Mois",
    "plan": [
        ["M1", "Architecture, evaluation partenaires, choix TPE, etude commercants."],
        ["M2", "Site, formulaire commercant, sandbox PSP, prototype TPE."],
        ["M3", "QR payment, webhook, dashboard alpha."],
        ["M4", "TPE beta, refunds, recherche transaction, logs."],
        ["M5", "Cloture, rapprochement, IA reporting, 10 commercants pilotes."],
        ["M6", "Securite, GDPR, support admin, bilan pilote."],
        ["M7-M8", "30 commercants, stabilite, deploiement TPE, formation."],
        ["M9-M10", "Pay by Link, moyens additionnels, reporting avance."],
        ["M11-M12", "Preparation 100 commercants, facturation Balipay, back-office sales."],
    ],
    "mvp": [
        ["P0", "Onboarding commercant, TPE App, QR payment, PSP API, webhooks, refund, dashboard, cloture, admin, export, bilingue, monitoring."],
        ["P1", "Pay by Link, facturation des frais, multi-boutiques, fidelite, cashback finance commercant, integration comptable."],
        ["P2", "Wallet, carte virtuelle, IBAN, compte multi-devises, carte physique, partenariat direct Alipay/Tencent."],
    ],
    "conclusion": "La premiere annee, Balipay ne doit pas essayer de devenir Revolut. Le bon objectif technique est de devenir le systeme de paiement operationnel de 100 commercants chinois en France : TPE, QR, partenaire PSP, back-office, rapprochement journalier, support bilingue et IA d'assistance.",
}


EN = {
    "file": "docs/Balipay_CTO_Technical_Roadmap_EN.pdf",
    "footer": "Balipay - CTO Technical Roadmap - June 2026",
    "title": "CTO Technical Roadmap",
    "subtitle": "Cross-border payment aggregation platform for Chinese merchants in France and China-Europe businesses.",
    "meta": [
        "Version: June 2026",
        "Positioning: Balipay as the commercial, POS, QR, dashboard, AI and PSP-integration layer, without directly holding funds at launch.",
        "Tagline: Balipay - Your gateway between China and Europe.",
    ],
    "principles": "Balipay should not behave like a bank at launch. The first product should become an operating system for merchants: POS, QR payment, merchant dashboard, reconciliation, reporting and bilingual support.",
    "flow": "Recommended flow: Customer -> Balipay POS / QR -> Balipay API -> PSP Partner -> Alipay / WeChat Pay / Card / UnionPay -> Merchant Account. The licensed PSP handles collection, safeguarding, compliance, refunds, disputes and settlement. Balipay owns the merchant experience, connectors, reporting, AI assistance and field distribution.",
    "sections": [
        (
            "1. Payment Gateway / PSP Gateway",
            "Objective: build a Balipay gateway able to accept payments through POS terminals, QR codes and a PSP partner. Realistic duration: 8 to 12 weeks. A visual demo can be built in 4 weeks, but a testable product with security, callbacks, refunds and logs requires more time.",
            ["Step", "Duration", "Scope", "Deliverable"],
            [
                ["Payment architecture", "1 week", "Define order, payment, refund, settlement and webhook flows.", "Technical and fund-flow diagrams"],
                ["PSP evaluation", "1 to 2 weeks", "Compare Silkpay, Worldline, YabandPay, 2PayNow, Adyen and Checkout.com.", "API, cost and compliance matrix"],
                ["POS supplier selection", "1 week", "Compare Sunmi, PAX and Newland: Android SDK, printer, scanner, security.", "Supplier shortlist"],
                ["POS prototype", "2 weeks", "Amount input, order creation, QR display, payment status, receipt.", "POS alpha app"],
                ["PSP API integration", "2 to 3 weeks", "Payment, webhook, refund, transaction lookup and sandbox integration.", "PSP connector MVP"],
                ["Indirect Alipay / WeChat Pay", "1 week", "Use the PSP partner instead of direct contracts at launch.", "Test transactions"],
                ["Security and observability", "1 to 2 weeks", "API signatures, idempotency, webhook validation, logs and alerts.", "Security baseline"],
                ["Field testing", "1 to 2 weeks", "Failure cases, network loss, duplicates, refunds and daily closing.", "Test report"],
            ],
        ),
        (
            "2. Market, Pricing and Services Research",
            "Objective: identify what Chinese merchants are truly willing to pay for. Duration: 4 to 6 weeks, in parallel with product development.",
            ["Step", "Duration", "Scope", "Deliverable"],
            [
                ["Merchant interview guide", "2 days", "Restaurants, groceries, salons, agencies, boutiques and wholesalers.", "Interview script"],
                ["50 field interviews", "2 to 3 weeks", "Paris 13e, Belleville and Aubervilliers.", "Needs and pricing database"],
                ["Pricing tests", "1 week", "Commission, subscription, POS rental and installation fees.", "Pricing grid"],
                ["Service packages", "1 week", "Basic, POS, Pro and Premium.", "Commercial offers"],
                ["Pilot commitments", "1 to 2 weeks", "Secure 20 letters of intent.", "Pilot merchant list"],
            ],
        ),
        (
            "3. Website and Merchant Application",
            "Objective: create a website with the clarity and trust level of Silkpay, plus a simple bilingual merchant app. Duration: 4 to 6 weeks.",
            ["Step", "Duration", "Scope", "Deliverable"],
            [
                ["Landing page", "1 week", "Explain the value: accept Alipay, WeChat Pay and cards, receive euros.", "Homepage"],
                ["Industry pages", "1 week", "Restaurant, retail, tourism, wholesale and e-commerce.", "Conversion pages"],
                ["FAQ and pricing", "3 to 5 days", "Fees, settlement, refunds, installation and compliance.", "Bilingual FAQ"],
                ["Merchant application form", "1 week", "SIRET, address, contact, needs and estimated volume.", "Lead funnel"],
                ["Chatbot", "1 week", "French/Chinese answers about pricing, installation, POS and payments.", "Chatbot MVP"],
                ["Merchant application", "2 weeks", "Login, transactions, daily closing, refund request and support.", "Merchant app MVP"],
            ],
        ),
        (
            "4. Merchant Management Space",
            "Objective: give merchants real-time control over payments, sales, refunds, fees and anomalies. Duration: 6 to 8 weeks.",
            ["Step", "Duration", "Scope", "Deliverable"],
            [
                ["Dashboard", "1 to 2 weeks", "Daily revenue, transaction count and payment-method split.", "Merchant dashboard"],
                ["Transaction management", "1 week", "Search, filters, details, status and PSP reference.", "Transaction table"],
                ["Daily closing and reconciliation", "2 weeks", "Compare POS, QR, refunds, fees and settlement.", "Daily closing module"],
                ["Financial exports", "1 week", "CSV, PDF, VAT fields and accounting summary.", "Accounting exports"],
                ["AI assistant", "1 to 2 weeks", "Explain anomalies, summarize the day, translate and prepare accountant messages.", "AI Copilot"],
                ["Multi-store", "1 week", "One owner can monitor several stores.", "Multi-store MVP"],
            ],
        ),
        (
            "5. Regulatory Compliance",
            "Objective: reduce regulatory risk in France, Europe and China. Initial design: 4 to 6 weeks, then continuous review.",
            ["Step", "Duration", "Scope", "Deliverable"],
            [
                ["Legal positioning", "1 week", "Determine whether Balipay is a technology provider, distributor, PSP agent or other role.", "Legal memo"],
                ["PSP contract review", "1 to 2 weeks", "KYC, AML, funds, refunds, disputes and responsibility boundaries.", "Contract checklist"],
                ["KYC / AML", "1 week", "Documents, UBO, sector risk and sanctions screening.", "KYB process"],
                ["GDPR", "1 week", "Data, consent, retention, DPA and privacy policy.", "Privacy pack"],
                ["China-side compliance", "1 to 2 weeks", "Alipay/WeChat Pay rules, FX, marketing and cross-border settlement.", "China memo"],
                ["Payment security", "1 to 2 weeks", "PCI-DSS scope, key management, access control, logs and incident process.", "Security checklist"],
            ],
        ),
        (
            "6. Payment Partners",
            "Objective: select an initial partner able to serve Chinese and tourism-oriented merchants in France. Duration: 4 to 8 weeks.",
            ["Step", "Duration", "Scope", "Deliverable"],
            [
                ["Longlist", "3 days", "Silkpay, Worldline, YabandPay, 2PayNow, Adyen, Checkout.com.", "Partner list"],
                ["API evaluation", "1 week", "QR, POS, refunds, reporting, sandbox and webhooks.", "API scorecard"],
                ["Business evaluation", "1 week", "Fees, settlement, minimums, white-label capability and support.", "Business scorecard"],
                ["Compliance evaluation", "1 week", "Who owns KYC, AML, funds and disputes.", "Compliance matrix"],
                ["Pilot negotiation", "2 to 4 weeks", "Conditions for 10 to 20 pilot merchants.", "Pilot contract"],
            ],
        ),
        (
            "7. Administration and Operations",
            "Objective: make Balipay able to sign, bill, install, train and support merchants. Duration: 4 to 6 weeks.",
            ["Step", "Duration", "Scope", "Deliverable"],
            [
                ["SAS incorporation", "1 to 2 weeks", "Company, bank account, accountant and insurance.", "Balipay SAS"],
                ["Brand and domain", "2 to 3 days", "Name, logo, domain and email setup.", "Brand assets"],
                ["Merchant contract", "1 week", "Pricing, POS, responsibilities, refunds and termination.", "Merchant agreement"],
                ["Legal documents", "1 week", "Terms, privacy policy, DPA and legal notices.", "Legal pack"],
                ["Support", "1 week", "WeChat, email, phone, tickets and SLA.", "Support playbook"],
                ["Field installation", "1 week", "POS delivery, training, payment test and D+7 follow-up.", "Onboarding checklist"],
            ],
        ),
        (
            "8. Integration Methods",
            "Objective: turn Balipay into multi-channel payment infrastructure, not just a terminal provider. Overall duration: 12 to 18 months.",
            ["Integration", "Duration", "Priority", "Use Case"],
            [
                ["Static QR", "2 weeks", "P0", "Fast start for small merchants"],
                ["Dynamic QR", "3 to 4 weeks", "P0", "Amount generated by POS or cashier system"],
                ["Android POS", "8 to 12 weeks", "P0", "Restaurants, groceries, boutiques and tourism"],
                ["Pay by Link", "3 to 4 weeks", "P1", "Deposits, remote sales and WeChat sharing"],
                ["Hosted checkout", "4 to 6 weeks", "P1", "Web payment page"],
                ["Payment API", "6 to 8 weeks", "P1", "Advanced merchants"],
                ["E-commerce plugins", "8 to 10 weeks each", "P2", "Shopify, WooCommerce and PrestaShop"],
                ["WeChat Mini Program", "8 to 12 weeks", "P3", "Chinese customer experience"],
                ["In-app payment", "8 to 12 weeks", "P3", "Future Balipay customer app"],
            ],
        ),
        (
            "9. Banking-as-a-Service, Wallet and Cards",
            "Objective: prepare future wallet, virtual card, IBAN and cashback capabilities without launching them too early. Initial research: 8 to 12 weeks. Real productization: 6 to 12 months after commercial validation.",
            ["Step", "Duration", "Scope", "Deliverable"],
            [
                ["BaaS evaluation", "2 to 3 weeks", "Treezor, Swan, Solaris and other EMIs.", "BaaS matrix"],
                ["Product boundaries", "1 to 2 weeks", "Wallet, card, IBAN and cashback legal/technical dependencies.", "Compliance map"],
                ["KYC / KYB", "2 weeks", "Consumers, merchants and companies.", "Onboarding flows"],
                ["Ledger", "2 to 3 weeks", "Balances, cashback, refunds, holds and adjustments.", "Ledger architecture"],
                ["Virtual card PoC", "4 to 8 weeks", "Issuing, limits, notifications and transactions.", "Issuing PoC"],
                ["Wallet beta", "3 to 6 months", "Limited test with controlled users.", "Closed beta"],
            ],
        ),
    ],
    "plan_title": "12-Month Technical Plan",
    "plan": [
        ["M1", "Architecture, partner evaluation, POS selection and merchant research."],
        ["M2", "Website, merchant application form, PSP sandbox and POS prototype."],
        ["M3", "QR payment, webhook and dashboard alpha."],
        ["M4", "POS beta, refunds, transaction lookup and logs."],
        ["M5", "Daily closing, reconciliation, AI reporting and 10 pilot merchants."],
        ["M6", "Security, GDPR, admin support and pilot review."],
        ["M7-M8", "30 merchants, stability, POS rollout and training."],
        ["M9-M10", "Pay by Link, additional payment methods and advanced reporting."],
        ["M11-M12", "100-merchant readiness, Balipay billing and sales back office."],
    ],
    "mvp": [
        ["P0", "Merchant onboarding, POS app, QR payment, PSP API, webhooks, refund, dashboard, daily closing, admin, exports, bilingual UI and monitoring."],
        ["P1", "Pay by Link, fee billing, multi-store, loyalty, merchant-funded cashback and accounting integration."],
        ["P2", "Wallet, virtual card, IBAN, multi-currency account, physical card and direct Alipay/Tencent partnership."],
    ],
    "conclusion": "In year one, Balipay should not try to become Revolut. The right technical objective is to become the payment operating system for 100 Chinese merchants in France: POS, QR, PSP partner, back office, daily reconciliation, bilingual support and AI assistance.",
}


def build(config):
    s = styles()
    doc = RoadmapDoc(config["file"], config["footer"])
    story = []

    story.append(Spacer(1, 34 * mm))
    story.append(p("Balipay", s["cover_brand"]))
    story.append(p(config["title"], s["cover_title"]))
    story.append(p(config["subtitle"], s["subtitle"]))
    story.append(Spacer(1, 25 * mm))
    for line in config["meta"]:
        story.append(p(f"<b>{line.split(':', 1)[0]}:</b>{line.split(':', 1)[1] if ':' in line else line}", s["body"]))
    story.append(PageBreak())

    section(story, "0. Technical Principles" if config is EN else "0. Principes Techniques", config["principles"], s)
    story.append(p(config["flow"], s["note"]))

    for index, (title, body, headers, rows) in enumerate(config["sections"]):
        section(story, title, body, s)
        story.append(make_table(headers, rows, s))
        if index in {1, 4, 7}:
            story.append(PageBreak())

    section(story, config["plan_title"], "", s)
    story.append(make_table(["Month" if config is EN else "Mois", "Priority" if config is EN else "Priorite"], config["plan"], s, [28 * mm, 146 * mm]))

    section(story, "MVP Scope" if config is EN else "Perimetre MVP", "", s)
    story.append(make_table(["Priority" if config is EN else "Priorite", "Scope" if config is EN else "Perimetre"], config["mvp"], s, [28 * mm, 146 * mm]))

    section(story, "CTO Conclusion" if config is EN else "Conclusion CTO", config["conclusion"], s)
    doc.build(story)


if __name__ == "__main__":
    build(FR)
    build(EN)
