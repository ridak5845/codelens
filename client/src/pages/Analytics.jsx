import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { useApiData } from '../hooks/useApiData';

const CATEGORY_COLORS = {
  bug: '#f97316',
  security: '#ef4444',
  performance: '#3b82f6',
  quality: '#a855f7'
};

const CATEGORY_LABELS = {
  bug: 'Bugs',
  security: 'Security',
  performance: 'Performance',
  quality: 'Code Quality'
};

export default function Analytics() {
  const { data, loading, error } = useApiData('/review/analytics', [], 'Could not load analytics. Please try again.');

  if (loading) return <p className="loading-state">Loading analytics...</p>;
  if (error) return <p style={{ color: 'var(--danger)' }}>{error}</p>;
  if (!data || data.totalReviews === 0) {
    return (
      <div>
        <h1 className="page-title">Analytics</h1>
        <p className="empty-state">
          No reviews yet. Run a few reviews from a pull request or File Review to see your trends here.
        </p>
      </div>
    );
  }

  const categoryData = Object.entries(data.categoryCounts).map(([key, count]) => ({
    name: CATEGORY_LABELS[key],
    count,
    fill: CATEGORY_COLORS[key]
  }));

  return (
    <div>
      <h1 className="page-title">Analytics</h1>
      <p className="page-subtitle">Based on your last {data.scoreTrend.length} review{data.scoreTrend.length === 1 ? '' : 's'} (of {data.totalReviews} total).</p>

      <div className="analytics-panel">
        <h2 className="section-title" style={{ marginTop: 0 }}>Findings by Category</h2>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="analytics-panel">
        <h2 className="section-title" style={{ marginTop: 0 }}>Score Trend</h2>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={data.scoreTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="index" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} label={{ value: 'Review #', position: 'insideBottom', offset: -5, fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: '0.85rem' }} />
              <Line type="monotone" dataKey="security" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="performance" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="maintainability" stroke="#eab308" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}