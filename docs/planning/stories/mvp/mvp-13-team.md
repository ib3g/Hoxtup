# mvp-13 — Team Management

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** mvp-02 (App Shell)

## Objectif

Page de gestion d'équipe : lister les membres, inviter, créer des staff managed, changer les rôles, retirer.

## Tâches

### 1. Page `/staff`

- Liste des membres : avatar (initiales), nom, email, rôle (badge), statut (actif/invité)
- Bouton "Inviter un membre" (primary terra)
- Bouton "Créer staff managed" (secondary)

### 2. Inviter un membre (avec compte)

- Sheet form : email, rôle (select : admin, manager, staff_autonomous)
- Utilise Better Auth invitation : `auth.api.createInvitation()`
- L'invité reçoit un email (visible dans Mailhog en dev)
- Statut "Invité" jusqu'à acceptation

### 3. Créer staff managed (sans compte)

- Sheet form : prénom, nom
- `POST /api/v1/team/staff-managed`
- Pas d'email, pas de mot de passe — géré en proxy par le manager
- Badge "Staff Managed" distinct

### 4. Actions sur un membre

- Changer le rôle : `PATCH /api/v1/team/:id/role` body: `{ role: "manager" }`
- Retirer : `DELETE /api/v1/team/:id` → dialog confirmation
- Seuls Owner/Admin peuvent gérer l'équipe

### 5. Scope par propriété (pour Manager)

- Si le membre est Manager : afficher les propriétés auxquelles il a accès
- Option d'assigner/retirer des propriétés (scope middleware côté backend)

## Acceptance Criteria

- [ ] Liste des membres affichée avec rôles
- [ ] Invitation par email fonctionne
- [ ] Création staff managed fonctionne
- [ ] Changement de rôle fonctionne
- [ ] Retrait d'un membre fonctionne (avec confirmation)
- [ ] Seuls Owner/Admin voient les boutons de gestion
- [ ] Tous les textes i18n

## API utilisées

- `GET /api/v1/team` — liste des membres
- `POST /api/v1/team/staff-managed` — créer staff managed
- `PATCH /api/v1/team/:id/role` — changer rôle
- `DELETE /api/v1/team/:id` — retirer membre
- Better Auth API pour invitations
