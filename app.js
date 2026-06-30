const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

const menuItems = [
  { id: 1, name: "Menu raviolis maison", zh: "手工饺子套餐", price: 18.8, category: "food" },
  { id: 2, name: "Boeuf loc lac", zh: "越式牛肉饭", price: 16.5, category: "food" },
  { id: 3, name: "Canard laqué", zh: "烤鸭", price: 24.9, category: "food" },
  { id: 4, name: "Nouilles sautées", zh: "炒面", price: 13.5, category: "food" },
  { id: 5, name: "Thé jasmin", zh: "茉莉花茶", price: 4.2, category: "drink" },
  { id: 6, name: "Bière Tsingtao", zh: "青岛啤酒", price: 5.8, category: "drink" },
  { id: 7, name: "Bubble tea mangue", zh: "芒果奶茶", price: 6.5, category: "drink" },
  { id: 8, name: "Dessert sésame", zh: "芝麻甜点", price: 6.9, category: "food" },
  { id: 9, name: "Formule midi", zh: "午餐套餐", price: 14.9, category: "food" },
];

let orders = [
  { time: "12:18", ref: "T-1024", channel: "Salle", payment: "Carte", total: 42.7, status: "Payé" },
  { time: "12:46", ref: "T-1025", channel: "À emporter", payment: "WeChat Pay", total: 28.8, status: "Payé" },
  { time: "13:21", ref: "F-2026-088", channel: "Facture pro", payment: "Carte", total: 186.2, status: "Facturé" },
  { time: "19:38", ref: "T-1027", channel: "Salle", payment: "Espèces", total: 64.5, status: "Payé" },
  { time: "20:04", ref: "T-1028", channel: "Uber Eats", payment: "Plateforme", total: 51.4, status: "Payé" },
  { time: "21:17", ref: "T-1029", channel: "Salle", payment: "Carte", total: 93.1, status: "Payé" },
  { time: "22:08", ref: "T-1030", channel: "Salle", payment: "Ticket resto", total: 38.0, status: "Payé" },
  { time: "22:39", ref: "A-0031", channel: "Salle", payment: "Carte", total: -19.8, status: "Annulé" },
  { time: "23:11", ref: "T-1032", channel: "Deliveroo", payment: "Plateforme", total: 77.6, status: "Payé" },
  { time: "23:48", ref: "T-1033", channel: "Salle", payment: "Carte", total: 112.4, status: "Payé" },
];

let terminalPayments = [
  { time: "12:18", type: "Carte", ref: "CB-7401", amount: 42.7, matched: true },
  { time: "13:22", type: "Carte", ref: "CB-7402", amount: 186.2, matched: true },
  { time: "21:18", type: "Carte", ref: "CB-7403", amount: 93.1, matched: true },
  { time: "22:39", type: "Carte", ref: "CB-7404", amount: -19.8, matched: true },
  { time: "23:49", type: "Carte", ref: "CB-7405", amount: 110.4, matched: false },
  { time: "12:46", type: "WeChat Pay", ref: "WX-9981", amount: 28.8, matched: true },
  { time: "20:04", type: "Plateforme", ref: "UE-3009", amount: 51.4, matched: true },
  { time: "23:11", type: "Plateforme", ref: "DL-8110", amount: 77.6, matched: true },
];

