const PERSPECTIVE_ENDPOINT =
  "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze";

function fallbackHeuristicScore(text) {
  let score = 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const uppercaseRatio =
    trimmed.replace(/[^A-Z]/g, "").length / Math.max(trimmed.replace(/[^A-Za-z]/g, "").length, 1);
  if (uppercaseRatio > 0.7 && trimmed.length > 40) {
    score += 0.4;
  }
  const exclamationBursts = (trimmed.match(/!{3,}/g) || []).length;
  if (exclamationBursts > 0) {
    score += 0.2;
  }
  if (trimmed.length > 500) {
    score += 0.1;
  }
  return Math.min(score, 1);
}

export async function scanContent(text, { context = "forum" } = {}) {
  if (!text || !text.trim()) {
    return { flagged: false, score: 0, source: "none" };
  }

  const apiKey = process.env.PERSPECTIVE_API_KEY;
  const trimmed = text.trim();

  if (!apiKey) {
    const heuristicScore = fallbackHeuristicScore(trimmed);
    return {
      flagged: heuristicScore >= 0.75,
      score: heuristicScore,
      source: "heuristic",
      message: heuristicScore >= 0.75 ? "Content triggered heuristic review." : null,
    };
  }

  try {
    const response = await fetch(`${PERSPECTIVE_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comment: { text: trimmed },
        languages: ["en"],
        requestedAttributes: { TOXICITY: {} },
        doNotStore: true,
        clientToken: `${context}-${Date.now()}`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perspective API error: ${response.status}`);
    }

    const payload = await response.json();
    const score =
      payload?.attributeScores?.TOXICITY?.summaryScore?.value ??
      payload?.attributeScores?.TOXICITY?.spanScores?.[0]?.score?.value ??
      0;
    return {
      flagged: score >= 0.85,
      score,
      source: "perspective",
      message: score >= 0.85 ? "Content flagged by Perspective API toxicity model." : null,
    };
  } catch (err) {
    const heuristicScore = fallbackHeuristicScore(trimmed);
    return {
      flagged: heuristicScore >= 0.9,
      score: heuristicScore,
      source: "heuristic-fallback",
      message:
        heuristicScore >= 0.9
          ? "Content triggered heuristic fallback review after Perspective API failure."
          : err.message || "Perspective API unavailable.",
      error: err.message,
    };
  }
}

export default { scanContent };
