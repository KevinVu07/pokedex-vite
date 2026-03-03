import { useState, useEffect } from "react";
import PokemonList from "./PokemonList";
import SearchBox from "./SearchBox";
import AISearchBox from "./AISearchBox";
import Scroll from "./Scroll";
import ErrorBoundary from "./ErrorBoundary";
import { debounce } from "lodash-es";
import {
  fetchPokemonList,
  fetchPokemonByName,
  fetchAllPokemonNames,
} from "../services/pokemonCache";

function Home() {
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredPokemonList, setFilteredPokemonList] = useState([]);
  const [allPokemonName, setAllPokemonName] = useState([]);
  const [searchfield, setSearchfield] = useState("");
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isAISearching, setIsAISearching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pokemonsLimitPerPage = 151;

  useEffect(() => {
    fetchAllPokemonNames().then((data) => {
      setAllPokemonName(data.results.map((p) => p.name));
    }).catch((err) => console.error("Error fetching all Pokémon names:", err));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchPokemonList(pokemonsLimitPerPage, 0)
      .then((data) => setPokemonList(data.results))
      .catch((err) => console.error("Error fetching initial Pokémon:", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (offset === 0) return;
    setIsLoading(true);
    fetchPokemonList(pokemonsLimitPerPage, offset)
      .then((data) => {
        setPokemonList((prev) => [...prev, ...data.results]);
        if (data.results.length < pokemonsLimitPerPage) setHasMore(false);
      })
      .catch((err) => console.error("Error fetching more Pokémon:", err))
      .finally(() => setIsLoading(false));
  }, [offset]);

  const onSearchChange = debounce(async (event) => {
    const value = event.target.value;
    setSearchfield(value);

    if (value === "") {
      setFilteredPokemonList([]);
      setIsSearching(false);
      setIsAISearching(false);
      return;
    }

    setIsSearching(true);
    setIsAISearching(false);

    const filteredNames = allPokemonName.filter((n) =>
      n.toLowerCase().includes(value.toLowerCase())
    );

    const fetchedPokemons = await Promise.all(
      filteredNames.map((name) =>
        fetchPokemonByName(name).catch(() => null)
      )
    );

    setFilteredPokemonList(fetchedPokemons.filter(Boolean));
    setIsSearching(false);
  }, 500);

  async function handleAIResults(pokemonNames) {
    setIsAISearching(true);
    setSearchfield("__ai__");
    setIsSearching(true);

    const fetched = await Promise.all(
      pokemonNames.map((name) => fetchPokemonByName(name).catch(() => null))
    );

    setFilteredPokemonList(fetched.filter(Boolean));
    setIsSearching(false);
  }

  function handleAIClear() {
    setFilteredPokemonList([]);
    setSearchfield("");
    setIsSearching(false);
    setIsAISearching(false);
  }

  const displayPokemons = searchfield ? filteredPokemonList : pokemonList;

  const loadMorePokemons = () => {
    setOffset((prev) => prev + pokemonsLimitPerPage);
  };

  return (
    <div className="tc">
      <SearchBox searchChange={onSearchChange} />
      <AISearchBox
        onResults={handleAIResults}
        onClear={handleAIClear}
        isSearching={isAISearching}
      />
      <Scroll>
        <ErrorBoundary>
          {displayPokemons && displayPokemons.length > 0 ? (
            <PokemonList pokemons={displayPokemons} />
          ) : (
            <h2>
              {searchfield
                ? isSearching
                  ? "Searching for Pokémon..."
                  : "No Pokémon match your search!"
                : "Loading Pokémon..."}
            </h2>
          )}
        </ErrorBoundary>
        {!searchfield && hasMore && (
          <button
            className="btn btn-outline-success mt-4 mb-4"
            onClick={loadMorePokemons}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More Pokémon"}
          </button>
        )}
      </Scroll>
    </div>
  );
}

export default Home;