const cart = [];
const titles = {
  dashboard: "Tableau de bord",
  checkout: "Caisse",
  orders: "Tickets et factures",
  payments: "Paiements",
  closing: "Clôture du soir",
  reports: "Rapports",
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const money = (value) => formatter.format(value);
const sum = (items, predicate = () => true) =>
  items.filter(predicate).reduce((total, item) => total + item.total, 0);

function paymentTotal(type) {
  return terminalPayments
    .filter((payment) => payment.type === type)
    .reduce((total, payment) => total + payment.amount, 0);
}

function orderTotalByPayment(paymentName) {
  return orders
    .filter((order) => order.payment === paymentName)
    .reduce((total, order) => total + order.total, 0);
}

function dailyRevenue() {
  return sum(orders);
}

function terminalRevenue() {
  return terminalPayments.reduce((total, payment) => total + payment.amount, 0);
}

function renderMetrics() {
  $("#metric-revenue").textContent = money(dailyRevenue());
  $("#metric-orders").textContent = orders.filter((order) => order.total > 0).length;
  $("#metric-gap").textContent = money(getCurrentGap());
  $("#z-total").textContent = money(dailyRevenue());
  $("#terminal-total").textContent = money(terminalRevenue());
}

function renderAlerts() {
  const alerts = [
    {
      title: "Écart carte détecté",
      body: "Le ticket T-1033 indique 112,40 €, mais le TPE contient 110,40 €.",
    },
    {
      title: "Annulation à confirmer",
      body: "A-0031 doit être associée à un motif avant clôture fiscale.",
    },
    {
      title: "Facture pro prête",
      body: "F-2026-088 est archivée avec TVA et moyen de paiement.",
    },
  ];

  $("#alert-list").innerHTML = alerts
    .map((alert) => `<li><strong>${alert.title}</strong><span>${alert.body}</span></li>`)
    .join("");
}

function renderMenu(category = "all") {
  const visibleItems = category === "all" ? menuItems : menuItems.filter((item) => item.category === category);
  $("#menu-grid").innerHTML = visibleItems
    .map(
      (item) => `
      <button class="menu-item" type="button" data-menu-id="${item.id}">
        <strong>${item.name}</strong>
        <span data-zh="${item.zh}">${item.zh}</span>
        <span>${money(item.price)}</span>
      </button>
    `
    )
    .join("");
}

function renderCart() {
  if (!cart.length) {
    $("#cart-list").innerHTML = '<p class="empty">Aucun article sélectionné.</p>';
  } else {
    $("#cart-list").innerHTML = cart
      .map(
        (item, index) => `
        <div class="cart-line">
          <div>
            <strong>${item.name}</strong>
            <span>${item.zh}</span>
          </div>
          <button class="ghost-button" type="button" data-remove="${index}">${money(item.price)}</button>
        </div>
      `
      )
      .join("");
  }

  const total = cart.reduce((acc, item) => acc + item.price, 0);
  $("#cart-total").textContent = money(total);
  $("#cart-tax").textContent = money(total * 0.1);
}

function renderOrders(filter = "") {
  const normalized = filter.trim().toLowerCase();
  const filteredOrders = orders.filter((order) =>
    Object.values(order).join(" ").toLowerCase().includes(normalized)
  );

  $("#orders-table").innerHTML = filteredOrders
    .map(
      (order) => `
      <tr>
        <td>${order.time}</td>
        <td><strong>${order.ref}</strong></td>
        <td>${order.channel}</td>
        <td>${order.payment}</td>
        <td>${money(order.total)}</td>
        <td>${order.status}</td>
      </tr>
    `
    )
    .join("");
}

function renderPayments() {
  $("#payment-feed").innerHTML = terminalPayments
    .map(
      (payment) => `
      <article>
        <div>
          <strong>${payment.type} · ${payment.ref}</strong>
          <span>${payment.time} · ${payment.matched ? "rapproché" : "à vérifier"}</span>
        </div>
        <strong>${money(payment.amount)}</strong>
      </article>
    `
    )
    .join("");

  const buckets = ["Carte", "WeChat Pay", "Plateforme", "Espèces", "Ticket resto"].map((name) => ({
    name,
    amount: name === "Espèces" || name === "Ticket resto" ? orderTotalByPayment(name) : paymentTotal(name),
  }));
  const maxAmount = Math.max(...buckets.map((bucket) => bucket.amount));

  $("#payment-bars").innerHTML = buckets
    .map((bucket) => {
      const width = Math.max(6, Math.round((bucket.amount / maxAmount) * 100));
      return `
        <div>
          <div class="bar-label"><strong>${bucket.name}</strong><span>${money(bucket.amount)}</span></div>
          <div class="bar-track"><span style="width: ${width}%"></span></div>
        </div>
      `;
    })
    .join("");
}

function getCurrentGap() {
  const cashCount = Number($("#cash-count")?.value || 348.5);
  const expectedCash = orderTotalByPayment("Espèces");
  const expectedNonCash = dailyRevenue() - expectedCash;
  const receivedNonCash = terminalRevenue() + orderTotalByPayment("Ticket resto");
  return Number((cashCount + receivedNonCash - (expectedCash + expectedNonCash)).toFixed(2));
}

function renderClosing() {
  const gap = getCurrentGap();
  const absoluteGap = Math.abs(gap);
  $("#final-gap").textContent = money(gap);
  $("#final-gap").style.color = absoluteGap < 0.01 ? "var(--jade)" : "var(--red)";
  $("#metric-gap").textContent = money(gap);

  if (absoluteGap < 0.01) {
    $("#gap-message").textContent = "Tout est aligné. Vous pouvez valider et archiver la journée.";
    $("#closing-status").textContent = "Prêt";
  } else if (absoluteGap <= 5) {
    $("#gap-message").textContent = "Petit écart probable sur arrondi, pourboire ou saisie TPE. Vérifiez les lignes proposées.";
    $("#closing-status").textContent = "À vérifier";
  } else {
    $("#gap-message").textContent = "Écart significatif. Le module a isolé les tickets suspects avant validation.";
    $("#closing-status").textContent = "Bloqué";
  }

  const auditItems = [
    {
      title: "Ticket T-1033",
      body: "Différence de 2,00 € entre caisse et relevé TPE. Correction proposée: passer le TPE à 112,40 € ou saisir remise.",
    },
    {
      title: "Espèces",
      body: `Attendu ${money(orderTotalByPayment("Espèces"))}; compté ${money(Number($("#cash-count").value || 0))}.`,
    },
    {
      title: "TVA",
      body: `${money(dailyRevenue() * 0.1)} estimés à 10 %. Export comptable disponible après validation.`,
    },
    {
      title: "Archivage",
      body: "Z de caisse, factures pro et justificatifs d'annulation seront liés au dossier du jour.",
    },
  ];

  $("#audit-list").innerHTML = auditItems
    .map((item) => `<li><strong>${item.title}</strong><span>${item.body}</span></li>`)
    .join("");
}

function renderReports() {
  const rows = [
    ["CA TTC", money(dailyRevenue())],
    ["TVA estimée", money(dailyRevenue() * 0.1)],
    ["CA plateformes", money(orderTotalByPayment("Plateforme"))],
    ["Annulations", money(Math.abs(sum(orders, (order) => order.total < 0)))],
  ];

  $("#report-list").innerHTML = rows
    .map(([label, value]) => `<div class="report-item"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");

  $("#history-list").innerHTML = [
    ["24 mai 2026", "Validé à 01:42 · aucun écart"],
    ["23 mai 2026", "Validé à 02:11 · écart justifié 1,50 €"],
    ["22 mai 2026", "Validé à 00:58 · export comptable envoyé"],
  ]
    .map(([date, note]) => `<div class="history-item"><strong>${date}</strong><span>${note}</span></div>`)
    .join("");
}

function switchView(viewName) {
  $$(".view").forEach((view) => view.classList.remove("active"));
  $(`#${viewName}-view`).classList.add("active");
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));
  $("#view-title").textContent = titles[viewName];
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2800);
}

