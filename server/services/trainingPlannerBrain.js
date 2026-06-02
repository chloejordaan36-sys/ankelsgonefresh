function buildTrainingPlan(brain) {
  const plan = {
    focus: "general",
    drills: [],
    intensity: "medium",
    nextWorkout: null
  };

  const skills = brain.skills;
  const weaknesses = brain.intelligence?.repeatedWeaknesses || [];

  // 🟦 LOW HANDLE LEVEL
  if (skills.handles <= 2) {
    plan.focus = "ball_handling";
    plan.intensity = "low";
    plan.drills = [
      "Cone dribble drill (5 min)",
      "Stationary weak-hand dribbling (3 min)",
      "Wall bounce control (3 min)"
    ];
  }

  // 🟨 MID HANDLE LEVEL
  else if (skills.handles <= 4) {
    plan.focus = "combo_moves";
    plan.intensity = "medium";
    plan.drills = [
      "Hesitation + crossover combos",
      "Change of pace dribble drills",
      "2-ball coordination drill"
    ];
  }

  // 🟥 HIGH LEVEL HANDLES
  else {
    plan.focus = "advanced_isolation";
    plan.intensity = "high";
    plan.drills = [
      "1v1 isolation moves",
      "Ankle-breaker combo chains",
      "Game-speed reaction dribbling"
    ];
  }

  // 🧠 Shooting weakness override
  if (weaknesses.includes("shooting inconsistency")) {
    plan.focus = "shooting_fix";
    plan.drills.unshift("Form shooting close range (50 makes)");
    plan.drills.push("Catch & shoot repetition drill");
  }

  plan.nextWorkout = {
    title: `Improve ${plan.focus}`,
    drills: plan.drills,
    intensity: plan.intensity
  };

  return plan;
}

module.exports = buildTrainingPlan;