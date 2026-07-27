import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function PullRequests() {
  const { owner, repo } = useParams();
  const [pulls, setPulls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get(`/repos/${owner}/${repo}/pulls`)
      .then((res) => setPulls(res.data))
      .catch(() => setError('Could not load pull requests. Please try again.'))
      .finally(() => setLoading(false));
  }, [owner, repo]);

  return (
    <div>
      <Link to="/dashboard" className="back-link">&larr; Back to repositories</Link>

      <h1 className="page-title">{owner}/{repo}</h1>
      <h2 className="section-title" style={{ marginTop: 0 }}>Open Pull Requests</h2>

      {loading && <p className="loading-state">Loading pull requests...</p>}
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      {!loading && !error && pulls.length === 0 && (
        <p className="empty-state">No open pull requests in this repository.</p>
      )}

      <div className="card-list">
        {pulls.map((pr) => (
          <Link key={pr.number} to={`/repos/${owner}/${repo}/pulls/${pr.number}`} className="card">
            <div className="card-title">#{pr.number} — {pr.title}</div>
            <p className="card-subtitle">opened by {pr.author}</p>
            <p className="card-meta">Updated {new Date(pr.updatedAt).toLocaleDateString()}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}