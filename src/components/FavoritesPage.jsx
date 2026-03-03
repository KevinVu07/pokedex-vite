import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import PokemonList from "./PokemonList";
import Scroll from "./Scroll";
import ErrorBoundary from "./ErrorBoundary";

function FavoritesPage() {
  const { user } = useAuth();
  const { favorites } = useFavorites();

  if (!user) {
    return (
      <div className="tc pa3">
        <h2>Please log in to see your favorite Pokémon!</h2>
        <p style={{ fontSize: "4rem" }}>🔒</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="tc pa3">
        <h2>No favorites yet!</h2>
        <p style={{ fontSize: "1.2rem", color: "#666" }}>
          Click the ♥ on any Pokémon card to add it here.
        </p>
        <p style={{ fontSize: "4rem" }}>💔</p>
      </div>
    );
  }

  const pokemonObjects = favorites.map((name) => ({ name }));

  return (
    <div className="tc">
      <h2 className="favorites-heading">
        {user.username}&apos;s Favorite Pokémon ({favorites.length})
      </h2>
      <Scroll>
        <ErrorBoundary>
          <PokemonList pokemons={pokemonObjects} />
        </ErrorBoundary>
      </Scroll>
    </div>
  );
}

export default FavoritesPage;
