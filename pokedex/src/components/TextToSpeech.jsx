import { useState, useEffect } from "react";

function TextToSpeech({ text, children }) {
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    // Load voices once the voices are available
    const handleVoicesChanged = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    // Add event listener when the voices change
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

    // Get voices immediately if they are already loaded
    const initialVoices = window.speechSynthesis.getVoices();
    if (initialVoices.length > 0) {
      setVoices(initialVoices);
    }

    // Cleanup on component unmount
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      // Cancel any ongoing speech synthesis
      window.speechSynthesis.cancel();
    };
  }, []);

  // Cancel speech when text changes (e.g., navigating to different Pokemon)
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [text]);

  const handleClick = () => {
    if (text && voices.length > 0) {
      // Select a voice in English
      const chosenVoice = voices.find((voice) => voice.lang.startsWith("en"));

      // Spell out the text letter by letter
      const spellText = text.split("").join(", ");
      const spellUtterance = new SpeechSynthesisUtterance(spellText);
      spellUtterance.voice = chosenVoice;
      spellUtterance.rate = 0.8; // Slower rate for spelling

      // Pronounce the whole text after spelling
      const pronounceUtterance = new SpeechSynthesisUtterance(text);
      pronounceUtterance.voice = chosenVoice;

      // Create a sequence of utterances
      spellUtterance.onend = () => {
        window.speechSynthesis.speak(pronounceUtterance);
      };

      window.speechSynthesis.speak(spellUtterance);
    }
  };

  return <span onClick={handleClick}>{children}</span>;
}

export default TextToSpeech;
