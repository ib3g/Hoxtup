# Rôles & Permissions — Hoxtup

> **Dernière mise à jour :** 2026-02-10
> **Statut :** En cours d'implémentation

## Vue d'ensemble

Hoxtup utilise un système de rôles par organisation (multi-tenant). Chaque utilisateur a un rôle **par organisation** (stocké dans `Member.role`), distinct du rôle global (`User.role`).

Un utilisateur peut appartenir à plusieurs organisations avec des rôles différents dans chacune.

---

## Hiérarchie des rôles

```
owner > admin > manager > member > staff_autonomous > staff_managed
```

| Rôle | Description | Cas d'usage |
|------|-------------|-------------|
| **owner** | Propriétaire de l'organisation. Unique par org. Contrôle total. | Le créateur de l'org / le dirigeant |
| **admin** | Administrateur. Gestion complète sauf transfert de propriété. | Co-gérant, bras droit |
| **manager** | Gestionnaire opérationnel. Gère tâches, réservations, calendrier. | Chef d'équipe, responsable de zone |
| **member** | Membre standard. Consultation + réservations. Pas de gestion d'équipe. | Assistant, secrétaire, collaborateur |
| **staff_autonomous** | Personnel autonome. Voit ses tâches + calendrier + incidents. | Agent d'entretien expérimenté |
| **staff_managed** | Personnel encadré. Ne voit que ses tâches assignées. | Nouveau staff, prestataire externe |

---

## Matrice de permissions

### Gestion d'équipe

| Action | Owner | Admin | Manager | Member | Staff Auto. | Staff Encadré |
|--------|:-----:|:-----:|:-------:|:------:|:-----------:|:-------------:|
| Voir les membres | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Inviter un membre | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Changer le rôle d'un membre | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Supprimer un membre | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Modifier les settings org | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Transférer la propriété | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Supprimer un admin | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Propriétés

| Action | Owner | Admin | Manager | Member | Staff Auto. | Staff Encadré |
|--------|:-----:|:-----:|:-------:|:------:|:-----------:|:-------------:|
| Voir | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Créer | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Modifier | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Supprimer / Archiver | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Réservations

| Action | Owner | Admin | Manager | Member | Staff Auto. | Staff Encadré |
|--------|:-----:|:-----:|:-------:|:------:|:-----------:|:-------------:|
| Voir | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Créer | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Modifier | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Supprimer | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

### Tâches

| Action | Owner | Admin | Manager | Member | Staff Auto. | Staff Encadré |
|--------|:-----:|:-----:|:-------:|:------:|:-----------:|:-------------:|
| Voir toutes les tâches | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Voir ses tâches (`/my`) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Créer une tâche | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assigner une tâche | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Modifier une tâche (complet) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Changer le statut (sa tâche) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Supprimer une tâche | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

### Facturation

| Action | Owner | Admin | Manager | Member | Staff Auto. | Staff Encadré |
|--------|:-----:|:-----:|:-------:|:------:|:-----------:|:-------------:|
| Voir les plans | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Souscrire / Changer de plan | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Annuler l'abonnement | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### iCal

| Action | Owner | Admin | Manager | Member | Staff Auto. | Staff Encadré |
|--------|:-----:|:-----:|:-------:|:------:|:-----------:|:-------------:|
| Voir les sources | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ajouter une source | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Supprimer une source | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Calendrier

| Action | Owner | Admin | Manager | Member | Staff Auto. | Staff Encadré |
|--------|:-----:|:-----:|:-------:|:------:|:-----------:|:-------------:|
| Voir | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### Dashboard

| Action | Owner | Admin | Manager | Member | Staff Auto. | Staff Encadré |
|--------|:-----:|:-----:|:-------:|:------:|:-----------:|:-------------:|
| Voir | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Notifications

| Action | Owner | Admin | Manager | Member | Staff Auto. | Staff Encadré |
|--------|:-----:|:-----:|:-------:|:------:|:-----------:|:-------------:|
| Voir/Gérer les siennes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Navigation frontend par rôle

| Page | Owner | Admin | Manager | Member | Staff Auto. | Staff Encadré |
|------|:-----:|:-----:|:-------:|:------:|:-----------:|:-------------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Propriétés | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Réservations | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Tâches | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Calendrier | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Équipe | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Incidents | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Inventaire | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Facturation | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Paramètres | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Règles de protection

### Owner
- Il ne peut y avoir qu'un seul owner par organisation
- Personne ne peut modifier ou supprimer le owner
- Seul le owner peut transférer la propriété (l'ancien owner devient admin)
- Seul le owner peut supprimer un admin

### Self-protection
- Aucun utilisateur ne peut modifier son propre rôle
- Aucun utilisateur ne peut se supprimer lui-même de l'organisation

### Transfert de propriété
- Quand le owner promeut un membre en `owner` :
  1. Le nouveau membre devient `owner`
  2. L'ancien owner est rétrogradé en `admin`
  3. Opération atomique (pas de 2 owners simultanés)

---

## Architecture technique

### Backend

- **Middleware `requireRole(...roles)`** : vérifie le rôle du membre dans l'org via `Member.role`
- **`getActorMemberRole(userId, orgId)`** : helper partagé (`common/middleware/permissions.ts`)
- Chaque route API est protégée par `requireAuth` + `requireRole` selon la matrice ci-dessus
- Format d'erreur 403 : RFC 7807 (`{ type, title, status, detail }`)

### Frontend

- **`useNavItems(role)`** : filtre les items de navigation selon le rôle
- **`canManage`** : variable dérivée du rôle pour conditionner l'affichage des actions
- Le frontend masque les boutons, mais le backend est la **source de vérité** des permissions

### Base de données

- `User.role` : rôle global (Prisma enum `Role`)
- `Member.role` : rôle par organisation (string) — **c'est celui utilisé pour les permissions**
- `TeamAuditLog` : log immutable des actions sensibles (changements de rôle, suppressions, etc.)

---

## Suivi d'implémentation

| Composant | Statut | Notes |
|-----------|--------|-------|
| Middleware `requireRole` partagé | ✅ Fait | `common/middleware/permissions.ts` |
| Permissions backend — Properties | ✅ Fait | 6 routes protégées |
| Permissions backend — Reservations | ✅ Fait | 5 routes protégées |
| Permissions backend — Billing | ✅ Fait | 4 routes (webhook exclu) |
| Permissions backend — Calendar | ✅ Fait | 1 route protégée |
| Permissions backend — iCal | ✅ Fait | 3 routes protégées |
| Permissions backend — Tasks (spécial) | ✅ Fait | Staff: status/note uniquement sur tâches assignées |
| Refactor backend — Team | ✅ Fait | Middleware partagé + logique in-handler |
| Frontend — Rôle `member` | ✅ Fait | `useNavItems` — même nav que manager |
| Transfert de propriété sécurisé | ✅ Fait | `$transaction`, ancien owner → admin |
| Audit log global | ✅ Fait | `TeamAuditLog` + `GET /team/audit-log` |
| Rate limiting | ⬜ Post-MVP | `express-rate-limit` + Redis |

---

> **Convention :** Mettre à jour ce fichier à chaque modification du système de permissions.
