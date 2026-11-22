import type { L10n } from "@/lib/i18n/config";
import type { PhotoKey } from "@/lib/media";

export type Destination = { slug: string; name: L10n; country: L10n; photo: PhotoKey; iata: string };

export const popularDestinations: Destination[] = [
  { slug: "dubai", iata: "DXB", photo: "dubai", name: { en: "Dubai", fr: "Dubaï", ar: "دبي" }, country: { en: "United Arab Emirates", fr: "Émirats arabes unis", ar: "الإمارات" } },
  { slug: "abu-dhabi", iata: "AUH", photo: "abuDhabi", name: { en: "Abu Dhabi", fr: "Abou Dhabi", ar: "أبوظبي" }, country: { en: "United Arab Emirates", fr: "Émirats arabes unis", ar: "الإمارات" } },
  { slug: "istanbul", iata: "IST", photo: "istanbul", name: { en: "Istanbul", fr: "Istanbul", ar: "إسطنبول" }, country: { en: "Türkiye", fr: "Turquie", ar: "تركيا" } },
  { slug: "paris", iata: "CDG", photo: "paris", name: { en: "Paris", fr: "Paris", ar: "باريس" }, country: { en: "France", fr: "France", ar: "فرنسا" } },
  { slug: "london", iata: "LHR", photo: "london", name: { en: "London", fr: "Londres", ar: "لندن" }, country: { en: "United Kingdom", fr: "Royaume-Uni", ar: "المملكة المتحدة" } },
  { slug: "maldives", iata: "MLE", photo: "maldives", name: { en: "Maldives", fr: "Maldives", ar: "جزر المالديف" }, country: { en: "Maldives", fr: "Maldives", ar: "المالديف" } },
  { slug: "bali", iata: "DPS", photo: "bali", name: { en: "Bali", fr: "Bali", ar: "بالي" }, country: { en: "Indonesia", fr: "Indonésie", ar: "إندونيسيا" } },
  { slug: "cairo", iata: "CAI", photo: "cairo", name: { en: "Cairo", fr: "Le Caire", ar: "القاهرة" }, country: { en: "Egypt", fr: "Égypte", ar: "مصر" } },
  { slug: "zanzibar", iata: "ZNZ", photo: "zanzibar", name: { en: "Zanzibar", fr: "Zanzibar", ar: "زنجبار" }, country: { en: "Tanzania", fr: "Tanzanie", ar: "تنزانيا" } },
  { slug: "marrakech", iata: "RAK", photo: "marrakech", name: { en: "Marrakech", fr: "Marrakech", ar: "مراكش" }, country: { en: "Morocco", fr: "Maroc", ar: "المغرب" } },
  { slug: "doha", iata: "DOH", photo: "doha", name: { en: "Doha", fr: "Doha", ar: "الدوحة" }, country: { en: "Qatar", fr: "Qatar", ar: "قطر" } },
  { slug: "cape-town", iata: "CPT", photo: "capeTown", name: { en: "Cape Town", fr: "Le Cap", ar: "كيب تاون" }, country: { en: "South Africa", fr: "Afrique du Sud", ar: "جنوب أفريقيا" } },
];

export type Route = { from: string; to: string; fromName: L10n; toName: L10n; photo: PhotoKey };

export const trendingRoutes: Route[] = [
  { from: "DXB", to: "LHR", fromName: { en: "Dubai", fr: "Dubaï", ar: "دبي" }, toName: { en: "London", fr: "Londres", ar: "لندن" }, photo: "routeLondon" },
  { from: "DXB", to: "CDG", fromName: { en: "Dubai", fr: "Dubaï", ar: "دبي" }, toName: { en: "Paris", fr: "Paris", ar: "باريس" }, photo: "routeParis" },
  { from: "DSS", to: "DXB", fromName: { en: "Dakar", fr: "Dakar", ar: "داكار" }, toName: { en: "Dubai", fr: "Dubaï", ar: "دبي" }, photo: "heroDubai" },
  { from: "DXB", to: "IST", fromName: { en: "Dubai", fr: "Dubaï", ar: "دبي" }, toName: { en: "Istanbul", fr: "Istanbul", ar: "إسطنبول" }, photo: "routeIstanbul" },
  { from: "DXB", to: "CAI", fromName: { en: "Dubai", fr: "Dubaï", ar: "دبي" }, toName: { en: "Cairo", fr: "Le Caire", ar: "القاهرة" }, photo: "routeCairo" },
  { from: "DXB", to: "RUH", fromName: { en: "Dubai", fr: "Dubaï", ar: "دبي" }, toName: { en: "Riyadh", fr: "Riyad", ar: "الرياض" }, photo: "routeRiyadh" },
  { from: "DXB", to: "MLE", fromName: { en: "Dubai", fr: "Dubaï", ar: "دبي" }, toName: { en: "Malé", fr: "Malé", ar: "ماليه" }, photo: "routeMaldives" },
];

