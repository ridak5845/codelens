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
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '700px', margin: '0 auto' }}>
      <Link to="/dashboard" style={{ color: 'inherit', opacity: 0.7 }}>&larr; Back to repositories</Link>

      <h1 style={{ marginTop: '1rem' }}>{owner}/{repo}</h1>
      <h2>Open Pull Requests</h2>

      {loading && <p>Loading pull requests...</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {!loading && !error && pulls.length === 0 && (
        <p>No open pull requests in this repository.</p>
      )}

      <div>
        {pulls.map((pr) => (
          <Link
            key={pr.number}
            to={`/repos/${owner}/${repo}/pulls/${pr.number}`}
            style={{
              display: 'block',
              padding: '1rem',
              marginBottom: '0.5rem',
              border: '1px solid #333',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <strong>#{pr.number} — {pr.title}</strong>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', opacity: 0.7 }}>
              opened by {pr.author}
            </p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', opacity: 0.5 }}>
              Updated {new Date(pr.updatedAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}