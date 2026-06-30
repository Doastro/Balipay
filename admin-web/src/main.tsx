import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

type User = { id: string; email: string; role: string };
type Merchant = {
  id: string;
  legalName: string;
  displayName: string;
  status: string;
  sector?: string;
  city?: string;
  contactName?: string;
  stores?: Store[];
};
type Store = { id: string; name: string; city?: string; terminals?: Terminal[] };
type Terminal = { id: string; serialNumber: string; model: string; provider: string; status: string; store?: Store };
type Transaction = { id: string; amount: string; paymentMethod: string; status: string; provider: string; merchant?: Merchant; createdAt: string };
type Refund = { id: string; amount: string; status: string; reason?: string; transaction?: Transaction };
type Closing = { id: string; businessDate: string; totalSales: string; totalPayments: string; gapAmount: string; status: string; merchant?: Merchant };
type AuditLog = { id: string; actorEmail: string; action: string; entityType: string; createdAt: string };
type Kpis = {
  activeMerchants: number;
  pendingMerchants: number;
  activeTerminals: number;
  transactionCount: number;
  volume: number;
  refundsCount: number;
  failedTransactions: number;
  gapClosings: number;
};

function money(value: number | string) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(value || 0));
}

async function api<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

function Login({ onLogin }: { onLogin: (token: string, user: User) => void }) {
  const [email, setEmail] = useState("admin@balipay.fr");
  const [password, setPassword] = useState("ChangeMe123!");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error("Identifiants invalides");
      const data = await response.json();
      onLogin(data.accessToken, data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible");
    }
  }

  return (
    <main className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <span className="eyebrow">Balipay Admin</span>
        <h1>Back-office de pilotage</h1>
        <p>Connectez-vous pour gérer les commerçants, terminaux, transactions et clôtures.</p>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Mot de passe
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit">Se connecter</button>
      </form>
    </main>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("balipay_token") || "");
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState("dashboard");
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [closings, setClosings] = useState<Closing[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [message, setMessage] = useState("");

  async function loadAll(activeToken = token) {
    if (!activeToken) return;
    const [me, kpiData, merchantData, terminalData, transactionData, refundData, closingData, auditData] = await Promise.all([
      api<User>("/me", activeToken),
      api<Kpis>("/dashboard/kpis", activeToken),
      api<Merchant[]>("/merchants", activeToken),
      api<Terminal[]>("/terminals", activeToken),
      api<Transaction[]>("/transactions", activeToken),
      api<Refund[]>("/refunds", activeToken),
      api<Closing[]>("/closings/daily", activeToken),
      api<AuditLog[]>("/audit-logs", activeToken),
    ]);
    setUser(me);
    setKpis(kpiData);
    setMerchants(merchantData);
    setTerminals(terminalData);
    setTransactions(transactionData);
    setRefunds(refundData);
    setClosings(closingData);
    setAuditLogs(auditData);
  }

  useEffect(() => {
    if (token) loadAll().catch(() => logout());
  }, [token]);

  function login(nextToken: string, nextUser: User) {
    localStorage.setItem("balipay_token", nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }

  function logout() {
    localStorage.removeItem("balipay_token");
    setToken("");
    setUser(null);
  }

  async function createMerchant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api<Merchant>("/merchants", token, {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    event.currentTarget.reset();
    setMessage("Commerçant créé.");
    await loadAll();
  }

  async function createTerminal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api<Terminal>("/terminals", token, {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    event.currentTarget.reset();
    setMessage("Terminal créé.");
    await loadAll();
  }

  async function createTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries()) as Record<string, string>;
    await api<Transaction>("/transactions/mock", token, {
      method: "POST",
      body: JSON.stringify({ ...payload, amount: Number(payload.amount) }),
    });
    event.currentTarget.reset();
    setMessage("Transaction mock créée.");
    await loadAll();
  }

  async function createClosing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries()) as Record<string, string>;
    await api<Closing>("/closings/daily", token, {
      method: "POST",
      body: JSON.stringify({ ...payload, totalPayments: payload.totalPayments ? Number(payload.totalPayments) : undefined }),
    });
    event.currentTarget.reset();
    setMessage("Clôture créée.");
    await loadAll();
  }

  const totalStores = useMemo(() => merchants.reduce((sum, merchant) => sum + (merchant.stores?.length || 0), 0), [merchants]);

  if (!token) return <Login onLogin={login} />;

  return (
    <div className="app-shell">
      <aside>
        <strong className="brand">Balipay Admin</strong>
        {["dashboard", "merchants", "terminals", "transactions", "refunds", "closings", "audit"].map((item) => (
          <button key={item} className={view === item ? "active" : ""} onClick={() => setView(item)}>
            {labels[item]}
          </button>
        ))}
        <div className="user-box">
          <span>{user?.email}</span>
          <small>{user?.role}</small>
          <button onClick={logout}>Déconnexion</button>
        </div>
      </aside>
      <main>
        <header>
          <div>
            <span className="eyebrow">Back-office MVP</span>
            <h1>{labels[view]}</h1>
          </div>
          <button onClick={() => loadAll()}>Rafraîchir</button>
        </header>
        {message && <div className="success" onClick={() => setMessage("")}>{message}</div>}
        {view === "dashboard" && (
          <>
            <section className="kpi-grid">
              <Kpi label="Commerçants actifs" value={kpis?.activeMerchants || 0} />
              <Kpi label="KYB en attente" value={kpis?.pendingMerchants || 0} />
              <Kpi label="Volume mock" value={money(kpis?.volume || 0)} />
              <Kpi label="Transactions" value={kpis?.transactionCount || 0} />
              <Kpi label="Terminaux actifs" value={kpis?.activeTerminals || 0} />
              <Kpi label="Boutiques" value={totalStores} />
            </section>
            <section className="panel">
              <h2>Alertes simples</h2>
              <p>{kpis?.pendingMerchants || 0} commerçants KYB à suivre.</p>
              <p>{kpis?.failedTransactions || 0} transactions échouées.</p>
              <p>{kpis?.gapClosings || 0} clôtures avec écart.</p>
            </section>
          </>
        )}
        {view === "merchants" && (
          <GridPage
            formTitle="Créer un commerçant"
            form={<MerchantForm onSubmit={createMerchant} />}
            table={
              <table>
                <thead><tr><th>Nom</th><th>Statut</th><th>Secteur</th><th>Ville</th><th>Boutiques</th></tr></thead>
                <tbody>{merchants.map((m) => <tr key={m.id}><td>{m.displayName}</td><td>{m.status}</td><td>{m.sector}</td><td>{m.city}</td><td>{m.stores?.length || 0}</td></tr>)}</tbody>
              </table>
            }
          />
        )}
        {view === "terminals" && (
          <GridPage
            formTitle="Créer un terminal"
            form={<TerminalForm onSubmit={createTerminal} />}
            table={
              <table>
                <thead><tr><th>Série</th><th>Modèle</th><th>Provider</th><th>Statut</th><th>Boutique</th></tr></thead>
                <tbody>{terminals.map((t) => <tr key={t.id}><td>{t.serialNumber}</td><td>{t.model}</td><td>{t.provider}</td><td>{t.status}</td><td>{t.store?.name || "-"}</td></tr>)}</tbody>
              </table>
            }
          />
        )}
        {view === "transactions" && (
          <GridPage
            formTitle="Créer une transaction mock"
            form={<TransactionForm merchants={merchants} onSubmit={createTransaction} />}
            table={
              <table>
                <thead><tr><th>Date</th><th>Commerçant</th><th>Moyen</th><th>Montant</th><th>Statut</th><th>Provider</th></tr></thead>
                <tbody>{transactions.map((t) => <tr key={t.id}><td>{new Date(t.createdAt).toLocaleString("fr-FR")}</td><td>{t.merchant?.displayName}</td><td>{t.paymentMethod}</td><td>{money(t.amount)}</td><td>{t.status}</td><td>{t.provider}</td></tr>)}</tbody>
              </table>
            }
          />
        )}
        {view === "refunds" && (
          <GridPage
            formTitle="Créer un remboursement"
            form={<RefundForm transactions={transactions} onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const payload = Object.fromEntries(form.entries()) as Record<string, string>;
              await api<Refund>("/refunds", token, {
                method: "POST",
                body: JSON.stringify({ ...payload, amount: Number(payload.amount) }),
              });
              event.currentTarget.reset();
              setMessage("Remboursement demandé.");
              await loadAll();
            }} />}
            table={
              <table>
                <thead><tr><th>Transaction</th><th>Commerçant</th><th>Montant</th><th>Statut</th><th>Motif</th></tr></thead>
                <tbody>{refunds.map((r) => <tr key={r.id}><td>{r.transaction?.id.slice(0, 8)}</td><td>{r.transaction?.merchant?.displayName}</td><td>{money(r.amount)}</td><td>{r.status}</td><td>{r.reason || "-"}</td></tr>)}</tbody>
              </table>
            }
          />
        )}
        {view === "closings" && (
          <GridPage
            formTitle="Créer une clôture"
            form={<ClosingForm merchants={merchants} onSubmit={createClosing} />}
            table={
              <table>
                <thead><tr><th>Date</th><th>Commerçant</th><th>Ventes</th><th>Paiements</th><th>Écart</th><th>Statut</th></tr></thead>
                <tbody>{closings.map((c) => <tr key={c.id}><td>{c.businessDate}</td><td>{c.merchant?.displayName}</td><td>{money(c.totalSales)}</td><td>{money(c.totalPayments)}</td><td>{money(c.gapAmount)}</td><td>{c.status}</td></tr>)}</tbody>
              </table>
            }
          />
        )}
        {view === "audit" && (
          <section className="panel">
            <h2>Audit logs</h2>
            <table>
              <thead><tr><th>Date</th><th>Acteur</th><th>Action</th><th>Entité</th></tr></thead>
              <tbody>{auditLogs.map((log) => <tr key={log.id}><td>{new Date(log.createdAt).toLocaleString("fr-FR")}</td><td>{log.actorEmail}</td><td>{log.action}</td><td>{log.entityType}</td></tr>)}</tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}

const labels: Record<string, string> = {
  dashboard: "Tableau de bord",
  merchants: "Commerçants",
  terminals: "Terminaux",
  transactions: "Transactions",
  refunds: "Remboursements",
  closings: "Clôtures",
  audit: "Audit logs",
};

function Kpi({ label, value }: { label: string; value: string | number }) {
  return <article className="kpi"><span>{label}</span><strong>{value}</strong></article>;
}

function GridPage({ formTitle, form, table }: { formTitle: string; form: React.ReactNode; table: React.ReactNode }) {
  return <div className="content-grid"><section className="panel"><h2>{formTitle}</h2>{form}</section><section className="panel wide">{table}</section></div>;
}

function MerchantForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form onSubmit={onSubmit}><input name="legalName" placeholder="Raison sociale" required /><input name="displayName" placeholder="Nom commercial" required /><input name="sector" placeholder="Secteur" /><input name="city" placeholder="Ville" /><input name="contactName" placeholder="Contact" /><button>Créer</button></form>;
}

function TerminalForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form onSubmit={onSubmit}><input name="serialNumber" placeholder="Numéro série" required /><input name="model" placeholder="Modèle" required /><select name="provider"><option>BALIPAY</option><option>PAX</option><option>SUNMI</option><option>OTHER</option></select><button>Créer</button></form>;
}

function TransactionForm({ merchants, onSubmit }: { merchants: Merchant[]; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form onSubmit={onSubmit}><select name="merchantId" required>{merchants.map((m) => <option key={m.id} value={m.id}>{m.displayName}</option>)}</select><input name="amount" type="number" step="0.01" placeholder="Montant" required /><select name="paymentMethod"><option>CB</option><option>Alipay</option><option>WeChat Pay</option><option>UnionPay</option><option>Pay by Link</option></select><select name="status"><option>PAID</option><option>PENDING</option><option>FAILED</option></select><button>Créer</button></form>;
}

function RefundForm({ transactions, onSubmit }: { transactions: Transaction[]; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form onSubmit={onSubmit}><select name="transactionId" required>{transactions.map((t) => <option key={t.id} value={t.id}>{t.merchant?.displayName} · {money(t.amount)}</option>)}</select><input name="amount" type="number" step="0.01" placeholder="Montant" required /><select name="status"><option>REQUESTED</option><option>APPROVED</option><option>PROCESSING</option><option>DONE</option><option>REJECTED</option></select><input name="reason" placeholder="Motif" /><button>Créer</button></form>;
}

function ClosingForm({ merchants, onSubmit }: { merchants: Merchant[]; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form onSubmit={onSubmit}><select name="merchantId" required>{merchants.map((m) => <option key={m.id} value={m.id}>{m.displayName}</option>)}</select><input name="businessDate" type="date" required /><input name="totalPayments" type="number" step="0.01" placeholder="Total paiements compté" /><select name="status"><option>DRAFT</option><option>VALIDATED</option></select><input name="comment" placeholder="Commentaire" /><button>Créer</button></form>;
}

createRoot(document.getElementById("root")!).render(<App />);
