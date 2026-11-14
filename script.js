const dialog = document.querySelector("#planner-dialog");
const serviceField = document.querySelector("#selected-service");
const serviceLabel = document.querySelector("#dialog-service");
const destinationField = document.querySelector("#planner-destination");
const languageToggle = document.querySelector(".language-button");
const languageMenu = document.querySelector(".language-menu");
const homeView = document.querySelector("#home-view");
const serviceView = document.querySelector("#service-view");
const siteFooter = document.querySelector(".site-footer");
let language = "en";
let selectedEnglishService = "Travel planning";
let selectedFrenchService = "Préparer un voyage";
let activePageId = null;

const servicePages = {
  hotels: {
    en: { eyebrow: "STAYS, YOUR WAY", title: "Hotels & homes", description: "Explore city hotels, beach resorts and desert retreats. Tell NOOR what matters to you and get a stay shortlist shaped around your trip.", section: "Find your kind of stay", cards: [["BEACH ESCAPES", "An island stay in Dubai", "A slower stay by the water, with time for the pool, the coast and the city.", "dubai-island-resort.jpg", "A palm-lined resort pool in Dubai"], ["CITY BREAKS", "Abu Dhabi, with room to explore", "Stay close to the architecture, museums and waterfront that make the capital memorable.", "abu-dhabi-mosque.jpg", "Sheikh Zayed Grand Mosque in Abu Dhabi"], ["DESERT RETREATS", "A night under desert skies", "Trade the city lights for open dunes, warm evenings and a quieter pace.", "desert-safari.jpg", "Desert dunes outside Dubai"]], faq: [["How do I choose the right stay?", "Share your destination, dates, budget and preferred atmosphere. A NOOR advisor can help compare suitable options."], ["Can I combine a hotel with flights?", "Yes. Ask NOOR to plan your stay and flights together as one trip."], ["Can I request a family or group stay?", "Yes. Include the number of guests and any room requirements when you contact the team."]] },
    fr: { eyebrow: "SÉJOURS À VOTRE RYTHME", title: "Hôtels & séjours", description: "Découvrez des hôtels en ville, des resorts en bord de mer et des retraites dans le désert. Indiquez vos envies à NOOR pour recevoir une sélection adaptée à votre voyage.", section: "Choisissez votre style de séjour", cards: [["ESCAPADES EN BORD DE MER", "Une île à Dubaï", "Prenez le temps de profiter de la piscine, du littoral et de la ville.", "dubai-island-resort.jpg", "Un resort bordé de palmiers à Dubaï"], ["SÉJOURS EN VILLE", "Abou Dhabi, à découvrir", "Séjournez près des lieux qui font le charme de la capitale : architecture, musées et front de mer.", "abu-dhabi-mosque.jpg", "La grande mosquée Sheikh Zayed à Abou Dhabi"], ["RETRAITES DANS LE DÉSERT", "Une nuit sous le ciel du désert", "Laissez les lumières de la ville derrière vous pour une soirée paisible au milieu des dunes.", "desert-safari.jpg", "Les dunes du désert près de Dubaï"]], faq: [["Comment choisir le bon hébergement ?", "Indiquez votre destination, vos dates, votre budget et l’ambiance recherchée. Un conseiller NOOR vous aidera à comparer les options adaptées."], ["Puis-je associer l’hôtel à des vols ?", "Oui. NOOR peut organiser votre séjour et vos vols dans le cadre d’un même voyage."], ["Puis-je demander un séjour pour une famille ou un groupe ?", "Oui. Précisez le nombre de voyageurs et vos besoins de chambres lorsque vous contactez l’équipe."]] }
  },
  flights: {
    en: { eyebrow: "ROUTES THAT TAKE YOU FURTHER", title: "Flights & itineraries", description: "Share where you want to go, when you want to travel and what matters along the way. NOOR will help you shape a route that fits.", section: "Start with a destination", cards: [["UAE", "Abu Dhabi", "A capital escape filled with striking architecture and a calm waterfront.", "abu-dhabi-mosque.jpg", "Abu Dhabi mosque beneath a blue sky"], ["UAE", "Dubai", "A city of desert horizons, late evenings and new perspectives.", "dubai-hero.jpg", "Dubai skyline in the late afternoon"], ["FLIGHT + HOTEL", "Make one trip of it", "Bring your stay and your flight plans together for a more considered journey.", "dubai-island-resort.jpg", "Resort pool at golden hour"]], faq: [["Can NOOR help compare flight options?", "Yes. Share your preferred dates, route and cabin preferences so the team can help you review options."], ["Can I add a hotel to my flight plan?", "Yes. Choose the flight and hotel journey option and tell NOOR what kind of stay you prefer."], ["Do the flight suggestions show live availability?", "The ideas on this page are travel inspiration. Availability and final fares are confirmed with your NOOR advisor."]] },
    fr: { eyebrow: "DES ITINÉRAIRES QUI VOUS EMMÈNENT PLUS LOIN", title: "Vols & itinéraires", description: "Indiquez votre destination, vos dates et vos priorités. NOOR vous aide à composer un itinéraire qui vous ressemble.", section: "Choisissez une destination", cards: [["ÉMIRATS", "Abou Dhabi", "Une escapade dans la capitale, entre architecture remarquable et front de mer apaisant.", "abu-dhabi-mosque.jpg", "La mosquée d’Abou Dhabi sous un ciel bleu"], ["ÉMIRATS", "Dubaï", "Une ville entre horizon désertique, soirées animées et nouveaux points de vue.", "dubai-hero.jpg", "La silhouette de Dubaï en fin d’après-midi"], ["VOL + HÔTEL", "Un voyage tout compris", "Associez votre hébergement à vos vols pour composer un séjour plus harmonieux.", "dubai-island-resort.jpg", "La piscine d’un resort à l’heure dorée"]], faq: [["NOOR peut-il m’aider à comparer les vols ?", "Oui. Indiquez vos dates, votre itinéraire et vos préférences de cabine pour que l’équipe étudie les possibilités."], ["Puis-je ajouter un hôtel à mes vols ?", "Oui. Choisissez l’option vol et hôtel, puis indiquez à NOOR le type de séjour que vous recherchez."], ["Les idées de vols affichent-elles les disponibilités en direct ?", "Cette page présente des idées de voyage. Les disponibilités et tarifs définitifs sont confirmés avec votre conseiller NOOR."]] }
  },
  cars: {
    en: { eyebrow: "FREEDOM FOR THE ROAD AHEAD", title: "Car rentals", description: "Choose a vehicle that suits your plans, from a quick city drive to a longer journey across the Emirates.", section: "Choose a way to get around", cards: [["CITY DRIVING", "Compact cars", "A practical choice for getting around town and finding easy parking.", "dubai-hero.jpg", "Dubai skyline"], ["LONGER JOURNEYS", "Comfortable sedans", "Extra room for luggage and relaxed drives between destinations.", "dubai-metro.jpg", "Transport through the Dubai skyline"], ["DESERT & OUTDOORS", "Spacious vehicles", "Room to travel with your group and make space for the day's plans.", "desert-safari.jpg", "Desert dunes near Dubai"]], faq: [["What information should I prepare?", "Have your driving licence, pick-up location, dates and preferred vehicle type ready."], ["Can NOOR help with insurance and deposit details?", "Yes. Ask the team to confirm the rental supplier’s terms before you book."], ["Can I request a driver instead?", "Yes. If you prefer not to drive, ask NOOR about private transfers or a vehicle with a driver."]] },
    fr: { eyebrow: "LA LIBERTÉ DE PRENDRE LA ROUTE", title: "Location de voiture", description: "Choisissez un véhicule adapté à votre programme, d’un trajet en ville à une escapade à travers les Émirats.", section: "Choisissez votre façon de vous déplacer", cards: [["EN VILLE", "Voitures compactes", "Un choix pratique pour circuler en ville et stationner facilement.", "dubai-hero.jpg", "La silhouette de Dubaï"], ["LONGS TRAJETS", "Berlines confortables", "Plus d’espace pour les bagages et des trajets agréables entre les étapes.", "dubai-metro.jpg", "Les transports au cœur de Dubaï"], ["DÉSERT & GRAND AIR", "Véhicules spacieux", "De la place pour voyager en groupe et profiter de chaque journée.", "desert-safari.jpg", "Les dunes près de Dubaï"]], faq: [["Quelles informations préparer ?", "Munissez-vous de votre permis, du lieu de prise en charge, des dates et du type de véhicule souhaité."], ["NOOR peut-il confirmer l’assurance et la caution ?", "Oui. Demandez à l’équipe de vérifier les conditions du loueur avant votre réservation."], ["Puis-je demander un chauffeur ?", "Oui. Si vous préférez ne pas conduire, demandez à NOOR un transfert privé ou un véhicule avec chauffeur."]] }
  },
  tours: {
    en: { eyebrow: "MAKE EVERY DAY COUNT", title: "Tours & day trips", description: "From a first look at the city to a full day beyond it, find a guided experience that makes the destination come alive.", section: "Ways to experience the Emirates", cards: [["CITY & CULTURE", "A day in Abu Dhabi", "Discover the capital’s landmark architecture and rich cultural stories.", "abu-dhabi-mosque.jpg", "Sheikh Zayed Grand Mosque"], ["OUT IN THE DUNES", "Desert safari", "Take in open landscapes and the changing colours of the desert.", "desert-safari.jpg", "Desert landscape near Dubai"], ["ON THE WATER", "Dubai Marina by night", "See the city lights from the water on an evening dhow cruise.", "dubai-marina.jpg", "Dhow and Dubai Marina at night"]], faq: [["Can tours be arranged for a private group?", "Tell NOOR your group size and preferred pace. The team can look into private options."], ["Can I combine several activities in one day?", "Yes. Share your timing and interests so NOOR can help organize a comfortable itinerary."], ["Are tickets included?", "The inclusions depend on each experience and are confirmed with your advisor before booking."]] },
    fr: { eyebrow: "PROFITEZ DE CHAQUE JOURNÉE", title: "Circuits & excursions", description: "Première découverte de la ville ou journée complète au grand air : choisissez une expérience guidée pour vivre votre destination autrement.", section: "Vivre les Émirats à votre façon", cards: [["VILLE & CULTURE", "Une journée à Abou Dhabi", "Découvrez l’architecture emblématique de la capitale et ses histoires culturelles.", "abu-dhabi-mosque.jpg", "La grande mosquée Sheikh Zayed"], ["DANS LES DUNES", "Safari dans le désert", "Explorez les grands espaces et les couleurs changeantes du désert.", "desert-safari.jpg", "Paysage désertique près de Dubaï"], ["AU FIL DE L’EAU", "La marina de Dubaï de nuit", "Admirez les lumières de la ville depuis un dhow à la tombée du jour.", "dubai-marina.jpg", "Un dhow et la marina de Dubaï le soir"]], faq: [["Peut-on organiser un circuit privé ?", "Indiquez votre nombre de participants et le rythme souhaité. NOOR étudiera les options privées."], ["Puis-je combiner plusieurs activités dans la journée ?", "Oui. Précisez vos horaires et vos envies pour que NOOR puisse organiser un itinéraire confortable."], ["Les billets sont-ils inclus ?", "Les prestations varient selon l’expérience. Votre conseiller confirmera les inclusions avant la réservation."]] }
  },
  attractions: {
    en: { eyebrow: "PLACES WORTH THE DETOUR", title: "Attractions & activities", description: "Explore the landmarks, museums, theme parks and outdoor experiences that give every stop its own character.", section: "A few ideas to get you started", cards: [["LANDMARK", "Sheikh Zayed Grand Mosque", "A striking place to discover the architecture and heritage of Abu Dhabi.", "abu-dhabi-mosque.jpg", "Sheikh Zayed Grand Mosque in Abu Dhabi"], ["ADVENTURE", "Palm Jumeirah from above", "See one of Dubai’s best-known landmarks from a thrilling new perspective.", "skydiving-dubai.jpg", "Skydivers above Palm Jumeirah"], ["LOCAL DISCOVERY", "The old Gold Souk", "Wander through the historic lanes and colourful shopfronts of Old Dubai.", "dubai-gold-souk.jpg", "Gold jewellery in Dubai's Gold Souk"]], faq: [["Can you arrange attraction tickets?", "Tell NOOR which places you want to visit and your preferred dates. The team will confirm available options."], ["Are experiences suitable for families?", "Share the ages and interests of your group so NOOR can suggest suitable activities."], ["Can I plan several attractions together?", "Yes. NOOR can help organize a day around location, travel time and your interests."]] },
    fr: { eyebrow: "DES LIEUX QUI MÉRITENT LE DÉTOUR", title: "Attractions & activités", description: "Découvrez les monuments, musées, parcs de loisirs et expériences en plein air qui donnent à chaque étape son caractère.", section: "Quelques idées pour commencer", cards: [["MONUMENT", "La grande mosquée Sheikh Zayed", "Un lieu remarquable pour découvrir l’architecture et le patrimoine d’Abou Dhabi.", "abu-dhabi-mosque.jpg", "La grande mosquée Sheikh Zayed à Abou Dhabi"], ["AVENTURE", "Palm Jumeirah vue du ciel", "Découvrez l’un des sites emblématiques de Dubaï sous un angle saisissant.", "skydiving-dubai.jpg", "Des parachutistes au-dessus de Palm Jumeirah"], ["DÉCOUVERTE LOCALE", "Le vieux Gold Souk", "Flânez dans les ruelles historiques et les échoppes colorées du vieux Dubaï.", "dubai-gold-souk.jpg", "Bijoux en or dans le Gold Souk de Dubaï"]], faq: [["Pouvez-vous organiser des billets pour les attractions ?", "Indiquez à NOOR les lieux souhaités et vos dates. L’équipe vous confirmera les options disponibles."], ["Les expériences conviennent-elles aux familles ?", "Précisez les âges et les centres d’intérêt de votre groupe pour recevoir des idées adaptées."], ["Puis-je organiser plusieurs visites ensemble ?", "Oui. NOOR peut composer une journée selon les distances, les temps de trajet et vos envies."]] }
  },
  cruises: {
    en: { eyebrow: "THE CITY, FROM THE WATER", title: "Cruises", description: "Slow down on the water with a skyline sailing, a dinner cruise or a private outing along the coast.", section: "Choose your time on the water", cards: [["EVENING SAILING", "Dubai Marina after dark", "Watch the skyline come to life as the city lights reflect across the water.", "dubai-marina.jpg", "Dubai Marina at night"], ["COASTAL ESCAPE", "A private dhow outing", "Make a little room for a quieter moment out on the water with your group.", "dubai-marina.jpg", "A traditional dhow on the water"], ["DINNER & VIEWS", "A table with a view", "Pair an evening meal with a changing view of the city from the deck.", "dubai-island-resort.jpg", "A resort at golden hour"]], faq: [["What kinds of cruises can I request?", "Ask NOOR about sightseeing sails, dinner cruises and private boat experiences."], ["Can I arrange a celebration on board?", "Share the occasion and group size so the team can check suitable private options."], ["Where do cruises depart from?", "Departure points vary by experience. NOOR will confirm the meeting location and timing."]] },
    fr: { eyebrow: "LA VILLE DEPUIS LA MER", title: "Croisières", description: "Prenez le temps sur l’eau : sortie au fil de la skyline, dîner-croisière ou escapade privée le long du littoral.", section: "Choisissez votre moment sur l’eau", cards: [["CROISIÈRE EN SOIRÉE", "La marina de Dubaï après la tombée du jour", "Regardez la skyline s’illuminer et se refléter sur l’eau.", "dubai-marina.jpg", "La marina de Dubaï de nuit"], ["ESCAPADE CÔTIÈRE", "Une sortie privée en dhow", "Offrez-vous un moment plus calme sur l’eau avec vos proches.", "dubai-marina.jpg", "Un dhow traditionnel sur l’eau"], ["DÎNER & PANORAMA", "Une table avec vue", "Associez un dîner en soirée à un panorama qui évolue au fil de l’eau.", "dubai-island-resort.jpg", "Un resort à l’heure dorée"]], faq: [["Quels types de croisières puis-je demander ?", "Demandez à NOOR une sortie panoramique, un dîner-croisière ou une expérience privée en bateau."], ["Peut-on organiser une célébration à bord ?", "Indiquez l’occasion et la taille du groupe pour que l’équipe vérifie les options privées."], ["D’où partent les croisières ?", "Le lieu de départ varie selon l’expérience. NOOR vous confirmera l’adresse et l’horaire."]] }
  },
  guides: {
    en: { eyebrow: "IDEAS FOR YOUR NEXT JOURNEY", title: "Travel guides", description: "Get to know the city through local places, thoughtful itineraries and small details that make a trip memorable.", section: "Stories from the NOOR journal", cards: [["ABU DHABI", "A morning among white domes", "A calm visit to one of the capital’s most memorable architectural landmarks.", "abu-dhabi-mosque.jpg", "White domes in Abu Dhabi"], ["OLD DUBAI", "A stroll through the old souk", "Follow the lanes, pause for a coffee and take in the details of the historic quarter.", "dubai-gold-souk.jpg", "Traditional gold jewellery"], ["CITY GUIDE", "Find your way through Dubai", "Move between neighbourhoods and discover the city at your own pace.", "dubai-metro.jpg", "Dubai Metro above the city"]], faq: [["Can I ask NOOR to build an itinerary from a guide?", "Yes. Share the places that caught your eye and the team can help organize a trip around them."], ["Are the guides updated with travel advice?", "The guides are inspiration. Check current opening times and local requirements before travelling."], ["Can I save a guide for later?", "Use your browser’s bookmark or share the page with yourself for a quick return."]] },
    fr: { eyebrow: "INSPIRATIONS POUR VOTRE VOYAGE", title: "Guides de voyage", description: "Découvrez la ville à travers des adresses locales, des itinéraires réfléchis et ces détails qui rendent un voyage mémorable.", section: "Les carnets de voyage NOOR", cards: [["ABOU DHABI", "Un matin sous les dômes blancs", "Une visite paisible de l’un des lieux architecturaux les plus marquants de la capitale.", "abu-dhabi-mosque.jpg", "Les dômes blancs d’Abou Dhabi"], ["VIEUX DUBAÏ", "Flâner dans les souks historiques", "Suivez les ruelles, faites une pause-café et observez les détails du quartier ancien.", "dubai-gold-souk.jpg", "Bijoux traditionnels en or"], ["GUIDE DE LA VILLE", "Explorer Dubaï en toute liberté", "Passez d’un quartier à l’autre et découvrez la ville à votre rythme.", "dubai-metro.jpg", "Le métro de Dubaï au-dessus de la ville"]], faq: [["Puis-je demander à NOOR de créer un itinéraire à partir d’un guide ?", "Oui. Partagez les lieux qui vous inspirent et l’équipe vous aidera à organiser votre séjour."], ["Les guides donnent-ils des informations actualisées ?", "Les guides sont des sources d’inspiration. Vérifiez les horaires et conditions locales avant votre visite."], ["Puis-je garder un guide pour plus tard ?", "Ajoutez cette page aux favoris de votre navigateur ou partagez-la avec vous-même."]] }
  },
  transfers: {
    en: { eyebrow: "SMOOTHER ARRIVALS & DEPARTURES", title: "Airport transfers", description: "Plan the ride between the airport, your hotel and the places you want to see, with the right space for your group and luggage.", section: "Choose the transfer that fits", cards: [["ARRIVAL", "Airport pick-up", "Arrange a clear meeting point and a comfortable ride after your flight.", "dubai-hero.jpg", "Dubai skyline at sunset"], ["BETWEEN CITIES", "Private intercity ride", "Travel between Dubai, Abu Dhabi and nearby destinations on your schedule.", "abu-dhabi-mosque.jpg", "Abu Dhabi landmark"], ["AROUND TOWN", "A day with a driver", "Keep your plans flexible with a vehicle for a full day of exploring.", "dubai-marina.jpg", "Dubai Marina waterfront"]], faq: [["What details are needed for airport pick-up?", "Share your flight number, arrival time, passenger count and luggage needs."], ["Can the driver meet me inside the terminal?", "Meet-and-greet availability depends on the transfer option. Ask NOOR to confirm the arrangement."], ["Can transfers be arranged for a group?", "Yes. Let the team know your group size and luggage so the right vehicle can be selected."]] },
    fr: { eyebrow: "DES ARRIVÉES ET DÉPARTS PLUS SEREINS", title: "Transferts aéroport", description: "Organisez vos trajets entre l’aéroport, votre hôtel et vos visites avec un véhicule adapté à votre groupe et à vos bagages.", section: "Le transfert qui vous convient", cards: [["ARRIVÉE", "Accueil à l’aéroport", "Prévoyez un point de rendez-vous clair et un trajet confortable après votre vol.", "dubai-hero.jpg", "La skyline de Dubaï au coucher du soleil"], ["ENTRE LES VILLES", "Trajet privé interurbain", "Voyagez entre Dubaï, Abou Dhabi et les environs selon votre programme.", "abu-dhabi-mosque.jpg", "Un lieu emblématique d’Abou Dhabi"], ["EN VILLE", "Une journée avec chauffeur", "Gardez votre programme flexible avec un véhicule disponible pour la journée.", "dubai-marina.jpg", "Le front de mer de la marina de Dubaï"]], faq: [["Quelles informations faut-il pour un accueil à l’aéroport ?", "Indiquez votre numéro de vol, l’heure d’arrivée, le nombre de passagers et les bagages."], ["Le chauffeur peut-il m’attendre dans le terminal ?", "L’accueil dans le terminal dépend du transfert choisi. Demandez confirmation à NOOR."], ["Peut-on organiser un transfert pour un groupe ?", "Oui. Précisez la taille du groupe et vos bagages pour choisir le véhicule adapté."]] }
  },
  package: {
    en: { eyebrow: "FLIGHT + HOTEL", title: "One trip, brought together", description: "Pair your flights with the right stay and let NOOR help connect the pieces into one thoughtful itinerary.", section: "Build a more considered trip", cards: [["THE FLIGHT", "Start with your route", "Choose your destination and travel dates, then share the timing that works for you.", "dubai-hero.jpg", "Dubai at golden hour"], ["THE STAY", "Find a place to settle in", "From city hotels to a slower island stay, choose the mood you want for your trip.", "dubai-island-resort.jpg", "A resort pool in Dubai"], ["THE DETAILS", "Connect the moments", "Add transfers, day trips and experiences to make the whole journey feel seamless.", "abu-dhabi-mosque.jpg", "Abu Dhabi mosque"]], faq: [["Can I request flight and hotel options together?", "Yes. Send your destination, dates and preferred hotel style in one request to NOOR."], ["Can I add a transfer or activity?", "Yes. Tell the team which extra services you would like included in the itinerary."], ["Are packages automatically booked online?", "No. This page introduces the service. NOOR will confirm the itinerary, availability and price with you."]] },
    fr: { eyebrow: "VOL + HÔTEL", title: "Un voyage, tout en harmonie", description: "Associez vos vols à l’hébergement idéal et laissez NOOR relier les étapes pour composer un itinéraire cohérent.", section: "Composez un voyage réfléchi", cards: [["LE VOL", "Commencez par l’itinéraire", "Choisissez votre destination et vos dates, puis indiquez les horaires qui vous conviennent.", "dubai-hero.jpg", "Dubaï à l’heure dorée"], ["LE SÉJOUR", "Trouvez votre point d’ancrage", "Hôtel en ville ou séjour sur une île : choisissez l’ambiance de votre voyage.", "dubai-island-resort.jpg", "La piscine d’un resort à Dubaï"], ["LES DÉTAILS", "Reliez les moments", "Ajoutez transferts, excursions et visites pour une expérience fluide de bout en bout.", "abu-dhabi-mosque.jpg", "La mosquée d’Abou Dhabi"]], faq: [["Puis-je demander les vols et l’hôtel ensemble ?", "Oui. Envoyez à NOOR votre destination, vos dates et le type d’hôtel souhaité dans une seule demande."], ["Puis-je ajouter un transfert ou une activité ?", "Oui. Indiquez les services supplémentaires que vous souhaitez intégrer à l’itinéraire."], ["Les séjours sont-ils automatiquement réservés en ligne ?", "Non. Cette page présente le service. NOOR confirmera avec vous l’itinéraire, les disponibilités et le tarif."]] }
  },
  inspiration: {
    en: { eyebrow: "A NOOR CITY ESCAPE", title: "Dubai, with room for wonder", description: "City lights, desert skies and an island by the water. Explore a few ways to make Dubai your own.", section: "Make space for discovery", cards: [["CITY", "See Dubai from above", "Follow the skyline through the city and find a new angle on its familiar landmarks.", "dubai-hero.jpg", "Dubai skyline"], ["THE COAST", "Take a slower island stay", "Make time for the water, a long afternoon and an easy journey back into the city.", "dubai-island-resort.jpg", "Dubai island resort"], ["THE DESERT", "Go beyond the city lights", "Set out for the dunes and see a quieter side of the Emirates.", "desert-safari.jpg", "Desert dunes"]], faq: [["Can I build a trip from these ideas?", "Yes. Choose the experiences you like and send them to NOOR as a starting point."], ["Can I make a short stopover feel special?", "Share your arrival and departure times so NOOR can suggest a practical plan."], ["Can I add hotels or transfers?", "Yes. Combine your ideas with a stay, flights and transfers in one itinerary."]] },
    fr: { eyebrow: "UNE ESCAPADE NOOR", title: "Dubaï, côté merveilles", description: "Lumières de la ville, ciel du désert et île au bord de l’eau. Découvrez quelques façons de vivre Dubaï à votre rythme.", section: "Laissez place à la découverte", cards: [["LA VILLE", "Prendre de la hauteur", "Suivez la skyline et découvrez les lieux emblématiques sous un autre angle.", "dubai-hero.jpg", "La skyline de Dubaï"], ["LE LITTORAL", "Ralentir sur une île", "Profitez de la mer, d’un long après-midi et d’un retour facile vers la ville.", "dubai-island-resort.jpg", "Un resort insulaire à Dubaï"], ["LE DÉSERT", "Au-delà des lumières", "Prenez la route des dunes pour découvrir une facette plus paisible des Émirats.", "desert-safari.jpg", "Les dunes du désert"]], faq: [["Puis-je composer un voyage à partir de ces idées ?", "Oui. Choisissez les expériences qui vous plaisent et transmettez-les à NOOR pour commencer."], ["Comment profiter d’une courte escale ?", "Indiquez vos heures d’arrivée et de départ pour que NOOR vous propose un programme pratique."], ["Puis-je ajouter hôtels ou transferts ?", "Oui. Associez vos idées à des hébergements, vols et transferts dans un même itinéraire."]] }
  }
};

