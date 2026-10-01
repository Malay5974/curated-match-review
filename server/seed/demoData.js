export const demoClient = {
  id: "client-malay-delwadiya",
  name: "Malay Delwadiya",
  summary: "Modern professional client. Flexible on soft preferences, strict on a few deal-breakers.",
  dealbreakers: [
    "Non-smoker only",
    "No regular alcohol use",
    "Vegetarian food preference",
    "Same religion preferred as hard filter"
  ],
  preferences: [
    ["Religiosity", "Moderate"],
    ["Caste/Sect", "Flexible if values align"],
    ["Family Setup", "Independent or balanced family involvement"],
    ["Marriage Horizon", "6-12 months"]
  ]
};

const demoProfileRows = [
  ["P-014", "Profile 01", "Product leader, Mumbai", "Mumbai", "India", "Same religion", "Different caste", "Compatible", "Moderate", "Vegetarian", "No", "No", "Independent", "6-12 months", "Secure attachment, high openness"],
  ["P-027", "Profile 02", "Finance manager, Bengaluru", "Bengaluru", "India", "Same religion", "Compatible", "Compatible", "Low", "Eggetarian", "Socially", "No", "Balanced", "12-18 months", "Secure attachment, high conscientiousness"],
  ["P-039", "Profile 03", "Founder, Delhi", "Delhi", "India", "Different religion", "Not applicable", "Not applicable", "Moderate", "Vegetarian", "No", "Occasional", "Joint family", "6-12 months", "Anxious-secure, high ambition"],
  ["P-052", "Profile 04", "Doctor, Pune", "Pune", "India", "Same religion", "Compatible", "Compatible", "Moderate", "Vegetarian", "No", "No", "High family involvement", "0-6 months", "Secure attachment, family-oriented"],
  ["P-068", "Profile 05", "Consultant, Singapore", "Singapore", "Singapore", "Same religion", "Compatible", "Compatible", "Moderate", "Non-vegetarian", "No", "No", "Independent", "6-12 months", "Secure attachment, global lifestyle"]
];

const demoProfileAgesInMs = [
  25 * 1000,
  5 * 60 * 1000,
  60 * 60 * 1000,
  24 * 60 * 60 * 1000,
  14 * 24 * 60 * 60 * 1000
];

export function getDemoProfiles() {
  const now = Date.now();
  return demoProfileRows.map((profile, index) => [
    ...profile,
    new Date(now - demoProfileAgesInMs[index]).toISOString()
  ]);
}
