const OPENAI_SYSTEM_PROMPT = `You are a helpful Pokémon expert assistant for kids. 
Given a child's description of a Pokémon (which may have imperfect grammar or spelling), 
return ONLY a JSON array of Pokémon names that match the description.

Rules:
- Return at most 20 Pokémon names.
- Use lowercase names only (e.g. "pikachu", not "Pikachu").
- Use the official English names from the PokéAPI.
- If the description mentions a type (like "fire", "water", "electric"), include popular Pokémon of that type.
- If the description mentions physical traits (like "looks like a mouse", "has wings"), use your knowledge to match.
- Be generous with matches — kids are exploring and want to discover Pokémon.
- If you truly cannot identify any match, return ["pikachu"] as a friendly default.
- Return ONLY the JSON array, no other text.`;

export async function aiSearchPokemon(query, apiKey) {
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured. Add VITE_OPENAI_API_KEY to your .env file.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: OPENAI_SYSTEM_PROMPT },
        { role: "user", content: query },
      ],
      temperature: 0.3,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();

  try {
    const names = JSON.parse(content);
    if (Array.isArray(names)) return names.map((n) => n.toLowerCase());
  } catch {
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const names = JSON.parse(match[0]);
        if (Array.isArray(names)) return names.map((n) => n.toLowerCase());
      } catch {
        // fall through
      }
    }
  }

  return ["pikachu"];
}