const stories = {
  "abu-dhabi": { en: ["Abu Dhabi · UAE", "A morning among white domes", "Visit the Sheikh Zayed Grand Mosque with time to take in its intricate details, reflective courtyards and graceful white domes. Check the visitor guidance and dress requirements before your visit.", "abu-dhabi-mosque.jpg", "Sheikh Zayed Grand Mosque in Abu Dhabi"], fr: ["Abou Dhabi · Émirats", "Un matin sous les dômes blancs", "Visitez la grande mosquée Sheikh Zayed en prenant le temps d’observer ses détails, ses cours réfléchissantes et ses dômes immaculés. Consultez les consignes visiteurs et la tenue recommandée avant votre visite.", "abu-dhabi-mosque.jpg", "La grande mosquée Sheikh Zayed à Abou Dhabi"], service: "attractions" },
  "island-stay": { en: ["Dubai · UAE", "An island stay, at your pace", "Give yourself time to enjoy the shoreline, the pool and a slower rhythm, with Dubai’s neighbourhoods within reach when you are ready to explore.", "dubai-island-resort.jpg", "An island resort in Dubai"], fr: ["Dubaï · Émirats", "Une île, à votre rythme", "Prenez le temps de profiter du littoral, de la piscine et d’un rythme plus doux, tout en gardant les quartiers de Dubaï à portée de main.", "dubai-island-resort.jpg", "Un resort sur une île à Dubaï"], service: "hotels" },
  marina: { en: ["Dubai Marina", "An evening on the water", "See the towers and waterfront from a traditional dhow. The late-day light gives way to a different city as the marina begins to glow.", "dubai-marina.jpg", "A dhow on Dubai Marina at night"], fr: ["Dubai Marina", "Une soirée au fil de l’eau", "Admirez les tours et le front de mer depuis un dhow traditionnel. La lumière du soir laisse place à une autre ville lorsque la marina s’illumine.", "dubai-marina.jpg", "Un dhow dans la marina de Dubaï la nuit"], service: "cruises" },
  palm: { en: ["Palm Jumeirah", "A new view of the Palm", "See the palm-shaped island from the sky for a striking perspective on Dubai’s coastline. Experiences and weather conditions vary by operator.", "skydiving-dubai.jpg", "Skydivers above Palm Jumeirah"], fr: ["Palm Jumeirah", "Palm Jumeirah vue du ciel", "Découvrez l’île en forme de palmier depuis les airs et admirez le littoral de Dubaï sous un angle saisissant. Les expériences et conditions météo varient selon le prestataire.", "skydiving-dubai.jpg", "Des parachutistes au-dessus de Palm Jumeirah"], service: "attractions" },
  metro: { en: ["Dubai · City guide", "Find your way through the city", "Use the Metro to connect key neighbourhoods and landmarks, then leave time to explore each stop on foot.", "dubai-metro.jpg", "Dubai Metro crossing the city"], fr: ["Dubaï · Guide pratique", "Explorer la ville en toute liberté", "Le métro relie plusieurs quartiers et lieux emblématiques. Prévoyez ensuite du temps pour découvrir chaque étape à pied.", "dubai-metro.jpg", "Le métro de Dubaï traverse la ville"], service: "transfers" },
  "old-dubai": { en: ["Old Dubai", "A stroll through the old souk", "Walk the historic lanes, pause by the creek and notice the colours and craft of the Gold Souk. A guide can help bring the neighbourhood’s stories into focus.", "dubai-gold-souk.jpg", "Gold jewellery in Dubai's Gold Souk"], fr: ["Vieux Dubaï", "Flâner dans les souks historiques", "Parcourez les ruelles anciennes, faites une pause près de la crique et observez les couleurs et le savoir-faire du Gold Souk. Un guide peut vous aider à comprendre l’histoire du quartier.", "dubai-gold-souk.jpg", "Bijoux en or dans le Gold Souk de Dubaï"], service: "guides" }
};

