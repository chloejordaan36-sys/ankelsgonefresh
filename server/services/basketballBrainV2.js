function buildBasketballBrain({
  profile,
  progress,
  trainingPlan,
  memory,
  summaries,
  insights
}) {
  return {
    identity: {
      position: profile?.position || "unknown",
      level: profile?.level || "beginner",
      playStyle: profile?.playStyle || "unknown"
    },

    physical: {
      height: profile?.height,
      weight: profile?.weight
    },

    skills: {
      handles: progress?.handles_level || 1,
      shooting: progress?.shooting_level || 1,
      defense: progress?.defense_level || 1,
      iq: progress?.iq_level || 1
    },

    focus: {
      currentTraining: trainingPlan?.focus || "general",
      nextWorkout: trainingPlan?.next || null
    },

    intelligence: {
      repeatedWeaknesses: insights?.weaknesses || [],
      behavioralPatterns: insights?.patterns || []
    },

    memory: {
      keyFacts: memory?.slice?.(0, 10) || [],
      summary: summaries?.[0]?.summary || ""
    }
  };
}

module.exports = buildBasketballBrain;