export type HotelArea = { slug: string; name: L10n; blurb: L10n; photo: PhotoKey };

/** Hotel areas, not hotels: specific hotels and rates only come from a contracted inventory supplier. */
export const hotelAreas: HotelArea[] = [
  { slug: "downtown-dubai", photo: "areaDowntown", name: { en: "Downtown Dubai", fr: "Downtown Dubaï", ar: "وسط مدينة دبي" }, blurb: { en: "Burj Khalifa, Dubai Mall and the fountains", fr: "Burj Khalifa, Dubai Mall et les fontaines", ar: "برج خليفة ودبي مول والنافورة" } },
  { slug: "palm-jumeirah", photo: "areaPalm", name: { en: "Palm Jumeirah", fr: "Palm Jumeirah", ar: "نخلة جميرا" }, blurb: { en: "Beach resorts on the iconic island", fr: "Resorts en bord de mer sur l'île emblématique", ar: "منتجعات شاطئية على الجزيرة الشهيرة" } },
  { slug: "dubai-marina", photo: "areaMarina", name: { en: "Dubai Marina & JBR", fr: "Dubai Marina et JBR", ar: "مرسى دبي وجي بي آر" }, blurb: { en: "Waterfront living, beach and restaurants", fr: "Front de mer, plage et restaurants", ar: "واجهة بحرية وشاطئ ومطاعم" } },
  { slug: "jumeirah", photo: "areaJumeirah", name: { en: "Jumeirah Beach", fr: "Plage de Jumeirah", ar: "شاطئ جميرا" }, blurb: { en: "Classic beachfront and Burj Al Arab views", fr: "Front de mer classique et vue sur le Burj Al Arab", ar: "واجهة شاطئية كلاسيكية وإطلالة على برج العرب" } },
  { slug: "deira-creek", photo: "areaCreek", name: { en: "Deira & Dubai Creek", fr: "Deira et la Creek", ar: "ديرة وخور دبي" }, blurb: { en: "Souks, heritage and great value", fr: "Souks, patrimoine et bon rapport qualité-prix", ar: "الأسواق والتراث وقيمة ممتازة" } },
  { slug: "abu-dhabi", photo: "areaAbuDhabi", name: { en: "Abu Dhabi", fr: "Abou Dhabi", ar: "أبوظبي" }, blurb: { en: "Saadiyat, Yas Island and the Corniche", fr: "Saadiyat, Yas Island et la Corniche", ar: "السعديات وجزيرة ياس والكورنيش" } },
];

export type AfricaCity = { slug: string; name: L10n; country: L10n; iata: string; photo: PhotoKey };

