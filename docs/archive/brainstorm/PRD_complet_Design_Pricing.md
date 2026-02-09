# Hoxtup – PRD Complet, Design & Pricing

---

## 1️⃣ Vision Produit

Créer un **outil interne tout-en-un** pour la gestion opérationnelle des locations courte durée (Airbnb & assimilés), destiné **exclusivement aux propriétaires, agences et hôtes professionnels**, sans accès locataire.

Le produit agit comme un **cockpit opérationnel** :
- planification
- coordination des équipes
- suivi des logements
- contrôle des coûts
- gestion des stocks

👉 Remplacer Excel, WhatsApp, notes papier et outils fragmentés.

---

## 2️⃣ Cible & Utilisateurs

### Utilisateurs cibles
- Propriétaires multi-logements
- Agences de gestion locative courte durée
- Hôtes professionnels

### Rôles internes
- Admin / Owner
- Manager d’exploitation
- Employé ménage
- Technicien / prestataire
- Comptable interne (lecture seule)

❌ Aucun accès locataire  
❌ Aucun portail client  

---

## 3️⃣ Périmètre MVP

### Inclus
- Réservations (manuel + iCal)
- Calendriers multi-vues
- Tâches & équipes
- Maintenance & incidents
- Gestion de stock
- Comptabilité légère
- Notifications in-app & email
- UX optimisée mobile

### Exclus
- API plateformes
- Messagerie client
- CRM voyageurs
- Pricing dynamique
- Comptabilité fiscale complète

---

## 4️⃣ Réservations (Module Central)

- Ajout manuel de réservations
- Connexion iCal optionnelle (non obligatoire)
- Chaque utilisateur peut :
  - utiliser le produit sans aucune connexion externe
  - connecter 1 ou plusieurs sources iCal
- Synchronisation périodique

Données gérées :
- logement
- dates
- source (Airbnb, Booking, manuel)
- statut
- notes internes

📌 Les réservations externes ne sont jamais éditables.

---

## 5️⃣ Calendriers & Vues

- Vue globale (tous logements)
- Vue par logement
- Vue par employé
- Vue ménage
- Vue maintenance
- Vue stock / achats

Éléments affichés :
- réservations
- ménages
- interventions
- inspections
- achats planifiés
- incidents

📱 Mobile-first :
- navigation rapide
- vues condensées
- actions accessibles en 1–2 clics

---

## 6️⃣ Tâches & Équipes

- Création automatique ou manuelle
- Assignation manuelle
- Statuts : à faire / en cours / terminé
- Historique par logement & employé

Types de tâches :
- ménage
- check-in / check-out
- inspection
- maintenance
- réapprovisionnement stock

---

## 7️⃣ Maintenance & Incidents

- Création d’incident
- Catégorisation (plomberie, mobilier, etc.)
- Priorité
- Assignation
- Suivi du statut
- Historique par logement

---

## 8️⃣ Gestion de Stock

Types de stock :
- produits de ménage
- linge
- consommables
- produits d’accueil
- petit matériel

Fonctionnalités :
- Stock par logement ou dépôt
- Entrées (achats, réassort)
- Sorties (consommation, casse)
- Seuils minimum
- Alertes automatiques
- Génération de tâches “achat”

---

## 9️⃣ Comptabilité Légère

- Entrées : revenus locatifs (manuel ou import)
- Sorties : ménage, maintenance, achats de stock, prestataires
- Résultats : solde par période, coût par logement, coût par catégorie

❌ Pas de TVA, bilan comptable ou rapprochement bancaire

---

## 10️⃣ Notifications

### MVP
- In-app
- Email

### V1 (prévu)
- WhatsApp
- Prix add-on : 15–20 MAD / logement / mois

---

## 11️⃣ Dashboard & Pilotage

- Logements les plus coûteux
- Incidents récurrents
- Charge des équipes
- Ruptures de stock
- Périodes critiques

