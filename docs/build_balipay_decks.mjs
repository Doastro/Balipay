import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const OUT_DIR = "/Users/cole/Documents/TPE/outputs";
const PREVIEW_DIR = "/var/folders/nm/bn90j6bn3zzbphjp1y7f3w2w0000gn/T/codex-presentations/balipay-decks/tmp/preview";
const ASSET_TERMINAL = "/Users/cole/Documents/TPE/assets/restaurant-terminal.png";

const W = 1280;
const H = 720;
const C = {
  ink: "#14211d",
  muted: "#5e7068",
  jade: "#126c58",
  jade2: "#0c4f42",
  mint: "#eaf5ef",
  cream: "#fbfaf6",
  white: "#ffffff",
  gold: "#b88a36",
  line: "#d8e4de",
  red: "#9f3f38",
  blue: "#315f74",
};

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

function addText(slide, text, x, y, w, h, style = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    fontSize: style.size ?? 24,
    bold: style.bold ?? false,
    color: style.color ?? C.ink,
    alignment: style.align ?? "left",
  };
  return shape;
}

function addBox(slide, x, y, w, h, fill = C.white, line = C.line, radius = "rounded-xl") {
  return slide.shapes.add({
    geometry: "roundRect",
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: "solid", fill: line, width: 1 },
    borderRadius: radius,
    shadow: "shadow-sm",
  });
}

function addRule(slide, x, y, w, color = C.jade) {
  slide.shapes.add({
    geometry: "line",
    position: { left: x, top: y, width: w, height: 0 },
    fill: "none",
    line: { style: "solid", fill: color, width: 3 },
  });
}

function addPill(slide, text, x, y, w, fill = C.mint, color = C.jade2) {
  addBox(slide, x, y, w, 36, fill, fill, "rounded-full");
  addText(slide, text, x + 14, y + 8, w - 28, 22, { size: 15, bold: true, color });
}

function addBullet(slide, text, x, y, w, color = C.ink) {
  slide.shapes.add({
    geometry: "ellipse",
    position: { left: x, top: y + 7, width: 8, height: 8 },
    fill: C.jade,
    line: { style: "solid", fill: C.jade, width: 0 },
  });
  addText(slide, text, x + 18, y, w - 18, 34, { size: 20, color });
}

function addHeader(slide, title, eyebrow = "BALIPAY") {
  addText(slide, eyebrow, 70, 38, 360, 24, { size: 13, bold: true, color: C.jade });
  addText(slide, title, 70, 70, 920, 52, { size: 38, bold: true, color: C.ink });
  addRule(slide, 70, 130, 112, C.gold);
}

async function addTerminalImage(slide, x, y, w, h, crop = { left: 0.08, top: 0.02, right: 0.05, bottom: 0.02 }) {
  const imageBytes = await fs.readFile(ASSET_TERMINAL);
  slide.images.add({
    blob: imageBytes,
    contentType: "image/png",
    alt: "Terminal de paiement dans un restaurant",
    fit: "cover",
    crop,
    geometry: "roundRect",
    borderRadius: "rounded-xl",
    position: { left: x, top: y, width: w, height: h },
  });
}

function coverBackground(slide) {
  slide.background.fill = C.cream;
  slide.shapes.add({
    geometry: "rect",
    position: { left: 0, top: 0, width: W, height: H },
    fill: C.cream,
    line: { style: "solid", fill: C.cream, width: 0 },
  });
}

function normalSlide(pres, title) {
  const slide = pres.slides.add();
  slide.background.fill = C.cream;
  addHeader(slide, title);
  return slide;
}

