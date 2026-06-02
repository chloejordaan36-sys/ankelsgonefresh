function generateInsights(messages) {
  const text = messages.join(" ").toLowerCase();

  const insights = {
    weaknesses: [],
    patterns: []
  };

  if (text.includes("can't dribble left")) {
    insights.weaknesses.push("weak left-hand dribble");
  }

  if (text.includes("miss shots")) {
    insights.weaknesses.push("shooting inconsistency");
  }

  if (text.includes("every time")) {
    insights.patterns.push("repeated struggle pattern");
  }

  return insights;
}

module.exports = generateInsights;