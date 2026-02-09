# Story 1.7: Internationalization & Multi-Currency Infrastructure

## Epic: 1 - Foundation & Secure Access

As a **user**,
I want the platform in French with my organization's currency formatting,
So that I can work in my language and see all financial data in the right format from day one.

## Requirements Covered

- FR52: Translation infrastructure (zero hardcoded strings, JSON namespaces)
- FR53: Language selection (French at launch, user preference)
- FR54: i18n extensibility (new language = new JSON file only)
- FR55: Organization currency selection (EUR or MAD)
- FR56: Currency display formatting (symbol, decimal separator)
- FR57: Currency extensibility (config entry only)

## Acceptance Criteria

**Given** the frontend application
**When** it loads
**Then** all user-facing text is rendered from translation keys via react-i18next
**And** zero hardcoded strings exist in any component

**Given** the French translation files
**When** I inspect the JSON namespaces
**Then** I find separate files for: common, dashboard, tasks, inventory, settings, auth, properties, calendar, billing, notifications
**And** each namespace contains all keys used by its corresponding feature area

**Given** a future developer wants to add Arabic
**When** they create a new set of JSON files in the `ar` locale folder
**Then** the language becomes available without any code changes
**And** the app correctly handles RTL layout via logical CSS properties

**Given** I am in my profile settings
**When** I select my preferred language
**Then** the preference is saved and the UI updates immediately
**And** the preference persists across sessions

**Given** the organization setup
**When** the owner selects a currency (EUR or MAD) during onboarding
**Then** all financial data throughout the app displays in that currency
**And** the currency symbol, decimal separator, and formatting follow locale conventions

**Given** a currency value of 1500 centimes in EUR
**When** it is displayed in the UI
**Then** it shows "15,00 €" (French locale) or "€15.00" (English locale)
**And** the value is always stored as integer centimes in the database

**Given** a future admin wants to add GBP currency
**When** they add a config entry with symbol, code, decimal places, and formatting rules
**Then** the currency becomes available without schema or code changes

**Given** the backend API
**When** it returns error messages or sends emails
**Then** all text is internationalized using the user's preferred language
**And** email templates use the same translation key system

## Technical Notes

- Frontend: react-i18next with lazy-loaded namespaces
- Backend: custom i18n module loading JSON files, used for error messages + email templates
- Currency: `Intl.NumberFormat` on frontend, custom formatter on backend
- Money model: `{ amount: number (centimes), currency: string (ISO 4217) }`
- Organization table: `currency_code` column (default: 'EUR')
- User table: `preferred_language` column (default: 'fr')
- Translation file path: `Hoxtup-app/public/locales/{lang}/{namespace}.json`
