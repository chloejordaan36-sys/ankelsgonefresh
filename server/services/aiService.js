const axios = require("axios");

const LOCAL_SERVER_URL = process.env.LOCAL_SERVER_URL;

if (!LOCAL_SERVER_URL) {
  throw new Error("LOCAL_SERVER_URL is missing");
}

if (prompt.length > 8000) {
  console.log("Prompt too large:", prompt.length);

  return "⚠️ Prompt too complex. Simplify request.";
}


async function askAI(prompt) {
  try {
    console.log("Calling LOCAL AI:", LOCAL_SERVER_URL);

    const response = await axios.post(
      `${LOCAL_SERVER_URL}/ask-ai`,
      {
        user_id: "railway",
        message: prompt
      },
      {
        timeout: 120000
      }
    );

    return response.data.reply;
  } catch (err) {
    console.error("AI ERROR:", err.message);
    return "AI temporarily unavailable. Try again.";
  }
}

module.exports = { askAI };