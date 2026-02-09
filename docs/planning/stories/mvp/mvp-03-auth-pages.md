# mvp-03 — Auth Pages

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** mvp-01, mvp-02
**Note :** Pages login et register existent déjà partiellement. Cette story les finalise avec le design system. Backend : setup Better Auth + endpoint org.

## Objectif

Pages d'authentification complètes : login, register, et flow post-signup (création d'organisation).

## Tâches

### 1. Page Login (`(auth)/login/page.tsx`)

- Email + password
- Bouton "Se connecter" (primary terra)
- Lien "Pas encore de compte ? S'inscrire"
- Erreur : message inline rouge sous le formulaire
- Rate limited côté serveur (5 req/15min) — afficher message user-friendly si 429
- Redirect vers `/dashboard` après login réussi
- React Hook Form + Zod v4 validation

### 2. Page Register (`(auth)/register/page.tsx`)

- Nom complet + email + password + confirmation password
- Password requirements : min 8 chars (validation Zod côté client)
- Bouton "Créer mon compte" (primary terra)
- Lien "Déjà un compte ? Se connecter"
- Après signup réussi → redirect vers flow création org

### 3. Flow post-signup — Création organisation

- Page `/onboarding/organization` (ou modal)
- Champs : nom de l'organisation, currency (EUR/MAD dropdown)
- Bouton "Créer mon organisation" (primary terra)
- `POST /api/v1/organizations` avec le session cookie
- Après création → redirect vers onboarding (mvp-04) ou dashboard

### 4. Layout auth

- Layout centré, sans navigation
- Logo Hoxtup en haut
- Fond `bg-primary` (#f9fafb)
- Card centrée avec shadow subtle

## Acceptance Criteria

- [ ] Login fonctionne avec un compte existant → redirect dashboard
- [ ] Register crée un compte → redirect vers création org
- [ ] Création org fonctionne → redirect vers onboarding/dashboard
- [ ] Les erreurs (mauvais password, email déjà pris, rate limit) sont affichées clairement
- [ ] Tous les textes i18n (`t('auth.login.title')`, etc.)
- [ ] Mobile-first : formulaires lisibles sur iPhone SE (375px)

## API utilisées

- `POST /api/auth/sign-up/email` — inscription
- `POST /api/auth/sign-in/email` — connexion
- `POST /api/v1/organizations` — création org
- `GET /api/auth/get-session` — vérifier session

## Anti-patterns

- Ne PAS stocker le token manuellement — Better Auth gère les cookies
- Ne PAS dupliquer la validation — Zod schema unique par formulaire
- `credentials: 'include'` sur tous les appels API (déjà configuré dans `api-client.ts`)