async function buildMerchantDeck() {
  const pres = Presentation.create({ slideSize: { width: W, height: H } });

  let slide = pres.slides.add();
  coverBackground(slide);
  await addTerminalImage(slide, 660, 64, 540, 592);
  addText(slide, "BALIPAY", 72, 56, 220, 32, { size: 20, bold: true, color: C.jade });
  addText(slide, "Paiement, services et récompenses pour commerçants Chine-Europe", 72, 152, 540, 230, {
    size: 50,
    bold: true,
    color: C.ink,
  });
  addText(slide, "Un système mixte inspiré de Silkpay et Revolut : TPE, QR, dashboard, carte virtuelle, financement futur et avantages premium.", 72, 418, 520, 100, {
    size: 24,
    color: C.muted,
  });
  addPill(slide, "Votre passerelle entre la Chine et l’Europe", 72, 560, 360, C.jade, C.white);

  slide = normalSlide(pres, "Le problème des commerçants");
  addText(slide, "Les clients chinois et internationaux veulent payer simplement. Les commerçants, eux, doivent gérer trop d’outils séparés.", 70, 160, 1040, 70, {
    size: 27,
    color: C.muted,
  });
  const probs = [
    ["Paiements fragmentés", "CB, Alipay, WeChat Pay, UnionPay et liens de paiement ne sont pas toujours réunis."],
    ["Suivi financier complexe", "Tickets, TPE, remboursements et clôture journalière prennent du temps."],
    ["Peu d’avantages business", "Les paiements professionnels ne donnent presque jamais de récompenses utiles."],
  ];
  probs.forEach((p, i) => {
    const x = 70 + i * 390;
    addBox(slide, x, 280, 340, 230, C.white);
    addText(slide, p[0], x + 24, 305, 292, 38, { size: 26, bold: true, color: C.ink });
    addText(slide, p[1], x + 24, 365, 292, 90, { size: 19, color: C.muted });
  });

  slide = normalSlide(pres, "La solution Balipay");
  addText(slide, "Une plateforme unique pour encaisser, suivre, récompenser et accompagner les commerçants.", 70, 150, 760, 68, {
    size: 28,
    color: C.muted,
  });
  const solution = [
    ["Paiements", "CB, Visa, Mastercard, Alipay, WeChat Pay, UnionPay, Pay by Link"],
    ["Gestion", "Dashboard, reporting, clôture journalière, exports comptables"],
    ["Services", "Carte virtuelle, financement futur, rewards, support bilingue"],
    ["Enterprise", "Backend fort, API, multi-sites, sécurité renforcée"],
  ];
  solution.forEach((s, i) => {
    const x = 70 + (i % 2) * 560;
    const y = 260 + Math.floor(i / 2) * 160;
    addBox(slide, x, y, 510, 118, i === 0 ? C.mint : C.white);
    addText(slide, s[0], x + 24, y + 22, 180, 32, { size: 24, bold: true, color: C.jade2 });
    addText(slide, s[1], x + 200, y + 22, 280, 58, { size: 19, color: C.ink });
  });

  slide = normalSlide(pres, "Un projet soutenu par des acteurs solides");
  addText(slide, "Balipay se construit avec un écosystème institutionnel et financier reconnu.", 70, 155, 880, 45, {
    size: 28,
    color: C.muted,
  });
  [
    ["Bpifrance", "Soutien au développement et à l’innovation"],
    ["Région Île-de-France", "Ancrage local et ambition européenne"],
    ["La Banque Postale", "Partenaire financier de Balipay"],
  ].forEach((s, i) => {
    addBox(slide, 110 + i * 360, 265, 300, 170, C.white);
    addText(slide, s[0], 134 + i * 360, 300, 252, 38, { size: 30, bold: true, color: C.jade2, align: "center" });
    addText(slide, s[1], 134 + i * 360, 360, 252, 60, { size: 20, color: C.muted, align: "center" });
  });
  addText(slide, "Message de confiance : une solution pensée pour durer, pas seulement pour encaisser.", 190, 515, 900, 44, {
    size: 26,
    bold: true,
    color: C.ink,
    align: "center",
  });

  slide = normalSlide(pres, "Paiements acceptés");
  addText(slide, "Balipay rassemble les moyens de paiement attendus par les clients locaux, touristes et professionnels.", 70, 150, 960, 52, {
    size: 27,
    color: C.muted,
  });
  ["CB", "Visa", "Mastercard", "Alipay", "WeChat Pay", "UnionPay", "Pay by Link", "QR Code"].forEach((m, i) => {
    const x = 88 + (i % 4) * 285;
    const y = 250 + Math.floor(i / 4) * 125;
    addBox(slide, x, y, 235, 82, C.white);
    addText(slide, m, x + 16, y + 24, 203, 32, { size: 26, bold: true, color: i >= 3 ? C.jade2 : C.ink, align: "center" });
  });

  slide = normalSlide(pres, "Pour commerces indépendants et grandes enseignes");
  addText(slide, "Même plateforme, deux niveaux d’usage : simplicité pour les commerçants, robustesse pour les groupes.", 70, 150, 980, 54, {
    size: 27,
    color: C.muted,
  });
  addBox(slide, 90, 250, 500, 300, C.white);
  addText(slide, "Commerces indépendants", 122, 285, 420, 36, { size: 30, bold: true, color: C.jade2 });
  ["Installation simple", "TPE + QR", "Support chinois/français", "Commission compétitive"].forEach((b, i) => addBullet(slide, b, 126, 350 + i * 44, 380));
  addBox(slide, 690, 250, 500, 300, C.mint);
  addText(slide, "Grandes enseignes", 722, 285, 420, 36, { size: 30, bold: true, color: C.jade2 });
  ["API et intégration caisse", "Reporting multi-sites", "Permissions par équipe", "Accompagnement technique"].forEach((b, i) => addBullet(slide, b, 726, 350 + i * 44, 380));

  slide = normalSlide(pres, "Backend fort et architecture scalable");
  addText(slide, "Balipay est conçu comme une plateforme indépendante : les partenaires de paiement sont des connecteurs, pas le cœur du produit.", 70, 150, 1010, 58, {
    size: 26,
    color: C.muted,
  });
  const flow = ["TPE / QR", "API Balipay", "Orchestrateur", "Connecteurs PSP", "Dashboard"];
  flow.forEach((f, i) => {
    const x = 82 + i * 235;
    addBox(slide, x, 300, 180, 96, i === 2 ? C.jade : C.white, i === 2 ? C.jade : C.line);
    addText(slide, f, x + 14, 331, 152, 30, { size: 21, bold: true, color: i === 2 ? C.white : C.ink, align: "center" });
    if (i < flow.length - 1) addText(slide, "→", x + 191, 326, 40, 34, { size: 28, bold: true, color: C.gold, align: "center" });
  });
  addText(slide, "API • multi-sites • webhooks • journaux d’audit • reporting consolidé • connecteurs remplaçables", 135, 482, 1010, 42, {
    size: 24,
    bold: true,
    color: C.jade2,
    align: "center",
  });

  slide = normalSlide(pres, "Sécurité et confiance");
  addText(slide, "La cybersécurité est une priorité dès la conception. Balipay prévoit des experts et une sécurité renforcée.", 70, 150, 1030, 55, {
    size: 27,
    color: C.muted,
  });
  [
    ["Experts cybersécurité", "Revue architecture, tests, surveillance et bonnes pratiques paiement."],
    ["Protection des données", "GDPR, permissions, logs d’audit, accès sécurisés."],
    ["Moins d’exposition", "Balipay évite de manipuler directement les données carte au démarrage."],
  ].forEach((s, i) => {
    addBox(slide, 120 + i * 350, 280, 300, 190, i === 1 ? C.mint : C.white);
    addText(slide, s[0], 145 + i * 350, 315, 250, 36, { size: 25, bold: true, color: C.jade2, align: "center" });
    addText(slide, s[1], 145 + i * 350, 372, 250, 72, { size: 18, color: C.muted, align: "center" });
  });

  slide = normalSlide(pres, "Dashboard commerçant et reporting");
  await addTerminalImage(slide, 760, 160, 390, 420, { left: 0.22, top: 0.08, right: 0.14, bottom: 0.08 });
  addText(slide, "Un espace clair pour suivre l’activité et gagner du temps chaque soir.", 70, 150, 610, 62, { size: 28, color: C.muted });
  ["Chiffre d’affaires en temps réel", "Transactions et remboursements", "Clôture journalière assistée par IA", "Exports comptables PDF/CSV", "Suivi multi-sites pour grandes enseignes"].forEach((b, i) =>
    addBullet(slide, b, 88, 260 + i * 54, 610)
  );

  slide = normalSlide(pres, "Carte virtuelle Balipay Business");
  addText(slide, "Une carte professionnelle pour simplifier les dépenses des commerçants.", 70, 150, 820, 54, { size: 28, color: C.muted });
  addBox(slide, 720, 210, 390, 230, C.jade, C.jade);
  addText(slide, "BALIPAY BUSINESS", 755, 250, 315, 28, { size: 18, bold: true, color: C.white });
  addText(slide, "Virtual Card", 755, 335, 250, 40, { size: 34, bold: true, color: C.white });
  addText(slide, "****  2028", 755, 395, 220, 30, { size: 22, color: "#d8efe7" });
  ["Payer fournisseurs et abonnements", "Séparer dépenses personnelles et professionnelles", "Suivre les dépenses dans le dashboard", "Étape future avec partenaire financier"].forEach((b, i) =>
    addBullet(slide, b, 90, 260 + i * 54, 560)
  );

  slide = normalSlide(pres, "Financement basé sur le chiffre d’affaires");
  addText(slide, "Demain, Balipay pourra aider les commerçants à accéder à une avance ou un prêt, avec un partenaire financier.", 70, 150, 950, 58, {
    size: 27,
    color: C.muted,
  });
  [
    ["1", "Encaisser avec Balipay", "Les ventes réelles créent un historique fiable."],
    ["2", "Analyser l’activité", "Dashboard, régularité, saisonnalité et croissance."],
    ["3", "Proposer une solution", "Avance de trésorerie ou financement via partenaire."],
  ].forEach((s, i) => {
    const x = 100 + i * 370;
    addBox(slide, x, 280, 300, 220, C.white);
    addPill(slide, s[0], x + 30, 315, 54, C.jade, C.white);
    addText(slide, s[1], x + 30, 365, 240, 32, { size: 25, bold: true, color: C.ink });
    addText(slide, s[2], x + 30, 420, 240, 56, { size: 18, color: C.muted });
  });

  slide = normalSlide(pres, "Balipay Rewards");
  addText(slide, "Des récompenses utiles pour les patrons chinois qui voyagent régulièrement entre l’Europe et la Chine.", 70, 150, 1000, 58, {
    size: 27,
    color: C.muted,
  });
  [
    ["Points", "Gagner des points avec l’activité Balipay"],
    ["Voyage", "Avantages vols Chine-Europe et hôtels"],
    ["Aéroport", "Salons privés dans les aéroports"],
    ["Statuts", "Silver, Gold, Platinum pour fidéliser"],
  ].forEach((s, i) => {
    const x = 90 + (i % 2) * 560;
    const y = 270 + Math.floor(i / 2) * 130;
    addBox(slide, x, y, 500, 92, i === 2 ? C.mint : C.white);
    addText(slide, s[0], x + 24, y + 25, 130, 32, { size: 25, bold: true, color: C.jade2 });
    addText(slide, s[1], x + 170, y + 24, 300, 36, { size: 20, color: C.ink });
  });

  slide = normalSlide(pres, "Commission compétitive et service bilingue");
  addText(slide, "Notre objectif : une commission plus basse, une tarification claire et un accompagnement adapté aux commerçants chinois.", 70, 150, 980, 58, {
    size: 27,
    color: C.muted,
  });
  addBox(slide, 115, 270, 460, 220, C.mint);
  addText(slide, "Moins de frais cachés", 145, 315, 400, 40, { size: 32, bold: true, color: C.jade2, align: "center" });
  addText(slide, "Une offre simple : paiement, dashboard, support et services Pro.", 155, 385, 380, 58, { size: 22, color: C.ink, align: "center" });
  addBox(slide, 705, 270, 460, 220, C.white);
  addText(slide, "Support français / chinois", 735, 315, 400, 40, { size: 32, bold: true, color: C.jade2, align: "center" });
  addText(slide, "Installation, formation, suivi et aide au quotidien.", 745, 385, 380, 58, { size: 22, color: C.ink, align: "center" });

  slide = normalSlide(pres, "Clients ciblés");
  addText(slide, "Balipay s’adresse aux commerces qui reçoivent une clientèle chinoise, touristique et premium.", 70, 150, 990, 52, {
    size: 27,
    color: C.muted,
  });
  const targets = [
    "Restaurants & épiceries",
    "Hôtels de luxe",
    "Grands magasins",
    "Pâtisseries premium",
    "Cosmétiques",
    "Transport & mobilité",
    "Duty free & tourisme",
    "Grandes entreprises",
  ];
  targets.forEach((t, i) => {
    const x = 82 + (i % 4) * 285;
    const y = 245 + Math.floor(i / 4) * 125;
    addBox(slide, x, y, 235, 82, C.white);
    addText(slide, t, x + 18, y + 19, 199, 42, { size: 20, bold: true, color: C.ink, align: "center" });
  });

  slide = normalSlide(pres, "Offre pilote");
  addText(slide, "Une entrée simple pour les premiers commerçants : tester Balipay sans complexité.", 70, 150, 900, 52, {
    size: 28,
    color: C.muted,
  });
  ["Installation accompagnée", "TPE / QR selon besoin", "Dashboard commerçant", "Support bilingue", "Tarif pilote compétitif", "Retour terrain prioritaire"].forEach((b, i) =>
    addBullet(slide, b, 120 + (i % 2) * 520, 255 + Math.floor(i / 2) * 74, 440)
  );
  addPill(slide, "Objectif : premiers commerçants ambassadeurs", 400, 560, 480, C.jade, C.white);

  slide = normalSlide(pres, "Prochaine étape");
  addText(slide, "Rejoindre Balipay, c’est participer à la construction d’un nouveau pont de paiement entre la Chine et l’Europe.", 110, 165, 1060, 100, {
    size: 35,
    bold: true,
    color: C.ink,
    align: "center",
  });
  addBox(slide, 260, 330, 760, 126, C.mint, C.mint);
  addText(slide, "Étape suivante : entretien commerçant, choix de l’offre pilote, installation et premier encaissement.", 305, 365, 670, 60, {
    size: 28,
    color: C.jade2,
    bold: true,
    align: "center",
  });
  addText(slide, "Balipay — Votre passerelle entre la Chine et l’Europe", 270, 545, 740, 40, {
    size: 28,
    bold: true,
    color: C.jade2,
    align: "center",
  });

  return pres;
}

