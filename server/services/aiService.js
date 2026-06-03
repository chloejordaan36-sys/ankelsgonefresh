const axios = require("axios");

const OLLAMA_URL = process.env.OLLAMA_URL;

if (!OLLAMA_URL) {
throw new Error("OLLAMA_URL is missing");
}

async function askAI(prompt) {
const start = Date.now();

try {
console.log("OLLAMA_URL =", OLLAMA_URL);
console.log("Sending prompt to Ollama...");

  const response = await axios.post(
    `${OLLAMA_URL}/api/generate`,
    {
      model: process.env.MODEL_NAME || "llama3.2:3b",
      prompt,
      stream: false,
    },
    {
      timeout: 300000,
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    }
  );

  const seconds = ((Date.now() - start) / 1000).toFixed(1);

  console.log(`✅ Ollama finished in ${seconds}s`);

  return response.data.response;
} catch (err) {
  const seconds = ((Date.now() - start) / 1000).toFixed(1);

  console.error(`❌ Ollama failed after ${seconds}s`);
  console.error(err.message);

  throw err;
}
}

module.exports = { askAI };
