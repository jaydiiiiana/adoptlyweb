/**
 * City proximity map for Metro Manila and nearby areas.
 *
 * Each city is assigned a set of "neighbor groups" — cities sorted by how
 * close they are geographically. When sorting pets, a pet whose owner is in
 * the user's own city ranks first, then neighbors in order of closeness.
 *
 * Groups are indexed 0 = same city, 1 = immediate neighbors, 2 = close,
 * 3 = moderate, 4 = far — anything not in the map gets group 99.
 */

// Canonical lowercase city names → their ordered neighbor list (closest first)
const NEIGHBOR_GROUPS: Record<string, string[][]> = {
  valenzuela: [
    ["valenzuela"],
    ["caloocan", "malabon", "navotas"],
    ["obando", "marilao", "meycauayan", "bocaue"],               // bulacan border
    ["quezon city", "manila", "san jose del monte"],
    ["pasig", "marikina", "mandaluyong", "las piñas", "paranaque"],
  ],
  caloocan: [
    ["caloocan"],
    ["malabon", "navotas", "valenzuela"],
    ["quezon city", "manila"],
    ["obando", "marilao", "meycauayan"],
    ["pasig", "marikina", "mandaluyong"],
  ],
  malabon: [
    ["malabon"],
    ["navotas", "caloocan", "valenzuela"],
    ["quezon city", "manila"],
    ["obando", "marilao"],
    ["pasig", "mandaluyong"],
  ],
  navotas: [
    ["navotas"],
    ["malabon", "caloocan"],
    ["manila", "quezon city"],
    ["valenzuela"],
    ["pasig", "mandaluyong"],
  ],
  manila: [
    ["manila"],
    ["caloocan", "quezon city", "mandaluyong", "san juan", "navotas", "malabon"],
    ["pasig", "marikina", "taguig", "makati", "las piñas"],
    ["valenzuela", "paranaque"],
    ["meycauayan", "marilao", "obando"],
  ],
  "quezon city": [
    ["quezon city"],
    ["caloocan", "manila", "mandaluyong", "san juan", "marikina"],
    ["pasig", "taguig", "valenzuela"],
    ["rodriguez", "san mateo", "antipolo"],
    ["meycauayan", "marilao"],
  ],
  makati: [
    ["makati"],
    ["mandaluyong", "pasig", "taguig", "san juan"],
    ["manila", "quezon city", "marikina"],
    ["las piñas", "paranaque", "muntinlupa"],
    ["caloocan", "valenzuela"],
  ],
  pasig: [
    ["pasig"],
    ["mandaluyong", "makati", "marikina", "quezon city", "taguig"],
    ["san juan", "manila", "antipolo"],
    ["muntinlupa", "las piñas", "paranaque"],
    ["caloocan", "valenzuela"],
  ],
  marikina: [
    ["marikina"],
    ["quezon city", "pasig", "san juan"],
    ["mandaluyong", "makati", "antipolo", "san mateo"],
    ["manila", "taguig"],
    ["caloocan", "valenzuela"],
  ],
  mandaluyong: [
    ["mandaluyong"],
    ["makati", "pasig", "quezon city", "san juan", "manila"],
    ["marikina", "taguig"],
    ["las piñas", "paranaque", "muntinlupa"],
    ["caloocan", "valenzuela"],
  ],
  "san juan": [
    ["san juan"],
    ["mandaluyong", "quezon city", "manila", "makati", "pasig"],
    ["marikina", "taguig"],
    ["caloocan", "valenzuela"],
    ["las piñas", "paranaque"],
  ],
  taguig: [
    ["taguig"],
    ["makati", "pasig", "muntinlupa", "paranaque"],
    ["mandaluyong", "quezon city", "marikina"],
    ["las piñas", "manila"],
    ["caloocan", "valenzuela"],
  ],
  "las piñas": [
    ["las piñas"],
    ["paranaque", "muntinlupa", "taguig"],
    ["makati", "pasig", "mandaluyong"],
    ["manila", "quezon city"],
    ["caloocan", "valenzuela"],
  ],
  paranaque: [
    ["paranaque"],
    ["las piñas", "taguig", "muntinlupa"],
    ["makati", "pasig"],
    ["manila", "quezon city"],
    ["caloocan", "valenzuela"],
  ],
  muntinlupa: [
    ["muntinlupa"],
    ["paranaque", "las piñas", "taguig"],
    ["makati", "pasig"],
    ["manila", "quezon city"],
    ["caloocan", "valenzuela"],
  ],
  // Bulacan towns near Valenzuela
  obando: [
    ["obando"],
    ["marilao", "bocaue", "meycauayan"],
    ["valenzuela", "caloocan", "malabon", "navotas"],
    ["quezon city", "manila"],
    ["san jose del monte"],
  ],
  marilao: [
    ["marilao"],
    ["obando", "bocaue", "meycauayan"],
    ["valenzuela", "caloocan"],
    ["quezon city", "manila"],
    ["san jose del monte"],
  ],
  meycauayan: [
    ["meycauayan"],
    ["marilao", "obando", "bocaue"],
    ["valenzuela", "caloocan"],
    ["san jose del monte"],
    ["quezon city", "manila"],
  ],
  bocaue: [
    ["bocaue"],
    ["marilao", "meycauayan", "obando"],
    ["valenzuela", "caloocan"],
    ["san jose del monte"],
    ["quezon city"],
  ],
  "san jose del monte": [
    ["san jose del monte"],
    ["meycauayan", "bocaue", "marilao"],
    ["quezon city", "caloocan"],
    ["valenzuela"],
    ["manila"],
  ],
  // Rizal / Cavite common additions
  antipolo: [
    ["antipolo"],
    ["marikina", "quezon city", "san mateo"],
    ["pasig", "mandaluyong"],
    ["manila", "makati"],
    ["caloocan", "valenzuela"],
  ],
  "san mateo": [
    ["san mateo"],
    ["antipolo", "marikina", "rodriguez"],
    ["quezon city", "pasig"],
    ["manila", "mandaluyong"],
    ["caloocan", "valenzuela"],
  ],
  rodriguez: [
    ["rodriguez"],
    ["san mateo", "antipolo"],
    ["quezon city", "marikina"],
    ["pasig", "mandaluyong"],
    ["manila", "caloocan"],
  ],
};

/**
 * Returns a proximity rank for a given pet city relative to the user's city.
 * Lower = closer. Same city = 0. Unknown = 99.
 */
export function getCityProximityRank(userCity: string, petCity: string): number {
  if (!userCity || !petCity) return 99;

  const userKey = userCity.trim().toLowerCase();
  const petKey  = petCity.trim().toLowerCase();

  if (userKey === petKey) return 0;

  const groups = NEIGHBOR_GROUPS[userKey];
  if (!groups) return 99;

  for (let i = 0; i < groups.length; i++) {
    if (groups[i].some((c) => petKey.includes(c) || c.includes(petKey))) {
      return i;
    }
  }

  return 99;
}

/**
 * Sorts an array of pets so that pets closest to the user's city come first.
 * Pets in the same city are placed at the very top.
 * Within the same proximity group, original order (newest first) is preserved.
 */
export function sortPetsByProximity<T extends { owner?: { city?: string } }>(
  pets: T[],
  userCity: string,
): T[] {
  if (!userCity.trim()) return pets;

  return [...pets].sort((a, b) => {
    const rankA = getCityProximityRank(userCity, a.owner?.city ?? "");
    const rankB = getCityProximityRank(userCity, b.owner?.city ?? "");
    return rankA - rankB;
  });
}
