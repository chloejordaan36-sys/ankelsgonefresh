const axios = require("axios");

const OLLAMA_URL = process.env.OLLAMA_URL;

async function askAI(prompt) {
  try {
    console.log("==================================");
    console.log("OLLAMA_URL:", OLLAMA_URL);
    console.log("Sending to Ollama...");
    console.log("==================================");

    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: "llama3.2:3b",
        prompt,
        stream: false
      },
      {
        timeout: 300000,
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      }
    );

    console.log("Ollama responded");

    return response.data.response;

  } catch (err) {
    console.error("❌ Ollama error:", err.message);

    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    }

    return "AI temporarily overloaded. Try again.";
  }
}

module.exports = { askAI };