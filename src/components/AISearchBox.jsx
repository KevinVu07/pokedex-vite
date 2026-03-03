import { useState, useRef, useEffect } from "react";
import { aiSearchPokemon } from "../services/aiSearch";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function AISearchBox({ onResults, onClear, isSearching: externalSearching }) {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  function startListening() {
    if (!SpeechRecognition) {
      setError("Voice search isn't supported in this browser. Try Chrome!");
      return;
    }

    setError("");
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
      handleSearch(transcript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === "no-speech") {
        setError("I didn't hear anything. Try again!");
      } else if (event.error === "not-allowed") {
        setError("Please allow microphone access to use voice search.");
      } else {
        setError("Oops, something went wrong with voice. Try typing instead!");
      }
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }

  async function handleSearch(text) {
    const searchText = text || query;
    if (!searchText.trim()) return;

    if (!apiKey) {
      setError("AI search needs an OpenAI API key. Add VITE_OPENAI_API_KEY to your .env file.");
      return;
    }

    setError("");
    setIsThinking(true);

    try {
      const pokemonNames = await aiSearchPokemon(searchText, apiKey);
      onResults(pokemonNames);
    } catch (err) {
      setError(err.message || "Something went wrong with AI search.");
    } finally {
      setIsThinking(false);
    }
  }

  function handleClear() {
    setQuery("");
    setError("");
    onClear();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  }

  return (
    <div className="ai-search-container">
      <div className="ai-search-label">
        <span className="ai-badge">✨ AI</span>
        <span>Ask me about any Pokémon!</span>
      </div>
      <div className="ai-search-row">
        <input
          className="ai-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Try "a fire dragon" or "cute pink pokemon"'
          disabled={isThinking || isListening}
        />

        <button
          className={`ai-mic-btn ${isListening ? "listening" : ""}`}
          onClick={isListening ? stopListening : startListening}
          title={isListening ? "Stop listening" : "Voice search"}
          disabled={isThinking}
        >
          {isListening ? "⏹️" : "🎤"}
        </button>

        <button
          className="ai-search-btn"
          onClick={() => handleSearch()}
          disabled={isThinking || !query.trim()}
        >
          {isThinking ? "Thinking..." : "Search"}
        </button>

        {(query || externalSearching) && (
          <button className="ai-clear-btn" onClick={handleClear} disabled={isThinking}>
            Clear
          </button>
        )}
      </div>

      {isListening && (
        <p className="ai-status listening-pulse">🎙️ Listening... speak now!</p>
      )}
      {isThinking && (
        <p className="ai-status">🤔 Asking AI about &quot;{query}&quot;...</p>
      )}
      {error && <p className="ai-error">{error}</p>}
    </div>
  );
}

export default AISearchBox;