const hotelSections = [
  { id: "uae-hotels", en: "Popular hotels in the UAE", fr: "Hôtels populaires aux Émirats", cards: [
    ["Rove City Centre, Deira", "Rove City Centre, Deira", "A convenient city base in the heart of Deira.", "Un pied-à-terre pratique au cœur de Deira.", "dubai-hero.jpg", "Dubai city skyline", "La skyline de Dubaï", "DUBAI"],
    ["Millennium Al Rawdah Hotel", "Millennium Al Rawdah Hotel", "An Abu Dhabi stay close to the capital’s cultural landmarks.", "Un séjour à Abou Dhabi, près des lieux culturels de la capitale.", "abu-dhabi-mosque.jpg", "Abu Dhabi landmark", "Un lieu emblématique d’Abou Dhabi", "ABU DHABI"],
    ["Hampton by Hilton Marjan Island", "Hampton by Hilton Marjan Island", "A relaxed island setting for a slower coastal break.", "Un cadre insulaire paisible pour une escapade en bord de mer.", "dubai-island-resort.jpg", "Island resort pool", "Piscine d’un resort insulaire", "RAS AL KHAIMAH"],
    ["Aloft Al Ain", "Aloft Al Ain", "A comfortable base for discovering Al Ain and its green spaces.", "Un séjour confortable pour découvrir Al Ain et ses oasis.", "desert-safari.jpg", "Desert landscape in the Emirates", "Paysage désertique des Émirats", "AL AIN"],
    ["La Quinta by Wyndham Dubai Jumeirah", "La Quinta by Wyndham Dubai Jumeirah", "A city stay with the waterfront and Old Dubai within reach.", "Un séjour en ville, entre front de mer et vieux Dubaï.", "dubai-marina.jpg", "Dubai waterfront at night", "Le front de mer de Dubaï le soir", "DUBAI"],
    ["Resident Hotel", "Resident Hotel", "A simple, comfortable starting point for your UAE trip.", "Un point de départ simple et confortable pour votre voyage aux Émirats.", "hotels/guest-room.jpg", "Comfortable hotel room", "Une chambre d’hôtel confortable", "UAE STAYS"]
  ] },
  { id: "uae-cities", en: "Popular cities in United Arab Emirates", fr: "Villes populaires aux Émirats arabes unis", cards: [
    ["Dubai", "Dubaï", "City views, beach days and desert horizons.", "Panoramas urbains, journées à la plage et horizons du désert.", "dubai-hero.jpg", "Dubai skyline", "La skyline de Dubaï", "CITY GUIDE"],
    ["Abu Dhabi", "Abou Dhabi", "Culture, architecture and a calm waterfront.", "Culture, architecture et front de mer paisible.", "abu-dhabi-mosque.jpg", "Sheikh Zayed Grand Mosque", "La grande mosquée Sheikh Zayed", "CITY GUIDE"],
    ["Coastal Emirates", "Les Émirats côté mer", "A relaxed base for resort stays and coastal escapes.", "Un cadre paisible pour les séjours en resort et les escapades côtières.", "dubai-island-resort.jpg", "Coastal resort stay", "Un séjour en resort côtier", "COASTAL STAYS"]
  ] },
  { id: "world-cities", en: "Popular cities worldwide", fr: "Villes populaires dans le monde", cards: [
    ["Paris", "Paris", "Classic boulevards, neighbourhood cafés and landmark views.", "Boulevards élégants, cafés de quartier et monuments emblématiques.", "hotels/paris.jpg", "Eiffel Tower above Paris rooftops", "La tour Eiffel au-dessus des toits de Paris", "FRANCE"],
    ["London", "Londres", "Riverside walks, historic streets and a lively city rhythm.", "Promenades au bord de la Tamise, rues historiques et énergie citadine.", "hotels/london.jpg", "London skyline by the Thames", "La skyline de Londres au bord de la Tamise", "UNITED KINGDOM"],
    ["Tokyo", "Tokyo", "Bright city nights, quiet gardens and neighbourhood discoveries.", "Nuits lumineuses, jardins paisibles et découvertes de quartier.", "hotels/tokyo.jpg", "Tokyo Tower and city lights", "La tour de Tokyo et les lumières de la ville", "JAPAN"]
  ] },
  { id: "luxury-hotels", en: "Top luxury 5-star hotels", fr: "Hôtels 5 étoiles de luxe", cards: [
    ["Island resort escapes", "Escapades en resort insulaire", "A slower stay with room for the water, wellness and sunset views.", "Un séjour au bord de l’eau, entre bien-être et couchers de soleil.", "dubai-island-resort.jpg", "Resort pool at golden hour", "Piscine d’un resort à l’heure dorée", "LUXURY STAYS"],
    ["Skyline suites", "Suites avec vue sur la skyline", "A polished city stay with the energy of Dubai close by.", "Un séjour raffiné en ville, au rythme de Dubaï.", "dubai-hero.jpg", "Dubai skyline", "La skyline de Dubaï", "CITY HOTELS"],
    ["Desert retreats", "Retraites dans le désert", "Space to slow down, with wide-open landscapes all around.", "De l’espace pour ralentir, dans de vastes paysages.", "desert-safari.jpg", "Desert landscape at sunset", "Paysage désertique au coucher du soleil", "DESERT STAYS"]
  ] },
  { id: "budget-stays", en: "Budget-friendly properties worldwide", fr: "Hébergements abordables dans le monde", cards: [
    ["Comfortable city rooms", "Chambres confortables en ville", "Practical rooms that keep you close to the places you came to see.", "Des chambres pratiques, proches des lieux que vous souhaitez découvrir.", "hotels/guest-room.jpg", "Comfortable city hotel room", "Chambre confortable en ville", "GOOD VALUE"],
    ["Well-connected stays", "Séjours bien desservis", "Choose a convenient neighbourhood and make more of each day.", "Choisissez un quartier pratique et profitez pleinement de chaque journée.", "dubai-metro.jpg", "Dubai Metro crossing the city", "Le métro de Dubaï traverse la ville", "CITY BREAKS"],
    ["Homes for longer trips", "Logements pour les longs séjours", "An easy home base with space to settle in.", "Un pied-à-terre accueillant où prendre ses habitudes.", "hotels/guesthouse.jpg", "Home with a garden and pool", "Maison avec jardin et piscine", "HOMES"]
  ] },
  { id: "guest-houses", en: "Trending guest houses worldwide", fr: "Maisons d’hôtes tendance dans le monde", cards: [
    ["Garden guest houses", "Maisons d’hôtes avec jardin", "Smaller stays with a more personal, at-home feel.", "Des adresses intimistes à l’atmosphère chaleureuse.", "hotels/guesthouse.jpg", "Guest house with a garden", "Maison d’hôtes avec jardin", "GUEST HOUSES"],
    ["Characterful rooms", "Chambres pleines de charme", "Thoughtful details and a welcoming place to return to.", "Des détails soignés et une adresse accueillante où revenir.", "hotels/guest-room.jpg", "Warm guest room interior", "Intérieur chaleureux d’une chambre d’hôtes", "BOUTIQUE STAYS"],
    ["A quieter escape", "Une escapade au calme", "Find a slower rhythm just beyond the busy city centre.", "Retrouvez un rythme plus doux à l’écart de l’agitation du centre.", "desert-safari.jpg", "Quiet desert retreat", "Une retraite paisible dans le désert", "SLOW STAYS"]
  ] }
];

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);

