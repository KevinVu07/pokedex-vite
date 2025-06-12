import "./App.css";
import { Link } from "react-router-dom";
import { useState } from "react";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./components/Home";
import Heading from "./components/Heading";
import PokemonDetail from "./components/PokemonDetail";

function App() {
  const [homeKey, setHomeKey] = useState(0);

  const handleHeadingClick = () => {
    // Force Home component to remount by changing its key
    setHomeKey(prev => prev + 1);
  };

  return (
    <Router basename="/">
      <div className="bg-light">
        <Link className="link heading-link" to="/" onClick={handleHeadingClick}>
          <Heading />
        </Link>
        <Routes>
          <Route path="/" element={<Home key={homeKey} />} />
          <Route path="/:name" element={<PokemonDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
