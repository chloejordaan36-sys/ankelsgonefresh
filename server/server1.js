const cors = require("cors");

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

app.get("/", (req, res) => {
  res.send("ANKLES GONE AI ONLINE");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/ask-ai", aiRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("ANKLES GONE AI RUNNING ON", PORT);
});