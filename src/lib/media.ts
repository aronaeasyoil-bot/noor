/**
 * Photo registry. Every photo is published on Unsplash under the Unsplash License
 * (free commercial use, no permission needed; attribution appreciated). Each entry records the
 * source page so the credits page and the media library can attribute it.
 * Images are served from Unsplash's CDN and resized there (see src/lib/image-loader.ts).
 *
 * Rule: one photo per subject. A photo is never reused for a different destination.
 */
export type Photo = {
  src: string;
  /** Unsplash photo id (the part after /photos/). */
  page: string;
  /** English description, used as alt text fallback. */
  alt: string;
  /** Photographer or location where Unsplash states it. */
  credit?: string;
};

const u = (photo: string, page: string, alt: string, credit?: string): Photo => ({
  src: `https://images.unsplash.com/${photo}`,
  page,
  alt,
  credit,
});

export const photos = {
  // Brand & hero
  heroDubai: u("photo-1512453979798-5ea266f8880c", "Fr6zexbmjmc", "Burj Khalifa and the Downtown Dubai skyline"),
  heroYacht: u("photo-1773829126358-1e5f4e5aa532", "Ti0LoyWyHjQ", "Luxury yacht cruising past the Dubai skyline"),

  // Service tiles
  flights: u("photo-1558882423-bebedae70ea8", "s4i33r-KszI", "Passenger aircraft flying above the clouds"),
  hotels: u("photo-1611892440504-42a792e24d32", "T5pL6ciEn-I", "Hotel room with wooden bed and garden view"),
  flightHotel: u("photo-1582719508461-905c673771fd", "xEaAoizNFV8", "Resort sun loungers on a wooden deck"),
  cars: u("photo-1587580945215-5d4aabb2c8ef", "jYVnwIc1H-c", "Traveller next to a rental car"),
  transfers: u("photo-1485291571150-772bcfc10da5", "FMbWFDiVRPs", "Black chauffeur sedan"),
  transfersAirport: u("photo-1767710096520-9246565a9d31", "s7o9S4RtYHc", "Travellers with luggage in a modern airport terminal"),
  safari: u("photo-1588310558566-b983c7d257e4", "rWQpuQPJR1A", "4x4 vehicle crossing red sand dunes in a cloud of dust"),
  activities: u("photo-1550686164-6f282d49c63c", "L7Gq5vgrePo", "Fountain show among illuminated towers at night"),
  visa: u("photo-1581553673739-c4906b5d0de8", "htQznS-Rx7w", "Open passport with colourful entry stamps"),
  visaDocs: u("photo-1655722724447-2d2a3071e7f8", "addEU6TScGI", "Passports with boarding passes"),
  packages: u("photo-1590523277543-a94d2e4eb00b", "k9Zeq6EH_bk", "Overwater villa above turquoise water"),
  business: u("photo-1532968899863-5b52ef155913", "rUXh5USKfUQ", "Business travellers crossing a sunlit airport terminal"),
  luxury: u("photo-1781872324499-e51350ed640e", "VkplOkPf59g", "Luxury white yacht moored in a bay"),
  africaHero: u("photo-1758061329486-4f7b4a09d77d", "rVUskjd0WRk", "Dakar city skyline", "Sweder Breet · Dakar, Senegal"),
  support: u("photo-1626863905121-3b0c0ed7b94c", "mHusyBu4bxM", "Travel advisers with headsets at work"),
  newsletter: u("photo-1516738901171-8eb4fc13bd20", "TrhLCn1abMU", "World map with travel pins"),

  // International destinations
  dubai: u("photo-1708361089093-beef4c4584e7", "WyfXOHgI49s", "Dubai at night seen from the top of a skyscraper"),
  abuDhabi: u("photo-1512970648279-ff3398568f77", "njEXjDmYn8w", "Sheikh Zayed Grand Mosque, Abu Dhabi"),
  istanbul: u("photo-1524231757912-21f4fe3a7200", "0n0AHB1fgTQ", "Galata Tower above the Istanbul skyline"),
  paris: u("photo-1502602898657-3e91760cbb34", "nnzkZNYWHaU", "Eiffel Tower, Paris"),
  london: u("photo-1513635269975-59663e0ac1ad", "Oja2ty_9ZLM", "Aerial view of the London skyline"),
  maldives: u("photo-1573843981267-be1999ff37cd", "xPsFXsbXJRg", "Aerial view of a Maldives island resort"),
  bali: u("photo-1555400038-63f5ba517a47", "-2WlTWZLnRc", "Tegallalang rice terraces, Bali"),
  cairo: u("photo-1539768942893-daf53e448371", "boyXZfqpwpU", "Camel riders beside the pyramids of Giza"),
  zanzibar: u("photo-1575999502951-4ab25b5ca889", "e6dRLBx6Kg8", "White-sand beach with palms and a wooden jetty, Zanzibar"),
  marrakech: u("photo-1597212618440-806262de4f6b", "CFKksjYRSQ8", "Koutoubia Mosque minaret above Marrakech"),
  doha: u("photo-1700901742651-6b353164caf3", "jJtqDVzozQY", "Katara Towers on the Lusail waterfront, Qatar"),
  capeTown: u("photo-1580060839134-75a5edca2e99", "1GgWbP74phY", "Cape Town below Table Mountain"),

  // Trending flight routes (different photos from destination cards)
  routeLondon: u("photo-1486299267070-83823f5448dd", "iXqTqC-f6jI", "Big Ben and Westminster, London"),
  routeParis: u("photo-1431274172761-fca41d930114", "QAwciFlS1g4", "Eiffel Tower at dusk"),
  routeIstanbul: u("photo-1589561454226-796a8aa89b05", "WA1u0scVLZU", "Ferry crossing the Bosphorus, Istanbul"),
  routeCairo: u("photo-1553913861-c0fddf2619ee", "ONVA6s03hg8", "The Great Sphinx of Giza"),
  routeRiyadh: u("photo-1694018359679-49465b4c0d61", "_UxsPARhtOg", "Kingdom Centre tower, Riyadh"),
  routeMaldives: u("photo-1516815231560-8f41ec531527", "M1ObxvsWVhY", "Jetty and thatched boat in Maldives lagoon"),

  // Dubai hotel areas (areas, not specific hotels)
  areaDowntown: u("photo-1580674684081-7617fbf3d745", "QJKEa9n3yN8", "Downtown Dubai towers by the water"),
  areaPalm: u("photo-1786991810391-e28ee367c3aa", "to8TlBSHjvU", "Aerial view of the crescent of Palm Jumeirah"),
  areaMarina: u("photo-1611577810610-642f8ac05c32", "UDsO83Ts6tQ", "Dubai Marina towers by the sea"),
  areaJumeirah: u("photo-1523816572-a1a23d1a67b8", "jG3I8b5iyHI", "Aerial view of Burj Al Arab on Jumeirah Beach"),
  areaCreek: u("photo-1579524655638-351438cb80d2", "wpBHI547h34", "Traditional boats on Dubai Creek"),
  areaAbuDhabi: u("photo-1587421890935-5fb13a3beccc", "xeFDlGub15M", "Louvre Abu Dhabi on the water"),
  roomBed: u("photo-1618773928121-c32242e63f39", "Yrxr3bsPdS0", "Hotel bed with white linen"),
  roomBath: u("photo-1584622650111-993a426fbf0a", "g51F6-WYzyU", "Modern hotel bathroom"),
  hotelLobby: u("photo-1621293954908-907159247fc8", "zSG-kd-L6vw", "Modern hotel lobby"),
  hotelPool: u("photo-1623718649591-311775a30c43", "D1yT791Nf9A", "Hotel pool beside palm trees"),

  // Dubai attractions
  burjKhalifa: u("photo-1651467606797-e1c660cf3fda", "aKj9uDanF18", "Silhouette of Burj Khalifa, Dubai"),
  burjKhalifaNight: u("photo-1652707228067-25672fa0b082", "6Xg267sypu8", "Dubai at night from the top of a skyscraper"),
  museumFuture: u("photo-1686918269961-507270a5a238", "oF7dZYCgO3k", "Museum of the Future, Dubai, at golden hour"),
  museumFuture2: u("photo-1667592441284-b590021411e3", "3Q17UE2FZM4", "Museum of the Future with Arabic calligraphy"),
  museumFuture3: u("photo-1764253340517-9adc9a839970", "bxNzukMp5gw", "Visitors on an escalator towards a glowing globe"),
  marina: u("photo-1722502831583-b4e93ecc6027", "RpMvnAq0b44", "Dubai Marina with yachts"),
  marinaNight: u("photo-1765801122549-2c11dc9cbd78", "Kl62-nue08I", "Dubai Marina towers and boats at night"),
  dubaiFrame: u("photo-1680838730692-b08ee8fe4fcb", "c9YUTwediI8", "Dubai Frame landmark"),
  dubaiFrame2: u("photo-1645023631503-fde4f0333d78", "H-nfWkeu3s4", "Dubai Frame against a blue sky"),
  dubaiMall: u("photo-1761474258114-8006f62cd35b", "hCOW_PU2oRw", "Shoppers in a multi-level shopping mall"),
  dubaiMall2: u("photo-1562280963-8a5475740a10", "X0yKdR_F9rM", "Shopping mall interior seen from above"),
  palm: u("photo-1640808476588-e96ae8e7a419", "fjfNY4PsIoc", "Island on turquoise water"),
  palm2: u("photo-1590765407066-12de51f9565b", "14apOL4uU4E", "White resort building beside the water"),
  yachtTour: u("photo-1768463852019-4881a17a1c0e", "fbv1cPWR1j0", "Boat sailing past city towers at sunset"),
  yachtTour2: u("photo-1768463851971-a813d5797341", "MQfDZmBkLe8", "Guest on a boat overlooking the skyline at sunset"),
  themePark: u("photo-1627035983655-0ceec61bb733", "IU50vDwlhEc", "Roller coaster in a theme park"),
  themePark2: u("photo-1761242606389-0a45db29fdee", "bF4cW92wKqY", "Theme park rides with a roller coaster"),
  waterPark: u("photo-1642717841683-c0323214617c", "wsTxyveCsDM", "Water park with slides"),
  waterPark2: u("photo-1781735562676-46df9b3bbf59", "Gq9Fq1qD8J8", "Colourful water slides and pools"),
  abuDhabiTour: u("photo-1612207644086-243779ab1013", "sfMW7-4NI-o", "White domes of the Grand Mosque under a blue sky"),
  abuDhabiTour2: u("photo-1604655983671-9d03650f604c", "IEcqd914qpw", "Visitors walking through a white marble mosque"),
  privateExcursion: u("photo-1778008452928-8da3c5b9b9cd", "MhnUXgtsiD0", "Traditional dhow sailing past illuminated towers at night"),
  family: u("photo-1597524678053-5e6fef52d8a3", "cf1cN3ofKUM", "Family on a beach with a baby on dad's shoulders"),
  family2: u("photo-1695425812104-8a9963d58887", "D1ZtQGk3AB8", "Family walking hand in hand on the beach"),

  // Desert safari
  safariMorning: u("photo-1510479524860-95998e54a8c6", "JgZqdpWp0M4", "White 4x4 in the desert in daylight"),
  safariEvening: u("photo-1638835373951-3a67da7aaf8d", "Y0TI0vPlrjE", "4x4 crossing the desert at sunset"),
  safariOvernight: u("photo-1527419105721-af1f23c86dec", "X12nmozEaFA", "Outdoor beds under a starry desert sky"),
  safariPrivate: u("photo-1624062999726-083e5268525d", "o9w0oygbXEc", "White SUV on brown sand dunes"),
  safariLuxury: u("photo-1762970913723-21d3c7f5846c", "h1zE_xLhsXg", "Desert camp with tents and a campfire"),
  safariQuad: u("photo-1624062999803-976e1adc8ea2", "v40H7tLOZII", "Rider on a quad bike in the sand"),
  safariBuggy: u("photo-1695878868496-fcbd6ef47f57", "y-nYxNiU10Q", "Four dune buggies crossing the desert"),
  safariCamel: u("photo-1549944850-84e00be4203b", "2dtvA_QgF6Q", "Camels resting on desert sand"),
  safariCamel2: u("photo-1700124708071-4af4867eeaf3", "OlEF4W-yCe4", "Man standing next to a camel in the desert"),
  safariSandboard: u("photo-1546440002-bc11606f7c2a", "mBP_MP6F8mc", "Sandboarder sliding down a dune"),
  safariBbq: u("photo-1559460589-59f8520042c8", "Y3cihWw1aIo", "Group around a campfire at night"),
  safariBbq2: u("photo-1534177616072-ef7dc120449d", "ul_m5dHThaM", "Grilling outdoors"),
  safariVip: u("photo-1742237281799-85c274bbbec1", "3xMP9mp8Uf0", "Man holding a falcon in the desert"),
  safariDunes: u("photo-1553796661-17b7fa359f49", "zuueig1w8WI", "Sand dune ridge"),
  safariConvoy: u("photo-1576159470850-494c8b17aca0", "nEENSEbLIsY", "Vehicles in the desert during the day"),
  safariAtv: u("photo-1742237281789-c37c5b38e0a9", "X-8FZly-wfM", "Quad bikes crossing desert sand"),
  safariCamels3: u("photo-1489493585363-d69421e0edd3", "_VqyrvQi6do", "Camels in the desert under a blue sky"),

  // Cars
  carEconomy: u("photo-1454057093394-cf67bae1d3cf", "mjnO4ipSBy0", "Blue hatchback on an asphalt road"),
  carSedan: u("photo-1546614042-7df3c24c9e5d", "TVFx7iFAAdQ", "Black BMW sedan"),
  carSuv: u("photo-1533473359331-0135ef1b58bf", "a4S6KUuLeoM", "White Ford Explorer SUV"),
  carLuxury: u("photo-1618418721668-0d1f72aa4bab", "0mchrVHAYzg", "Front of a luxury car with chrome grille at night"),
  carSports: u("photo-1614200179396-2bdb77ebf81b", "Wl6OeSGyOf4", "Red Ferrari 458 Italia"),
  car4x4: u("photo-1709620435533-56483034bdd4", "IQDZAT8opDo", "White Toyota Land Cruiser on the beach"),
  carMinivan: u("photo-1675311183084-755007dbb223", "CHNoqIW7pfY", "Silver minivan parked by the road"),
  carChauffeur: u("photo-1581880769901-98d9623f6b45", "020qf9WwYyI", "Driver at the wheel"),
  carVip: u("photo-1676107648535-931375db52e2", "FZ5MkHkeyKM", "White stretch limousine"),

  // Transfer vehicles
  transferSuv: u("photo-1778541999438-983cff5703fa", "kM7OAz6dx2M", "Luxury SUV parked in the city at night"),
  transferVan: u("photo-1587813369290-091c9d432daf", "3vlGNkDep4E", "Row of white passenger vans"),
  transferLuxury: u("photo-1563191848-b01d0258f1f9", "WAHFUbmTTzM", "Luxury car with open rear door"),

  // Packages
  pkgFlightHotel: u("photo-1620065487644-1080510335f5", "lVRolxDY5q0", "Wooden pier leading to a tropical resort"),
  pkgHotelTransfer: u("photo-1782890790046-2aefb0b503cb", "-l1mdvHjaR4", "Hotel lobby with reception"),
  pkgDubai: u("photo-1546412414-28524ac58329", "KTivTunp_lw", "Burj Al Arab, Dubai, in daylight"),
  pkgFamily: u("photo-1760532889978-c0168d2a4bbc", "dc8Yoc2lDTA", "Family walk on the beach at sunset"),
  pkgHoneymoon: u("photo-1701401942416-bea590efe2ad", "33o_WKC_c1A", "Couple watching the sunset on the beach"),
  pkgBusiness: u("photo-1773734874748-8e7893de8e6f", "ZyBRtdUuq0g", "Traveller on a moving walkway in an airport"),
  pkgGroup: u("photo-1511632765486-a01980e01a18", "PGnqT0rXWLs", "Friends with arms around each other watching the sunset"),
  pkgLuxury: u("photo-1569263979104-865ab7cd8d13", "FWJinfDsIn8", "White and black luxury cruiser"),

  // Additional services
  trains: u("photo-1535535112387-56ffe8db21ff", "mHqIs22M2Kw", "Train crossing a forest"),
  buses: u("photo-1544620347-c4fd4a3d5957", "6mcVaoGNz1w", "Coach driving near mountains"),
  insurance: u("photo-1488085061387-422e29b40080", "oCdVtGFeDC0", "View from an aircraft window at golden hour"),
  esim: u("photo-1755286218783-5b8334109336", "HHA4fqczBZw", "Smartphone showing a list of countries"),
  yachtRental: u("photo-1523496922380-91d5afba98a3", "nfF5-G6cFwY", "Bird's-eye view of a yacht on the water"),
  privateJet: u("photo-1474302770737-173ee21bab63", "6w_dYdazo20", "Private jet on the tarmac at golden hour"),
  corporate: u("photo-1542744173-8e7e53415bb0", "gMsnXqILjp4", "Business meeting around a table"),
  groupTravel: u("photo-1529156069898-49953e39b3ac", "Cecb0_8Hx-o", "Group of friends sitting on a wall"),
  concierge: u("photo-1759038085950-1234ca8f5fed", "kfnWOD1Tbp8", "Hotel reception desk"),
  airportAssistance: u("photo-1769454625177-b031788425da", "sVsVcdus5nU", "Modern airport lounge"),
  vip: u("photo-1768346564233-d71f37bd19b6", "ogUyaf8JWA4", "Private jet cabin with leather seats"),
  airplaneCabin: u("photo-1608023136037-626dad6c6188", "DSOohFTAfno", "Aircraft cabin seats"),

  // Africa departure cities (location verified on the Unsplash photo page)
  dakar: u("photo-1648504735627-6af97e8337a9", "7OVL_rjXSSM", "Boats in Dakar harbour", "Dodji Abah-Dakou · Dakar, Senegal"),
  abidjan: u("photo-1785095617583-e408f4b451ca", "ir5PK5Itae0", "Abidjan skyline across the lagoon", "Ryan H. · Abidjan, Côte d'Ivoire"),
  bamako: u("photo-1777140311321-7e127511a033", "XZs4CgC_gVQ", "Travellers on a path in central Mali", "Kagou Dicko · Diafarabé, Mali"),
  conakry: u("photo-1512944049881-3a92e7eb8a47", "fzKP6Rz0Ss4", "Aerial view of a bridge over water in Conakry", "Tim Oun · Conakry, Guinea"),
  lagos: u("photo-1618828665011-0abd973f7bb8", "67ruAEYmp4c", "Aerial view of Lagos", "Nupo Deyon Daniel · Lagos, Nigeria"),
  accra: u("photo-1630386226447-af0a955c1009", "-CgUhaShACE", "Landmark building with flag in Accra", "Ifeoluwa B. · Accra, Ghana"),
  casablanca: u("photo-1780663684974-297689cbb95c", "k0sdfXBGpk4", "Hassan II Mosque on the ocean, Casablanca"),
  douala: u("photo-1594386479412-fa62932f4cdc", "bZnciM7XIYw", "Street life in Douala", "Edouard Tamba · Douala, Cameroon"),
  kinshasa: u("photo-1623930180584-1b14bc584169", "StJWD4ci8wY", "Boulevard in Kinshasa under a blue sky", "Kaysha · Kinshasa, DR Congo"),
  nairobi: u("photo-1611348524140-53c9a25263d6", "LTh5pGyvKAM", "Nairobi city skyline", "Amani Nation · Nairobi, Kenya"),
  addisAbaba: u("photo-1686143293611-85158a1a9370", "r3JBHwlRFMI", "Addis Ababa city view", "Hawi Getachew · Addis Ababa, Ethiopia"),

  // Inspiration
  inspoMarinaWalk: u("photo-1617449512807-7401d38e5c29", "XZSEqNQa120", "People walking along Dubai Marina"),
  inspoPacking: u("photo-1648737967037-96967e9151b5", "C-o9HNzQ_rA", "Packing a suitcase"),
  inspoCreekSunset: u("photo-1700556498243-9b5b66326e68", "xWHZPHuGrCA", "Sunset over the city skyline"),
  inspoGarden: u("photo-1588314941393-af1c493f345c", "-LiPS85csDM", "Flower garden in bloom"),
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;

/** Neutral fallback shown if a remote photo fails to load. */
export const fallbackImage = "/images/fallback-travel.svg";

export function unsplashPage(p: Photo): string {
  return `https://unsplash.com/photos/${p.page}`;
}
