import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { fetchPokemonByName } from "../services/pokemonCache";

const TYPE_COLORS = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

function PokemonCard({ name }) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [pokemonImg, setPokemonImg] = useState("");
  const [pokemonTypes, setPokemonTypes] = useState([]);

  useEffect(() => {
    if (!name) return;
    let cancelled = false;

    fetchPokemonByName(name).then((data) => {
      if (cancelled) return;
      setPokemonImg(data?.sprites?.other?.["official-artwork"]?.front_default);
      setPokemonTypes(data.types.map((typeInfo) => typeInfo.type.name));
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [name]);

  function handleFavoriteClick(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(name);
  }

  const favorited = isFavorite(name);

  return (
    <div className="tc bg-light dib br3 pa3 ma2 grow bw2 shadow-5 pokemon-card-wrapper">
      {user && (
        <button
          className={`fav-heart ${favorited ? "fav-active" : ""}`}
          onClick={handleFavoriteClick}
          title={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          {favorited ? "♥" : "♡"}
        </button>
      )}
      {pokemonImg ? (
        <img className="pokemonImg" src={pokemonImg} alt={name} />
      ) : (
        <p>Loading...</p>
      )}
      <div>
        <h2>{name ? name[0].toUpperCase() + name.slice(1) : "Unknown Pokémon"}</h2>
        <div>
          {pokemonTypes.map((type) => (
            <span
              key={type}
              style={{
                backgroundColor: TYPE_COLORS[type],
                color: "white",
                padding: "5px 10px",
                borderRadius: "5px",
                margin: "0 5px",
              }}
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PokemonCard;
