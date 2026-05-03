import pytest
import time
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

class TestVoteSarthiBackend:
    
    # --- Performance Threshold (Seconds) ---
    PERF_THRESHOLD = 0.5

    def _assert_perf(self, start_time):
        duration = time.time() - start_time
        assert duration < self.PERF_THRESHOLD, f"Response too slow: {duration}s"

    # 1. Health & Meta
    def test_health_check(self):
        start = time.time()
        response = client.get("/api/health")
        self._assert_perf(start)
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    # 2. Eligibility Edge Cases & Validation
    @pytest.mark.parametrize("age,eligible_expected", [
        (17, False),  # Boundary: Underage
        (18, True),   # Boundary: Exactly 18
        (0, False),   # Edge: Minimum age
        (150, True),  # Edge: Maximum allowed age
    ])
    def test_eligibility_age_boundaries(self, age, eligible_expected):
        payload = {
            "age": age,
            "has_voter_id": False,
            "is_citizen": True,
            "state": "TestState"
        }
        response = client.post("/api/eligibility/check", json=payload)
        assert response.status_code == 200
        assert response.json()["eligible"] == eligible_expected

    def test_eligibility_validation_errors(self):
        # Invalid: Negative age
        assert client.post("/api/eligibility/check", json={"age": -1, "is_citizen": True, "has_voter_id": True}).status_code == 422
        # Invalid: Missing required field (is_citizen)
        assert client.post("/api/eligibility/check", json={"age": 25, "has_voter_id": True}).status_code == 422
        # Invalid: Non-boolean value
        assert client.post("/api/eligibility/check", json={"age": 25, "is_citizen": "yes", "has_voter_id": True}).status_code == 422

    # 3. FAQ Edge Cases
    def test_faq_empty_string(self):
        # min_length=2 check
        response = client.post("/api/faq", json={"question": ""})
        assert response.status_code == 422

    def test_faq_max_length(self):
        # max_length=500 check
        long_question = "a" * 501
        response = client.post("/api/faq", json={"question": long_question})
        assert response.status_code == 422

    # 4. Timeline & Documents (Read-only)
    def test_timeline_structure(self):
        response = client.get("/api/timeline")
        assert response.status_code == 200
        data = response.json()
        assert "phases" in data
        assert isinstance(data["phases"], list)
        if data["phases"]:
            assert "phase" in data["phases"][0]
            assert "states" in data["phases"][0]

    def test_documents_list(self):
        response = client.get("/api/documents")
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert len(data["documents"]) == data["total"]

    # 5. Explain Endpoint (AI Contexts)
    @pytest.mark.parametrize("context", ["eligibility", "steps", "timeline"])
    def test_explain_valid_contexts(self, context):
        payload = {"context": context, "age": 20}
        response = client.post("/api/explain", json=payload)
        assert response.status_code == 200
        assert "explanation" in response.json()

    def test_explain_invalid_context(self):
        # Not in the allowed list
        payload = {"context": "invalid_mode", "age": 20}
        response = client.post("/api/explain", json=payload)
        assert response.status_code == 422

    # 6. Smart Context (Query Params)
    def test_context_param_variations(self):
        # Partial params
        res1 = client.get("/api/context", params={"age": 25})
        assert res1.status_code == 200
        
        # Full params
        res2 = client.get("/api/context", params={"age": 25, "is_citizen": True, "has_voter_id": False, "state": "Goa"})
        assert res2.status_code == 200
        assert res2.json()["user_status_label"] != ""
