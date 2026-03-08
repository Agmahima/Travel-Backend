// City name to IATA code mapping
const cityCodeMap: Record<string, string> = {
  // India
  'delhi': 'DEL',
  'new delhi': 'DEL',
  'mumbai': 'BOM',
  'bombay': 'BOM',
  'bangalore': 'BLR',
  'bengaluru': 'BLR',
  'hyderabad': 'HYD',
  'chennai': 'MAA',
  'madras': 'MAA',
  'kolkata': 'CCU',
  'calcutta': 'CCU',
  'ahmedabad': 'AMD',
  'pune': 'PNQ',
  'jaipur': 'JAI',
  'surat': 'STV',
  'lucknow': 'LKO',
  'kanpur': 'KNU',
  'nagpur': 'NAG',
  'indore': 'IDR',
  'bhopal': 'BHO',
  'visakhapatnam': 'VTZ',
  'patna': 'PAT',
  'vadodara': 'BDQ',
  'goa': 'GOI',
  'kochi': 'COK',
  'cochin': 'COK',
  'agra': 'AGR',
  'chandigarh': 'IXC',
  'coimbatore': 'CJB',
  'guwahati': 'GAU',
  'thiruvananthapuram': 'TRV',
  'trivandrum': 'TRV',
  'mangalore': 'IXE',
  'amritsar': 'ATQ',
  'varanasi': 'VNS',
  'bhubaneswar': 'BBI',
  'raipur': 'RPR',
  'ranchi': 'IXR',
  'jammu': 'IXJ',
  'udaipur': 'UDR',
  'jodhpur': 'JDH',
  
  // International (add more as needed)
  'paris': 'PAR',
  'london': 'LON',
  'new york': 'NYC',
  'tokyo': 'TYO',
  'singapore': 'SIN',
  'dubai': 'DXB',
  'bangkok': 'BKK',
  'hong kong': 'HKG',
  'sydney': 'SYD',
  'melbourne': 'MEL',
  'barcelona': 'BCN',
  'madrid': 'MAD',
  'rome': 'ROM',
  'milan': 'MIL',
  'amsterdam': 'AMS',
  'berlin': 'BER',
  'istanbul': 'IST',
  'los angeles': 'LAX',
  'san francisco': 'SFO',
  'chicago': 'CHI',
  'toronto': 'YTO',
  'vancouver': 'YVR',
};

export function getCityCode(cityName: string): string | null {
  if (!cityName) return null;
  
  // Normalize the city name
  const normalized = cityName.toLowerCase().trim();
  
  // Direct match
  if (cityCodeMap[normalized]) {
    return cityCodeMap[normalized];
  }
  
  // Try to extract city name from "City, State, Country" format
  const cityPart = normalized.split(',')[0].trim();
  if (cityCodeMap[cityPart]) {
    return cityCodeMap[cityPart];
  }
  
  // Check if the input is already an IATA code (3 uppercase letters)
  if (/^[A-Z]{3}$/.test(cityName)) {
    return cityName;
  }
  
  return null;
}

export function isCitySupported(cityName: string): boolean {
  return getCityCode(cityName) !== null;
}