import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext(null);

const FAVORITES_PREFIX = "pokedex_favs_";

function getFavoritesKey(username) {
  return `${FAVORITES_PREFIX}${username}`;
}

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (user) {
      try {
        const stored = JSON.parse(localStorage.getItem(getFavoritesKey(user.username))) || [];
        setFavorites(stored);
      } catch {
        setFavorites([]);
      }
    } else {
      setFavorites([]);
    }
  }, [user]);

  const persist = useCallback(
    (newFavs) => {
      if (user) {
        localStorage.setItem(getFavoritesKey(user.username), JSON.stringify(newFavs));
      }
    },
    [user]
  );

  const toggleFavorite = useCallback(
    (pokemonName) => {
      if (!user) return;
      setFavorites((prev) => {
        const name = pokemonName.toLowerCase();
        const next = prev.includes(name)
          ? prev.filter((n) => n !== name)
          : [...prev, name];
        persist(next);
        return next;
      });
    },
    [user, persist]
  );

  const isFavorite = useCallback(
    (pokemonName) => favorites.includes(pokemonName?.toLowerCase()),
    [favorites]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