/** Departure cities for the Africa → Dubai programme. Extend this list to add any African country. */
export const africaCities: AfricaCity[] = [
  { slug: "dakar", iata: "DSS", photo: "dakar", name: { en: "Dakar", fr: "Dakar", ar: "داكار" }, country: { en: "Senegal", fr: "Sénégal", ar: "السنغال" } },
  { slug: "abidjan", iata: "ABJ", photo: "abidjan", name: { en: "Abidjan", fr: "Abidjan", ar: "أبيدجان" }, country: { en: "Côte d'Ivoire", fr: "Côte d'Ivoire", ar: "ساحل العاج" } },
  { slug: "bamako", iata: "BKO", photo: "bamako", name: { en: "Bamako", fr: "Bamako", ar: "باماكو" }, country: { en: "Mali", fr: "Mali", ar: "مالي" } },
  { slug: "conakry", iata: "CKY", photo: "conakry", name: { en: "Conakry", fr: "Conakry", ar: "كوناكري" }, country: { en: "Guinea", fr: "Guinée", ar: "غينيا" } },
  { slug: "lagos", iata: "LOS", photo: "lagos", name: { en: "Lagos", fr: "Lagos", ar: "لاغوس" }, country: { en: "Nigeria", fr: "Nigeria", ar: "نيجيريا" } },
  { slug: "accra", iata: "ACC", photo: "accra", name: { en: "Accra", fr: "Accra", ar: "أكرا" }, country: { en: "Ghana", fr: "Ghana", ar: "غانا" } },
  { slug: "casablanca", iata: "CMN", photo: "casablanca", name: { en: "Casablanca", fr: "Casablanca", ar: "الدار البيضاء" }, country: { en: "Morocco", fr: "Maroc", ar: "المغرب" } },
  { slug: "douala", iata: "DLA", photo: "douala", name: { en: "Douala", fr: "Douala", ar: "دوالا" }, country: { en: "Cameroon", fr: "Cameroun", ar: "الكاميرون" } },
  { slug: "kinshasa", iata: "FIH", photo: "kinshasa", name: { en: "Kinshasa", fr: "Kinshasa", ar: "كينشاسا" }, country: { en: "DR Congo", fr: "RD Congo", ar: "الكونغو الديمقراطية" } },
  { slug: "nairobi", iata: "NBO", photo: "nairobi", name: { en: "Nairobi", fr: "Nairobi", ar: "نيروبي" }, country: { en: "Kenya", fr: "Kenya", ar: "كينيا" } },
  { slug: "addis-ababa", iata: "ADD", photo: "addisAbaba", name: { en: "Addis Ababa", fr: "Addis-Abeba", ar: "أديس أبابا" }, country: { en: "Ethiopia", fr: "Éthiopie", ar: "إثيوبيا" } },
];

export type Article = { slug: string; title: L10n; excerpt: L10n; photo: PhotoKey; body: L10n[] };

