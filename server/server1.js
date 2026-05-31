const db = require("./db");

db.run(`
CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user TEXT,
  position TEXT,
  height TEXT,
  weight TEXT,
  age INTEGER,
  dominant_hand TEXT,
  skill_level TEXT,
  strengths TEXT,
  weaknesses TEXT,
  goal TEXT,
  created_at TEXT
)
`);
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();

const [dominantHand, setDominantHand] = useState("");
const [skillLevel, setSkillLevel] = useState("");

const PORT = process.env.PORT || 3000;
const OLLAMA_URL =
  process.env.OLLAMA_URL ||
  "http://127.0.0.1:11434/api/generate";

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());

app.use(
  express.json({
    limit: "2mb",
  })
);

/* =========================
   DATABASE SETUP
========================= */

const dbFolder = path.join(__dirname, "../database");

if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true });
}

const dbPath = path.join(dbFolder, "database.db");

const db = new sqlite3.Database(dbPath);

/* =========================
   TABLES
========================= */

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      sport TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT,
      message TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS long_term_memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT,
      type TEXT,
      content TEXT,
      importance INTEGER DEFAULT 1,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
   CREATE TABLE IF NOT EXISTS player_progress (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     user TEXT,
     skill TEXT,
     value INTEGER,
     notes TEXT,
     timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);
});

db.run(`
  CREATE TABLE IF NOT EXISTS player_profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT UNIQUE,
    position TEXT,
    height TEXT,
    weight TEXT,
    age INTEGER,
    dominant_hand TEXT,
    skill_level TEXT,
    strengths TEXT,
    weaknesses TEXT,
    goal TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

/* =========================
   SYSTEM PERSONALITY (UPGRADED)
========================= */

const systemPersonality = `
You are ANKLES GONE AI.

You are a hybrid basketball intelligence system.

CORE IDENTITY:
- Basketball coach + streetball legend
- Train players AND hype them up
- Never boring, never neutral

MODES:

1. TRAINING MODE:
- strict coaching
- drills, discipline, fundamentals
- no excuses attitude

2. STREETBALL MODE:
- hype, trash talk, confidence
- short explosive lines
- slang like "cook him", "he’s cooked", "no mercy"

3. HYBRID MODE:
- mix coaching + hype (DEFAULT)

4. GAME DAY MODE:
- maximum confidence
- intense focus
- motivational
- pre-game speeches
- help players handle pressure

RULES:
- Always basketball language
- Max 120 words
- Always push improvement or confidence
- Never break character
`;

/* =========================
   ROOT
========================= */

app.get("/", (req, res) => {
  res.send("ANKLES GONE AI SERVER LIVE 🚀");
});

app.get("/health", async (req, res) => {
  try {
    const ollamaCheck = await axios.get(
      "http://127.0.0.1:11434/api/tags",
      { timeout: 5000 }
    );

    res.json({
      status: "online",
      database: "connected",
      ollama: "connected",
      models: ollamaCheck.data.models?.length || 0,
    });
  } catch {
    res.json({
      status: "online",
      database: "connected",
      ollama: "offline",
    });
  }
});

/* =========================
   MEMORY HELPERS
========================= */

function getShortMemory(user) {
  return new Promise((resolve) => {
    db.all(
      `
      SELECT message FROM memory
      WHERE user = ?
      ORDER BY id DESC
      LIMIT 5
      `,
      [user],
      (err, rows) => {
        if (err || !rows) return resolve("");

        resolve(rows.reverse().map(r => r.message).join("\n"));
      }
    );
  });
}

function getLongMemory(user) {
  return new Promise((resolve) => {
    db.all(
      `
      SELECT type, content FROM long_term_memory
      WHERE user = ?
      ORDER BY importance DESC
      LIMIT 10
      `,
      [user],
      (err, rows) => {
        if (err || !rows) return resolve("");

        resolve(rows.map(r => `[${r.type}] ${r.content}`).join("\n"));
      }
    );
  });
}

function getPlayerProfile(user) {
  return new Promise((resolve) => {
    db.get(
      `
      SELECT *
      FROM player_profile
      WHERE user = ?
      `,
      [user],
      (err, row) => {
        if (err || !row) return resolve("");

        resolve(`
Position: ${row.position || ""}
Height: ${row.height || ""}
Weight: ${row.weight || ""}
Age: ${row.age || ""}
Dominant Hand: ${row.dominant_hand || ""}
Skill Level: ${row.skill_level || ""}
Strengths: ${row.strengths || ""}
Weaknesses: ${row.weaknesses || ""}
Goal: ${row.goal || ""}
        `);
      }
    );
  });
}

function getPlayerProgress(user) {
  return new Promise((resolve) => {
    db.all(
      `
      SELECT skill, value, notes
      FROM player_progress
      WHERE user = ?
      ORDER BY timestamp DESC
      LIMIT 20
      `,
      [user],
      (err, rows) => {
        if (err || !rows) return resolve("");

        resolve(
          rows
            .map(
              (r) =>
                `${r.skill}: ${r.value}/10 ${r.notes || ""}`
            )
            .join("\n")
        );
      }
    );
  });
}

/* =========================
   AI ENDPOINT (UPGRADED)
========================= */

app.post("/generate-workout", async (req, res) => {
  try {
    const { user } = req.body;

    const playerProfile =
      await getPlayerProfile(user);

    const longMemory =
      await getLongMemory(user);

    const progressData =
      await getPlayerProgress(user);

    const workoutPrompt = `
You are an elite basketball development coach.

PLAYER PROFILE:
${playerProfile}

PLAYER PROGRESS:
${progressData}

LONG TERM GOALS:
${longMemory}

Create a 60-minute basketball workout.

Include:

1. Warmup
2. Ball Handling
3. Finishing
4. Shooting
5. Defense
6. Conditioning

Make it specific to the player.
`;

    const response = await axios.post(
      OLLAMA_URL,
      {
        model: "gemma:2b",
        stream: false,
        prompt: workoutPrompt,
      }
    );

    res.json({
      success: true,
      workout: response.data.response,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.post("/ask-ai", async (req, res) => {
  try {
    const { user, message, mode, personality } = req.body;

    if (!user || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing user or message",
      });
    }

    const shortMemory = await getShortMemory(user);
    const longMemory = await getLongMemory(user);
    const playerProfile = await getPlayerProfile(user);
    const progressData =
      await getPlayerProgress(user); 

    /* =========================
       AUTO MODE DETECTION
    ========================= */

    let detectedMode = mode || "HYBRID MODE";

    const lower = message.toLowerCase();

    if (
      lower.includes("game day") ||
      lower.includes("big game") ||
      lower.includes("tip off") ||
      lower.includes("match today") ||
      lower.includes("playoffs")
) {
  detectedMode = "GAME DAY MODE";
}

    if (
      lower.includes("train me") ||
      lower.includes("workout") ||
      lower.includes("drill")
    ) {
      detectedMode = "TRAINING MODE";
    }

    if (
      lower.includes("cook") ||
      lower.includes("streetball") ||
      lower.includes("trash")
    ) {
      detectedMode = "STREETBALL MODE";
    }

    /* =========================
       OLLAMA CALL
    ========================= */

    const ollamaResponse = await axios.post(
      OLLAMA_URL,
      {
        model: "gemma:2b",
        stream: false,
        keep_alive: "24h",

        options: {
          temperature: 0.7,
          num_predict: 100,
          top_p: 0.9,
          top_k: 40,
        },

prompt: `
${systemPersonality}

ACTIVE MODE:
${detectedMode}

PLAYER PROFILE:
${playerProfile}

IMPORTANT:
You MUST coach this player based on
their position, strengths,
weaknesses, age and goals.

Never give generic advice.

Always mention at least one item
from the player profile.

PERSONALITY:
${personality || "basketball_street_coach"}

PLAYER PROGRESS:
${progressData}

LONG MEMORY:
${longMemory}

SHORT MEMORY:
${shortMemory}

USER:
${message}

Respond strictly in ACTIVE MODE style.
        `,
      },
      { timeout: 120000 }
    );

    const aiReply =
      ollamaResponse.data.response?.trim() ||
      "Lock in. No excuses.";

    /* =========================
       SAVE MEMORY
    ========================= */

    db.run(
      `INSERT INTO memory (user, message) VALUES (?, ?)`,
      [user, `USER: ${message} | AI: ${aiReply}`]
    );

    const low = message.toLowerCase();

    if (
      low.includes("i am") ||
      low.includes("i play") ||
      low.includes("my goal") ||
      low.includes("i want")
    ) {
      db.run(
        `INSERT INTO long_term_memory (user, type, content, importance)
         VALUES (?, ?, ?, ?)`,
        [user, "identity", message, 5]
      );
    }

    /* =========================
       RESPONSE
    ========================= */

    res.json({
      success: true,
      reply: aiReply,
      mode: detectedMode,
    });

  } catch (err) {
    console.log("🔥 ERROR:", err.message);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/* =========================
   PLAYER PROFILE
========================= */

app.post("/profile", (req, res) => {
  const {
    user,
    position,
    height,
    weight,
    age,
    dominant_hand,
    skill_level,
    strengths,
    weaknesses,
    goal
  } = req.body;

  if (!user) {
    return res.status(400).json({
      success: false,
      error: "User is required"
    });
  }

  db.run(
    `
    INSERT OR REPLACE INTO player_profile (
      user,
      position,
      height,
      weight,
      age,
      dominant_hand,
      skill_level,
      strengths,
      weaknesses,
      goal
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      user,
      position,
      height,
      weight,
      age,
      dominant_hand,
      skill_level,
      strengths,
      weaknesses,
      goal
    ],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message
        });
      }

      res.json({
        success: true,
        message: "Profile saved"
      });
    }
  );
});

