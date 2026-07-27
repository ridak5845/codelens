function scoreColor(score) {
  if (score >= 80) return 'var(--success)';
  if (score >= 50) return 'var(--warning)';
  return 'var(--danger)';
}

function scoreLabel(score) {
  if (score >= 80) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Weak';
}

function scoreTagStyle(score) {
  const color = scoreColor(score);
  return {
    color,
    backgroundColor: score >= 80 ? 'rgba(34,197,94,0.15)' : score >= 50 ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)'
  };
}

export default function ScorePanel({ scores }) {
  const rows = [
    { name: 'Security', value: scores?.security ?? 0 },
    { name: 'Performance', value: scores?.performance ?? 0 },
    { name: 'Maintainability', value: scores?.maintainability ?? 0 }
  ];

  return (
    <div className="score-panel">
      <h2 className="section-title" style={{ marginTop: 0 }}>Scores</h2>
      {rows.map((row) => (
        <div className="score-row" key={row.name}>
          <span className="score-label">{row.name}</span>
          <div className="score-bar-track">
            <div
              className="score-bar-fill"
              style={{ width: `${row.value}%`, backgroundColor: scoreColor(row.value) }}
            />
          </div>
          <div className="score-value-group">
            <span className="score-number" style={{ color: scoreColor(row.value) }}>{row.value}</span>
            <span className="score-tag" style={scoreTagStyle(row.value)}>{scoreLabel(row.value)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}