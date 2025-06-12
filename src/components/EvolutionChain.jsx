import React, { useEffect, useState } from "react";
import PokemonCard from "./PokemonCard";
import { Link } from "react-router-dom";

function EvolutionChain({ speciesUrl }) {
  const [evolutionChain, setEvolutionChain] = useState([]);

  useEffect(() => {
    async function fetchEvolutionChain() {
      try {
        const speciesResponse = await fetch(speciesUrl);
        const speciesData = await speciesResponse.json();
        const evolutionUrl = speciesData.evolution_chain.url;

        const evolutionResponse = await fetch(evolutionUrl);
        const evolutionData = await evolutionResponse.json();

        const chain = [];
        let current = evolutionData.chain;

        do {
          chain.push({
            name: current.species.name,
            id: current.species.url.split("/").slice(-2, -1)[0], // Extracting the Pokémon ID from the URL
          });
          current = current.evolves_to[0];
        } while (current);

        setEvolutionChain(chain);
      } catch (error) {
        console.error("Error fetching evolution chain:", error);
      }
    }

    if (speciesUrl) {
      fetchEvolutionChain();
    }
  }, [speciesUrl]);

  return (
    <div className="evolution-chain">
      <h2>Evolutions</h2>
      <div className="evolution-container">
        {evolutionChain.map((pokemon) => (
          <div key={pokemon.name} className="evolution-item">
            <Link className="link" key={pokemon.name} to={`/${pokemon.name}`}>
              <PokemonCard name={pokemon.name} className="pokemon-evolution-card" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EvolutionChain;
