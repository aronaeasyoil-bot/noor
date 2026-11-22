import type { CatalogItem } from "./types";

const pkg = (
  slug: string,
  photos: CatalogItem["photos"],
  title: CatalogItem["title"],
  summary: CatalogItem["summary"],
  description: CatalogItem["description"],
): CatalogItem => ({ slug, category: "package", photos, title, summary, description, priceUnit: "per_person", maxPax: 30 });

export const packages: CatalogItem[] = [
  pkg(
    "flight-hotel",
    ["pkgFlightHotel", "flightHotel"],
    { en: "Flight + Hotel", fr: "Vol + Hôtel", ar: "طيران + فندق" },
    {
      en: "Return flights and a hotel chosen for your budget, in one booking.",
      fr: "Vols aller-retour et hôtel adapté à votre budget, en une seule réservation.",
      ar: "رحلات ذهاب وعودة وفندق يناسب ميزانيتك في حجز واحد.",
    },
    {
      en: "Tell us your departure city, dates and the type of hotel you like. We compare airlines and hotels and send you a combined, confirmed price.",
      fr: "Indiquez votre ville de départ, vos dates et le type d'hôtel souhaité. Nous comparons compagnies et hôtels et vous envoyons un prix global confirmé.",
      ar: "أخبرنا بمدينة المغادرة والتواريخ ونوع الفندق المفضل. نقارن شركات الطيران والفنادق ونرسل لك سعراً شاملاً مؤكداً.",
    },
  ),
  pkg(
    "hotel-transfer",
    ["pkgHotelTransfer", "transfersAirport"],
    { en: "Hotel + Transfer", fr: "Hôtel + Transfert", ar: "فندق + توصيل" },
    {
      en: "Your hotel plus private airport transfers on arrival and departure.",
      fr: "Votre hôtel et vos transferts privés à l'arrivée et au départ.",
      ar: "فندقك مع توصيل خاص من وإلى المطار عند الوصول والمغادرة.",
    },
    {
      en: "Ideal if you already have your flights: we book the hotel and a driver who meets you at arrivals.",
      fr: "Idéal si vous avez déjà vos vols : nous réservons l'hôtel et un chauffeur qui vous attend à l'arrivée.",
      ar: "مثالي إذا كانت رحلاتك محجوزة: نحجز الفندق وسائقاً يستقبلك في صالة الوصول.",
    },
  ),
  pkg(
    "dubai-holiday",
    ["pkgDubai", "heroDubai"],
    { en: "Dubai Holiday", fr: "Séjour à Dubaï", ar: "عطلة في دبي" },
    {
      en: "Hotel, transfers, desert safari and the city's must-sees.",
      fr: "Hôtel, transferts, safari et incontournables de la ville.",
      ar: "فندق وتوصيل وسفاري وأبرز معالم المدينة.",
    },
    {
      en: "A balanced 4 to 7-night stay mixing landmarks, beach time and a desert evening. Every element is adjustable.",
      fr: "Un séjour de 4 à 7 nuits équilibré entre monuments, plage et soirée dans le désert. Chaque élément est modulable.",
      ar: "إقامة متوازنة من 4 إلى 7 ليالٍ تجمع المعالم والشاطئ وأمسية في الصحراء. كل عنصر قابل للتعديل.",
    },
  ),
  pkg(
    "family-holiday",
    ["pkgFamily", "family2"],
    { en: "Family Holiday", fr: "Vacances en famille", ar: "عطلة عائلية" },
    {
      en: "Family rooms, theme parks and easy transfers.",
      fr: "Chambres familiales, parcs à thème et transferts simples.",
      ar: "غرف عائلية ومدن ترفيهية وتنقلات سهلة.",
    },
    {
      en: "Hotels with kids' clubs and pools, child seats in vehicles, and activities that suit every age.",
      fr: "Hôtels avec club enfants et piscines, sièges enfants dans les véhicules et activités pour tous les âges.",
      ar: "فنادق بأندية أطفال ومسابح ومقاعد أطفال في المركبات وأنشطة تناسب جميع الأعمار.",
    },
  ),
  pkg(
    "honeymoon",
    ["pkgHoneymoon", "maldives"],
    { en: "Honeymoon", fr: "Voyage de noces", ar: "شهر العسل" },
    {
      en: "Romantic resorts in Dubai, the Maldives or Zanzibar.",
      fr: "Hôtels romantiques à Dubaï, aux Maldives ou à Zanzibar.",
      ar: "منتجعات رومانسية في دبي أو جزر المالديف أو زنجبار.",
    },
    {
      en: "Suites with a view, private dinners, couple's spa and a sunset yacht cruise — built around your dates.",
      fr: "Suites avec vue, dîners privés, spa en duo et croisière au coucher du soleil, selon vos dates.",
      ar: "أجنحة بإطلالات وعشاء خاص وسبا للأزواج ورحلة يخت عند الغروب وفق مواعيدكم.",
    },
  ),
  pkg(
    "business-travel",
    ["pkgBusiness", "business"],
    { en: "Business Travel", fr: "Voyage d'affaires", ar: "سفر الأعمال" },
    {
      en: "Flights, business hotels, meeting rooms and chauffeurs.",
      fr: "Vols, hôtels d'affaires, salles de réunion et chauffeurs.",
      ar: "رحلات وفنادق أعمال وقاعات اجتماعات وسائقون.",
    },
    {
      en: "Fast changes, invoices for your company and one adviser who knows your travel policy.",
      fr: "Modifications rapides, factures au nom de votre société et un conseiller qui connaît votre politique voyage.",
      ar: "تعديلات سريعة وفواتير باسم شركتك ومستشار يعرف سياسة السفر لديكم.",
    },
  ),
  pkg(
    "group-travel",
    ["pkgGroup", "groupTravel"],
    { en: "Group Travel", fr: "Voyage de groupe", ar: "رحلات المجموعات" },
    {
      en: "Group fares, hotel blocks and private coaches.",
      fr: "Tarifs groupe, blocs de chambres et autocars privés.",
      ar: "أسعار المجموعات وحجز كتل الغرف وحافلات خاصة.",
    },
    {
      en: "From 10 travellers: schools, associations, trade-fair delegations and family events.",
      fr: "À partir de 10 voyageurs : écoles, associations, délégations pour salons et événements familiaux.",
      ar: "ابتداءً من 10 مسافرين: مدارس وجمعيات ووفود المعارض والمناسبات العائلية.",
    },
  ),
  pkg(
    "luxury-holiday",
    ["pkgLuxury", "luxury"],
    { en: "Luxury Holiday", fr: "Séjour de luxe", ar: "عطلة فاخرة" },
    {
      en: "Five-star resorts, yachts and VIP experiences.",
      fr: "Hôtels cinq étoiles, yachts et expériences VIP.",
      ar: "منتجعات خمس نجوم ويخوت وتجارب لكبار الشخصيات.",
    },
    {
      en: "Airport meet-and-greet, luxury vehicles, private yacht charters and exclusive dining, handled by a dedicated adviser.",
      fr: "Accueil VIP à l'aéroport, véhicules de luxe, yachts privés et tables d'exception, gérés par un conseiller dédié.",
      ar: "استقبال خاص في المطار ومركبات فاخرة ويخوت خاصة ومطاعم حصرية مع مستشار مخصص.",
    },
  ),
];
