const axios = require("axios");

const LOCAL_SERVER_URL = process.env.LOCAL_SERVER_URL;

if (!LOCAL_SERVER_URL) {
  throw new Error("LOCAL_SERVER_URL is missing in Railway env");
}

async function askAI(prompt) {
  try {
    console.log("Calling LOCAL AI server:", LOCAL_SERVER_URL);

    const response = await axios.post(
      `${LOCAL_SERVER_URL}/ask-ai`,
      {
        user_id: "railway",
        message: prompt
      },
      {
        timeout: 300000,
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      }
    );

    // your local server returns { success, reply }
    return response.data.reply;
  } catch (err) {
    console.error("❌ Railway → Local AI failed:", err.message);
    return "AI temporarily overloaded. Try again.";
  }
}

module.exports = { askAI };