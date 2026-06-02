const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");

const {
  getMemory,
  getLongMemory
} = require("../services/memoryService");

const { askAI } = require("../services/aiService");

const buildCoachPrompt = require("../utils/coachPrompt");
const updateSkills = require("../services/skillEvolutionEngine");
const generateInsights = require("../services/insightEngine");
const buildBasketballBrain = require("../services/basketballBrainV2");
const buildTrainingPlan = require("../services/trainingPlannerBrain");

router.post("/", async (req, res) => {
  try {
    console.log("\n==============================");
    console.log("NEW REQUEST RECEIVED");
    console.log("==============================");

    const { user_id, message } = req.body;

    console.log("User ID:", user_id);
    console.log("Message:", message);

    // 1. Load player progress
    console.log("Loading player progress...");

    const { data: progress, error: progressError } = await supabase
      .from("user_player_progress_tracking")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (progressError) {
      console.error("Progress Error:", progressError);
      throw progressError;
    }

    console.log("Player progress loaded");

    // 2. Load memory
    console.log("Loading memory...");

    const memory = await getMemory(user_id);
    const longMemory = await getLongMemory(user_id);

    console.log("Memory loaded");

    // 3. Generate insights
    console.log("Generating insights...");

    const insights = generateInsights([message]);

    console.log("Insights generated");

    // 4. Update skills
    console.log("Updating skills...");

    const updatedProgress = updateSkills(progress || {}, message);

    console.log("Skills updated");

    // 5. Build base brain
    console.log("Building basketball brain...");

    const brainBase = buildBasketballBrain({
      profile: progress || {},
      progress: updatedProgress,
      insights,
      summaries: longMemory || memory
    });

    console.log("Brain built");

    // 6. Generate training plan
    console.log("Generating training plan...");

    const trainingPlan = buildTrainingPlan(brainBase);

    console.log("Training plan generated");

    // 7. Save training plan
    console.log("Saving training plan...");

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
      console.error("Training Plan Error:", trainingError);
    }

    console.log("Training plan saved");

    // 8. Final brain
    console.log("Building final brain...");

    const brain = buildBasketballBrain({
      profile: progress || {},
      progress: updatedProgress,
      insights,
      trainingPlan,
      summaries: longMemory || memory
    });

    console.log("Final brain built");

    // 9. Build prompt
    console.log("Building prompt...");

    const prompt = buildCoachPrompt(brain, message);

    console.log("Prompt built");
    console.log("Prompt length:", prompt.length);

    // 10. Ask AI
    console.log("Calling Ollama...");

    const reply = await askAI(prompt);

    console.log("Ollama finished");
    console.log("Reply length:", reply?.length || 0);

    // 11. Update player progress
    console.log("Saving updated progress...");

    if (progress) {
      const { error: updateError } = await supabase
        .from("user_player_progress_tracking")
        .update(updatedProgress)
        .eq("user_id", user_id);

      if (updateError) {
        console.error("Progress Update Error:", updateError);
      }
    }

    console.log("Progress saved");

    // 12. Save memory
    console.log("Saving memory...");

    const { error: memoryError } = await supabase
      .from("memory")
      .insert([
        {
          user_id,
          role: "user",
          message
        },
        {
          user_id,
          role: "assistant",
          message: reply
        }
      ]);

    if (memoryError) {
      console.error("Memory Error:", memoryError);
    }

    console.log("Memory saved");

    // 13. Send response
    console.log("Sending response");

    return res.json({
      success: true,
      reply
    });

  } catch (err) {
    console.error("\n==============================");
    console.error("ROUTE ERROR");
    console.error("==============================");
    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === "development"
        ? err.stack
        : undefined
    });
  }
});

module.exports = router;