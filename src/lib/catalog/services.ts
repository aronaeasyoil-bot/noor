import type { CatalogItem } from "./types";

const svc = (
  slug: string,
  photo: CatalogItem["photos"][number],
  title: CatalogItem["title"],
  summary: CatalogItem["summary"],
  description: CatalogItem["description"],
): CatalogItem => ({ slug, category: "service", photos: [photo], title, summary, description, priceUnit: "per_group" });

/**
 * Complementary services. None of them is connected to a live supplier yet: each page offers a quote
 * request that lands in the admin "Quote requests" queue.
 */
export const services: CatalogItem[] = [
  svc("trains", "trains", { en: "Trains", fr: "Trains", ar: "القطارات" },
    { en: "Rail tickets in Europe, the UK and beyond.", fr: "Billets de train en Europe, au Royaume-Uni et ailleurs.", ar: "تذاكر قطارات في أوروبا والمملكة المتحدة وغيرها." },
    { en: "Send your route and dates; we book with the rail operator and send your e-tickets.", fr: "Indiquez votre trajet et vos dates ; nous réservons auprès de l'opérateur et vous envoyons vos billets.", ar: "أرسل مسارك وتواريخك، نحجز لدى مشغّل القطارات ونرسل لك التذاكر." }),
  svc("buses", "buses", { en: "Buses & Coaches", fr: "Bus et autocars", ar: "الحافلات" },
    { en: "Intercity buses and private coaches for groups.", fr: "Bus interurbains et autocars privés pour les groupes.", ar: "حافلات بين المدن وحافلات خاصة للمجموعات." },
    { en: "From Dubai–Abu Dhabi shuttles to private coaches for events and tours.", fr: "De la navette Dubaï–Abou Dhabi à l'autocar privé pour vos événements.", ar: "من رحلات دبي–أبوظبي إلى الحافلات الخاصة للمناسبات والجولات." }),
  svc("travel-insurance", "insurance", { en: "Travel Insurance", fr: "Assurance voyage", ar: "تأمين السفر" },
    { en: "Medical, cancellation and baggage cover from licensed insurers.", fr: "Couverture médicale, annulation et bagages par des assureurs agréés.", ar: "تغطية طبية وإلغاء وأمتعة من شركات تأمين مرخّصة." },
    { en: "Required for many UAE visas. Policies are issued by licensed insurance partners; NOOR does not underwrite insurance.", fr: "Exigée pour de nombreux visas EAU. Les contrats sont émis par des assureurs partenaires agréés ; NOOR n'est pas assureur.", ar: "مطلوب للعديد من تأشيرات الإمارات. تصدر الوثائق من شركات تأمين شريكة مرخّصة، ونور ليست جهة تأمين." }),
  svc("esim", "esim", { en: "eSIM", fr: "eSIM", ar: "شريحة eSIM" },
    { en: "Mobile data from the moment you land.", fr: "Des données mobiles dès l'atterrissage.", ar: "بيانات الجوال منذ لحظة وصولك." },
    { en: "Data plans for the UAE and multi-country trips, delivered by QR code to compatible phones.", fr: "Forfaits data pour les EAU et les voyages multi-pays, livrés par QR code sur téléphones compatibles.", ar: "باقات بيانات للإمارات والرحلات متعددة الدول تُسلَّم برمز QR للهواتف المتوافقة." }),
  svc("yacht-rentals", "yachtRental", { en: "Yacht Rentals", fr: "Location de yachts", ar: "تأجير اليخوت" },
    { en: "Private yachts with crew, from 2 hours.", fr: "Yachts privés avec équipage, dès 2 heures.", ar: "يخوت خاصة مع طاقم ابتداءً من ساعتين." },
    { en: "Birthdays, proposals, corporate events or a sunset cruise: tell us the size of your group.", fr: "Anniversaires, demandes en mariage, événements d'entreprise ou coucher de soleil : indiquez la taille du groupe.", ar: "أعياد ميلاد أو طلبات زواج أو فعاليات شركات أو رحلة غروب: أخبرنا بحجم مجموعتك." }),
  svc("private-jets", "privateJet", { en: "Private Jets", fr: "Jets privés", ar: "الطائرات الخاصة" },
    { en: "Charter flights through authorised operators.", fr: "Vols affrétés via des opérateurs autorisés.", ar: "رحلات مستأجرة عبر مشغّلين مرخّصين." },
    { en: "Subject to availability of authorised partners. NOOR acts as an intermediary; flights are operated by licensed charter operators.", fr: "Sous réserve de partenaires autorisés. NOOR agit en intermédiaire ; les vols sont opérés par des compagnies agréées.", ar: "حسب توفر الشركاء المرخّصين. تعمل نور وسيطاً وتُشغَّل الرحلات من قبل شركات مرخّصة." }),
  svc("corporate-travel", "corporate", { en: "Corporate Travel", fr: "Voyages d'entreprise", ar: "سفر الشركات" },
    { en: "Travel management for companies of every size.", fr: "Gestion des voyages pour les entreprises de toute taille.", ar: "إدارة السفر للشركات بجميع أحجامها." },
    { en: "Consolidated invoicing, traveller profiles and 24/7 changes for your teams.", fr: "Facturation consolidée, profils voyageurs et modifications 7j/7 pour vos équipes.", ar: "فواتير موحدة وملفات للمسافرين وتعديلات على مدار الساعة لفرقكم." }),
  svc("group-travel", "groupTravel", { en: "Group Travel", fr: "Voyages de groupe", ar: "رحلات المجموعات" },
    { en: "Group fares and coordination from 10 travellers.", fr: "Tarifs et coordination de groupe dès 10 voyageurs.", ar: "أسعار وتنسيق للمجموعات ابتداءً من 10 مسافرين." },
    { en: "Flights, hotel blocks, coaches and guides for your group, with one point of contact.", fr: "Vols, blocs hôteliers, autocars et guides pour votre groupe, avec un interlocuteur unique.", ar: "رحلات وغرف فندقية وحافلات ومرشدون لمجموعتك مع جهة اتصال واحدة." }),
  svc("concierge", "concierge", { en: "Concierge", fr: "Conciergerie", ar: "خدمة الكونسيرج" },
    { en: "Restaurant bookings, event tickets and special requests.", fr: "Réservations de restaurants, billets d'événements et demandes spéciales.", ar: "حجوزات المطاعم وتذاكر الفعاليات والطلبات الخاصة." },
    { en: "Our team handles the details before and during your stay in the UAE.", fr: "Notre équipe s'occupe des détails avant et pendant votre séjour aux EAU.", ar: "يتولى فريقنا التفاصيل قبل إقامتك في الإمارات وخلالها." }),
  svc("airport-assistance", "airportAssistance", { en: "Airport Assistance", fr: "Assistance aéroport", ar: "المساعدة في المطار" },
    { en: "Meet-and-assist, fast track and lounge access.", fr: "Accueil et assistance, coupe-file et accès salon.", ar: "الاستقبال والمساعدة والمسار السريع ودخول الصالات." },
    { en: "Available at DXB, DWC and AUH through authorised airport service providers.", fr: "Disponible à DXB, DWC et AUH via des prestataires aéroportuaires agréés.", ar: "متاح في DXB وDWC وAUH عبر مزوّدي خدمات المطارات المعتمدين." }),
  svc("vip-services", "vip", { en: "VIP Services", fr: "Services VIP", ar: "خدمات كبار الشخصيات" },
    { en: "Discreet, tailor-made service for VIP guests.", fr: "Un service discret et sur mesure pour vos invités VIP.", ar: "خدمة سرية ومصممة لكبار الضيوف." },
    { en: "Luxury vehicles, security coordination, private villas and exclusive access arranged through vetted partners.", fr: "Véhicules de luxe, coordination sécurité, villas privées et accès exclusifs via des partenaires sélectionnés.", ar: "مركبات فاخرة وتنسيق أمني وفلل خاصة ودخول حصري عبر شركاء موثوقين." }),
];
