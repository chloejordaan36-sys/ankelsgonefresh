const axios = require("axios");

// 🔥 GLOBAL CACHE (stays alive between requests)
const cache = new Map();

async function askAI(prompt) {
  try {
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Prompt missing or invalid");
    }

    // =========================
    // ⚡ CACHE CHECK (FAST LANE)
    // =========================
    if (cache.has(prompt)) {
      console.log("⚡ CACHE HIT");
      return cache.get(prompt);
    }

    const response = await axios.post(
      process.env.OLLAMA_URL || "http://localhost:11434/api/generate",
      {
        model: "llama3.2:3b",
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_ctx: 2048,
          num_predict: 150
        }
      },
      {
        timeout: 120000
      }
    );

    const reply = response.data.response || "No response";

    // =========================
    // 💾 SAVE TO CACHE
    // =========================
    cache.set(prompt, reply);

    return reply;

  } catch (err) {
    console.error("OLLAMA ERROR:", err.message);
    throw err;
  }
}

module.exports = { askAI };