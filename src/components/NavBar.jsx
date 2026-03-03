import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

function NavBar() {
  const { user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="pokedex-nav">
      <div className="nav-links">
        <Link
          className={`nav-link ${isActive("/") ? "nav-active" : ""}`}
          to="/"
        >
          Home
        </Link>
        {user && (
          <Link
            className={`nav-link ${isActive("/favorites") ? "nav-active" : ""}`}
            to="/favorites"
          >
            ♥ Favorites
          </Link>
        )}
      </div>

      <div className="nav-user">
        {user ? (
          <div className="user-info">
            <img
              className="nav-profile-icon"
              src={user.profileSprite}
              alt={user.favoritePokemon}
            />
            <span className="nav-username">{user.username}</span>
            <button className="nav-btn logout-btn" onClick={logout}>
              Log Out
            </button>
          </div>
        ) : (
          <button className="nav-btn login-btn" onClick={() => setAuthOpen(true)}>
            Log In / Sign Up
          </button>
        )}
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </nav>
  );
}

export default NavBar;