async function buildSimpleDeck() {
  const pres = Presentation.create({ slideSize: { width: W, height: H } });

  let slide = pres.slides.add();
  coverBackground(slide);
  await addTerminalImage(slide, 720, 80, 420, 560);
  addText(slide, "BALIPAY", 80, 70, 200, 32, { size: 21, bold: true, color: C.jade });
  addText(slide, "L’idée en 3 minutes", 80, 178, 520, 145, { size: 56, bold: true, color: C.ink });
  addText(slide, "Un système mixte entre Silkpay et Revolut, adapté aux commerçants chinois en Europe.", 82, 350, 540, 82, {
    size: 27,
    color: C.muted,
  });
  addPill(slide, "Paiement + services + récompenses", 82, 510, 360, C.jade, C.white);

  slide = normalSlide(pres, "Ce que Balipay apporte");
  [
    ["Encaisser", "CB, Visa, Mastercard, Alipay, WeChat Pay, UnionPay, QR et Pay by Link."],
    ["Gérer", "Dashboard, reporting, clôture journalière, exports et support bilingue."],
    ["Grandir", "Carte virtuelle, financement futur selon chiffre d’affaires, rewards premium."],
  ].forEach((s, i) => {
    addBox(slide, 115 + i * 350, 230, 300, 250, i === 1 ? C.mint : C.white);
    addText(slide, s[0], 145 + i * 350, 275, 240, 38, { size: 34, bold: true, color: C.jade2, align: "center" });
    addText(slide, s[1], 145 + i * 350, 345, 240, 92, { size: 21, color: C.ink, align: "center" });
  });

  slide = normalSlide(pres, "Pourquoi c’est crédible");
  addText(slide, "Balipay vise les commerçants indépendants et les grandes enseignes, avec une infrastructure sérieuse.", 70, 150, 980, 56, {
    size: 28,
    color: C.muted,
  });
  ["Backend fort et API", "Cybersécurité renforcée", "Commission compétitive", "Soutiens Bpifrance / Région Île-de-France", "Partenaire financier : La Banque Postale"].forEach((b, i) =>
    addBullet(slide, b, 130, 255 + i * 60, 880)
  );
  addText(slide, "Objectif immédiat : expliquer, recruter, tester avec les premiers commerçants.", 160, 590, 960, 40, {
    size: 27,
    bold: true,
    color: C.jade2,
    align: "center",
  });

  return pres;
}

async function exportDeck(pres, name) {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(PREVIEW_DIR, { recursive: true });
  for (const [index, slide] of pres.slides.items.entries()) {
    const stem = `${name}-slide-${String(index + 1).padStart(2, "0")}`;
    await writeBlob(path.join(PREVIEW_DIR, `${stem}.png`), await pres.export({ slide, format: "png", scale: 1 }));
    await fs.writeFile(path.join(PREVIEW_DIR, `${stem}.layout.json`), await (await slide.export({ format: "layout" })).text());
  }
  await writeBlob(path.join(PREVIEW_DIR, `${name}-montage.webp`), await pres.export({ format: "webp", montage: true, scale: 1 }));
  const pptx = await PresentationFile.exportPptx(pres);
  const out = path.join(OUT_DIR, `${name}.pptx`);
  await pptx.save(out);
  return out;
}

async function main() {
  const full = await buildMerchantDeck();
  const simple = await buildSimpleDeck();
  const fullPath = await exportDeck(full, "Balipay_Presentation_Commercants_FR");
  const simplePath = await exportDeck(simple, "Balipay_Presentation_Simplifiee_FR");
  console.log(JSON.stringify({ fullPath, simplePath }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
