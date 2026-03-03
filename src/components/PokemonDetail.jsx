import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PokemonCard from "./PokemonCard";
import EvolutionChain from "./EvolutionChain";
import TextToSpeech from "./TextToSpeech";
import { fetchPokemonByName, fetchPokemonSpecies } from "../services/pokemonCache";

function PokemonDetail() {
  const { name } = useParams();
  const [pokemonData, setPokemonData] = useState(null);
  const [pokemonFlavorText, setPokemonFlavorText] = useState(null);

  useEffect(() => {
    fetchPokemonByName(name)
      .then(setPokemonData)
      .catch((err) => console.error("Error fetching pokemon:", err));
  }, [name]);

  useEffect(() => {
    if (!pokemonData?.species?.url) return;

    fetchPokemonSpecies(pokemonData.species.url)
      .then((data) => {
        const entry = data.flavor_text_entries.find(
          (e) => e.language.name === "en"
        );
        if (entry) setPokemonFlavorText(entry.flavor_text);
      })
      .catch((err) => console.error("Error fetching species:", err));
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
              <strong>Abilities:</strong>{" "}
              {abilities.map((a) => a.ability.name).join(", ")}
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
      <EvolutionChain speciesUrl={pokemonData.species.url} />
    </div>
  );
}

export default PokemonDetail;
