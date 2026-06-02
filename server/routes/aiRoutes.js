const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");

const { getMemory,getLongMemory } = require("../services/memoryService");

const { askAI } = require("../services/aiService");

const buildCoachPrompt = require("../utils/coachPrompt");
const updateSkills = require("../services/skillEvolutionEngine");
const generateInsights = require("../services/insightEngine");
const buildBasketballBrain = require("../services/basketballBrainV2");
const buildTrainingPlan = require("../services/trainingPlannerBrain");

router.post("/", async (req, res) => {
  try {
    const { user_id, message } = req.body;

    // 1. Load player progress
    const { data: progress } = await supabase
      .from("user_player_progress_tracking")
      .select("*")
      .eq("user_id", user_id)
      .single();

    // 2. Load memory
    const memory = await getMemory(user_id);
    const longMemory = await getLongMemory(user_id);

    // 3. Generate insights
    const insights = generateInsights([message]);

    // 4. Update skills
    const updatedProgress = updateSkills(progress, message);

    // 5. Build base brain
    const brainBase = buildBasketballBrain({
      profile: progress,
      progress: updatedProgress,
      insights,
      summaries: longMemory || memory
    });

    // 6. Generate training plan
    const trainingPlan = buildTrainingPlan(brainBase);

    // 7. Save training plan to Supabase
    await supabase
      .from("training_plans")
      .upsert({
        user_id,
        focus: trainingPlan.focus,
        intensity: trainingPlan.intensity,
        drills: trainingPlan.drills,
        next_workout: trainingPlan.nextWorkout,
        updated_at: new Date()
      });

    // 8. Final brain (includes training plan)
    const brain = buildBasketballBrain({
      profile: progress,
      progress: updatedProgress,
      insights,
      trainingPlan,
      summaries: longMemory || memory
    });

    // 9. Build prompt
    const prompt = buildCoachPrompt(brain, message);

    // 10. Get AI response
    const reply = await askAI(prompt);

    // 11. Update player progress
    await supabase
      .from("user_player_progress_tracking")
      .update(updatedProgress)
      .eq("user_id", user_id);

    // 12. Save memory
    await supabase.from("memory").insert([
      { user_id, role: "user", message },
      { user_id, role: "assistant", message: reply }
    ]);

    // 13. Response
    res.json({
      success: true,
      reply
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;