function setLanguage(nextLanguage) {
  language = nextLanguage === "fr" ? "fr" : "en";
  document.documentElement.lang = language;
  document.querySelector("#current-language").textContent = language.toUpperCase();
  document.querySelector(".whatsapp-help")?.setAttribute("aria-label", language === "fr"
    ? "Besoin d’aide ? Discuter avec un agent de Noor sur WhatsApp"
    : "Need help? Chat with a NOOR agent on WhatsApp");

  document.querySelectorAll("[data-en][data-fr]").forEach((element) => {
    const translation = element.dataset[language];
    if (translation) element.innerHTML = translation;
  });

  document.querySelectorAll(".service-tile").forEach((tile) => {
    const label = tile.querySelector("[data-en][data-fr]");
    tile.setAttribute("aria-label", label?.dataset[language] || "");
  });

  serviceField.value = language === "fr" ? selectedFrenchService : selectedEnglishService;
  serviceLabel.textContent = serviceField.value;
  destinationField.placeholder = language === "fr"
    ? "Dubaï, Abou Dhabi, Marrakech…"
    : "Dubai, Abu Dhabi, Marrakech…";

  try { localStorage.setItem("noor-language", language); } catch { /* Storage can be disabled. */ }
  if (activePageId) renderActivePage();
}

