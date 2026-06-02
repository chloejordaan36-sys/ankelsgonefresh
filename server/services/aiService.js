const axios = require("axios");

async function askAI(prompt) {
  try {
    console.log("Sending to Ollama...");

    const response = await axios.post(
      "http://127.0.0.1:11434/api/generate",
      {
        model: "llama3.2:3b",
        prompt,
        stream: false
      },
      {
        timeout: 300000 // 5 minutes
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