function addCartItem(id) {
  const item = menuItems.find((candidate) => candidate.id === Number(id));
  cart.push(item);
  renderCart();
}

function payCart(payment) {
  const total = Number(cart.reduce((acc, item) => acc + item.price, 0).toFixed(2));
  if (!total) {
    showToast("Ajoutez des articles avant encaissement.");
    return;
  }

  const ref = `T-${1034 + orders.length}`;
  orders.push({
    time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    ref,
    channel: "Salle",
    payment,
    total,
    status: "Payé",
  });

  if (["Carte", "WeChat Pay"].includes(payment)) {
    terminalPayments.push({
      time: "maintenant",
      type: payment,
      ref: `${payment === "Carte" ? "CB" : "WX"}-${Math.floor(Math.random() * 9000) + 1000}`,
      amount: total,
      matched: true,
    });
  }

  cart.length = 0;
  renderAll();
  showToast(`Ticket ${ref} encaissé en ${payment}.`);
}

function renderAll() {
  renderMetrics();
  renderAlerts();
  renderMenu();
  renderCart();
  renderOrders($("#order-search")?.value || "");
  renderPayments();
  renderClosing();
  renderReports();
}

document.addEventListener("click", (event) => {
  const navButton = event.target.closest("[data-view]");
  const jumpButton = event.target.closest("[data-view-jump]");
  const menuButton = event.target.closest("[data-menu-id]");
  const categoryButton = event.target.closest("[data-category]");
  const removeButton = event.target.closest("[data-remove]");
  const paymentButton = event.target.closest("[data-pay]");

  if (navButton) switchView(navButton.dataset.view);
  if (jumpButton) switchView(jumpButton.dataset.viewJump);
  if (menuButton) addCartItem(menuButton.dataset.menuId);
  if (categoryButton) {
    $$(".segmented button").forEach((button) => button.classList.toggle("active", button === categoryButton));
    renderMenu(categoryButton.dataset.category);
  }
  if (removeButton) {
    cart.splice(Number(removeButton.dataset.remove), 1);
    renderCart();
  }
  if (paymentButton) payCart(paymentButton.dataset.pay);
});

$("#order-search").addEventListener("input", (event) => renderOrders(event.target.value));
$("#cash-count").addEventListener("input", renderClosing);
$("#sync-button").addEventListener("click", () => showToast("Synchronisation TPE terminée: 8 paiements rapprochés."));
$("#import-payments").addEventListener("click", () => showToast("Relevé importé. Une différence de 2,00 € reste à traiter."));
$("#auto-fix").addEventListener("click", () => {
  const payment = terminalPayments.find((candidate) => candidate.ref === "CB-7405");
  payment.amount = 112.4;
  payment.matched = true;
  renderAll();
  showToast("Correction proposée appliquée: T-1033 rapproché avec le TPE.");
});
$("#validate-day").addEventListener("click", () => {
  if (Math.abs(getCurrentGap()) > 0.01) {
    showToast("Validation bloquée: traitez l'écart final avant archivage.");
    return;
  }
  $("#closing-status").textContent = "Validé";
  showToast("Journée validée. Z de caisse, justificatifs et export comptable sont archivés.");
});
$("#chinese-mode").addEventListener("change", (event) => {
  document.body.classList.toggle("hide-zh", !event.target.checked);
  showToast(event.target.checked ? "Aide chinoise activée." : "Aide chinoise masquée.");
});

renderAll();
