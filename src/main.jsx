import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const filters = [
  ["all", "All"],
  ["ready", "Best Fit"],
  ["review", "Review Needed"],
  ["badFit", "Bad Fit"]
];

function statusClass(status) {
  return {
    ready: "status-ready",
    review: "status-review",
    badFit: "status-bad-fit"
  }[status];
}

function workflowStatus(profile) {
  if (profile.review.status === "badFit") {
    return { status: "badFit", label: "Bad Fit" };
  }
  if (profile.review.status === "ready") {
    return { status: "ready", label: "Best Fit" };
  }
  if (profile.decision?.action === "approve") {
    return { status: "ready", label: "Best Fit" };
  }
  if (profile.decision?.action === "remove") {
    return { status: "badFit", label: "Bad Fit" };
  }
  return profile.review;
}

function App() {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [draftReasons, setDraftReasons] = useState({});
  const [savingId, setSavingId] = useState("");
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(defaultProfileDraft());

  async function loadReview() {
    try {
      setLoadError("");
      const response = await fetch("/api/review");
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const payload = await response.json();
      setData(payload);
      setDraftReasons(
        Object.fromEntries(payload.profiles.map((profile) => [profile.id, profile.decision?.overrideReason || ""]))
      );
    } catch (error) {
      setLoadError(error.message || "Could not load review data.");
    }
  }

  useEffect(() => {
    loadReview();
  }, []);

  async function saveDecision(profileId, action) {
    setSavingId(profileId);
    try {
      const response = await fetch(`/api/decisions/${profileId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, overrideReason: draftReasons[profileId] || "" })
      });
      if (!response.ok) {
        throw new Error(`Could not save decision: ${response.status}`);
      }
      await loadReview();
    } catch (error) {
      setLoadError(error.message || "Could not save decision.");
    } finally {
      setSavingId("");
    }
  }

  async function resetDemo() {
    const confirmed = window.confirm("Reset all profiles and decisions to the original demo data?");
    if (!confirmed) return;

    try {
      const response = await fetch("/api/reset", { method: "POST" });
      if (!response.ok) {
        throw new Error(`Could not reset demo: ${response.status}`);
      }
      setActiveFilter("all");
      setProfileDraft(defaultProfileDraft());
      await loadReview();
    } catch (error) {
      setLoadError(error.message || "Could not reset demo.");
    }
  }

  async function addProfile(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileDraft)
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || `Could not add profile: ${response.status}`);
      }
      setProfileDraft(defaultProfileDraft());
      setShowAddProfile(false);
      setActiveFilter("all");
      await loadReview();
    } catch (error) {
      setLoadError(error.message || "Could not add profile.");
    }
  }

  const filteredProfiles = useMemo(() => {
    if (!data) return [];
    return data.profiles.filter((profile) => {
      const currentStatus = workflowStatus(profile).status;
      return activeFilter === "all" || currentStatus === activeFilter;
    });
  }, [data, activeFilter]);

  const metrics = useMemo(() => {
    if (!data) return { total: 0, ready: 0, review: 0, badFit: 0 };
    return {
      total: data.profiles.length,
      ready: data.profiles.filter((profile) => workflowStatus(profile).status === "ready").length,
      review: data.profiles.filter((profile) => workflowStatus(profile).status === "review").length,
      badFit: data.profiles.filter((profile) => workflowStatus(profile).status === "badFit").length
    };
  }, [data]);

  const filterCounts = {
    all: metrics.total,
    ready: metrics.ready,
    review: metrics.review,
    badFit: metrics.badFit
  };

  if (loadError) {
    return (
      <div className="loading">
        <div className="load-error">
          <h1>Backend is not responding</h1>
          <p>{loadError}</p>
          <p>Run <code>npm run dev</code> from the <code>curated-match-review</code> folder and open <code>http://127.0.0.1:5183/</code>.</p>
          <button onClick={loadReview}>Retry</button>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="loading">Loading match review workspace…</div>;
  }

  return (
    <main className="app-shell">
      <aside className="client-panel" aria-label="Client context">
        <div className="brand-row">
          <div className="brand-mark" aria-hidden="true">TDC</div>
          <div>
            <p className="eyebrow">Internal Review</p>
            <h1>Curated Match Review</h1>
          </div>
        </div>

        <section className="panel-section">
          <p className="label">Client</p>
          <h2>{data.client.name}</h2>
          <p className="muted">{data.client.summary}</p>
        </section>

        <section className="panel-section">
          <p className="label">Hard Deal-Breakers</p>
          <div className="tag-list">
            {data.client.dealbreakers.map((item) => <span className="tag" key={item}>{item}</span>)}
          </div>
        </section>

        <section className="panel-section">
          <p className="label">Soft Preferences</p>
          <div className="preference-list">
            {data.client.preferences.map(([label, value]) => (
              <div className="preference-row" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-section privacy-note">
          <p className="label">Privacy Boundary</p>
          <p>Full profiles stay in the internal database. LLM usage would be limited to anonymised preference text or rejection notes.</p>
        </section>
      </aside>

      <section className="workspace" aria-label="Shortlist review workspace">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">Matchmaker shortlist</p>
            <h2>Review before sharing with client</h2>
          </div>
          <div className="header-controls">
            <div className="command-row" aria-label="Workspace commands">
              <button className="utility-button" onClick={() => setShowAddProfile((current) => !current)}>
                {showAddProfile ? "Close Form" : "Add Profile"}
              </button>
              <button className="utility-button" onClick={resetDemo}>Reset Demo</button>
            </div>
            <div className="filter-row" aria-label="Review filters">
              {filters.map(([key, label]) => (
              <button
                className={`filter-button ${activeFilter === key ? "active" : ""}`}
                key={key}
                onClick={() => setActiveFilter(key)}
              >
                <span>{label}</span>
                <strong>{filterCounts[key]}</strong>
              </button>
            ))}
            </div>
          </div>
        </header>

        {showAddProfile && (
          <AddProfileForm
            profileDraft={profileDraft}
            setProfileDraft={setProfileDraft}
            onSubmit={addProfile}
          />
        )}

        <section className="profile-list" aria-live="polite">
          {filteredProfiles.length === 0 ? (
            <div className="empty-state">No profiles match this filter.</div>
          ) : (
            filteredProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                draftReason={draftReasons[profile.id] || ""}
                onReasonChange={(value) => setDraftReasons((current) => ({ ...current, [profile.id]: value }))}
                onSave={saveDecision}
                saving={savingId === profile.id}
              />
            ))
          )}
        </section>
      </section>
    </main>
  );
}

function defaultProfileDraft() {
  return {
    name: "New Profile",
    title: "Strategy lead, Mumbai",
    city: "Mumbai",
    country: "India",
    religion: "Same religion",
    caste: "Compatible",
    sect: "Compatible",
    religiosity: "Moderate",
    food: "Vegetarian",
    alcohol: "No",
    smoking: "No",
    family: "Balanced",
    marriageHorizon: "6-12 months",
    psychometric: "Secure attachment, values-aligned"
  };
}

function AddProfileForm({ profileDraft, setProfileDraft, onSubmit }) {
  function updateField(field, value) {
    setProfileDraft((current) => ({ ...current, [field]: value }));
  }

  return (
    <form className="add-profile-panel" onSubmit={onSubmit}>
      <div className="add-profile-heading">
        <div>
          <p className="eyebrow">Shortlist input</p>
          <h3>Add a profile to review</h3>
        </div>
        <p>Structured fields are checked by deterministic rules. In production, AI would help extract these fields from messy notes, not decide the match alone.</p>
      </div>

      <div className="form-grid">
        <Field label="Name" value={profileDraft.name} onChange={(value) => updateField("name", value)} />
        <Field label="Title" value={profileDraft.title} onChange={(value) => updateField("title", value)} />
        <Field label="City" value={profileDraft.city} onChange={(value) => updateField("city", value)} />
        <Field label="Country" value={profileDraft.country} onChange={(value) => updateField("country", value)} />
        <SelectField label="Religion" value={profileDraft.religion} options={["Same religion", "Different religion"]} onChange={(value) => updateField("religion", value)} />
        <Field label="Caste" value={profileDraft.caste} onChange={(value) => updateField("caste", value)} />
        <Field label="Sect" value={profileDraft.sect} onChange={(value) => updateField("sect", value)} />
        <SelectField label="Religiosity" value={profileDraft.religiosity} options={["Low", "Moderate", "High"]} onChange={(value) => updateField("religiosity", value)} />
        <SelectField label="Food" value={profileDraft.food} options={["Vegetarian", "Eggetarian", "Non-vegetarian"]} onChange={(value) => updateField("food", value)} />
        <SelectField label="Alcohol" value={profileDraft.alcohol} options={["No", "Socially", "Regularly"]} onChange={(value) => updateField("alcohol", value)} />
        <SelectField label="Smoking" value={profileDraft.smoking} options={["No", "Occasional", "Regular"]} onChange={(value) => updateField("smoking", value)} />
        <SelectField label="Family" value={profileDraft.family} options={["Independent", "Balanced", "High family involvement", "Joint family"]} onChange={(value) => updateField("family", value)} />
        <SelectField label="Marriage Horizon" value={profileDraft.marriageHorizon} options={["0-6 months", "6-12 months", "12-18 months"]} onChange={(value) => updateField("marriageHorizon", value)} />
        <Field label="Psychometric" value={profileDraft.psychometric} onChange={(value) => updateField("psychometric", value)} />
      </div>

      <button className="primary-command" type="submit">Add & Review Profile</button>
    </form>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function ProfileCard({ profile, draftReason, onReasonChange, onSave, saving }) {
  const riskyApproval = profile.review.status !== "ready" && profile.decision?.action === "approve";
  const missingReason = riskyApproval && !draftReason.trim();
  const currentStatus = workflowStatus(profile);
  const autoBadFit = profile.review.status === "badFit";
  const autoBestFit = profile.review.status === "ready";

  return (
    <article className="profile-card">
      <div>
        <div className="badge-row">
          <span className={`status-badge ${statusClass(currentStatus.status)}`}>{currentStatus.label}</span>
          {currentStatus.status !== profile.review.status && (
            <span className={`system-badge ${statusClass(profile.review.status)}`}>System: {profile.review.label}</span>
          )}
        </div>
        <h3>{profile.name}</h3>
        <p className="muted-text">{profile.title}</p>
        <div className="profile-meta">
          <span className="meta-pill">{profile.id}</span>
          <span className="meta-pill">{profile.city}, {profile.country}</span>
          <span className="meta-pill">{profile.marriageHorizon}</span>
        </div>
      </div>

      <div>
        <p className="label">Review notes</p>
        <ul className="risk-list">
          {profile.review.risks.map((risk) => <li key={risk}>{risk}</li>)}
        </ul>
        <div className="field-table">
          <span>Religion</span><strong>{profile.religion}</strong>
          <span>Smoking</span><strong>{profile.smoking}</strong>
          <span>Alcohol</span><strong>{profile.alcohol}</strong>
          <span>Food</span><strong>{profile.food}</strong>
          <span>Family</span><strong>{profile.family}</strong>
          <span>Psychometric</span><strong>{profile.psychometric}</strong>
        </div>
      </div>

      <div className="decision-area">
        <p className="label">Matchmaker decision</p>
        <div className="action-row">
          <button
            className={`action-button ${profile.decision?.action === "approve" || autoBestFit ? "selected" : ""} ${autoBestFit ? "auto-decision" : ""}`}
            onClick={() => onSave(profile.id, "approve")}
            disabled={saving || autoBadFit || autoBestFit}
          >
            Approve
          </button>
          <button
            className={`action-button ${profile.decision?.action === "remove" || autoBadFit ? "selected" : ""} ${autoBadFit ? "auto-decision" : ""}`}
            onClick={() => onSave(profile.id, "remove")}
            disabled={saving || autoBestFit}
          >
            Reject
          </button>
        </div>
        <div className="override-box">
          <label htmlFor={`override-${profile.id}`}>Override reason</label>
          <textarea
            id={`override-${profile.id}`}
            placeholder="Required only when approving a risky profile."
            value={draftReason}
            onChange={(event) => onReasonChange(event.target.value)}
          />
        </div>
        <p className="decision-note">
          {autoBadFit
            ? "Automatically marked Bad Fit because multiple hard deal-breakers conflict."
            : autoBestFit
            ? "Automatically approved as Best Fit because no known hard deal-breaker conflicts were found."
            : missingReason
            ? "Add a short reason before keeping this risky profile."
            : profile.decision
              ? "Decision saved to the audit trail."
              : "No decision captured yet."}
        </p>
      </div>
    </article>
  );
}

createRoot(document.getElementById("root")).render(<App />);
