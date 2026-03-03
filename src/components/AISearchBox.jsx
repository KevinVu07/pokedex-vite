import { useState, useRef, useEffect } from "react";
import { aiSearchPokemon } from "../services/aiSearch";
import { checkRateLimit, recordUsage } from "../services/rateLimiter";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function AISearchBox({ onResults, onClear, isSearching: externalSearching }) {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(null);
  const recognitionRef = useRef(null);
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  useEffect(() => {
    setRemaining(checkRateLimit().remaining);
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  function startListening() {
    if (!SpeechRecognition) {
      setError("Voice search isn't supported in this browser. Try Chrome!");
      return;
    }

    setError("");
    setQuery("");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setQuery(transcript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === "no-speech") {
        setError("I didn't hear anything. Try again!");
      } else if (event.error === "not-allowed") {
        setError("Please allow microphone access to use voice search.");
      } else if (event.error !== "aborted") {
        setError("Oops, something went wrong with voice. Try typing instead!");
      }
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  function stopListening() {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  }

  async function handleSearch(text) {
    if (isListening) stopListening();

    const searchText = (text || query).trim();
    if (!searchText) return;

    if (!apiKey) {
      setError("AI search needs an OpenAI API key. Add VITE_OPENAI_API_KEY to your .env file.");
      return;
    }

    const limit = checkRateLimit();
    if (!limit.allowed) {
      setError(limit.message);
      setRemaining(0);
      return;
    }

    setError("");
    setIsThinking(true);

    try {
      const pokemonNames = await aiSearchPokemon(searchText, apiKey);
      recordUsage();
      setRemaining(checkRateLimit().remaining);
      onResults(pokemonNames);
    } catch (err) {
      setError(err.message || "Something went wrong with AI search.");
    } finally {
      setIsThinking(false);
    }
  }

  function handleClear() {
    if (isListening) stopListening();
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
        {remaining !== null && (
          <span className="ai-remaining">({remaining} searches left this hour)</span>
        )}
      </div>
      <div className="ai-search-row">
        <input
          className="ai-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Try "a fire dragon" or "cute pink pokemon"'
          disabled={isThinking}
        />

        <button
          className={`ai-mic-btn ${isListening ? "listening" : ""}`}
          onClick={isListening ? stopListening : startListening}
          title={isListening ? "Stop recording" : "Voice search"}
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
        <p className="ai-status listening-pulse">
          🎙️ Listening... press Search when you&apos;re done!
        </p>
      )}
      {isThinking && (
        <p className="ai-status">🤔 Asking AI about &quot;{query}&quot;...</p>
      )}
      {error && <p className="ai-error">{error}</p>}
    </div>
  );
}

export default AISearchBox;
