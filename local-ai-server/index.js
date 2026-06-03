const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" })); // IMPORTANT: prevents payload crashes

// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("LOCAL AI SERVER RUNNING");
});

// MAIN AI ROUTE
app.post("/ask-ai", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    console.log("Incoming:", message);

    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3.2:3b",
      prompt: message,
      stream: false
    });

    return res.json({
      success: true,
      reply: response.data.response
    });

  } catch (err) {
    console.error("LOCAL AI ERROR:", err.message);
    return res.status(500).json({
      success: false,
      reply: "AI failed locally"
    });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`LOCAL AI SERVER RUNNING ON http://localhost:${PORT}`);
});