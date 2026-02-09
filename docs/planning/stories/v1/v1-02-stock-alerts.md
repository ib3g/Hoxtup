# v1-02 — Stock Alerts UI

**Status :** `todo`
**Scope :** Backend + Frontend
**Dépendances :** v1-01 (Stock Management)

## Objectif

Affichage proéminent des alertes de stock bas dans le dashboard et la page inventory. Notifications visuelles pour que Sophie ne soit plus jamais en rupture de savon.

## Tâches

### 1. Alertes dans le Dashboard

- Section "Alertes stock" dans le dashboard manager (entre KPIs et tâches du jour)
- Card compacte par alerte : PropertyColorDot + nom item + quantité + "Commander"
- Rouge si critical (0), amber si low (≤ seuil)
- Lien "Voir tout" → page inventory filtrée sur les alertes

### 2. Indicateur dans la nav

- Badge amber/rouge sur l'icône Inventory dans le sidebar/BottomNavBar si alertes actives
- Compteur dans le KPIBar : "X alertes stock" (si > 0)

### 3. Page inventory — vue alertes

- Toggle ou tab "Alertes" qui filtre uniquement les items en dessous du seuil
- Tri par urgence (critical d'abord, puis low)

### 4. Action "Commander" (placeholder)

- Bouton "Commander" → pour MVP V1 : juste marquer comme "commande en cours" (flag local)
- Futur V1.1+ : intégration fournisseur ou rappel programmé

## Acceptance Criteria

- [ ] Les alertes stock apparaissent dans le dashboard
- [ ] Badge dans la navigation si alertes actives
- [ ] La vue alertes filtre correctement
- [ ] Couleurs : amber pour low, rouge pour critical
- [ ] Tous les textes i18n
