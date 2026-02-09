# v1-08 — Incident Reporting (complet)

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** MVP complet (mvp-09 a le form basique)
**Phase :** V1 — Phase 2B (Task Intelligence)

## Objectif

Version complète du signalement d'incident : type dropdown enrichi, photo via Camera API, résolution avec notes.

## Tâches

### 1. Form incident enrichi

- Remplace le form basique de mvp-09
- Type : dropdown (maintenance, damage, missing_item, safety, cleaning_issue, other)
- Sévérité : low / medium / high / critical
- Description : textarea
- Photo : bouton "Prendre une photo" → Camera API (navigator.mediaDevices) ou file input fallback
- Preview photo avant envoi

### 2. Page incidents `/incidents`

- Liste tous les incidents : type, sévérité, propriété, tâche liée, date, statut (open/resolved)
- Filtres : statut, propriété, sévérité
- `GET /api/v1/incidents`

### 3. Résolution incident

- Depuis le détail : bouton "Résoudre"
- Form : notes de résolution (textarea), action prise
- `PATCH /api/v1/incidents/:id/resolve`
- La tâche bloquée repasse en `assigned` après résolution

### 4. Photo upload

- Resize côté client avant upload (max 1200px, quality 80%)
- Upload vers le backend ou stockage externe (Cloudflare R2)
- Affichage dans le détail incident

## Acceptance Criteria

- [ ] Form complet avec type, sévérité, description, photo
- [ ] Camera API fonctionne sur mobile
- [ ] Liste incidents avec filtres
- [ ] Résolution fonctionne et débloque la tâche
- [ ] Photo visible dans le détail
- [ ] Tous les textes i18n

## API utilisées

- `POST /api/v1/tasks/:id/incident` — signaler (enrichi)
- `GET /api/v1/incidents` — liste
- `PATCH /api/v1/incidents/:incidentId/resolve` — résoudre
