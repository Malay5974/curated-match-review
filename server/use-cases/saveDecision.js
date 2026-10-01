import { upsertDecision } from "../repositories/decisionRepository.js";
import { getProfileById } from "../repositories/profileRepository.js";

export function saveDecision({ profileId, action, overrideReason = "" }) {
  if (!["approve", "remove"].includes(action)) {
    return { error: "Action must be approve or remove.", status: 400 };
  }

  if (!getProfileById(profileId)) {
    return { error: "Profile not found.", status: 404 };
  }

  upsertDecision({ profileId, action, overrideReason });
  return { ok: true };
}
