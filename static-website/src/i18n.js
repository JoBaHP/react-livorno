// /Users/jovanraosavljevic/Desktop/react-livorno/src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Translation resources
const resources = {
  en: {
    translation: {
      // Welcome & Basic Navigation
      welcome: "Welcome to Livorno",
      menu: "Menu",
      about: "About Us",
      contact: "Contact",
      order: "Order Online",
      home: "Home",
      order_online: "Order Online",
      view_menu: "View Menu",
      
      // Header Section
      authentic_recipe: "Authentic Recipe",
      unforgettable_taste: "Taste That Conquers",
      header_description: "Restaurant Livorno takes pride in selecting only natural and fresh ingredients, which we use to prepare diverse dishes with a unique flavor. Combined with our friendly staff and pleasant atmosphere, it provides a unique experience.",
      
      // About Us
      about_us: "About Us",
      our_story: "Our Story",
      about_history_title: "Our History",
      about_history_content: "Using only fresh ingredients in combination with friendly service, Restaurant Livorno has quickly found its way to success, offering a relaxed and unique dining experience. Restaurant Livorno takes pride in the selection of only natural ingredients, using only the best for preparing the freshest dishes.",
      learn_more: "Learn More",
      our_story_content: "Our family-run restaurant, Livorno, was founded in March 2012. We are passionate about what we do and look forward to sharing our love for gourmet dishes at our restaurant located in Novi Sad, at Bulevar Patrijarha Pavla 12.",
      
      // Awards
      awards_title: "Awards & Recognition",
      awards_card: {
        taste: "Excellent Food",
        taste_description: "Always the best from our kitchen.",
        service: "Friendly Staff",
        service_description: "They will ensure all your requirements are met.",
        atmosphere: "Pleasant Ambience",
        atmosphere_description: "A place where you will want to come back.",
        coffee: "Exceptional Coffee",
        coffee_description: "We use only premium coffee for your senses."
      },
      
      // Footer
      contact_us: "Contact Us",
      contact_address: "Bulevar Patrijarha Pavla 12, Novi Sad",
      working_hours_title: "Working Hours",
      working_hours: {
        weekdays: "Monday-Friday: 07:00 - 23:00",
        weekends: "Saturday-Sunday: 07:00 - 00:00"
      },
      copyright: "All Rights Reserved by Livorno Restaurant",
      
      // Find Us
      find_us: "Contact",
      find_us_location: "We are located at",
      find_us_address: "Bulevar Patrijarha Pavla 12",
      working_hours_short: "Working Hours",
      weekdays: "Monday - Friday: 07:00 - 23:00",
      weekends: "Saturday - Sunday: 08:00 - 00:00",
      visit_us: "Visit Us",
      
      // Gallery
      instagram: "Instagram",
      photo_gallery: "Photo Gallery",
      gallery_description: "Sometimes pictures can say more than words. That's why you can follow us on Instagram for more photos",
      view_more: "View More",
      
      // Delivery Components
      order_for_delivery: "Order for Delivery",
      delivery_description: "Freshly prepared and delivered to your door.",
      loading_menu: "Loading menu...",
      view_order: "View Order",
      item: "item",
      items: "items",
      order_summary: "Order Summary",
      subtotal: "Subtotal",
      delivery_fee_info: "Delivery fee will be calculated based on your address.",
      checkout: "Checkout",
      your_information: "Your Information",
      full_name: "Full Name",
      phone_number: "Phone Number",
      street: "Street",
      street_number: "Street Number",
      street_search_placeholder: "Type to search...",
      floor: "Floor (optional)",
      apartment: "Apartment (optional)",
      order_notes: "Order Notes (optional)",
      order_notes_placeholder: "e.g., no onions, allergy info",
      back_to_menu: "Back to Menu",
      confirm_order: "Confirm & Place Order",
      placing_order: "Placing Order...",
      place_order_error: "An error occurred while placing your order.",
      customization_modal: {
        size: "Size",
        extras: "Extras",
        addons_free: "Add-ons (Free)",
        cancel: "Cancel",
        add_to_order: "Add to Order",
        update_order: "Update Order"
      },
      delivery_status: {
        pending_text: "Order Placed Successfully!",
        pending_subtext: "We've received your order and will confirm it shortly.",
        accepted_text: "Your Order is Accepted!",
        accepted_subtext: "Estimated delivery time is {{minutes}} minutes.",
        preparing_text: "Your Food is Being Prepared!",
        preparing_subtext: "Estimated delivery time is {{minutes}} minutes.",
        ready_text: "Out for Delivery!",
        ready_subtext: "Your order is on its way to you.",
        completed_text: "Order Delivered!",
        completed_subtext: "Enjoy your meal!",
        declined_text: "Order Declined",
        declined_subtext: "There was an issue with your order. Please contact us for more information.",
        default_text: "Order Placed Successfully!",
        default_subtext: "We'll start preparing it right away.",
        order_id: "Your order ID is #{{id}}"
      },
      
      // Navbar
      experience: "Experience",
      
      // Newsletter
      newsletter: "Newsletter",
      stay_in_touch: "Stay in Touch",
      never_miss_news: "And never miss our news!",
      name_placeholder: "Enter Your Name",
      phone_placeholder: "Enter Your Phone Number",
      email_placeholder: "Enter Your Email Address",
      message_placeholder: "Enter Your Message",
      send: "Send",
      thanks_for_joining: "Thanks for joining!",
      
      // MenuItem
      customize: "Customize",
      add: "Add",
      image_not_found: "Image Not Found",
      
      // Modal
      try_our_crispy_chicken: "Have you already tried our crispy chicken?",
      crispy_chicken_price: "Price: 790din",
      call_now: "Call now:",
      footer_quote: "\"The best way to find yourself is to come to us!\"",
      
      // SpecialMenu
      menu_for_all_tastes: "Menu that satisfies all tastes",
      featured_selection: "Featured Selection",
      drinks_menu: "Drinks Menu",
      popular_dishes: "Popular Dishes",
      full_menu: "Full Menu",
      
      // Data Translations
      wine_title: "Drinks",
      cocktail_title: "Specialities",
      foods: {
        title: "Delicious Food",
        description: "Delights awaits in Restaurant Livorno with exceptional ingredients and unique taste. Restaurant Livorno has been trusted for years by numerous connoisseurs of gourmet cuisine for its unforgettable taste.",
      },
      
      // Chef Section
      chefs_word: "Chef's word",
      what_we_believe: "What we believe in",
      chef_motto: "Team spirit, pleasant atmosphere and excellent food is our motto.",
      chef_description: "We combine only fresh ingredients which, together with recognizable Italian oils and flour, make our dishes truly appeal to all senses. In our restaurant you will be greeted by friendly staff backed by a fantastic team from our kitchen who are responsible for preparing these delicious dishes. Convince yourself!",
      chef_name: "Veselin R.",
      chef_title: "Chef & Founder"
    },
  },
  sr: {
    translation: {
      // Welcome & Basic Navigation
      welcome: "Dobrodošli u Livorno",
      menu: "Meni",
      about: "O Nama",
      contact: "Kontakt",
      order: "Poručite Online",
      home: "Početna",
      order_online: "Poručite Online",
      view_menu: "Pogledaj Meni",
      
      // Header Section
      authentic_recipe: "Originalna Receptura",
      unforgettable_taste: "Ukus koji osvaja",
      header_description: "Restoran Livorno se ponosi odabirom samo prirodnih i svežih sastojaka koje koristimo za pripremu raznovrsnih jela jedinstvenog ukusa. U kombinaciji sa ljubaznim osobljem i prijatnim ambijentom pruža jedinstveno iskustvo.",
      
      // About Us
      about_us: "O Nama",
      our_story: "Naša Priča",
      about_history_title: "Naša Istorija",
      about_history_content: "Koristeći samo sveže sastojke u kombinaciji sa ljubaznom uslugom, restoran Livorno je vrlo brzo našao put ka uspehu, nudeći opušteno i jedinstveno iskustvo ručavanja. Restoran Livorno se ponosi odabirom samo prirodnih sastojaka, koristeći samo najbolje za pripremu najsvežijih jela.",
      learn_more: "Saznajte Više",
      our_story_content: "Porodično preduzeće, restoran Livorno, osnovano je u martu 2012. godine. Zaljubljeni smo u ono što radimo i radujemo se da podelimo ljubav prema gurmanskim jelima u našem restoranu u Novom Sadu, u ulici Bulevar patrijarha Pavla 12.",
      
      // Awards
      awards_title: "Prepoznatljivost & pogodnosti",
      awards_card: {
        taste: "Ukusna Hrana",
        taste_description: "Uvek samo najbolje iz naše kuhinje.",
        service: "Ljubazno Osoblje",
        service_description: "Postaraće se da se ispune svi vaši zahtevi.",
        atmosphere: "Prijatan Ambijent",
        atmosphere_description: "Mesto gde ćete poželiti opet da dođete.",
        coffee: "Izvanredna Kafa",
        coffee_description: "Koristimo samo premium kafu za vaša čula."
      },
      
      // Footer
      contact_us: "Kontaktirajte nas",
      contact_address: "Bulevar Patrijarha Pavla 12, Novi Sad",
      working_hours_title: "Radno Vreme",
      working_hours: {
        weekdays: "Ponedeljak-Petak: 07:00 - 23:00",
        weekends: "Subota-Nedelja: 07:00 - 00:00"
      },
      copyright: "Sva Prava Zadržana od strane Restorana Livorno",
      
      // Find Us
      find_us: "Kontakt",
      find_us_location: "Nalazimo se U",
      find_us_address: "ulici Bulevar partrijarha Pavla 12",
      working_hours_short: "Radno Vreme",
      weekdays: "Ponedeljak - Petak: 07:00 h - 23:00 h",
      weekends: "Subota - Nedelja: 08:00 h - 00:00 h",
      visit_us: "Posetite Nas",
      
      // Gallery
      instagram: "Instagram",
      photo_gallery: "Foto Galerija",
      gallery_description: "Ponekad slike mogu da kažu više od reči. Zato nas možete zapratiti na Instagramu za više fotografija",
      view_more: "Pogledaj Više",
      
      // Delivery Components
      order_for_delivery: "Poruči za Dostavu",
      delivery_description: "Sveže pripremljeno i dostavljeno do vaših vrata.",
      loading_menu: "Učitavanje menija...",
      view_order: "Pogledaj Porudžbinu",
      item: "stavka",
      items: "stavki",
      order_summary: "Pregled Porudžbine",
      subtotal: "Ukupno",
      delivery_fee_info: "Cena dostave će biti izračunata na osnovu vaše adrese.",
      checkout: "Plaćanje",
      your_information: "Vaši Podaci",
      full_name: "Puno Ime",
      phone_number: "Broj Telefona",
      street: "Ulica",
      street_number: "Broj Ulice",
      street_search_placeholder: "Ukucajte za pretragu...",
      floor: "Sprat (opciono)",
      apartment: "Stan (opciono)",
      order_notes: "Napomene za Porudžbinu (opciono)",
      order_notes_placeholder: "npr., bez luka, alergije",
      back_to_menu: "Nazad na Meni",
      confirm_order: "Potvrdi i Pošalji Porudžbinu",
      placing_order: "Slanje Porudžbine...",
      place_order_error: "Došlo je do greške pri slanju porudžbine.",
      customization_modal: {
        size: "Veličina",
        extras: "Dodaci",
        addons_free: "Dodaci (Besplatno)",
        cancel: "Otkaži",
        add_to_order: "Dodaj u Porudžbinu",
        update_order: "Ažuriraj porudžbinu"
      },
      delivery_status: {
        pending_text: "Porudžbina je uspešno poslata!",
        pending_subtext: "Primili smo vašu porudžbinu i uskoro ćemo je potvrditi.",
        accepted_text: "Vaša porudžbina je prihvaćena!",
        accepted_subtext: "Procenjeno vreme isporuke je {{minutes}} minuta.",
        preparing_text: "Vaša hrana se priprema!",
        preparing_subtext: "Procenjeno vreme isporuke je {{minutes}} minuta.",
        ready_text: "Porudžbina je na putu!",
        ready_subtext: "Vaša porudžbina je krenula ka vama.",
        completed_text: "Porudžbina isporučena!",
        completed_subtext: "Prijatno!",
        declined_text: "Porudžbina je odbijena",
        declined_subtext: "Došlo je do problema sa porudžbinom. Kontaktirajte nas za više informacija.",
        default_text: "Porudžbina je uspešno poslata!",
        default_subtext: "Počinjemo odmah sa pripremom.",
        order_id: "ID vaše porudžbine je #{{id}}"
      },
      
      // Navbar
      experience: "Doživljaj",
      
      // Newsletter
      newsletter: "Newsletter",
      stay_in_touch: "Ostanimo u kontaktu",
      never_miss_news: "I nikada ne propustite naše novosti!",
      name_placeholder: "Unesite Vaše ime",
      phone_placeholder: "Unesite Vaš broj telefona",
      email_placeholder: "Unesite Vašu email adresu",
      message_placeholder: "Unesite Vašu poruku",
      send: "Pošalji",
      thanks_for_joining: "Hvala što ste se pridružili!",
      
      // MenuItem
      customize: "Prilagodi",
      add: "Dodaj",
      image_not_found: "Slika Nije Pronađena",
      
      // Modal
      try_our_crispy_chicken: "Da li ste vec probali nasu hrskavu piletinu?",
      crispy_chicken_price: "Cena: 790din",
      call_now: "Pozovite:",
      footer_quote: "\"Najbolji način da pronađete sebe jeste da dođete kod nas!\"",
      
      // SpecialMenu
      menu_for_all_tastes: "Meni koji zadovoljava sve ukuse",
      featured_selection: "Izdvajamo iz Ponude",
      drinks_menu: "Karta Pića",
      popular_dishes: "Popularna Jela",
      full_menu: "Ceo Meni",
      
      // Data Translations
      wine_title: "Pića",
      cocktail_title: "Specijalnosti",
      foods: {
        title: "Gurmanska Jela",
        description: "Zaštita pronađete kod nas sa izuzetnim sastojcima i jedinstvenim ukusom. Restoran Livorno više godina zahvaljujući neprobitnoj hrani za vjerne klijente arež omogućuja nezaboravno iskustvo."
      },
      
      // Chef Section
      chefs_word: "Reč šefa",
      what_we_believe: "U šta mi verujemo",
      chef_motto: "Timski duh, prijatna atmosfera i izvrsna hrana je naš moto.",
      chef_description: "Kombinujemo samo sveže namirnice koje uz prepoznatljiva Italijanska ulja i brašna čine da naša jela istinski bude sva čula. U našem restoranu će vas dočekati prijatno osoblje iza kojeg stoji fantastičan tim iz naše kuhinje koji je zadužen za pripremu ovih ukusnih jela. Uverite se i sami!",
      chef_name: "Veselin R.",
      chef_title: "Chef & Osnivač"
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    detection: {
      order: ["navigator", "htmlTag", "cookie"],
      caches: ["cookie"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
