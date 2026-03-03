import { useEffect, useState } from "react";
import PokemonCard from "./PokemonCard";
import { Link } from "react-router-dom";
import { fetchWithCache } from "../services/pokemonCache";

function EvolutionChain({ speciesUrl }) {
  const [evolutionChain, setEvolutionChain] = useState([]);

  useEffect(() => {
    async function fetchEvolutionChain() {
      try {
        const speciesData = await fetchWithCache(speciesUrl);
        const evolutionUrl = speciesData.evolution_chain.url;
        const evolutionData = await fetchWithCache(evolutionUrl);

        const chain = [];
        let current = evolutionData.chain;

        do {
          chain.push({
            name: current.species.name,
            id: current.species.url.split("/").slice(-2, -1)[0],
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
            <Link className="link" to={`/${pokemon.name}`}>
              <PokemonCard name={pokemon.name} className="pokemon-evolution-card" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EvolutionChain;
