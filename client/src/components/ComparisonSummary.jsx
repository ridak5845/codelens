function DeltaBadge({ label, delta }) {
  if (delta === 0) {
    return <span className="delta-badge delta-neutral">{label}: no change</span>;
  }
  const isImprovement = delta > 0;
  return (
    <span className={`delta-badge ${isImprovement ? 'delta-positive' : 'delta-negative'}`}>
      {label}: {isImprovement ? '+' : ''}{delta}
    </span>
  );
}

export default function ComparisonSummary({ comparison }) {
  if (!comparison) return null;

  const { resolvedCount, newCount, unchangedCount, scoreDeltas } = comparison;

  return (
    <div className="comparison-summary">
      <h2 className="section-title" style={{ marginTop: 0 }}>Compared to Previous Review</h2>
      <div className="comparison-counts">
        <span className="comparison-count comparison-resolved">✓ {resolvedCount} resolved</span>
        <span className="comparison-count comparison-new">⚠ {newCount} new</span>
        <span className="comparison-count comparison-unchanged">— {unchangedCount} unchanged</span>
      </div>
      <div className="comparison-deltas">
        <DeltaBadge label="Security" delta={scoreDeltas.security} />
        <DeltaBadge label="Performance" delta={scoreDeltas.performance} />
        <DeltaBadge label="Maintainability" delta={scoreDeltas.maintainability} />
      </div>
    </div>
  );
}