app.get("/profile/:user", (req, res) => {
  db.get(
    `
    SELECT *
    FROM player_profile
    WHERE user = ?
    `,
    [req.params.user],
    (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message
        });
      }

      res.json(row || {});
    }
  );
});

/* =========================
   USERS
========================= */

app.post("/add-user", (req, res) => {
  const { name, sport } = req.body;

  db.run(
    "INSERT INTO users (name, sport) VALUES (?, ?)",
    [name, sport],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({ success: true, id: this.lastID });
    }
  );
});

app.get("/users", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/progress", (req, res) => {
  const { user, skill, value, notes } = req.body;

  db.run(
    `
    INSERT INTO player_progress
    (user, skill, value, notes)
    VALUES (?, ?, ?, ?)
    `,
    [user, skill, value, notes || ""],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        id: this.lastID,
      });
    }
  );
});

app.get("/progress/:user", (req, res) => {
  db.all(
    `
    SELECT *
    FROM player_progress
    WHERE user = ?
    ORDER BY timestamp DESC
    `,
    [req.params.user],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json(rows);
    }
  );
});

/* =========================
   MEMORY CLEAR
========================= */

app.delete("/memory/:user", (req, res) => {
  const user = req.params.user;

  db.run("DELETE FROM memory WHERE user = ?", [user]);
  db.run("DELETE FROM long_term_memory WHERE user = ?", [user]);

  res.json({
    success: true,
    message: "Memory cleared",
  });
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, "0.0.0.0", () => {
  console.log(`
🚀 ANKLES GONE AI SERVER LIVE
PORT: ${PORT}
MODE: HYBRID COACH + STREETBALL AI
STATUS: READY
  `);
});