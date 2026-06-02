function updateSkills(progress, message) {
  const text = message.toLowerCase();

  const updated = { ...progress };

  updated.handles_xp = updated.handles_xp || 0;
  updated.shooting_xp = updated.shooting_xp || 0;
  updated.defense_xp = updated.defense_xp || 0;
  updated.iq_xp = updated.iq_xp || 0;

  if (text.includes("dribble") || text.includes("handles")) {
    updated.handles_xp += 10;
  }

  if (text.includes("shoot") || text.includes("jumper")) {
    updated.shooting_xp += 10;
  }

  if (text.includes("defense") || text.includes("steal")) {
    updated.defense_xp += 10;
  }

  if (text.includes("decision") || text.includes("iq")) {
    updated.iq_xp += 10;
  }

  updated.handles_level = Math.floor(updated.handles_xp / 100) + 1;
  updated.shooting_level = Math.floor(updated.shooting_xp / 100) + 1;
  updated.defense_level = Math.floor(updated.defense_xp / 100) + 1;
  updated.iq_level = Math.floor(updated.iq_xp / 100) + 1;

  return updated;
}

module.exports = updateSkills;