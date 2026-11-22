/** Airports offered in search suggestions. Any valid 3-letter IATA code is also accepted. */
export const airportList: { code: string; city: string; name: string; country: string }[] = [
  { code: "DXB", city: "Dubai", name: "Dubai International", country: "AE" },
  { code: "DWC", city: "Dubai", name: "Al Maktoum International", country: "AE" },
  { code: "AUH", city: "Abu Dhabi", name: "Zayed International", country: "AE" },
  { code: "SHJ", city: "Sharjah", name: "Sharjah International", country: "AE" },
  { code: "DOH", city: "Doha", name: "Hamad International", country: "QA" },
  { code: "RUH", city: "Riyadh", name: "King Khalid International", country: "SA" },
  { code: "JED", city: "Jeddah", name: "King Abdulaziz International", country: "SA" },
  { code: "MED", city: "Madinah", name: "Prince Mohammad bin Abdulaziz", country: "SA" },
  { code: "MCT", city: "Muscat", name: "Muscat International", country: "OM" },
  { code: "BAH", city: "Bahrain", name: "Bahrain International", country: "BH" },
  { code: "KWI", city: "Kuwait", name: "Kuwait International", country: "KW" },
  { code: "CAI", city: "Cairo", name: "Cairo International", country: "EG" },
  { code: "IST", city: "Istanbul", name: "Istanbul Airport", country: "TR" },
  { code: "LHR", city: "London", name: "Heathrow", country: "GB" },
  { code: "LGW", city: "London", name: "Gatwick", country: "GB" },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle", country: "FR" },
  { code: "ORY", city: "Paris", name: "Orly", country: "FR" },
  { code: "BRU", city: "Brussels", name: "Brussels Airport", country: "BE" },
  { code: "FRA", city: "Frankfurt", name: "Frankfurt am Main", country: "DE" },
  { code: "AMS", city: "Amsterdam", name: "Schiphol", country: "NL" },
  { code: "MAD", city: "Madrid", name: "Barajas", country: "ES" },
  { code: "FCO", city: "Rome", name: "Fiumicino", country: "IT" },
  { code: "GVA", city: "Geneva", name: "Geneva Airport", country: "CH" },
  { code: "JFK", city: "New York", name: "John F. Kennedy", country: "US" },
  { code: "YUL", city: "Montreal", name: "Montréal-Trudeau", country: "CA" },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj", country: "IN" },
  { code: "DEL", city: "Delhi", name: "Indira Gandhi International", country: "IN" },
  { code: "KHI", city: "Karachi", name: "Jinnah International", country: "PK" },
  { code: "MLE", city: "Malé", name: "Velana International", country: "MV" },
  { code: "DPS", city: "Bali", name: "Ngurah Rai International", country: "ID" },
  { code: "BKK", city: "Bangkok", name: "Suvarnabhumi", country: "TH" },
  { code: "KUL", city: "Kuala Lumpur", name: "KLIA", country: "MY" },
  { code: "SIN", city: "Singapore", name: "Changi", country: "SG" },
  { code: "SEZ", city: "Mahé", name: "Seychelles International", country: "SC" },
  { code: "MRU", city: "Mauritius", name: "Sir Seewoosagur Ramgoolam", country: "MU" },
  { code: "ZNZ", city: "Zanzibar", name: "Abeid Amani Karume", country: "TZ" },
  { code: "DSS", city: "Dakar", name: "Blaise Diagne International", country: "SN" },
  { code: "ABJ", city: "Abidjan", name: "Félix-Houphouët-Boigny", country: "CI" },
  { code: "BKO", city: "Bamako", name: "Modibo Keïta International", country: "ML" },
  { code: "CKY", city: "Conakry", name: "Ahmed Sékou Touré International", country: "GN" },
  { code: "OUA", city: "Ouagadougou", name: "Ouagadougou Airport", country: "BF" },
  { code: "NIM", city: "Niamey", name: "Diori Hamani International", country: "NE" },
  { code: "NKC", city: "Nouakchott", name: "Oumtounsy International", country: "MR" },
  { code: "LOS", city: "Lagos", name: "Murtala Muhammed International", country: "NG" },
  { code: "ABV", city: "Abuja", name: "Nnamdi Azikiwe International", country: "NG" },
  { code: "ACC", city: "Accra", name: "Kotoka International", country: "GH" },
  { code: "LFW", city: "Lomé", name: "Gnassingbé Eyadéma International", country: "TG" },
  { code: "COO", city: "Cotonou", name: "Cadjehoun", country: "BJ" },
  { code: "CMN", city: "Casablanca", name: "Mohammed V International", country: "MA" },
  { code: "RAK", city: "Marrakech", name: "Menara", country: "MA" },
  { code: "ALG", city: "Algiers", name: "Houari Boumediene", country: "DZ" },
  { code: "TUN", city: "Tunis", name: "Tunis-Carthage", country: "TN" },
  { code: "DLA", city: "Douala", name: "Douala International", country: "CM" },
  { code: "NSI", city: "Yaoundé", name: "Nsimalen International", country: "CM" },
  { code: "LBV", city: "Libreville", name: "Léon-Mba International", country: "GA" },
  { code: "FIH", city: "Kinshasa", name: "N'djili International", country: "CD" },
  { code: "BZV", city: "Brazzaville", name: "Maya-Maya", country: "CG" },
  { code: "NBO", city: "Nairobi", name: "Jomo Kenyatta International", country: "KE" },
  { code: "ADD", city: "Addis Ababa", name: "Bole International", country: "ET" },
  { code: "EBB", city: "Entebbe", name: "Entebbe International", country: "UG" },
  { code: "KGL", city: "Kigali", name: "Kigali International", country: "RW" },
  { code: "DAR", city: "Dar es Salaam", name: "Julius Nyerere International", country: "TZ" },
  { code: "JNB", city: "Johannesburg", name: "O. R. Tambo International", country: "ZA" },
  { code: "CPT", city: "Cape Town", name: "Cape Town International", country: "ZA" },
  { code: "KRT", city: "Khartoum", name: "Khartoum International", country: "SD" },
];

export const IATA_RE = /^[A-Z]{3}$/;

/** Accepts "DXB", "Dubai (DXB)" or a city name from the list, returns the IATA code or null. */
export function parseAirport(input: string | null | undefined): string | null {
  if (!input) return null;
  const v = input.trim();
  const paren = v.match(/\(([A-Za-z]{3})\)\s*$/);
  if (paren?.[1]) return paren[1].toUpperCase();
  if (/^[A-Za-z]{3}$/.test(v)) return v.toUpperCase();
  const byCity = airportList.find((a) => a.city.toLowerCase() === v.toLowerCase());
  return byCity?.code ?? null;
}

export function airportLabel(code: string): string {
  const a = airportList.find((x) => x.code === code);
  return a ? `${a.city} (${a.code})` : code;
}