function openPlanner(service = "Travel planning", frenchService = "Préparer un voyage") {
  selectedEnglishService = service;
  selectedFrenchService = frenchService;
  serviceField.value = language === "fr" ? frenchService : service;
  serviceLabel.textContent = serviceField.value;
  if (!dialog.open) dialog.showModal();
  window.setTimeout(() => destinationField.focus({ preventScroll: true }), 80);
}

document.querySelectorAll("[data-open-planner]").forEach((button) => {
  button.addEventListener("click", () => {
    openPlanner(button.dataset.service || "Travel planning", button.dataset.frService || "Préparer un voyage");
  });
});

document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

function serviceNavMarkup() {
  const items = [
    ["hotels", "Hotels", "Hôtels"], ["flights", "Flights", "Vols"], ["cars", "Car rentals", "Location de voiture"],
    ["tours", "Tours", "Circuits"], ["attractions", "Attractions", "Attractions"], ["cruises", "Cruises", "Croisières"],
    ["guides", "Travel guides", "Guides"], ["transfers", "Transfers", "Transferts"], ["package", "Flight + hotel", "Vol + hôtel"]
  ];
  return `<nav class="service-category-nav" aria-label="${language === "fr" ? "Parcourir les services" : "Browse services"}">${items.map(([id, en, fr]) => `<button type="button" data-open-service="${id}" class="${activePageId === id ? "active" : ""}">${language === "fr" ? fr : en}</button>`).join("")}</nav>`;
}

