import "./App.css";
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import Home from "./components/Home";
import Heading from "./components/Heading";
import PokemonDetail from "./components/PokemonDetail";
import FavoritesPage from "./components/FavoritesPage";
import NavBar from "./components/NavBar";

function App() {
  return (
    <Router basename="/">
      <AuthProvider>
        <FavoritesProvider>
          <div className="bg-light">
            <NavBar />
            <Link className="link heading-link" to="/">
              <Heading />
            </Link>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/:name" element={<PokemonDetail />} />
            </Routes>
          </div>
        </FavoritesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
