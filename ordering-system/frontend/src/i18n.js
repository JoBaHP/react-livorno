import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      app_title: 'Ristorante',
      // MenuItem
      customize: 'Customize',
      add: 'Add',
      image_not_found: 'Image Not Found',
      // CartView
      your_order: 'Your Order',
      empty_cart: 'Your cart is empty.',
      total: 'Total',
      order_notes: 'Order Notes',
      notes_placeholder: 'e.g., no onions, allergy info',
      payment_method: 'Payment Method',
      cash: 'Cash',
      card: 'Card',
      sending: 'Sending...',
      place_order: 'Place Order',
      // CustomerView misc
      no_table_selected: 'No Table Selected',
      scan_qr_prompt: 'Please scan a QR code on your table to start ordering.',
      simulate_table_hint: 'To simulate, add `?table=1` to the URL.',
      customization: {
        size: 'Size',
        extras: 'Extras',
        addons_free: 'Add-ons (Free)',
        cancel: 'Cancel',
        add_to_order: 'Add to Order',
      },
      // Order status
      order_in: 'Your Order is In!',
      order_id: 'Order ID: #{{id}}',
      estimated_wait: 'Estimated wait: {{minutes}} minutes',
      status: {
        waiting: 'Waiting for Confirmation',
        accepted: 'Order Accepted!',
        preparing: 'In the Kitchen!',
        ready: 'Your order is ready!',
        declined: 'Order Declined',
        unknown: 'Order status unknown',
      },
      thank_you: 'Thank You!',
      feedback_received: 'Your feedback has been received.',
      start_new_order: 'Start New Order',
      back_to_menu: 'Back to Menu',
    },
  },
  sr: {
    translation: {
      app_title: 'Ristorante',
      // MenuItem
      customize: 'Prilagodi',
      add: 'Dodaj',
      image_not_found: 'Slika nije pronađena',
      // CartView
      your_order: 'Vaša porudžbina',
      empty_cart: 'Vaša korpa je prazna.',
      total: 'Ukupno',
      order_notes: 'Napomene za porudžbinu',
      notes_placeholder: 'npr. bez luka, alergije',
      payment_method: 'Način plaćanja',
      cash: 'Gotovina',
      card: 'Kartica',
      sending: 'Slanje...',
      place_order: 'Pošalji porudžbinu',
      // CustomerView misc
      no_table_selected: 'Nije izabran sto',
      scan_qr_prompt: 'Skenirajte QR kod na stolu da započnete poručivanje.',
      simulate_table_hint: 'Za simulaciju dodajte `?table=1` u URL.',
      customization: {
        size: 'Veličina',
        extras: 'Dodaci',
        addons_free: 'Dodaci (besplatno)',
        cancel: 'Otkaži',
        add_to_order: 'Dodaj u porudžbinu',
      },
      // Order status
      order_in: 'Vaša porudžbina je poslata!',
      order_id: 'ID porudžbine: #{{id}}',
      estimated_wait: 'Procenjeno čekanje: {{minutes}} minuta',
      status: {
        waiting: 'Čekamo potvrdu',
        accepted: 'Porudžbina prihvaćena!',
        preparing: 'U pripremi!',
        ready: 'Porudžbina je spremna!',
        declined: 'Porudžbina odbijena',
        unknown: 'Nepoznat status porudžbine',
      },
      thank_you: 'Hvala!',
      feedback_received: 'Vaš komentar je primljen.',
      start_new_order: 'Nova porudžbina',
      back_to_menu: 'Nazad na meni',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['navigator', 'htmlTag', 'cookie'],
      caches: ['cookie'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
