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

  function signup(username, password, favoritePokemon, spriteUrl) {
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
    const fallbackSprite = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png";
    const profileSprite = spriteUrl || fallbackSprite;

    users[normalizedUsername] = {
      password: btoa(password),
      favoritePokemon: pokemonName,
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
