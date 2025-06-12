import "./App.css";
import { Link } from "react-router-dom";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./components/Home";
import Heading from "./components/Heading";
import PokemonDetail from "./components/PokemonDetail";

function App() {
  return (
    <Router basename="/">
      <div className="bg-light">
        <Link className="link heading-link" to="/">
          <Heading />
        </Link>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:name" element={<PokemonDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
