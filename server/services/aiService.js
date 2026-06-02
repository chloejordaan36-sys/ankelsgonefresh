const axios = require("axios");

const OLLAMA_URL = process.env.OLLAMA_URL;

async function askAI(prompt) {
  try {
    console.log("Sending to Ollama...");

    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: "llama3.2:3b",
        prompt,
        stream: false
      },
      {
        timeout: 300000
      }
    );

    console.log("Ollama responded");

    return response.data.response;

  } catch (err) {
    console.error("❌ Ollama error:", err.message);
    return "AI temporarily overloaded. Try again.";
  }
}

module.exports = { askAI };