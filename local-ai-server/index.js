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

    const response = await axios.post(
      "http://127.0.0.1:11434/api/generate",
    {
  model: "llama3.2:3b",
  prompt,
  stream: false,
  options: {
    temperature: 0.7,
    num_ctx: 2048,   // 🔥 LIMIT CONTEXT SIZE
    num_predict: 150 // 🔥 LIMIT RESPONSE LENGTH
  }
}  
    );

    res.json({
      reply: response.data.response
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`LOCAL AI SERVER RUNNING ON http://localhost:${PORT}`);
});