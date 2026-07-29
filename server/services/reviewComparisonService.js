// Simple string similarity (0-1) using a normalized token-overlap approach —
// good enough to loosely match AI-generated messages that vary slightly in wording
// between runs, without needing an external library.
function similarity(a, b) {
  const tokensA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const tokensB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let overlap = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) overlap += 1;
  });

  return overlap / Math.max(tokensA.size, tokensB.size);
}

function findMatch(finding, candidates) {
  const sameFileAndCategory = candidates.filter(
    (c) => c.file === finding.file && c.category === finding.category
  );
  if (sameFileAndCategory.length === 0) return null;

  let best = null;
  let bestScore = 0;
  for (const candidate of sameFileAndCategory) {
    const score = similarity(finding.message, candidate.message);
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  // Require at least loose similarity — prevents unrelated findings in the same
  // file+category from being falsely matched as "unchanged".
  return bestScore >= 0.35 ? best : null;
}

/**
 * Compares two sets of findings and classifies each as resolved, new, or unchanged.
 * @param {Array} oldFindings - findings from the previous review
 * @param {Array} newFindings - findings from the just-completed review
 */
function compareFindings(oldFindings, newFindings) {
  const resolved = [];
  const stillPresent = [];
  const matchedNewIndices = new Set();

  oldFindings.forEach((oldFinding) => {
    const match = findMatch(oldFinding, newFindings);
    if (match) {
      stillPresent.push(oldFinding);
      const idx = newFindings.indexOf(match);
      matchedNewIndices.add(idx);
    } else {
      resolved.push(oldFinding);
    }
  });

  const newlyIntroduced = newFindings.filter((_, idx) => !matchedNewIndices.has(idx));

  return {
    resolvedCount: resolved.length,
    newCount: newlyIntroduced.length,
    unchangedCount: stillPresent.length,
    resolved,
    newlyIntroduced
  };
}

function compareScores(oldScores, newScores) {
  return {
    security: newScores.security - oldScores.security,
    performance: newScores.performance - oldScores.performance,
    maintainability: newScores.maintainability - oldScores.maintainability
  };
}

module.exports = { compareFindings, compareScores };