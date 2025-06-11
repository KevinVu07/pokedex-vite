import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PokemonCard from "./PokemonCard";
import EvolutionChain from "./EvolutionChain";
import TextToSpeech from "./TextToSpeech";

function PokemonDetail() {
  const { name } = useParams(); // Extract the Pokémon name from the URL
  const POKEMON_API = "https://pokeapi.co/api/v2/";
  const [pokemonData, setPokemonData] = useState(null);
  const [pokemonFlavorText, setPokemonFlavorText] = useState(null);

  // fetch pokemon data
  useEffect(() => {
    async function fetchPokemonData() {
      const response = await fetch(`${POKEMON_API}pokemon/${name}`);
      const data = await response.json();
      setPokemonData(data);
    }
    fetchPokemonData();
  }, [name]);

  useEffect(() => {
    if (pokemonData?.species?.url) {
      async function fetchPokemonFlavorText() {
        const speciesUrl = pokemonData.species.url;
        const response = await fetch(speciesUrl);
        const data = await response.json();
        const flavorTextEntries = data.flavor_text_entries;

        // Find the first flavor text entry in English
        const flavorTextChosenObj = flavorTextEntries.find((entry) => entry.language.name === "en");

        if (flavorTextChosenObj) {
          const flavorText = flavorTextChosenObj.flavor_text;
          setPokemonFlavorText(flavorText);
        } else {
          console.log("No English flavor text found.");
        }
      }
      fetchPokemonFlavorText();
    }
  }, [pokemonData?.species?.url]);

  if (!pokemonData) {
    return <p>Loading...</p>;
  }

  const { height, weight, abilities, stats } = pokemonData;

  return (
    <div className="container mt-5">
      <div className="pokemon-header text-center mb-4">
        <h1 className="pokemonNameDetail">
          <TextToSpeech text={name}>
            <button type="button" className="btn btn-light">
              🔊
            </button>
          </TextToSpeech>
          {name[0].toUpperCase() + name.slice(1)} #{pokemonData.id}
        </h1>
      </div>
      <div className="row">
        <div className="col-md-6 text-center">
          <PokemonCard name={name} />
        </div>
        <div className="col-md-6">
          <div className="pokemon-info mb-3">
            <p className="fw-bold .text-wrap">{pokemonFlavorText}</p>
            <p>
              <strong>Height:</strong> {height * 10} cm
            </p>
            <p>
              <strong>Weight:</strong> {Math.round(weight / 2.205)} kgs
            </p>
            <p>
              <strong>Abilities:</strong> {abilities.map((a) => a.ability.name).join(", ")}
            </p>
          </div>
          <div className="pokemon-stats">
            <h3>Stats</h3>
            <ul>
              {stats.map((statInfo) => (
                <li key={statInfo.stat.name}>
                  {statInfo.stat.name}: {statInfo.base_stat}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Evolution Chain Component */}
      <EvolutionChain speciesUrl={pokemonData.species.url} />
    </div>
  );
}

export default PokemonDetail;
