import { deleteAllClients, countClients, insertClient } from "../repositories/clientRepository.js";
import { deleteAllDecisions } from "../repositories/decisionRepository.js";
import { countProfiles, deleteAllProfiles, insertSeedProfile } from "../repositories/profileRepository.js";
import { demoClient, getDemoProfiles } from "../seed/demoData.js";

export function seedDemoData({ force = false } = {}) {
  if (force) {
    deleteAllDecisions();
    deleteAllProfiles();
    deleteAllClients();
  }

  if (countClients() === 0) {
    insertClient(demoClient);
  }

  if (countProfiles() === 0) {
    for (const profile of getDemoProfiles()) {
      insertSeedProfile(profile);
    }
  }
}
