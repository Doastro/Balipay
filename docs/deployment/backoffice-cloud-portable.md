# Balipay Back-Office MVP - Deploiement cloud-portable

## Objectif

Le back-office est concu pour demarrer localement avec Docker puis migrer vers Scaleway ou OVHcloud sans changer l'application.

## Services

- `backend-api` : API NestJS exposee sur le port `3000`.
- `admin-web` : interface React servie par Nginx sur le port `5173`.
- `postgres` : base PostgreSQL 16.

## Lancement local

1. Copier `.env.example` vers `.env`.
2. Changer au minimum `JWT_SECRET` et `ADMIN_PASSWORD`.
3. Lancer :

```bash
docker compose up --build
```

4. Verifier l'API :

```bash
curl http://localhost:3000/health
```

5. Ouvrir l'admin :

```text
http://localhost:5173
```

Identifiants par defaut si non modifies :

```text
admin@balipay.fr
ChangeMe123!
```

## Migration Scaleway ou OVHcloud

### Option recommandee MVP

- 1 service container pour `backend-api`.
- 1 service container ou static hosting pour `admin-web`.
- 1 base PostgreSQL managée.
- 1 domaine admin, par exemple `admin.balipay.fr`.
- TLS obligatoire.

### Variables a definir cote cloud

```text
NODE_ENV=production
DATABASE_URL=postgres://...
DATABASE_SSL=true
JWT_SECRET=...
JWT_EXPIRES_IN=8h
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
VITE_API_BASE_URL=https://api.balipay.fr
```

## Securite minimale avant production

- Changer tous les secrets.
- Desactiver `synchronize` TypeORM en production apres la premiere phase MVP.
- Ajouter sauvegardes PostgreSQL quotidiennes.
- Activer logs applicatifs et alerting.
- Limiter l'acces admin par comptes nominatifs.
- Ne jamais stocker de donnees carte.

## Prochaines etapes techniques

- Remplacer les transactions mockees par un premier connecteur PSP.
- Ajouter migrations TypeORM versionnees.
- Ajouter MFA admin.
- Ajouter export CSV/PDF.
- Ajouter module IA de resume et detection d'anomalies.
