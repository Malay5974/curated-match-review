export function reviewProfile(profile) {
  const risks = [];
  let hardConflictCount = 0;

  if (profile.smoking !== "No") {
    hardConflictCount += 1;
    risks.push("Smoking conflicts with Malay's non-smoker deal-breaker.");
  }
  if (profile.alcohol !== "No") {
    hardConflictCount += 1;
    risks.push("Alcohol use conflicts with Malay's no regular alcohol preference.");
  }
  if (profile.food !== "Vegetarian") {
    hardConflictCount += 1;
    risks.push("Food preference differs from Malay's vegetarian preference.");
  }
  if (profile.religion !== "Same religion") {
    hardConflictCount += 1;
    risks.push("Religion does not match the stated hard filter.");
  }
  if (profile.family === "High family involvement" || profile.family === "Joint family") {
    risks.push("Family setup may need review against Malay's balanced-family preference.");
  }
  if (profile.religiosity !== "Moderate") {
    risks.push("Religiosity differs from the preferred moderate range.");
  }

  if (hardConflictCount >= 2) {
    return { status: "badFit", label: "Bad Fit", risks };
  }
  if (risks.length > 0) {
    return { status: "review", label: "Review Needed", risks };
  }
  return { status: "ready", label: "Ready to Share", risks: ["No known hard deal-breaker conflicts found."] };
}
