/**
 * API utility — all backend calls go through here.
 * Single source of truth for the backend URL.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  checkEligibility: (data) =>
    request("/api/eligibility/check", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getSteps: (params = {}) => {
    const query = new URLSearchParams();
    if (params.age !== undefined) query.set("age", params.age);
    if (params.has_voter_id !== undefined) query.set("has_voter_id", params.has_voter_id);
    const qs = query.toString();
    return request(`/api/steps/${qs ? `?${qs}` : ""}`);
  },

  getTimeline: () => request("/api/timeline/"),

  getPersonalTimeline: (data) =>
    request("/api/timeline/personal", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  askFAQ: (question) =>
    request("/api/faq/", {
      method: "POST",
      body: JSON.stringify({ question }),
    }),

  // Smart Context — the brain of the assistant
  getContext: (params = {}) => {
    const query = new URLSearchParams();
    if (params.age !== undefined) query.set("age", params.age);
    if (params.is_citizen !== undefined) query.set("is_citizen", params.is_citizen);
    if (params.has_voter_id !== undefined) query.set("has_voter_id", params.has_voter_id);
    if (params.state) query.set("state", params.state);
    const qs = query.toString();
    return request(`/api/context/${qs ? `?${qs}` : ""}`);
  },

  explain: (data) =>
    request("/api/explain/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Document Validator
  getDocuments: () => request("/api/documents/"),

  health: () => request("/api/health"),
};
