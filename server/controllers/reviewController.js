import { addProfile } from "../use-cases/addProfile.js";
import { getReviewWorkspace } from "../use-cases/getReviewWorkspace.js";
import { saveDecision } from "../use-cases/saveDecision.js";
import { seedDemoData } from "../use-cases/seedDemoData.js";

export function getReview(_req, res) {
  res.json(getReviewWorkspace());
}

export function postDecision(req, res) {
  const result = saveDecision({
    profileId: req.params.profileId,
    action: req.body.action,
    overrideReason: req.body.overrideReason || ""
  });

  if (result.error) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  res.json({ ok: true });
}

export function postProfile(req, res) {
  const result = addProfile(req.body);

  if (result.error) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  res.status(201).json(result);
}

export function postReset(_req, res) {
  seedDemoData({ force: true });
  res.json({ ok: true });
}