export const articles: Article[] = [
  {
    slug: "first-time-in-dubai",
    photo: "inspoMarinaWalk",
    title: { en: "First time in Dubai: where to stay", fr: "Premier séjour à Dubaï : où loger", ar: "أول زيارة لدبي: أين تقيم" },
    excerpt: { en: "Downtown, Marina or the Palm? How to choose the right area for your trip.", fr: "Downtown, Marina ou la Palm ? Bien choisir son quartier.", ar: "وسط المدينة أم المرسى أم النخلة؟ كيف تختار المنطقة المناسبة." },
    body: [
      { en: "Downtown Dubai puts you next to Burj Khalifa and Dubai Mall, ideal for a first short stay focused on landmarks.", fr: "Downtown vous place à côté du Burj Khalifa et du Dubai Mall : idéal pour un premier séjour court centré sur les monuments.", ar: "يضعك وسط المدينة بجوار برج خليفة ودبي مول، وهو مثالي لإقامة قصيرة أولى تركز على المعالم." },
      { en: "Dubai Marina and JBR combine beach, restaurants and evening walks. Palm Jumeirah suits resort holidays.", fr: "Dubai Marina et JBR combinent plage, restaurants et promenades. La Palm convient aux séjours en resort.", ar: "يجمع مرسى دبي وجي بي آر بين الشاطئ والمطاعم ونزهات المساء، بينما تناسب نخلة جميرا عطلات المنتجعات." },
      { en: "Deira and the Creek offer heritage, souks and the best value. Our advisers can compare options for your dates.", fr: "Deira et la Creek offrent patrimoine, souks et le meilleur rapport qualité-prix. Nos conseillers comparent les options selon vos dates.", ar: "تقدم ديرة والخور التراث والأسواق وأفضل قيمة. يمكن لمستشارينا مقارنة الخيارات حسب تواريخك." },
    ],
  },
  {
    slug: "uae-visa-checklist",
    photo: "visaDocs",
    title: { en: "UAE visa: your document checklist", fr: "Visa EAU : la liste des documents", ar: "تأشيرة الإمارات: قائمة المستندات" },
    excerpt: { en: "What to prepare before applying, and why passport validity matters.", fr: "Ce qu'il faut préparer avant la demande, et l'importance de la validité du passeport.", ar: "ما يجب تحضيره قبل التقديم، ولماذا تهم صلاحية جواز السفر." },
    body: [
      { en: "Most applications need a passport valid for at least six months, a recent photo, and your travel details.", fr: "La plupart des demandes exigent un passeport valide au moins six mois, une photo récente et vos informations de voyage.", ar: "تتطلب معظم الطلبات جواز سفر صالحاً لستة أشهر على الأقل وصورة حديثة وتفاصيل رحلتك." },
      { en: "Requirements depend on nationality and change over time; NOOR checks the current rules for your case. Approval is always decided by the authorities.", fr: "Les exigences dépendent de la nationalité et évoluent ; NOOR vérifie les règles en vigueur pour votre cas. La décision appartient toujours aux autorités.", ar: "تعتمد المتطلبات على الجنسية وتتغير مع الوقت، وتتحقق نور من القواعد الحالية لحالتك. يبقى القرار دائماً للجهات المختصة." },
    ],
  },
  {
    slug: "packing-for-the-desert",
    photo: "inspoPacking",
    title: { en: "What to pack for a desert safari", fr: "Que mettre dans son sac pour un safari", ar: "ماذا تحزم لرحلة السفاري" },
    excerpt: { en: "Light layers, closed shoes and a scarf: the essentials for the dunes.", fr: "Vêtements légers, chaussures fermées et foulard : l'essentiel pour les dunes.", ar: "ملابس خفيفة وأحذية مغلقة ووشاح: أساسيات الكثبان." },
    body: [
      { en: "Wear light, breathable clothes and bring a warm layer for winter evenings when temperatures drop in the desert.", fr: "Portez des vêtements légers et respirants et prévoyez une couche chaude pour les soirées d'hiver, plus fraîches dans le désert.", ar: "ارتدِ ملابس خفيفة جيدة التهوية واحمل طبقة دافئة لأمسيات الشتاء حين تنخفض الحرارة في الصحراء." },
      { en: "Sunglasses, sunscreen and a scarf protect you from sun and sand. People with back problems or pregnant travellers should avoid dune bashing.", fr: "Lunettes, crème solaire et foulard protègent du soleil et du sable. Les personnes souffrant du dos et les femmes enceintes doivent éviter les dunes en 4×4.", ar: "تحميك النظارات الشمسية وواقي الشمس والوشاح من الشمس والرمال. يُنصح من يعانون من آلام الظهر والحوامل بتجنب القيادة على الكثبان." },
    ],
  },
  {
    slug: "dubai-winter-season",
    photo: "inspoGarden",
    title: { en: "Dubai's winter season: what's on", fr: "L'hiver à Dubaï : le programme", ar: "موسم الشتاء في دبي: ماذا يحدث" },
    excerpt: { en: "From November to March: outdoor gardens, festivals and perfect beach weather.", fr: "De novembre à mars : jardins, festivals et météo idéale pour la plage.", ar: "من نوفمبر إلى مارس: حدائق خارجية ومهرجانات وطقس مثالي للشاطئ." },
    body: [
      { en: "Winter is the most pleasant season in the UAE, and the busiest: book hotels and popular time slots early.", fr: "L'hiver est la saison la plus agréable aux EAU, et la plus demandée : réservez tôt hôtels et créneaux populaires.", ar: "الشتاء هو أجمل المواسم في الإمارات وأكثرها ازدحاماً، لذا احجز الفنادق والمواعيد الشائعة مبكراً." },
      { en: "Outdoor attractions such as flower gardens, open-air markets and desert camps are at their best during these months.", fr: "Les attractions en plein air, jardins fleuris, marchés et camps du désert, sont à leur meilleur pendant ces mois.", ar: "تكون المعالم الخارجية مثل حدائق الزهور والأسواق المفتوحة والمخيمات الصحراوية في أفضل حالاتها خلال هذه الأشهر." },
    ],
  },
];
