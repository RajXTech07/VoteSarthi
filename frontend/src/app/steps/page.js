"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import NextAction from "@/components/NextAction";
import styles from "./page.module.css";

const icons = {
  search: "🔍",
  "map-pin": "📍",
  "id-card": "🪪",
  building: "🏛️",
  fingerprint: "✋",
  vote: "🗳️",
  "check-circle": "✅",
  clipboard: "📋",
  clock: "⏳",
};

export default function StepsPage() {
  // Context form
  const [age, setAge] = useState("");
  const [hasVoterId, setHasVoterId] = useState(null);
  const [contextSet, setContextSet] = useState(false);

  // Steps data
  const [steps, setSteps] = useState([]);
  const [summary, setSummary] = useState("");
  const [aiSummary, setAiSummary] = useState(null);
  const [personalized, setPersonalized] = useState(false);
  const [flowId, setFlowId] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Next Action from API
  const [nextAction, setNextAction] = useState(null);

  const loadSteps = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSteps(params);
      setSteps(data.steps);
      setSummary(data.context_summary || "");
      setAiSummary(data.ai_summary || null);
      setPersonalized(data.personalized || false);
      setFlowId(data.flow_id || null);
      // Start on the current step (backend tells us which one)
      setActiveStep(data.current_step_index || 0);
      // Capture next action from API
      setNextAction({
        icon: data.next_action_icon,
        action: data.next_action,
        detail: data.next_action_detail,
        url: data.next_action_url,
      });
    } catch (err) {
      setError(err.message || "Failed to load steps");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (age) params.age = parseInt(age);
    if (hasVoterId !== null) params.has_voter_id = hasVoterId;
    setContextSet(true);
    loadSteps(params);
  };

  const handleReset = () => {
    setContextSet(false);
    setAge("");
    setHasVoterId(null);
    setSteps([]);
    setSummary("");
    setAiSummary(null);
    setPersonalized(false);
    setFlowId(null);
    setNextAction(null);
  };

  // Flow label for the badge
  const flowLabel = flowId === "no_id"
    ? "Registration → Vote"
    : flowId === "has_id"
    ? "Prepare → Vote"
    : flowId === "underage"
    ? "Pre-registration"
    : "Full Guide";

  return (
    <div className={styles.page}>
      <div className="container">
        <div className="page-header">
          <span className="badge badge-green">Tool #2</span>
          <h1 className="heading-lg">
            How to <span className="text-gradient-green">Vote</span>
          </h1>
          <p>Answer 2 questions → get only the steps you need.</p>
        </div>

        {/* Next Action — shown after steps load */}
        {nextAction && (
          <NextAction
            icon={nextAction.icon}
            action={nextAction.action}
            detail={nextAction.detail}
            url={nextAction.url}
          />
        )}

        {/* Context Form */}
        {!contextSet && (
          <form
            className={`glass-card ${styles.contextForm} animate-fade-in-up`}
            onSubmit={handleSubmit}
            id="steps-context-form"
          >
            <h3 className="heading-md">Tell us about yourself</h3>

            <div className={styles.contextFields}>
              <div className={styles.field}>
                <label className={styles.label}>Your Age</label>
                <input
                  type="number"
                  className={styles.input}
                  placeholder="Enter your age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="0"
                  max="150"
                  required
                  id="steps-input-age"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Do you have a Voter ID?</label>
                <div className={styles.toggleGroup}>
                  <button
                    type="button"
                    className={`${styles.toggle} ${
                      hasVoterId === true ? styles.toggleActive : ""
                    }`}
                    onClick={() => setHasVoterId(true)}
                    id="steps-btn-voterid-yes"
                  >
                    ✅ Yes, I have one
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggle} ${
                      hasVoterId === false ? styles.toggleActive : ""
                    }`}
                    onClick={() => setHasVoterId(false)}
                    id="steps-btn-voterid-no"
                  >
                    ❌ No, I don&apos;t
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-success"
              disabled={!age || hasVoterId === null}
              id="steps-btn-submit"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Show My Steps →
            </button>
          </form>
        )}

        {/* Loading */}
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Building your personalized guide...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className={`glass-card ${styles.errorCard}`}>
            <p>⚠️ {error}</p>
            <p className={styles.hint}>
              Make sure the backend is running on port 8000.
            </p>
          </div>
        )}

        {/* Steps — after context is set */}
        {contextSet && !loading && !error && steps.length > 0 && (
          <>
            {/* Context Summary Banner */}
            {personalized && summary && (
              <div
                className={`${styles.summaryBanner} animate-fade-in-up`}
                id="steps-summary"
              >
                <div className={styles.summaryContent}>
                  <span className={styles.summaryIcon}>🎯</span>
                  <div>
                    <span className={styles.summaryLabel}>
                      Your flow: {flowLabel} · {steps.length} steps
                    </span>
                    <p>{summary}</p>
                  </div>
                </div>
                <button
                  className={styles.resetBtn}
                  onClick={handleReset}
                  id="steps-btn-reset"
                >
                  Change →
                </button>
              </div>
            )}

            {/* AI Summary — simplified bullets */}
            {aiSummary && (
              <div className={`${styles.aiSummary} animate-fade-in-up`} id="steps-ai-summary">
                <div className={styles.aiHeader}>
                  <span>🤖</span>
                  <span>AI Summary</span>
                </div>
                <p>{aiSummary}</p>
              </div>
            )}

            <div className={styles.layout}>
              {/* Stepper sidebar */}
              <div className={styles.stepper}>
                {steps.map((step, i) => (
                  <button
                    key={step.id}
                    className={`${styles.stepButton} ${
                      activeStep === i ? styles.active : ""
                    } ${i < activeStep ? styles.completed : ""}`}
                    onClick={() => setActiveStep(i)}
                    id={`step-btn-${step.id}`}
                  >
                    <span className={styles.stepNumber}>
                      {i < activeStep ? "✓" : step.step_number || i + 1}
                    </span>
                    <span className={styles.stepTitle}>{step.title}</span>
                    {step.phase && (
                      <span
                        className={`${styles.phaseTag} ${
                          styles[`phase_${step.phase}`] || ""
                        }`}
                      >
                        {step.phase === "registration"
                          ? "Register"
                          : step.phase === "preparation"
                          ? "Prepare"
                          : step.phase === "election_day"
                          ? "Vote"
                          : step.phase === "underage"
                          ? "Info"
                          : ""}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Step detail */}
              <div
                className={`glass-card ${styles.detail} animate-fade-in`}
                key={activeStep}
                id="step-detail"
              >
                <div className={styles.detailHeader}>
                  <span className={styles.detailIcon}>
                    {icons[steps[activeStep].icon] || "📌"}
                  </span>
                  <div>
                    <span className={styles.detailStep}>
                      Step {steps[activeStep].step_number || activeStep + 1} of {steps.length}
                    </span>
                    <h2 className="heading-md">{steps[activeStep].title}</h2>
                  </div>
                </div>

                <p className={styles.detailDesc}>
                  {steps[activeStep].description}
                </p>

                <ul className={styles.actionList}>
                  <li>
                    <strong>Action:</strong> {steps[activeStep].how_to}
                  </li>
                  {steps[activeStep].documents_needed?.length > 0 && (
                    <li>
                      <strong>You need:</strong>{" "}
                      {steps[activeStep].documents_needed.join(", ")}
                    </li>
                  )}
                  <li>
                    <strong>💡 Tip:</strong> {steps[activeStep].tip}
                  </li>
                </ul>

                <div className={styles.nav}>
                  <button
                    className="btn btn-secondary"
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep(activeStep - 1)}
                    id="btn-prev-step"
                  >
                    ← Previous
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={activeStep === steps.length - 1}
                    onClick={() => setActiveStep(activeStep + 1)}
                    id="btn-next-step"
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
