import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

function scoreColor(score) {
  if (score >= 80) return '#22c55e';
  if (score >= 50) return '#eab308';
  return '#ef4444';
}

export default function ScorePanel({ scores }) {
  const data = [
    { name: 'Security', value: scores?.security ?? 0 },
    { name: 'Performance', value: scores?.performance ?? 0 },
    { name: 'Maintainability', value: scores?.maintainability ?? 0 }
  ];

  return (
    <div className="score-panel">
      <h2 className="section-title">Scores</h2>
      <div style={{ width: '100%', height: 160 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="name" width={110} tick={{ fill: 'var(--text-secondary)', fontSize: 13 }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
              {data.map((entry, index) => (
                <Cell key={index} fill={scoreColor(entry.value)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="score-numbers">
        {data.map((entry) => (
          <span key={entry.name} className="score-number">
            {entry.name}: <strong style={{ color: scoreColor(entry.value) }}>{entry.value}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}