function renderServicePage(page) {
  const copy = page[language];
  const optionsText = language === "fr" ? "Découvrir les options" : "Explore options";
  const backText = language === "fr" ? "Retour à l’accueil" : "Back to home";
  const searchText = language === "fr" ? "Filtrer ces idées" : "Search these ideas";
  const searchPlaceholder = language === "fr" ? "Rechercher une idée ou une destination" : "Search an idea or destination";
  const contactText = language === "fr" ? "Demander des options à NOOR" : "Ask NOOR for options";
  const faqTitle = language === "fr" ? "Questions fréquentes" : "Frequently asked questions";
  const emptyText = language === "fr" ? "Aucune idée ne correspond à cette recherche." : "No ideas match that search.";
  const cards = copy.cards.map(([tag, title, description, image, alt]) => `
    <article class="service-card" data-search-text="${escapeHtml(`${tag} ${title} ${description}`.toLowerCase())}">
      <img src="/public/images/${escapeHtml(image)}" alt="${escapeHtml(alt)}" loading="lazy" />
      <div class="service-card-copy"><span>${escapeHtml(tag)}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p></div>
    </article>`).join("");
  const faq = copy.faq.map(([question, answer]) => `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join("");
  const englishService = page.en.title;
  const frenchService = page.fr.title;

  return `<div class="service-page-shell">
    <div class="service-page-top"><button class="service-back" type="button">← ${backText}</button><span>NOOR <b>/</b> ${escapeHtml(copy.title)}</span></div>
    <section class="service-page-hero">
      <img src="/public/images/${escapeHtml(copy.cards[0][3])}" alt="${escapeHtml(copy.cards[0][4])}" />
      <div class="service-page-shade"></div>
      <div class="service-page-hero-copy"><span class="service-eyebrow">${escapeHtml(copy.eyebrow)}</span><h1>${escapeHtml(copy.title)}</h1><p>${escapeHtml(copy.description)}</p><button type="button" data-open-planner data-service="${escapeHtml(englishService)}" data-fr-service="${escapeHtml(frenchService)}">${contactText} <span aria-hidden="true">↗</span></button></div>
    </section>
    ${serviceNavMarkup()}
    <div class="service-page-content">
      <div class="service-section-heading"><div><span class="service-eyebrow">${language === "fr" ? "LE CARNET NOOR" : "THE NOOR EDIT"}</span><h2>${escapeHtml(copy.section)}</h2></div><span>${language === "fr" ? "Sélection d’idées" : "Curated ideas"}</span></div>
      <form class="service-search" role="search"><label class="sr-only" for="service-search-input">${searchPlaceholder}</label><input id="service-search-input" type="search" placeholder="${searchPlaceholder}" /><button type="submit">${searchText}</button></form>
      <div class="service-card-grid">${cards}</div><p class="service-empty" hidden>${emptyText}</p>
      <section class="service-faq"><div class="service-section-heading"><div><span class="service-eyebrow">${language === "fr" ? "AVANT DE PARTIR" : "BEFORE YOU GO"}</span><h2>${faqTitle}</h2></div></div>${faq}</section>
      <section class="service-end-note"><div><span>${language === "fr" ? "VOTRE VOYAGE, À VOTRE FAÇON" : "YOUR JOURNEY, YOUR WAY"}</span><h2>${language === "fr" ? "On prépare la suite avec vous." : "Let’s plan what comes next."}</h2></div><button type="button" data-open-planner data-service="${escapeHtml(englishService)}" data-fr-service="${escapeHtml(frenchService)}">${optionsText} <span aria-hidden="true">↗</span></button></section>
    </div>
  </div>`;
}

function renderHotelPage() {
  const isFrench = language === "fr";
  const sections = hotelSections.map((section) => {
    const heading = isFrench ? section.fr : section.en;
    const kind = section.id === "world-cities" || section.id === "uae-cities" ? "city" : section.id === "luxury-hotels" ? "resort" : section.id === "budget-stays" ? "budget" : section.id === "guest-houses" ? "guest" : "hotel";
    const cards = section.cards.map(([nameEn, nameFr, descEn, descFr, image, altEn, altFr, tag]) => {
      const name = isFrench ? nameFr : nameEn;
      const description = isFrench ? descFr : descEn;
      const alt = isFrench ? altFr : altEn;
      const haystack = `${name} ${description} ${tag} ${heading}`.toLocaleLowerCase(language);
      return `<article class="hotel-content-card" data-hotel-section="${section.id}" data-hotel-kind="${kind}" data-hotel-text="${escapeHtml(haystack)}">
        <img src="/public/images/${escapeHtml(image)}" alt="${escapeHtml(alt)}" loading="lazy" />
        <div class="hotel-content-card-copy"><span class="hotel-card-tag">${escapeHtml(tag)}</span><h3>${escapeHtml(name)}</h3><p>${escapeHtml(description)}</p><button type="button" data-open-planner data-service="${escapeHtml(nameEn)}" data-fr-service="${escapeHtml(nameFr)}">${isFrench ? "Demander des informations" : "Ask NOOR"} <span aria-hidden="true">↗</span></button></div>
      </article>`;
    }).join("");
    const browseLabel = isFrench ? "Faire défiler les suggestions" : "Scroll suggestions";
    return `<section class="hotel-carousel-section" id="${section.id}" data-hotel-carousel-section="${section.id}" aria-labelledby="${section.id}-title">
      <div class="hotel-section-heading"><div><span>${isFrench ? "SÉLECTION NOOR" : "THE NOOR EDIT"}</span><h2 id="${section.id}-title">${escapeHtml(heading)}</h2></div><div class="hotel-carousel-controls"><button type="button" data-hotel-scroll="${section.id}" data-direction="-1" aria-label="${browseLabel}">‹</button><button type="button" data-hotel-scroll="${section.id}" data-direction="1" aria-label="${browseLabel}">›</button></div></div>
      <div class="hotel-carousel-track" id="track-${section.id}">${cards}</div>
    </section>`;
  }).join("");
  const backText = isFrench ? "Retour à l’accueil" : "Back to home";
  const cityFilter = isFrench ? "Toutes les idées" : "All stay ideas";
  const statusText = isFrench ? "Les tarifs et disponibilités sont confirmés par NOOR." : "Rates and availability are confirmed with NOOR.";
  const options = isFrench ? "Demander des propositions à NOOR" : "Ask NOOR for stay options";
  const emptyText = isFrench ? "Aucune suggestion ne correspond à cette recherche. Essayez une autre destination." : "No suggestions match this search. Try another destination.";
  const offers = isFrench ? [
    ["POUR VOTRE PROCHAIN SÉJOUR", "Une sélection à votre mesure", "Partagez vos dates et vos envies pour recevoir des idées qui correspondent à votre voyage."],
    ["SÉJOUR + VOL", "Pensez le voyage dans son ensemble", "Associez votre hébergement à vos vols, transferts et activités préférés."]
  ] : [
    ["FOR YOUR NEXT STAY", "A shortlist shaped around you", "Share your dates and preferences to receive ideas that fit your journey."],
    ["STAY + FLIGHT", "Plan the whole trip together", "Pair your accommodation with flights, transfers and experiences you like."]
  ];
  const offerCards = offers.map(([tag, title, description]) => `<article class="hotel-offer-card"><span>${escapeHtml(tag)}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p><button type="button" data-open-planner data-service="Hotel stay" data-fr-service="Séjour à l’hôtel">${isFrench ? "Parler à NOOR" : "Talk to NOOR"} <span aria-hidden="true">↗</span></button></article>`).join("");
  const confidence = isFrench ? [
    ["◎", "Un conseiller à vos côtés", "Un échange humain pour préciser vos priorités."],
    ["◇", "Des propositions claires", "Les détails de chaque option sont partagés avant votre décision."],
    ["↗", "Une assistance directe", "Contactez l’équipe NOOR sur WhatsApp si vous avez besoin d’aide."]
  ] : [
    ["◎", "A real person to help", "Speak with an advisor and shape the stay around your priorities."],
    ["◇", "Clear options", "Review the details of each proposal before making a decision."],
    ["↗", "Direct travel support", "Reach the NOOR team on WhatsApp whenever you need help."]
  ];
  const confidenceTitle = isFrench ? "Réservez en toute confiance" : "Book with confidence";
  const confidenceCards = confidence.map(([symbol, title, description]) => `<div class="hotel-confidence-item"><span aria-hidden="true">${symbol}</span><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p></div></div>`).join("");
  const destinationPlaceholder = isFrench ? "Destination ou établissement" : "Enter a destination or property";
  const searchText = isFrench ? "Rechercher" : "Search";
  const dateFrom = isFrench ? "Arrivée" : "Check-in";
  const dateTo = isFrench ? "Départ" : "Check-out";
  const adultsLabel = isFrench ? "Adultes" : "Adults";
  const childrenLabel = isFrench ? "Enfants" : "Children";
  const roomsLabel = isFrench ? "Chambres" : "Rooms";
  const filterLabel = isFrench ? "Type de séjour" : "Stay type";
  const filterOptions = isFrench ? [["all", "Tous les séjours"], ["city", "Séjours en ville"], ["resort", "Resorts & bord de mer"], ["budget", "Petits budgets"], ["guest", "Maisons d’hôtes"]] : [["all", "All stay ideas"], ["city", "City stays"], ["resort", "Resorts & coast"], ["budget", "Budget-friendly"], ["guest", "Guest houses"]];
  const filterSelect = filterOptions.map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`).join("");

  return `<div class="hotel-page">
    <section class="hotel-landing">
      <div class="hotel-landing-inner">
        <div class="hotel-page-top"><button class="service-back" type="button">← ${backText}</button><span>NOOR <b>/</b> ${isFrench ? "Hôtels & séjours" : "Hotels & Homes"}</span></div>
        ${serviceNavMarkup()}
        <p class="hotel-kicker">${isFrench ? "DES SÉJOURS PENSÉS POUR VOUS" : "STAYS, THOUGHTFULLY CHOSEN"}</p>
        <h1>${isFrench ? "Hôtels & séjours" : "Hotels & Homes"}<span>.</span></h1>
        <p class="hotel-lead">${isFrench ? "Découvrez des hôtels, maisons et resorts pour chaque façon de voyager." : "Explore hotels, homes and resorts for every kind of journey."}</p>
        <form class="hotel-search-form" id="hotel-search-form">
          <label class="hotel-search-destination"><span aria-hidden="true">⌕</span><span class="sr-only">${destinationPlaceholder}</span><input id="hotel-destination" name="destination" type="search" placeholder="${destinationPlaceholder}" autocomplete="off" /></label>
          <div class="hotel-search-row">
            <label class="hotel-date-field"><span>${dateFrom}</span><input type="date" name="checkin" aria-label="${dateFrom}" /></label>
            <label class="hotel-date-field"><span>${dateTo}</span><input type="date" name="checkout" aria-label="${dateTo}" /></label>
          </div>
          <div class="hotel-search-row hotel-guests-row">
            <label><span>${adultsLabel}</span><input type="number" name="adults" value="2" min="1" max="12" /></label>
            <label><span>${childrenLabel}</span><input type="number" name="children" value="0" min="0" max="12" /></label>
            <label><span>${roomsLabel}</span><input type="number" name="rooms" value="1" min="1" max="8" /></label>
          </div>
          <div class="hotel-filter-row"><label for="hotel-stay-filter">${filterLabel}</label><select id="hotel-stay-filter">${filterSelect}</select></div>
          <button class="hotel-search-submit" type="submit">${searchText}</button>
        </form>
        <p class="hotel-live-note">${isFrench ? "Suggestions d’inspiration · Tarifs et disponibilités confirmés par NOOR" : "Curated inspiration · Rates and availability confirmed with NOOR"}</p>
      </div>
    </section>
    <div class="hotel-page-content">
      <section class="hotel-offers-section" aria-labelledby="hotel-offers-title"><div class="hotel-section-heading"><div><span>${isFrench ? "LES AVANTAGES NOOR" : "A LITTLE MORE WITH NOOR"}</span><h2 id="hotel-offers-title">${isFrench ? "Mes offres" : "My offers"}<i>.</i></h2></div><button class="hotel-show-all" type="button" data-open-planner data-service="Hotel offers" data-fr-service="Offres hôtels">${isFrench ? "Tout découvrir" : "Show all"} <span>›</span></button></div><div class="hotel-offers-grid">${offerCards}</div></section>
      <section class="hotel-confidence" aria-label="${escapeHtml(confidenceTitle)}"><h2>${escapeHtml(confidenceTitle)}</h2><div class="hotel-confidence-grid">${confidenceCards}</div></section>
      <p class="hotel-search-status" id="hotel-search-status" aria-live="polite">${statusText}</p>
      <p class="hotel-no-results" id="hotel-no-results" hidden>${emptyText}</p>
      ${sections}
      <section class="hotel-footer-cta"><div><span>${isFrench ? "VOTRE PROCHAIN SÉJOUR" : "YOUR NEXT STAY"}</span><h2>${isFrench ? "Trouvons l’adresse qui vous correspond." : "Let’s find a stay that feels right."}</h2></div><button type="button" data-open-planner data-service="Hotel stay" data-fr-service="Séjour à l’hôtel">${options} <span>↗</span></button></section>
    </div>
  </div>`;
}

