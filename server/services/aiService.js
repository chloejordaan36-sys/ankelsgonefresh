const axios = require("axios");

// 🔥 GLOBAL CACHE
const cache = new Map();

async function askAI(prompt) {
  try {
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Prompt missing or invalid");
    }

    // ⚡ Cache
    if (cache.has(prompt)) {
      console.log("⚡ CACHE HIT");
      return cache.get(prompt);
    }

    const response = await axios.post(
      process.env.LOCAL_AI_URL,
      { prompt },
      {
        timeout: 300000
      }
    );

    const reply = response.data.reply || "No response";

    cache.set(prompt, reply);

    return reply;

  } catch (err) {
    console.error("LOCAL AI ERROR:");
    console.error("message:", err.message);
    console.error("code:", err.code);
    console.error("response:", err.response?.data);

    throw err;
  }
}

module.exports = { askAI };