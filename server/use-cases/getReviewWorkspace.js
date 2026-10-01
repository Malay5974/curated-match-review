import { reviewProfile } from "../domain/reviewProfile.js";
import { getFirstClient } from "../repositories/clientRepository.js";
import { getAllDecisions } from "../repositories/decisionRepository.js";
import { getAllProfiles, serializeProfile } from "../repositories/profileRepository.js";

export function getReviewWorkspace() {
  const clientRow = getFirstClient();
  const decisions = Object.fromEntries(getAllDecisions().map((row) => [row.profile_id, {
    action: row.action,
    overrideReason: row.override_reason,
    updatedAt: row.updated_at
  }]));

  const profiles = getAllProfiles().map((row) => {
    const profile = serializeProfile(row);
    return { ...profile, review: reviewProfile(profile), decision: decisions[profile.id] || null };
  });

  return {
    client: {
      id: clientRow.id,
      name: clientRow.name,
      summary: clientRow.summary,
      dealbreakers: JSON.parse(clientRow.dealbreakers),
      preferences: JSON.parse(clientRow.preferences)
    },
    profiles
  };
}
