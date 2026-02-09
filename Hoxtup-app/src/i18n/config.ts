import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import commonFr from './locales/fr/common.json'
import authFr from './locales/fr/auth.json'
import dashboardFr from './locales/fr/dashboard.json'
import tasksFr from './locales/fr/tasks.json'
import propertiesFr from './locales/fr/properties.json'
import calendarFr from './locales/fr/calendar.json'
import inventoryFr from './locales/fr/inventory.json'
import billingFr from './locales/fr/billing.json'
import notificationsFr from './locales/fr/notifications.json'
import settingsFr from './locales/fr/settings.json'
import reservationsFr from './locales/fr/reservations.json'

const resources = {
  fr: {
    common: commonFr,
    auth: authFr,
    dashboard: dashboardFr,
    tasks: tasksFr,
    properties: propertiesFr,
    calendar: calendarFr,
    inventory: inventoryFr,
    billing: billingFr,
    notifications: notificationsFr,
    settings: settingsFr,
    reservations: reservationsFr,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    defaultNS: 'common',
    ns: [
      'common',
      'auth',
      'dashboard',
      'tasks',
      'properties',
      'calendar',
      'inventory',
      'billing',
      'notifications',
      'settings',
      'reservations',
    ],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'hoxtup-lang',
    },
  })

export default i18n
