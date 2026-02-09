# mvp-16 — Settings & Profile

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** mvp-02 (App Shell)

## Objectif

Page settings : profil utilisateur, paramètres organisation, langue, currency.

## Tâches

### 1. Page `/settings`

- Sections : Profil, Organisation, Préférences
- Navigation par sections (scroll ou tabs)

### 2. Section Profil

- Afficher : nom, email, rôle (read-only)
- Modifier : nom, prénom
- Changer mot de passe (via Better Auth)
- Pas d'upload avatar en MVP — initiales uniquement

### 3. Section Organisation (Owner/Admin uniquement)

- Afficher : nom org, currency, date création
- Modifier : nom org
- Currency : EUR ou MAD (select)
- Danger zone : pas de suppression org en MVP

### 4. Section Préférences

- Langue : FR (seule option en MVP, select disabled mais visible pour montrer que c'est prévu)
- Timezone : auto-détectée, affichée en read-only
- Lien vers préférences notifications (→ `/notifications/preferences` ou inline)

### 5. Logout

- Bouton "Se déconnecter" en bas de la page (destructive style)
- `POST /api/auth/sign-out` → redirect `/login`

## Acceptance Criteria

- [ ] Profil affiche les infos correctes
- [ ] Modification nom fonctionne
- [ ] Settings org visibles uniquement pour Owner/Admin
- [ ] Modification currency fonctionne
- [ ] Logout fonctionne
- [ ] Tous les textes i18n
- [ ] Responsive

## API utilisées

- `GET /api/auth/get-session` — infos user
- `POST /api/auth/sign-out` — déconnexion
- Better Auth API pour modification profil
