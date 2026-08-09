"use client";

import { useState } from "react";

type RecommendationResult = {
  recommendation: string;
  suggested_workout: string;
  explanation: string;
};

function formatRecommendation(value: string): string {
  switch (value) {
    case "follow":
      return "Follow scheduled workout";
    case "modify":
      return "Modify workout";
    case "rest":
      return "Rest";
    default:
      return value;
  }
}

export default function Recommendation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecommendationResult | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/recommendation", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <button type="button" onClick={handleClick} disabled={loading}>
        {loading ? "Analyzing…" : "What Should I Train Today?"}
      </button>

      {error && <p className="error-message">{error}</p>}

      {result && (
        <div>
          <p>
            Recommendation:{" "}
            <strong>
              {formatRecommendation(result.recommendation)} —{" "}
              {result.suggested_workout}
            </strong>
          </p>
          <p>{result.explanation}</p>
        </div>
      )}

      {!result && !error && (
        <p className="placeholder-note">
          Get an AI-powered recommendation based on your schedule and
          recovery.
        </p>
      )}
    </section>
  );
}