---

## 12️⃣ UX & Contraintes Produit

- Mobile-first
- Temps d’apprentissage minimal
- Peu de clics
- Lisibilité maximale
- Fonctionnement possible sans intégration externe

---

## 13️⃣ Naming & Positionnement

### Nom
**Hoxtup** ⭐

### Slogan possibles
- *Hoxtup — Pilot your rentals. Calmly.*
- *Hoxtup — All your operations. One place.*
- *Hoxtup — From chaos to control.*

### Pourquoi
- Clair B2B
- Premium discret
- Internationalisable
- Orienté opérationnel & terrain

---

## 14️⃣ Pricing – Maroc & Scalabilité

### 🟢 PLAN STARTER
- Jusqu’à 5 logements
- Réservations manuelles + iCal
- Calendriers multi-vues
- Tâches & maintenance
- Stock basique
- Comptabilité légère
- Notifications in-app & email

💰 **49 MAD / logement / mois** (≈ 5 €)

---

### 🔵 PLAN PRO (CORE)
- Logements illimités
- Toutes les vues calendrier
- Gestion équipes complète
- Stock avancé + alertes
- Comptabilité détaillée
- Dashboards avancés
- Export des données

💰 **79 MAD / logement / mois** (≈ 7,5 €)

---

### 🟣 PLAN AGENCY
- Multi-comptes / multi-agences
- Droits avancés
- Rapports consolidés
- Support prioritaire
- Onboarding assisté

💰 **99–119 MAD / logement / mois**

---

### 🔔 Add-on WhatsApp Notifications (V1)
- Notifications tâches, incidents, stock critique
- Facturation séparée
- Prix : 15–20 MAD / logement / mois

---

### Offre Early Adopters Marrakech
- 30 jours gratuits
- Prix bloqué 12 mois
- Support prioritaire
- Test terrain & bouche-à-oreille

---

## 15️⃣ Design Produit – UI / UX

### Principes
- Premium discret
- Opérationnel
- Légèreté cognitive
- Mobile-first
- Navigation rapide, actions accessibles
- Hiérarchie visuelle claire

### Palette
- Bleu profond / graphite / vert foncé
- Secondaires : vert (ok), orange (attention), rouge doux (urgent)
- Fond clair (blanc / gris très clair)

### Typographie
- Sans-serif moderne
- Très lisible sur mobile
- Titres clairs, chiffres mis en valeur

### Structure écran
1. En-tête clair
2. Indicateurs clés
3. Liste ou calendrier
4. Actions rapides

### Calendrier
- Code couleur pour chaque événement
- Tap = détail
- Swipe = navigation
- Long press = action rapide

### Tâches
- Cartes simples, statut visuel immédiat, priorité claire

### Stock & Finances
- Listes claires, alertes visuelles
- Graphiques simples, lisibles

---

## 16️⃣ Landing Page – Marketing & Conversion

### Hero Section
- Accroche : *Pilotez vos locations courte durée sans chaos.*
- Sous-titre : Tout votre quotidien opérationnel dans un seul outil interne, simple et fiable.
- CTA : “Demander une démo” / “Essayer gratuitement”

### Problème
- Trop d’outils dispersés (Excel, WhatsApp, notes)
- Erreurs et stress fréquents

### Solution
- Cockpit opérationnel, pour **vos équipes**, pas les locataires
- Vue globale, tâches automatisées, suivi des incidents, contrôle des coûts

### Fonctionnalités clés
- Calendrier intelligent
- Tâches & équipes
- Stock & achats
- Finances simplifiées

### Différenciation
- Mobile-first, terrain, sans superflu, usage quotidien

### Preuve / réassurance
- Inspiré PMS existants
- Simplifié pour usage réel
- Sécurisé et fiable

### CTA Final
- “Reprenez le contrôle de vos opérations”
- “Demander une démo” / “Tester gratuitement”
