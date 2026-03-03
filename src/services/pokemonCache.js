const CACHE_PREFIX = "pokecache_";
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(key) {
  return `${CACHE_PREFIX}${key}`;
}

export function getCached(key) {
  try {
    const raw = localStorage.getItem(getCacheKey(key));
    if (!raw) return null;
    const { data, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) {
      localStorage.removeItem(getCacheKey(key));
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setCache(key, data, ttl = DEFAULT_TTL) {
  try {
    const entry = { data, expiry: Date.now() + ttl };
    localStorage.setItem(getCacheKey(key), JSON.stringify(entry));
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      clearExpiredCache();
      try {
        const entry = { data, expiry: Date.now() + ttl };
        localStorage.setItem(getCacheKey(key), JSON.stringify(entry));
      } catch {
        // Storage still full — silently skip caching
      }
    }
  }
}

export function clearExpiredCache() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      try {
        const { expiry } = JSON.parse(localStorage.getItem(key));
        if (Date.now() > expiry) keysToRemove.push(key);
      } catch {
        keysToRemove.push(key);
      }
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}

const POKEMON_API = "https://pokeapi.co/api/v2/";

export async function fetchWithCache(url, cacheKey) {
  const key = cacheKey || url;
  const cached = getCached(key);
  if (cached) return cached;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  setCache(key, data);
  return data;
}

export async function fetchPokemonList(limit, offset) {
  const key = `list_${limit}_${offset}`;
  return fetchWithCache(`${POKEMON_API}pokemon?limit=${limit}&offset=${offset}`, key);
}

export async function fetchPokemonByName(name) {
  const key = `pokemon_${name.toLowerCase()}`;
  return fetchWithCache(`${POKEMON_API}pokemon/${name}`, key);
}

export async function fetchAllPokemonNames() {
  const key = "all_pokemon_names";
  return fetchWithCache(`${POKEMON_API}pokemon?limit=1118`, key);
}

export async function fetchPokemonSpecies(nameOrUrl) {
  const url = nameOrUrl.startsWith("http")
    ? nameOrUrl
    : `${POKEMON_API}pokemon-species/${nameOrUrl}`;
  const key = `species_${nameOrUrl}`;
  return fetchWithCache(url, key);
}
