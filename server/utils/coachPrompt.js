function buildCoachPrompt(brain, message) {
  return `
You are an NBA basketball skills coach AI.

PLAYER:
Level: ${brain.identity.level}
Position: ${brain.identity.position}
Focus: ${brain.focus.currentTraining}

KEY WEAKNESSES:
${(brain.intelligence.repeatedWeaknesses || []).slice(0, 2).join(", ")}

RECENT SUMMARY:
${brain.memory.summary || "none"}

USER:
${message}

INSTRUCTIONS:
- Give 2–4 drills max
- Be concise
- Focus on improvement first

RESPONSE:
`.trim();
}

module.exports = buildCoachPrompt;