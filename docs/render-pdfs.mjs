import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { chromium } = require("/Users/cole/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const documents = [
  {
    html: "balipay-technical-roadmap-fr.html",
    pdf: "Balipay_Roadmap_Technique_CTO_FR.pdf",
  },
  {
    html: "balipay-technical-roadmap-en.html",
    pdf: "Balipay_CTO_Technical_Roadmap_EN.pdf",
  },
];

const browser = await chromium.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const page = await browser.newPage({ viewport: { width: 1240, height: 1754 } });

for (const doc of documents) {
  const input = `file://${path.join(__dirname, doc.html)}`;
  const output = path.join(__dirname, doc.pdf);
  await page.goto(input, { waitUntil: "load" });
  await page.pdf({
    path: output,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
}

await browser.close();
