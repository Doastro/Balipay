# Balipay / JadePay Resto

Prototype de logiciel TPE pour restaurateurs chinois en France.

Le dossier contient maintenant aussi un premier **Back-Office Admin Balipay MVP** :

- `backend-api` : API NestJS pour commerçants, terminaux, transactions, remboursements, clôtures, audit logs et dashboard.
- `admin-web` : interface React pour l'équipe Balipay.
- `docker-compose.yml` : lancement local portable avec PostgreSQL.

## Ouvrir l'application

Ouvrez `index.html` dans un navigateur. L'application est autonome et ne demande pas de serveur.

## Lancer le back-office MVP

Copiez `.env.example` vers `.env`, changez `JWT_SECRET` et `ADMIN_PASSWORD`, puis lancez :

```bash
docker compose up --build
```

API :

```text
http://localhost:3000/health
```

Admin :

```text
http://localhost:5173
```

Identifiants par défaut :

```text
admin@balipay.fr
ChangeMe123!
```

Voir aussi : `docs/deployment/backoffice-cloud-portable.md`.

## Fonctions incluses

- Caisse restaurant avec articles bilingues français/chinois.
- Encaissement par carte TPE, espèces, WeChat Pay, tickets restaurant et plateformes.
- Liste des tickets, factures pro, annulations et statuts.
- Suivi des paiements et rapprochement avec le relevé TPE.
- Module de clôture du soir pour valider le chiffre d'affaires quotidien.
- Détection d'écarts entre caisse, TPE, espèces et justificatifs.
- Correction guidée avant validation de la journée.
- Résumé fiscal avec TVA estimée et historique de clôture.

## Scénario de démonstration

Dans `Clôture`, l'application signale un écart de `-2,00 €` sur un paiement carte. Cliquez sur `Proposer corrections` pour rapprocher le ticket suspect avec le relevé TPE. L'écart passe alors à `0,00 €`, et la journée peut être validée.
