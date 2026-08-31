// All official Philippine cities & municipalities from PSGC via ph-locations package
// Duplicate city names have their province appended e.g. "San Jose (Batangas)"
// Generated from ph-locations npm package (1,634 entries)
import officialNames from "./ph-names.json";

// Commonly used barangays / districts that are NOT official municipalities
// but people frequently refer to as their location
const COMMON_AREAS: string[] = [
  // Cavite
  "Molino (Bacoor, Cavite)",
  "Aguinaldo (Bacoor, Cavite)",
  "Habay (Bacoor, Cavite)",
  "Talaba (Bacoor, Cavite)",
  "Salawag (Dasmariñas, Cavite)",
  "Paliparan (Dasmariñas, Cavite)",
  "Langkaan (Dasmariñas, Cavite)",
  // Rizal
  "Cogeo (Antipolo, Rizal)",
  "Tikling (Taytay, Rizal)",
  // Laguna
  "Mayapa (Calamba, Laguna)",
  // Bulacan
  "Sapang Palay (San Jose del Monte, Bulacan)",
  "Tungkong Mangga (San Jose del Monte, Bulacan)",
  // Metro Manila areas commonly used
  "BGC (Taguig)",
  "Fort Bonifacio (Taguig)",
  "Cubao (Quezon City)",
  "Fairview (Quezon City)",
  "Novaliches (Quezon City)",
  "Commonwealth (Quezon City)",
  "Alabang (Muntinlupa)",
  "Sucat (Parañaque)",
  "BF Homes (Parañaque)",
  "Camarin (Caloocan)",
  "Bagong Silang (Caloocan)",
  "Ortigas (Pasig)",
  "Kapitolyo (Pasig)",
];

export const PH_LOCATIONS_SORTED: string[] = [
  ...(officialNames as string[]),
  ...COMMON_AREAS,
].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
