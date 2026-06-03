const axios = require("axios");

async function askAI(prompt) {
  try {
    const LOCAL_AI_URL =
      process.env.LOCAL_AI_URL;

    const response = await axios.post(
      `${LOCAL_AI_URL}/ask-ai`,
      { prompt },
      {
        timeout: 120000
      }
    );

    return response.data.reply;
  } catch (err) {
    console.error("LOCAL AI ERROR:", err.message);
    throw err;
  }
}

module.exports = { askAI };