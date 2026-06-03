const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");

const { getMemory, getLongMemory } = require("../services/memoryService");
const { askAI } = require("../services/aiService");

const buildCoachPrompt = require("../utils/coachPrompt");
const updateSkills = require("../services/skillEvolutionEngine");
const generateInsights = require("../services/insightEngine");
const buildBasketballBrain = require("../services/basketballBrainV2");
const buildTrainingPlan = require("../services/trainingPlannerBrain");

router.post("/", async (req, res) => {
  try {
    const { user_id = "guest", message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required"
      });
    }

    console.log("\n🏀 NEW REQUEST:", message);

    // =========================
    // 1. PLAYER PROGRESS
    // =========================
    const { data: progress } = await supabase
      .from("user_player_progress_tracking")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    // =========================
    // 2. MEMORY (LIMITED → FIX PROMPT OVERLOAD)
    // =========================
    const memory = (await getMemory(user_id)).slice(0, 5);
    const longMemory = (await getLongMemory(user_id)).slice(0, 2);

    // =========================
    // 3. INSIGHTS + SKILLS
    // =========================
    const insights = generateInsights([message]);
    const updatedProgress = updateSkills(progress || {}, message);

    // =========================
    // 4. BRAIN BUILD
    // =========================
    const brainBase = buildBasketballBrain({
      profile: progress || {},
      progress: updatedProgress,
      insights,
      summaries: [...longMemory, ...memory]
        .slice(0, 5)
        .map(m => (m.message || "").slice(0, 120))
    });

    const trainingPlan = buildTrainingPlan(brainBase);

    // =========================
    // 5. SAVE TRAINING PLAN
    // =========================
    await supabase.from("training_plans").upsert({
      user_id,
      focus: trainingPlan.focus,
      intensity: trainingPlan.intensity,
      drills: trainingPlan.drills,
      next_workout: trainingPlan.nextWorkout,
      updated_at: new Date().toISOString()
    });

    // =========================
    // 6. FINAL BRAIN
    // =========================
    const brain = buildBasketballBrain({
      profile: progress || {},
      progress: updatedProgress,
      insights,
      trainingPlan,
      summaries: memory
    });

    // =========================
    // 7. BUILD PROMPT (SAFETY LIMIT)
    // =========================
    const prompt = buildCoachPrompt(brain, message);

    if (prompt.length > 12000) {
      console.log("⚠️ Prompt too large:", prompt.length);

      return res.json({
        success: true,
        reply:
          "⚠️ System overloaded. Reduce memory size or shorten prompt builder."
      });
    }

    // =========================
    // 8. AI CALL
    // =========================
    let reply;
    try {
      reply = await askAI(prompt);
    } catch (err) {
      console.error("AI ERROR:", err.message);
      reply = "⚠️ Coach offline. Try again.";
    }

    // =========================
    // 9. UPDATE PROGRESS
    // =========================
    await supabase.from("user_player_progress_tracking").upsert({
      user_id,
      ...updatedProgress,
      updated_at: new Date().toISOString()
    });

    // =========================
    // 10. MEMORY SAVE
    // =========================
    await supabase.from("memory").insert([
      { user_id, role: "user", message },
      { user_id, role: "assistant", message: reply }
    ]);

    // =========================
    // 11. RESPONSE
    // =========================
    return res.json({
      success: true,
      reply
    });

  } catch (err) {
    console.error("❌ ROUTE CRASH:", err);

    return res.status(500).json({
      success: false,
      error: "Server crash",
      details: err.message
    });
  }
});

module.exports = router;