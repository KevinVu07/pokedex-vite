import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const USERS_KEY = "pokedex_users";
const SESSION_KEY = "pokedex_session";

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      const users = getUsers();
      if (users[session]) {
        setUser({ username: session, ...users[session] });
      }
    }
  }, []);

  function signup(username, password, favoritePokemon) {
    const users = getUsers();
    const normalizedUsername = username.toLowerCase().trim();

    if (!normalizedUsername || normalizedUsername.length < 2) {
      return { ok: false, error: "Username must be at least 2 characters" };
    }
    if (!password || password.length < 4) {
      return { ok: false, error: "Password must be at least 4 characters" };
    }
    if (users[normalizedUsername]) {
      return { ok: false, error: "That username is already taken!" };
    }

    const pokemonName = (favoritePokemon || "pikachu").toLowerCase().trim();
    const profileImg = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${getPokemonIdFromName(pokemonName)}.png`;
    const profileSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonIdFromName(pokemonName)}.png`;

    users[normalizedUsername] = {
      password: btoa(password),
      favoritePokemon: pokemonName,
      profileImg,
      profileSprite,
    };
    saveUsers(users);

    localStorage.setItem(SESSION_KEY, normalizedUsername);
    setUser({ username: normalizedUsername, ...users[normalizedUsername] });
    return { ok: true };
  }

  function login(username, password) {
    const users = getUsers();
    const normalizedUsername = username.toLowerCase().trim();
    const userData = users[normalizedUsername];

    if (!userData) {
      return { ok: false, error: "Username not found" };
    }
    if (atob(userData.password) !== password) {
      return { ok: false, error: "Incorrect password" };
    }

    localStorage.setItem(SESSION_KEY, normalizedUsername);
    setUser({ username: normalizedUsername, ...userData });
    return { ok: true };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

const KNOWN_POKEMON_IDS = {
  bulbasaur: 1, ivysaur: 2, venusaur: 3, charmander: 4, charmeleon: 5,
  charizard: 6, squirtle: 7, wartortle: 8, blastoise: 9, caterpie: 10,
  pikachu: 25, raichu: 26, jigglypuff: 39, meowth: 52, psyduck: 54,
  growlithe: 58, machop: 66, geodude: 74, gengar: 94, onix: 95,
  eevee: 133, snorlax: 143, mewtwo: 150, mew: 151, chikorita: 152,
  cyndaquil: 155, totodile: 158, pichu: 172, togepi: 175, mudkip: 258,
  torchic: 255, treecko: 252, lucario: 448, garchomp: 445, greninja: 658,
};

function getPokemonIdFromName(name) {
  return KNOWN_POKEMON_IDS[name.toLowerCase()] || 25; // default to pikachu sprite
}
