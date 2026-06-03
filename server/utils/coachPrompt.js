function buildCoachPrompt(brain, message) {
  return `
You are an NBA basketball skills coach AI.

PLAYER:
Level: ${brain.level}
Position: ${brain.position}
Focus: ${brain.focus}

KEY WEAKNESSES:
${(brain.keyWeakness || []).join(", ")}

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