function renderStoryPage(story) {
  const [location, title, description, image, alt] = story[language];
  const service = servicePages[story.service][language].title;
  return `<div class="service-page-shell story-detail-shell">
    <div class="service-page-top"><button class="service-back" type="button">← ${language === "fr" ? "Retour aux inspirations" : "Back to inspiration"}</button><span>NOOR <b>/</b> ${escapeHtml(location)}</span></div>
    <article class="story-detail"><img src="/public/images/${escapeHtml(image)}" alt="${escapeHtml(alt)}" /><div class="story-detail-copy"><span class="service-eyebrow">${escapeHtml(location)}</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p><button type="button" data-open-service="${escapeHtml(story.service)}">${language === "fr" ? `Découvrir ${escapeHtml(service)}` : `Explore ${escapeHtml(service)}`} <span aria-hidden="true">↗</span></button></div></article>
    ${serviceNavMarkup()}
  </div>`;
}

function renderActivePage() {
  if (!activePageId) return;
  const story = stories[activePageId];
  serviceView.innerHTML = activePageId === "hotels" ? renderHotelPage() : story ? renderStoryPage(story) : renderServicePage(servicePages[activePageId] || servicePages.inspiration);
  serviceView.querySelector(".service-back")?.addEventListener("click", closeServicePage);
  serviceView.querySelectorAll("[data-open-service]").forEach((button) => button.addEventListener("click", () => openServicePage(button.dataset.openService)));
  serviceView.querySelectorAll("[data-open-planner]").forEach((button) => button.addEventListener("click", () => openPlanner(button.dataset.service, button.dataset.frService)));
  serviceView.querySelector(".service-search")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = serviceView.querySelector("#service-search-input").value.trim().toLocaleLowerCase(language);
    let visibleCount = 0;
    serviceView.querySelectorAll(".service-card").forEach((card) => {
      const visible = !query || card.textContent.toLocaleLowerCase(language).includes(query);
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    const empty = serviceView.querySelector(".service-empty");
    if (empty) empty.hidden = visibleCount > 0;
  });
  serviceView.querySelector("#hotel-search-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = serviceView.querySelector("#hotel-destination").value.trim().toLocaleLowerCase(language);
    const kind = serviceView.querySelector("#hotel-stay-filter").value;
    let visibleCount = 0;
    serviceView.querySelectorAll(".hotel-content-card").forEach((card) => {
      const matchesQuery = !query || card.dataset.hotelText.includes(query);
      const matchesKind = kind === "all" || card.dataset.hotelKind === kind;
      card.hidden = !(matchesQuery && matchesKind);
      if (!card.hidden) visibleCount += 1;
    });
    serviceView.querySelectorAll("[data-hotel-carousel-section]").forEach((section) => {
      section.hidden = !section.querySelector(".hotel-content-card:not([hidden])");
    });
    const status = serviceView.querySelector("#hotel-search-status");
    const empty = serviceView.querySelector("#hotel-no-results");
    if (empty) empty.hidden = visibleCount > 0;
    if (status) status.textContent = query || kind !== "all"
      ? visibleCount
        ? (language === "fr" ? `${visibleCount} idées correspondent à vos critères. ${statusTextForHotel()}` : `${visibleCount} ideas match your search. ${statusTextForHotel()}`)
        : ""
      : statusTextForHotel();
    if (visibleCount) serviceView.querySelector("[data-hotel-carousel-section]:not([hidden])")?.scrollIntoView({behavior:"smooth",block:"start"});
  });
  serviceView.querySelectorAll("[data-hotel-scroll]").forEach((button) => button.addEventListener("click", () => {
    const track = serviceView.querySelector(`#track-${button.dataset.hotelScroll}`);
    track?.scrollBy({left:Number(button.dataset.direction) * 360,behavior:"smooth"});
  }));
}

