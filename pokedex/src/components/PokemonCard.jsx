import React, { useState, useEffect } from "react";

function PokemonCard(props) {
  const POKEMON_API = "https://pokeapi.co/api/v2/";
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

  const [pokemonImg, setPokemonImg] = useState("");
  const [pokemonTypes, setPokemonTypes] = useState([]);

  useEffect(() => {
    async function getPokemonData() {
      const response = await fetch(`${POKEMON_API}pokemon/${props.name}`);
      const data = await response.json();
      setPokemonImg(data?.sprites?.other?.["official-artwork"]?.front_default);
      setPokemonTypes(data.types.map((typeInfo) => typeInfo.type.name));
    }

    if (props.name) {
      getPokemonData();
    }
  }, [props.name]); // Dependency array ensures the effect runs when `props.name` changes

  return (
    <div className="tc bg-light dib br3 pa3 ma2 grow bw2 shadow-5">
      {pokemonImg ? <img className="pokemonImg" src={pokemonImg} alt="pokemon" /> : <p>Loading...</p>}
      <div>
        {/* Check if name exists before rendering */}
        <h2>{props.name ? props.name[0].toUpperCase() + props.name.slice(1) : "Unknown Pokémon"}</h2>
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
