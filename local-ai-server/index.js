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
    const { prompt } = req.body;

    console.log("Prompt chars:", prompt.length);

    const start = Date.now();

    const response = await axios.post(
      "http://127.0.0.1:11434/api/generate",
      {
        model: "phi3",
        prompt,
        stream: false,
        keep_alive: "30m",
        options: {
          temperature: 0.7,
          num_ctx: 1024,
          num_predict: 60
        }
      }
    );

    console.log(
      "OLLAMA TIME:",
      ((Date.now() - start) / 1000).toFixed(1),
      "seconds"
    );

    res.json({
      reply: response.data.response
    });

 } catch (err) {
  console.error("FULL ERROR:", err);

  res.status(500).json({
    error: err.message,
    details: err.response?.data || null
  });
} 
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`LOCAL AI SERVER RUNNING ON http://localhost:${PORT}`);
});