function statusTextForHotel() {
  return language === "fr" ? "Les tarifs et disponibilités sont confirmés par NOOR." : "Rates and availability are confirmed with NOOR.";
}

function openServicePage(id, updateHistory = true) {
  activePageId = servicePages[id] || stories[id] ? id : "inspiration";
  homeView.hidden = true;
  serviceView.hidden = false;
  siteFooter.hidden = true;
  document.querySelectorAll(".service-tile").forEach((tile) => tile.setAttribute("aria-pressed", String(tile.dataset.openService === activePageId)));
  if (updateHistory) history.pushState({ noorPage: activePageId }, "", `#service/${activePageId}`);
  renderActivePage();
  window.scrollTo({ top: 0, behavior: "smooth" });
  languageMenu.hidden = true;
  document.querySelector("#main-menu").hidden = true;
  document.querySelector(".menu-button").setAttribute("aria-expanded", "false");
}

function closeServicePage() {
  activePageId = null;
  homeView.hidden = false;
  serviceView.hidden = true;
  serviceView.replaceChildren();
  siteFooter.hidden = false;
  document.querySelectorAll(".service-tile").forEach((tile) => tile.setAttribute("aria-pressed", "false"));
  history.replaceState({}, "", `${location.pathname}${location.search}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-open-service]").forEach((button) => button.addEventListener("click", () => openServicePage(button.dataset.openService)));
document.querySelectorAll("[data-open-story]").forEach((button) => button.addEventListener("click", () => openServicePage(button.dataset.openStory)));
window.addEventListener("popstate", () => {
  const pageId = location.hash.match(/^#service\/(.+)$/)?.[1];
  if (pageId) openServicePage(pageId, false);
  else if (activePageId) closeServicePage();
});
document.querySelectorAll(".main-menu a").forEach((link) => link.addEventListener("click", () => {
  if (activePageId) closeServicePage();
  document.querySelector(".menu-button").setAttribute("aria-expanded", "false");
  document.querySelector("#main-menu").hidden = true;
}));

languageToggle.addEventListener("click", () => {
  const expanded = languageToggle.getAttribute("aria-expanded") === "true";
  languageToggle.setAttribute("aria-expanded", String(!expanded));
  languageMenu.hidden = expanded;
});

languageMenu.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.language);
    languageToggle.setAttribute("aria-expanded", "false");
    languageMenu.hidden = true;
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".top-actions")) {
    languageToggle.setAttribute("aria-expanded", "false");
    languageMenu.hidden = true;
  }
});

const menuButton = document.querySelector(".menu-button");
const menu = document.querySelector("#main-menu");
menuButton.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
  menu.hidden = expanded;
});
menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  menuButton.setAttribute("aria-expanded", "false");
  menu.hidden = true;
}));

try { setLanguage(localStorage.getItem("noor-language") || "en"); } catch { setLanguage("en"); }
const initialPageId = location.hash.match(/^#service\/(.+)$/)?.[1];
if (initialPageId) openServicePage(initialPageId, false);
