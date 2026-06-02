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
    console.log("\n==============================");
    console.log("🏀 NEW REQUEST");
    console.log("==============================");

    const { user_id, message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required"
      });
    }

    console.log("User:", user_id);
    console.log("Message:", message);

    // =========================
    // 1. PLAYER PROGRESS
    // =========================
    const { data: progress, error: progressError } = await supabase
      .from("user_player_progress_tracking")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (progressError && progressError.code !== "PGRST116") {
      console.error("Progress Error:", progressError.message);
    }

    // =========================
    // 2. MEMORY
    // =========================
    const memory = await getMemory(user_id);
    const longMemory = await getLongMemory(user_id);

    // =========================
    // 3. INSIGHTS + SKILLS
    // =========================
    const insights = generateInsights([message]);
    const updatedProgress = updateSkills(progress || {}, message);

    // =========================
    // 4. BRAIN
    // =========================
    const brainBase = buildBasketballBrain({
      profile: progress || {},
      progress: updatedProgress,
      insights,
      summaries: longMemory || memory
    });

    const trainingPlan = buildTrainingPlan(brainBase);

    // =========================
    // 5. SAVE TRAINING PLAN
    // =========================
    const { error: trainingError } = await supabase
      .from("training_plans")
      .upsert({
        user_id,
        focus: trainingPlan.focus,
        intensity: trainingPlan.intensity,
        drills: trainingPlan.drills,
        next_workout: trainingPlan.nextWorkout,
        updated_at: new Date().toISOString()
      });

    if (trainingError) {
      console.log("Training save error:", trainingError.message);
    }

    // =========================
    // 6. FINAL BRAIN
    // =========================
    const brain = buildBasketballBrain({
      profile: progress || {},
      progress: updatedProgress,
      insights,
      trainingPlan,
      summaries: longMemory || memory
    });

    const prompt = buildCoachPrompt(brain, message);

    console.log("Prompt ready:", prompt.length);

    // =========================
    // 7. AI CALL (OLLAMA / NGROK SAFE)
    // =========================
    let reply;

    try {
      reply = await askAI(prompt);
    } catch (aiErr) {
      console.error("❌ AI ERROR:", aiErr.message);

      reply = "⚠️ Coach is offline right now. Try again in a moment.";
    }

    // =========================
    // 8. UPDATE PROGRESS
    // =========================
    if (user_id && Object.keys(updatedProgress || {}).length > 0) {
      await supabase
        .from("user_player_progress_tracking")
        .upsert({
          user_id,
          ...updatedProgress,
          updated_at: new Date().toISOString()
        });
    }

    // =========================
    // 9. SAVE MEMORY (SAFE TABLE)
    // =========================
    const { error: memoryError } = await supabase
      .from("memory")
      .insert([
        { user_id, role: "user", message },
        { user_id, role: "assistant", message: reply }
      ]);

    if (memoryError) {
      console.log("Memory error (ignored):", memoryError.message);
    }

    // =========================
    // 10. RESPONSE
    // =========================
    return res.json({
      success: true,
      reply
    });

  } catch (err) {
    console.error("\n❌ ROUTE CRASH:");
    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;