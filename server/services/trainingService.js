const { askAI } = require("./aiService");

async function generatePlan(profile) {
  const prompt = `
Create a 30-day basketball plan.

Player:
${JSON.stringify(profile)}

Format:

Week 1
Week 2
Week 3
Week 4
`;

  return await askAI(prompt);
}

module.exports = {
  generatePlan
};