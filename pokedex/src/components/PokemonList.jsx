import React from "react";
import PokemonCard from "./PokemonCard.jsx";
import { Link } from "react-router-dom";

function PokemonList(props) {
  const pokemonArrays = props.pokemons.map((pokemon) => {
    return (
      <Link className="link" key={pokemon.name} to={`/${pokemon.name}`}>
        <PokemonCard name={pokemon.name} />
      </Link>
    );
  });
  return <div>{pokemonArrays}</div>;
}

export default PokemonList;
