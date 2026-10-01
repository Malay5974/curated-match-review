import { countProfiles, insertProfile } from "../repositories/profileRepository.js";

const requiredProfileFields = [
  "name",
  "title",
  "city",
  "country",
  "religion",
  "caste",
  "sect",
  "religiosity",
  "food",
  "alcohol",
  "smoking",
  "family",
  "marriageHorizon",
  "psychometric"
];

export function addProfile(input) {
  const missingFields = requiredProfileFields.filter((field) => !String(input[field] || "").trim());

  if (missingFields.length > 0) {
    return { error: `Missing required fields: ${missingFields.join(", ")}`, status: 400 };
  }

  const nextNumber = countProfiles() + 1;
  const profile = {
    id: `P-${String(Date.now()).slice(-6)}`,
    name: input.name.trim() || `Profile ${String(nextNumber).padStart(2, "0")}`,
    title: input.title.trim(),
    city: input.city.trim(),
    country: input.country.trim(),
    religion: input.religion.trim(),
    caste: input.caste.trim(),
    sect: input.sect.trim(),
    religiosity: input.religiosity.trim(),
    food: input.food.trim(),
    alcohol: input.alcohol.trim(),
    smoking: input.smoking.trim(),
    family: input.family.trim(),
    marriageHorizon: input.marriageHorizon.trim(),
    psychometric: input.psychometric.trim()
  };

  insertProfile(profile);
  return { ok: true, id: profile.id };
}
