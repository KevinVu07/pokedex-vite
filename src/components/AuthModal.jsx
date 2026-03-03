import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchAllPokemonNames } from "../services/pokemonCache";

function AuthModal({ isOpen, onClose }) {
  const { signup, login } = useAuth();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [favPokemon, setFavPokemon] = useState("");
  const [pokemonSuggestions, setPokemonSuggestions] = useState([]);
  const [allNames, setAllNames] = useState([]);
  const [error, setError] = useState("");
  const [previewSprite, setPreviewSprite] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchAllPokemonNames().then((data) => {
        setAllNames(data.results.map((p) => p.name));
      });
      setError("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (favPokemon.length > 1) {
      const matches = allNames
        .filter((n) => n.startsWith(favPokemon.toLowerCase()))
        .slice(0, 5);
      setPokemonSuggestions(matches);
    } else {
      setPokemonSuggestions([]);
    }
  }, [favPokemon, allNames]);

  useEffect(() => {
    if (favPokemon && allNames.includes(favPokemon.toLowerCase())) {
      const name = favPokemon.toLowerCase();
      const idx = allNames.indexOf(name);
      const id = idx >= 0 ? idx + 1 : 25;
      setPreviewSprite(
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
      );
    } else {
      setPreviewSprite("");
    }
  }, [favPokemon, allNames]);

  function getIdByName(name) {
    const idx = allNames.indexOf(name.toLowerCase());
    return idx >= 0 ? idx + 1 : 25;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      const result = signup(username, password, favPokemon || "pikachu");
      if (!result.ok) {
        setError(result.error);
        return;
      }
    } else {
      const result = login(username, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
    }
    resetAndClose();
  }

  function resetAndClose() {
    setUsername("");
    setPassword("");
    setFavPokemon("");
    setError("");
    setPokemonSuggestions([]);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="auth-overlay" onClick={resetAndClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={resetAndClose}>
          &times;
        </button>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Log In
          </button>
          <button
            className={`auth-tab ${mode === "signup" ? "active" : ""}`}
            onClick={() => { setMode("signup"); setError(""); }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Username</label>
          <input
            ref={inputRef}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a cool trainer name!"
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Secret password"
            required
          />

          {mode === "signup" && (
            <div className="fav-pokemon-field">
              <label>Favorite Pokémon (for your profile icon!)</label>
              <div className="fav-pokemon-input-row">
                <input
                  type="text"
                  value={favPokemon}
                  onChange={(e) => setFavPokemon(e.target.value)}
                  placeholder="e.g. pikachu"
                />
                {previewSprite && (
                  <img
                    className="profile-preview"
                    src={previewSprite}
                    alt="profile preview"
                  />
                )}
              </div>
              {pokemonSuggestions.length > 0 && (
                <ul className="pokemon-suggestions">
                  {pokemonSuggestions.map((name) => (
                    <li
                      key={name}
                      onClick={() => {
                        setFavPokemon(name);
                        setPokemonSuggestions([]);
                      }}
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit">
            {mode === "login" ? "Let's Go!" : "Create Account!"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;
