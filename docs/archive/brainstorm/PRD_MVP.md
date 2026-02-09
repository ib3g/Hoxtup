# PRD – MVP
## SaaS de Gestion Interne pour Locations Courte Durée

---

## 1. Vision Produit

Créer un **outil interne tout-en-un** pour la gestion opérationnelle des locations courte durée (Airbnb & assimilés), destiné **exclusivement aux propriétaires, agences et hôtes professionnels**, sans accès locataire.

Le produit agit comme un **cockpit opérationnel** :
- planification
- coordination des équipes
- suivi des logements
- contrôle des coûts
- gestion des stocks

👉 Remplacer Excel, WhatsApp, notes papier et outils fragmentés.

---

## 2. Cible & Utilisateurs

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

## 3. Périmètre MVP (Tout inclus)

### Inclus dans le MVP
- Réservations (manuel + iCal)
- Calendriers multi-vues
- Tâches & équipes
- Maintenance & incidents
- Gestion de stock
- Comptabilité légère
- Notifications in-app & email
- UX optimisée mobile

### Exclus (hors périmètre)
- API plateformes
- Messagerie client
- CRM voyageurs
- Pricing dynamique
- Comptabilité fiscale complète

---

## 4. Réservations (Module Central – Read Only)

### Objectif
Centraliser les réservations comme **événements déclencheurs d’opérations**.

### Fonctionnalités MVP
- Ajout manuel de réservations
- Connexion iCal optionnelle (non obligatoire)
- Chaque utilisateur peut :
  - utiliser le produit sans aucune connexion externe
  - connecter 1 ou plusieurs sources iCal
- Synchronisation périodique

### Données gérées
- logement
- dates
- source (Airbnb, Booking, manuel)
- statut
- notes internes

📌 Les réservations externes ne sont jamais éditables.

---

## 5. Calendriers & Vues (Module Structurant)

### Objectif
Donner une vision claire de **tout ce qui est prévu ou en cours**.

### Types de vues
- Vue globale (tous logements)
- Vue par logement
- Vue par employé
- Vue ménage
- Vue maintenance
- Vue stock / achats

### Éléments affichés
- réservations
- ménages
- interventions
- inspections
- achats planifiés
- incidents

📱 **Optimisation mobile obligatoire**
- navigation rapide
- vues condensées
- actions accessibles en 1–2 clics

---

## 6. Tâches & Équipes

### Objectif
Éliminer les oublis et améliorer la coordination terrain.

### Types de tâches
- ménage
- check-in / check-out
- inspection
- maintenance
- réapprovisionnement stock

### Fonctionnalités
- création automatique ou manuelle
- assignation manuelle
- statuts : à faire / en cours / terminé
- historique par logement & employé

---

## 7. Maintenance & Incidents

### Objectif
Suivre et réduire les problèmes récurrents.

### Fonctionnalités
- création d’incident
- catégorisation (plomberie, mobilier, etc.)
- priorité
- assignation
- suivi du statut
- historique par logement

---

## 8. Gestion de Stock (Différenciation Clé)

### Objectif
Éviter ruptures, achats urgents et perte de contrôle.

### Types de stock
- produits de ménage
- linge
- consommables
- produits d’accueil
- petit matériel

### Fonctionnalités
- stock par logement ou dépôt
- entrées (achats, réassort)
- sorties (consommation, casse)
- seuils minimum
- alertes automatiques
- génération de tâches “achat”

---

## 9. Comptabilité Légère

### Objectif
Donner de la visibilité financière sans complexité comptable.

### Entrées
- revenus locatifs (manuel ou import)

### Sorties
- ménage
- maintenance
- achats de stock
- prestataires

### Résultats
- solde par période
- coût par logement
- coût par catégorie

❌ Pas de TVA  
❌ Pas de bilan comptable  
❌ Pas de rapprochement bancaire  

---

## 10. Notifications

### MVP
- Notifications in-app
- Notifications email

### Cas de notification
- nouvelle réservation
- tâche assignée
- tâche en retard
- incident critique
- stock sous seuil

### V1 (prévu)
- Notifications WhatsApp

📌 WhatsApp prévu dès la conception mais non activé dans le MVP.

---

## 11. Dashboard & Pilotage

### Objectif
Permettre une prise de décision rapide.

### Indicateurs clés
- logements les plus coûteux
- incidents récurrents
- charge des équipes
- ruptures de stock
- périodes critiques

---

## 12. UX & Contraintes Produit

- Mobile-first (usage terrain prioritaire)
- Temps d’apprentissage minimal
- Peu de clics
- Lisibilité maximale
- Fonctionnement possible sans aucune intégration externe

---

## 13. Modèle Business (MVP)

- SaaS B2B
- Facturation par logement / mois
- Paliers :
  - solo hôte
  - petite agence
  - multi-logements

Upsells possibles :
- utilisateurs supplémentaires
- rapports avancés
- exports
- WhatsApp notifications (V1)

---

## 14. Positionnement Final

> Le logiciel interne qui permet aux propriétaires et agences de piloter leurs locations courte durée sans dépendre d’outils externes ni multiplier les plateformes.

---

## 15. Étapes suivantes (hors PRD)
- Découpage MVP / V1 / V2
- Wireframes mobile
- Modèle de données
- Architecture technique
